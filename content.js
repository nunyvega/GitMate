// Log to verify the script is running
debug('gitMate content script loaded!!!!!!!!!!');

// Function to get the diff of the current PR from the page content
function getPRDiffFromPage() {
  const diffElements = document.querySelectorAll('.js-file-line');
  let diff = '';
  diffElements.forEach((element) => {
    diff += element.textContent + '\n';
  });
  return diff;
}

// Add a custom button to GitHub PR pages
function addCustomButton() {
  const prReviewToolsBar = document.querySelector('.pr-review-tools');
  if (prReviewToolsBar && !document.getElementById('gitmate-button')) {
    const button = document.createElement('button');
    button.id = 'gitmate-button';
    button.textContent = 'GitMate review';
    button.style.marginLeft = '8px';
    button.classList.add('Button', 'Button--small', 'Button--primary');
    button.onclick = async () => {
      try {
        const diff = getPRDiffFromPage();
        await sendDiffToAi(
          diff,
          `Explain the following diff in a way that is easy to understand

				Find any issues with the code and suggest fixes.
				`
        );
      } catch (error) {
        console.error(error);
        showGitMateProblem('Failed to send diff to AI');
      }
    };
    prReviewToolsBar.appendChild(button);
  }
}

// Add this variable to store conversation history
let conversationHistory = [];

function createPopup(initialMessage) {
  const popup = document.createElement('div');
  popup.id = 'gitmate-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    max-height: 600px;
    background-color: #ffffff;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(149,157,165,0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px;
    background-color: #f6f8fa;
    border-bottom: 1px solid #e1e4e8;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = '<h3 style="margin: 0; font-size: 16px; color: #24292e;">GitMate Chat</h3>';

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #586069;
  `;
  closeButton.onclick = () => popup.remove();
  header.appendChild(closeButton);

  const content = document.createElement('div');
  content.style.cssText = `
    padding: 16px;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  `;

  const initialResponse = document.createElement('div');
  initialResponse.className = 'gitmate-message assistant';
  initialResponse.innerHTML = marked.parse(initialMessage);
  content.appendChild(initialResponse);

  // Add this line to apply the correct styling to the initial message
  applyMessageStyling(initialResponse, 'assistant');

  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
    padding: 16px;
    border-top: 1px solid #e1e4e8;
    display: flex;
  `;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message...';
  input.style.cssText = `
    flex-grow: 1;
    margin-right: 8px;
    padding: 8px;
    border: 1px solid #e1e4e8;
    border-radius: 3px;
  `;

  const sendButton = document.createElement('button');
  sendButton.textContent = 'Send';
  sendButton.style.cssText = `
    padding: 8px 16px;
    background-color: #2ea44f;
    color: #ffffff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  `;

  sendButton.onclick = () => {
    if (input.value.trim()) {
      addMessageToChat(content, 'human', input.value);
      sendFollowUpToAi(input.value, content);
      input.value = '';
    }
  };

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendButton.click();
    }
  });

  inputArea.appendChild(input);
  inputArea.appendChild(sendButton);

  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(inputArea);
  document.body.appendChild(popup);
}

function addMessageToChat(contentElement, role, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `gitmate-message ${role}`;
  messageDiv.innerHTML = marked.parse(message);
  contentElement.appendChild(messageDiv);
  applyMessageStyling(messageDiv, role);
  contentElement.scrollTop = contentElement.scrollHeight;
}

function applyMessageStyling(messageDiv, role) {
  messageDiv.style.cssText = `
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 6px;
    max-width: 80%;
    ${
      role === 'human'
        ? 'align-self: flex-start; background-color: #f1f8ff;'
        : 'align-self: flex-end; background-color: #f6f8fa;'
    }
  `;

  // Style code blocks within messages
  const codeBlocks = messageDiv.querySelectorAll('pre code');
  codeBlocks.forEach((block) => {
    block.style.cssText = `
      display: block;
      padding: 10px;
      overflow-x: auto;
      background-color: #f6f8fa;
      border-radius: 3px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.45;
      word-break: normal;
      white-space: pre;
      max-width: 100%;
    `;
  });
}

async function sendFollowUpToAi(question, contentElement) {
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'gitmate-message assistant';
  loadingMessage.textContent = 'Loading...';
  contentElement.appendChild(loadingMessage);

  try {
    // Include the conversation history in the prompt
    const prompt =
      conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n') +
      `\n\nHuman: ${question}\n\nAssistant:`;

    const response = await chrome.runtime.sendMessage({
      type: 'sendDiffToAi',
      diff: getPRDiffFromPage(),
      prompt: prompt
    });

    loadingMessage.remove();

    if (response.success) {
      let responseText;
      if (response.aiProvider === 'anthropic') {
        responseText = response.data.content[0].text;
      } else if (response.aiProvider === 'openai') {
        responseText = response.data.choices[0].message.content;
      }

      // Update conversation history
      conversationHistory.push({role: 'Human', content: question});
      conversationHistory.push({role: 'Assistant', content: responseText});

      // Add both the user's question and the AI's response to the chat
      addMessageToChat(contentElement, 'human', question);
      addMessageToChat(contentElement, 'assistant', responseText);
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    loadingMessage.remove();
    addMessageToChat(contentElement, 'assistant', `Error: ${error.message}`);
  }
}

async function sendDiffToAi(diff, prompt) {
  chrome.runtime.sendMessage({type: 'sendDiffToAi', diff, prompt}, (response) => {
    debug(response);
    if (response.success) {
      // Assuming the desired string is in response.data.message
      debug('AI Response:\n', response.text);
      const message = response.text;
      createPopup(message);
      debug('gitMate action triggered and diff sent to AI!');
    } else {
      console.error(response.error);
      showGitMateProblem('Failed to send diff to AI');
    }
  });
}

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', addCustomButton);

// Add this line to run the function immediately
addCustomButton();

// Add a MutationObserver to handle dynamic content loading
const observer = new MutationObserver((mutations) => {
  if (document.querySelector('.diffbar.details-collapse')) {
    addCustomButton();
    observer.disconnect();
  }
});

observer.observe(document.body, {childList: true, subtree: true});

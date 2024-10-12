// content.js

// Log to verify the script is running
console.log('gitMate content script loaded!!!!!!!!!!');

// Function to get the diff of the current PR from the page content
function getPRDiffFromPage() {
  const diffElements = document.querySelectorAll('.js-file-line');
  let diff = '';
  diffElements.forEach((element) => {
    diff += element.textContent + '\n';
  });
  return diff;
}

// Function to send the diff to Claude's AI API
async function sendDiffToClaude(diff) {
  const apiUrl = 'https://api.claude.ai/analyze'; // Verify this endpoint
  const API_TOKEN = 'YOUR_API_TOKEN_HERE'; // Replace with your actual token

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`, // Add your API token here
      },
      body: JSON.stringify({ diff: diff }), // Ensure this matches Claude's expected payload
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Claude AI response:', result);
      return result;
    } else {
      const errorMessage = await response.text();
      throw new Error(`Failed to send diff to Claude AI: ${response.status} - ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error occurred:', error);
    throw error; // Re-throw if you want to propagate the error
  }
}

// Add a custom button to GitHub PR pages
function addCustomButton() {
  const diffbarDetails = document.querySelector('.diffbar.details-collapse');
  console.log(diffbarDetails);
  console.log('diffbarDetails');
  if (diffbarDetails && !document.getElementById('gitmate-button')) {
    console.log('diffbarDetails2');
    const button = document.createElement('button');
    button.id = 'gitmate-button';
    button.textContent = 'gitMate Action';
    button.style.marginLeft = '8px';
    button.classList.add('Button--primary', 'Button--big', 'Button');
    button.onclick = async () => {
      try {
        const diff = getPRDiffFromPage();
        await sendDiffToClaude(diff);
        alert('gitMate action triggered and diff sent to Claude AI!');
      } catch (error) {
        console.error(error);
        alert('Failed to send diff to Claude AI');
      }
    };
    diffbarDetails.appendChild(button);
  }
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

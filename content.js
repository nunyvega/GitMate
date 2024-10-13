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

// Add a custom button to GitHub PR pages
function addCustomButton() {
	const diffbarDetails = document.querySelector('.diffbar.details-collapse');
	if (diffbarDetails && !document.getElementById('gitmate-button')) {
		const button = document.createElement('button');
		button.id = 'gitmate-button';
		button.textContent = 'gitMate Action';
		button.style.marginLeft = '8px';
		button.classList.add('Button--primary', 'Button--big', 'Button');
		button.onclick = async () => {
			try {
				const diff = getPRDiffFromPage();
				await sendDiffToClaudeAI(diff);
			} catch (error) {
				console.error(error);
				showGitMateProblem('Failed to send diff to Claude AI');
			}
		};
		diffbarDetails.appendChild(button);
	}
}

function createPopup(message) {
	const popup = document.createElement('div');
	popup.id = 'gitmate-popup';
	popup.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		width: 300px;
		max-height: 80vh;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 10px;
		z-index: 9999;
		overflow-y: auto;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		display: flex;
		flex-direction: column;
	`;

	const closeButton = document.createElement('button');
	closeButton.textContent = 'Close';
	closeButton.style.cssText = `
		align-self: flex-end;
		background-color: #f44336;
		color: white;
		border: none;
		padding: 5px 10px;
		border-radius: 3px;
		cursor: pointer;
		margin-bottom: 10px;
	`;
	closeButton.onclick = () => popup.remove();

	const content = document.createElement('div');
	content.innerHTML = message;
	content.style.marginBottom = '10px';

	const inputContainer = document.createElement('div');
	inputContainer.style.cssText = `
		display: flex;
		margin-top: 10px;
	`;

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Ask a follow-up question...';
	input.style.cssText = `
		flex-grow: 1;
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 3px;
	`;

	const sendButton = document.createElement('button');
	sendButton.textContent = 'Send';
	sendButton.style.cssText = `
		background-color: #4CAF50;
		color: white;
		border: none;
		padding: 5px 10px;
		border-radius: 3px;
		cursor: pointer;
		margin-left: 5px;
	`;

	sendButton.onclick = () => {
		const followUpQuestion = input.value.trim();
		if (followUpQuestion) {
			sendFollowUpToClaude(followUpQuestion, content);
			input.value = '';
		}
	};

	inputContainer.appendChild(input);
	inputContainer.appendChild(sendButton);

	popup.appendChild(closeButton);
	popup.appendChild(content);
	popup.appendChild(inputContainer);
	document.body.appendChild(popup);
}

async function sendDiffToClaudeAI(diff) {
	const prompt = `Explain the following diff in a way that is easy to understand

	Find any issues with the code and suggest fixes.
	`;
	chrome.runtime.sendMessage({type: 'sendDiffToClaude', diff: diff, prompt: prompt}, (response) => {
		console.log(response);
		if (response.success) {
			console.log('Claude AI response:', response.data);
			const message = response.data.content[0].text;
			createPopup(message);
			showGitMateProblem('gitMate action triggered and diff sent to Claude AI!');
		} else {
			console.error(response.error);
			showGitMateProblem('Failed to send diff to Claude AI');
		}
	});
}

async function sendFollowUpToClaude(question, contentElement) {
	const loadingMessage = document.createElement('p');
	loadingMessage.textContent = 'Loading...';
	contentElement.appendChild(loadingMessage);

	try {
		const response = await chrome.runtime.sendMessage({
			type: 'sendDiffToClaude',
			diff: question,
			prompt: 'This is a follow-up question. Please answer it based on the previous context.'
		});

		loadingMessage.remove();

		if (response.success) {
			const followUpResponse = document.createElement('div');
			followUpResponse.innerHTML = `<strong>Follow-up:</strong> ${question}<br><strong>Response:</strong> ${response.data.content[0].text}`;
			followUpResponse.style.marginTop = '10px';
			followUpResponse.style.borderTop = '1px solid #ccc';
			followUpResponse.style.paddingTop = '10px';
			contentElement.appendChild(followUpResponse);
		} else {
			throw new Error(response.error);
		}
	} catch (error) {
		loadingMessage.remove();
		const errorMessage = document.createElement('p');
		errorMessage.textContent = `Error: ${error.message}`;
		errorMessage.style.color = 'red';
		contentElement.appendChild(errorMessage);
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

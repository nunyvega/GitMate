debug('Loading utils.js');

// Write and export function to get key from options
function getClaudeApiKey() {
	return new Promise((resolve) => {
		chrome.storage.sync.get('claudeApiKey', (items) => {
			resolve(items.claudeApiKey);
		});
	});
}

function setClaudeApiKey(apiKey) {
	return new Promise((resolve) => {
		chrome.storage.sync.set({claudeApiKey: apiKey}, resolve);
	});
}

function getOpenAiApiKey() {
	return new Promise((resolve) => {
		chrome.storage.sync.get('openAiApiKey', (items) => {
			resolve(items.openAiApiKey);
		});
	});
}

function setOpenAiApiKey(apiKey) {
	return new Promise((resolve) => {
		chrome.storage.sync.set({openAiApiKey: apiKey}, resolve);
	});
}

if (typeof window !== 'undefined') {
	// Expose functions globally
	window.getClaudeApiKey = getClaudeApiKey;
	window.setClaudeApiKey = setClaudeApiKey;
	window.getOpenAiApiKey = getOpenAiApiKey;
	window.setOpenAiApiKey = setOpenAiApiKey;
}


function showAiApiError( response, errorMessage ) {
	console.error(errorMessage);
	throw new Error(`GitMate: Failed to send message to Claude AI: ${response.status} - ${errorMessage}`);
}

function showGitMateProblem(errorMessage) {
	debug(`Error: ${errorMessage}`);
}

function outputMessage(message) {
	debug(message);
}


function debug(...args) {
	console.debug('%cgit-mate:', 'color: blue;', ...args);
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
	debug('marked', marked);
	const content = document.createElement('div');
	content.innerHTML = marked.parse(message); // Use marked to parse markdown
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
			sendFollowUpToAi(followUpQuestion, content);
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
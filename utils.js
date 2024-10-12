console.log('utils.js loaded');
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

if (typeof window !== 'undefined') {
	// Expose functions globally
	window.getClaudeApiKey = getClaudeApiKey;
	window.setClaudeApiKey = setClaudeApiKey;
}


function showAiApiError( response, errorMessage ) {
	console.error(errorMessage);
	throw new Error(`GitMate: Failed to send message to Claude AI: ${response.status} - ${errorMessage}`);
}

function showGitMateProblem(errorMessage) {
	console.info(`GitMate: ${errorMessage}`);
}

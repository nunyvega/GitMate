// options.js

// Saves options to chrome.storage
function saveOptions(event) {
	event.preventDefault(); // Prevents the form from submitting and reloading the page
	const apiKey = document.getElementById('apiKey').value;
	const openAiApiKey = document.getElementById('openAiApiKey').value;
	const aiProvider = document.getElementById('aiProvider').value;
	const aiModel = document.getElementById('aiModel').value;

	// Save the API keys using the setClaudeApiKey and setOpenAiApiKey functions
	setClaudeApiKey(apiKey);
	setOpenAiApiKey(openAiApiKey);

	// Save the AI provider and model
	chrome.storage.sync.set({ aiProvider: aiProvider, aiModel: aiModel }, () => {
		const status = document.getElementById('status');
		status.textContent = 'Settings saved.';
		setTimeout(() => {
			status.textContent = '';
		}, 2000);
	});
}

// Restores the API key and other settings from chrome.storage
function restoreOptions() {
	// Use getClaudeApiKey and getOpenAiApiKey functions to retrieve the API keys
	getClaudeApiKey().then((apiKey) => {
		document.getElementById('apiKey').value = apiKey || ''; // Use empty string as default if apiKey is undefined
	});
	getOpenAiApiKey().then((openAiApiKey) => {
		document.getElementById('openAiApiKey').value = openAiApiKey || '';
	});

	// Restore the AI provider and model
	chrome.storage.sync.get(['aiProvider', 'aiModel'], (items) => {
		document.getElementById('aiProvider').value = items.aiProvider || 'anthropic'; // Default to 'anthropic'
		document.getElementById('aiModel').value = items.aiModel || 'claude-3-5-sonnet-20240620'; // Default model
	});
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);

document.getElementById('aiProvider').addEventListener('change', function() {
	const provider = this.value;
	const aiModelInput = document.getElementById('aiModel');
	if (provider === 'openai') {
		aiModelInput.value = 'gpt-4'; // Default model for OpenAI
	} else if (provider === 'anthropic') {
		aiModelInput.value = 'claude-3-5-sonnet-20240620'; // Default model for Anthropic
	}
});

// Ensure the model input is updated when the page loads based on the stored provider
document.addEventListener('DOMContentLoaded', function() {
	restoreOptions();
	const provider = document.getElementById('aiProvider').value;
	const aiModelInput = document.getElementById('aiModel');
	if (provider === 'openai') {
		aiModelInput.value = 'gpt-4'; // Default model for OpenAI
	} else if (provider === 'anthropic') {
		aiModelInput.value = 'claude-3-5-sonnet-20240620'; // Default model for Anthropic
	}
});

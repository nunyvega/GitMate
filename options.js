// options.js

// Saves options to chrome.storage
function saveOptions(event) {
  event.preventDefault(); // Prevents the form from submitting and reloading the page
  const apiKey = document.getElementById('apiKey').value;

  // Save the API key using the setClaudeApiKey function
  setClaudeApiKey(apiKey);

  // Update status to let user know options were saved.
  const status = document.getElementById('status');
  status.textContent = 'API key saved.';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);
}

// Restores the API key from chrome.storage
function restoreOptions() {
  // Use getClaudeApiKey function to retrieve the API key
  getClaudeApiKey().then((apiKey) => {
    document.getElementById('apiKey').value = apiKey || ''; // Use empty string as default if apiKey is undefined
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);

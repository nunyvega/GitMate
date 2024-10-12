// options.js

// Saves options to chrome.storage
function saveOptions(event) {
  event.preventDefault(); // Prevents the form from submitting and reloading the page
  const apiKey = document.getElementById('apiKey').value;

  // Save the API key to chrome.storage
  chrome.storage.sync.set({claudeApiKey: apiKey}, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'API key saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}

// Restores the API key from chrome.storage
function restoreOptions() {
  // Use default value '' (empty string)
  chrome.storage.sync.get({claudeApiKey: ''}, (items) => {
    document.getElementById('apiKey').value = items.claudeApiKey;
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);

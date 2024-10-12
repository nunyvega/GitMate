// options.js

// Saves options to chrome.storage
function saveOptions() {
  const apiKey = document.getElementById('apiKey').value;

  // Save the API key to chrome.storage
  chrome.storage.sync.set({openAIApiKey: apiKey}, () => {
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
  chrome.storage.sync.get({openAIApiKey: ''}, (items) => {
    document.getElementById('apiKey').value = items.openAIApiKey;
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

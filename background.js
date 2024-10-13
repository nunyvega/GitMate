importScripts('utils.js');
// Listener for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'sendDiffToClaude') {
    sendDiffToClaude(request.diff)
      .then((result) => {
        sendResponse({success: true, data: result});
      })
      .catch((error) => {
        sendResponse({success: false, error: error.message});
      });

    // Keep the message channel open for the async response
    return true;
  }
});

// Function to send diff to Claude API
async function sendDiffToClaude(diff, prompt) {
  const apiUrl = 'https://api.anthropic.com/v1/messages';

  // Get API key (ensure getClaudeApiKey is defined and works properly)
  let API_KEY;
  try {
    console.log(getClaudeApiKey);
    API_KEY = await getClaudeApiKey();
    console.log(API_KEY);
  } catch (error) {
    console.error('Failed to get API Key:', error);
    throw new Error('Failed to retrieve API key');
  }

  // Ensure the API key is properly retrieved
  if (!API_KEY) {
    throw new Error('API Key is undefined or null');
  }

  const payload = {
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1024,
    messages: [{role: 'user', content: `${prompt}\n\n${diff}`}]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Claude AI response:', result);
      return result;
    } else {
      const errorMessage = await response.text();
      showAiApiError(response, errorMessage);
    }
  } catch (error) {
    console.error('Error occurred while sending diff to Claude:', error);
    throw error;
  }
}

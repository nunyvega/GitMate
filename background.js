chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request.type === 'sendDiffToClaude') {
	  try {
		const result = await sendDiffToClaude(request.diff);
		sendResponse({ success: true, data: result });
	  } catch (error) {
		sendResponse({ success: false, error: error.message });
	  }
	  return true; // This keeps the message channel open for the async response.
	}
  });

  async function sendDiffToClaude(diff) {
	const apiUrl = 'https://api.anthropic.com/v1/messages';
	const API_KEY = 'YOUR_API_KEY_HERE'; // Store the API key securely (replace with your actual key)

	const payload = {
	  model: 'claude-3-5-sonnet-20240620',
	  max_tokens: 1024,
	  messages: [
		{ role: 'user', content: diff },
	  ],
	};

	try {
	  const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'x-api-key': API_KEY,
		  'anthropic-version': '2023-06-01',
		},
		body: JSON.stringify(payload),
	  });

	  if (response.ok) {
		const result = await response.json();
		console.log('Claude AI response:', result);
		return result;
	  } else {
		const errorMessage = await response.text();
		throw new Error(`Failed to send message to Claude AI: ${response.status} - ${errorMessage}`);
	  }
	} catch (error) {
	  console.error('Error occurred:', error);
	  throw error;
	}
  }

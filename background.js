importScripts('utils.js');


async function sendDiffToAi(diff, prompt) {
    let apiUrl, apiKey, headers, payload;
    const settings = await chrome.storage.sync.get(['aiProvider', 'aiModel']);
    settings.aiProvider = settings.aiProvider || 'anthropic'; // Default to 'anthropic'
    settings.aiModel = settings.aiModel || 'claude-3-5-sonnet-20240620'; // Default model
	console.log(settings);
    if (settings.aiProvider === 'anthropic') {
		console.log('antrhopicss');
        apiUrl = 'https://api.anthropic.com/v1/messages';
        apiKey = await getClaudeApiKey();
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            "anthropic-dangerous-direct-browser-access": "true",
        };
        payload = {
            model: settings.aiModel,
            max_tokens: 1024,
            messages: [{ role: 'user', content: `${prompt}\n\n${diff}` }],
        };
    } else if (settings.aiProvider === 'openai') {
		console.log('openaisss');

        apiUrl = 'https://api.openai.com/v1/completions';
        apiKey = await getOpenAiApiKey();
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };
        payload = {
            model: settings.aiModel,
            prompt: `${prompt}\n\n${diff}`,
            max_tokens: 1024,
        };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const result = await response.json();
            outputMessage(`${settings.aiProvider} AI response: ${JSON.stringify(result)}`);
            return result;
        } else {
            const errorMessage = await response.text();
            showAiApiError(response, errorMessage);
        }
    } catch (error) {
        console.error(`Error occurred while sending diff to ${settings.aiProvider}:`, error);
        throw error;
    }
}

// Listener for messages from content script
chrome.runtime.onMessage.addListener(  (request, sender, sendResponse) => {
	console.log( 'request', request );
	if (request.type === 'sendDiffToAi') {
		sendDiffToAi(request.diff, request.prompt)
			.then((result) => {
				console.log('result', result);
				if (result) {
					console.log('funciono');
					sendResponse({ success: true, data: result });
				}
			})
			.catch((error) => {
				sendResponse({ success: false, error: error.message });
			});
		return true; // Indicate that the response will be sent asynchronously
	} else {
		console.log('no match');
	}
});



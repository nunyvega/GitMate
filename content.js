// Log to verify the script is running
debug('gitMate content script loaded!!!!!!!!!!');

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
				await sendDiffToAi(diff, `Explain the following diff in a way that is easy to understand

				Find any issues with the code and suggest fixes.
				`);
			} catch (error) {
				console.error(error);
				showGitMateProblem('Failed to send diff to AI');
			}
		};
		diffbarDetails.appendChild(button);
	}
}

async function sendFollowUpToAi(question, contentElement) {
	const loadingMessage = document.createElement('p');
	loadingMessage.textContent = 'Loading...';
	contentElement.appendChild(loadingMessage);

	try {
		const response = await chrome.runtime.sendMessage({
			type: 'sendDiffToAi',
			diff: getPRDiffFromPage(),
			prompt: `This is a follow-up question. Please answer it based on the previous context.
				${question}
			`,
		});

		loadingMessage.remove();

		if (response.success) {
			const followUpResponse = document.createElement('div');
			let responseText;
			if (response.aiProvider === 'anthropic') {
				responseText = response.data.content[0].text;
			} else if (response.aiProvider === 'openai') {
				responseText = response.data.choices[0].message.content;
			}
			followUpResponse.innerHTML = `<strong>Follow-up:</strong> ${question}<br><strong>Response:</strong> ${responseText}`;
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

async function sendDiffToAi(diff, prompt) {
	chrome.runtime.sendMessage(
		{ type: 'sendDiffToAi', diff, prompt },
		(response) => {
			debug(response);
			if (response.success) {
				// Assuming the desired string is in response.data.message
				debug('AI Response:\n', response.text);
				const message = response.text;
				createPopup(message);
				showGitMateProblem('gitMate action triggered and diff sent to Claude AI!');
			} else {
				console.error(response.error);
				showGitMateProblem('Failed to send diff to Claude AI');
			}
		}
	);
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

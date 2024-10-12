// Log to verify the script is running
console.log('gitMate content script loaded!!!!!!!!!!');

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
        chrome.runtime.sendMessage(
          { type: 'sendDiffToClaude', diff: diff },
          (response) => {
            if (response.success) {
              console.log('Claude AI response:', response.data);
              alert('gitMate action triggered and diff sent to Claude AI!');
            } else {
              console.error(response.error);
              alert('Failed to send diff to Claude AI');
            }
          }
        );
      } catch (error) {
        console.error(error);
        alert('Failed to send diff to Claude AI');
      }
    };
    diffbarDetails.appendChild(button);
  }
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

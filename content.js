// content.js

// Log to verify the script is running
console.log('gitMate content script loaded!!!!!!!!!!');

// Add a custom button to GitHub PR pages
function addCustomButton() {
  const diffbarDetails = document.querySelector('.diffbar.details-collapse');
  console.log(diffbarDetails);
  console.log('diffbarDetails');
  if (diffbarDetails && !document.getElementById('gitmate-button')) {
    console.log('diffbarDetails2');
    const button = document.createElement('button');
    button.id = 'gitmate-button';
    button.textContent = 'gitMate Action';
    button.style.marginLeft = '8px';
    button.classList.add('Button--primary', 'Button--big', 'Button');
    button.onclick = () => {
      alert('gitMate is processing your request...');
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

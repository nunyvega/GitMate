// content.js

// Log to verify the script is running
console.log('gitMate content script loaded!!');

// Add a custom button to GitHub PR pages
function addCustomButton() {
  const diffbarDetails = document.querySelector('.diffbar.details-collapse');
  if (diffbarDetails && !document.getElementById('gitmate-button')) {
    const button = document.createElement('button');
    button.id = 'gitmate-button';
    button.textContent = 'gitMate Action';
    button.style.marginLeft = '8px';
    button.onclick = () => {
      alert('gitMate is processing your request...');
    };
    diffbarDetails.appendChild(button);
  }
}

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', addCustomButton);

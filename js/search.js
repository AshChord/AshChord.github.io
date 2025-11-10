// Elements within the search bar
const inputField = document.querySelector('.search-input');
const resetButton = document.querySelector('.search-reset-button');
const submitButton = document.querySelector('.search-submit-button');

// Toggle reset button visibility
function toggleResetButton() {
  resetButton.style.display = inputField.value ? 'block' : 'none';
}

// Initialize reset button state
toggleResetButton();

// Sync input field with reset button
inputField.addEventListener('input', toggleResetButton);
resetButton.addEventListener('click', () => {
  inputField.value = '';
  toggleResetButton();
});

// Handle keyword submission
function submitKeyword() {
  const keyword = inputField.value;
  inputField.value = '';
  toggleResetButton();
  history.pushState(null, null, `/posts?keyword=${encodeURIComponent(keyword)}`);
  router();
}

// Submit keyword via Enter or button click
inputField.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') submitKeyword();
});
submitButton.addEventListener('click', submitKeyword);

// Handle category clicks
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('category')) {
    event.stopPropagation();
    const category = event.target.textContent;
    history.pushState(null, null, `/posts?category=${encodeURIComponent(category)}`);
    router();
  }
});
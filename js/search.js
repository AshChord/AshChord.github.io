// Toggle reset button visibility
function toggleResetButton() {
  $.resetBtn.style.display = $.srchInp.value ? 'block' : 'none';
}

// Initialize reset button state
toggleResetButton();

// Sync input field with reset button
$.srchInp.addEventListener('input', toggleResetButton);
$.srchBar.addEventListener('reset', () => {
  setTimeout(toggleResetButton);
  $.srchInp.focus();
});

// Handle search form submission
$.srchBar.addEventListener('submit', (e) => {
  e.preventDefault();

  const keyword = $.srchInp.value.trim();
  if (!keyword) return;

  history.pushState(null, null, `/posts?keyword=${encodeURIComponent(keyword)}`);
  router();

  $.srchInp.value = '';
  $.srchInp.blur();
  $.srchBar.classList.remove('open');
});

// Handle category click events
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('category')) {
    e.stopPropagation();
    const cat = e.target.textContent;
    history.pushState(null, null, `/posts?category=${encodeURIComponent(cat)}`);
    router();
  }
});
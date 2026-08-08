// Sync input field with reset button
$.searchInput.addEventListener('input', () => {
  $.resetBtn.style.display = $.searchInput.value ? 'block' : 'none';
});

$.searchBar.addEventListener('reset', () => {
  $.resetBtn.style.display = 'none';
  $.searchInput.focus();
});

// Handle search form submission
$.searchBar.addEventListener('submit', (event) => {
  const keyword = $.searchInput.value.trim();
  if (!keyword) {
    event.preventDefault();
    return;
  }
  $.searchInput.value = keyword;
});
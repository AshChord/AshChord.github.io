// Toggle menu and search bar on mobile
const toggleElement = (el) => {
  if (window.innerWidth < 768) el.toggleAttribute('open');
};

// Toggle open states
$.menu.addEventListener('click', () => toggleElement($.menu));
$.srch.addEventListener('click', () => toggleElement($.srchBar));
$.srchBar.addEventListener('click', e => e.stopPropagation());

// Close toggle elements when clicking outside
document.addEventListener('click', ({ target }) => {
  if (!$.menu.contains(target)) $.menu.removeAttribute('open');
  if (!$.srch.contains(target)) $.srchBar.removeAttribute('open');
  if (!$.catDd.contains(target)) $.catDd.removeAttribute('open');
});

// Reset open states on larger screens
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    $.menu.removeAttribute('open');
    $.srchBar.removeAttribute('open');
  }
});

// Close category dropdown on back/forward navigation
window.addEventListener('popstate', () => {$.catDd.removeAttribute('open');});
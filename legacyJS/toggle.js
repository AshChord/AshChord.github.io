// Handle element toggle behavior
document.addEventListener('click', ({ target }) => {
  // Elements to toggle and corresponding trigger buttons
  const toggleMap = { menu: $.menu, searchBar: $.search, categoryPanel: null };

  for (const key in toggleMap) {
    const el = $[key];
    const btn = toggleMap[el];

    // Toggle elements when trigger button is clicked on mobile
    if (target === btn && innerWidth < 768) {
      el.toggleAttribute('open');
    }
    // Close elements when clicking outside
    else if (!el.contains(target)) {
      el.removeAttribute('open');
    }
  }
});

// Update toggle state based on resize
window.addEventListener('resize', () => {
  // Reset open states on larger screens
  if (innerWidth >= 768) {
    $.menu.removeAttribute('open');
    $.searchBar.removeAttribute('open');
  }

  // Toggle outline visibility
  const outlineHeight = $.outline.scrollHeight;
  $.outline.style.setProperty('--height', `${outlineHeight}px`);
  $.outline.style.visibility = innerHeight < outlineHeight ? 'hidden' : 'visible';
});
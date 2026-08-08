// Registry configuration for DOM elements
const regConfig = {
  menu: 'menu',
  search: 'search',
  searchBar: '.search-bar',
  searchInput: '.search-input',
  resetBtn: '.search-reset-button',
  feed: '.feed',
  content: '.content',
  outline: '.outline',
  pgn: '.pagination',
  categoryPanel: '.category-panel',
  catMenu: '.category-menu'
};

// Initialize registry with DOM elements and post data
const reg = {
  posts: [],
  postsByCat: [],
  ...Object.fromEntries(
    Object.entries(regConfig)
      .map(([varName, sel]) => [varName, document.querySelector(sel)])
  )
}

// Access registry via `$` namespace
const $ = reg;
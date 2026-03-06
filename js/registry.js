// Registry configuration for DOM elements
const regConfig = {
  menu: 'menu',
  srch: 'search',
  srchBar: '.search-bar',
  srchInp: '.search-input',
  resetBtn: '.search-reset-button',
  submitBtn: '.search-submit-button',
  feed: '.feed',
  cont: '.content',
  otl: '.outline',
  pgn: '.pagination',
  catDd: '.category-dropdown',
  catMenu: '.category-menu'
};

// Initialize registry with DOM elements and post data
const reg = {
  posts: [],
  postsByCat: [],
  ...Object.fromEntries(
  Object.entries(regConfig).map(([varName, sel]) => [varName, document.querySelector(sel)])
  )
},
$ = reg;
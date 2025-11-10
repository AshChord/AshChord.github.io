// Moble menu/search bar
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');
const searchButton = document.querySelector('.search-button');
const searchBar = document.querySelector('.search-bar');

// Toggle active states
menuButton.addEventListener('click', () => menu.classList.toggle('mobile'));
searchButton.addEventListener('click', () => searchBar.classList.toggle('mobile'));

// Close menu/search bar when clicking outside
document.addEventListener('click', ({ target }) => {
  if (!menuButton.contains(target)) menu.classList.remove('mobile');
  if (!searchBar.contains(target) && !searchButton.contains(target)) searchBar.classList.remove('mobile');
});

// Reset active states on larger screens
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    menu.classList.remove('mobile');
    searchBar.classList.remove('mobile');
  }
});
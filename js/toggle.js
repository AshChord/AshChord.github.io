// Toggle menu and search bar on mobile
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');
const searchButton = document.querySelector('.search-button');
const searchBar = document.querySelector('.search-bar');

// Handle clicks outside menu and search bar
document.addEventListener('click', function (event) {
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
    menu.classList.remove('mobile');
  }
  if (!searchBar.contains(event.target) && !searchButton.contains(event.target)) {
    searchBar.classList.remove('mobile');
  }
});

// Prevent closing when clicking inside menu or search bar
menu.addEventListener('click', () => menu.classList.remove('mobile'));
searchBar.addEventListener('click', (event) => event.stopPropagation());

// Toggle menu and search bar on button click
menuButton.addEventListener('click', () => menu.classList.toggle('mobile'));
searchButton.addEventListener('click', () => searchBar.classList.toggle('mobile'));

// Handle resize for mobile menu and search bar
window.addEventListener('resize', function () {
  if (window.innerWidth >= 768) {
    menu.classList.remove('mobile');
    searchBar.classList.remove('mobile');
  }
});
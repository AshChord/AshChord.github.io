// Toggle reset button in input field
const inputField = document.querySelector('.input-field');
const resetButton = document.querySelector('.reset-button');

function toggleResetButton() {
  if (inputField.value) {
    resetButton.style.display = 'block';
  } else {
    resetButton.style.display = 'none';
  }
}

inputField.addEventListener('input', toggleResetButton);

resetButton.addEventListener('click', () => {
  inputField.value = '';
  toggleResetButton();
  inputField.focus();
});

toggleResetButton();


// Toggle menu on mobile
document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('.menu');

  menuButton.addEventListener('click', function () {
    menu.classList.toggle('mobile');
  });

  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
      menu.classList.remove('mobile');
    }
  });

  menu.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      menu.classList.remove('mobile');
    }
  });
});


// Toggle search bar on mobile
document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.querySelector('.search-button');
  const searchBar = document.querySelector('.search-bar');

  searchButton.addEventListener('click', function () {
    searchBar.classList.toggle('mobile');
  });

  document.addEventListener('click', function (event) {
    if (!searchBar.contains(event.target) && !searchButton.contains(event.target)) {
      searchBar.classList.remove('mobile');
    }
  });

  searchBar.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      searchBar.classList.remove('mobile');
    }
  });
});
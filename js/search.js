// 검색 결과 필터링 함수 (사용자의 원래 코드 유지)
function search(keyword, category) {
  return posts.filter(post => keyword
    ? post.title.toLowerCase().includes(keyword.toLowerCase())
    : post.categories.includes(category)
  );
}

// 검색 입력 필드 및 리셋 버튼
const inputField = document.querySelector('.search-input');
const resetButton = document.querySelector('.search-reset-button');
const submitButton = document.querySelector('.search-submit-button');
const article = document.querySelector('article');

function toggleResetButton() {
  resetButton.style.display = inputField.value ? 'block' : 'none';
}

// 최초 실행: reset 버튼을 숨긴 상태로 시작
toggleResetButton();

inputField.addEventListener('input', toggleResetButton);
resetButton.addEventListener('click', () => {
  inputField.value = '';
  toggleResetButton();
});

// 검색 이벤트 리스너
inputField.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const keyword = inputField.value;
    inputField.value = '';
    toggleResetButton();
    history.pushState(null, null, `/posts?keyword=${encodeURIComponent(keyword)}`);
    router();
  }
});

submitButton.addEventListener('click', () => {
  const keyword = inputField.value;
  inputField.value = '';
  toggleResetButton();
  history.pushState(null, null, `/posts?keyword=${encodeURIComponent(keyword)}`);
  router();
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('category')) {
    event.stopPropagation(); // 게시물 클릭 이벤트로 전파 방지
    const category = event.target.textContent;
    history.pushState(null, null, `/posts?category=${encodeURIComponent(category)}`);
    router();
  }
});
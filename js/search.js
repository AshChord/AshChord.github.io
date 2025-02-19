// 검색 결과 필터링 함수
function search(keyword, category) {
  return posts.filter(post => keyword
    ? post.title.toLowerCase().includes(keyword.toLowerCase())
    : post.categories.includes(category)
  );
}

// 검색 이벤트 리스너 등록
const searchInput = document.querySelector('.input-field');
const searchButton = document.querySelector('.submit-button');

if (searchInput) {
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const keyword = event.target.value;
      history.pushState({ keyword, category: null }, '', `/posts?keyword=${encodeURIComponent(keyword)}`);
      router();
    }
  });
}

if (searchButton && searchInput) {
  searchButton.addEventListener('click', () => {
    const keyword = searchInput.value;
    history.pushState({ keyword, category: null }, '', `/posts?keyword=${encodeURIComponent(keyword)}`);
    router();
  });
}

document.querySelector('.post-list').addEventListener('click', (event) => {
  console.log(event.target);
  if (event.target.className === 'category') {
    event.stopPropagation(); // 게시물 클릭 이벤트로 전파 방지
    history.pushState({ category: event.target.textContent }, '', `/posts?category=${encodeURIComponent(event.target.textContent)}`);
    router();
  }
});

// 검색 결과를 필터링하는 함수
function search(keyword, category) {
  return posts.filter(post => {
    const matchesKeyword = keyword ? post.title.toLowerCase().includes(keyword.toLowerCase()) : true;
    const matchesCategory = category ? post.categories.includes(category) : true;
    return matchesKeyword && matchesCategory;
  });
}

// 검색 입력 필드에서 Enter 키를 눌렀을 때 검색 수행
const searchInput = document.querySelector('.input-field');
if (searchInput) {
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      // 검색 결과를 바로 렌더링하는 것이 아니라 URL을 업데이트하고 router를 호출
      updateUrlAndRouter(event.target.value, null); // category는 null로 처리
    }
  });
}

// 검색 버튼 클릭 시 검색 수행
document.querySelector('.submit-button')?.addEventListener('click', () => {
  const searchInput = document.querySelector('.input-field');
  if (searchInput) {
    // 검색 결과를 바로 렌더링하는 것이 아니라 URL을 업데이트하고 router를 호출
    updateUrlAndRouter(searchInput.value, null); // category는 null로 처리
  }
});

// 카테고리 클릭 시 검색 수행
document.querySelectorAll('.category').forEach(categoryElement => {
  categoryElement.addEventListener('click', (event) => {
    // 검색 결과를 바로 렌더링하는 것이 아니라 URL을 업데이트하고 router를 호출
    updateUrlAndRouter(null, event.target.textContent); // keyword는 null로 처리
    event.stopPropagation(); // 이벤트 버블링 방지
  });
});

// URL 변경 및 router 호출
function updateUrlAndRouter(keyword, category) {
  const urlParam = keyword && category 
    ? `?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`
    : keyword 
    ? `?keyword=${encodeURIComponent(keyword)}`
    : `?category=${encodeURIComponent(category)}`;
  
  // URL을 변경하고 상태를 기록한 후, router 호출
  history.replaceState({ keyword, category }, '', `/posts${urlParam}`);
  router();
}

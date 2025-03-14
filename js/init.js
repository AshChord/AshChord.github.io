// 📌 페이지 초기화 및 이벤트 바인딩
async function initialize() {
  // 1. 게시물 데이터 로드
  const response = await fetch('/posts/post-info.json');
  posts = await response.json();  // 게시물 데이터 로드

  // 2. 현재 URL에 맞는 화면 렌더링
  router();
  renderBlogCategory();
}

// 📌 DOM 로드 완료 후 초기화 실행
initialize();
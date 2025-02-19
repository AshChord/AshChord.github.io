function router() {
  const path = window.location.pathname;
  console.log(path);
  const searchParams = new URLSearchParams(window.location.search);
  const keyword = searchParams.get('keyword');
  const category = searchParams.get('category');
  const postTitle = path.startsWith('/posts/') && path !== '/posts/' ? path.replace('/posts/', '') : null;

  if (path === '/' || path === '/posts' && !(keyword || category)) {
    renderPostList(posts); // 게시물 목록 페이지 렌더링
  } else if (path === '/home') {
    renderHome(); // 블로그 설명 페이지 렌더링
  } else if (path.startsWith('/posts') && (keyword || category)) {
    renderPostList(search(keyword, category)); // 검색 결과 필터링 후 게시물 목록 렌더링
  } else if (path.startsWith('/posts/') && postTitle !== null) {
    const post = posts.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === postTitle);
    post ? renderContent(post) : showNotFound(); // 게시물 제목에 맞는 게시물 렌더링
  } else if (path === '/about') {
    renderAbout(); // 저자 소개 페이지 렌더링
  } else {
    showNotFound(); // 404 페이지
  }
}

function showNotFound() {
  document.querySelector('.post-list').innerHTML = `<h1>404 - Not Found</h1>`;
}

window.onpopstate = router;

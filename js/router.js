function router() {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const keyword = searchParams.get('keyword');
  const category = searchParams.get('category');
  const postTitle = decodeURIComponent(path.replace(/^\/posts\//, ''));

  // 1. path가 루트(/)인 경우
  if (path === '/') {
    renderPostList(posts); // 루트 페이지는 전체 게시물 목록 렌더링
  }

  // 2. path가 /posts인 경우
  else if (path.startsWith('/posts')) {
    // 2.1. /posts 인데 keyword 혹은 category가 있는 경우: 검색 결과 필터링 후 게시물 목록 렌더링
    if (keyword || category) {
      renderPostList(search(keyword, category)); // 검색 결과 필터링 후 게시물 목록 렌더링
    }
    // 2.2. /posts 인데 postTitle이 있는 경우: 게시물 제목에 맞는 게시물 내용 렌더링
    else if (postTitle) {
      const post = posts.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === postTitle);
      post ? renderContent(post) : showNotFound();
    }
    // 2.3. /posts 인데 키워드, 카테고리, 제목이 모두 없는 경우: 전체 게시물 목록 렌더링
    else {
      renderPostList(posts);
    }
  }

  // 3. path가 /home인 경우
  else if (path === '/home') {
    renderHome(); // 블로그 설명 페이지 렌더링
  }

  // 4. path가 /about인 경우
  else if (path === '/about') {
    renderAbout(); // 저자 소개 페이지 렌더링
  }

  // 5. 그 외의 경우: 404 페이지
  else {
    showNotFound(); // 404 페이지 표시
  }
}

function showNotFound() {
  document.querySelector('.post-list').innerHTML = `<h1>404 - Not Found</h1>`;
}

window.onpopstate = router;

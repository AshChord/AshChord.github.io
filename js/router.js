function router() {
  let path = window.location.pathname;
  const queryParams = new URLSearchParams(window.location.search);

  // p 파라미터가 있는지 확인
  if (queryParams.has('p')) {
    // p가 있으면 path를 p 파라미터로 설정
    path = queryParams.get('p');
    queryParams.delete('p');

    // q 파라미터가 있으면 복원
    if (queryParams.has('q')) {
      const qValue = queryParams.get('q');
      const restoredParams = new URLSearchParams();

      // 'q' 값을 '~and~' 기준으로 분리하여 복원
      const keyValuePairs = qValue.split('~and~');
      keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          restoredParams.set(key, decodeURIComponent(value));
        }
      });

      // 복원된 쿼리 파라미터를 queryParams에 덮어씌우기
      restoredParams.forEach((value, key) => {
        queryParams.set(key, value);
      });

      queryParams.delete('q');

      history.replaceState(null, '', `${path}?${queryParams.toString()}`);
    }

    else {
      // 주소창을 새로운 URL로 변경
      history.replaceState(null, '', `${path}`);
    }
  }

  // 1. path가 루트(/)인 경우
  if (path === '/' || path === '/index.html') {
    initPagination(posts.length); // 페이지네이션 초기화
    renderPostList(posts, currentPage); // 루트 페이지는 전체 게시물 목록 렌더링
  }

  // 2. path가 /posts인 경우
  else if (path.startsWith('/posts')) {
    // 2.1. /posts 인데 keyword 혹은 category가 있는 경우: 검색 결과 필터링 후 게시물 목록 렌더링
    if (queryParams.has('keyword') || queryParams.has('category')) {
      const keyword = queryParams.get('keyword');
      const category = queryParams.get('category');
      initPagination(search(keyword, category).length); // 검색된 게시물 개수에 맞게 페이지네이션 초기화
      renderPostList(search(keyword, category), currentPage); // 검색 필터링 후 페이지에 맞는 게시물 렌더링
    }
    // 2.2. /posts 인데 postTitle이 있는 경우: 게시물 제목에 맞는 게시물 내용 렌더링
    else if (path.replace('/posts', '')) {
      const postTitle = decodeURIComponent(path.replace(/^\/posts\//, ''));
      const post = posts.find(p => p.title === postTitle);
      post ? renderContent(post) : showNotFound();
    }
    // 2.3. /posts 인데 키워드, 카테고리, 제목이 모두 없는 경우: 전체 게시물 목록 렌더링
    else {
      initPagination(posts.length); // 전체 게시물 개수에 맞게 페이지네이션 초기화
      renderPostList(posts, currentPage);
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

  window.scrollTo(0, 0);
}


function showNotFound() {
  document.querySelector('.post-list').innerHTML = `<h1>404 - Not Found</h1>`;
}

window.onpopstate = router;

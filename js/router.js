// 상세 게시물 페이지를 렌더링하는 함수
function resolveContent(path, _queryParams) {
  // URL 경로에서 '/posts/' 부분을 제거하여 순수한 글 제목을 추출
  const postTitle = decodeURIComponent(path.replace('/posts/', ''));
  // 전체 posts 배열에서 제목이 일치하는 게시물을 찾음
  const post = posts.find(p => p.title === postTitle);
  // 게시물이 있으면 내용을 렌더링하고, 없으면 404 페이지를 보여줌
  if (post) {
    document.title = postTitle + " - AshChord.log"; // 탭 제목 변경
    renderContent(post);
  } else {
    document.title = "Page Not Found - AshChord.log"; // 탭 제목 변경
    renderNotFound();
  }
}

// 필터링된(검색 또는 카테고리) 또는 전체 게시물 목록을 렌더링하는 함수
function resolveFeed(path, queryParams) {
  // URL의 쿼리 파라미터에서 keyword와 category 값을 가져옴
  const keyword = queryParams.get('keyword');
  const category = queryParams.get('category');
  
  let postsToRender = (keyword || category) ? search(keyword, category) : posts;

  if (keyword) document.title = `Search: ${keyword} - AshChord.log`;
  else if (category) document.title = `Category: ${category} - AshChord.log`;
  else if (path === '/posts') document.title = "Posts - AshChord.log";
  else document.title = "AshChord.log";

  // 이후의 렌더링 로직은 동일
  initPagination(postsToRender.length);
  renderFeed(postsToRender, pageState.currentPage);

}


const routes = [
  {
    // 조건: 경로가 /posts/로 시작하고 그 뒤에 글 제목이 있을 때 (예: /posts/내-첫-글)
    match: (path) => path.startsWith('/posts/') && path.split('/')[2],
    handler: resolveContent
  },
  {
    // 조건: 경로가 메인(/), /posts, 또는 /index.html일 때
    match: (path) => ['/', '/posts', '/index.html'].includes(path),
    handler: resolveFeed
  },
  // { match: (path) => path === '/about', handler: renderAbout }, // 나중에 about 페이지 추가 시 이 줄의 주석만 풀면 됨
];

function router() {
  let path = window.location.pathname;
  let queryParams = new URLSearchParams(window.location.search);

  // 📌 Github Pages SPA 라우팅을 위한 리디렉션 처리 로직 (복원)
  // 404.html에서 ?p=/posts/글제목 과 같은 형태로 리디렉션된 경우를 처리합니다.
  if (queryParams.has('p')) {
    // 'p' 파라미터 값을 실제 경로로 사용합니다.
    path = queryParams.get('p');
    queryParams.delete('p'); // 더 이상 필요 없으므로 'p' 파라미터는 제거합니다.

    // 'q' 파라미터가 있다면 원래의 쿼리 파라미터들을 복원합니다.
    if (queryParams.has('q')) {
      const qValue = queryParams.get('q');
      const restoredParams = new URLSearchParams();
      qValue.split('~and~').forEach(pair => {
        const [key, ...valueParts] = pair.split('=');
        if (key) {
          restoredParams.set(key, valueParts.join('='))
        };
      });
      queryParams = restoredParams; // 복원된 파라미터로 교체
    }

    // 최종적으로 정리된 경로와 파라미터로 브라우저 주소창의 URL을 깔끔하게 변경합니다.
    // 사용자는 리디렉션 과정을 눈치채지 못하고 원래 주소로 접속한 것처럼 보입니다.
    const queryString = queryParams.toString();
    history.replaceState(null, null, queryString ? `${path}?${queryString}` : path);
  }

  // 라우팅 테이블(routes 배열)에서 현재 경로와 일치하는 규칙을 찾음
  const matchedRoute = routes.find(route => route.match(path, queryParams));

  // 일치하는 경로 규칙을 찾았다면 해당 핸들러를 실행, 없으면 404 핸들러 실행
  if (matchedRoute) {
    matchedRoute.handler(path, queryParams);
  } else {
    document.title = "Page Not Found - AshChord.log"; // 탭 제목 변경
    renderNotFound();
  }

  // 페이지가 변경될 때마다 화면 상단으로 스크롤
  window.scrollTo(0, 0);
}


document.querySelector(".blog-title").addEventListener("click", () => {
  window.history.pushState(null, null, "/"); // URL 변경
  router(); // 라우터 실행
});

document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    const path = item.textContent.toLowerCase(); // 텍스트를 URL 경로로 변환
    window.history.pushState(null, null, `/${path}`); // URL 변경
    router(); // 라우터 실행
  });
});

// 브라우저의 뒤로가기/앞으로가기 버튼을 눌렀을 때도 router 함수가 실행되도록 설정
window.addEventListener('popstate', router);
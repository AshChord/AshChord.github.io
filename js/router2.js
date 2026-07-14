// /controller/router.js

// 피드(목록) 라우팅
async function resolveFeed(path, queryParams) {
  const queryCat = queryParams.get('category');
  const queryKw = queryParams.get('keyword');

  let titlePfx = "Posts";

  // 카테고리 404 처리 로직 (이전 코드의 동작 유지)
  if (queryCat) {
    const categoryMap = await dataflow.evaluate(categorizedPosts);
    if (!categoryMap.has(queryCat)) {
      updateTitle("Page Not Found");
      renderNotFound();
      return;
    }
    titlePfx = `Category: ${queryCat}`;
  } else if (queryKw) {
    titlePfx = `Search: ${queryKw}`;
  }

  updateTitle(titlePfx);

  // 인자를 넘길 필요가 없음! 뷰가 알아서 데이터플로우에서 꺼내 씀
  await renderCategoryPanel();
  await renderFeed();
  await renderPagination();
}

// 본문(단일 포스트) 라우팅
async function resolveContent(path) {
  /*/ 데이터플로우를 찔러서 포스트가 존재하는지 확인
  const postContent = await dataflow.evaluate(contentForCurrPage);

  if (postContent) {
    updateTitle(postContent.title);
    await renderCategoryPanel(); // 본문 볼 때도 사이드바 메뉴는 렌더링
    await renderContent();
  } else {
    // 포스트가 없으면 404 처리 (타이틀 변경 포함)
    updateTitle("Page Not Found");
    renderNotFound();
  }*/
}

// 라우트 설정
const routes = [
  {
    match: (path) => path.startsWith('/posts/') && path.split('/')[2],
    handler: resolveContent
  },
  {
    match: (path) => ['/', '/posts', '/index.html'].includes(path),
    handler: resolveFeed
  }
];

// 라우터 디스패치 (MPA이므로 페이지 로드 시 1회만 실행됨)
async function router() {
  const path = window.location.pathname;
  const queryParams = new URLSearchParams(window.location.search);

  const matchRoute = routes.find(route => route.match(path, queryParams));
  
  if (matchRoute) {
    await matchRoute.handler(path, queryParams);
  } else {
    updateTitle("Page Not Found");
    renderNotFound();
  }
}

// 문서 제목 업데이트
function updateTitle(pfx) {
  const sfx = "AshChord.log";
  document.title = pfx ? `${pfx} - ${sfx}` : sfx;
}

router();
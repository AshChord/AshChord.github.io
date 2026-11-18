// 피드(목록) 라우팅
async function resolveFeed(queryParams) {
  const queryCat = queryParams.get('category');
  const queryKw = queryParams.get('keyword');

  let titlePfx = "Posts";

  if (queryCat) {
    titlePfx = `Category: ${queryCat}`;
  } else if (queryKw) {
    titlePfx = `Search: ${queryKw}`;
  }

  updateTitle(titlePfx);

  await renderFeed();
  await renderCategoryPanel();
  await renderPagination();
}

// 본문(단일 포스트) 라우팅
async function resolveContent() {
  const post = await dataflow.evaluate(currentPost);

  if (!post) {
    resolveNotFound();
    return;
  }

  await renderCategoryPanel();
  await renderContent();
  await renderOutline();
}

// 404 라우팅
async function resolveNotFound() {
  updateTitle("Page Not Found");
  await renderCategoryPanel();
  renderNotFound();
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
  },
  {
    match: () => true,
    handler: resolveNotFound
  }
];

// 라우터 디스패치
async function router() {
  const path = window.location.pathname;
  const queryParams = new URLSearchParams(window.location.search);

  const matchRoute = routes.find(route => route.match(path));

  await matchRoute.handler(queryParams);
}

// 문서 제목 업데이트
function updateTitle(pfx) {
  const sfx = "AshChord.log";
  document.title = pfx ? `${pfx} - ${sfx}` : sfx;
}

router();
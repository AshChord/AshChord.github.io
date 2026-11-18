// 피드(목록) 라우팅
async function resolveFeed(queryParams) {
  content.replaceChildren();
  outline.replaceChildren();

  const queryCat = queryParams.get('category');
  const queryKw = queryParams.get('keyword');

  if (location.pathname === '/posts') document.title = "Posts";

  if (queryCat) {
    document.title = `Category: ${queryCat}`;
  } else if (queryKw) {
    document.title = `Search: ${queryKw}`;
  }

  await renderFeed();
  await renderCategoryPanel();
  await renderPagination();
}

// 본문(단일 포스트) 라우팅
async function resolveContent() {
  feed.replaceChildren();
  pagination.replaceChildren();

  const post = await dataflow.evaluate(currentPost);
  if (post) {
    await renderCategoryPanel();
    await renderContent();
    await renderOutline();
  } else {
    await resolveNotFound();
  }
}

// 404 라우팅
async function resolveNotFound() {
  content.replaceChildren();
  outline.replaceChildren();
  pagination.replaceChildren();

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
  const path = location.pathname;
  const queryParams = new URLSearchParams(location.search);

  const matchRoute = routes.find(route => route.match(path));
  await matchRoute.handler(queryParams);
}

router();
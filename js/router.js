// Resolve feed based on URL path and query parameters
function resolveFeed(path, queryParams) {
  const queryKw = queryParams.get('keyword');
  const queryCat = queryParams.get('category');

  let postsToRndr = $.posts;
  let titlePfx = "";

  // Filter posts based on query parameters
  if (queryCat) {
    const postsInCat = $.postsByCat.find(([cat]) => cat === queryCat);

    if (postsInCat) {
      postsToRndr = postsInCat[1];
      titlePfx = `Category: ${queryCat}`;
    }
    else {
      updateTitle("Page Not Found");
      renderNotFound();
      return;
    }
  }
  else if (queryKw) {
    postsToRndr = $.posts.filter(post =>
      post.title.toLowerCase().includes(queryKw.toLowerCase())
    );
    titlePfx = `Search: ${queryKw}`;
  }
  else if (path === '/posts') {
    titlePfx = "Posts";
  }

  updateTitle(titlePfx);
  initPagination(postsToRndr.length);
  renderFeed(postsToRndr, pgnData.currPage);
}

// Resolve content based on URL path
function resolveContent(path, _queryParams) {
  const postTitle = decodeURIComponent(path.replace('/posts/', ''));
  const post = $.posts.find(post => post.title === postTitle);

  if (post) {
    updateTitle(postTitle);
    renderContent(post);
  } else {
    updateTitle("Page Not Found");
    renderNotFound();
  }
}

// Route configuration
const routes = [
  {
    match: (path) => path.startsWith('/posts/') && path.split('/')[2],
    handler: resolveContent
  },
  {
    match: (path) => ['/', '/posts', '/index.html'].includes(path),
    handler: resolveFeed
  },
  // { match: (path) => path === '/home', handler: resolveHome },
  // { match: (path) => path === '/about', handler: resolveAbout }
];

// Dispatch route handler based on URL path
function router() {
  let path = window.location.pathname;
  let queryParams = new URLSearchParams(window.location.search);

  // Find matching route and execute handler
  const matchRoute = routes.find(route => route.match(path, queryParams));
  if (matchRoute) {
    matchRoute.handler(path, queryParams);
  } else {
    updateTitle("Page Not Found");
    renderNotFound();
  }
}

// Update document title with optional prefix
function updateTitle(pfx) {
  const sfx = "AshChord.log";
  document.title = pfx ? `${pfx} - ${sfx}` : sfx;
}

// Handle routing on back/forward navigation
window.addEventListener('popstate', router);
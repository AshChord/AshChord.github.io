// Resolve the content based on URL path
function resolveContent(path, _queryParams) {
  const postTitle = decodeURIComponent(path.replace('/posts/', ''));
  const post = posts.find(post => post.title === postTitle);

  if (post) {
    document.title = postTitle;
    renderContent(post);
  } else {
    document.title = "Page Not Found";
    renderNotFound();
  }
}

// Resolve the feed based on URL path and query parameters
function resolveFeed(path, queryParams) {
  const keyword = queryParams.get('keyword');
  const category = queryParams.get('category');

  let postsToRender = posts.filter(post => {
    if (keyword) return post.title.toLowerCase().includes(keyword.toLowerCase());
    if (category) return post.categories.includes(category);
    return true;
  });

  if (keyword) document.title = `Search: ${keyword}`;
  else if (category) document.title = `Category: ${category}`;
  else if (path === '/posts') document.title = "Posts";
  else document.title = "AshChord.log";

  initPagination(postsToRender.length);
  renderFeed(postsToRender, pageState.currentPage);
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
  // { match: (path) => path === '/home', handler: renderHome },
  // { match: (path) => path === '/about', handler: renderAbout }
];

// Dispatch route handler based on URL path
function router() {
  let path = window.location.pathname;
  let queryParams = new URLSearchParams(window.location.search);

  // Handle GitHub Pages SPA redirection
  if (queryParams.has('p')) {
    path = queryParams.get('p');
    queryParams.delete('p');

    if (queryParams.has('q')) {
      const qValue = queryParams.get('q');
      const restoredParams = new URLSearchParams();
      qValue.split('~and~').forEach(pair => {
        const [key, ...valueParts] = pair.split('=');
        if (key) {
          restoredParams.set(key, valueParts.join('='))
        };
      });
      queryParams = restoredParams;
    }

    const queryString = queryParams.toString();
    history.replaceState(null, null, queryString ? `${path}?${queryString}` : path);
  }

  // Find matching route and execute handler
  const matchedRoute = routes.find(route => route.match(path, queryParams));
  if (matchedRoute) {
    matchedRoute.handler(path, queryParams);
  } else {
    document.title = "Page Not Found - AshChord.log";
    renderNotFound();
  }

  // Scroll to top on route change
  window.scrollTo(0, 0);
}

// Handle routing when the main title is clicked
document.querySelector(".blog-title").addEventListener("click", () => {
  window.history.pushState(null, null, "/");
  router();
});

// Handle routing when a menu item is clicked
document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    const path = item.textContent.toLowerCase();
    window.history.pushState(null, null, `/${path}`);
    router();
  });
});

// Handle routing on back/forward navigation
window.addEventListener('popstate', router);
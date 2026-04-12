// Fetch post list from GitHub repository
async function fetchPostList() {
  const res = await fetch(
    'https://api.github.com/repos/AshChord/AshChord.github.io/contents/data'
  );

  const postList = await res.json();
  return postList.filter(item => item.type === 'dir');
}

// Fetch each markdown file and parse its frontmatter metadata
async function retrievePostMeta(postTitle) {
  const meta = {};

  const postPath = `/data/${postTitle}/${postTitle}.md`;
  const res = await fetch(postPath);
  const postCont = await res.text();
  const fm = postCont.match(/^---\smeta\n([\s\S]*?)\n---/);

  const fields = fm[1].split('\n');
  for (const field of fields) {
    const seg = field.match(/([^:]+):(.*)/);
    const key = seg[1].trim();
    const value = seg[2].trim();
    if (key === 'categories') {
      meta[key] = value.split(',').map(item => item.trim());
    } else {
      meta[key] = value;
    }
  }

  return meta;
}

// Compile post metadata for all folders
async function compilePostMeta(postList) {
  const prom = postList.map(postItem => retrievePostMeta(postItem.name));
  const res = await Promise.all(prom);
  return res;
}

// Cache management functions
function saveToCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}Ts`, Date.now().toString());
}

function isCacheValid(key, duration) {
  const ts = localStorage.getItem(`${key}Ts`);
  if (!ts) return false;
  return (Date.now() - parseInt(ts, 10)) < duration;
}

function loadFromCache(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// State object for log data
const appState = {
  flags: {
    postMetaCacheHit: false,
    postListCacheHit: false,
    postListFetched: false,
    postMetaCompiled: false
  },
  postCount: 0,
  currentRoute: ''
};

// Initialize application
async function initialize() {
  let postMeta = [], postList = [];

  // Check post metadata
  if (isCacheValid('postMeta', 1000 * 60 * 10)) {
    postMeta = loadFromCache('postMeta');
    appState.flags.postMetaCacheHit = true;
  } else {
    // Check post list if post metadata missing
    if (isCacheValid('postList', 1000 * 60 * 60)) {
      postList = loadFromCache('postList');
      appState.flags.postListCacheHit = true;
    } else {
      // Fetch post list from GitHub API if no cache
      postList = await fetchPostList();
      saveToCache('postList', postList);
      appState.flags.postListFetched = true;
    }

    postMeta = await compilePostMeta(postList);
    postMeta.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveToCache('postMeta', postMeta);
    appState.flags.postMetaCompiled = true;
  }

  $.posts.push(...postMeta);
  appState.postCount = $.posts.length;

  // Organize posts by category for quick lookup
  $.postsByCat = Object.entries(
    $.posts.reduce((postsByCat, post) => {
      if (!post.categories) return postsByCat;

      post.categories.forEach(cat => {
        (postsByCat[cat] ??= []).push(post);
      });
      return postsByCat;
    }, {})
  );

  router();
  appState.currentRoute = window.location.pathname + window.location.search;

  renderCategoryDropdown();
}

const initProm = initialize();

// Log key runtime events sequentially
async function printRuntimeLogs() {
  const logStyle = 'color: var(--sys-color-token-subtle); font-style: italic;';

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  await initProm;

  // Clear Console
  await sleep(50);
  console.clear();

  // Log cache status
  await sleep(50);
  if (appState.flags.postMetaCacheHit) {
    console.log('%cCache was validated: postList, postMeta', logStyle);
  } else {
    if (appState.flags.postListCacheHit) {
      console.log('%cCache was validated: postList', logStyle);
    } else if (appState.flags.postListFetched) {
      console.log('%cCache was updated: postList', logStyle);
    }

    if (appState.flags.postMetaCompiled) {
      console.log('%cCache was updated: postMeta', logStyle);
    }
  }

  // Log dataset synchronization
  await sleep(50);
  console.log('%cDataset was synchronized: %s', logStyle, `${appState.postCount} posts`);

  // Log routing resolution
  await sleep(50);
  console.log('%cRoute was resolved: %s', logStyle, appState.currentRoute);

  // Log final runtime initialization
  await sleep(50);
  console.log('%cRuntime was initialized', logStyle);
};

// Log events on initial page load
window.addEventListener('load', printRuntimeLogs);

// Update route state and log events on history navigation
window.addEventListener('popstate', () => {
  appState.currentRoute = window.location.pathname + window.location.search;
  printRuntimeLogs();
});

// Log events when page is restored from memory cache
window.addEventListener('pageshow', (event) => {
  if (event.persisted) { 
    printRuntimeLogs();
  }
});
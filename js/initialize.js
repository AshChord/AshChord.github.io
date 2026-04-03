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

// Initialize application and log key runtime events
async function initialize() {
  const logStyle = 'color: var(--sys-color-token-subtle); font-style: italic;';
  console.clear();

  let postMeta = [], postList = [];

  // Check post metadata
  if (isCacheValid('postMeta', 1000 * 60 * 10)) {
    postMeta = loadFromCache('postMeta');
    console.log('%cCache was validated: postList, postMeta', logStyle);
  } else {
    // Check post list if post metadata missing
    if (isCacheValid('postList', 1000 * 60 * 60)) {
      postList = loadFromCache('postList');
      console.log('%cCache was validated: postList', logStyle);
    } else {
      // Fetch post list from GitHub API if no cache
      postList = await fetchPostList();
      saveToCache('postList', postList);
      console.log('%cCache was updated: postList', logStyle);
    }

    postMeta = await compilePostMeta(postList);
    postMeta.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveToCache('postMeta', postMeta);
    console.log('%cCache was updated: postMeta', logStyle);
  }

  $.posts.push(...postMeta);
  console.log('%cDataset was synchronized: %s', logStyle, `${$.posts.length} posts`);

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
  const currRoute = window.location.pathname + window.location.search;
  console.log('%cRoute was resolved: %s', logStyle, currRoute);

  renderCategoryDropdown();

  console.log('%cRuntime was initialized', logStyle);
}

initialize();
// Posts to be loaded
let posts = [];

// Fetch post list from GitHub repository
async function fetchPostList() {
  const response = await fetch(
    'https://api.github.com/repos/AshChord/AshChord.github.io/contents/data'
  );

  const postList = await response.json();
  return postList.filter(item => item.type === 'dir');
}

// Fetch each markdown file and parse its frontmatter metadata
async function retrievePostMeta(postTitle) {
  const meta = {};

  const postPath = `/data/${postTitle}/${postTitle}.md`;
  const response = await fetch(postPath);
  const postContent = await response.text();
  const frontmatter = postContent.match(/^---\smeta\n([\s\S]*?)\n---/);

  const fields = frontmatter[1].split('\n');
  for (const field of fields) {
    const segments = field.match(/([^:]+):(.*)/);
    const key = segments[1].trim();
    const value = segments[2].trim();
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
  const promises = postList.map(postItem => retrievePostMeta(postItem.name));
  const results = await Promise.all(promises);
  return results;
}

// Cache management functions
function saveToCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}Ts`, Date.now().toString());
}

function isCacheValid(key, duration) {
  const timestamp = localStorage.getItem(`${key}Ts`);
  if (!timestamp) return false;
  return (Date.now() - parseInt(timestamp, 10)) < duration;
}

function loadFromCache(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// Initialize posts
async function initialize() {
  // Check post metadata
  if (isCacheValid('postMeta', 1000 * 60 * 10)) {
    posts = loadFromCache('postMeta');
  } else {
    let postList = [];
    // Check post list if post metadata missing
    if (isCacheValid('postList', 1000 * 60 * 60)) {
      postList = loadFromCache('postList');
    } else {
      // Fetch post list from GitHub API if no cache
      postList = await fetchPostList();
      saveToCache('postList', postList);
    }

    posts = await compilePostMeta(postList);
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveToCache('postMeta', posts);
  }

  router();
  renderCategoryDropdown();
}

initialize();
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

  const postPath = `/posts/${postTitle}/${postTitle}.md`;
  const res = await fetch(postPath);
  const postCont = await res.text();
  const fm = postCont.match(/^---\smeta\n([\s\S]*?)\n---/);
  if (!fm) return {};

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
  postMeta: {
    isCached: false,
    isCompiled: false
  },
  postList: {
    isCached: false,
    isFetched: false
  },
  postCount: 0,
  currentRoute: ''
};

// Log key runtime events sequentially
const runtimeLogger = {
  runtimeLogs: [],
  isPrinting: false,
  isDevToolsShown: false,

  // Prepare log data based on application state
  prepareLogs: function () {
    const logs = [];
    const { postMeta, postList, postCount, currentRoute } = appState;

    if (postMeta.isCached) {
      logs.push({ msg: 'Cache was validated', data: 'postList, postMeta' });
    } else {
      if (postList.isCached) {
        logs.push({ msg: 'Cache was validated', data: 'postList' });
      } else if (postList.isFetched) {
        logs.push({ msg: 'Cache was updated', data: 'postList' });
      }
      if (postMeta.isCompiled) {
        logs.push({ msg: 'Cache was updated', data: 'postMeta' });
      }
    }
    logs.push({ msg: 'Dataset was synchronized', data: `${postCount} posts` });
    logs.push({ msg: 'Route was resolved', data: currentRoute });
    logs.push({ msg: 'Runtime was initialized', data: null });

    this.runtimeLogs = logs;
    return logs;
  },

  // Print stored logs to console
  printLogs: async function (isSequential = false) {
    if (this.isPrinting) return;
    this.isPrinting = true;

    const logStyle = 'color: var(--sys-color-token-subtle); font-style: italic;';

    for (const log of this.runtimeLogs) {
      if (isSequential) {
        const sleep = (ms) => new Promise(res => setTimeout(res, ms));
        await sleep(100);
      }

      if (log.data) {
        console.log(`%c${log.msg}: %s`, logStyle, log.data);
      } else {
        console.log(`%c${log.msg}`, logStyle);
      }
    }

    this.isPrinting = false;
  },

  // Detect if DevTools is open and trigger log printing
  detectDevTools: async function (isInit = false) {
    const start = performance.now();
    console.profile();
    console.profileEnd();
    console.clear();
    const isDetected = (performance.now() - start) > 5;

    if (!isDetected) {
      this.isDevToolsShown = false;
      return;
    }

    if (!this.isDevToolsShown) {
      this.isDevToolsShown = true;
      await this.printLogs(true);

      if (!isInit && this.detector) {
        window.removeEventListener('blur', this.detector);
        window.removeEventListener('focus', this.detector);
      }
    } else {
      await this.printLogs();
    }
  },

  // Deploy and start runtime logging suite
  launch: async function () {
    this.prepareLogs();
    this.detectDevTools(true);

    const detector = () => {
      setTimeout(() => this.detectDevTools(), 100);
    };

    window.addEventListener('blur', detector);
    window.addEventListener('focus', detector);

    this.detector = detector;
  }
};

// Initialize application
async function initialize() {
  let postMeta = [], postList = [];

  // Check post metadata
  if (isCacheValid('postMeta', 1000 * 60 * 10)) {
    postMeta = loadFromCache('postMeta');
    appState.postMeta.isCached = true;
  } else {
    // Check post list if post metadata missing
    if (isCacheValid('postList', 1000 * 60 * 60)) {
      postList = loadFromCache('postList');
      appState.postList.isCached = true;
    } else {
      // Fetch post list from GitHub API if no cache
      postList = await fetchPostList();
      saveToCache('postList', postList);
      appState.postList.isFetched = true;
    }

    postMeta = await compilePostMeta(postList);
    postMeta.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveToCache('postMeta', postMeta);
    appState.postMeta.isCompiled = true;
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
  appState.currentRoute = decodeURI(window.location.pathname + window.location.search);

  rendercategoryPanel();

  runtimeLogger.launch();
}

initialize();
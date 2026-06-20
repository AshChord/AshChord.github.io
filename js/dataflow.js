class Dataflow {
  constructor() {
    this.nodes = new Map();
  }

  node(compute) {
    const self = {};
    self.compute = compute;
    self.then = (resolve) => this.evaluate(self).then(resolve);

    return self;
  }

  evaluate(node) {
    if (this.nodes.has(node)) return this.nodes.get(node);

    const promise = node.compute().catch(error => {
      this.nodes.delete(node);
      throw error;
    });
    this.nodes.set(node, promise);

    return promise;
  }
}

const dataflow = new Dataflow();

// 1. posts
const posts = dataflow.node(async () => {
  const { BASE, OWNER, REPO, PATH } = GITHUB_API;
  const endpoints = {
    postData: `${BASE}/repos/${OWNER}/${REPO}/git/trees/main:${PATH}`,
    postMetaData: `${BASE}/repos/${OWNER}/${REPO}/commits?path=${PATH}&per_page=100`,
  };
  const responses = await Promise.all(Object.values(endpoints).map(url => fetch(url)));

  const postData = (await responses.shift().json()).tree
    .filter(({ type }) => type === 'tree')
    .map(({ path }) => path);
  const postSet = new Set(postData);
  const metadataMap = new Map();

  const parseMetadata = (commits) => {
    return commits.some(({ commit }) => {
      const commitBody = commit.message.trim().split('\n\n')[1];
      if (!commitBody) return false;

      const metadata = {};
      const fields = commitBody.split('\n');

      for (const field of fields) {
        let [match, key, value] = field.match(/^-([^:]+):(.*)|$/);
        if (!match) continue;

        key = key.trim().toLowerCase();
        value = value.trim();

        if (key === 'categories') {
          value = value.split(',').map(item => item.trim());
        }

        metadata[key] = value;
      }

      const title = metadata.title;
      if (postSet.has(title) && !metadataMap.has(title)) {
        metadataMap.set(title, metadata);
      }

      return metadataMap.size === postSet.size;
    });
  };

  // Link header exists (GitHub API pagination)
  const [postMetadataResponse] = responses;
  const link = postMetadataResponse.headers.get('Link');
  if (link) {
    const lastLink = link.split(',').find(part => part.includes('rel="last"'));
    const lastPage = Number(lastLink.match(/[?&]page=(\d+)/)[1]);

    const remainingRequests = [];
    for (let page = 2; page <= lastPage; page++) {
      remainingRequests.push(fetch(`${endpoints.postMetaData}&page=${page}`));
    }

    const remainingResponses = await Promise.all(remainingRequests);
    responses.push(...remainingResponses);
  }

  for (const response of responses) {
    const commits = await response.json();
    if (parseMetadata(commits)) break;
  }

  return [...metadataMap.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 2. categorizedPosts
const categorizedPosts = dataflow.node(async () => {
  const postsByCategory = (await posts).reduce((postsByCategory, post) => {
    if (!post.categories) return postsByCategory;

    post.categories.forEach(category => {
      (postsByCategory[category] ??= []).push(post);
    });
    return postsByCategory;
  }, {});

  return new Map(Object.entries(postsByCategory).sort(([a], [b]) => a.localeCompare(b)));
});

// 3. filteredPosts
const filteredPosts = dataflow.node(async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const keyword = params.get('keyword')?.toLowerCase();

  if (category) {
    return (await categorizedPosts).get(category) || [];
  }

  if (keyword) {
    return (await posts).filter(post =>
      post.title.toLowerCase().includes(keyword)
    );
  }

  return posts;
});

// 4. paginationData
const paginationData = dataflow.node(async () => {
  const { postLimit, pageLimit } = pgnData;

  const params = new URLSearchParams(window.location.search);
  const requestedPage = Number(params.get('page')) || 1;

  const totalPosts = (await filteredPosts).length;
  const totalPages = Math.ceil(totalPosts / postLimit);
  const currPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

  const currGroup = Math.ceil(currPage / pageLimit);
  const startPage = (currGroup - 1) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  return { totalPosts, totalPages, currPage, currGroup, startPage, endPage };
});

// 5. postsForCurrPage
const postsForCurrPage = dataflow.node(async () => {
  const { currPage } = await paginationData;
  const { postLimit } = pgnData;

  return (await filteredPosts).slice((currPage - 1) * postLimit, currPage * postLimit);
});

// 6. contentForCurrPage
const contentForCurrPage = dataflow.node(async () => {
  const pathTitle = decodeURIComponent(window.location.pathname.replace('/posts/', ''));

  const res = await fetch(`/data/${pathTitle}/${pathTitle}.md`);
  if (!res.ok) return null;

  const content = await res.text();
  const mdText = content.replace(/^---\smeta\n([\s\S]*?)\n---/, '').trim();

  const metadata = (await posts).find(post => post.title === pathTitle) || {};

  return { title: pathTitle, mdText, metadata };
});
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
  const res = await fetch('/posts');
  const htmlText = await res.text();
  const doc = new DOMParser().parseFromString(htmlText, 'text/html');

  const postContainers = doc.querySelectorAll('ul');
  const finalPosts = [];

  postContainers.forEach(container => {
    const listItems = container.querySelectorAll('li');

    finalPosts.push({
      title: listItems[0].innerText,
      date: listItems[1].innerText,
      excerpt: listItems[2].innerText,
      categories: listItems[3].innerText.split(',').map(cat => cat.trim())
    });
  });

  return finalPosts;
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
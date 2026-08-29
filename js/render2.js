const feed = document.querySelector('.feed');
const content = document.querySelector('.content');
const outline = document.querySelector('.outline');
const pagination = document.querySelector('.pagination');
const categoryMenu = document.querySelector('.category-menu');

// 피드(목록) 렌더링
async function renderFeed() {
  content.replaceChildren();
  outline.replaceChildren();

  const posts = await dataflow.evaluate(postsForCurrPage);

  if (posts.length === 0) {
    const noResults = document.createElement('p');
    noResults.className = 'no-results';
    noResults.textContent = '검색 결과가 없습니다.';
    feed.replaceChildren(noResults);
    return;
  }

  const feedFragment = document.createDocumentFragment();
  const feedTemplate = document.querySelector('.feed-template');

  posts.forEach(post => {
    const feedItem = feedTemplate.content.cloneNode(true);

    const preview = feedItem.querySelector('.preview');
    preview.href = `/posts/${encodeURIComponent(post.title)}`;

    const thumbnail = feedItem.querySelector('.thumbnail');
    thumbnail.src = `/posts/${encodeURIComponent(post.title)}/thumbnail.webp`;
    thumbnail.alt = post.title;

    const title = feedItem.querySelector('.title');
    title.textContent = post.title;

    const excerpt = feedItem.querySelector('.excerpt');
    excerpt.textContent = post.excerpt;

    const date = feedItem.querySelector('.date');
    date.textContent = post.date;

    const categoryList = feedItem.querySelector('.category-list');
    const categoryTemplate = feedItem.querySelector('.category-template');

    post.categories.forEach(category => {
      const categoryLinkItem = categoryTemplate.content.cloneNode(true);
      const categoryLink = categoryLinkItem.querySelector('a');
      categoryLink.href = `/posts?category=${encodeURIComponent(category)}`;
      categoryLink.textContent = category;
      categoryList.appendChild(categoryLinkItem);
    });

    feedFragment.appendChild(feedItem);
  });

  feed.replaceChildren(feedFragment);
}

// 본문(단일 포스트) 렌더링
async function renderContent() {
  feed.replaceChildren();
  pagination.replaceChildren();

  const post = await dataflow.evaluate(currentPost);

  // 헤더 렌더링
  const contentHeader = content.querySelector('.content-header');

  // 카테고리 렌더링
  const categoryList = contentHeader.querySelector('.category-list');
  post.categories.forEach(category => {
    const categoryLink = document.createElement('a');
    categoryLink.href = `/posts?category=${encodeURIComponent(category)}`;
    categoryLink.className = 'category';
    categoryLink.textContent = category;
    categoryList.appendChild(categoryLink);
  });

  const title = contentHeader.querySelector('.title');
  title.textContent = post.title;

  const date = contentHeader.querySelector('.date');
  date.textContent = post.date;

  const thumbnail = contentHeader.querySelector('.thumbnail');
  thumbnail.alt = `${post.slug}`;
  thumbnail.src = `/posts/${post.slug}/thumbnail.webp`;

  // 바디 렌더링
  const contentNodes = await window.contentNodes;
  document.querySelector('.content-body').append(...contentNodes);

  (async function renderCode() {
    const host = 'https://esm.sh';

    const importBlob = async (url) => {
      const source = await fetch(url).then((res) => res.text());
      const fileName = url.split('/').pop();
      const variant = source.replace(/import[^;]+;/, '') + `\n//# sourceURL=${fileName}`;
      const blob = new Blob([variant], { type: 'text/javascript' });

      return import(URL.createObjectURL(blob));
    };

    const [core, engine, wasm] = await Promise.all([
      importBlob(`${host}/shiki@4.4.2/es2022/core.bundle.mjs`),
      importBlob(`${host}/@shikijs/engine-oniguruma@4.4.2/es2022/engine-oniguruma.mjs`),
      import(`${host}/@shikijs/engine-oniguruma@4.4.2/es2022/wasm-inlined.mjs`)
    ]);

    const highlighter = await core.createHighlighterCore({
      themes: [import(`${host}/@shikijs/themes@4.4.2/es2022/github-light.mjs`)],
      langs: [],
      engine: await engine.createOnigurumaEngine(wasm.default)
    });

    const codeBlocks = document.querySelectorAll('pre code:not([highlighted])');

    const codeData = [...codeBlocks].map((codeBlock) => ({
      codeBlock,
      lang: codeBlock.className.replace(/^language-/, '') || 'text'
    }));

    const languages = new Set(codeData.map(({ lang }) => lang));
    languages.delete('text');

    await Promise.all([...languages].map((lang) =>
      highlighter.loadLanguage(import(`${host}/@shikijs/langs@4.4.2/es2022/${lang}.mjs`))
    ));

    for (const { codeBlock, lang } of codeData) {
      const copyBtn = document.createElement('button');
      copyBtn.classList.add('copy-button');
      codeBlock.parentElement.prepend(copyBtn);

      const codeText = codeBlock.textContent.trimEnd();
      const originalLines = codeText.split('\n');

      const highlighted = highlighter.codeToHtml(codeText, {
        lang,
        theme: 'github-light'
      });

      const doc = new DOMParser().parseFromString(highlighted, 'text/html');

      const fragment = document.createDocumentFragment();

      doc.querySelectorAll('.line').forEach((line, lineIdx) => {
        const currentLine = document.createElement('data');
        currentLine.className = 'code-line';
        currentLine.value = lineIdx + 1;

        const indent = originalLines[lineIdx].search(/\S/);
        if (indent > 0) currentLine.style.setProperty('--indent', `${indent}ch`);

        currentLine.append(...line.childNodes, '\n');
        fragment.appendChild(currentLine);
      });

      codeBlock.replaceChildren(fragment);
      codeBlock.setAttribute('highlighted', '');
    }

    document.querySelectorAll('code:not(pre code)').forEach((code) => {
      const tokens = code.textContent.split(/([^a-zA-Z0-9\s])/g).filter(Boolean);

      const brokenTokens = tokens.flatMap((token, i) => {
        if (i === 0) return token;

        const wbr = document.createElement('wbr');
        return [wbr, token];
      });

      code.replaceChildren(...brokenTokens);
    });
  })();

  // 목차 렌더링
  (function renderOutline() {
    const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
    const headingList = outline.querySelector('.heading-list');

    headings.forEach((hdg, idx) => {
      hdg.id = `heading-${idx}`;

      const linkToHeading = document.createElement('a');
      const indentLevel = Number(hdg.tagName[1]) - 2;

      linkToHeading.href = `#${hdg.id}`;
      linkToHeading.textContent = hdg.textContent;
      linkToHeading.style.paddingLeft = `${indentLevel * 12}px`;

      headingList.appendChild(linkToHeading);
    });
  })();
}

// 페이지네이션 렌더링
async function renderPagination() {
  const paginationResult = await dataflow.evaluate(paginationData);
  const { currPage, totalPages, currGroup, startPage, endPage } = paginationResult;
  const { pageLimit } = pgnData; // 전역 state.js 변수

  if (totalPages <= 1) {
    pagination.replaceChildren();
    return;
  }

  const configurePageLink = (link, page, isActive, className = '', text = '') => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    link.href = `?${params.toString()}`;

    if (!link.classList.length) link.className = className;
    if (!isActive) link.removeAttribute('href');
    link.textContent = text;
  };

  const pageFirstLink = pagination.querySelector('.page-first');
  const pagePreviousLink = pagination.querySelector('.page-previous');
  const pageNextLink = pagination.querySelector('.page-next');
  const pageLastLink = pagination.querySelector('.page-last');

  configurePageLink(pageFirstLink, 1, currPage !== 1);
  configurePageLink(pagePreviousLink, (currGroup - 2) * pageLimit + 1, currGroup !== 1);
  configurePageLink(pageNextLink, currGroup * pageLimit + 1, endPage !== totalPages);
  configurePageLink(pageLastLink, totalPages, currPage !== totalPages);

  pagination.querySelectorAll('.page-number').forEach(element => element.remove());

  for (let i = startPage; i <= endPage; i++) {
    const pageNumLink = document.createElement('a');
    configurePageLink(pageNumLink, i, currPage !== i, 'page-number', i);
    if (currPage === i) pageNumLink.classList.add('current');
    pageNextLink.before(pageNumLink);
  }
}

// 카테고리 패널 렌더링
async function renderCategoryPanel() {
  const categoryMap = await dataflow.evaluate(categorizedPosts);
  const categoryMenuFrag = document.createDocumentFragment();

  for (const [category, postsArr] of categoryMap.entries()) {
    const li = document.createElement("li");
    li.className = "category-menu-item";

    const categoryLink = document.createElement('a');
    categoryLink.href = `/posts?category=${encodeURIComponent(category)}`;

    const categoryName = document.createElement("span");
    categoryName.className = "category-name";
    categoryName.textContent = category;

    const categoryCount = document.createElement("span");
    categoryCount.className = "count";
    categoryCount.textContent = `(${postsArr.length})`;

    categoryLink.append(categoryName, categoryCount);
    li.append(categoryLink);
    categoryMenuFrag.appendChild(li);
  }

  categoryMenu.replaceChildren(categoryMenuFrag);
}

// 404 렌더링
function renderNotFound() {
  content.replaceChildren();
  outline.replaceChildren();
  pagination.replaceChildren();

  const notFoundDiv = document.createElement('div');
  notFoundDiv.className = 'not-found';

  const title = document.createElement('h1');
  title.textContent = '404';

  const desc = document.createElement('p');
  desc.textContent = '페이지를 찾을 수 없습니다.';

  notFoundDiv.append(title, desc);
  feed.replaceChildren(notFoundDiv);
}
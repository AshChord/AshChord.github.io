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

  //const metadata = document.querySelector('.metadata');

  // 헤더 렌더링
  //const contentHeader = content.querySelector('.content-header');
  //const categoryList = contentHeader.querySelector('.category-list');

  //metadata.dataset.categories.split(/\s*,\s*/).forEach(category => {
  //  const categoryLink = document.createElement('a');
  //  categoryLink.href = `/posts?category=${encodeURIComponent(category)}`;
  //  categoryLink.className = 'category';
  //  categoryLink.textContent = category;
  //  categoryList.appendChild(categoryLink);
  //});

  /*const title = contentHeader.querySelector('.title');
  title.textContent = metadata.dataset.title;

  const date = contentHeader.querySelector('.date');
  date.textContent = metadata.dataset.date;

  const thumbnail = contentHeader.querySelector('.thumbnail');
  const nativeThumbnail = document.querySelector('img[onload]');
  nativeThumbnail.className = 'thumbnail';
  thumbnail.replaceWith(nativeThumbnail);

  metadata.remove();*/

  /*(function renderCode() {
    document.querySelectorAll('pre').forEach((pre) => {
      const codeBlock = pre.querySelector('code');

      if (codeBlock.hasAttribute('highlighted')) return;

      const lang = codeBlock.className.replace(/^language-/, '');
      const cleanText = codeBlock.textContent;
      const originalLines = cleanText.split('\n');

      const highlighted = hljs.highlight(cleanText, { language: lang }).value;
      const parser = new DOMParser();
      const doc = parser.parseFromString(highlighted, 'text/html');
      const root = doc.body;

      const linesData = [];
      let currentLineData = [];
      const styleStack = [];

      const collectData = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = node.textContent.split('\n');

          parts.forEach((part, idx) => {
            if (idx > 0) {
              linesData.push(currentLineData);
              currentLineData = [];
            }
            currentLineData.push({
              text: part,
              styles: [...styleStack]
            });
          });
          return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        if (node.className) styleStack.push(node.className);

        node.childNodes.forEach(child => collectData(child));

        if (node.className) styleStack.pop();
      };

      // const 선언 이후에 호출하므로 안전하게 동작합니다.
      root.childNodes.forEach(node => collectData(node));

      const fragment = document.createDocumentFragment();

      linesData.forEach((linePieces, lineIdx) => {
        const currentLine = document.createElement('data');
        currentLine.className = 'code-line';
        currentLine.value = lineIdx + 1;

        const rawLineText = originalLines[lineIdx];
        if (rawLineText) {
          const indent = rawLineText.search(/\S/);
          if (indent > 0) {
            currentLine.style.setProperty('--indent', `${indent}ch`);
          }
        }

        linePieces.forEach(({ text, styles }) => {
          if (!text) return;

          let node = document.createTextNode(text);
          for (let i = styles.length - 1; i >= 0; i--) {
            const span = document.createElement('span');
            span.className = styles[i];
            span.appendChild(node);
            node = span;
          }
          currentLine.appendChild(node);
        });

        currentLine.appendChild(document.createTextNode('\n'));
        fragment.appendChild(currentLine);
      });

      codeBlock.replaceChildren(fragment);
      codeBlock.setAttribute('highlighted', '');

      const copyBtn = document.createElement("button");
      copyBtn.classList.add("copy-button");
      pre.prepend(copyBtn);
    });

    document.querySelectorAll('code:not(pre code)').forEach((code) => {
      const tokens = code.textContent.split(/([^a-zA-Z0-9\s])/g).filter(Boolean);

      const brknTokens = tokens.flatMap((token, i) => {
        if (i === 0) return token;

        const wbr = document.createElement('wbr');
        return [wbr, token];
      });

      code.replaceChildren(...brknTokens);
    });
  })();*/

  // 목차 렌더링
  (function renderOutline() {
    const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
    const headingList = outline.querySelector('.heading-list');

    headings.forEach((hdg, idx) => {
      if (!hdg.id) hdg.id = `heading-${idx}`;

      const linkToHeading = document.createElement('a');
      const indentLevel = Number(hdg.tagName[1]) - 2;

      linkToHeading.href = `#${hdg.id}`;
      linkToHeading.textContent = hdg.textContent;
      linkToHeading.style.paddingLeft = `${indentLevel * 12}px`;

      linkToHeading.addEventListener('click', (e) => {
        e.preventDefault();
        hdg.scrollIntoView({ behavior: 'smooth' });
      });

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
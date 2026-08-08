// Render blog feed
function renderFeed(postsToRender = $.posts, currPage = 1) {
  $.content.replaceChildren();
  $.outline.replaceChildren();

  // Calculate start and end indices of posts on current page
  const startIdx = (currPage - 1) * pgnData.postLimit;
  const endIdx = startIdx + pgnData.postLimit;
  const postsForCurrPage = postsToRender.slice(startIdx, endIdx);

  // Show message if no posts are found
  if (postsForCurrPage.length === 0) {
    const noRes = document.createElement('p');
    noRes.className = 'no-results';
    noRes.textContent = '검색 결과가 없습니다.';
    $.feed.appendChild(noRes);
    return;
  }

  // Loop through each post and create feed item
  const feedTemplate = $.feed.querySelector('.feed-template');

  postsForCurrPage.forEach(post => {
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

    const catDiv = feedItem.querySelector('.category-list');
    const catTemplate = catDiv.querySelector('.category-template');
    post.categories.forEach(category => {
      const catLinkItem = catTemplate.content.cloneNode(true);
      const catLink = catLinkItem.querySelector('a');
      catLink.href = `/posts?category=${encodeURIComponent(category)}`
      catLink.textContent = category;
      catDiv.appendChild(catLink);
    });

    feedTemplate.remove();
    catTemplate.remove();

    $.feed.appendChild(feedItem);
  });
}

// Render content of single post
async function renderContent(post) {
  $.feed.replaceChildren();

  // Create and append post header
  const contentHeader = $.content.querySelector('.content-header');
  const catList = contentHeader.querySelector('.category-list');

  post.categories.forEach(category => {
    const catLink = document.createElement('a');
    catLink.href = `/posts?category=${category}`
    catLink.className = 'category';
    catLink.textContent = category;
    catList.appendChild(catLink);
  });

  const title = contentHeader.querySelector('.title');
  title.textContent = post.title;

  const date = contentHeader.querySelector('.date');
  date.textContent = post.date;

  const thumbnail = contentHeader.querySelector('.thumbnail');
  thumbnail.src = `/posts/${post.title}/thumbnail.webp`;
  thumbnail.alt = post.title;

  // Fetch and parse markdown content of post
  const mdCont = await fetch(`/posts/${post.title}/${post.title}.md`);
  const mdText = (await mdCont.text()).replace(/^---\smeta\n([\s\S]*?)\n---/, '').trim();
  const htmlText = marked.parse(mdText);

  // Append parsed HTML content to post body
  const contentBody = $.content.querySelector('.content-body');
  const htmlTextFrag = document.createRange().createContextualFragment(htmlText);
  contentBody.replaceChildren(htmlTextFrag);

  renderCode();
  renderOutline();
}

// Render code snippets within post
/*function renderCode() {
  // Split code into lines with syntax highlighting and indentation
  document.querySelectorAll('pre').forEach((pre) => {
    const codeBlock = pre.querySelector('code');

    if (codeBlock.hasAttribute('highlighted')) return;

    const codeText = codeBlock.textContent;
    const lang = codeBlock.className.replace('language-', '');
    const hlCode = hljs.highlight(codeText, { language: lang }).value;
    const lines = hlCode.match(/.*?\n|.+$/g);

    const codeFrag = document.createDocumentFragment();

    lines.forEach((lineText, idx) => {
      const line = document.createElement('data');
      const lineTextFrag = document.createRange().createContextualFragment(lineText);
      line.appendChild(lineTextFrag);

      line.className = 'code-line';
      line.value = idx + 1;

      const indent = lineText.search(/\S/);
      if (indent > 0) {
        line.style.setProperty('--indent', `${indent}ch`);
      }

      codeFrag.appendChild(line);
    });

    codeBlock.replaceChildren(codeFrag);
    codeBlock.setAttribute('highlighted', '');

    // Add copy button for each code block
    const copyBtn = document.createElement("button");
    copyBtn.classList.add("copy-button");

    pre.prepend(copyBtn);
    void copyBtn.offsetWidth;
  });

  // Breaks long inline code into smaller chunks for better readability
  document.querySelectorAll('code:not(pre code)').forEach((code) => {
    const tokens = code.textContent.split(/([^a-zA-Z0-9\s])/g).filter(Boolean);

    const brknTokens = tokens.flatMap((token, i) => {
      if (i === 0) return token;

      const wbr = document.createElement('wbr');
      return [wbr, token];
    });

    code.replaceChildren(...brknTokens);
  });
}*/

function renderCode() {
  document.querySelectorAll('pre code').forEach((codeBlock) => {
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

    function collectData(node) {
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
    }

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

    const pre = codeBlock.parentElement;
    if (pre && pre.tagName === 'PRE') {
      const copyBtn = document.createElement("button");
      copyBtn.classList.add("copy-button");
      pre.prepend(copyBtn);
      void copyBtn.offsetWidth;
    }
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
}

// Handle copy action when the copy button is clicked
document.addEventListener('click', async (e) => {
  const copyBtn = e.target.closest('.copy-button');
  if (!copyBtn) return;

  const pre = copyBtn.closest('pre');
  const codeBlock = pre.querySelector('code');

  await navigator.clipboard.writeText(codeBlock.textContent);
  copyBtn.classList.add("copied");
  setTimeout(() => copyBtn.classList.remove("copied"), 2000);
});

// Render outline based on headings in post
function renderOutline() {
  const hdgs = $.content.querySelectorAll('h2, h3, h4, h5, h6');
  const headingList = $.outline.querySelector('.heading-list');

  hdgs.forEach((hdg, idx) => {
    if (!hdg.id) hdg.id = `${idx}`;

    // Create heading list with link
    const linkToHdg = document.createElement('a');
    const indentLevel = parseInt(hdg.tagName.substring(1)) - 2;

    linkToHdg.href = `#${hdg.id}`;
    linkToHdg.textContent = hdg.textContent;
    linkToHdg.style.paddingLeft = `${indentLevel * 12}px`;

    // Smooth scroll to heading on click
    linkToHdg.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(hdg.id).scrollIntoView({ behavior: 'smooth' });
    });

    headingList.appendChild(linkToHdg);
  });

  $.outline.appendChild(headingList);

  // Calculate height of heading list and hide outline if it overflows viewport
  $.outline.style.setProperty('--height', `${headingList.offsetHeight}px`);
  if (innerHeight < headingList.offsetHeight) $.outline.style.visibility = 'hidden';

  // Initialize current heading
  currHdgIdx = -1;
}

// Highlight current heading in outline based on scroll position
let currHdgIdx = -1;
let ticking = false;

window.addEventListener('scroll', () => {
  if (ticking || !$.outline.hasChildNodes()) return;
  window.requestAnimationFrame(() => {
    const hdgs = $.content.querySelectorAll('h2, h3, h4, h5, h6');
    const links = $.outline.querySelectorAll('a');
    const trigPoint = window.innerHeight * 0.02;

    let newHdgIdx = -1;

    for (let i = hdgs.length - 1; i >= 0; i--) {
      if (hdgs[i].getBoundingClientRect().top <= trigPoint) {
        newHdgIdx = i;
        break;
      }
    }

    if (newHdgIdx !== currHdgIdx) {
      currHdgIdx = newHdgIdx;

      links.forEach((link, i) => {
        link.classList.toggle('current', i === currHdgIdx);
      });
    }

    ticking = false;
  });
  ticking = true;
}, { passive: true });

// Render category dropdown menu 
function rendercategoryPanel() {
  // Create category items
  const catMenuFrag = document.createDocumentFragment();

  $.postsByCat
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, posts]) => {
      const li = document.createElement("li");
      li.className = "category-menu-item";

      const catLink = document.createElement('a');
      catLink.href = `/posts?category=${encodeURIComponent(category)}`;

      const catName = document.createElement("span");
      catName.className = "category-name";
      catName.textContent = category;

      const catCount = document.createElement("span");
      catCount.className = "count";
      catCount.textContent = `(${posts.length})`;

      catLink.append(catName, catCount);
      li.append(catLink);
      catMenuFrag.appendChild(li);
    });

  $.catMenu.appendChild(catMenuFrag);
}

// Render 404 page
function renderNotFound() {
  $.cont.replaceChildren();
  $.outline.replaceChildren();
  $.pgn.replaceChildren();

  const div = document.createElement('div');
  div.className = 'not-found';

  const title = document.createElement('h1');
  title.textContent = '404';

  const desc = document.createElement('p');
  desc.textContent = '페이지를 찾을 수 없습니다.';

  div.append(title, desc);
  $.feed.replaceChildren(div);
}
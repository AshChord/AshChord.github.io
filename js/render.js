// Render blog feed
function renderFeed(postsToRender = $.posts, currPage = 1) {
  $.feed.replaceChildren();
  $.cont.replaceChildren();
  $.otl.replaceChildren();

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
  postsForCurrPage.forEach(post => {
    const feedItem = document.createElement('article');
    feedItem.className = 'feed-item';

    const thumbnail = document.createElement('img');
    thumbnail.src = `/data/${post.title}/thumbnail.png`;
    thumbnail.alt = post.title;
    thumbnail.className = 'thumbnail';

    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = post.title;

    const excerpt = document.createElement('p');
    excerpt.className = 'excerpt';
    excerpt.textContent = post.excerpt;

    const catDiv = document.createElement('div');
    catDiv.className = 'category-list';
    post.categories.forEach(category => {
      const span = document.createElement('span');
      span.className = 'category';
      span.textContent = category;
      catDiv.appendChild(span);
    });

    const date = document.createElement('p');
    date.className = 'date';
    date.textContent = post.date;

    feedItem.append(thumbnail, title, excerpt, catDiv, date);
    $.feed.appendChild(feedItem);
  });
}

// Handle feed item click events
$.feed.addEventListener('click', (e) => {
  const feedItem = e.target.closest('.feed-item');
  if (!feedItem) return;
  if (e.target.classList.contains('category')) return;
  const postTitle = feedItem.querySelector('.title').textContent;
  history.pushState(null, null, `/posts/${encodeURIComponent(postTitle)}`);
  router();
});

// Render content of single post
async function renderContent(post) {
  $.feed.replaceChildren();
  $.cont.replaceChildren();
  $.otl.replaceChildren();
  $.pgn.replaceChildren();

  // Create and append post header
  const postHdr = document.createElement('div');
  postHdr.classList.add('post-header');

  const catList = document.createElement('div');
  catList.classList.add('category-list');

  post.categories.forEach(category => {
    const span = document.createElement('span');
    span.classList.add('category');
    span.textContent = category;
    catList.appendChild(span);
  });

  const title = document.createElement('h1');
  title.classList.add('title');
  title.textContent = post.title;

  const date = document.createElement('p');
  date.classList.add('date');
  date.textContent = post.date;

  const thumbnail = document.createElement('img');
  thumbnail.classList.add('thumbnail');
  thumbnail.src = `/data/${post.title}/thumbnail.png`;
  thumbnail.alt = post.title;

  postHdr.append(catList, title, date, thumbnail);
  $.cont.appendChild(postHdr);

  // Fetch and parse markdown content of post
  const mdCont = await fetch(`/data/${post.title}/${post.title}.md`);
  const mdText = (await mdCont.text()).replace(/^---\smeta\n([\s\S]*?)\n---/, '').trim();
  const htmlText = marked.parse(mdText);

  // Append parsed HTML content to post body
  const postBody = document.createElement('div');
  const htmlTextFrag = document.createRange().createContextualFragment(htmlText);
  postBody.classList.add('post-body');
  postBody.appendChild(htmlTextFrag);
  $.cont.appendChild(postBody);

  renderCode();
  renderoutline();
}

// Render code snippets within post
function renderCode() {
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

    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(codeText);
      copyBtn.classList.add("copied");
      setTimeout(() => copyBtn.classList.remove("copied"), 2000);
    };

    pre.appendChild(copyBtn);
  });

  // Breaks long inline code into smaller chunks for better readability
  document.querySelectorAll('code:not(pre code)').forEach((code) => {
    const tokens = code.textContent.split(/([^a-zA-Z0-9\s])/g);

    const brknTokens = tokens.map((token, i) => {
      if (token === "") return null;
      if (i === 0) return token;

      const wbr = document.createElement('wbr');
      return [wbr, token];
    }).filter(Boolean).flat();

    code.replaceChildren(...brknTokens);
  });
}

// Render outline based on headings in post
function renderoutline() {
  const hdgs = $.cont.querySelectorAll('h3, h4, h5, h6');
  const ul = document.createElement('ul');

  hdgs.forEach((hdg, idx) => {
    if (!hdg.id) hdg.id = `${idx}`;

    // Create heading list with link
    const listItem = document.createElement('li');
    const indentLevel = parseInt(hdg.tagName.substring(1)) - 3;
    listItem.style.paddingLeft = `${indentLevel * 12}px`;

    const linkToHdg = document.createElement('a');
    linkToHdg.href = `#${hdg.id}`;
    linkToHdg.textContent = hdg.textContent;

    // Smooth scroll to heading on click
    linkToHdg.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(hdg.id).scrollIntoView({ behavior: 'smooth' });
    });

    listItem.appendChild(linkToHdg);
    ul.appendChild(listItem);
  });

  $.otl.appendChild(ul);

  window.dispatchEvent(new Event('resize'));
  currHdgIdx = -1;
}

// Adjust outline to stay vertically centered
window.addEventListener('resize', () => {
  $.otl.style.top = `${Math.max(window.innerHeight - $.otl.offsetHeight) / 2}px`;
});

// Highlight current heading in outline based on scroll position
let currHdgIdx = -1;
let ticking = false;

window.addEventListener('scroll', () => {
  if (ticking || !$.otl.hasChildNodes()) return;
  window.requestAnimationFrame(() => {
    const hdgs = $.cont.querySelectorAll('h3, h4, h5, h6');
    const links = $.otl.querySelectorAll('a');
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
function renderCategoryDropdown() {
  // Create category items
  const catMenuFrag = document.createDocumentFragment();

  $.postsByCat.sort(([a], [b]) => a.localeCompare(b)).forEach(([name, posts]) => {
    const li = document.createElement("li");
    li.className = "category-menu-item";

    const catName = document.createElement("span");
    catName.className = "category-name";
    catName.textContent = name;

    const catCount = document.createElement("span");
    catCount.className = "count";
    catCount.textContent = `(${posts.length})`;

    li.append(catName, catCount);
    catMenuFrag.appendChild(li);
  });

  $.catMenu.appendChild(catMenuFrag);
}

// Handle category item click events
$.catMenu.addEventListener('click', (e) => {
  const catItem = e.target.closest('.category-menu-item');
  if (catItem) {
    const cat = catItem.querySelector(".category-name").textContent;
    $.catDd.open = false;
    history.pushState(null, null, `/posts?category=${encodeURIComponent(cat)}`);
    router();
  }
});

// Render 404 page
function renderNotFound() {
  $.cont.replaceChildren();
  $.otl.replaceChildren();
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
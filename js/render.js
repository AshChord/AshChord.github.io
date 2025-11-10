// Elements for the current page layout
const feed = document.querySelector('.feed');
const content = document.querySelector('.content');
const tableOfContents = document.querySelector('.table-of-contents');

// Renders the feed
function renderFeed(postsToRender = posts, currentPage = 1) {
  feed.innerHTML = '';
  content.innerHTML = '';
  tableOfContents.innerHTML = '';

  // Calculate the start and end indices for the posts on the current page
  const startIndex = (currentPage - 1) * pageState.postsPerPage;
  const endIndex = startIndex + pageState.postsPerPage;
  const postsForCurrentPage = postsToRender.slice(startIndex, endIndex);

  // Show a message if no posts are found
  if (postsForCurrentPage.length === 0) {
    feed.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
    return;
  }

  // Loop through each post and create the feed item
  postsForCurrentPage.forEach(post => {
    const feedItem = document.createElement('div');
    feedItem.classList.add('feed-item');

    feedItem.innerHTML = `
      <img src="/data/${post.title}/thumbnail.png" alt="${post.title}" class="thumbnail">
      <h2 class="title">${post.title}</h2>
      <p class="excerpt">${post.excerpt}</p>
      <div class="category-list">
        ${post.categories.map(category => `<span class="category">${category}</span>`).join('')}
      </div>
      <p class="date">${post.date}</p>
    `;

    // Handle routing when the post is clicked
    feedItem.addEventListener('click', (event) => {
      if (!event.target.classList.contains('category')) {
        history.pushState(null, null, `/posts/${encodeURIComponent(post.title)}`);
        router();
      }
    });

    feed.appendChild(feedItem);
  });
}

// Render the content of a single post
async function renderContent(post) {
  feed.innerHTML = '';
  content.innerHTML = '';
  tableOfContents.innerHTML = '';
  pagination.innerHTML = '';

  // Create and append the post header
  const postHeader = document.createElement('div');
  postHeader.classList.add('post-header');
  postHeader.innerHTML = `
    <div class="category-list">
      ${post.categories.map(category => `<span class="category">${category}</span>`).join('')}
    </div>
    <h1 class="title">${post.title}</h1>
    <p class="date">${post.date}</p>
    <img src="/data/${post.title}/thumbnail.png" alt="${post.title}" class="thumbnail">
  `;
  content.appendChild(postHeader);

  // Fetch and parse the markdown content of the post
  const markdownContent = await fetch(`/data/${post.title}/${post.title}.md`);
  const markdownText = (await markdownContent.text()).replace(/^---\smeta\n([\s\S]*?)\n---/, '').trim();

  // Convert markdown to HTML and append to post body
  const postBody = document.createElement('div');
  postBody.classList.add('post-body');
  postBody.innerHTML = marked.parse(markdownText);
  content.appendChild(postBody);

  // Apply syntax highlighting to code blocks
  hljs.highlightAll();

  // Add additional functionalities
  addCopyButtons(postBody);
  makeCodeBreakable(postBody);
  renderTableOfContents();
}

// Add copy button for each code block
function addCopyButtons(postBody) {
  postBody.querySelectorAll("pre").forEach((pre) => {
    const code = pre.textContent;

    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-button");

    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(code);
      copyButton.classList.add("copied");

      setTimeout(() => {
        copyButton.classList.remove("copied");
      }, 2000);
    });

    pre.appendChild(copyButton);
  });
}

// Breaks long lines of code into smaller chunks for better readability
function makeCodeBreakable(postBody) {
  const isAlphanumeric = char => /[a-zA-Z0-9\s]/.test(char);

  for (const code of postBody.querySelectorAll('code')) {
    if (code.closest('pre')) continue;

    const codeText = code.textContent;
    let breakableCodeText = '';

    for (let i = 0; i < codeText.length; i++) {
      const currentChar = codeText[i];
      if (i > 0) {
        const prevChar = codeText[i - 1];
        if (
          (isAlphanumeric(prevChar) !== isAlphanumeric(currentChar)) ||
          (!isAlphanumeric(prevChar) && !isAlphanumeric(currentChar))
        ) breakableCodeText += '<wbr>';
      }
      breakableCodeText += currentChar;
    }

    code.innerHTML = breakableCodeText;
  }
}

// Render table of contents based on the headings in the post
function renderTableOfContents() {
  const headings = content.querySelectorAll('h3, h4, h5, h6');
  const contentsList = document.createElement('ul');

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `${index}`;
    }

    const listItem = document.createElement('li');
    const indentationLevel = parseInt(heading.tagName.substring(1)) - 3;
    listItem.style.paddingLeft = `${indentationLevel * 12}px`;

    const linkToHeading = document.createElement('a');
    linkToHeading.href = `#${heading.id}`;
    linkToHeading.textContent = heading.textContent;

    // Smooth scroll to heading on click
    linkToHeading.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(heading.id).scrollIntoView({ behavior: 'smooth' });
    });

    listItem.appendChild(linkToHeading);
    contentsList.appendChild(listItem);
  });

  tableOfContents.appendChild(contentsList);

  // Optimize scroll event
  let isPending = false;

  window.addEventListener('scroll', () => {
    if (!isPending) {
      window.requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        let currentIndex = -1;
        headings.forEach((heading, i) => {
          if (scrollPosition >= heading.offsetTop - 10) {
            currentIndex = i;
          }
        });
        // Highlight the link for the current index
        tableOfContents.querySelectorAll('a').forEach((link, i) => {
          link.classList.toggle('active', i === currentIndex);
        });
        isPending = false;
      });
      isPending = true;
    }
  });
}

// Render category dropdown menu 
function renderCategoryDropdown() {
  // Calculate the number of posts per category
  const categoryCounts = posts
    .flatMap(post => post.categories)
    .reduce((counts, category) => {
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

  // Convert to an array of objects { name, count } and sort by name
  const categoryCountsArray = Object.entries(categoryCounts)
    .map(([categoryName, count]) => ({ categoryName, count }))
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  // Create category itmes based on the calculated data
  const categoryMenu = document.querySelector(".category-menu");
  categoryMenu.innerHTML = categoryCountsArray.map(category => `
    <div class="category-menu-item">
      <span class="category-name">${category.categoryName}</span>
      <span class="count">(${category.count})</span>
    </div>
  `).join('');

  // Handle routing when a category item is clicked
  const categoryDropdown = document.querySelector(".category-dropdown");
  const categoryDropdownButton = categoryDropdown.querySelector(".category-dropdown-button");
  categoryMenu.addEventListener('click', (event) => {
    const categoryItem = event.target.closest('.category-menu-item');
    if (categoryItem) {
      const categoryName = categoryItem.querySelector(".category-name").textContent;
      history.pushState(null, null, `/posts?category=${encodeURIComponent(categoryName)}`);
      router();
    }
  });

  // Toggle category dropdown
  document.addEventListener('click', (event) => {
    if (categoryDropdownButton.contains(event.target)) {
      categoryDropdown.classList.toggle('active');
    }
    else if (categoryDropdown.classList.contains('active') && !categoryDropdown.contains(event.target)) {
      categoryDropdown.classList.remove('active');
    }
  });
}

// Render 404 page
function renderNotFound() {
  content.innerHTML = '';
  tableOfContents.innerHTML = '';
  pagination.innerHTML = '';

  feed.innerHTML = `
    <div class="not-found">
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
    </div>
  `;
}
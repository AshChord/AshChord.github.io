const feed = document.querySelector('.feed');
const content = document.querySelector('.content');

function renderFeed(postsToRender = posts, currentPage = 1) {
  feed.innerHTML = '';
  content.innerHTML = '';

  // 현재 페이지에 해당하는 게시물 인덱스를 계산하여 게시물 추출
  const startIndex = (currentPage - 1) * pageState.postsPerPage;
  const endIndex = startIndex + pageState.postsPerPage;
  const postsForCurrentPage = postsToRender.slice(startIndex, endIndex);

  // 검색 결과가 없을 때 메시지
  if (postsForCurrentPage.length === 0) {
    feed.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
    return;
  }

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

    feedItem.addEventListener('click', (event) => {
      if (!event.target.classList.contains('category')) {
        history.pushState(null, null, `/posts/${encodeURIComponent(post.title)}`);
        router();
      }
    });

    feed.appendChild(feedItem);
  });
}

async function renderContent(post) {
  // .feed, .content, .pagination 초기화
  feed.innerHTML = '';
  content.innerHTML = '';
  pagination.innerHTML = '';

  // 게시물 헤더 생성
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

  // 마크다운 불러오기 및 변환
  const markdownContent = await fetch(`/data/${post.title}/${post.title}.md`);
  const markdownText = (await markdownContent.text()).replace(/^---\smeta\n([\s\S]*?)\n---/, '').trim();

  // 변환된 HTML 삽입
  const postBody = document.createElement('div');
  postBody.classList.add('post-body');
  postBody.innerHTML = marked.parse(markdownText);
  content.appendChild(postBody);

  // 코드 하이라이트
  hljs.highlightAll();

  // 부가 요소 추가
  addCopyButtons(postBody);
  makeCodeBreakable(postBody);
}

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
        ) {
          breakableCodeText += '<wbr>';
        }
      }
      breakableCodeText += currentChar;
    }

    code.innerHTML = breakableCodeText;
  }
}

function renderCategoryDropdown() {
  // --- 1. 데이터 처리: 카테고리별 게시물 수를 계산하고 정렬합니다. ---
  const categoryCounts = posts
    .flatMap(post => post.categories.map(cat => cat.toLowerCase())) // 모든 카테고리를 소문자로 변환해 하나의 배열로 합침
    .reduce((counts, category) => {
      counts[category] = (counts[category] || 0) + 1; // 각 카테고리의 개수를 셈
      return counts;
    }, {});

  // { name, count } 형태의 객체 배열로 변환 후, 이름순으로 정렬
  const categoryCountsArray = Object.entries(categoryCounts)
    .map(([categoryName, count]) => ({ categoryName, count }))
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  // --- 2. UI 렌더링: 계산된 데이터를 기반으로 HTML을 생성하고 삽입합니다. ---
  const categoryMenu = document.querySelector(".category-menu");

  // map과 join을 사용해 전체 HTML 문자열을 한 번에 생성
  categoryMenu.innerHTML = categoryCountsArray.map(category => `
    <div class="category-menu-item">
      <span class="category-name">${category.categoryName}</span>
      <span class="count">(${category.count})</span>
    </div>
  `).join('');

  // --- 3. 이벤트 리스너 등록 ---
  const categoryDropdown = document.querySelector(".category-dropdown");
  const categoryDropdownButton = categoryDropdown.querySelector(".category-dropdown-button");

  // [개선] 카테고리 클릭 이벤트 (이벤트 위임)
  // aside 전체에 리스너를 한 번만 등록해서 모든 하위 카테고리의 클릭을 처리합니다.
  categoryMenu.addEventListener('click', (event) => {
    const categoryItem = event.target.closest('.category-menu-item');
    if (categoryItem) {
      const categoryName = categoryItem.querySelector(".category-name").textContent;
      history.pushState(null, null, `/posts?category=${encodeURIComponent(categoryName)}`);
      router();
    }
  });

  // [유지] 메뉴 토글 및 바깥 클릭 시 닫기 이벤트
  // 이 로직은 창 전체의 클릭을 감지해야 하므로 window에 등록합니다.
  document.addEventListener('click', (event) => {
    // 메뉴 버튼 자체를 클릭한 경우 토글
    if (categoryDropdownButton.contains(event.target)) {
      categoryDropdown.classList.toggle('active');
    }
    // 메뉴가 열려있고, 메뉴 영역 바깥을 클릭한 경우 닫기
    else if (categoryDropdown.classList.contains('active') && !categoryDropdown.contains(event.target)) {
      categoryDropdown.classList.remove('active');
    }
  });
}

// 404 Not Found 페이지를 표시하는 함수
function renderNotFound() {
  content.innerHTML = '';
  pagination.innerHTML = '';

  feed.innerHTML = `
    <div class="not-found">
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
    </div>
  `;
}
// 게시물 한 페이지에 표시할 수
const POSTS_PER_PAGE = 6; // 예시로 6개로 설정

function renderPostList(postsToRender = posts, currentPage = 1) {
  const postList = document.querySelector('.post-list');
  const content = document.querySelector('.content');

  postList.innerHTML = '';
  content.innerHTML = '';

  // 현재 페이지에 해당하는 게시물 인덱스를 계산하여 게시물 추출
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const postsForCurrentPage = postsToRender.slice(startIndex, endIndex);

  // 게시물 렌더링
  postsForCurrentPage.forEach(post => {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card');
    postCard.innerHTML = `
      <img src="${post.thumbnail || '/assets/thumbnail.png'}" alt="${post.title}" class="thumbnail">
      <h2 class="title">${post.title}</h2>
      <p class="description">${post.description}</p>
      <div class="category-list">
        ${post.categories.map(cat => `<span class="category">${cat}</span>`).join('')}
      </div>
      <p class="date">${post.date}</p>
    `;
    // 클릭 시 URL을 변경하고 router() 호출
    postCard.addEventListener('click', (event) => {
      if (event.target.className !== 'category') {
        const postTitle = encodeURIComponent(post.title);
        history.pushState(null, null, `/posts/${postTitle}`);
        router();
      } // 라우터 호출로 해당 게시물의 상세 내용 렌더링
    });
    postList.appendChild(postCard);
  });

  // 검색 결과가 없을 때 메시지
  if (postsForCurrentPage.length === 0) {
    postList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
  }
}

async function renderContent(post) {
  const postList = document.querySelector('.post-list');
  const content = document.querySelector('.content');
  const pagination = document.querySelector(".pagination");


  // .post-list를 빈 요소로 만들기
  postList.innerHTML = '';
  pagination.innerHTML = '';

  // .content에 게시물 내용 렌더링
  const response = await fetch(`/posts/${post.title}.md`);
  const markdownContent = await response.text();

  content.innerHTML = marked.parse(markdownContent);
  hljs.highlightAll();

  // 테이블 감싸는 div 추가
  const tables = content.querySelectorAll("table");
  tables.forEach((table) => {
    // table을 감쌀 div 생성
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper"); // CSS 클래스 추가

    // table을 tableWrapper로 감싸기
    table.parentNode.insertBefore(tableWrapper, table);
    tableWrapper.appendChild(table);
  });
}

function renderBlogCategory() {
  /*
    posts에서 카테고리를 소문자로 추출하여 카테고리 목록을 aside 항목으로 렌더링
    */
  const categoryList = {};
  posts.forEach((post) => {
    if (post.categories) { // 카테고리가 존재할 경우
      post.categories.forEach((category) => { // 여러 카테고리를 순회
        const categoryName = category.toLowerCase(); // 카테고리 이름을 소문자로 변환
        if (categoryList[categoryName]) {
          categoryList[categoryName] += 1; // 카테고리의 개수 증가
        } else {
          categoryList[categoryName] = 1; // 새로운 카테고리 추가
        }
      });
    }
  });
  const categoryArray = Object.keys(categoryList);
  categoryArray.sort();

  const categoryContainer = document.querySelector("aside");
  const categoryWrapper = document.querySelector(".category-search");
  const categoryTitle = categoryWrapper.querySelector(".category-search-title");
  const categoryButton = document.querySelector(".category-search-button");
  window.addEventListener("click", (evt) => {
    // categoryButton을 눌렀을 때
    if (evt.target === categoryButton) {
      categoryWrapper.classList.toggle("active"); // 'active' 클래스 토글
      categoryTitle.classList.toggle("active");
      categoryContainer.classList.toggle("active");
      categoryButton.classList.toggle("active");
    } else if (
      categoryWrapper.classList.contains("active") &&
      !categoryWrapper.contains(evt.target)
    ) {
      categoryWrapper.classList.remove("active"); // 'active' 클래스 제거
      categoryTitle.classList.remove("active");
      categoryContainer.classList.remove("active");
      categoryButton.classList.remove("active");
    }
  });

  categoryArray.forEach((category) => {
    // category div
    const categoryItem = document.createElement("div");

    // category count span
    const categoryCount = document.createElement("span");

    categoryItem.textContent = category;
    categoryCount.textContent = `(${categoryList[category]})`;
    categoryItem.onclick = () => {
      history.pushState(null, null, `/posts?category=${encodeURIComponent(category)}`);
      router();
    };


    categoryItem.appendChild(categoryCount);
    categoryContainer.appendChild(categoryItem);
  });
}
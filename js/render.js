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
      <img src="/data/${post.title}/thumbnail.png" alt="${post.title}" class="thumbnail">
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

  // 게시물 메타데이터 (제목, 카테고리, 날짜) 렌더링
  const postHeader = document.createElement('div');
  postHeader.classList.add('post-header');

  postHeader.innerHTML = `
      <div class="category-list">
        ${post.categories.map(cat => `<span class="category">${cat}</span>`).join('')}
      </div>
      <h1 class="title">${post.title}</h1>
      <p class="date">${post.date}</p>
      <img src="/data/${post.title}/thumbnail.png" alt="${post.title}" class="thumbnail">

    `;

  // .content에 게시물 메타데이터 추가
  content.innerHTML = ''; // 기존 내용 지우기
  content.appendChild(postHeader);

  // .content에 게시물 내용 렌더링
  const response = await fetch(`/data/${post.title}/${post.title}.md`);
  const markdownContent = await response.text();

  // 마크다운을 HTML로 변환하여 추가
  const postBody = document.createElement('div');
  postBody.classList.add('post-body');
  postBody.innerHTML = marked.parse(markdownContent);
  content.appendChild(postBody);

  hljs.highlightAll();

  // 코드 블록에 복사 버튼 추가
  postBody.querySelectorAll("pre").forEach((pre) => {
    const code = pre.textContent; // 코드 내용 가져오기

    // 복사 버튼 생성
    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-button");

    // 복사 버튼 클릭 이벤트
    copyButton.addEventListener("click", async function (event) {
      await navigator.clipboard.writeText(code); // 클립보드에 코드 복사

      // 버튼 위치 계산
      const buttonRect = copyButton.getBoundingClientRect();
      const buttonTop = buttonRect.top + window.scrollY; // 버튼의 상단 위치
      const buttonLeft = buttonRect.left + window.scrollX; // 버튼의 좌측 위치

      // 복사 성공 메시지 (toast) 생성
      const toast = document.createElement('div');
      toast.classList.add('toast');
      toast.textContent = '복사함';

      // 토스트 메시지 위치 설정
      toast.style.position = 'absolute'; // 절대 위치
      toast.style.top = `${buttonTop - 50}px`; // 버튼보다 50px 위
      toast.style.left = `${buttonLeft + buttonRect.width / 2 - toast.offsetWidth / 2}px`; // 버튼 중앙에 맞춤

      content.appendChild(toast); // content 요소에 추가

      // 1초 후에 토스트 메시지 보이도록 클래스 추가
      setTimeout(() => {
        toast.classList.add('show');
      }, 100);

      // 3초 후에 메시지 숨기기
      setTimeout(() => {
        toast.classList.remove('show');
      }, 1000); // 메시지가 3초 동안 보인 후

      // 3.5초 후에 실제로 toast 요소를 제거
      setTimeout(() => {
        toast.remove();
      }, 2000); // 애니메이션이 끝난 후 제거
    });

    // pre 요소 안에 복사 버튼 삽입
    pre.appendChild(copyButton);
  });

  // 테이블 감싸는 div 추가
  postBody.querySelectorAll("table").forEach((table) => {
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

document.querySelector(".blog-title").addEventListener("click", () => {
  window.history.pushState({}, "", "/"); // URL 변경
  router(); // 라우터 실행
});

document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    const path = item.textContent.toLowerCase(); // 텍스트를 URL 경로로 변환
    window.history.pushState({}, "", `/${path}`); // URL 변경
    router(); // 라우터 실행
  });
});

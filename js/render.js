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

  // .post-list를 빈 요소로 만들기
  postList.innerHTML = '';

  // .content에 게시물 내용 렌더링
  const response = await fetch(`/posts/${post.title}.md`);
  const markdownContent = await response.text();

  content.innerHTML = marked.parse(markdownContent);
  hljs.highlightAll();
}
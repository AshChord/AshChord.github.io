function renderPostList(postsToRender = posts) {
  const postList = document.querySelector('.post-list');
  const content = document.querySelector('.content');

  // .content를 빈 요소로 만들기
  content.innerHTML = '';

  // .post-list를 채우기
  postList.innerHTML = '';

  postsToRender.forEach(post => {
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
        const postTitle = post.title.toLowerCase().replace(/\s+/g, '-');
        history.pushState({ postId: postTitle }, post.title, `/posts/${postTitle}`);
        router();
      } // 라우터 호출로 해당 게시물의 상세 내용 렌더링
    });
    postList.appendChild(postCard);
  });

  if (postsToRender.length === 0) {
    postList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
  }
}

async function renderContent(post) {
  const postList = document.querySelector('.post-list');
  const content = document.querySelector('.content');

  // .post-list를 빈 요소로 만들기
  postList.innerHTML = '';

  // .content에 게시물 내용 렌더링
  const response = await fetch(`/posts/${post.title.toLowerCase().replace(/\s+/g, '-')}.md`);
  const markdownContent = await response.text();

  content.innerHTML = marked.parse(markdownContent);
  hljs.highlightAll();
}

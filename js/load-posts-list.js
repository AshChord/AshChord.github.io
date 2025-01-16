// 게시물 데이터를 저장할 변수
let posts = [];

// 게시물 데이터를 로드하는 함수
async function loadPosts() {
  try {
    const response = await fetch('/posts/post-info.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    posts = await response.json();
    renderPosts(posts); // 모든 게시물 초기 로드
  } catch (error) {
    console.error('Error loading posts:', error);
    const postsList = document.querySelector('.posts-list');
    postsList.innerHTML = '<p class="error">게시물을 불러오는데 실패했습니다.</p>';
  }
}

// 게시물을 렌더링하는 함수
function renderPosts(postData) {
  const postsList = document.querySelector('.posts-list');
  postsList.innerHTML = ''; // 기존 게시물 제거
  postData.forEach(post => {
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
    
    // 포스트 카드 클릭 시 마크다운 파일 로드
    postCard.addEventListener('click', () => loadMarkdown(post.title));

    postsList.appendChild(postCard);
  });
}

// 마크다운 파일을 불러와서 HTML로 변환하고 contents 요소에 삽입하는 함수
async function loadMarkdown(postTitle) {
  try {
    // 제목에 맞는 마크다운 파일 경로 (예: /posts/{title}.md)
    const markdownUrl = `/posts/${postTitle.toLowerCase().replace(/\s+/g, '-')}.md`;

    const response = await fetch(markdownUrl);
    if (!response.ok) {
      throw new Error('Markdown 파일을 불러오는 데 실패했습니다.');
    }
    const markdownText = await response.text();

    // 마크다운을 HTML로 변환
    const htmlContent = marked.parse(markdownText);

    // contents 클래스를 가진 요소에 HTML 삽입
    const contents = document.querySelector('.contents');
    contents.innerHTML = htmlContent;

    // 코드 블록 하이라이팅
    hljs.highlightAll();
  } catch (error) {
    console.error('Error loading markdown:', error);
    const contents = document.querySelector('.contents');
    contents.innerHTML = '<p class="error">게시물 내용을 불러오는데 실패했습니다.</p>';
  }
}

// 검색 기능 처리 함수
function handleSearch(event) {
  if (event.type === 'keypress' && event.key !== 'Enter') {
    return; // 키보드 이벤트일 때 Enter 키가 아니면 종료
  }

  const searchInput = document.querySelector('.input-field');
  const query = searchInput.value.toLowerCase(); // 검색어를 소문자로 변환

  // 제목과 설명 모두에서 검색어 포함 여부 확인
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query)
  );

  renderPosts(filteredPosts); // 필터링된 게시물 렌더링

  // 검색 결과가 없을 때 메시지 표시
  const postsList = document.querySelector('.posts-list');
  if (filteredPosts.length === 0) {
    postsList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
  }

  // 검색 후 입력란 자동 비우기
  searchInput.value = '';
}


// 페이지 로드 시 게시물 로드 및 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();

  const searchInput = document.querySelector('.input-field');
  const searchButton = document.querySelector('.submit-button');

  // Enter 키 이벤트
  searchInput.addEventListener('keypress', handleSearch);

  // 버튼 클릭 이벤트
  searchButton.addEventListener('click', handleSearch);
});

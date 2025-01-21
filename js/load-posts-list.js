// 게시물 데이터를 저장할 변수
let posts = [];

// 게시물 데이터를 로드하는 함수
async function initialize() {
  try {
    const response = await fetch('/posts/post-info.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    posts = await response.json();
    loadPostList(); // 초기 게시물 로드

    // 이벤트 리스너 등록
    const searchInput = document.querySelector('.input-field');
    const searchButton = document.querySelector('.submit-button');
    const categoryButtons = document.querySelectorAll('.category');

    // 검색창에서 Enter 키 입력 시 검색
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        search(searchInput.value); // 키워드로 검색
      }
    });

    // 검색 버튼 클릭 시 검색
    searchButton.addEventListener('click', () => {
      search(searchInput.value); // 키워드로 검색
    });

    // 카테고리 버튼 클릭 시 해당 카테고리로 검색
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        search('', button.textContent); // 카테고리로 검색
      });
    });

  } catch (error) {
    console.error('Error loading posts:', error);
    const postList = document.querySelector('.post-list');
    postList.innerHTML = '<p class="error">게시물을 불러오는데 실패했습니다.</p>';
  }
}

// 게시물을 렌더링하는 함수
function loadPostList(searchResult = null) {
  const postList = document.querySelector('.post-list');
  postList.innerHTML = ''; // 기존 게시물 제거

  const filteredPosts = searchResult || posts; // searchResult가 있으면 그걸, 없으면 전체 게시물 사용

  filteredPosts.forEach(post => {
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
    postCard.addEventListener('click', () => loadPostContent(post.title));

    postList.appendChild(postCard);
  });

  // 검색 결과가 없을 때 메시지 표시
  if (filteredPosts.length === 0) {
    postList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
  }
}

// 게시물의 내용을 content 요소에 렌더링하는 함수
async function loadPostContent(postTitle) {
  try {
    const markdownUrl = `/posts/${postTitle.toLowerCase().replace(/\s+/g, '-')}.md`;

    const response = await fetch(markdownUrl);
    if (!response.ok) {
      throw new Error('Markdown 파일을 불러오는 데 실패했습니다.');
    }
    const markdownText = await response.text();

    // 마크다운을 HTML로 변환
    const htmlContent = marked.parse(markdownText);

    // content 요소에 HTML 삽입
    const content = document.querySelector('.content');
    content.innerHTML = htmlContent;

    // post-list 숨김 처리
    const postList = document.querySelector('.post-list');
    postList.style.display = 'none';

    // 코드 블록 하이라이팅
    hljs.highlightAll();

    // URL 업데이트
    const newUrl = `/posts/${postTitle.toLowerCase().replace(/\s+/g, '-')}`;
    history.pushState({ postTitle }, postTitle, newUrl);

  } catch (error) {
    console.error('Error loading markdown:', error);
    const content = document.querySelector('.content');
    content.innerHTML = '<p class="error">게시물 내용을 불러오는데 실패했습니다.</p>';
  }
}

// 검색 함수
function search(keyword = '', category = '') {
  // 제목에 keyword가 포함된 게시물 찾기
  const searchResult = posts.filter(post => {
    const matchesKeyword = keyword ? post.title.toLowerCase().includes(keyword.toLowerCase()) : true;
    const matchesCategory = category ? post.categories.includes(category) : true;
    return matchesKeyword && matchesCategory;
  });

  // 검색된 결과로 게시물 목록 렌더링
  loadPostList(searchResult);
}

// 페이지 로드 시 initialize 함수 호출
document.addEventListener('DOMContentLoaded', initialize);

// 브라우저 히스토리 상태 변경 시 이벤트
window.addEventListener('popstate', (event) => {
  const content = document.querySelector('.content');
  const postList = document.querySelector('.post-list');

  if (event.state && event.state.postTitle) {
    // 특정 게시물이 로드된 상태로 이동
    loadPostContent(event.state.postTitle);
  } else {
    // 게시물 목록을 보여주는 초기 상태로 복원
    postList.style.display = 'grid';
    content.innerHTML = '';
  }
});
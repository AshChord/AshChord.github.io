// 페이지네이션을 위한 기본 변수 설정
const POSTS_PER_PAGE = 6; // 한 페이지에 표시할 게시물 수
let currentPage = 1; // 현재 페이지
let totalPage = 1; // 총 페이지 수
let posts = []; // 모든 게시물 데이터 (로딩 후 채워짐)

// 페이지네이션 초기화 함수
function initPagination(totalPosts) {
  totalPage = Math.ceil(totalPosts / POSTS_PER_PAGE); // 총 페이지 계산
  const pagination = document.querySelector(".pagination"); // 클래스 선택
  pagination.style.display = "flex";

  const prevButton = createPaginationButton("Prev", "page-prev", handlePrevPage);
  const nextButton = createPaginationButton("Next", "page-next", handleNextPage);

  const pageNav = document.createElement("nav");
  pageNav.setAttribute("id", "pagination-list");

  const pageNumbersFragment = document.createDocumentFragment();
  for (let i = 1; i <= totalPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.classList.add("page-number");
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => handlePageChange(i));
    pageNumbersFragment.appendChild(pageButton);
  }
  pageNav.appendChild(pageNumbersFragment);

  pagination.append(prevButton, pageNav, nextButton);
}

// 페이지 변경 처리
function renderPagination() {
  const prevButton = document.getElementById("page-prev");
  const nextButton = document.getElementById("page-next");
  
  // 이전/다음 버튼의 활성화 여부 처리
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPage;
  
  // 페이지 버튼 상태 업데이트
  const pageNav = document.querySelector(".pagination nav"); // 클래스 선택
  const pageButtons = pageNav.querySelectorAll("button");
  pageButtons.forEach((button, index) => {
    const pageNumber = index + 1;
    button.classList.toggle("active", pageNumber === currentPage);
  });
}

// 페이지 버튼 클릭 시 처리 함수
function handlePageChange(pageNumber) {
  currentPage = pageNumber;
  renderPostList(posts); // 페이지에 맞는 게시물 리스트 렌더링 (render.js에서 수정 예정)
  renderPagination(); // 페이지네이션 상태 업데이트
}

// 이전 페이지 버튼 클릭 시 처리
function handlePrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPostList(posts); // 페이지에 맞는 게시물 리스트 렌더링 (render.js에서 수정 예정)
    renderPagination();
  }
}

// 다음 페이지 버튼 클릭 시 처리
function handleNextPage() {
  if (currentPage < totalPage) {
    currentPage++;
    renderPostList(posts); // 페이지에 맞는 게시물 리스트 렌더링 (render.js에서 수정 예정)
    renderPagination();
  }
}

// 게시물 목록 렌더링 함수
// render.js에서 수정 예정

// 페이지네이션 버튼 생성
function createPaginationButton(text, id, onClickHandler) {
  const button = document.createElement("button");
  button.setAttribute("id", id);
  button.textContent = text;
  button.addEventListener("click", onClickHandler);
  return button;
}

// 게시물 데이터 로드 후 초기화
async function initializePagination() {
  const response = await fetch('/posts/post-info.json');
  posts = await response.json();
  
  initPagination(posts.length); // 총 페이지 수 계산 후 페이지네이션 초기화
  renderPostList(posts); // 첫 페이지 게시물 렌더링 (render.js에서 수정 예정)
  renderPagination(); // 페이지네이션 상태 렌더링
}

// 페이지 초기화 실행
initializePagination();

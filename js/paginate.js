let currentPage = 1;

// 페이지네이션 처리 함수들
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

function renderPagination() {
  const prevButton = document.getElementById("page-prev");
  const nextButton = document.getElementById("page-next");

  // 이전/다음 버튼의 활성화 여부 처리
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPage;

  // 페이지 버튼 상태 업데이트
  const pageNav = document.querySelector(".pagination nav");
  const pageButtons = pageNav.querySelectorAll("button");
  pageButtons.forEach((button, index) => {
    const pageNumber = index + 1;
    button.classList.toggle("active", pageNumber === currentPage);
  });
}

function handlePageChange(pageNumber) {
  currentPage = pageNumber;
  renderPostList(posts, currentPage); // currentPage를 함께 전달
  renderPagination(); // 페이지네이션 상태 업데이트
}

function handlePrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPostList(posts, currentPage); // currentPage를 함께 전달
    renderPagination();
  }
}

function handleNextPage() {
  if (currentPage < totalPage) {
    currentPage++;
    renderPostList(posts, currentPage); // currentPage를 함께 전달
    renderPagination();
  }
}

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
  initPagination(posts.length); // 총 페이지 수 계산 후 페이지네이션 초기화
  renderPostList(posts); // 첫 페이지 게시물 렌더링 (render.js에서 수정 예정)
  renderPagination(); // 페이지네이션 상태 렌더링
}
let currentPage;
let currentGroup = 1; // 현재 페이지 그룹 (예: 1~5, 6~10)

// 페이지네이션 초기화
function initPagination(totalPosts) {
  const totalPage = Math.ceil(totalPosts / POSTS_PER_PAGE);
  currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
  currentGroup = Math.ceil(currentPage / 5); // 현재 페이지가 속한 그룹 계산

  const pagination = document.querySelector(".pagination");

  // 페이지 개수가 1개 이하면 페이지네이션 숨김
  if (totalPage <= 1) {
    pagination.style.display = "none";
    return;
  } else {
    pagination.style.display = "flex";
  }

  // 페이지네이션 요소가 비어 있으면 버튼 추가
  if (pagination.innerHTML === "") {
    pagination.innerHTML = ""; // 기존 버튼 제거 후 다시 생성
    const firstButton = createPaginationButton("page-first", handleFirstPage);
    const prevButton = createPaginationButton("page-prev", handlePrevGroup);
    const nextButton = createPaginationButton("page-next", handleNextGroup);
    const lastButton = createPaginationButton("page-last", handleLastPage);

    const pageList = document.createElement("div");
    pageList.classList.add("page-list");

    pagination.append(firstButton, prevButton, pageList, nextButton, lastButton);
  }

  updatePaginationUI(totalPage);
}

// 페이지 UI 업데이트 (DOM 접근 최적화)
function updatePaginationUI(totalPage) {
  const pageList = document.querySelector(".page-list");
  pageList.innerHTML = ""; // 기존 페이지 버튼 제거

  const startPage = (currentGroup - 1) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPage); // 최대 5개씩만 표시

  // 페이지 버튼 생성
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.classList.add("page-number");
    pageButton.textContent = i;
    if (i === currentPage) pageButton.classList.add("active");

    pageButton.addEventListener("click", () => handlePageChange(i));
    pageList.appendChild(pageButton);
  }

  // 현재 활성화된 버튼만 업데이트
  document.querySelectorAll(".page-number").forEach(button => {
    button.classList.remove("active");
    if (parseInt(button.textContent) === currentPage) {
      button.classList.add("active");
    }
  });

  // Prev, Next, First, Last 버튼 상태 업데이트
  document.querySelector(".page-first").disabled = currentGroup === 1;
  document.querySelector(".page-prev").disabled = currentGroup === 1;
  document.querySelector(".page-next").disabled = endPage === totalPage;
  document.querySelector(".page-last").disabled = endPage === totalPage;
}

// 페이지 변경 함수
function handlePageChange(pageNumber) {
  currentPage = pageNumber;
  currentGroup = Math.ceil(pageNumber / 5); // 해당 페이지가 속한 그룹으로 이동
  updatePageState();
}

// 첫 번째 페이지로 이동
function handleFirstPage() {
  currentPage = 1;
  currentGroup = 1;
  updatePageState();
}

// 마지막 페이지로 이동
function handleLastPage() {
  const totalPage = Math.ceil(posts.length / POSTS_PER_PAGE);
  currentPage = totalPage;
  currentGroup = Math.ceil(totalPage / 5);
  updatePageState();
}

// 이전 그룹으로 이동
function handlePrevGroup() {
  if (currentGroup > 1) {
    currentGroup--;
    currentPage = (currentGroup - 1) * 5 + 1; // 이전 그룹의 첫 페이지
    updatePageState();
  }
}

// 다음 그룹으로 이동
function handleNextGroup() {
  const totalPage = Math.ceil(posts.length / POSTS_PER_PAGE);
  const maxGroup = Math.ceil(totalPage / 5);
  if (currentGroup < maxGroup) {
    currentGroup++;
    currentPage = (currentGroup - 1) * 5 + 1; // 다음 그룹의 첫 페이지
    updatePageState();
  }
}

// URL과 UI 업데이트
function updatePageState() {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("page", currentPage);
  window.history.pushState({}, "", `/posts?${searchParams.toString()}`);

  updatePaginationUI(Math.ceil(posts.length / POSTS_PER_PAGE));
  router();
}

// 페이지네이션 버튼 생성
function createPaginationButton(type, onClickHandler) {
  const button = document.createElement("button");
  button.classList.add(type);
  button.addEventListener("click", onClickHandler);
  return button;
}

let currentPage;


function initPagination(totalPosts) {
  totalPage = Math.ceil(totalPosts / POSTS_PER_PAGE);
  currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1; // 맨 윗줄에서 page 값 읽어오기

  const pagination = document.querySelector(".pagination");
  pagination.style.display = "flex"; // 페이지네이션 스타일 설정

  // 페이지네이션 요소가 비어 있으면 내용 갱신
  if (pagination.innerHTML === "") {
    const prevButton = createPaginationButton("Prev", "page-prev", handlePrevPage);
    const nextButton = createPaginationButton("Next", "page-next", handleNextPage);

    const pageList = document.createElement("div");
    pageList.classList.add("page-list");

    pagination.append(prevButton, pageList, nextButton);
  } else {
    // 기존 페이지 번호 제거
    const pageList = pagination.querySelector(".page-list");
    pageList.innerHTML = "";
  }

  const pageListFragment = document.createDocumentFragment();
  for (let i = 1; i <= totalPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.classList.add("page-number");
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => handlePageChange(i));
    pageListFragment.appendChild(pageButton);
  }

  const pageList = pagination.querySelector(".page-list");
  pageList.appendChild(pageListFragment);

  // 페이지 상태 렌더링
  const prevButtonElement = document.getElementById("page-prev");
  const nextButtonElement = document.getElementById("page-next");

  prevButtonElement.disabled = currentPage === 1;
  nextButtonElement.disabled = currentPage === totalPage;
}

function handlePageChange(pageNumber) {
  currentPage = pageNumber;
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set('page', currentPage); // page 파라미터 업데이트
  window.history.pushState({}, '', `/posts?${searchParams.toString()}`);
  router();
}

function handlePrevPage() {
  if (currentPage > 1) {
    currentPage--;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', currentPage);
    window.history.pushState({}, '', `/posts?${searchParams.toString()}`);
    router();
  }
}

function handleNextPage() {
  const totalPage = Math.ceil(posts.length / POSTS_PER_PAGE);
  if (currentPage < totalPage) {
    currentPage++;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', currentPage);
    window.history.pushState({}, '', `/posts?${searchParams.toString()}`);
    router();
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

const pagination = document.querySelector('.pagination');
let pageState = { currentPage: 1, totalPages: 0, pagesPerGroup: 5, postsPerPage: 6 };

function initPagination(totalPosts) {
  pageState.totalPages = Math.ceil(totalPosts / pageState.postsPerPage);
  pageState.currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

  renderPagination();

  pagination.removeEventListener('click', updatePagination)
  pagination.addEventListener('click', updatePagination)
}

function renderPagination() {
  if (pageState.totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  const { currentPage, totalPages, pagesPerGroup } = pageState;
  const currentGroup = Math.ceil(currentPage / pagesPerGroup);
  const startPage = (currentGroup - 1) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  let pageListHTML = '';
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      pageListHTML += `<button class="page-number active" disabled>${i}</button>`;
    }
    else {
      pageListHTML += `<button class="page-number">${i}</button>`;
    }
  }

  pagination.innerHTML = `
    <button class="page-first" ${currentPage === 1 ? 'disabled' : ''}></button>
    <button class="page-prev" ${currentGroup === 1 ? 'disabled' : ''}></button>
    <div class="page-list">${pageListHTML}</div>
    <button class="page-next" ${endPage === totalPages ? 'disabled' : ''}></button>
    <button class="page-last" ${currentPage === totalPages ? 'disabled' : ''}></button>
  `;
}

function updatePagination(event) {
  const pageButton = event.target.closest('button');
  if (!pageButton || pageButton.disabled) return;

  const navigateType = pageButton.className;

  const { currentPage, totalPages, pagesPerGroup } = pageState;
  const currentGroup = Math.ceil(currentPage / pagesPerGroup);

  let newPage;

  switch (navigateType) {
    case 'page-number': newPage = parseInt(pageButton.textContent); break;
    case 'page-first': newPage = 1; break;
    case 'page-last': newPage = totalPages; break;
    case 'page-prev': newPage = (currentGroup - 2) * pagesPerGroup + 1; break;
    case 'page-next': newPage = currentGroup * pagesPerGroup + 1; break;
  }

  newPage = Math.max(1, Math.min(newPage, totalPages));
  pageState.currentPage = newPage;

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("page", pageState.currentPage);
  history.pushState(null, null, `/posts?${searchParams.toString()}`);

  renderPagination();
  router();
}
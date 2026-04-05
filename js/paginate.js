// Default pagination state
let pgnData = { currPage: 1, totalPages: 0, pageLimit: 5, postLimit: 6 };
const { pageLimit, postLimit } = pgnData;

// Initialize pagination based on total number of posts
function initPagination(totalPosts) {
  pgnData.totalPages = Math.ceil(totalPosts / postLimit);
  pgnData.currPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

  renderPagination();
}

// Render pagination based on current page and total pages
function renderPagination() {
  const { currPage, totalPages } = pgnData;

  if (totalPages <= 1) {
    $.pgn.replaceChildren();
    return;
  }

  // Helper function to create a pagination link
  const createPageLink = (page, clsName, isActive, text = '') => {
    const pageLink = document.createElement('a');
    pageLink.href = `/posts?page=${page}`;
    pageLink.className = clsName;
    if (!isActive) pageLink.removeAttribute('href');
    pageLink.textContent = text;
    return pageLink;
  };

  // Create each link and append to pagination
  const pgnFrag = document.createDocumentFragment();

  const currGroup = Math.ceil(currPage / pageLimit);
  const startPage = (currGroup - 1) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  const pageFirstLink = createPageLink(
    1, 'page-first', currPage !== 1
  );
  const pagePrevLink = createPageLink(
    (currGroup - 2) * pageLimit + 1, 'page-prev', currGroup !== 1
  );
  const pageNextLink = createPageLink(
    currGroup * pageLimit + 1, 'page-next', endPage !== totalPages
  );
  const pageLastLink = createPageLink(
    totalPages, 'page-last', currPage !== totalPages
  );

  const pageList = document.createElement('div');
  pageList.className = 'page-list';
  for (let i = startPage; i <= endPage; i++) {
    const pageNumLink = createPageLink(i, 'page-number', currPage !== i, i);
    if (currPage === i) pageNumLink.classList.add('current');
    pageList.appendChild(pageNumLink);
  }

  pgnFrag.append(pageFirstLink, pagePrevLink, pageList, pageNextLink, pageLastLink);
  $.pgn.replaceChildren(pgnFrag);
}
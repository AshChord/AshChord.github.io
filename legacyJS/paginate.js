// Default pagination state
let pgnData = { currPage: 1, totalPages: 0, pageLimit: 5, postLimit: 6 };
const { pageLimit, postLimit } = pgnData;

// Initialize pagination based on total number of posts
function initPagination(totalPosts) {
  pgnData.totalPages = Math.ceil(totalPosts / postLimit);

  const searchParams = new URLSearchParams(window.location.search);
  pgnData.currPage = parseInt(searchParams.get('page')) || 1;

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
  const configurePageLink = (link, page, isActive, clsName = '', text = '') => {
    link.href = `/posts?page=${page}`;
    if (!link.classList.length) link.className = clsName;
    if (!isActive) link.removeAttribute('href');
    link.textContent = text;
  };

  // Create each link and append to pagination
  const pgnFrag = document.createDocumentFragment();

  const currGroup = Math.ceil(currPage / pageLimit);
  const startPage = (currGroup - 1) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  const pageFirstLink = $.pgn.querySelector('.page-first');
  const pagePreviousLink = $.pgn.querySelector('.page-previous');
  const pageNextLink = $.pgn.querySelector('.page-next');
  const pageLastLink = $.pgn.querySelector('.page-last');


  configurePageLink(pageFirstLink, 1, currPage !== 1);
  configurePageLink(pagePreviousLink, (currGroup - 2) * pageLimit + 1, currGroup !== 1);
  configurePageLink(pageNextLink, currGroup * pageLimit + 1, endPage !== totalPages);
  configurePageLink(pageLastLink, totalPages, currPage !== totalPages);

  for (let i = startPage; i <= endPage; i++) {
    const pageNumLink = document.createElement('a');
    configurePageLink(pageNumLink, i, currPage !== i, 'page-number', i);
    if (currPage === i) pageNumLink.classList.add('current');
    pageNextLink.before(pageNumLink);
  }
}
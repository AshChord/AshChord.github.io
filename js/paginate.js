// Initialize pagination state
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

  // Helper function to create a pagination button
  const createBtn = (clsName, isActive, text = '') => {
    const btn = document.createElement('button');
    btn.className = clsName;
    btn.disabled = !isActive;
    if (text) btn.textContent = text;
    return btn;
  };

  // Create each button and append to pagination
  const pgnFrag = document.createDocumentFragment();

  const currGroup = Math.ceil(currPage / pageLimit);
  const startPage = (currGroup - 1) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  pgnFrag.appendChild(createBtn('page-first', currPage !== 1));
  pgnFrag.appendChild(createBtn('page-prev', currGroup !== 1));

  const ul = document.createElement('ul');
  ul.className = 'page-list';

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');

    const pageNumBtn = createBtn('page-number', currPage !== i, i);
    if (currPage === i) pageNumBtn.classList.add('current');

    li.appendChild(pageNumBtn);
    ul.appendChild(li);
  }
  pgnFrag.appendChild(ul);

  pgnFrag.appendChild(createBtn('page-next', endPage !== totalPages));
  pgnFrag.appendChild(createBtn('page-last', currPage !== totalPages));

  $.pgn.replaceChildren(pgnFrag);
}

// Handle click events on pagination buttons
function updatePagination(e) {
  const { currPage, totalPages } = pgnData;

  // Determine new page based on button type
  const pageBtn = e.target.closest('button');
  const navType = pageBtn.className;
  const currGroup = Math.ceil(currPage / pageLimit);

  if (!pageBtn || pageBtn.disabled) return;

  let newPage;

  switch (navType) {
    case 'page-number': newPage = parseInt(pageBtn.textContent); break;
    case 'page-first': newPage = 1; break;
    case 'page-last': newPage = totalPages; break;
    case 'page-prev': newPage = (currGroup - 2) * pageLimit + 1; break;
    case 'page-next': newPage = currGroup * pageLimit + 1; break;
  }

  // Clamp new page to valid range
  pgnData.currPage = Math.max(1, Math.min(newPage, totalPages));

  // Handle routing when the page changes
  const srchParams = new URLSearchParams(window.location.search);
  srchParams.set("page", pgnData.currPage);
  history.pushState(null, null, `/posts?${srchParams.toString()}`);
  renderPagination();
  router();
}

$.pgn.addEventListener('click', updatePagination);
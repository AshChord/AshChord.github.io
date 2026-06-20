// /model/state.js
const GITHUB_API = {
  BASE: 'https://api.github.com',
  OWNER: 'AshChord',
  REPO: 'AshChord.github.io',
  PATH: 'data'
};

// 2. 페이지네이션 상태
// 원본 paginate.js에 있던 페이지네이션 전역 상태입니다.
let pgnData = {
  currPage: 1,
  totalPages: 0,
  pageLimit: 5,
  postLimit: 6
};

// 3. 애플리케이션 초기화 및 런타임 상태
// 원본 initialize.js에 있던 상태 관리 객체입니다.
const appState = {
  postMeta: {
    isCached: false,
    isCompiled: false
  },
  postList: {
    isCached: false,
    isFetched: false
  },
  postCount: 0,
  currentRoute: ''
};
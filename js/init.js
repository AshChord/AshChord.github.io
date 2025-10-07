// init.js

// ✅ 스크립트 최상단에 변수를 미리 선언 (전역 또는 모듈 스코프)
let posts = [];

// ✅ 깃허브 API로 /data 하위 폴더 목록 가져오기 (1회)
async function fetchPostList() {
  const response = await fetch(
    'https://api.github.com/repos/AshChord/AshChord.github.io/contents/data'
  );
  //  if (!res.ok) throw new Error(`폴더 목록 불러오기 실패 (상태: ${res.status})`);

  // 레이트 리밋 정보 출력
  console.log('Rate Limit:', response.headers.get('X-RateLimit-Limit'));
  console.log('Rate Remaining:', response.headers.get('X-RateLimit-Remaining'));

  const postList = await response.json();
  return postList.filter(item => item.type === 'dir');
}

// 📄 각 .md 파일을 fetch로 읽고, 메타데이터 파싱
async function retrievePostMeta(postTitle) {
  const postPath = `/data/${postTitle}/${postTitle}.md`;
  const response = await fetch(postPath);

  //  if (!res.ok) {
  //    console.warn(`⚠️ ${postPath} 읽기 실패`);
  //    return null;
  //  }

  const postContent = await response.text();

  const frontmatter = postContent.match(/^---\smeta\n([\s\S]*?)\n---/);
  console.log(frontmatter)
  if (!frontmatter) return null;

  const fields = frontmatter[1].split('\n');

  const meta = {};

  for (const field of fields) {
    const segments = field.match(/([^:]+):(.*)/);
    //    if (!parts) continue;

    const key = segments[1].trim();
    const value = segments[2].trim();

    // 'categories'인 경우 쉼표로 구분하여 배열로 파싱
    if (key === 'categories') {
      meta[key] = value.split(',').map(item => item.trim());
    } else {
      // 그 외의 경우는 일반 문자열로 처리
      meta[key] = value;
    }
  }

  //  if (!meta) {
  //    console.warn(`⚠️ ${postTitle}.md에서 frontmatter 없음`);
  //    return null;
  //  }
  return meta;
}

// 🌟 폴더 목록을 받아 전체 포스트 메타데이터 생성 (병렬 처리)
async function compilePostMeta(postList) {
  const promises = postList.map(postItem => retrievePostMeta(postItem.name));
  const results = await Promise.all(promises);
  return results;
}

// --- 캐시 관리 함수 ---
function saveToCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}Ts`, Date.now().toString());
}

function isCacheValid(key, duration) {
  const timestamp = localStorage.getItem(`${key}Ts`);
  if (!timestamp) return false;
  return (Date.now() - parseInt(timestamp, 10)) < duration;
}

function loadFromCache(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// 🚀 초기화 함수 (다중 계층 캐시 적용)
async function initialize() {
  // 1. L2 캐시 (메타 데이터) 확인
  if (isCacheValid('postMeta', 1000 * 60 * 10)) {
    console.log('✅ L2 캐시에서 최종 포스트 목록 불러오기 (가장 빠름)');
    posts = loadFromCache('postMeta');
  } else {
    let postList = [];
    // 2. L2 캐시가 없으면, L1 캐시 (포스팅 폴더 목록) 확인
    if (isCacheValid('postList', 1000 * 60 * 60)) {
      console.log('✅ L1 캐시에서 폴더 목록 불러오기 (API 호출 건너뛰기)');
      postList = loadFromCache('postList');
    } else {
      // 3. L1 캐시도 없으면, API 호출 (가장 느림)
      console.log('🌐 깃허브 API에서 폴더 목록 가져오는 중...');
      postList = await fetchPostList();
      saveToCache('postList', postList); // L1 캐시에 저장
    }

    // 폴더 목록을 바탕으로 메타데이터 처리
    console.log('📄 .md 파일들을 가져와 포스트 메타데이터 생성 중...');
    posts = await compilePostMeta(postList);
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveToCache('postMeta', posts); // 최종 결과를 L2 캐시에 저장
  }

  console.log('✅ 포스트 로딩 완료:', posts);

  // 이후 렌더링 함수들 호출
  router();
  renderCategoryDropdown();
}


// DOM 로드 완료 시 실행
initialize();
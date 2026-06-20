// /view/interaction.js

// ---------------------------------------------------------
// 정적 DOM 엘리먼트 캐싱
// ---------------------------------------------------------
const menuBtn = document.querySelector('.menu-button'); // 햄버거 메뉴 버튼
const searchBtn = document.querySelector('.search-button'); // 돋보기 버튼
const categoryPanel = document.querySelector('.category-panel'); // 카테고리 패널 (필요시 메뉴버튼 자신일 수도 있음)
const searchBar = document.querySelector('.search-bar');
const searchInput = document.querySelector('.search-input');
const resetBtn = document.querySelector('.reset-button');

// ---------------------------------------------------------
// 1. 모바일 UI 토글 및 외부 클릭 감지 (이벤트 위임)
// ---------------------------------------------------------
document.addEventListener('click', (e) => {
  const target = e.target;
  const isMobile = window.innerWidth < 768;

  // 트리거 버튼 클릭 시 open 토글 (모바일 전용)
  if (isMobile) {
    // 메뉴 버튼 클릭
    if (menuBtn && (target === menuBtn || menuBtn.contains(target))) {
      categoryPanel?.toggleAttribute('open');
      return;
    }
    // 검색 버튼 클릭
    if (searchBtn && (target === searchBtn || searchBtn.contains(target))) {
      searchBar?.toggleAttribute('open');
      return;
    }
  }

  // 요소 외부 클릭 시 닫기
  if (categoryPanel?.hasAttribute('open') && !categoryPanel.contains(target)) {
    categoryPanel.removeAttribute('open');
  }
  if (searchBar?.hasAttribute('open') && !searchBar.contains(target)) {
    searchBar.removeAttribute('open');
  }
});

// ---------------------------------------------------------
// 2. 브라우저 리사이즈 대응 (반응형 및 목차 숨김)
// ---------------------------------------------------------
window.addEventListener('resize', () => {
  // 넓은 화면에서 열림 상태 강제 초기화
  if (window.innerWidth >= 768) {
    categoryPanel?.removeAttribute('open');
    searchBar?.removeAttribute('open');
  }

  // 화면 높이보다 목차가 길면 숨김 처리
  if (outline && outline.children.length > 0) {
    const headingList = outline.querySelector('.heading-list');
    if (headingList) {
      const outlineHeight = headingList.offsetHeight;
      outline.style.setProperty('--height', `${outlineHeight}px`);
      outline.style.visibility = window.innerHeight < outlineHeight ? 'hidden' : 'visible';
    }
  }
}, { passive: true });

window.dispatchEvent(new Event('resize'));

// ---------------------------------------------------------
// 3. 검색 폼 UI 상태 제어 및 제출 검증
// ---------------------------------------------------------
if (searchInput && resetBtn) {
  // 입력 시 리셋 버튼 표시 토글
  searchInput.addEventListener('input', () => {
    resetBtn.style.display = searchInput.value ? 'block' : 'none';
  });

  // 폼 리셋 이벤트 (X버튼 클릭)
  searchBar.addEventListener('reset', () => {
    resetBtn.style.display = 'none';
    setTimeout(() => searchInput.focus(), 0); // 초기화 틱 이후에 포커스
  });
}

if (searchBar) {
  // 폼 제출 시 빈 값 검증 (Pragmatic MVC)
  searchBar.addEventListener('submit', (e) => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      e.preventDefault(); // 검색 막기
      return;
    }
    searchInput.value = keyword; // trim된 값으로 교체 후 전송
  });
}

// ---------------------------------------------------------
// 4. 목차 인터랙션 (클릭 부드러운 스크롤 & 스크롤 스파이)
// ---------------------------------------------------------

// 목차 링크 클릭 (이벤트 위임)
if (outline) {
  outline.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const targetHdg = document.getElementById(targetId);
    
    if (targetHdg) {
      targetHdg.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// 스크롤 스파이 (현재 읽는 위치 하이라이팅)
window.addEventListener('scroll', () => {
  if (!outline || outline.style.visibility === 'hidden') return;
  if (!content) return;

  const hdgs = content.querySelectorAll('h2, h3, h4, h5, h6');
  if (hdgs.length === 0) return;

  let currentHdg = null;
  const triggerY = 100; // 화면 상단에서 100px 정도 아래를 활성화 기준으로 잡음

  // 현재 화면 상단에 가장 가까운 제목 찾기
  for (let i = 0; i < hdgs.length; i++) {
    const rect = hdgs[i].getBoundingClientRect();
    if (rect.top <= triggerY) {
      currentHdg = hdgs[i];
    } else {
      break; // 이미 아래에 있는 건 계산할 필요 없음
    }
  }

  // 목차 링크 액티브 클래스 갱신
  const links = outline.querySelectorAll('a');
  links.forEach(link => {
    if (currentHdg && link.getAttribute('href') === `#${currentHdg.id}`) {
      link.classList.add('active'); // CSS에서 .active로 하이라이팅 처리
    } else {
      link.classList.remove('active');
    }
  });
}, { passive: true });

// ---------------------------------------------------------
// 5. 코드 블록 복사 버튼 (동적 생성 요소, 이벤트 위임)
// ---------------------------------------------------------
document.addEventListener('click', (e) => {
  const copyBtn = e.target.closest('.copy-button');
  if (!copyBtn) return;

  const pre = copyBtn.closest('pre');
  const code = pre?.querySelector('code');
  
  if (code) {
    navigator.clipboard.writeText(code.textContent).then(() => {
      // 복사 완료 시각적 피드백 (잠시 클래스 추가)
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    });
  }
});
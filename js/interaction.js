// /view/interaction.js

// ---------------------------------------------------------
// 정적 DOM 엘리먼트 캐싱
// ---------------------------------------------------------
const menuBtn = document.querySelector('menu'); // 햄버거 메뉴 버튼
const searchBtn = document.querySelector('search'); // 돋보기 버튼
const categoryPanel = document.querySelector('.category-panel'); // 카테고리 패널
const searchBar = document.querySelector('.search-bar');
const searchInput = document.querySelector('.search-input');
const resetBtn = document.querySelector('.search-reset-button');

// ---------------------------------------------------------
// 1. 모바일 UI 토글 및 외부 클릭 감지 (이벤트 위임)
// ---------------------------------------------------------
document.addEventListener('click', (e) => {
  const target = e.target;

  // 1. 코드 복사 버튼 로직
  const copyBtn = target.closest('.copy-button');
  if (copyBtn) {
    const code = copyBtn.nextElementSibling;
    navigator.clipboard.writeText(code.textContent).then(() => {
      // 복사 완료 시각적 피드백 (잠시 클래스 추가)
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    });
  }

  // 2. 모바일 메뉴 및 검색 바 토글 로직
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    if (target === menuBtn) {
      menuBtn.toggleAttribute('open');
      searchBar.removeAttribute('open');
      return;
    }
    // 검색 버튼 클릭
    if (target === searchBtn) {
      searchBar.toggleAttribute('open');
      menuBtn.removeAttribute('open');
      return;
    }
  
    if (menuBtn.contains(target) || searchBar.contains(target)) return;
  
    // 바깥 영역을 클릭한 경우 둘 다 닫기
    menuBtn.removeAttribute('open');
    searchBar.removeAttribute('open');
  }

  // 3. 카테고리 패널 닫기 로직 (복사 버튼을 눌러도 외부 영역 클릭으로 판정되어 정상 작동함)
  if (!categoryPanel.contains(target)) {
    categoryPanel.removeAttribute('open');
  }
});

// ---------------------------------------------------------
// 2. 브라우저 리사이즈 대응 (반응형 및 목차 숨김)
// ---------------------------------------------------------
window.addEventListener('resize', () => {
  // 넓은 화면에서 열림 상태 강제 초기화
  if (window.innerWidth >= 768) {
    menuBtn.removeAttribute('open');
    searchBar.removeAttribute('open');
  }

    const outlineHeight = outline.offsetHeight;
    outline.style.setProperty('--height', `${outlineHeight}px`);
    outline.style.visibility = innerHeight < outlineHeight ? 'hidden' : 'visible';
});

// ---------------------------------------------------------
// 3. 검색 폼 UI 상태 제어 및 제출 검증
// ---------------------------------------------------------
// 입력 시 리셋 버튼 표시 토글
searchInput.addEventListener('input', () => {
  resetBtn.style.display = searchInput.value ? 'block' : 'none';
});

// 폼 리셋 이벤트 (X버튼 클릭)
searchBar.addEventListener('reset', () => {
  resetBtn.style.display = 'none';
  searchInput.focus(); // 초기화 틱 이후에 포커스
});

// 폼 제출 시 빈 값 검증 (Pragmatic MVC)
searchBar.addEventListener('submit', (e) => {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    e.preventDefault(); // 검색 막기
    return;
  }
  searchInput.value = keyword; // trim된 값으로 교체 후 전송
});

// ---------------------------------------------------------
// 4. 목차 인터랙션 (클릭 부드러운 스크롤 & 스크롤 스파이)
// ---------------------------------------------------------

// 목차 링크 클릭 (이벤트 위임)
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

// 스크롤 스파이 (현재 읽는 위치 하이라이팅)
document.addEventListener('contentRendered', () => {
  window.dispatchEvent(new Event('resize'));

  const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
  const links = outline.querySelectorAll('a');

  const linkMap = new Map([...links].map(link => [link.getAttribute('href'), link]));

  let currentHdg = null;
  let currentLink = null;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      ticking = false;

      const triggerY = 20;
      let newCurrentHdg = null;

      // 100px 기준선을 통과한 가장 마지막 헤딩 찾기
      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();

        if (rect.top <= triggerY) {
          newCurrentHdg = headings[i];
        } else {
          break;
        }
      }

      // 현재 헤딩과 같으면 아무 작업도 하지 않음
      if (newCurrentHdg === currentHdg) return;

      currentHdg = newCurrentHdg;

      // 이전 링크의 current 제거
      if (currentLink) {
        currentLink.classList.remove('current');
      }

      // 새로운 헤딩에 해당하는 링크 활성화
      if (currentHdg) {
        currentLink = linkMap.get(`#${currentHdg.id}`);

        if (currentLink) {
          currentLink.classList.add('current');
        }
      } else {
        currentLink = null;
      }
    });
  }, { passive: true });
});
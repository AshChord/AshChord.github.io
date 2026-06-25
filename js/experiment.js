(async () => {
  console.log("🚀 [1] 런처 시작 - 현재 마크다운 body 노드 복사 중...");
  const currentBodyNodes = Array.from(document.body.childNodes);
  console.log(`📦 복사된 노드 개수: ${currentBodyNodes.length}개`);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  const contentTarget = newDoc.querySelector('.content');

  if (contentTarget) {
    console.log("📥 [2] 복사한 마크다운 노드들을 newDoc의 .content에 append 하는 중...");
    contentTarget.append(...currentBodyNodes);
  }

  console.log("🔄 [3] head와 body 교체 (replaceWith) 실행 직전");
  document.head.replaceWith(newDoc.head);
  document.body.replaceWith(newDoc.body);
  console.log("✅ [3-1] 교체 완료");

  console.log("🔍 [4] 현재 document.body에서 script 태그 수집 시작...");
  const targetScripts = document.body.querySelectorAll('script');
  console.log(`📜 수집된 script 총 갯수: ${targetScripts.length}개`, targetScripts);

  for (const oldScript of targetScripts) {
    // 형 원본 로직 그대로 유지
    const src = oldScript.getAttribute('src');
    console.log(`✨ 루프 도는 중 - 현재 script의 getAttribute('src') 결과값:`, src);
    console.log(`📝 현재 script의 실제 태그 상태:`, oldScript);

    const s = document.createElement('script');
    s.src = src; // 여기서 null 문자열 요청이 터지는 타이밍 확인용
    s.async = false;
    
    console.log(`📡 [요청 발사 직전] s.src에 대입된 값:`, s.src);
    oldScript.replaceWith(s);
  }
  console.log("🏁 [5] 모든 로직 종료");
})();
document.addEventListener("DOMContentLoaded", async () => {
  // 1. 기존 body의 자식 노드들을 백업
  const currentBodyNodes = Array.from(document.body.childNodes);

  // 2. index.html 껍데기 파일 fetch
  const response = await fetch('/html/index.html');
  let htmlText = await response.text();

  // 3. 맨 위에 있는 yaml 프론트매터 지우기
  htmlText = htmlText.replace(/^---[\s\S]*?---/, '');

  // 4. DOMParser로 메모리 가상 공간에 새 껍데기 파싱
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  // 5. 새 껍데기의 .content 영역을 찾아서 기존 본문 노드들을 통째로 이식
  const contentTarget = newDoc.querySelector('.content');
  if (contentTarget) {
    currentBodyNodes.forEach(node => {
      contentTarget.appendChild(node);
    });
  }

  // 6. 실제 화면을 새 껍데기(head, body)로 교체
  document.head.replaceWith(newDoc.head);
  document.body.replaceWith(newDoc.body);

  // ==========================================
  // ★ 스크립트 순서 보장 주입 (초간단 버전)
  // ==========================================
  const scripts = document.body.querySelectorAll('script');

  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    
    // 원래 가지고 있던 src 속성 그대로 복사
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value);
    });

    // ✨ 핵심: 비동기 폭주 끄기!
    // src가 있는 동적 스크립트에 이걸 끄면, 브라우저가 소스 코드에 적힌 순서대로 
    // 다운로드를 먼저 마친 녀석이 있더라도 얌전히 기다렸다가 차례대로 실행해 줌.
    newScript.async = false;

    // 원래 있던 자리에 살아있는 새 스크립트 꽂아넣기
    oldScript.before(newScript);
    oldScript.remove();
  });
});
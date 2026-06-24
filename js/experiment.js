(async () => {
  // 1. 현재 바디에서 긁어온 노드들이 실제로 뭐가 있는지 확인
  const currentBodyNodes = Array.from(document.body.childNodes);
  console.log("1. 현재 바디에서 가져온 노드 목록:", currentBodyNodes);

  const response = await fetch('/html/index.html');
  let htmlText = await response.text();

  htmlText = htmlText.replace(/^---[\s\S]*?---/, '');

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  // 2. 새 HTML에서 .content 영역을 정상적으로 찾았는지 확인
  const contentTarget = newDoc.querySelector('.content');
  console.log("2. 새 HTML에서 찾은 .content 태그:", contentTarget);

  if (contentTarget) {
    contentTarget.append(...currentBodyNodes);
    // 3. append 직후에 .content 안에 기존 노드들이 잘 들어갔는지 확인
    console.log("3. append 직후 .content 내부 자식들:", contentTarget.childNodes);
  } else {
    console.warn("⚠️ 경고: 새 HTML에서 .content를 찾지 못했습니다!");
  }

  // 4. 최종 교체 직전, 새롭게 갈아끼울 newDoc의 body 상태 확인
  console.log("4. 교체 직전 newDoc.body 전체 구조:", newDoc.body.outerHTML);

  document.head.replaceWith(newDoc.head);
  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const s = document.createElement('script');
    s.src = oldScript.src;
    oldScript.replaceWith(s);
  }
})();
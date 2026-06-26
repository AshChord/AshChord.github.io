(async () => {
  // 1. 내 마크다운 알맹이 무조건 긁어오기 (의심 따윈 안 함)
  const markdownBody = document.querySelector('.markdown-body');
  const currentContentNodes = Array.from(markdownBody.childNodes);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  // 2. 무조건 존재하는 내 하드코딩 요소에 바로 때려 박기
  newDoc.querySelector('.content').append(...currentContentNodes);

  // 3. 화면 갈아끼우기
  document.head.replaceWith(newDoc.head);
  document.body.replaceWith(newDoc.body);

  // 4. 내 고결한 정품 스크립트만 순서대로 가동
  for (const oldScript of document.body.querySelectorAll('script')) {
    const s = document.createElement('script');
    s.src = oldScript.getAttribute('src');
    s.async = false;
    oldScript.replaceWith(s);
  }
})();
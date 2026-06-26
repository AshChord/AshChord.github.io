// 1. 숨김 CSS는 즉시 적용
const style = document.createElement('style');
style.textContent = '.markdown-body {display: none;}';
document.head.appendChild(style);

// 2. DOM 준비 후 기존 코드 실행
document.addEventListener('DOMContentLoaded', async () => {

  const markdownBody = document.querySelector('.markdown-body');
  const currentContentNodes = Array.from(markdownBody.childNodes);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  newDoc.querySelector('.content').append(...currentContentNodes);

  document.head.replaceWith(newDoc.head);
  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const s = document.createElement('script');
    s.src = oldScript.getAttribute('src');
    s.async = false;
    oldScript.replaceWith(s);
  }
});
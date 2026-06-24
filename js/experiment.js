(async () => {
  const currentBodyNodes = Array.from(document.body.childNodes);

  const response = await fetch('/html/index.html');
  let htmlText = await response.text();

  htmlText = htmlText.replace(/^---[\s\S]*?---/, '');

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  const contentTarget = newDoc.querySelector('.content');
  if (contentTarget) {
    contentTarget.append(...currentBodyNodes);
  }

  document.head.replaceWith(newDoc.head);
  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const s = document.createElement('script');
    s.src = oldScript.src;
    oldScript.replaceWith(s);
  }
})();
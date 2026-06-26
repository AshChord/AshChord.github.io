(async () => {
  const splash = document.querySelector('img[src="/assets/favicon.svg"]');

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
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    script.async = false;
    oldScript.replaceWith(script);
  }

  splash.remove();
})();
/*(async () => {
  const markdownBody = document.querySelector('.markdown-body');
  const currentContentNodes = Array.from(markdownBody.childNodes);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  newDoc.querySelector('.content').append(...currentContentNodes);

  document.head.replaceChildren(...newDoc.head.childNodes);

  await Promise.all(
    [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => {
      if (link.sheet) return Promise.resolve();

      return new Promise(resolve => {
        link.addEventListener('load', resolve, { once: true });
        link.addEventListener('error', resolve, { once: true });
      });
    })
  );

  document.body.replaceChildren(...newDoc.body.childNodes);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    script.async = false;
    oldScript.replaceWith(script);
  }
})();*/
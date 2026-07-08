(async () => {
  const markdownBody = document.querySelector('body');
  const currentContentNodes = Array.from(markdownBody.childNodes);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const newDoc = new DOMParser().parseFromString(htmlText, 'text/html');

  newDoc.querySelector('.content-body').append(...currentContentNodes);

  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    script.async = false;
    oldScript.replaceWith(script);
  }
})();
(async () => {
  const content = Array.from(document.body.childNodes);

  const htmlText = await fetch('/index.html').then(res => res.text());
  const newDoc = new DOMParser().parseFromString(htmlText, 'text/html');

  newDoc.querySelector('.content-body').append(...content);
  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    script.async = false;
    oldScript.replaceWith(script);
  }
})();
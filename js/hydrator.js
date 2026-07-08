(async () => {
  const markdownBody = document.querySelector('body');
  const currentContentNodes = Array.from(markdownBody.childNodes);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const newDoc = new DOMParser().parseFromString(htmlText, 'text/html');

  newDoc.querySelector('.content-body').append(...currentContentNodes);

  /*const rawStyle = document.head.querySelectorAll('link')[1];
  const canonicalStyle = newDoc.head.querySelectorAll('link')[1];

  canonicalStyle.onload = () => rawStyle.remove();

  document.head.childNodes.forEach(node => node !== rawStyle && node.remove());
  document.head.append(...Array.from(newDoc.head.childNodes));*/

  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    script.async = false;
    oldScript.replaceWith(script);
  }
})();
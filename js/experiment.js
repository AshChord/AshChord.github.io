(async () => {
  const markdownBody = document.querySelector('.markdown-body');
  const currentContentNodes = Array.from(markdownBody.childNodes);

  const response = await fetch('/index.html');
  const htmlText = await response.text();

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlText, 'text/html');

  newDoc.querySelector('.content').append(...currentContentNodes);

  const oldLink = document.querySelector('link[href*="style"]');
  const newLink = newDoc.head.querySelector('link[href*="style"]');
  newLink.remove();

  newLink.onload = () => oldLink.remove();

  Array.from(document.head.childNodes).forEach(node => {
    if (node !== oldLink) node.remove();
  });

  document.head.append(...Array.from(newDoc.head.childNodes));
  document.head.insertBefore(newLink, document.head.lastChild);

  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    script.async = false;
    oldScript.replaceWith(script);
  }
})();
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

  newLink.onload = () => oldLink.remove();

  document.head.appendChild(newLink);

  Array.from(document.head.childNodes).forEach(node => {
    if (node !== oldLink && node !== newLink) node.remove();
  });

  document.head.prepend(...Array.from(newDoc.head.childNodes));

  document.body.replaceWith(newDoc.body);

  for (const oldScript of document.body.querySelectorAll('script')) {
    const script = document.createElement('script');
    script.src = oldScript.getAttribute('src');
    oldScript.replaceWith(script);
  }
})();
document.firstChild.remove();

(async () => {
  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const nodes = [...document.body.childNodes];
  const marker = nodes.find(n => n.nodeType === 8 && !n.data);
  const contentNodes = nodes.slice(nodes.indexOf(marker) + 1);

  skeleton.querySelector('.content-body').append(...contentNodes);
  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    if (inertScript.defer) continue;
    const activeScript = document.createElement('script');
    activeScript.src = inertScript.getAttribute('src');
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }
})();
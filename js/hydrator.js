document.firstChild.remove();

(async () => {
  const marker = document.currentScript;

  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const nodes = [...document.body.childNodes];
  const contentNodes = nodes.slice(nodes.indexOf(marker) + 1);

  skeleton.querySelector('.content-body').append(...contentNodes);
  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    if (inertScript.type || inertScript.defer) continue;

    const activeScript = document.createElement('script');
    activeScript.src = inertScript.src;
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }
})();
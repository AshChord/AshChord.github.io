document.firstChild.remove();

(async () => {
  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const marker = document.querySelector('.marker');

  while (document.body.firstChild !== marker)
    document.body.firstChild.remove();

  marker.remove();

  skeleton.querySelector('.content-body').append(...document.body.childNodes);
  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    const activeScript = document.createElement('script');
    activeScript.src = inertScript.getAttribute('src');
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }
})();
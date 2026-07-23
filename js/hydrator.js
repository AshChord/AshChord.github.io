(async () => {
  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const thumbnail = document.body.querySelector('.thumbnail');

  if (thumbnail) {
    while (true) {
      const node = document.body.firstChild;
      skeleton.querySelector('.content-header').appendChild(node);
      if (node === thumbnail.parentElement) break;
    }
    skeleton.querySelector('.content-body').append(...document.body.childNodes);
  } else {
    skeleton.querySelector('.content').replaceChildren(...document.body.childNodes);
  }

  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    const activeScript = document.createElement('script');
    activeScript.src = inertScript.getAttribute('src');
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }
})();
(async () => {
  const rawText = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(rawText, 'text/html');

  skeleton.querySelector('.content-body').append(...document.body.childNodes);
  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    const activeScript = document.createElement('script');
    activeScript.src = inertScript.getAttribute('src');
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }
})();
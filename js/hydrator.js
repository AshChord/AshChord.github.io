(async () => {
  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const thumbnail = document.body.querySelector('.thumbnail');

  if (thumbnail) {
    const contentHeader = skeleton.querySelector('.content-header');
    let i = 0;

    while (true) {
      const sourceNode = document.body.firstChild;

      if (sourceNode === thumbnail.parentElement) {
        contentHeader.children[i].replaceWith(thumbnail);
        sourceNode.remove();
        break;
      }

      contentHeader.children[i].append(...sourceNode.childNodes);
      sourceNode.remove();
      i++;
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
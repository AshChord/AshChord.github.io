(async () => {
  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const thumbnail = document.body.querySelector('.thumbnail');

  if (thumbnail) {
    const contentHeader = skeleton.querySelector('.content-header');

    for (let i = 0; i < contentHeader.children.length; i++) {
      const sourceNode = document.body.firstElementChild;

      if (sourceNode === thumbnail.parentElement) {
        contentHeader.children[i].replaceWith(thumbnail);
        sourceNode.remove();
        break;
      }

      contentHeader.children[i].append(...sourceNode.childNodes);
      sourceNode.remove();
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
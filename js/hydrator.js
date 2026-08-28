async function hydrate() {
  const hydrator = document.currentScript;

  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');

  const nodes = [...document.body.childNodes];
  const contentNodes = nodes.slice(nodes.indexOf(hydrator) + 1);

  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    const activeScript = document.createElement('script');
    activeScript.setAttribute("src", inertScript.getAttribute("src"));
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }

  return contentNodes;
}

window.contentNodes = hydrate();
async function hydrate() {
  const skeletonSource = await fetch('/').then(res => res.text());
  const skeleton = new DOMParser().parseFromString(skeletonSource, 'text/html');
  const contentNodes = document.body.children;

  document.body.replaceWith(skeleton.body);

  for (const inertScript of document.body.querySelectorAll('script')) {
    const activeScript = document.createElement('script');
    activeScript.setAttribute("src", inertScript.getAttribute("src"));
    activeScript.textContent = inertScript.textContent;
    activeScript.async = false;
    inertScript.replaceWith(activeScript);
  }

  return contentNodes;
}

window.contentNodes = hydrate();
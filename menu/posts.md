---
permalink: /posts
title: posts - AshChord.log · Github Pages
---

{% assign posts = site.pages
  | where_exp: "page", "page.path contains 'data/'"
%}

{% for post in posts %}
- {{ post.title | default: "title"}}
- {{ post.date | default: "1970-01-01"}}
- {{ post.excerpt | default: "example post"}}
- {{ post.categories | default: "cat1, cat2"}}
{: .post-item}
{% endfor %}
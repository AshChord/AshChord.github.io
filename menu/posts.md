---
permalink: /posts
title: posts - AshChord.log · Github Pages
---

{% assign posts = site.pages
  | where_exp: "page", "page.path contains 'data/'"
%}
<!-- | sort: "date" | reverse -->

{% for post in posts %}
- {{ post.title | default: "title"}}
- {{ post.date | default: "1970-01-01"}}
- {{ post.excerpt | default: "example post"}}
- {{ post.categories | default: "cat1, cat2"}}
{% endfor %}
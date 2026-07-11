---
permalink: /posts
title: posts - AshChord.log · Github Pages
---

{% assign posts = site.pages | where_exp: "page", "page.date" | sort: "date" | reverse %}

{% for post in posts %}
- {{ post.title }}
- {{ post.date }}
- {{ post.excerpt }}
- {{ post.categories }}
{: .metadata}
{% endfor %}
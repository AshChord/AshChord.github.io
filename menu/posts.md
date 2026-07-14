---
permalink: /posts
title: posts - AshChord.log
---

{% assign posts = site.pages | where_exp: "page", "page.date" | sort: "date" | reverse %}

{% for post in posts %}
- {{ post.title | uri_escape }}
- {{ post.date }}
- {{ post.excerpt }}
- {{ post.categories }}
{: .metadata}
{% endfor %}
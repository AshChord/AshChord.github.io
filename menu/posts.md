---
permalink: /posts
title: posts - AshChord.log · Github Pages
---

{::nomarkdown}
{{ site.pages | jsonify }}
{::/}

{% assign posts = site.pages
  | where_exp: "page", "page.path contains 'data/'" | sort: "date" | reverse
%}

{% for post in posts %}
- {{ post.title }}
- {{ post.date }}
- {{ post.excerpt }}
- {{ post.categories }}
{: .metadata}
{% endfor %}
---
permalink: /posts
title: posts - AshChord.log
---

{% assign posts = site.pages | where_exp: "page", "page.date" | sort: "date" | reverse %}

{% for post in posts %}
{::nomarkdown}
- {{ post.title }}
{:/}
{::nomarkdown}
- {{ post.date }}
{:/}
{::nomarkdown}
- {{ post.excerpt }}
{:/}
{::nomarkdown}
- {{ post.categories }}
{:/}
{: .metadata}
{% endfor %}
---
permalink: /posts
---

{% assign sorted_posts = site.pages | where_exp: "page", "page.path contains '/data/' and page.path contains '.md'" | sort: "date" | reverse %}

{% for post in sorted_posts %}
> {{ post.title }}
> {{ post.date }}
> {{ post.excerpt }}
> {{ post.categories }}
{: .post-item}

{% endfor %}
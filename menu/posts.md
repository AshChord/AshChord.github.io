---
permalink: /posts
---

{% assign filtered = site.pages | where_exp: "page", "page.path contains 'data/'" %}

{% for post in filtered %}
- {{ post.title | default: "title"| url_encode }}
- {{ post.date | default: "1970-01-01" | url_encode }}
- {{ post.excerpt | default: "example post" | url_encode }}
- {{ post.categories | default: "cat1, cat2" | url_encode }} {: .post-categories}
{: .post-item}
{% endfor %}
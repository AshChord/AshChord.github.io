---
permalink: /posts
---

{% assign filtered = site.pages | where_exp: "page", "page.path contains 'data/'" %}

{% for post in filtered %}
- {{ post.title | default: "title"| url_escape }}
- {{ post.date | default: "1970-01-01" | url_escape }}
- {{ post.excerpt | default: "example post" | url_escape }}
- {{ post.categories | default: "cat1, cat2" | url_escape }}
{: .post-item}
{% endfor %}
---
permalink: /posts
---

{% assign filtered = site.pages | where_exp: "page", "page.path contains 'data/'" %}

{% for post in filtered %}
- {{ post.title | default: "title"| jsonify }}
- {{ post.date | default: "1970-01-01" | jsonify }}
- {{ post.excerpt | default: "example post" | jsonify }}
- {{ post.categories | default: "cat1, cat2" | jsonify }}
{: .post-item}
{% endfor %}
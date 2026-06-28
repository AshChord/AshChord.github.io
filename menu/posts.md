---
permalink: /posts
---

{% assign filtered = site.pages | where_exp: "page", "page.path contains '/data/'" %}
{% assign filtered = filtered | where_exp: "page", "page.path contains '.md'" %}
{% assign sorted_posts = filtered | sort: "date" | reverse %}

{% for post in sorted_posts %}
- {{ post.title | default: "title"| jsonify }}
- {{ post.date | default: "1970-01-01" | jsonify }}
- {{ post.excerpt | default: "example post" | jsonify }}
- {{ post.categories | default: "cat1, cat2" | jsonify }}
{: .post-item}
{% endfor %}
---
permalink: /posts
---

{% for page in site.pages %}
- {{ page.path }}
{% endfor %}
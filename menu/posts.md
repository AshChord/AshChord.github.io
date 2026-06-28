---
permalink: /posts
---

{% for post in site.pages %}
---
PATH: {{ post.path }}
CONTAINS DATA?: {% if post.path contains "data" %}YES{% else %}NO{% endif %}
---
{% endfor %}
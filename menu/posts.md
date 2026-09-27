---
layout: null
permalink: /posts
---

{% assign index = site.pages | where: "name", "index.html" | first %}
{% assign posts = site.pages | where_exp: "page", "page.date" | sort: "date" | reverse %}

{% capture posts_data %}
[
{% for post in posts %}
  {
    "slug": {{ post.url | split: "/" | last | split: "." | pop | jsonify }},
    "title": {{ post.title | jsonify }},
    "date": {{ post.date | jsonify }},
    "excerpt": {{ post.excerpt | jsonify }},
    "categories": {{ post.categories | jsonify }}
  }{% unless forloop.last %},{% endunless %}
{% endfor %}
]
{% endcapture %}

{{ index.content | replace: '[]', posts_data }}
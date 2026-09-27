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
    "slug": {{ post.url | split: "/" | last | split: "." | first | jsonify }},
    "title": {{ post.title | jsonify }},
    "date": {{ post.date | jsonify }},
    "excerpt": {{ post.excerpt | jsonify }},
    "categories": {{ post.categories | split: ", " | jsonify }},
    "path": {{ post.path | jsonify }},
    "dir": {{ post.dir | jsonify }}
  }{% unless forloop.last %},{% endunless %}
{% endfor %}
]
{% endcapture %}

{::nomarkdown}
{{ index.content | replace: '[]', posts_data }}
{:/nomarkdown}
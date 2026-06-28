---
permalink: /posts
---

{% assign filtered_posts = "" | split: "" %}

{% for post in site.pages %}
  {% if post.path contains '/data/' and post.path contains '.md' %}
    {% assign filtered_posts = filtered_posts | push: post %}
  {% endif %}
{% endfor %}

{% assign sorted_posts = filtered_posts | sort: "date" | reverse %}

{% for post in sorted_posts %}
> {{ post.title }}
> {{ post.date }}
> {{ post.excerpt }}
> {{ post.categories }}
{: .post-item}
{% endfor %}
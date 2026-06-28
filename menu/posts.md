---
permalink: /posts
---

{% assign filtered_posts = "" | split: "" %}

{% for post in site.pages %}
  {% if post.path contains "Week 3" or post.path contains "Week 4" %}
    {% assign filtered_posts = filtered_posts | push: post %}
  {% endif %}
{% endfor %}

{% assign sorted_posts = filtered_posts | sort: "date" | reverse %}

{% for post in sorted_posts %}
> {{ post.title }}
{: .post-title}
> {{ post.date }}
{: .post-date}
> {{ post.excerpt }}
{: .post-excerpt}
> {{ post.categories }}
{: .post-category}
{: .post-item}
{% endfor %}
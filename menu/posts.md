---
permalink: /posts
---


{% assign sorted_posts = site.pages
  | where_exp: "page", "page.path contains '/posts/' and page.path contains '.md'"
  | sort: "date"
  | reverse %}

{% for post in sorted_posts %}
> {{ post.title }}{: .title}
> {{ post.date }}{: .date}
> {{ post.excerpt }}{: .excerpt}
> {{ post.categories }}{: .categories}
{: .post-item}

{% endfor %}
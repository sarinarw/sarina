---
title: Getting Started with This Site
description: Notes on why I built this and what I plan to write about.
date: 2026-05-07
topic: tech
tags: [meta, writing]
---

This is the first post on this site. I built it with [Eleventy](https://www.11ty.dev/) and
[Tailwind CSS](https://tailwindcss.com/) because I wanted a simple place to keep notes on
things I'm researching.

## What You'll Find Here

I write about things I'm currently learning or thinking about — mostly tech, but also gardening
and whatever else catches my attention.

## Code Examples

Here's a quick example of how this site's Eleventy config collects posts:

```js
eleventyConfig.addCollection("posts", (collectionApi) => {
  return collectionApi
    .getFilteredByGlob("src/blog/**/*.md")
    .sort((a, b) => b.date - a.date);
});
```

More posts coming soon.

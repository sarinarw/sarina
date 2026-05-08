---
title: Getting Started with This Site
description: How I rebuilt this site from scratch using Claude Code — and what that process actually looked like.
date: 2026-05-07
topic: tech
tags: [meta, claude, eleventy, ai]
---

This site is a rebuild. The previous version was a generic Eleventy boilerplate from 2020: Eleventy 0.11, EJS templates, Tailwind v1.6, Webpack. It worked, but it was a stranger's code and I never really touched it.

I rebuilt it entirely using [Claude Code](https://claude.ai/code), Anthropic's CLI tool.

## What Claude Code actually did

I started with a rough idea: a personal site with a blog that supports multiple topics (tech, gardening, other things I'm curious about), full-text search, and a projects page. No mockups, no detailed spec, just that description.

Claude Code ran a structured brainstorming process: asked me clarifying questions one at a time, proposed approaches with tradeoffs, and assembled a design spec from my answers. That spec covered everything from URL structure (`/blog/tech/my-post/`) to color palette (warm off-white, sage green accent) to which fonts to load from Google Fonts.

From the spec it wrote a 15-task implementation plan, then executed each task using subagents: fresh isolated Claude instances dispatched per task, so no context bleed between them. Each task went through two review passes, one checking spec compliance ("did you build what was asked?") and one checking code quality. When a reviewer found an issue, the implementer fixed it before moving on.

## What broke

A few things needed input from me:

**Node.js wasn't installed.** The first task (updating `package.json` and running `npm install`) failed immediately because `node` wasn't on my PATH. I ran `brew install node` and we continued.

**Nunjucks' `selectattr` filter.** Topic index pages (`/blog/tech/`, `/blog/gardening/`) showed zero posts. The template was using Nunjucks' built-in `selectattr("data.topic", "equalto", topic)` to filter posts, which turns out to be unreliable for nested attribute access. The fix was adding a plain JavaScript filter:

```js
function filterByTopic(posts, topic) {
  return posts.filter((post) => post.data.topic === topic);
}
```

Then using `| filterByTopic(topic)` in the template instead. Less magic, more obvious.

**Eleventy generating project detail pages.** The spec said projects should only appear as cards on the `/projects/` page with no individual URLs. But Eleventy was generating `/projects/sample-project/` anyway. The fix was a `src/projects/projects.json` directory data file with `{"permalink": false}`, which tells Eleventy not to output files from that folder.

## The stack

- **[Eleventy 3.x](https://www.11ty.dev/)** — static site generator, Nunjucks templates
- **[Tailwind CSS v3](https://tailwindcss.com/)** via PostCSS CLI
- **[Pagefind](https://pagefind.app/)** — builds a search index at compile time, runs client-side with no server
- **[Decap CMS](https://decapcms.org/)** — the successor to Netlify CMS, browser-based editor at `/admin/`
- **[Vitest](https://vitest.dev/)** — unit tests for the custom filters and collection logic

The custom Eleventy filters (`postDate`, `isoDate`, `limit`, `filterByTopic`) and collection helpers (`uniqueTopics`, `uniqueTags`) live in `src/filters.js` and `src/collections.js` as plain functions, which makes them easy to test without mocking Eleventy internals.

## What I found interesting

The subagent approach meant each task started with zero memory of previous tasks. Claude Code had to write prompts that included everything a task needed: file paths, exact code, expected outputs. This produced unusually complete task descriptions, which meant fewer "wait, what was I doing" moments.

The two-stage review caught real issues. The `selectattr` bug was flagged during the build verification task before I'd noticed it myself.

It's also a good way to build something you want to understand. Because I was answering questions and approving each section of the design, I know why every decision was made. That's not always true when you clone a starter and start hacking.

## What's next

I'm planning to write about things I'm actively researching: some Rust, some home lab stuff, garden notes as the season goes on. Search is there if you need it. Topics are in the nav.

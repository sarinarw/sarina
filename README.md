# sarinawhite.com

Personal portfolio and blog for Sarina White. Built with Eleventy 3.x, Tailwind CSS v3, and Pagefind.

## Stack

| Concern | Tool |
|---------|------|
| Static site generator | [Eleventy 3.x](https://www.11ty.dev) |
| Templates | Nunjucks |
| CSS | [Tailwind CSS v3](https://tailwindcss.com) via PostCSS |
| Search | [Pagefind](https://pagefind.app) (build-time, client-side) |
| CMS | [Decap CMS](https://decapcms.org) at `/admin/` (optional) |
| Hosting | Netlify |

## Commands

```bash
npm run dev      # dev server with live reload + CSS watch
npm run build    # production build (Eleventy + PostCSS + Pagefind index)
npm run clean    # delete _site/
npm test         # run unit tests (Vitest)
npm run format   # format with Prettier
```

Dev server runs at `http://localhost:8080`.

## Project structure

```
src/
  _data/
    site.json             # site-wide metadata (name, URL, social links)
  _includes/
    layouts/
      base.njk            # master HTML layout
      post.njk            # blog post layout
    components/
      nav.njk
      post-card.njk
      project-card.njk
      tag-pill.njk
  blog/
    [topic]/[slug].md     # posts live under their topic folder
  projects/
    [slug].md             # project entries (no individual detail pages)
  assets/styles/
    main.css              # Tailwind entry point
  index.njk               # homepage
  blog.njk                # paginated blog index
  topic-index.njk         # auto-generates /blog/[topic]/ pages
  tag-index.njk           # auto-generates /tags/[tag]/ pages
  about.md
  search.njk
  404.md
  sitemap.njk
  robots.njk
public/
  admin/                  # Decap CMS
src/
  filters.js              # custom Eleventy filters (postDate, isoDate, limit)
  collections.js          # collection helpers (uniqueTopics, uniqueTags)
tests/                    # Vitest unit tests
```

## Writing content

### New blog post

Create `src/blog/[topic]/[slug].md`:

```markdown
---
title: Post Title
description: One-line summary shown in listings
date: 2026-05-07
topic: tech
tags: [rust, systems]
---

Post content here.
```

The topic value determines the URL (`/blog/tech/slug/`) and auto-creates the topic index page if it doesn't exist yet.

### New project

Create `src/projects/[slug].md`:

```markdown
---
title: Project Name
description: One-line summary shown on the card
url: https://github.com/...
date: 2026-01-01
status: active
tags: [rust]
---

Extended description (optional, shown on the card).
```

`status` can be `active`, `completed`, or `archived`. No individual project detail page is generated.

### Via Decap CMS

Browse to `/admin/` and sign in with Netlify Identity. The CMS supports both blog posts and projects.

## Customization

- **Site metadata:** `src/_data/site.json`
- **Colors/fonts:** `tailwind.config.js`
- **CSS:** `src/assets/styles/main.css`
- **Layouts:** `src/_includes/layouts/`
- **Filters/collections:** `src/filters.js`, `src/collections.js`, `eleventy.config.js`

## Tests

```bash
npm test
```

Unit tests cover the custom Eleventy filters (`postDate`, `isoDate`, `limit`) and collection helpers (`uniqueTopics`, `uniqueTags`). 15 tests, no external dependencies.

## Deploy

The site deploys automatically to Netlify on push to `master`. Build command: `npm run build`. Publish directory: `_site`.

# Portfolio + Blog Site — Design Spec

**Date:** 2026-05-07  
**Status:** Approved

---

## Overview

A personal portfolio and multi-topic blog for Sarina White. The site replaces a generic Eleventy boilerplate with a warm, clean design purpose-built for publishing research and writing across varied topics (tech, gardening, and others), alongside a projects showcase and an about page.

---

## Stack

| Concern | Choice | Replaces |
|---------|--------|---------|
| Static site generator | Eleventy 3.x | Eleventy 0.11 |
| Templates | Nunjucks | EJS |
| CSS framework | Tailwind CSS v3 via PostCSS | Tailwind v1.6 |
| Asset pipeline | PostCSS CLI + Eleventy passthrough copy | Webpack |
| Search | Pagefind (build-time, client-side) | None |
| CMS | Decap CMS (successor to Netlify CMS) | Netlify CMS |
| Hosting | Netlify (unchanged) | — |

**Why the full upgrade:** The current stack is from 2020. Since all content is placeholder, migration cost is near zero, and a clean modern base is far easier to maintain.

---

## Pages & URL Structure

| Page | URL | Notes |
|------|-----|-------|
| Home | `/` | Intro snippet + recent posts across all topics |
| About | `/about/` | Full bio, interests, contact |
| Projects | `/projects/` | Card grid of projects/research |
| Blog index | `/blog/` | All posts, newest first, paginated |
| Topic index | `/blog/[topic]/` | e.g. `/blog/tech/`, `/blog/gardening/` |
| Individual post | `/blog/[topic]/[slug]/` | e.g. `/blog/tech/my-rust-post/` |
| Tag index | `/tags/[tag]/` | e.g. `/tags/rust/` |
| Search | `/search/` | Pagefind-powered full-text search |
| 404 | `/404.html` | Custom error page |

**Navigation:** Top bar — site name/logo left, links right: Blog · Projects · About · Search icon.

**Topics vs. tags:** Topics are broad top-level sections (e.g. `tech`, `gardening`). Tags are finer-grained cross-cutting labels within topics (e.g. `rust`, `composting`). Topics should not duplicate tag names to avoid redundant index pages.

---

## Content Model

### Blog Posts
Location: `src/blog/[topic]/[slug].md`

```yaml
---
title: Post Title
description: One-line summary shown in listings
date: 2026-05-07
topic: tech           # determines URL and topic index
tags: [rust, systems] # finer-grained labels
---
```

Topic index pages are generated using Eleventy's pagination API: a single `topic-index.njk` template iterates over a collection of unique topic values and emits one page per topic. Adding a new `topic` value to any post's frontmatter automatically creates a new index page at the next build — no config change needed.

### Projects
Location: `src/projects/[slug].md`

Projects have no individual detail pages — they are rendered as cards on the Projects page only. The Markdown body can contain extended description, but no `/projects/[slug]/` URL is generated.

```yaml
---
title: Project Name
description: One-line summary shown on the card
url: https://github.com/...   # optional external link
date: 2026-01-01
status: active                # active | completed | archived
tags: [rust, research]
---
```

### About
Location: `src/about.md` — single Markdown file with bio content.

### Site Metadata
Location: `src/_data/site.json` — name, title, description, social links, author email.

---

## Search

Pagefind indexes the built `_site/` directory at build time.

**Build command:** `eleventy && pagefind --site _site`

- Search page at `/search/` with a text input; results load client-side with no server
- Searches posts, projects, and the about page
- Results show: title, matched excerpt, URL
- No external service or API key required

---

## Content Authoring

Two workflows, both supported:

1. **Markdown directly** — create `.md` files in `src/blog/[topic]/` or `src/projects/`, push to deploy
2. **Decap CMS** — browser-based editor at `/admin/`, same Netlify Identity auth as before

Decap CMS config (`public/admin/config.yml`) updated to reflect new collections: `blog` (with topic field) and `projects`.

---

## Visual Design

**Aesthetic:** Warm-clean — readable, personal, approachable. Not sparse or corporate.

### Typography
| Use | Font |
|-----|------|
| Headings | Lora (serif) — adds warmth |
| Body | Inter (sans-serif) — clean, readable |
| Code | JetBrains Mono (monospace) |

Fonts loaded via Google Fonts.

### Color Palette
| Token | Value | Use |
|-------|-------|-----|
| Background | `#faf9f7` | Warm off-white page background |
| Surface | `#f4f2ef` | Cards, code blocks |
| Text primary | `#1c1917` | Body text, headings |
| Text muted | `#78716c` | Dates, metadata, captions |
| Accent | `#6b8f71` | Links, tag pills, topic badges (muted sage green) |
| Accent hover | `#4d6b53` | Darker on hover |
| Border | `#e5e0d8` | Dividers, card outlines |

### Layout
- Centered content column: max-width ~680px for reading comfort
- Projects page: 2-column card grid (stacks to 1 column on mobile)
- Top nav: name left, links right
- Blog listing: title + date + topic pill + description excerpt
- Responsive — mobile-first, no separate breakpoint designs needed

### JavaScript
- Pagefind search widget only (loaded on `/search/` page)
- Decap CMS identity widget (loaded on homepage for Netlify Identity)
- No other JS

---

## File Structure

```
src/
  _data/
    site.json           # site-wide metadata
  _includes/
    layouts/
      base.njk          # master layout
      post.njk          # blog post layout
    components/
      nav.njk
      post-card.njk
      project-card.njk
      tag-pill.njk
  blog/
    tech/
      my-first-post.md
    gardening/
      composting-intro.md
  projects/
    my-project.md
  topic-index.njk       # pagination template that generates /blog/[topic]/ pages
  about.md
  index.njk             # homepage
  blog.njk              # blog index
  search.njk            # search page
  404.md
  robots.njk
  sitemap.njk
public/
  admin/
    config.yml          # Decap CMS config (updated)
    index.html
  assets/
    images/
_site/                  # build output
```

---

## Build Scripts

```json
{
  "dev": "concurrently \"npx @11ty/eleventy --serve\" \"postcss src/assets/styles/main.css -o _site/assets/styles/main.css --watch\"",
  "build": "eleventy && pagefind --site _site",
  "clean": "rm -rf _site"
}
```

---

## Out of Scope

- Comments system
- RSS feed (can be added later as a small addition)
- Dark mode
- Analytics
- i18n / multiple languages

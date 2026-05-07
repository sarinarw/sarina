# Portfolio + Blog Site Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite sarinawhite-eleventy from a 2020 Eleventy boilerplate into a warm, clean personal portfolio + multi-topic blog with full-text search.

**Architecture:** Eleventy 3.x with Nunjucks templates generates all pages. PostCSS compiles Tailwind v3 CSS separately from the Eleventy build. Pagefind runs after the Eleventy build to index the output HTML for client-side search. Decap CMS provides a browser-based editing UI at `/admin/`.

**Tech Stack:** Eleventy 3.x, Nunjucks, Tailwind CSS v3, PostCSS, Pagefind, Decap CMS, Netlify

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `package.json` | Rewrite | Dependencies + build scripts |
| `eleventy.config.js` | Create | Collections, filters, passthrough copy |
| `.eleventy.js` | Delete | Replaced by above |
| `tailwind.config.js` | Rewrite | Custom color palette + fonts |
| `postcss.config.js` | Update | Tailwind + autoprefixer + cssnano |
| `src/assets/styles/main.css` | Rewrite | Tailwind directives + prose + Prism styles |
| `src/_data/site.json` | Update | Site name, author, URL |
| `src/_data/layout.js` | Delete | No longer needed |
| `src/_includes/layouts/base.njk` | Create | Master HTML layout |
| `src/_includes/layouts/post.njk` | Create | Blog post layout |
| `src/_includes/components/nav.njk` | Create | Site navigation header |
| `src/index.njk` | Rewrite | Homepage |
| `src/blog.njk` | Create | Paginated blog index |
| `src/topic-index.njk` | Create | Auto-generates `/blog/[topic]/` pages |
| `src/tag-index.njk` | Create | Auto-generates `/tags/[tag]/` pages |
| `src/about.md` | Create | About page |
| `src/projects.njk` | Create | Projects card grid |
| `src/search.njk` | Create | Pagefind search UI |
| `src/404.md` | Rewrite | Custom 404 |
| `src/robots.njk` | Rewrite | robots.txt |
| `src/sitemap.njk` | Rewrite | sitemap.xml |
| `src/blog/blog.json` | Create | Directory data: layout + collection tag |
| `src/blog/tech/getting-started.md` | Create | Sample tech post |
| `src/blog/gardening/composting-basics.md` | Create | Sample gardening post |
| `src/projects/sample-project.md` | Create | Sample project |
| `public/admin/index.html` | Update | Decap CMS CDN |
| `public/admin/config.yml` | Rewrite | Decap CMS collections |
| All `src/posts/` files | Delete | Replaced by `src/blog/` |
| All `src/**/*.ejs` files | Delete | Replaced by `.njk` |
| `webpack.config.js`, `webpack.html` | Delete | Replaced by PostCSS CLI |

---

## Task 1: Update package.json and install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace package.json**

```json
{
  "name": "sarinawhite",
  "version": "1.0.0",
  "description": "Sarina White's personal site",
  "scripts": {
    "dev": "concurrently \"npx @11ty/eleventy --serve --incremental\" \"postcss src/assets/styles/main.css -o _site/assets/styles/main.css --watch\"",
    "build": "npx @11ty/eleventy && postcss src/assets/styles/main.css -o _site/assets/styles/main.css && npx pagefind --site _site",
    "clean": "rimraf _site",
    "format": "prettier '**/*.{js,json,njk,md}' --write --ignore-path .prettierignore"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-plugin-syntaxhighlight": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^8.2.0",
    "cssnano": "^7.0.0",
    "pagefind": "^1.3.0",
    "postcss": "^8.4.0",
    "postcss-cli": "^11.0.0",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: installs without errors. `node_modules/@11ty/eleventy`, `node_modules/tailwindcss`, `node_modules/pagefind` all present.

- [ ] **Step 3: Verify Eleventy 3.x is installed**

```bash
npx @11ty/eleventy --version
```

Expected: output begins with `3.`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade to Eleventy 3.x, Tailwind v3, add Pagefind"
```

---

## Task 2: Create new Eleventy config

**Files:**
- Create: `eleventy.config.js`
- Delete: `.eleventy.js`

- [ ] **Step 1: Delete old Eleventy config**

```bash
rm .eleventy.js
```

- [ ] **Step 2: Create `eleventy.config.js`**

```js
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  // Passthrough copy: public/ → _site/, images → _site/assets/images/
  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });

  // Global data available in all templates
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // Format a date as "May 7, 2026"
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateObj));
  });

  // Format a date as ISO 8601 string for <time datetime="...">
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // All blog posts sorted newest-first
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Sorted list of unique topic values from post frontmatter
  eleventyConfig.addCollection("topicList", (collectionApi) => {
    const topicSet = new Set();
    collectionApi.getFilteredByGlob("src/blog/**/*.md").forEach((item) => {
      if (item.data.topic) topicSet.add(item.data.topic);
    });
    return [...topicSet].sort();
  });

  // Sorted list of unique user-defined tags (excludes "posts" collection tag)
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tagSet = new Set();
    collectionApi.getFilteredByGlob("src/blog/**/*.md").forEach((item) => {
      (item.data.tags || []).forEach((tag) => {
        if (tag !== "posts") tagSet.add(tag);
      });
    });
    return [...tagSet].sort();
  });

  // All projects sorted newest-first
  eleventyConfig.addCollection("projects", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
```

- [ ] **Step 3: Verify config loads without errors**

```bash
npx @11ty/eleventy --dryrun 2>&1 | head -20
```

Expected: no `Error` or `Cannot find module` lines. May show warnings about missing templates — that's fine at this stage.

- [ ] **Step 4: Commit**

```bash
git add eleventy.config.js
git commit -m "feat: add Eleventy 3.x config with collections and filters"
```

---

## Task 3: Update Tailwind config, PostCSS config, and CSS

**Files:**
- Rewrite: `tailwind.config.js`
- Update: `postcss.config.js`
- Rewrite: `src/assets/styles/main.css`
- Delete: `src/assets/styles/prism-atom-dark.css`

- [ ] **Step 1: Rewrite `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,md,html,js}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        background: "#faf9f7",
        surface: "#f4f2ef",
        "text-primary": "#1c1917",
        "text-muted": "#78716c",
        accent: "#6b8f71",
        "accent-hover": "#4d6b53",
        border: "#e5e0d8",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Update `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
```

- [ ] **Step 3: Rewrite `src/assets/styles/main.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text-primary font-sans antialiased;
  }

  a {
    @apply text-accent underline underline-offset-2 decoration-accent/40 hover:text-accent-hover hover:decoration-accent-hover transition-colors;
  }

  .no-underline {
    text-decoration: none !important;
  }
}

@layer components {
  /* Prose styles for blog post body content */
  .prose-content h1 { @apply font-serif text-3xl font-bold text-text-primary mb-4 mt-10; }
  .prose-content h2 { @apply font-serif text-2xl font-bold text-text-primary mb-3 mt-8; }
  .prose-content h3 { @apply font-serif text-xl font-semibold text-text-primary mb-2 mt-6; }
  .prose-content h4 { @apply font-sans text-lg font-semibold text-text-primary mb-2 mt-4; }
  .prose-content p { @apply mb-5 leading-relaxed; }
  .prose-content ul { @apply list-disc pl-6 mb-5 space-y-1; }
  .prose-content ol { @apply list-decimal pl-6 mb-5 space-y-1; }
  .prose-content li > ul,
  .prose-content li > ol { @apply mt-1 mb-0; }
  .prose-content blockquote {
    @apply border-l-4 border-accent/30 pl-4 text-text-muted italic my-6;
  }
  .prose-content hr { @apply border-border my-8; }
  .prose-content strong { @apply font-semibold text-text-primary; }
  .prose-content code {
    @apply font-mono text-sm bg-surface px-1.5 py-0.5 rounded text-text-primary;
  }
  .prose-content pre {
    @apply bg-surface rounded-lg p-5 mb-6 overflow-x-auto border border-border;
  }
  .prose-content pre code {
    @apply bg-transparent p-0 text-sm;
  }
  .prose-content img {
    @apply rounded-lg max-w-full my-6;
  }
  .prose-content table {
    @apply w-full border-collapse mb-6 text-sm;
  }
  .prose-content th {
    @apply border border-border px-4 py-2 text-left bg-surface font-semibold;
  }
  .prose-content td {
    @apply border border-border px-4 py-2;
  }
}

/* Prism syntax highlighting — warm light theme */
code[class*="language-"],
pre[class*="language-"] {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #1c1917;
  direction: ltr;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  tab-size: 2;
  hyphens: none;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata { color: #78716c; }
.token.punctuation { color: #57534e; }
.token.keyword,
.token.boolean,
.token.number,
.token.deleted { color: #92400e; }
.token.string,
.token.char,
.token.attr-value,
.token.inserted { color: #166534; }
.token.operator,
.token.entity,
.token.url { color: #1e40af; }
.token.atrule,
.token.function,
.token.class-name { color: #6d28d9; }
.token.regex,
.token.important,
.token.variable { color: #b45309; }
.token.tag,
.token.attr-name { color: #0369a1; }
.token.important,
.token.bold { font-weight: bold; }
.token.italic { font-style: italic; }
```

- [ ] **Step 4: Delete old Prism CSS file**

```bash
rm src/assets/styles/prism-atom-dark.css
```

- [ ] **Step 5: Verify PostCSS compiles without errors**

```bash
npx postcss src/assets/styles/main.css -o /tmp/test-main.css 2>&1
```

Expected: no errors. `/tmp/test-main.css` should contain compiled CSS with Tailwind utilities.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.js postcss.config.js src/assets/styles/main.css
git rm src/assets/styles/prism-atom-dark.css
git commit -m "feat: add Tailwind v3 config and new CSS with warm design system"
```

---

## Task 4: Delete old source files

**Files:**
- Delete: `src/index.ejs`, `src/robots.ejs`, `src/sitemap.ejs`
- Delete: `src/_includes/layouts/base.ejs`, `src/_includes/layouts/post.ejs`
- Delete: `src/_data/layout.js`
- Delete: `src/posts/` (entire directory)
- Delete: `webpack.config.js`, `webpack.html`

- [ ] **Step 1: Delete old EJS templates**

```bash
rm src/index.ejs src/robots.ejs src/sitemap.ejs
rm src/_includes/layouts/base.ejs src/_includes/layouts/post.ejs
```

- [ ] **Step 2: Delete old data file and posts**

```bash
rm src/_data/layout.js
rm -rf src/posts
```

- [ ] **Step 3: Delete Webpack files**

```bash
rm webpack.config.js webpack.html
```

- [ ] **Step 4: Verify deletions**

```bash
find src -name "*.ejs" && find src -name "*.ejs" | wc -l
```

Expected: output line count is `0` (no `.ejs` files remain).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old EJS templates, posts, and webpack files"
```

---

## Task 5: Update site metadata

**Files:**
- Modify: `src/_data/site.json`

- [ ] **Step 1: Update `src/_data/site.json`**

```json
{
  "site_name": "Sarina White",
  "title": "Sarina White — Writing & Projects",
  "description": "Research and writing on tech, gardening, and other things I'm curious about.",
  "url": "https://sarinawhite.com",
  "locale": "en",
  "author": "Sarina White",
  "social": {
    "github": "https://github.com/sarinarw"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/_data/site.json
git commit -m "chore: update site metadata with real author info"
```

---

## Task 6: Create base layout and nav component

**Files:**
- Create: `src/_includes/layouts/base.njk`
- Create: `src/_includes/components/nav.njk`

- [ ] **Step 1: Create components directory**

```bash
mkdir -p src/_includes/components
```

- [ ] **Step 2: Create `src/_includes/components/nav.njk`**

```njk
<header class="border-b border-border bg-background">
  <nav class="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-serif text-xl font-semibold text-text-primary no-underline hover:text-accent transition-colors">
      {{ site.site_name }}
    </a>
    <ul class="flex items-center gap-6 list-none m-0 p-0">
      <li>
        <a href="/blog/" class="text-text-muted hover:text-text-primary no-underline text-sm font-medium transition-colors">Blog</a>
      </li>
      <li>
        <a href="/projects/" class="text-text-muted hover:text-text-primary no-underline text-sm font-medium transition-colors">Projects</a>
      </li>
      <li>
        <a href="/about/" class="text-text-muted hover:text-text-primary no-underline text-sm font-medium transition-colors">About</a>
      </li>
      <li>
        <a href="/search/" class="text-text-muted hover:text-text-primary no-underline transition-colors" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </a>
      </li>
    </ul>
  </nav>
</header>
```

- [ ] **Step 3: Create `src/_includes/layouts/base.njk`**

```njk
<!DOCTYPE html>
<html lang="{{ site.locale }}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" href="/favicon.ico" />

  <title>{% if title and title != site.site_name %}{{ title }} — {{ site.site_name }}{% else %}{{ site.site_name }}{% endif %}</title>
  <meta name="description" content="{{ description or site.description }}" />
  <meta name="author" content="{{ site.author }}" />

  <meta property="og:title" content="{{ title or site.site_name }}" />
  <meta property="og:description" content="{{ description or site.description }}" />
  <meta property="og:locale" content="{{ site.locale }}" />
  <meta property="og:site_name" content="{{ site.site_name }}" />

  {% if layout == "layouts/post.njk" %}
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="{{ date | isoDate }}" />
  <script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "BlogPosting",
    "headline": "{{ title }}",
    "description": "{{ description or site.description }}",
    "author": { "@type": "Person", "name": "{{ site.author }}" },
    "url": "{{ site.url }}{{ page.url }}",
    "datePublished": "{{ date | isoDate }}"
  }
  </script>
  {% endif %}

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/styles/main.css" />

  {% if pagefind %}
  <link href="/_pagefind/pagefind-ui.css" rel="stylesheet" />
  {% endif %}

  {% if page.url == "/" %}
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  {% endif %}
</head>
<body class="bg-background text-text-primary min-h-screen flex flex-col">
  {% include "components/nav.njk" %}

  <main class="max-w-2xl mx-auto px-6 py-12 flex-1 w-full">
    {{ content | safe }}
  </main>

  <footer class="border-t border-border py-8 mt-8">
    <div class="max-w-2xl mx-auto px-6 flex items-center justify-between text-sm text-text-muted">
      <p>© {{ currentYear }} {{ site.author }}</p>
      <nav class="flex gap-4">
        {% if site.social.github %}
        <a href="{{ site.social.github }}" class="no-underline hover:text-text-primary transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
        {% endif %}
        <a href="/sitemap.xml" class="no-underline hover:text-text-primary transition-colors">Sitemap</a>
      </nav>
    </div>
  </footer>

  {% if pagefind %}
  <script src="/_pagefind/pagefind-ui.js"></script>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      new PagefindUI({ element: "#search", showSubResults: true });
    });
  </script>
  {% endif %}

  {% if page.url == "/" %}
  <script>
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', (user) => {
        if (!user) {
          window.netlifyIdentity.on('login', () => {
            document.location.href = '/admin/';
          });
        }
      });
    }
  </script>
  {% endif %}
</body>
</html>
```

- [ ] **Step 4: Quick smoke-test — verify Eleventy can find and parse the layout**

```bash
npx @11ty/eleventy --dryrun 2>&1 | grep -i error | head -10
```

Expected: no output (no errors). If there are errors about missing templates that's fine — we haven't created content files yet.

- [ ] **Step 5: Commit**

```bash
git add src/_includes/
git commit -m "feat: add base layout and nav component"
```

---

## Task 7: Create post layout

**Files:**
- Create: `src/_includes/layouts/post.njk`

- [ ] **Step 1: Create `src/_includes/layouts/post.njk`**

```njk
---
layout: layouts/base.njk
---
<article>
  <header class="mb-10">
    <div class="flex items-center gap-2 text-sm text-text-muted mb-3">
      <a href="/blog/{{ topic }}/" class="text-accent hover:text-accent-hover no-underline font-medium capitalize transition-colors">
        {{ topic }}
      </a>
      <span aria-hidden="true">·</span>
      <time datetime="{{ date | isoDate }}">{{ date | postDate }}</time>
    </div>
    <h1 class="font-serif text-4xl font-bold text-text-primary leading-tight mb-4">{{ title }}</h1>
    {% if description %}
    <p class="text-xl text-text-muted leading-relaxed">{{ description }}</p>
    {% endif %}
    <div class="flex flex-wrap gap-2 mt-5">
      {% for tag in tags %}{% if tag != "posts" %}
      <a href="/tags/{{ tag }}/" class="inline-block px-2.5 py-0.5 bg-surface text-accent text-xs font-medium rounded-full border border-border hover:bg-accent hover:text-white transition-colors no-underline">
        {{ tag }}
      </a>
      {% endif %}{% endfor %}
    </div>
  </header>

  <div class="prose-content">
    {{ content | safe }}
  </div>

  <footer class="mt-12 pt-8 border-t border-border">
    <a href="/blog/{{ topic }}/" class="text-accent hover:text-accent-hover no-underline text-sm font-medium transition-colors">
      ← More {{ topic }} posts
    </a>
  </footer>
</article>
```

- [ ] **Step 2: Commit**

```bash
git add src/_includes/layouts/post.njk
git commit -m "feat: add blog post layout"
```

---

## Task 8: Create homepage

**Files:**
- Create: `src/index.njk`

- [ ] **Step 1: Create `src/index.njk`**

```njk
---
layout: layouts/base.njk
title: Home
---
<section class="mb-14">
  <h1 class="font-serif text-4xl font-bold text-text-primary mb-4">
    Hi, I'm {{ site.author }}
  </h1>
  <p class="text-xl text-text-muted leading-relaxed max-w-prose">
    {{ site.description }}
  </p>
</section>

<section>
  <div class="flex items-baseline justify-between mb-6">
    <h2 class="font-serif text-2xl font-semibold text-text-primary">Recent Writing</h2>
    <a href="/blog/" class="text-sm text-accent hover:text-accent-hover no-underline font-medium transition-colors">All posts →</a>
  </div>

  {% set recentPosts = collections.posts | slice(0, 5) %}

  {% if recentPosts.length == 0 %}
    <p class="text-text-muted">No posts yet. Check back soon.</p>
  {% else %}
    <ul class="space-y-0 list-none p-0 m-0 divide-y divide-border">
      {% for post in recentPosts %}
      <li class="py-6 first:pt-0">
        <div class="flex items-center gap-2 text-sm text-text-muted mb-1.5">
          <a href="/blog/{{ post.data.topic }}/" class="text-accent hover:text-accent-hover no-underline font-medium capitalize transition-colors">
            {{ post.data.topic }}
          </a>
          <span aria-hidden="true">·</span>
          <time datetime="{{ post.date | isoDate }}">{{ post.date | postDate }}</time>
        </div>
        <h3 class="font-serif text-xl font-semibold mb-1">
          <a href="{{ post.url }}" class="text-text-primary hover:text-accent no-underline transition-colors">
            {{ post.data.title }}
          </a>
        </h3>
        {% if post.data.description %}
        <p class="text-text-muted text-sm leading-relaxed">{{ post.data.description }}</p>
        {% endif %}
      </li>
      {% endfor %}
    </ul>
  {% endif %}
</section>
```

- [ ] **Step 2: Verify Eleventy builds `_site/index.html`**

```bash
npx @11ty/eleventy 2>&1 | tail -5
```

Expected: `Wrote X files in Y seconds`. `_site/index.html` should exist even if `collections.posts` is empty.

```bash
ls _site/index.html
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add src/index.njk
git commit -m "feat: add homepage"
```

---

## Task 9: Create blog directory data and sample posts

**Files:**
- Create: `src/blog/blog.json`
- Create: `src/blog/tech/getting-started.md`
- Create: `src/blog/gardening/composting-basics.md`
- Create: `src/projects/` directory (needed later, create now so git tracks it)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/blog/tech src/blog/gardening src/projects
```

- [ ] **Step 2: Create `src/blog/blog.json`**

This directory data file applies the post layout and "posts" collection tag to all files in `src/blog/**`.

```json
{
  "tags": ["posts"],
  "layout": "layouts/post.njk"
}
```

- [ ] **Step 3: Create `src/blog/tech/getting-started.md`**

```markdown
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
```

- [ ] **Step 4: Create `src/blog/gardening/composting-basics.md`**

```markdown
---
title: Composting Basics
description: What I've learned setting up a compost bin for the first time.
date: 2026-04-20
topic: gardening
tags: [composting, soil]
---

I started composting this spring. Here are the basics that actually worked for me.

## Brown vs. Green

The most important thing: balance carbon-rich "browns" (dry leaves, cardboard, straw)
with nitrogen-rich "greens" (food scraps, grass clippings, coffee grounds).

Aim for roughly 3 parts brown to 1 part green by volume.

## What to Avoid

- Meat, fish, dairy — attracts pests
- Diseased plants — spreads problems to your garden
- Glossy paper — doesn't break down well

## Moisture and Turning

The pile should feel like a wrung-out sponge — damp but not dripping. Turn it every
1–2 weeks to add oxygen and speed decomposition.

My first batch was ready in about 8 weeks during warm weather.
```

- [ ] **Step 5: Verify posts appear in build**

```bash
npx @11ty/eleventy 2>&1 | grep "blog"
```

Expected: output includes lines like `_site/blog/tech/getting-started/index.html` and `_site/blog/gardening/composting-basics/index.html`.

- [ ] **Step 6: Commit**

```bash
git add src/blog/ src/projects/
git commit -m "feat: add blog directory data and sample posts"
```

---

## Task 10: Create blog index page

**Files:**
- Create: `src/blog.njk`

- [ ] **Step 1: Create `src/blog.njk`**

```njk
---
layout: layouts/base.njk
title: Blog
pagination:
  data: collections.posts
  size: 10
  alias: paginatedPosts
permalink: "blog/{% if pagination.pageNumber > 0 %}page/{{ pagination.pageNumber + 1 }}/{% endif %}"
---
<header class="mb-10">
  <h1 class="font-serif text-4xl font-bold text-text-primary mb-4">Blog</h1>
  {% if collections.topicList.length > 0 %}
  <div class="flex flex-wrap gap-2">
    {% for topic in collections.topicList %}
    <a href="/blog/{{ topic }}/" class="inline-block px-3 py-1 bg-surface text-text-muted text-sm rounded-full border border-border hover:border-accent hover:text-accent transition-colors no-underline capitalize">
      {{ topic }}
    </a>
    {% endfor %}
  </div>
  {% endif %}
</header>

{% if paginatedPosts.length == 0 %}
  <p class="text-text-muted">No posts yet.</p>
{% else %}
  <ul class="space-y-0 list-none p-0 m-0 divide-y divide-border">
    {% for post in paginatedPosts %}
    <li class="py-8 first:pt-0">
      <div class="flex items-center gap-2 text-sm text-text-muted mb-1.5">
        <a href="/blog/{{ post.data.topic }}/" class="text-accent hover:text-accent-hover no-underline font-medium capitalize transition-colors">
          {{ post.data.topic }}
        </a>
        <span aria-hidden="true">·</span>
        <time datetime="{{ post.date | isoDate }}">{{ post.date | postDate }}</time>
      </div>
      <h2 class="font-serif text-2xl font-semibold mb-2">
        <a href="{{ post.url }}" class="text-text-primary hover:text-accent no-underline transition-colors">
          {{ post.data.title }}
        </a>
      </h2>
      {% if post.data.description %}
      <p class="text-text-muted mb-3 leading-relaxed">{{ post.data.description }}</p>
      {% endif %}
      <div class="flex flex-wrap gap-2">
        {% for tag in post.data.tags %}{% if tag != "posts" %}
        <a href="/tags/{{ tag }}/" class="inline-block px-2.5 py-0.5 bg-surface text-accent text-xs font-medium rounded-full border border-border hover:bg-accent hover:text-white transition-colors no-underline">
          {{ tag }}
        </a>
        {% endif %}{% endfor %}
      </div>
    </li>
    {% endfor %}
  </ul>

  {% if pagination.pages.length > 1 %}
  <nav class="mt-10 flex justify-between text-sm" aria-label="Pagination">
    {% if pagination.href.previous %}
    <a href="{{ pagination.href.previous }}" class="text-accent hover:text-accent-hover no-underline font-medium transition-colors">← Newer posts</a>
    {% else %}<span></span>{% endif %}
    {% if pagination.href.next %}
    <a href="{{ pagination.href.next }}" class="text-accent hover:text-accent-hover no-underline font-medium transition-colors">Older posts →</a>
    {% endif %}
  </nav>
  {% endif %}
{% endif %}
```

- [ ] **Step 2: Verify `/blog/` builds**

```bash
npx @11ty/eleventy 2>&1 | grep "_site/blog/index"
```

Expected: a line containing `_site/blog/index.html`.

- [ ] **Step 3: Commit**

```bash
git add src/blog.njk
git commit -m "feat: add paginated blog index with topic filters"
```

---

## Task 11: Create topic index and tag index templates

**Files:**
- Create: `src/topic-index.njk`
- Create: `src/tag-index.njk`

- [ ] **Step 1: Create `src/topic-index.njk`**

Eleventy's pagination API generates one page per topic from the `topicList` collection.

```njk
---
layout: layouts/base.njk
pagination:
  data: collections.topicList
  size: 1
  alias: topic
permalink: /blog/{{ topic }}/
eleventyComputed:
  title: "{{ topic | capitalize }}"
---
{% set topicPosts = collections.posts | selectattr("data.topic", "equalto", topic) %}

<header class="mb-10">
  <p class="text-sm text-text-muted mb-2">
    <a href="/blog/" class="text-accent hover:text-accent-hover no-underline transition-colors">Blog</a>
    <span aria-hidden="true"> / </span>
  </p>
  <h1 class="font-serif text-4xl font-bold text-text-primary capitalize">{{ topic }}</h1>
  <p class="text-text-muted mt-2 text-sm">
    {{ topicPosts | length }} post{% if (topicPosts | length) != 1 %}s{% endif %}
  </p>
</header>

{% if (topicPosts | length) == 0 %}
  <p class="text-text-muted">No posts in this topic yet.</p>
{% else %}
  <ul class="space-y-0 list-none p-0 m-0 divide-y divide-border">
    {% for post in topicPosts %}
    <li class="py-8 first:pt-0">
      <time datetime="{{ post.date | isoDate }}" class="text-sm text-text-muted">{{ post.date | postDate }}</time>
      <h2 class="font-serif text-2xl font-semibold mt-1 mb-2">
        <a href="{{ post.url }}" class="text-text-primary hover:text-accent no-underline transition-colors">
          {{ post.data.title }}
        </a>
      </h2>
      {% if post.data.description %}
      <p class="text-text-muted mb-3 leading-relaxed">{{ post.data.description }}</p>
      {% endif %}
      <div class="flex flex-wrap gap-2">
        {% for tag in post.data.tags %}{% if tag != "posts" %}
        <a href="/tags/{{ tag }}/" class="inline-block px-2.5 py-0.5 bg-surface text-accent text-xs font-medium rounded-full border border-border hover:bg-accent hover:text-white transition-colors no-underline">
          {{ tag }}
        </a>
        {% endif %}{% endfor %}
      </div>
    </li>
    {% endfor %}
  </ul>
{% endif %}
```

- [ ] **Step 2: Create `src/tag-index.njk`**

```njk
---
layout: layouts/base.njk
pagination:
  data: collections.tagList
  size: 1
  alias: tag
permalink: /tags/{{ tag }}/
eleventyComputed:
  title: "{{ tag }}"
---
{% set taggedPosts = collections[tag] | reverse %}

<header class="mb-10">
  <h1 class="font-serif text-4xl font-bold text-text-primary">#{{ tag }}</h1>
  <p class="text-text-muted mt-2 text-sm">
    {{ taggedPosts | length }} post{% if (taggedPosts | length) != 1 %}s{% endif %}
  </p>
</header>

{% if not taggedPosts or (taggedPosts | length) == 0 %}
  <p class="text-text-muted">No posts with this tag.</p>
{% else %}
  <ul class="space-y-0 list-none p-0 m-0 divide-y divide-border">
    {% for post in taggedPosts %}
    <li class="py-8 first:pt-0">
      <div class="flex items-center gap-2 text-sm text-text-muted mb-1.5">
        <a href="/blog/{{ post.data.topic }}/" class="text-accent hover:text-accent-hover no-underline font-medium capitalize transition-colors">
          {{ post.data.topic }}
        </a>
        <span aria-hidden="true">·</span>
        <time datetime="{{ post.date | isoDate }}">{{ post.date | postDate }}</time>
      </div>
      <h2 class="font-serif text-2xl font-semibold mb-2">
        <a href="{{ post.url }}" class="text-text-primary hover:text-accent no-underline transition-colors">
          {{ post.data.title }}
        </a>
      </h2>
      {% if post.data.description %}
      <p class="text-text-muted leading-relaxed">{{ post.data.description }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
{% endif %}
```

- [ ] **Step 3: Verify topic and tag pages build**

```bash
npx @11ty/eleventy 2>&1 | grep -E "_site/(blog/tech|blog/gardening|tags/)" | head -10
```

Expected: lines like `_site/blog/tech/index.html`, `_site/blog/gardening/index.html`, `_site/tags/meta/index.html`, etc.

- [ ] **Step 4: Commit**

```bash
git add src/topic-index.njk src/tag-index.njk
git commit -m "feat: add auto-generated topic and tag index pages"
```

---

## Task 12: Create projects page and sample project

**Files:**
- Create: `src/projects.njk`
- Create: `src/projects/sample-project.md`

- [ ] **Step 1: Create `src/projects.njk`**

```njk
---
layout: layouts/base.njk
title: Projects
permalink: /projects/
---
<header class="mb-10">
  <h1 class="font-serif text-4xl font-bold text-text-primary mb-2">Projects</h1>
  <p class="text-text-muted">Things I've built, researched, and explored.</p>
</header>

{% if collections.projects.length == 0 %}
  <p class="text-text-muted">No projects yet.</p>
{% else %}
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    {% for project in collections.projects %}
    <article class="bg-surface border border-border rounded-xl p-6 flex flex-col">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h2 class="font-serif text-xl font-semibold text-text-primary leading-tight">
          {{ project.data.title }}
        </h2>
        <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0
          {% if project.data.status == 'active' %}bg-green-100 text-green-700
          {% elif project.data.status == 'completed' %}bg-blue-100 text-blue-700
          {% else %}bg-surface text-text-muted border border-border{% endif %}">
          {{ project.data.status }}
        </span>
      </div>
      <p class="text-text-muted text-sm leading-relaxed flex-1 mb-5">
        {{ project.data.description }}
      </p>
      <div class="flex items-center justify-between mt-auto">
        {% if project.data.url %}
        <a href="{{ project.data.url }}" class="text-accent hover:text-accent-hover no-underline text-sm font-medium transition-colors" target="_blank" rel="noopener noreferrer">
          View →
        </a>
        {% else %}
        <span></span>
        {% endif %}
        <time class="text-xs text-text-muted">{{ project.date | postDate }}</time>
      </div>
    </article>
    {% endfor %}
  </div>
{% endif %}
```

- [ ] **Step 2: Create `src/projects/sample-project.md`**

```markdown
---
title: This Site
description: Personal portfolio and blog built with Eleventy 3.x, Tailwind CSS v3, and Pagefind.
url: https://github.com/sarinarw/sarinawhite-eleventy
date: 2026-05-07
status: active
tags: [eleventy, web]
---

Built to replace a generic boilerplate with something personal. Uses Pagefind for search
and Decap CMS for browser-based editing.
```

- [ ] **Step 3: Verify projects page builds**

```bash
npx @11ty/eleventy 2>&1 | grep "_site/projects"
```

Expected: a line containing `_site/projects/index.html`.

- [ ] **Step 4: Commit**

```bash
git add src/projects.njk src/projects/
git commit -m "feat: add projects page and sample project"
```

---

## Task 13: Create about, 404, search, sitemap, and robots pages

**Files:**
- Create: `src/about.md`
- Rewrite: `src/404.md`
- Create: `src/search.njk`
- Rewrite: `src/sitemap.ejs` → `src/sitemap.njk`
- Rewrite: `src/robots.ejs` → `src/robots.njk`

(Note: `src/robots.ejs` and `src/sitemap.ejs` were deleted in Task 4. Creating fresh `.njk` versions.)

- [ ] **Step 1: Create `src/about.md`**

```markdown
---
layout: layouts/base.njk
title: About
permalink: /about/
---

# About Me

Hi, I'm Sarina White.

I research and write about things I'm curious about — currently a mix of tech, gardening,
and other random topics I'm digging into.

## Get in Touch

Feel free to reach out on [GitHub](https://github.com/sarinarw).
```

- [ ] **Step 2: Create `src/404.md`**

```markdown
---
layout: layouts/base.njk
title: Page Not Found
permalink: /404.html
eleventyExcludeFromCollections: true
---

<div class="text-center py-20">
  <p class="font-serif text-8xl font-bold text-border mb-4">404</p>
  <h1 class="font-serif text-2xl font-semibold text-text-primary mb-4">Page not found</h1>
  <p class="text-text-muted mb-8">The page you're looking for doesn't exist.</p>
  <a href="/" class="text-accent hover:text-accent-hover no-underline font-medium transition-colors">← Back home</a>
</div>
```

- [ ] **Step 3: Create `src/search.njk`**

```njk
---
layout: layouts/base.njk
title: Search
permalink: /search/
pagefind: true
---
<header class="mb-8">
  <h1 class="font-serif text-4xl font-bold text-text-primary mb-2">Search</h1>
  <p class="text-text-muted">Search across all posts, projects, and pages.</p>
</header>

<div id="search"></div>
```

- [ ] **Step 4: Create `src/sitemap.njk`**

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {%- for item in collections.all %}
  {%- if item.url and not item.data.eleventyExcludeFromCollections %}
  <url>
    <loc>{{ site.url }}{{ item.url }}</loc>
    {%- if item.date %}
    <lastmod>{{ item.date | isoDate }}</lastmod>
    {%- endif %}
  </url>
  {%- endif %}
  {%- endfor %}
</urlset>
```

- [ ] **Step 5: Create `src/robots.njk`**

```njk
---
permalink: /robots.txt
eleventyExcludeFromCollections: true
---
User-agent: *
Allow: /

Sitemap: {{ site.url }}/sitemap.xml
```

- [ ] **Step 6: Verify all pages build**

```bash
npx @11ty/eleventy 2>&1 | tail -3
```

Expected: `Wrote X files in Y seconds` with no errors.

```bash
ls _site/about/index.html _site/404.html _site/search/index.html _site/sitemap.xml _site/robots.txt
```

Expected: all five files exist.

- [ ] **Step 7: Commit**

```bash
git add src/about.md src/404.md src/search.njk src/sitemap.njk src/robots.njk
git commit -m "feat: add about, 404, search, sitemap, and robots pages"
```

---

## Task 14: Update Decap CMS

**Files:**
- Rewrite: `public/admin/index.html`
- Rewrite: `public/admin/config.yml`

- [ ] **Step 1: Rewrite `public/admin/index.html`**

Changes the CDN from Netlify CMS to Decap CMS.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </head>
  <body></body>
</html>
```

- [ ] **Step 2: Rewrite `public/admin/config.yml`**

```yaml
backend:
  name: git-gateway
  branch: master

media_folder: 'public/assets/images'
public_folder: '/assets/images'

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/blog"
    create: true
    nested:
      depth: 2
    slug: "{{slug}}"
    editor:
      preview: false
    fields:
      - { name: "title", label: "Title", widget: "string" }
      - { name: "description", label: "Description", widget: "string" }
      - { name: "date", label: "Date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - { name: "topic", label: "Topic", widget: "string", hint: "Top-level section, e.g. tech, gardening" }
      - name: "tags"
        label: "Tags"
        widget: "list"
        hint: "Fine-grained labels within the topic, e.g. rust, composting"
        required: false
      - { name: "body", label: "Body", widget: "markdown" }

  - name: "projects"
    label: "Projects"
    folder: "src/projects"
    create: true
    slug: "{{slug}}"
    editor:
      preview: false
    fields:
      - { name: "title", label: "Title", widget: "string" }
      - { name: "description", label: "Description", widget: "string", hint: "One-line summary shown on the card" }
      - { name: "url", label: "URL", widget: "string", required: false, hint: "Optional link to project" }
      - { name: "date", label: "Date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - name: "status"
        label: "Status"
        widget: "select"
        options: ["active", "completed", "archived"]
        default: "active"
      - name: "tags"
        label: "Tags"
        widget: "list"
        required: false
      - { name: "body", label: "Body", widget: "markdown", required: false }

  - name: "config"
    label: "Site Config"
    editor:
      preview: false
    files:
      - name: "global"
        label: "Global Settings"
        file: "src/_data/site.json"
        fields:
          - { name: "site_name", label: "Site Name" }
          - { name: "title", label: "Site Title" }
          - { name: "description", label: "Site Description" }
          - { name: "url", label: "Site URL" }
          - { name: "locale", label: "Locale" }
          - { name: "author", label: "Author Name" }
```

- [ ] **Step 3: Commit**

```bash
git add public/admin/
git commit -m "feat: migrate from Netlify CMS to Decap CMS, update collections config"
```

---

## Task 15: Full build verification and final commit

**Files:**
- Verify: `_site/` output

- [ ] **Step 1: Run full clean build**

```bash
npm run clean && npm run build
```

Expected: completes without errors. Final line from Pagefind should mention indexed pages.

- [ ] **Step 2: Verify all critical pages exist**

```bash
ls _site/index.html \
   _site/blog/index.html \
   _site/blog/tech/index.html \
   _site/blog/gardening/index.html \
   _site/blog/tech/getting-started/index.html \
   _site/blog/gardening/composting-basics/index.html \
   _site/tags/meta/index.html \
   _site/tags/composting/index.html \
   _site/projects/index.html \
   _site/about/index.html \
   _site/search/index.html \
   _site/404.html \
   _site/sitemap.xml \
   _site/robots.txt \
   _site/assets/styles/main.css \
   _site/_pagefind/pagefind.js
```

Expected: all files listed without errors.

- [ ] **Step 3: Check the homepage renders nav and recent posts**

```bash
grep -c "Sarina White" _site/index.html
grep -c "Getting Started" _site/index.html
```

Expected: both return `1` or higher (string present).

- [ ] **Step 4: Check a blog post has the correct topic link**

```bash
grep 'href="/blog/tech/"' _site/blog/tech/getting-started/index.html | head -1
```

Expected: returns a line containing the topic link.

- [ ] **Step 5: Check search page has Pagefind assets**

```bash
ls _site/_pagefind/pagefind-ui.js _site/_pagefind/pagefind-ui.css
```

Expected: both files exist.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: complete portfolio + blog rewrite

Full rewrite from Eleventy 0.11/Tailwind v1.6/EJS to Eleventy 3.x/Tailwind v3/Nunjucks.
Adds portfolio page, multi-topic blog (tech + gardening), topic/tag index pages,
Pagefind full-text search, and Decap CMS. Warm-clean design with sage green accent."
```

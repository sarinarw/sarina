---
name: write-gaming-post
description: Use when writing a gaming blog post for this site — provides frontmatter schema, section structure, and tone guidelines.
---

# Write Gaming Blog Post

## Overview

Gaming posts are personal and direct — experience reports, not reviews. Specific numbers over vague impressions. No hedging, no AI vocabulary.

## File Location

`src/blog/games/<slug>.md`

## Frontmatter

```yaml
---
title: <Game Name> — <brief descriptor, e.g. "80 hours, 2.5 weeks, PS5">
description: <1-2 sentence summary. Include angle: what platform, what goal, what prior experience.>
date: YYYY-MM-DD
topic: games
tags: [<game-name>, <platform>, <genre>, <other relevant tags>]
---
```

## Section Structure

1. **Opening paragraph** — What you did, on what platform, roughly when and how long. One short paragraph.

2. **Background** — Prior experience relevant to this game (series history, similar games). Skip if not applicable.

3. **What actually helped** — 2–4 practical tips. Bold the key advice. Specific, not obvious. Skip generic tips.

4. **The grind / time breakdown** — For completionism posts: honest take on how the grind felt. Was it tedious or fun? Why?

5. **Worth it?** — Separate the game recommendation from the completion/platinum recommendation. Be honest when they diverge. This carries the verdict — no numeric ratings needed.

## Tone Rules

- First person, past tense
- Specific numbers: "80 hours over 2.5 weeks" not "a lot of time"
- No em dashes — use commas or periods instead
- No filler openers: "In conclusion", "Overall", "It's worth noting", "To be honest"
- No AI vocabulary: "comprehensive", "delve", "dive into", "showcases", "navigate", "nuanced"
- Honest over positive — if the grind was tedious, say so

## Reference

See `src/blog/games/plantera-2-platinum.md` for a clean example without ratings.

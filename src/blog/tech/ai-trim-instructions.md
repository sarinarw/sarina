---
title: Letting AI Trim Its Own Instructions
description: I asked Claude to review a skill file it uses every session and identify what it didn't need. It worked.
date: 2026-05-11
topic: tech
tags: [claude, ai, tools]
---

I have a Markdown file that gets loaded into every Claude Code session for a specific project. It's a "skill" — structured instructions that tell Claude how to do a recurring task, in this case searching job boards for listings in a specialized field. It includes candidate eligibility rules across multiple states, a list of district portals with access notes, API endpoints, verdict logic, execution steps.

The file grew over weeks. Every time I learned something new — a REST API that replaced a Chrome MCP approach, a portal that was down, which states had no viable path — I added it. By May it was around 350 lines.

Token cost matters more for skill files than for most context because they load on every run. A few hundred extra lines isn't a problem once. It becomes one.

## The obvious answer

I asked Claude: "is there anything we can change to reduce token usage?"

It read the file and came back with four options in order of impact:

1. Collapse the 🔴 Unqualified states — 11 table rows, all with the same verdict, none of which would ever be searched
2. Collapse aggregator-covered district rows — 13 rows across four tables, every one saying "Covered by REST API (region-wide search)"
3. Remove duplicate API findings — documented in both an intro paragraph and a table
4. Simplify a license table into a paragraph

The first two were obvious in retrospect. I'd added each state and each district as its own row as I researched them, which made sense at the time. But eleven rows saying 🔴 Unqualified with slightly different reasons don't need to be eleven rows. They need to be one line: *"don't search these."*

Same with the aggregated districts. The important fact — that a single REST API call covers all of them — was already documented. The individual rows were just echoing it thirteen times.

## What changed

Eleven state table rows became one line:

```
🔴 Unqualified — do not search: State A (reason), State B (reason), State C,
State D, State E (reason), State F (reason), ...
```

Thirteen district table rows became a bulleted list under a single header:

```
Aggregated districts — all covered by the REST API, no individual portal checks needed:
- Metro cluster: District A, District B
- Nearby: District C, District D, District E
- Farther out: District F, District G, District H, District I
```

No information was lost. Some secondary context is gone from the district list, but it only mattered for deciding whether to check each one individually — and the API checks all of them in one call anyway.

The trim came to 2,217 characters, roughly 550 tokens at 4 characters per token. Not huge in isolation, but it loads on every run.

## The thing worth noting

There's something a little odd about asking an AI to audit instructions written for that AI. You're essentially asking: *what in here do you not need to be told?*

The AI can answer that because it's actually run the task. It knows a state with a fixed 🔴 verdict never needs searching — the answer doesn't change. It knows thirteen rows saying the same thing don't add information, just tokens.

A human reviewing the same file might hesitate. The rows are accurate. The states were researched. Deleting them feels like losing work. The AI doesn't have that. It just sees overhead.

So: write instructions for a task → run the task until the instructions stabilize → ask the AI what's redundant. The last step takes maybe five minutes.

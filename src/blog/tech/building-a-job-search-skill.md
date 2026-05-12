---
title: Encoding a Repetitive Research Task as a Claude Skill
description: How to take a manual multi-source research process and turn it into a structured, reusable Claude Code skill.
date: 2026-05-12
topic: tech
tags: [claude, ai, tools]
---

Some tasks are too specific to hand off to a generic prompt and too repetitive to do manually every day. Job searching in a specialized field is one of them. The field has eligibility rules that vary by state, a dozen portals to check, and results that change slowly but need regular monitoring.

This is what I built a Claude skill for.

## What a skill is

A Claude Code skill is a Markdown file with structured instructions. When you invoke it with a slash command, Claude loads it into context and follows it as a behavioral guide for the session. The point is that you encode the process once (the steps, decision logic, edge cases) and invoke it instead of re-explaining everything each time.

Skill files can include whatever helps Claude do the task: tables, decision trees, code examples, fallback rules. The format is whatever works. Claude reads it literally.

## Starting with the rules

The first thing to encode is whatever makes the task complex enough to need a skill in the first place. For a job search in a licensed field, that's eligibility: which states the candidate can work in and under what conditions.

I built a state eligibility table with four columns: state, permanent credential minimum, what provisional path exists at the candidate's current score, and the default verdict. The verdicts are emoji-coded — ✅ Qualified, 🟡 Provisional, ⚪ Unknown, 🔴 Unqualified — so Claude can apply them consistently and the output is easy to scan.

The verdict logic section handles overrides: what to do when a posting explicitly states an EIPA minimum, or requires RID certification, or is a practicum that requires current enrollment. Rules are ordered — state default, then Arizona-specific rules (which have two separate credentialing systems depending on whether the setting is K-12 or not), then posting-specific overrides.

Getting this right up front means every job Claude finds gets evaluated the same way every time, without me re-explaining the eligibility framework.

## Building the portal list

The second thing to encode is where to look. For a specialized job search, this is a list of specific portals — school district job boards, staffing agencies, state aggregators — with notes on how each one works.

This is where skill files earn their keep. Portal access is not uniform:

- Some sites are plain HTML and fetch cleanly with curl or WebFetch
- Some are JavaScript-rendered and need a real browser
- Some have REST or GraphQL APIs that are faster and more reliable than scraping the rendered page

The portal table in the skill has a column for fetchability, so Claude knows which tool to use for each source. Getting this wrong wastes a session — if you send WebFetch at a Cloudflare-protected JS site, you get a challenge page.

## Discovering APIs through network inspection

When I first built the skill, several sites were marked "use Chrome DevTools MCP" — meaning Claude would navigate to them in a real Chrome instance and extract the text content. That works but it's slow and fragile.

What I didn't know initially was that some of these sites have usable APIs that Chrome is already calling in the background. The way to find them: open the site in Chrome DevTools, go to the Network tab, filter by XHR/Fetch, and watch what requests fire after the page loads.

For one major aggregator, this revealed a REST API that accepts a keyword, location, and page size, returns clean JSON, and covers the entire region in a single call. No auth required. The per-page scraping approach I'd been using hit one district at a time; the API hit all of them at once. I updated the skill to use curl instead of Chrome for that source entirely.

For another site (a staffing agency), Chrome network inspection found a WordPress AJAX endpoint with a per-session nonce — useful to know about, but the nonce changes on every page load, so curl won't work standalone. Chrome MCP is still required. Still worth documenting so future runs don't waste time trying curl.

The rule I added to the skill: when first encountering any new Chrome MCP site, check network requests after loading before falling back to parsing page text. Document what you find in the portal table.

## The skill as living documentation

After a few days the skill file had become something more than instructions — it was a record of everything learned about the search. Which portals returned results, which were consistently empty, which APIs existed and how to call them, which states had viable paths.

This created a tradeoff. The file grew with every new discovery, and skill files get loaded into context on every invocation. More detail is useful up to a point; past that, it's just overhead.

The optimization pass (described in [this post](/blog/tech/ai-trim-instructions/)) cut about 550 tokens by collapsing rows that all said the same thing. Eleven state rows with 🔴 Unqualified verdicts became one line. Thirteen district rows that all said "covered by REST API" became a bulleted list. No information was lost; the redundancy was just made visible.

## What makes a task worth encoding this way

The tasks that work well have a few things in common. The rules are stable but complex enough that re-explaining them each session would be annoying and inconsistent — eligibility logic, scoring thresholds, state-specific paths. There are multiple sources with different access methods that Claude would otherwise rediscover every time. And the output accumulates: the skill writes to consistent files (`jobs.md`, `research-log.md`) so each run extends a running record rather than starting fresh.

The alternative — re-explaining everything each session — works once. It doesn't scale across dozens of runs, and it doesn't build up anything.

---
title: Claude Code Superpowers — Skills for Structured Development
description: What the Claude Code "superpowers" plugin system is and how it guided the build of this site.
date: 2026-05-07
topic: tech
tags: [claude, meta, tools]
---

When I rebuilt this site with Claude Code, I didn't just hand it a prompt and let it go. The whole process was guided by something called "superpowers" — a plugin system for Claude Code that packages reusable workflows as invokable skills.

This post explains what that system is and why it made the build go the way it did.

## What Superpowers Are

Superpowers is a Claude Code plugin that ships a library of workflow skills. A skill is a Markdown file containing structured instructions — a process with steps, decision trees, red flags, and examples. When you invoke a skill, Claude Code loads that file into its context and follows it as a strict behavioral guide for whatever you're doing.

The key idea: instead of re-explaining "here's how I want you to approach planning" every session, you encode that into a skill once and invoke it with a slash command.

Skills are installed as a plugin and invoked in Claude Code with `/superpowers:<skill-name>`. The agent is configured to check for relevant skills before taking any action — even before asking clarifying questions.

## The Skills Used on This Build

### `brainstorming`

The first skill invoked. Its job is to turn a vague idea into a design spec through structured dialogue.

It blocked me from jumping to implementation and instead asked one question at a time: What kind of blog topics? Which portfolio elements? What design aesthetic? For each axis where multiple approaches made sense, it proposed 2–3 options with tradeoffs and made a recommendation.

By the end, I had a complete `docs/superpowers/specs/2026-05-07-portfolio-blog-design.md` covering URL structure, color palette, typography, content model, search approach, and CMS workflow — all derived from my answers. The skill enforces a hard gate: no implementation until the spec is written and I've approved it.

### `writing-plans`

Took the approved spec and turned it into a 15-task implementation plan at `docs/superpowers/plans/2026-05-07-portfolio-blog-rewrite.md`.

The plan format is specific: each task lists exact file paths to create or modify, provides complete code for every step (no "implement as appropriate"), includes the exact command to run to verify it, and ends with a commit. No placeholders. The skill's own instructions say placeholders are plan failures.

After writing the plan, it does a self-review — scanning for TBDs, type inconsistencies, and spec requirements with no corresponding task.

### `subagent-driven-development`

This is the execution skill. It reads the plan and dispatches a fresh Claude subagent per task.

"Fresh" is the important word. Each subagent starts with zero memory of the session — it only knows what the controller explicitly tells it: the task text, the relevant files, the design spec, and any context needed. This prevents earlier mistakes or assumptions from leaking into later tasks.

After each implementation, two reviewer subagents run in sequence:

1. **Spec compliance review** — did the implementer build what was asked? Nothing more, nothing less?
2. **Code quality review** — is the implementation well-built?

If either reviewer finds issues, the implementer fixes them and the reviewer runs again. The next task doesn't start until both pass.

The skill is explicit about what the coordinator should never do: skip reviews, accept "close enough", start the quality review before spec compliance passes, or move to the next task while issues are open.

### `finishing-a-development-branch`

The final skill, run after all 15 tasks completed. It verifies tests pass, detects the git environment, then presents options: merge locally, push and create a PR, keep as-is, or discard.

## Why This Works Better Than a Single Long Prompt

A single "build me a website" prompt accumulates context across the whole build. By task 10, the model is carrying everything from tasks 1–9 — including mistakes, corrected assumptions, and half-remembered decisions. Subagents don't have this problem.

The structured workflow also creates natural checkpoints that a freeform conversation skips. The brainstorming skill wouldn't let me skip to implementation before the design was solid. The plan skill wouldn't let me skip to execution before the plan had real code in every step. The review steps caught the `selectattr` bug and the project detail page generation before I would have noticed them in a browser.

## The Tradeoff

It's slower to start. Answering one question at a time through brainstorming felt slower than just describing everything upfront. The plan-writing step adds time before any code gets written.

But the back half is faster. Implementations are more accurate, reviews catch real problems, and there's no "I thought you meant..." conversation at hour three.

For a project with real complexity — or a project you want to actually understand rather than just have done — the overhead is worth it.

## Where to Learn More

The superpowers plugin isn't public yet as of this writing, but the concepts behind it — structured prompting, fresh context per task, review gates, explicit checklists — are applicable to any Claude Code workflow you design yourself.

The [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code) cover the slash command system and how plugins work if you want to build your own.

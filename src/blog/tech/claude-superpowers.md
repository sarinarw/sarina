---
title: Claude Code Superpowers — Skills for Structured Development
description: What the Claude Code "superpowers" plugin system is and how it guided the build of this site.
date: 2026-05-07
topic: tech
tags: [claude, meta, tools, ai]
---

When I rebuilt this site with Claude Code, I didn't just hand it a prompt and let it go. The whole process ran through something called "superpowers" — a plugin system for Claude Code that packages reusable workflows as invokable skills.

## What superpowers are

The "superpowers" are a set of Claude skills. A skill is a Markdown file with structured instructions: a process with steps, decision trees, red flags, examples. When you invoke one, Claude Code loads it into context and follows it as a behavioral guide for whatever you're doing.

The idea is that instead of re-explaining "here's how I want you to approach planning" every session, you encode that once and invoke it with a slash command. Skills are installed as a plugin and invoked with `/superpowers:<skill-name>`. The agent checks for relevant skills before taking any action, including before asking clarifying questions.

## The skills used on this build

**`brainstorming`** turned a vague idea into a design spec through structured dialogue. It blocked me from jumping to implementation and instead asked one question at a time: what kind of blog topics, which portfolio elements, what design aesthetic. For anything with multiple reasonable approaches, it proposed options with tradeoffs and made a recommendation. By the end I had a complete spec covering URL structure, color palette, typography, content model, search approach, and CMS workflow. Hard gate: no implementation until the spec is written and approved.

**`writing-plans`** took the approved spec and turned it into a 15-task implementation plan. The format is specific: exact file paths, complete code in every step (no "implement as appropriate"), the exact command to run to verify, and a commit at the end. No placeholders — the skill's own instructions say placeholders are plan failures. After writing, it scans for TBDs, type inconsistencies, and spec requirements with no corresponding task.

**`subagent-driven-development`** is the execution skill. It dispatches a fresh Claude subagent per task — zero memory of the session, only what the controller explicitly passes: task text, relevant files, design spec. After each implementation, two reviewer subagents run in sequence: did the implementer build what was asked, and is it well-built? If either reviewer finds issues, the implementer fixes them and the reviewer runs again. The next task doesn't start until both pass.

**`finishing-a-development-branch`** ran after all 15 tasks. It verifies tests pass, detects the git state, and presents four options: merge locally, push and create a PR, keep as-is, or discard.

## Why it worked

A single "build me a website" prompt accumulates context across the whole build. By task 10, the model is carrying everything from tasks 1–9, including mistakes, corrected assumptions, half-remembered decisions. Subagents don't have this problem because they don't know about any of it.

The structured workflow also creates checkpoints that a freeform conversation skips. The brainstorming skill wouldn't let me rush to implementation before the design was solid. The review steps caught the `selectattr` bug and the Eleventy project-detail-page issue before I would have noticed either in a browser.

The tradeoff is that it's slower to start. Answering questions one at a time and waiting for a plan before any code runs felt inefficient at first. But the back half went fast, and there was no "I thought you meant..." conversation at hour three.

The superpowers plugin is an official Claude plugin that can be installed via the `/plugin` skill, or additional ways specified here: [https://github.com/obra/superpowers](https://github.com/obra/superpowers).

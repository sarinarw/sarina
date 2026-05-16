---
title: Building a Discord Tool to Find an FFXIV Raid Static
description: I wrote a Tampermonkey userscript and a local Python server to automatically scan LFG posts in Discord and tell me which ones are worth reading. Here's what was actually hard about it.
date: 2026-05-15
topic: tech
tags: [ffxiv, tampermonkey, python, regex, discord, claude]
---

Patch 7.5 for Final Fantasy XIV drops soon, and with it comes a new ultimate raid. My static has a few open slots to fill before the fight releases. The place to find candidates is a Discord server where players post LFG ("looking for group") listings — individual players announcing their role, schedule, and experience, looking for a static to join.

The problem is volume. At peak times there are hundreds of posts, most of them irrelevant: wrong role, wrong fight, wrong schedule, or the opposite kind of post entirely (LFM — "looking for members," meaning another static recruiting, not a player looking to join one). Reading each one manually is tedious. I wanted something that would flag the posts worth my time before I clicked them.

## What I built

A two-part system: a Tampermonkey userscript that runs inside Discord's web app, and a local Python Flask server on port 7823 that does the analysis.

The userscript watches the forum channel list with a `MutationObserver`. When a post card appears in the DOM, it checks the card's text against a keyword list: does it mention DMU, UMAD, or Kefka Ultimate (three names for the same upcoming fight)? Does it mention a role I'm looking for? If yes, it sends the post text to the local server and waits for a verdict. The server runs a regex parser and returns one of four verdicts: MATCH, REVIEW, PARTIAL, or NO MATCH. The userscript injects a colored pill directly onto the post card in the forum list, so I can see at a glance which posts to open.

The "Analyze with Claude" button on each post runs a slower Claude CLI analysis for cases where the regex isn't confident. That's opt-in per post, not automatic.

## What was actually hard

### Discord's DOM

Discord doesn't give you stable element IDs or semantic class names to target. The forum list cards use long hashed class strings that change with each deploy. The one stable hook I found was `data-list-item-id`, which uses a predictable prefix (`forum-channel-list-`) and contains the post ID at the end.

The other thing I discovered: the full post body is available in `card.textContent` without clicking into the post. The forum card renders the entire thread content, just visually truncated. That meant I could fire analysis from the list view immediately instead of waiting for a click, which was the whole point.

### Time range regex

I needed to extract a poster's availability from natural language like "Mon-Fri 8pm-midnight ET" or "10pm till 1am central." The time range pattern went through several iterations.

The first version matched bare numbers as time ranges. Someone writing "2-3 months of raid experience" would produce availability data of `02:00-03:00 ET`. The fix was requiring a "firm" time anchor on both sides of the range: either a colon (`8:30`) or an am/pm suffix (`8pm`). Bare numbers no longer match.

Single-letter day abbreviations (`M`, `T`, `W`, `F`) were another problem. The pattern `(?!\w)` to check the character after worked fine, but `M` was still matching in "LFM" and "I'm" because the lookbehind only checked for word characters, not apostrophes. The fix was `(?<!['\w])M(?!\w)` — include the apostrophe in the lookbehind.

The standard three-letter abbreviations had the inverse problem: `Mon` matching inside "months," `Fri` matching inside "friendly." Adding a trailing `\b` fixed it.

### Timezone detection

Posts usually state a timezone somewhere: "8pm-midnight ET," "10pm CST." But sometimes the timezone appears in a completely different sentence than the schedule. One post had this structure: a Mon-Fri schedule in one paragraph, then at the very end: "Sunday could be discussed but I have commitments starting at 5pm central."

The original code searched the full post text for a timezone label, found "central," and applied it to the Mon-Fri times. The Mon-Fri schedule was actually in the poster's local Phoenix time (Discord's "show in your timezone" feature), so the times were already in the viewer's timezone. Applying a Central offset on top of that produced a verdict of MATCH when the real answer was that the person starts an hour after the static does.

The fix was scoping the timezone search to the text from the start of the post up to 200 characters past the matched time range. Timezone mentions that appear well after the schedule are excluded. If no timezone is found in that window, the times are assumed to be local (Phoenix) time, which is usually right and produces a clean match/no-match rather than a "review because we don't know."

### What counts as availability overlap

The initial overlap check was simple: if there are 60+ minutes of shared time on at least one shared day, it's a match. That's wrong.

Someone available 9pm-midnight when the static runs 8pm-midnight has 3 hours of overlap. But they'd arrive one hour late to every session. That's a real disqualifier, not a minor issue. I added a start-time gate: if the candidate's start time is more than 15 minutes after the static's start time, the overlap doesn't count. The 60-minute threshold alone isn't enough — you also have to show up on time.

## What I'd do differently

The biggest friction point is that the Tampermonkey script has to be manually copy-pasted into the browser after every change. There's no auto-reload for userscripts and no hot module replacement. I fell into the habit of making a change, forgetting to update the browser, then wondering why nothing worked. That's a workflow problem, not a code problem, but it's still annoying.

If I were starting over I'd also design the posts storage differently. Right now each post gets its own JSON file under `server/posts/`, which makes manual inspection easy but querying across posts awkward. A SQLite database would have been cleaner once the number of fields grew past half a dozen.

The regex approach works well for the 80% case. Posts that state their availability clearly and unambiguously parse correctly. The remaining 20% — Discord-rendered timestamps, unusual phrasing, missing schedule entirely — go to REVIEW or PARTIAL and get a second look. That's the right outcome. The point was never to fully automate the decision, just to filter the obvious non-matches so I'm only reading posts that have a real chance.

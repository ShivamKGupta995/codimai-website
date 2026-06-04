# Gate script — exact phrasing

Use these lines verbatim at each gate. Consistent language teaches the user the protocol fast.

## Stage 0 kickoff (immediate, no gate)

After parallel-reading the three sub-skills and parsing the trigger:

> **Page builder triggered.**
>
> - Slug: `[slug]`
> - Target file: `[path]`
> - Page type: [overview / feature / pricing / blog / conversion]
> - Scope: [one-line summary of what the page will cover, derived from details + CLAUDE.md]
> - Sub-skills loaded: codimai-content, codimai-design, codimai-brand ✅
>
> Starting Stage 1 (content draft) now.

If critical info is missing, replace the last line with a single `ask_user_input_v0` call (1–3 questions max), then continue.

## Gate 1 (after content.md)

> **Stage 1 — Content draft complete.**
>
> File: `.claude/pages/[slug]/content.md`
>
> Summary:
> - Headline: "[hero headline]"
> - Sections: [n] ([list section titles])
> - FAQ: [n] questions
> - Primary keyword: [keyword]
>
> Reply **approved** to proceed to Stage 2 (page spec), or tell me what to change.

## Gate 2 (after spec.md)

> **Stage 2 — Page spec complete.**
>
> File: `.claude/pages/[slug]/spec.md`
>
> Key decisions:
> - Section types used: [list from catalogue]
> - New components needed: [none / list with NEW flag]
> - Schema blocks: [list]
>
> Reply **approved** to proceed to Stage 3 (dev plan), or tell me what to change.

## Gate 3 (after plan.md)

> **Stage 3 — Dev plan complete.**
>
> File: `.claude/pages/[slug]/plan.md`
>
> Build will produce:
> - [page file]
> - [n] modifications to existing files
> - [n] new components in components.css
> - [n] new images
>
> Reply **approved** to proceed to Stage 4 (build on new branch `page/[slug]`), or tell me what to change.

## Gate 4 (after build, before commit)

> **Stage 4 — Build complete.**
>
> Branch: `page/[slug]` (not yet committed)
> Staged files:
> ```
> [paste git status --short]
> ```
> Self-check: all [n] items passed ✅
>
> Preview: [link or note]
>
> Review the page. Reply **approved** to commit, or tell me what to change.

## After Stage 5 (post-commit)

> **Stage 5 — Committed.**
>
> Branch: `page/[slug]`
> Commit: `[hash] feat(pages): add [slug] page`
> Files in commit: [n]
>
> Suggested next: open a PR, or merge to main. I'll wait for your call on that.

## When the user replies with something other than "approved"

If the user replies with:
- A question → answer it; do not change the gate; re-ask for approval after answering
- An edit → make the edit, re-present the artifact, re-issue the gate prompt
- "Looks good" / "ok" / 👍 → reply: *"Reply **approved** to proceed — I'll wait."*
- "Skip the gates" / "just go" → reply: *"The gates are part of this workflow you set up. Want me to summarize all stages so you can approve in one go? You'll still need to reply **approved** at each gate so I know we're aligned."*

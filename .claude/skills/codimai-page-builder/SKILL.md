---
name: codimai-page-builder
description: Orchestrator skill for building any new CodimAI website page from scratch. ALWAYS trigger when the user (a) types the slash command "/create page [slug]" optionally followed by "--" or ":" and any free-form details, or (b) asks in natural language to "create / build / make / draft / produce a [X] page" for CodimAI — e.g. "/create page agents -- focus on WhatsApp and Email first", "create an Agentic AI page", "build the Email Agent page". Runs a Stage 0 kickoff that reads all three sub-skills (codimai-content, codimai-design, codimai-brand) IN PARALLEL in a single tool burst, then runs the strict 5-stage gated workflow (content, spec, plan, build, commit). Each of the 4 gates requires the explicit word "approved" or "go" — never proceed on assumption. Do not trigger for tweaks to an existing page, copy edits, or single-component changes — those use the sub-skills directly.
---

# CodimAI Page Builder — orchestrated workflow

This skill makes building a new CodimAI page a **gated, professional, reviewable process** instead of a one-shot guess. It runs 5 stages with hard approval gates. The user said: *content first, then spec, then plan, then build, then commit* — this skill enforces exactly that.

## The contract (read before doing anything)

When the user asks to build a page, you will:

1. **Never skip a stage.** Each stage produces one artifact.
2. **Stop at every gate.** After delivering an artifact, you stop and wait for the explicit word **"approved"** or **"go"**. Any other reply (questions, edits, "looks fine," silence) is **not approval** — answer the question or make the edit, re-present, wait again.
3. **Never proceed beyond a gate without the explicit word.** Even if the user seems impatient. Approval is the user's job, not yours.
4. **Read sub-skills in parallel at Stage 0.** Open all three (content, design, brand) in a single tool burst — not one at a time. They stay in context for the whole workflow.
5. **All artifacts live in `.claude/pages/[slug]/`**. Slug is lowercase-hyphenated, derived from the page name (e.g. "Agentic AI page" → `agentic-ai`).
6. **Git: branch is created at the start of Stage 4 (Build). Commit happens only after Stage 5 validation approval.** Branch naming: `page/[slug]`. Commit message: `feat(pages): add [slug] page`.

## Trigger patterns and how to parse them

The user can invoke this skill three ways. Parse each into a `{slug, details}` pair, then run Stage 0.

| Pattern | Example | Parse to |
|---------|---------|----------|
| Slash command (bare) | `/create page agents` | `slug=agents, details=""` |
| Slash command + details | `/create page agents -- focus on WhatsApp and Email first` | `slug=agents, details="focus on WhatsApp and Email first"` |
| Slash command + details (colon) | `/create page pricing: three tiers, monthly + annual toggle, no enterprise calculator` | `slug=pricing, details="three tiers, monthly + annual toggle, no enterprise calculator"` |
| Natural language | "create an Agentic AI page focused on the developer audience" | `slug=agentic-ai, details="focused on the developer audience"` |

Slug rules: lowercase, hyphen-separated, ≤ 4 words, no trailing words like "page" or "section". `/create page agentic ai` → `agentic-ai`.

### File structure (canonical — do not deviate)

```
/                          ← document root
├── index.html             ← Home
├── get-started.html       ← Conversion
├── 404.html
├── ai/                    ← 6 standalone AI pages
│   ├── agentic-ai.html
│   ├── generative.html
│   ├── insights.html
│   ├── recommendation.html
│   ├── prediction.html
│   └── data-analytics.html
├── agents/                ← 4 standalone Agent pages
│   ├── whatsapp.html
│   ├── email.html
│   ├── google-review.html
│   └── blogs-agent.html
├── assets/
│   ├── css/               tokens.css · base.css · components.css
│   ├── js/                nav.js · reveal.js · [slug]-hero.js · process-scroll.js
│   └── img/
├── blogs/                 ← PHP blog system
└── partials/              ← shared HTML fragments
```

### Relative paths inside `ai/` pages

| Target | Path to use |
|---|---|
| Root (Home) | `../` |
| Other AI page | `generative.html` (sibling — no prefix) |
| Agents page | `../agents/whatsapp.html` |
| Blogs | `../blogs/` |
| Get Started | `../get-started.html` |
| Assets CSS | `../assets/css/tokens.css` |
| Assets JS | `../assets/js/nav.js` |
| Assets img | `../assets/img/logo-word.png` |

### Relative paths inside `agents/` pages

Same pattern — prefix root links with `../`, prefix AI links with `../ai/`, sibling agent links need no prefix.

### Standalone vs anchored — DO NOT ASK

**Always create dropdown items as standalone pages in the correct folder.** Never ask.

| Dropdown item | File |
|---|---|
| Agentic AI | `ai/agentic-ai.html` |
| Generative | `ai/generative.html` |
| Insights | `ai/insights.html` |
| Recommendation | `ai/recommendation.html` |
| Prediction | `ai/prediction.html` |
| Data Analytics | `ai/data-analytics.html` |
| WhatsApp | `agents/whatsapp.html` |
| Email | `agents/email.html` |
| Google Review | `agents/google-review.html` |
| Blogs Agent | `agents/blogs-agent.html` |

After building, grep every existing HTML file for the old anchor link and update all occurrences — nav dropdown, mobile nav, footer, in-body cards — to the correct new path.

## Stage 0 — Kickoff ⚡

Runs **once**, immediately on trigger, before Stage 1.

**Actions, in one response:**
1. **Parallel-read all three sub-skills in a single tool burst** (not sequentially):
   - `codimai-content/SKILL.md`
   - `codimai-design/SKILL.md`
   - `codimai-brand/SKILL.md`
2. Parse the trigger into `{slug, details}`.
3. Decide: do I have enough to start Stage 1?
   - **Yes** → state the plan in one paragraph (slug, target file path, audience guess, scope summary), then proceed directly into Stage 1.
   - **No** (genuinely missing info that cannot be inferred) → ask ONE consolidated question with at most 2 options. **Never ask about standalone vs anchored** — always standalone (see above).

**What counts as "enough to start":**
- Page slug is clear.
- Page type is inferable (overview / feature / pricing / blog / conversion).
- Either the user provided content/details, OR the slug maps to a known site IA destination.
- Standalone vs anchored is always standalone — never a question.

**Then:** proceed into Stage 1 in the same response. Do not announce "starting Stage 0" — just do it. State the parsed plan in one sentence so the user sees what you understood.

## The 5 stages

### Stage 1 — Content draft 📝
**Skill in context:** `codimai-content` (already read in Stage 0). Open its references (voice-examples, seo-checklist, ai-friendly-patterns) only if a question comes up that they answer.

**Produce:** `.claude/pages/[slug]/content.md` following the template in `codimai-content`. Include H1, meta title/description, slug, primary + secondary keywords, hero copy, all section leads + body, closing CTA, and a 4–6 question FAQ block. Mark which JSON-LD types the page will need.

**Then:** stop. Present the file path + a concise summary of what you wrote. Say:
> "Stage 1 complete. Reply **approved** to proceed to Stage 2 (spec), or tell me what to change."

**Gate 1 — wait for "approved" or "go". Do not proceed otherwise.**

---

### Stage 2 — Page spec 📐
**Skills in context:** `codimai-design` + `codimai-brand` (already read in Stage 0). Re-open the approved `content.md`.

**Produce:** `.claude/pages/[slug]/spec.md` using the template in `references/page-spec-template.md`. The spec maps each chunk of approved content to a concrete section from the design skill's section catalogue, lists every reused component, names every brand token used, specifies the responsive behavior, and declares the SEO/schema setup.

The spec is the bridge: anyone reading it (designer, dev, future Claude) should be able to build the page without re-deciding anything.

**Then:** stop. Present `spec.md` + a short summary of section mapping decisions. Say:
> "Stage 2 complete. Reply **approved** to proceed to Stage 3 (dev plan), or tell me what to change."

**Gate 2 — wait for "approved" or "go".**

---

### Stage 3 — Development plan 🛠️
**Skills to read:** none new — re-open `spec.md`.

**Produce:** `.claude/pages/[slug]/plan.md` using `references/dev-plan-template.md`. The plan is a numbered, file-by-file checklist: which files to create/modify, in what order, what each commit-level chunk does, what gets reused from existing components, what new components (if any) need adding to `components.css`, what tests/checks to run before declaring done.

**Then:** stop. Present `plan.md`. Say:
> "Stage 3 complete. Reply **approved** to proceed to Stage 4 (build), or tell me what to change."

**Gate 3 — wait for "approved" or "go".**

---

### Stage 4 — Build 🔨
**Skills in context:** all three (loaded Stage 0). **Re-read all three fresh now** as a safety net — this is where mistakes are expensive. Use a single parallel tool burst.

**Actions, in order:**
1. **Create a new git branch:** `git checkout -b page/[slug]`. Report the branch name to the user.
2. Execute `plan.md` step by step. Reuse existing components in `assets/css/components.css`; only add new patterns when the plan calls for them.
3. Use approved content from `content.md` verbatim. Use tokens from `codimai-brand` — zero hex values outside `tokens.css`.
4. Add SEO meta + JSON-LD per `spec.md`.
5. Run a local self-check using `references/build-checklist.md` (Lighthouse-style audit, DRY pass, brand fidelity pass, content fidelity pass).
6. **Stage commit-ready files. DO NOT commit yet.** Show the user `git status` output.

**Then:** present the built page (file paths + preview if possible) and the staged file list. Say:
> "Stage 4 complete. Branch `page/[slug]` is ready. Review the page, then reply **approved** to commit, or tell me what to change."

**Gate 4 — wait for "approved" or "go".**

If the user requests changes, make them on the same branch, re-run the self-check, re-present, wait again.

---

### Stage 5 — Commit ✅
**Actions:**
1. `git add .claude/pages/[slug]/ [page files]`
2. `git commit -m "feat(pages): add [slug] page"` with a body that lists the new files and notes the content + spec + plan in `.claude/pages/[slug]/`.
3. Show the commit hash and a summary of what was committed.
4. Suggest the next step (open PR, merge, deploy preview) but do not perform it.

Done.

---

## Approval gate rules (strict)

These rules are the whole point of this skill. Follow them exactly.

| Situation | What to do |
| --- | --- |
| User replies "approved" or "go" | Proceed to next stage |
| User replies with edits, questions, or anything else | Treat as **not approved**. Address it. Re-present. Wait again. |
| User says "looks good" / "nice" / "ok" | Treat as **not approved** — these are not the explicit word. Ask: *"Reply **approved** to proceed."* |
| User says "skip the gates" / "just build it" | Politely refuse. The gates exist on the user's own instruction. Offer a summary of what each stage will produce so they can approve in bulk if they want — but still wait for the word at each gate. |
| User contradicts an earlier-approved artifact | Update that earlier artifact, mark it "v2 — re-approval needed," and re-trigger that gate. |

## File layout produced per page

```
.claude/pages/[slug]/
  content.md     ← Stage 1 (approved)
  spec.md        ← Stage 2 (approved)
  plan.md        ← Stage 3 (approved)
  notes.md       ← optional: decisions, links, references
```

Plus the actual page files in their normal locations (e.g. `agents.html`, `assets/css/components.css`).

## Templates and references

Read these as needed at each stage:
- `references/page-spec-template.md` — Stage 2 template
- `references/dev-plan-template.md` — Stage 3 template
- `references/build-checklist.md` — Stage 4 self-check
- `references/gate-script.md` — exact phrasing for each gate (copy verbatim)

## Interior page conventions (apply on every new page — no exceptions)

These were established during the Agentic AI page build and are now the standard pattern for all CodimAI interior pages.

### Hero layout
- **Always two-column on desktop:** `.hero--page` sets `padding-block: 96px` (no full-screen min-height). `.hero--page .hero__inner` uses `display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center`.
- Collapses to single column at ≤ 1023px.
- **Left column:** headline, sub, CTAs (`.hero__content`).
- **Right column:** unique canvas animation (`.hero--anim` container with `aspect-ratio: 5/4`).

### Canvas animation (right column)
- **Every page gets its own unique canvas animation** in `assets/js/[slug]-hero.js`.
- The animation must represent the specific concept of the page (e.g. agentic-ai → agent node graph with perception/cognition/decision layers; a blog agent page → text parsing / publishing flow).
- **Never reuse or adapt the home page canvas** (`hero.js`) — the home page has a point-cloud pixel rendering. Interior pages have concept-specific node/flow diagrams.
- **Never put a static image behind the canvas** — the animation is the sole visual on the right. Images in the hero are removed.
- Canvas colors: warm neutral brand palette only (`#F7F5F0` BG, `#1A1A18` nodes/pulses, `#86847C` muted labels, `#FFFFFF` node fill). No hex outside these.
- Pulse animation: bezier-curved edges + small travelling dot with 3-ghost trail + node ping ring on arrival.
- Section zone backdrops (if the concept has layers): very faint rounded rects with `// LABEL` mono text, drawn before edges.
- Must pause on `visibilitychange` (hidden tab) and resume on focus.
- Use `arcTo` for rounded rects — **not** `ctx.roundRect` (limited browser support).

### Scroll-snap (all pages)

`html { scroll-snap-type: y mandatory; }` is set globally. Every section that should be one full screen must have `scroll-snap-align: start` + `min-height: 100vh`. Custom section classes (`.capabilities`, `.agents`, `.blog-preview`, `.hero`, `.mission`, `.closing-screen`) already have these. When creating new sections on any page, add both properties.

Disable mandatory on mobile via `@media (max-width: 768px) { html { scroll-snap-type: y proximity; } }` (already in components.css).

### Canvas scaling rule

All canvas sizes (node radius, font, line width, pulse dot) must use `W * factor` expressions — never hard `px` values with small upper clamps. Reason: the canvas expands to full screen on click and tiny-clamped values look wrong at large sizes.

```js
// Correct — scales at any size
var base = Math.max(14, W * 0.046);
ctx.lineWidth = Math.max(1, W * 0.0018);

// Wrong — nodes stay tiny when canvas expands
var base = Math.max(14, Math.min(28, W * 0.046));
```

### New CSS components added in `components.css`

| Class(es) | Purpose |
|---|---|
| `.hero--page`, `.hero--anim`, `.hero__anim-canvas` | Interior page hero (two-column, flex-centered) |
| `.section__head`, `.section__lead` | Section header group + lead paragraph |
| `.process-step-section` + sub-classes | Full-screen step sections with SVG icons + IntersectionObserver animations |
| `.why-codimai__inner`, `.why-list`, `.why-row` | Two-column editorial Why section |
| `.faq`, `.faq-item`, `.faq-item__body` | `<details>` accordion FAQ |
| `.cap-card--plain` | Cap-card without CTA arrow |
| `.hero-anim-backdrop`, `.hero--anim--expanded`, `.hero--anim__close` | Canvas click-to-expand popup |

### Nav link updates
After creating a new standalone page, grep every existing HTML file for the old `[parent].html#[anchor]` reference and update all occurrences — nav dropdown, mobile nav, footer, and any in-body cards/links — to the new standalone URL.

---

## When NOT to use this skill

- Editing copy on an existing page → use `codimai-content` directly
- Restyling a single component → use `codimai-design` directly
- Adjusting a color → use `codimai-brand` directly
- Fixing a typo / bug → just fix it
- Building anything that is not a CodimAI page → don't use any of these skills

This skill is for **new pages**, end-to-end, professionally.

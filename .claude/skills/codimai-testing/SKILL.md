---
name: codimai-testing
description: Test and validate the CodimAI static website before shipping — broken internal links, HTML structure (single h1, landmarks, heading order), meta/SEO completeness, JSON-LD validity, image alt text, DRY drift between shared header/footer across pages, and responsive/accessibility smoke checks. Use whenever the task is to "test the site", "validate the pages", "check for broken links", "verify before commit/deploy", "did I break anything", or to confirm a new/edited page meets the Definition of Done in CLAUDE.md §8. Runs a deterministic read-only test suite and reports pass/fail. For SEO scoring specifically use codimai-seo-geo-audit; this skill is the broader pre-ship gate.
---

# CodimAI — Testing & Validation

This is the **pre-ship gate** for the CodimAI static site. There is no framework and no build step, so "tests" here are deterministic structural/contract checks against `CLAUDE.md §8` (Definition of Done), not unit tests. The suite is read-only and fast.

Use it: after building or editing any page, before any commit, and as the final verification when the user asks "is it ready / did I break anything".

## How to run

```bash
python3 .claude/skills/codimai-testing/scripts/test_site.py
```

It walks every `*.html` in the repo (excluding `partials/` fragments and `blogs/includes/` PHP) and runs the suites below, then prints a summary with an exit-style PASS/FAIL per suite. Pair it with the SEO/GEO auditor for the discoverability score:

```bash
python3 .claude/skills/codimai-seo-geo-audit/scripts/audit.py .
```

## Test suites

1. **Links** — every internal `href`/`src` resolves to a real file (folder URLs → `index.html`). Catches the #1 historical bug class (dead `get-started`, blog, and nav links). Fragment-only (`#id`) links are checked against existing `id=`/`name=` on the same page.
2. **Document structure** — exactly one `<h1>`; presence of `<main>`, `<header>`, `<footer>`, `<nav>`; no skipped heading levels; `<html lang>` and `<meta viewport>` present.
3. **SEO contract** — unique `<title>` ≤ 60 and `description` ≤ 155 across the site; exactly one absolute canonical; OG + Twitter tags present; referenced `og:image` file exists.
4. **Structured data** — every `application/ld+json` block parses as JSON; `@type`s reported. Blog posts must carry `BlogPosting`; capability/agent pages should carry `WebPage` + `BreadcrumbList`.
5. **Accessibility smoke** — every `<img>` has an `alt` attribute; a skip-link exists; form controls have associated `<label>`s or `aria-label`; dropdowns have `aria` attributes. (Deep a11y still needs a real axe/Lighthouse run — see "Manual checks".)
6. **DRY drift** — extracts the `<header>…</header>` and `<footer>…</footer>` block from each page, normalizes relative path depth (`../`, `/`), and asserts they are structurally identical across pages. Header/footer must be one source; this catches copy-paste drift the moment it appears.

## Reading the results

The script prints, per suite, `PASS` or the specific failing files + reason. Report it interpreted, not raw:

```
Links            PASS  (20 files, 0 broken)
Structure        PASS
SEO contract     FAIL  get-started.html description 0 chars (missing)
Structured data  PASS  (BlogPosting×3, WebPage×11)
Accessibility    PASS
DRY drift        WARN  agents/email.html footer differs (1 extra <li>)
```

For each FAIL, state the file, the rule, and the fix. A page passes the gate only when Links / Structure / SEO / Structured data are all PASS and DRY drift is clean.

## Manual checks the script can't do (call these out, don't silently skip)

- **Responsive** at 360 / 768 / 1280 — open in a browser or run Lighthouse mobile.
- **Lighthouse** Performance / SEO / A11y / Best-Practices ≥ 95 (CLAUDE.md target). Suggest the user run it; you cannot launch a headless Chrome here reliably.
- **Visual/brand** fidelity — eyeball against `codimai-brand`.
- **Keyboard nav** — tab through dropdowns and the form.
- **JS-off** — the page must still render and links work (progressive enhancement).

When you finish a test run, end with: which suites passed, what (if anything) needs a manual browser check, and the single most important thing to fix next.

## When tests fail
Never mark testing "done" while a suite fails. Fix the underlying file (or route to `codimai-implementer` / `codimai-page-builder`), then **re-run** to confirm green. Report failures honestly with the actual output — do not paper over them.

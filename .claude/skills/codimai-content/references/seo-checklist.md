# SEO checklist — per page

Run this list before declaring a page's content done.

## Meta
- [ ] `<title>` ≤ 60 chars, format `[Topic] — CodimAI`, primary keyword present, no clickbait
- [ ] `<meta name="description">` ≤ 155 chars, plain language, keyword once, no exclamation marks
- [ ] `<link rel="canonical">` set to the page's clean URL
- [ ] Open Graph: `og:title`, `og:description`, `og:url`, `og:image` (1200×630)
- [ ] Twitter: `twitter:card="summary_large_image"`
- [ ] Favicon + apple-touch-icon present

## Structure
- [ ] Exactly one `<h1>` — matches the hero headline
- [ ] H2/H3 hierarchy logical; no skipped levels
- [ ] Every H2 is a question the user might ask (implicit or explicit)
- [ ] Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<article>` or `<section>`, `<footer>`
- [ ] Breadcrumb in HTML + `BreadcrumbList` JSON-LD when nested

## Content
- [ ] Primary keyword appears in: title, H1, first 100 words, one H2
- [ ] Secondary keywords appear naturally — never stuffed
- [ ] No duplicate content with other pages on the site
- [ ] Internal links to 2–4 related pages, descriptive anchor text
- [ ] At least one outbound link to a credible reference (research, standards)
- [ ] FAQ block (4–6 Q&A) wrapped in `FAQPage` JSON-LD on product/feature pages

## Media
- [ ] All `<img>` have `width`, `height`, `alt`
- [ ] Alt text is descriptive (not "image1.png" or "logo")
- [ ] Hero image preloaded; below-the-fold images `loading="lazy"`
- [ ] WebP/AVIF format with fallback; total page weight < 1.5 MB

## Performance (SEO ranking factor)
- [ ] Fonts loaded with `preconnect` + `display=swap`
- [ ] CSS critical-path minimal; non-critical CSS deferred
- [ ] JS deferred/async; no render-blocking scripts
- [ ] Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO = 100

## Schema (JSON-LD)
- [ ] Home: `Organization` + `WebSite` (with `SearchAction`)
- [ ] Feature/product page: `WebPage` + `FAQPage` + `BreadcrumbList`
- [ ] Blog post: `BlogPosting` (headline, author, datePublished, image) + `BreadcrumbList`
- [ ] Sitemap.xml includes this page; robots.txt does not block it

## URL
- [ ] Lowercase, hyphenated, ≤ 5 words
- [ ] No query strings, no trailing junk
- [ ] HTTPS, no mixed content

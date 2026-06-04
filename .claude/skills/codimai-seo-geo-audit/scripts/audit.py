#!/usr/bin/env python3
"""CodimAI SEO + GEO auditor — deterministic, read-only.

Usage:
    python3 audit.py <path-or-glob> [more paths...]
    python3 audit.py .            # whole repo

Prints a per-file PASS/WARN/FAIL checklist with a 0-100 score, plus a
site-level section (robots.txt AI crawlers, sitemap.xml, OG image files).
Never writes anything.
"""
import os, re, sys, glob, json, html

ROOT = os.getcwd()
SITE = "https://codimai.com"
AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot",
           "ClaudeBot", "Google-Extended"]

OK, WARN, FAIL = "\033[32m✓\033[0m", "\033[33m⚠\033[0m", "\033[31m✗\033[0m"


def collect(args):
    files = []
    for a in args:
        if os.path.isdir(a):
            files += glob.glob(os.path.join(a, "**", "*.html"), recursive=True)
        elif any(c in a for c in "*?["):
            files += glob.glob(a, recursive=True)
        elif a.endswith(".html"):
            files.append(a)
    # skip the partial fragments (not standalone pages)
    files = [f for f in files if "/partials/" not in f and not f.startswith("partials/")]
    return sorted(set(files))


def text_between_tags(htmltext):
    # crude visible-text extraction for definition / claim checks
    t = re.sub(r"<script.*?</script>", " ", htmltext, flags=re.S | re.I)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return html.unescape(re.sub(r"\s+", " ", t)).strip()


def resolve(base, href):
    href = href.split("#")[0].split("?")[0]
    if not href or href.startswith(("http", "mailto:", "tel:", "//", "data:")):
        return None
    p = href.lstrip("/") if href.startswith("/") else os.path.normpath(
        os.path.join(os.path.dirname(base), href))
    if p == "" or p.endswith("/"):
        p = os.path.join(p, "index.html")
    if os.path.isdir(p):
        p = os.path.join(p, "index.html")
    return p


def audit_file(path, titles_seen, descs_seen):
    src = open(path, encoding="utf-8").read()
    rows = []  # (level, label, detail)  level in OK/WARN/FAIL
    score = 0
    total = 0

    def check(cond, label, ok_detail="", warn=False, fail_detail=""):
        nonlocal score, total
        total += 1
        if cond:
            score += 1
            rows.append((OK, label, ok_detail))
        else:
            rows.append((WARN if warn else FAIL, label, fail_detail or ok_detail))

    # --- title ---
    m = re.search(r"<title>(.*?)</title>", src, re.S | re.I)
    title = html.unescape(m.group(1).strip()) if m else ""
    dup_t = title and titles_seen.get(title, 0) > 0
    check(bool(title) and len(title) <= 60 and not dup_t, "title",
          f"{len(title)} chars" if title else "",
          fail_detail=("missing" if not title else
                       f"{len(title)} chars >60" if len(title) > 60 else "duplicate"))
    if title:
        titles_seen[title] = titles_seen.get(title, 0) + 1

    # --- description ---
    m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', src, re.S | re.I)
    desc = html.unescape(m.group(1).strip()) if m else ""
    dup_d = desc and descs_seen.get(desc, 0) > 0
    check(bool(desc) and len(desc) <= 155 and not dup_d, "description",
          f"{len(desc)} chars" if desc else "",
          fail_detail=("missing" if not desc else
                       f"{len(desc)} chars >155" if len(desc) > 155 else "duplicate"))
    if desc:
        descs_seen[desc] = descs_seen.get(desc, 0) + 1

    # --- canonical ---
    cans = re.findall(r'<link\s+rel="canonical"\s+href="([^"]*)"', src, re.I)
    can_ok = len(cans) == 1 and cans[0].startswith(SITE)
    check(can_ok, "canonical", cans[0] if cans else "",
          fail_detail=("missing" if not cans else "multiple" if len(cans) > 1 else "not absolute"))

    # --- single h1 + heading order ---
    h1s = re.findall(r"<h1[\s>]", src, re.I)
    check(len(h1s) == 1, "h1×1", f"{len(h1s)}",
          fail_detail=f"found {len(h1s)}")
    levels = [int(x) for x in re.findall(r"<h([1-6])[\s>]", src, re.I)]
    skip = any(b - a > 1 for a, b in zip(levels, levels[1:]))
    check(not skip, "heading order", warn=True, fail_detail="skipped level")

    # --- OG ---
    def og(p):
        m = re.search(r'<meta\s+property="og:%s"\s+content="([^"]*)"' % p, src, re.I)
        return m.group(1).strip() if m else ""
    og_img = og("image")
    img_exists = True
    if og_img and og_img.startswith(SITE):
        rel = og_img[len(SITE):].lstrip("/")
        img_exists = os.path.exists(rel)
    check(all(og(p) for p in ("title", "description", "url", "image", "type")) and img_exists,
          "OpenGraph", fail_detail="missing tag" if not img_exists else "incomplete")

    # --- twitter ---
    tw = re.search(r'<meta\s+name=["\']twitter:card["\']', src, re.I)
    check(bool(tw), "twitter card", warn=True, fail_detail="missing")

    # --- viewport + lang ---
    check(bool(re.search(r'name=["\']viewport["\']', src, re.I)), "viewport", fail_detail="missing")
    check(bool(re.search(r"<html[^>]+lang=", src, re.I)), "lang", fail_detail="missing")

    # --- img alt ---
    imgs = re.findall(r"<img\b[^>]*>", src, re.I)
    no_alt = [i for i in imgs if not re.search(r'\salt=', i, re.I)]
    check(not no_alt, "img alt", f"{len(imgs)} imgs",
          fail_detail=f"{len(no_alt)} missing alt")

    # --- internal links (+broken) ---
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', src)
    internal = [h for h in hrefs if resolve(path, h)]
    broken = [h for h in internal if not os.path.exists(resolve(path, h))]
    check(len(internal) >= 1 and not broken, "internal links",
          f"{len(internal)} links",
          fail_detail=(f"{len(broken)} broken" if broken else "none"))

    # --- JSON-LD parse + types ---
    blocks = re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', src, re.S | re.I)
    types = set()
    jsonld_ok = bool(blocks)
    for b in blocks:
        try:
            data = json.loads(b)
            for node in (data.get("@graph", [data]) if isinstance(data, dict) else data):
                t = node.get("@type") if isinstance(node, dict) else None
                if t:
                    types |= set(t) if isinstance(t, list) else {t}
        except Exception:
            jsonld_ok = False
    check(jsonld_ok, "JSON-LD", ",".join(sorted(types)) or "", fail_detail="missing/invalid")

    # --- GEO: FAQ/definition/lists ---
    has_faq = "FAQPage" in types or "Question" in types
    check(has_faq, "GEO:FAQ schema", warn=True, fail_detail="no FAQPage")
    vis = text_between_tags(src)[:600]
    has_def = bool(re.search(r"\b[A-Z][\w &-]+\s+(is|are|does|helps)\b", vis))
    check(has_def, "GEO:definition", warn=True, fail_detail="no clear 'X is…' sentence near top")
    has_list = bool(re.search(r"<(ol|ul)[\s>]", src, re.I))
    check(has_list, "GEO:structured lists", warn=True, fail_detail="no ol/ul")

    pct = round(100 * score / total)
    return pct, rows


def site_checks():
    print("\n\033[1mSite-level\033[0m")
    # robots.txt
    if os.path.exists("robots.txt"):
        r = open("robots.txt").read()
        missing = [b for b in AI_BOTS if b not in r]
        lvl = OK if not missing else WARN
        print(f"  {lvl} robots.txt — AI crawlers " +
              ("all allowed" if not missing else "missing: " + ", ".join(missing)))
        print(f"  {OK if 'Sitemap:' in r else FAIL} robots.txt — Sitemap directive")
    else:
        print(f"  {FAIL} robots.txt missing")
    # sitemap
    if os.path.exists("sitemap.xml"):
        s = open("sitemap.xml").read()
        urls = re.findall(r"<loc>(.*?)</loc>", s)
        bad = [u for u in urls if u.startswith(SITE) and
               not os.path.exists((u[len(SITE):].lstrip("/") or "index.html").rstrip("/") +
                                  ("/index.html" if u.rstrip("/") == u[:len(SITE)] or u.endswith("/") else ""))]
        print(f"  {OK} sitemap.xml — {len(urls)} URLs")
    else:
        print(f"  {FAIL} sitemap.xml missing")


def main():
    args = sys.argv[1:] or ["."]
    files = collect(args)
    if not files:
        print("No HTML files found for:", args); return
    titles, descs = {}, {}
    results = []
    for f in files:
        pct, rows = audit_file(f, titles, descs)
        results.append((f, pct, rows))
    for f, pct, rows in results:
        color = "\033[32m" if pct >= 95 else "\033[33m" if pct >= 80 else "\033[31m"
        print(f"\n\033[1m{f}\033[0m — {color}{pct}/100\033[0m")
        bad = [r for r in rows if r[0] != OK]
        if not bad:
            print("  all checks pass")
        for lvl, label, detail in bad:
            print(f"  {lvl} {label}" + (f" — {detail}" if detail else ""))
    site_checks()
    avg = round(sum(p for _, p, _ in results) / len(results))
    print(f"\n\033[1mAverage: {avg}/100 across {len(results)} pages\033[0m")


if __name__ == "__main__":
    main()

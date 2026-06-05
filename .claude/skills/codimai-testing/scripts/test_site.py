#!/usr/bin/env python3
"""CodimAI static-site test/validation gate  deterministic, read-only.

Usage:  python3 test_site.py
Walks every *.html (excluding partials/ and blogs/includes/) and runs:
  Links, Structure, SEO contract, Structured data, Accessibility, DRY drift.
Prints PASS / WARN / FAIL per suite with offending files. Writes nothing.
"""
import os, re, glob, json, sys, html as _html

SITE = "https://codimai.com"
G, Y, R, B, X = "\033[32m", "\033[33m", "\033[31m", "\033[1m", "\033[0m"


def pages():
    fs = glob.glob("**/*.html", recursive=True)
    return sorted(f for f in fs
                  if "/partials/" not in f and not f.startswith("partials/")
                  and "/includes/" not in f)


def read(f):
    return open(f, encoding="utf-8").read()


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


def suite_links(files):
    fails = []
    n = 0
    for f in files:
        src = read(f)
        ids = set(re.findall(r'id=["\']([^"\']+)["\']', src)) | \
              set(re.findall(r'name=["\']([^"\']+)["\']', src))
        for href in re.findall(r'(?:href|src)=["\']([^"\']+)["\']', src):
            n += 1
            if href.startswith("#"):
                if len(href) > 1 and href[1:] not in ids:
                    fails.append((f, f"dead fragment {href}"))
                continue
            r = resolve(f, href)
            if r and not os.path.exists(r):
                fails.append((f, f"broken {href}"))
    return fails, f"{len(files)} files, {n} links"


def suite_structure(files):
    fails = []
    for f in files:
        src = read(f)
        h1 = len(re.findall(r"<h1[\s>]", src, re.I))
        if h1 != 1:
            fails.append((f, f"{h1} h1 tags"))
        for tag in ("main", "header", "footer", "nav"):
            if not re.search(r"<%s[\s>]" % tag, src, re.I):
                fails.append((f, f"missing <{tag}>"))
        if not re.search(r"<html[^>]+lang=", src, re.I):
            fails.append((f, "no html lang"))
        if not re.search(r'name=["\']viewport["\']', src, re.I):
            fails.append((f, "no viewport"))
        levels = [int(x) for x in re.findall(r"<h([1-6])[\s>]", src, re.I)]
        if any(b - a > 1 for a, b in zip(levels, levels[1:])):
            fails.append((f, "skipped heading level"))
    return fails, None


def suite_seo(files):
    fails = []
    titles, descs = {}, {}
    for f in files:
        src = read(f)
        m = re.search(r"<title>(.*?)</title>", src, re.S | re.I)
        t = _html.unescape(m.group(1).strip()) if m else ""
        if not t:
            fails.append((f, "no title"))
        elif len(t) > 60:
            fails.append((f, f"title {len(t)}>60"))
        else:
            titles.setdefault(t, []).append(f)
        m = re.search(r'name="description"\s+content="([^"]*)"', src, re.S | re.I)
        d = _html.unescape(m.group(1).strip()) if m else ""
        if not d:
            fails.append((f, "no description"))
        elif len(d) > 155:
            fails.append((f, f"desc {len(d)}>155"))
        else:
            descs.setdefault(d, []).append(f)
        cans = re.findall(r'rel=["\']canonical["\']\s+href=["\'](.*?)["\']', src, re.I)
        if len(cans) != 1 or not cans[0].startswith(SITE):
            fails.append((f, "canonical issue"))
        for p in ("og:title", "og:image", "twitter:card"):
            prop = "property" if p.startswith("og") else "name"
            if not re.search(r'%s=["\']%s["\']' % (prop, p), src, re.I):
                fails.append((f, f"missing {p}"))
        m = re.search(r'property="og:image"\s+content="([^"]*)"', src, re.I)
        if m and m.group(1).startswith(SITE):
            rel = m.group(1)[len(SITE):].lstrip("/")
            if not os.path.exists(rel):
                fails.append((f, f"og:image file missing ({rel})"))
    for t, fs in titles.items():
        if len(fs) > 1:
            fails.append((fs[1], f"duplicate title shared with {fs[0]}"))
    for d, fs in descs.items():
        if len(fs) > 1:
            fails.append((fs[1], f"duplicate description shared with {fs[0]}"))
    return fails, None


def suite_jsonld(files):
    fails = []
    counts = {}
    for f in files:
        src = read(f)
        for b in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', src, re.S | re.I):
            try:
                data = json.loads(b)
            except Exception as e:
                fails.append((f, f"invalid JSON-LD: {e}"))
                continue
            nodes = data.get("@graph", [data]) if isinstance(data, dict) else data
            for node in nodes:
                t = node.get("@type") if isinstance(node, dict) else None
                for tt in ([t] if isinstance(t, str) else (t or [])):
                    counts[tt] = counts.get(tt, 0) + 1
    summary = ", ".join(f"{k}×{v}" for k, v in sorted(counts.items()))
    return fails, summary


def suite_a11y(files):
    fails = []
    for f in files:
        src = read(f)
        for img in re.findall(r"<img\b[^>]*>", src, re.I):
            if not re.search(r"\salt=", img, re.I):
                fails.append((f, "img without alt"))
                break
        if "skip" not in src.lower() and re.search(r"<main", src, re.I):
            if not re.search(r'href=["\']#(main|content)', src, re.I):
                fails.append((f, "no skip-link"))
    return fails, None


def norm_chrome(block):
    # Reduce every href/src to its final path segment so page-depth prefixes
    # (assets/… vs ../assets/… vs /assets/…) don't register as drift.
    block = re.sub(
        r'(href|src)="[^"]*?([\w.-]+\.(?:html|png|webp|jpg|jpeg|svg|css|js|xml|ico|pdf))"',
        r'\1="\2"', block, flags=re.I)
    block = re.sub(r'(href|src)="(\.\./|/)+"?', r'\1="', block)  # bare dir refs
    block = re.sub(r'\saria-current="[^"]*"', "", block)         # active-state varies by page
    block = re.sub(r"\s+", "", block)                            # whitespace is not structure
    return block


def suite_dry(files):
    fails = []
    variants_note = []
    for tag in ("header", "footer"):
        groups = {}  # normalized chrome -> [files]
        for f in files:
            src = read(f)
            m = re.search(r"<%s\b.*?</%s>" % (tag, tag), src, re.S | re.I)
            if not m:
                continue
            groups.setdefault(norm_chrome(m.group(0)), []).append(f)
        if len(groups) <= 1:
            variants_note.append(f"{tag}: 1 variant")
            continue
        # majority group is canonical; everything else is drift
        canon = max(groups.values(), key=len)
        variants_note.append(f"{tag}: {len(groups)} variants")
        for norm, fs in groups.items():
            if fs is canon:
                continue
            for f in fs:
                fails.append((f, f"<{tag}> differs from the {len(canon)}-page majority"))
    return fails, "; ".join(variants_note)


SUITES = [("Links", suite_links), ("Structure", suite_structure),
          ("SEO contract", suite_seo), ("Structured data", suite_jsonld),
          ("Accessibility", suite_a11y), ("DRY drift", suite_dry)]


def main():
    files = pages()
    print(f"{B}CodimAI site tests  {len(files)} pages{X}\n")
    any_fail = False
    for name, fn in SUITES:
        fails, note = fn(files)
        # DRY + a11y skip-link treated as WARN, others FAIL
        warn = name in ("DRY drift", "Accessibility")
        if not fails:
            print(f"  {G}PASS{X}  {name:16}" + (f"  ({note})" if note else ""))
        else:
            tag = f"{Y}WARN{X}" if warn else f"{R}FAIL{X}"
            if not warn:
                any_fail = True
            print(f"  {tag}  {name:16}" + (f"  ({note})" if note else ""))
            for f, why in fails[:12]:
                print(f"        {f}  {why}")
            if len(fails) > 12:
                print(f"        … +{len(fails)-12} more")
    print()
    print(f"{R if any_fail else G}{B}{'FAIL  fix above before shipping' if any_fail else 'PASS  structural gate green'}{X}")
    sys.exit(1 if any_fail else 0)


if __name__ == "__main__":
    main()

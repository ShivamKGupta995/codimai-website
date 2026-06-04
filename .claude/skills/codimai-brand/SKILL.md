---
name: codimai-brand
description: Apply the CodimAI brand system — a light, warm, editorial, imagery-led aesthetic grounded in the REAL worldlabs.ai (white/cream backgrounds, near-black text, Gilda Display serif headlines + Roobert-style grotesk body, color carried by 3D-world imagery rather than UI accents). Use this whenever the task involves CodimAI's website, choosing fonts or text/background colors for CodimAI, styling a CodimAI page, section, or component, or building a premium spatial-intelligence / frontier-AI-research interface in the World Labs aesthetic. Trigger even when the user only says "build the CodimAI hero / about / blog page" or "what color should this text be" — this skill is the single source of truth for CodimAI's typography, color, spacing, and component styling.
---

# CodimAI Brand System

Grounded in the real worldlabs.ai (fetched and verified, not a generic dark-SaaS template). The actual World Labs site is **light-first, warm, and editorial**: a near-white/cream canvas, near-black serif-led headlines, restrained UI chrome, and large 3D-world imagery doing the emotional and chromatic work. Documented as white/gray palette with Gilda Display + Roobert typefaces. The feeling is a calm, premium research lab — not a neon cinematic dark dashboard.

Apply the tokens below to any CodimAI surface. For exact values and a paste-ready theme, read `references/tokens.css`.

## The core principle: let imagery carry the color

The single biggest driver of the World Labs feel is that **the UI itself is nearly monochrome** (warm whites, soft grays, near-black ink) and all saturated color comes from photographic/3D-render imagery placed in large, confident blocks. So:
- Keep backgrounds, text, and chrome neutral and warm.
- Spend "color budget" on hero images, world renders, and case-study thumbnails — not on buttons, gradients, or glows.
- A page should still feel complete and premium in grayscale, with imagery adding the life.

If a screen feels like a typical AI startup (blue CTAs, purple gradients, glow shadows), you've drifted from the reference — pull the chrome back to neutral.

## Choosing text color against backgrounds

Pick text by the surface it sits on. Everything is warm-neutral; contrast comes from a near-black ink, not pure `#000`.

| Surface | Heading / display | Body | Muted / caption | Link / action |
| --- | --- | --- | --- | --- |
| Page canvas `#F7F5F0` (warm white) | `#1A1A18` | `#3A3A36` | `#86847C` | `#1A1A18` underlined |
| Card / raised `#FFFFFF` | `#1A1A18` | `#3A3A36` | `#86847C` | `#1A1A18` underlined |
| Soft section `#EFEDE6` | `#1A1A18` | `#3A3A36` | `#86847C` | `#1A1A18` underlined |
| Dark feature block `#1A1A18` | `#F7F5F0` | `#C9C6BD` | `#86847C` | `#F7F5F0` underlined |

Rules of thumb:
- Never use pure black `#000` or pure white `#FFF` for text — use the warm near-black `#1A1A18` and warm white `#F7F5F0` so the palette stays soft and premium.
- Headings are near-black, body steps to a slightly lifted warm gray `#3A3A36` — that gentle gap reads "editorial," not "harsh."
- Links are the same near-black as headings, distinguished by an underline or weight rather than a bright accent color. World Labs largely avoids colored link text.

## Typography

The reference pairs a high-contrast display serif with a clean neutral grotesk.

| Usage | Font (reference) | Web-safe substitute | Weight |
| --- | --- | --- | --- |
| Display / hero headlines | Gilda Display | "Gilda Display" (Google Fonts) → fallback Playfair Display | 400 |
| Section headings | Gilda Display or grotesk | Gilda Display / Inter | 400–500 |
| Body, UI, nav, buttons | Roobert | Inter or "Hanken Grotesk" | 400–500 |
| Code / technical labels | mono | JetBrains Mono | 400 |

Notes:
- The serif is the signature. Use it large, at weight 400, with tight leading and generous size for hero and key statements. Let it breathe.
- Body grotesk stays modest in size and weight — it's a quiet supporting voice.
- Avoid heavy 700/800 weights for the serif; the elegance comes from thin-to-regular high-contrast strokes.

## Spacing & shape

- Generous vertical rhythm: large section padding (96–140px), wide margins, lots of negative space. Whitespace is doing as much work as imagery.
- Imagery is full-bleed or near-full-width, often edge-to-edge.
- Corners are gentle: `8–12px` on cards and image containers; the site avoids heavily rounded "pill" everything.
- Buttons are understated: text + subtle border or a quiet solid fill in the neutral ink, ~44–48px tall.

## Buttons

- **Primary:** solid near-black `#1A1A18` fill, warm-white `#F7F5F0` text, minimal or no shadow, `8px` radius. Quiet hover (slight opacity or background shift), no glow, no scale-bounce.
- **Secondary / link-style:** transparent, near-black text, thin `1px` border `rgba(26,26,24,.18)` or just an underline.

## Imagery direction

This is where CodimAI should invest. Use large, atmospheric 3D-world / spatial renders — depth, soft natural light, immersive environments. Place them in big confident blocks against the warm-white canvas. The site's identity is "from pixels to worlds," so favor imagery that implies explorable space and depth over flat illustration or stock UI screenshots.

## Motion

Restrained and natural — gentle fades and slow reveals as sections enter. No bounce, no neon transitions, no aggressive parallax. Calm and confident.

## Brand voice

Intelligent, calm, visionary, research-grade. Plain confident statements ("From pixels to worlds"). Avoid hype words, emoji, and loud marketing copy. Short declarative lines with room around them.

## Full token reference

For the complete warm-neutral palette, the dark feature-block tokens, the Google Fonts setup (Gilda Display + Inter + JetBrains Mono), and a paste-ready CSS-variables + Tailwind theme snippet, read `references/tokens.css`.

## Default page structure (mirrors worldlabs.ai)

Hero with large world imagery → mission statement (big serif line) → product capabilities (feature list with imagery) → "Labs"/showcase grid (case studies, community, learn) → research & insights (dated post cards) → closing CTA with footer illustration → minimal footer (links + socials + copyright).

## Recommended stack

Next.js + Tailwind + Framer Motion (subtle) + Lucide icons (sparingly). Fonts: Gilda Display (display) + Inter/Hanken Grotesk (body) + JetBrains Mono (technical). Theme: light, warm, editorial, imagery-led.

# Interaction patterns reference

Snippets for the few interactions CodimAI actually uses. Drop in and reuse — don't reimplement.

## Sticky nav with hairline on scroll

```js
// assets/js/nav.js
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const apply = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  apply();
  window.addEventListener('scroll', apply, { passive: true });
})();
```

```css
.nav             { position: sticky; top: 0; background: var(--cd-canvas); border-bottom: 1px solid transparent; transition: border-color .25s ease; }
.nav.is-scrolled { border-bottom-color: var(--cd-border); }
```

## One IntersectionObserver for all reveals

```js
// assets/js/reveal.js
(() => {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();
```

```css
[data-reveal]      { opacity: 0; transition: opacity .6s ease; }
[data-reveal].is-in{ opacity: 1; }
```

## Dropdown menu (keyboard accessible)

```html
<div class="nav__dd">
  <button class="nav__dd-btn" aria-expanded="false" aria-controls="dd-ai">AI</button>
  <div class="nav__dd-panel" id="dd-ai" role="menu">
    <a href="/ai.html#agentic-ai" role="menuitem">Agentic AI</a>
    …
  </div>
</div>
```

```css
.nav__dd        { position: relative; }
.nav__dd-panel  { position: absolute; top: calc(100% + 8px); left: -12px; min-width: 220px;
                  background: var(--cd-surface); border: 1px solid var(--cd-border);
                  border-radius: var(--cd-radius); padding: 12px;
                  opacity: 0; pointer-events: none; transform: translateY(-4px);
                  transition: opacity .2s ease, transform .2s ease; }
.nav__dd:hover .nav__dd-panel,
.nav__dd:focus-within .nav__dd-panel { opacity: 1; pointer-events: auto; transform: translateY(0); }
```

```js
// Keyboard: arrow keys + Esc
document.querySelectorAll('.nav__dd-btn').forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') btn.blur();
    if (e.key === 'ArrowDown') { e.preventDefault(); btn.parentElement.querySelector('[role="menuitem"]').focus(); }
  });
});
```

## Button variants (the only three)

```css
.btn               { display: inline-flex; align-items: center; justify-content: center; height: 46px; padding: 0 22px;
                     font-family: var(--cd-font-body); font-weight: 500; font-size: 14px;
                     border-radius: var(--cd-radius-sm); border: 1px solid transparent; cursor: pointer;
                     transition: opacity .2s ease, background-color .2s ease, border-color .2s ease; }
.btn--primary      { background: var(--cd-ink);     color: var(--cd-on-dark); }
.btn--primary:hover{ opacity: .86; }
.btn--secondary    { background: transparent;       color: var(--cd-ink); border-color: var(--cd-border-strong); }
.btn--secondary:hover { border-color: var(--cd-ink); }
.btn--ondark       { background: var(--cd-on-dark); color: var(--cd-ink); }   /* for use inside .section--dark */
```

## Focus ring (mandatory)

```css
:focus-visible {
  outline: 2px solid var(--cd-ink);
  outline-offset: 2px;
  border-radius: var(--cd-radius-sm);
}
```

## Reduced motion

Always include:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  [data-reveal] { opacity: 1 !important; }
}
```

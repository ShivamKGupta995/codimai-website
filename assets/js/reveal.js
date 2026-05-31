/* ============================================================
   Scroll-reveal — single shared implementation (DRY).
   Any element with .reveal fades/rises in once on entry.
   Optional per-element stagger via inline style="--delay:0.2s".
   Respects prefers-reduced-motion (shows everything immediately).
   ============================================================ */
(function () {
  'use strict';

  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* No motion, or no observer support → reveal straight away. */
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = getComputedStyle(el).getPropertyValue('--delay').trim();
      if (delay) el.style.transitionDelay = delay;
      el.classList.add('is-visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(function (el) { observer.observe(el); });
}());

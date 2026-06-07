/* ============================================================
   Sticky "Book a free AI audit" CTA.
   Appears once the visitor scrolls past the hero, and hides again
   near the closing CTA so the two never compete. Quiet by default;
   degrades to nothing if the element is absent.
   ============================================================ */
(function () {
  'use strict';

  var cta = document.getElementById('stickyCta');
  if (!cta) return;

  var closing = document.querySelector('.closing-screen');
  cta.hidden = false; /* take over visibility from CSS opacity */

  function update() {
    var pastHero = window.scrollY > window.innerHeight * 0.9;

    /* Hide when the closing CTA is on screen. */
    var nearEnd = false;
    if (closing) {
      var top = closing.getBoundingClientRect().top;
      nearEnd = top < window.innerHeight * 0.85;
    }

    cta.classList.toggle('is-visible', pastHero && !nearEnd);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { update(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}());

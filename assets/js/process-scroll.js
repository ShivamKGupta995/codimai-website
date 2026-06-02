(function () {
  'use strict';

  var steps = document.querySelectorAll('.process-step-section');
  if (!steps.length) return;

  // ── IntersectionObserver: mark each step when it fills the screen ──
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in-view');
      } else {
        // Remove so re-entry re-animates
        entry.target.classList.remove('is-in-view');
      }
    });
  }, {
    threshold: 0.55 // trigger when >55% of the section is visible
  });

  steps.forEach(function (step) { observer.observe(step); });

}());

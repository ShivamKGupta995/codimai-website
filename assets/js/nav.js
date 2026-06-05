(function () {
  'use strict';

  /* ---- Sticky header hairline on scroll ------------------ */

  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Dropdown menus (desktop) -------------------------- */

  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(function (dropdown) {
    const trigger = dropdown.querySelector('.nav-btn-ghost');
    const menu    = dropdown.querySelector('.nav-dropdown__menu');
    if (!trigger || !menu) return;

    let closeTimer = null;

    function open() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      /* 180ms delay  cursor moving from button toward menu won't close it */
      closeTimer = setTimeout(function () {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        closeTimer = null;
      }, 180);
    }

    /* Hover */
    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', close);

    /* Keyboard: Enter/Space opens, Escape closes */
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdown.classList.contains('is-open') ? close() : open();
      }
      if (e.key === 'Escape') close();
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) close();
    });

    /* Arrow-key navigation within open menu */
    menu.addEventListener('keydown', function (e) {
      const items = Array.from(menu.querySelectorAll('a'));
      const idx   = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        (items[idx + 1] || items[0]).focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        (items[idx - 1] || items[items.length - 1]).focus();
      }
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });

  /* ---- Mobile menu --------------------------------------- */

  const hamburger     = document.querySelector('.nav-hamburger');
  const mobileOverlay = document.querySelector('.nav-mobile-overlay');

  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileOverlay.classList.contains('is-open');
      mobileOverlay.classList.toggle('is-open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('is-open')) {
        mobileOverlay.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });

    /* Mobile sub-menus */
    const mobileToggles = mobileOverlay.querySelectorAll('.nav-btn-ghost');
    mobileToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const sub = btn.nextElementSibling;
        if (!sub) return;
        const open = sub.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }
}());

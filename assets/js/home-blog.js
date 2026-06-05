/* ============================================================
   Home blog preview  progressive enhancement.
   The grid ships with static fallback cards (good for no-JS and
   crawlers). On load we fetch the latest published posts from the
   blog API and swap them in. If the API is unavailable or empty,
   the static cards are left untouched.
   ============================================================ */
(function () {
  'use strict';

  var grid = document.getElementById('blogPreviewGrid');
  if (!grid || !('fetch' in window)) return;

  var API = 'blogs/backend/api/posts.php?status=published&limit=3';

  /* Category placeholder icons  mirror blogs/index.html for visual parity. */
  var CAT_ICONS = {
    'Agentic AI':     '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/></svg>',
    'Generative AI':  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    'Insights':       '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'Agents':         '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'Prediction':     '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'Recommendation': '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
    'Data Analytics': '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    'default':        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
  };

  fetch(API)
    .then(function (r) { if (!r.ok) throw new Error('API unavailable'); return r.json(); })
    .then(function (data) {
      var posts = data && data.posts;
      if (!posts || !posts.length) return;          // keep static fallback
      grid.innerHTML = posts.slice(0, 3).map(card).join('');
      revealNew(grid);
    })
    .catch(function () { /* keep static fallback */ });

  function card(p, i) {
    var url   = 'blogs/post.php?slug=' + encodeURIComponent(p.slug);
    var icon  = CAT_ICONS[p.category] || CAT_ICONS['default'];
    var thumb = p.thumbnail_url
      ? '<img src="' + esc(p.thumbnail_url) + '" alt="' + esc(p.title) + '" class="blog-card__thumb" loading="lazy" width="640" height="360">'
      : '<div class="blog-card__placeholder">' + icon + '</div>';

    return '' +
      '<article class="blog-card reveal" role="listitem" style="--delay:' + (0.05 * (i + 1)).toFixed(2) + 's">' +
        '<a href="' + url + '" class="blog-card__thumb-wrap" tabindex="-1" aria-hidden="true">' +
          thumb +
          '<span class="blog-card__cat">' + esc(p.category || 'Article') + '</span>' +
        '</a>' +
        '<div class="blog-card__body">' +
          '<h3 class="blog-card__title"><a href="' + url + '">' + esc(p.title) + '</a></h3>' +
          (p.excerpt ? '<p class="blog-card__excerpt">' + esc(p.excerpt) + '</p>' : '') +
          '<div class="blog-card__footer">' +
            '<time class="blog-card__date" datetime="' + esc(p.published_at) + '">' + fmtDate(p.published_at) + '</time>' +
            '<span class="blog-card__read-cta">Read <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg></span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* The shared reveal observer only sees elements present at load, so
     reveal the freshly-injected cards ourselves (respecting motion prefs). */
  function revealNew(scope) {
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scope.querySelectorAll('.reveal').forEach(function (el) {
      var d = getComputedStyle(el).getPropertyValue('--delay').trim();
      if (d && !reduce) el.style.transitionDelay = d;
      el.classList.add('is-visible');
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(s) {
    if (!s) return '';
    return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}());

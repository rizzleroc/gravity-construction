// Gravity Construction — minimal interactivity
(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close on link click (mobile)
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Live content loaders (populated from /api/*) ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.hidden = false;
  }

  function safeFetch(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); })
      .catch(function (err) { console.warn('[gravity]', err.message); return null; });
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtDateTime(iso) {
    if (!iso) return '';
    var d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function renderSpecials(rows) {
    var bar = document.getElementById('specials-bar');
    if (!bar || !rows || !rows.length) return;
    // Show the first active one as a sticky ribbon; additional ones rotate every 7s
    var i = 0;
    function render() {
      var s = rows[i % rows.length];
      var cta = (s.cta_label && s.cta_href)
        ? ' <a class="specials-cta" href="' + esc(s.cta_href) + '">' + esc(s.cta_label) + ' →</a>'
        : '';
      bar.innerHTML =
        '<div class="specials-inner">' +
          '<strong>' + esc(s.title) + '</strong>' +
          (s.body ? ' <span class="specials-body">' + esc(s.body).replace(/\n+/g, ' ') + '</span>' : '') +
          cta +
          '<button type="button" class="specials-close" aria-label="Dismiss">×</button>' +
        '</div>';
      var close = bar.querySelector('.specials-close');
      if (close) close.addEventListener('click', function () { bar.hidden = true; });
    }
    render();
    show('specials-bar');
    if (rows.length > 1) {
      setInterval(function () { i++; render(); }, 7000);
    }
  }

  function renderWeather(data) {
    var chip = document.getElementById('weather-chip');
    if (!chip || !data || !data.current) return;
    var c = data.current;
    chip.innerHTML =
      '<span class="weather-temp">' + esc(c.temperature) + '°' + esc(c.unit || 'F') + '</span>' +
      '<span class="weather-meta">' +
        '<span class="weather-loc">' + esc(data.location || 'Santa Cruz') + '</span>' +
        '<span class="weather-short">' + esc(c.shortForecast || '') + '</span>' +
      '</span>';
    show('weather-chip');
  }

  function renderProjects(rows) {
    var wrap = document.getElementById('projects-grid');
    if (!wrap || !rows || !rows.length) return;
    wrap.innerHTML = rows.map(function (p) {
      var img = p.hero_image
        ? '<div class="pcard-img" style="background-image:url(' + esc(p.hero_image) + ')"></div>'
        : '<div class="pcard-img pcard-img-blank"></div>';
      var tagline = [p.scope, p.location].filter(Boolean).join(' · ');
      return '<article class="pcard">' +
        img +
        '<div class="pcard-body">' +
          (tagline ? '<p class="pcard-tag">' + esc(tagline) + '</p>' : '') +
          '<h3>' + esc(p.title) + '</h3>' +
          (p.summary ? '<p class="pcard-summary">' + esc(p.summary) + '</p>' : '') +
        '</div>' +
      '</article>';
    }).join('');
    show('projects');
  }

  function renderTestimonials(rows) {
    var wrap = document.getElementById('testimonials-grid');
    if (!wrap || !rows || !rows.length) return;
    wrap.innerHTML = rows.map(function (t) {
      var stars = t.rating ? '<span class="t-stars" aria-label="' + t.rating + ' out of 5">' +
        Array(t.rating + 1).join('★') + '<span class="t-stars-empty">' + Array(6 - t.rating).join('★') + '</span></span>' : '';
      var byline = t.author + (t.location ? ' · ' + t.location : '');
      return '<figure class="tcard">' +
        stars +
        '<blockquote>"' + esc(t.quote) + '"</blockquote>' +
        '<figcaption>— ' + esc(byline) + '</figcaption>' +
      '</figure>';
    }).join('');
    show('testimonials');
  }

  function renderEvents(rows) {
    var wrap = document.getElementById('events-list');
    if (!wrap || !rows || !rows.length) return;
    wrap.innerHTML = rows.map(function (ev) {
      var when = fmtDateTime(ev.starts_at);
      var title = ev.url
        ? '<a href="' + esc(ev.url) + '" target="_blank" rel="noopener">' + esc(ev.title) + '</a>'
        : esc(ev.title);
      return '<li class="event-item">' +
        '<span class="event-when">' + esc(when) + '</span>' +
        '<div class="event-body">' +
          '<h3>' + title + '</h3>' +
          (ev.location ? '<p class="event-loc">' + esc(ev.location) + '</p>' : '') +
          (ev.description ? '<p class="event-desc">' + esc(ev.description) + '</p>' : '') +
        '</div>' +
      '</li>';
    }).join('');
    show('events');
    show('nav-events');
  }

  function renderPosts(rows) {
    var wrap = document.getElementById('posts-grid');
    if (!wrap || !rows || !rows.length) return;
    wrap.innerHTML = rows.slice(0, 3).map(function (p) {
      var img = p.hero_image
        ? '<div class="post-img" style="background-image:url(' + esc(p.hero_image) + ')"></div>'
        : '';
      var href = '/blog/' + esc(p.slug);
      return '<a class="post-card" href="' + href + '" aria-label="Read: ' + esc(p.title) + '">' +
        img +
        '<div class="post-body">' +
          '<p class="post-date">' + esc(fmtDate(p.published_at)) + '</p>' +
          '<h3>' + esc(p.title) + '</h3>' +
          (p.excerpt ? '<p class="post-excerpt">' + esc(p.excerpt) + '</p>' : '') +
          '<span class="post-more" aria-hidden="true">Read →</span>' +
        '</div>' +
      '</a>';
    }).join('');
    show('blog');
  }

  function renderInstagram(rows) {
    var wrap = document.getElementById('ig-grid');
    if (!wrap || !rows || !rows.length) return;
    wrap.innerHTML = rows.map(function (p) {
      return '<blockquote class="instagram-media" data-instgrm-permalink="' +
        esc(p.url) + '" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; margin:0; max-width:540px; min-width:280px; padding:0; width:100%;"></blockquote>';
    }).join('');

    // Load Instagram's embed.js once, then tell it to (re)process the blockquotes.
    function processEmbeds() {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    }
    if (window.instgrm && window.instgrm.Embeds) {
      processEmbeds();
    } else if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      s.onload = processEmbeds;
      document.body.appendChild(s);
    } else {
      // script was added but hadn't finished loading yet
      setTimeout(processEmbeds, 500);
    }
  }

  // Kick off all content fetches in parallel — each section independently reveals itself when it has data
  safeFetch('/api/specials').then(renderSpecials);
  safeFetch('/gravity-construction/api/weather.json').then(renderWeather);
  safeFetch('/api/projects?featured=1').then(renderProjects);
  safeFetch('/api/testimonials').then(renderTestimonials);
  safeFetch('/api/events').then(renderEvents);
  safeFetch('/api/posts').then(renderPosts);
  safeFetch('/gravity-construction/api/instagram.json').then(renderInstagram);

  // ---------- Carousel ----------
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var prev  = root.querySelector('.carousel-prev');
    var next  = root.querySelector('.carousel-next');
    var dotsWrap = root.querySelector('.carousel-dots');
    if (!track) return;

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;

    // Build dots (one per slide)
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        d.addEventListener('click', function () { scrollToIndex(i); });
        dotsWrap.appendChild(d);
      });
    }

    function slideStep() {
      if (slides.length < 2) return track.clientWidth;
      // distance between two slides' left edges = slide width + gap
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }

    function currentIndex() {
      var step = slideStep() || 1;
      return Math.round(track.scrollLeft / step);
    }

    function scrollToIndex(i) {
      var step = slideStep();
      track.scrollTo({ left: i * step, behavior: 'smooth' });
    }

    function updateUI() {
      var i = currentIndex();
      var maxScroll = track.scrollWidth - track.clientWidth - 1;
      if (prev) prev.disabled = track.scrollLeft <= 1;
      if (next) next.disabled = track.scrollLeft >= maxScroll;
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, idx) {
          dot.classList.toggle('is-active', idx === i);
          dot.setAttribute('aria-selected', idx === i ? 'true' : 'false');
        });
      }
    }

    if (prev) prev.addEventListener('click', function () {
      track.scrollBy({ left: -slideStep(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      track.scrollBy({ left: slideStep(), behavior: 'smooth' });
    });

    // Keyboard support
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); track.scrollBy({ left: -slideStep(), behavior: 'smooth' }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left:  slideStep(), behavior: 'smooth' }); }
    });
    track.setAttribute('tabindex', '0');

    // Throttled scroll handler for UI sync
    var scrollTimer = null;
    track.addEventListener('scroll', function () {
      if (scrollTimer) return;
      scrollTimer = setTimeout(function () { updateUI(); scrollTimer = null; }, 80);
    });
    window.addEventListener('resize', updateUI);

    // Autoplay (pauses on hover / touch / focus)
    var AUTOPLAY_MS = 5000;
    var autoplayId = null;
    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(function () {
        var maxScroll = track.scrollWidth - track.clientWidth - 1;
        if (track.scrollLeft >= maxScroll) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: slideStep(), behavior: 'smooth' });
        }
      }, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
    }
    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', startAutoplay);
    root.addEventListener('touchstart', stopAutoplay, { passive: true });

    // Respect reduced-motion
    var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!rm.matches) startAutoplay();

    updateUI();
  });
})();

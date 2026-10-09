/* =========================================================
   GOD TRADING — interactions (aucune dépendance)
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var mm = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mm('(prefers-reduced-motion: reduce)');
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };

  /* ---------- année du pied de page ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- menu mobile ---------- */
  var burger = $('.nav-burger');
  var panel = document.getElementById('menu-mobile');
  var menuOpen = function () { return !!panel && !panel.hidden; };
  var setMenu = function (open) {
    if (!burger || !panel) return;
    panel.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (open) doc.removeAttribute('data-down');
  };
  if (burger && panel) {
    burger.addEventListener('click', function () { setMenu(!menuOpen()); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen()) { setMenu(false); burger.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (menuOpen() && !e.target.closest('.topbar')) setMenu(false);
    });
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 1025px)');
      var onWide = function () { if (wide.matches) setMenu(false); };
      if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
    }
  }

  /* ---------- menu : section active ---------- */
  var navLinks = $$('.nav-item');
  if (navLinks.length && hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('on', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- carrousel des avis ---------- */
  var rv = $('.rv');
  if (rv) {
    var track = $('.rv-track', rv);
    var cards = $$('.rv-card', rv);
    var prev = $('[data-prev]', rv);
    var next = $('[data-next]', rv);
    var dotsBox = $('.rv-dots', rv);
    var dots = [];
    var step = function () {
      if (!cards.length) return 1;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    };
    var pageCount = function () { return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1); };
    var current = function () { return Math.round(track.scrollLeft / step()); };
    var go = function (i) {
      var n = dots.length || 1;
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: i * step(), behavior: reduce ? 'auto' : 'smooth' });
    };
    var sync = function () {
      var i = current();
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= dots.length - 1;
    };
    var build = function () {
      var n = pageCount();
      if (n === dots.length) { sync(); return; }
      if (n <= 1) rv.setAttribute('data-static', ''); else rv.removeAttribute('data-static');
      dotsBox.innerHTML = '';
      dots = [];
      for (var i = 0; i < n; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Aller à l’avis ' + (i + 1));
        b.addEventListener('click', go.bind(null, i));
        dotsBox.appendChild(b);
        dots.push(b);
      }
      sync();
    };
    if (prev) prev.addEventListener('click', function () { go(current() - 1); });
    if (next) next.addEventListener('click', function () { go(current() + 1); });
    var rvRaf = 0;
    track.addEventListener('scroll', function () {
      if (rvRaf) return;
      rvRaf = requestAnimationFrame(function () { rvRaf = 0; sync(); });
    }, { passive: true });
    var rvT = 0;
    window.addEventListener('resize', function () { clearTimeout(rvT); rvT = setTimeout(build, 150); });
    build();
  }

  if (reduce) return;

  /* ---------- apparitions en cascade ---------- */
  if (hasIO) {
    var sel = '.sec-head, .g-stats, .about > *, .svc, .path, .g-faq > *, .g-contact > *, .g-why > *, .g-cards > *, .rv, .promo-in > .btn, .g-steps > *, .g-2col > *, .g-foot > *';
    var targets = $$(sel);
    targets.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return targets.indexOf(c) !== -1; }) : [el];
      var idx = Math.max(0, sib.indexOf(el));
      el.style.setProperty('--d', Math.min(idx * 0.09, 0.45) + 's');
      el.setAttribute('data-r', '');
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.setAttribute('data-in', '');
        rio.unobserve(el);
        setTimeout(function () { el.setAttribute('data-done', ''); }, 2400);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- défilement : progression, en-tête, bandeau, parallaxe ---------- */
  var tick = $('.tick');
  var book = $('.book');
  var lastY = window.scrollY, raf = 0, skT = 0;
  var onScroll = function () {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var y = window.scrollY;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      doc.style.setProperty('--p', (y / max).toFixed(4));
      if (y > 40) doc.setAttribute('data-sc', ''); else doc.removeAttribute('data-sc');
      var dy = y - lastY;
      if (y > 640 && dy > 6 && !menuOpen()) doc.setAttribute('data-down', '');
      else if (dy < -4 || y < 640) doc.removeAttribute('data-down');
      var vel = Math.max(-12, Math.min(12, dy * 0.6));
      if (tick) tick.style.setProperty('--sk', (-vel * 0.6).toFixed(2) + 'deg');
      if (book) {
        var r = book.getBoundingClientRect();
        var c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        book.style.setProperty('--py', (c * -60).toFixed(1) + 'px');
      }
      lastY = y;
      clearTimeout(skT);
      skT = setTimeout(function () { if (tick) tick.style.setProperty('--sk', '0deg'); }, 120);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- souris : curseur doré, boutons magnétiques, projecteur, héros 3D ---------- */
  if (mm('(hover: hover) and (pointer: fine)')) {
    var cur = $('.cur'), dot = $('.cur-dot'), art = $('.hero-art');
    var mx = -100, my = -100, cx = -100, cy = -100, loop = 0, mag = null;
    var follow = function () {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      if (cur) cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      loop = (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) ? requestAnimationFrame(follow) : 0;
    };
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      doc.setAttribute('data-cur', '');
      if (dot) dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      if (!loop) loop = requestAnimationFrame(follow);
      var t = e.target && e.target.closest ? e.target : null;
      if (t && t.closest('a, button, summary')) doc.setAttribute('data-hov', ''); else doc.removeAttribute('data-hov');
      var card = t && t.closest('.lift');
      if (card) {
        var cr = card.getBoundingClientRect();
        card.style.setProperty('--cx', (e.clientX - cr.left) + 'px');
        card.style.setProperty('--cy', (e.clientY - cr.top) + 'px');
      }
      var b = t && t.closest('.btn');
      if (mag && mag !== b) { mag.style.setProperty('--bx', '0px'); mag.style.setProperty('--by', '0px'); }
      mag = b || null;
      if (b) {
        var br = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - br.left - br.width / 2) * 0.22).toFixed(1) + 'px');
        b.style.setProperty('--by', ((e.clientY - br.top - br.height / 2) * 0.35).toFixed(1) + 'px');
      }
      if (art) {
        var ar = art.getBoundingClientRect();
        if (ar.bottom > 0 && ar.top < window.innerHeight) {
          var nx = Math.max(-1, Math.min(1, (e.clientX - (ar.left + ar.width / 2)) / (window.innerWidth / 2)));
          var ny = Math.max(-1, Math.min(1, (e.clientY - (ar.top + ar.height / 2)) / (window.innerHeight / 2)));
          art.style.setProperty('--mx', nx.toFixed(3)); art.style.setProperty('--my', ny.toFixed(3));
          art.style.setProperty('--rx', (nx * 7).toFixed(2) + 'deg'); art.style.setProperty('--ry', (-ny * 5).toFixed(2) + 'deg');
        }
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { doc.removeAttribute('data-cur'); });
  }

  /* ---------- poussière d'or dans le héros ---------- */
  var cv = $('.dust');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, run = true, id = 0;
    var size = function () {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);
    var N = window.innerWidth < 640 ? 22 : 46;
    var ps = [];
    for (var i = 0; i < N; i++) {
      ps.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.0006 + Math.random() * 0.0016, w: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6 });
    }
    var draw = function (t) {
      if (!run) { id = 0; return; }
      ctx.clearRect(0, 0, W, H);
      ctx.shadowColor = 'rgba(233,182,59,.8)';
      ctx.shadowBlur = 6;
      for (var k = 0; k < ps.length; k++) {
        var p = ps[k];
        p.y -= p.s; p.w += 0.01;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        var x = (p.x + Math.sin(p.w) * 0.015) * W, y = p.y * H;
        var fade = Math.min(1, p.y * 3, (1.05 - p.y) * 4);
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(233,182,59,' + (p.a * fade * (0.6 + 0.4 * Math.sin(t / 600 + p.w))).toFixed(3) + ')';
        ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    var visible = true;
    var update = function () {
      run = visible && !document.hidden;
      if (run && !id) id = requestAnimationFrame(draw);
    };
    if (hasIO) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; update(); }).observe(cv);
    } else {
      update();
    }
    document.addEventListener('visibilitychange', update);
  }
})();

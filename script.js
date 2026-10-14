/* =========================================================
   GOD TRADING — interactions (aucune dépendance)
   Principes : retour immédiat, mouvements interruptibles,
   rien ne bloque la saisie, préférences système respectées.
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var onChange = function (mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
  };
  var reduce = mm('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var supports = function (rule) { return !!(window.CSS && CSS.supports && CSS.supports(rule)); };
  var scrollTimeline = supports('animation-timeline: scroll()');
  var viewTimeline = supports('animation-timeline: view()');
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };

  /* Sur iOS, :active ne s'affiche au toucher qu'avec un écouteur touchstart. */
  document.addEventListener('touchstart', function () {}, { passive: true });

  /* ---------- année du pied de page ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- menu mobile ---------- */
  var topbar = $('.topbar');
  var burger = $('.nav-burger');
  var panel = document.getElementById('menu-mobile');
  var closeTimer = 0;
  var menuOpen = function () { return doc.hasAttribute('data-menu'); };
  var setMenu = function (open) {
    if (!burger || !panel || open === menuOpen()) return;
    clearTimeout(closeTimer);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (open) {
      doc.setAttribute('data-menu', '');
      doc.removeAttribute('data-down');
      panel.hidden = false;
      void panel.offsetHeight; /* part de l'état replié (ou de la valeur courante si on rouvre en cours de fermeture) */
      panel.classList.add('open');
    } else {
      doc.removeAttribute('data-menu');
      panel.classList.remove('open');
      /* même chemin qu'à l'ouverture ; on retire le panneau une fois la sortie jouée */
      closeTimer = setTimeout(function () { if (!menuOpen()) panel.hidden = true; }, reduce ? 0 : 320);
    }
  };
  if (burger && panel && topbar) {
    burger.addEventListener('click', function () { setMenu(!menuOpen()); });
    panel.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      /* la section visée reçoit le focus après la navigation (le lien, lui, disparaît) */
      var href = a.getAttribute('href');
      var target = href && href.charAt(0) === '#' ? document.getElementById(href.slice(1)) : null;
      if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen()) { setMenu(false); burger.focus(); }
    });
    /* clic sur le voile ou ailleurs dans la page */
    document.addEventListener('click', function (e) {
      if (menuOpen() && !e.target.closest('.topbar')) setMenu(false);
    });
    /* sortie du menu au clavier (Tab) */
    topbar.addEventListener('focusout', function (e) {
      if (menuOpen() && e.relatedTarget && !topbar.contains(e.relatedTarget)) setMenu(false);
    });
    var wide = mm('(min-width: 1025px)');
    onChange(wide, function () { if (wide.matches) setMenu(false); });
  }

  /* ---------- navigation par ancre : l'en-tête reste visible pendant le trajet ---------- */
  var navigating = false, navTimer = 0;
  var endNav = function () { navigating = false; clearTimeout(navTimer); };
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('a[href^="#"]')) return;
    navigating = true;
    doc.removeAttribute('data-down');
    clearTimeout(navTimer);
    navTimer = setTimeout(endNav, 1500);
  });
  if ('onscrollend' in window) window.addEventListener('scrollend', function () { if (navigating) endNav(); });

  /* ---------- menu : section active ---------- */
  var navLinks = $$('.nav-item, .mob-panel a[href^="#"]');
  if (navLinks.length && hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = '#' + e.target.id;
        /* une section sans lien de menu (À propos, Pour qui…) garde l'état précédent */
        if (!navLinks.some(function (a) { return a.getAttribute('href') === id; })) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === id;
          a.classList.toggle('on', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- défilement : matériau de l'en-tête, masquage, progression, bandeau ---------- */
  var staticHeader = mm('(max-height: 500px)');
  var progress = $('.progress');
  var ticker = $('.ticker');
  var marquee = $('.marquee');
  var tickTop = 0, tickH = 1;
  var measure = function () {
    if (!ticker) return;
    var r = ticker.getBoundingClientRect();
    tickTop = r.top + window.scrollY;
    tickH = r.height || 1;
  };
  var lastY = window.scrollY, acc = 0, raf = 0;
  var frame = function () {
    raf = 0;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var sc = y > 40;
    if (sc !== doc.hasAttribute('data-sc')) { if (sc) doc.setAttribute('data-sc', ''); else doc.removeAttribute('data-sc'); }
    /* masquer après 48 px de descente cumulée, réafficher après 24 px de remontée */
    var dy = y - lastY;
    lastY = y;
    acc = (dy > 0) === (acc > 0) ? acc + dy : dy;
    if (y < 640 || acc < -24 || reduce || navigating || menuOpen() || staticHeader.matches) doc.removeAttribute('data-down');
    else if (acc > 48) doc.setAttribute('data-down', '');
    /* repli JS quand le navigateur ne sait pas lier une animation au défilement */
    if (progress && !scrollTimeline) {
      var max = Math.max(1, doc.scrollHeight - vh);
      progress.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
    }
    if (marquee && !viewTimeline && !reduce) {
      var p = Math.max(0, Math.min(1, (y + vh - tickTop) / (vh + tickH)));
      marquee.style.transform = 'translateX(' + (-p * 25).toFixed(3) + '%)';
    }
  };
  var onScroll = function () { if (!raf) raf = requestAnimationFrame(frame); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); });
  window.addEventListener('load', function () { measure(); onScroll(); });
  measure();
  frame();

  /* ---------- barre d'action mobile : apparaît quand les boutons du héros sortent de l'écran ---------- */
  var mbar = $('.mbar');
  var heroCtas = $('.hero-ctas');
  if (mbar) {
    if (hasIO && heroCtas) {
      new IntersectionObserver(function (es) {
        mbar.classList.toggle('show', !es[es.length - 1].isIntersecting);
      }).observe(heroCtas);
    } else {
      mbar.classList.add('show');
    }
  }

  /* ---------- carrousel des avis ---------- */
  var rv = $('.rv');
  if (rv) {
    var track = $('.rv-track', rv);
    var cards = $$('.rv-card', rv);
    var prev = $('[data-prev]', rv);
    var next = $('[data-next]', rv);
    var dotsBox = $('.rv-dots', rv);
    var curEl = $('[data-cur]', rv);
    var totEl = $('[data-total]', rv);
    var live = $('.rv-live', rv);
    var dots = [], target = -1, settle = 0, last = -1;
    var step = function () {
      if (!cards.length) return 1;
      return cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
    };
    var pageCount = function () { return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1); };
    var current = function () { return Math.round(track.scrollLeft / step()); };
    var sync = function (i) {
      var n = dots.length || 1;
      i = Math.max(0, Math.min(n - 1, i));
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      /* aria-disabled plutôt que disabled : le bouton garde le focus clavier */
      if (prev) prev.setAttribute('aria-disabled', String(i <= 0));
      if (next) next.setAttribute('aria-disabled', String(i >= n - 1));
      if (curEl) curEl.textContent = String(i + 1);
      if (live && i !== last) live.textContent = 'Avis ' + (i + 1) + ' sur ' + n;
      last = i;
    };
    var go = function (i) {
      var n = dots.length || 1;
      target = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: target * step(), behavior: reduce ? 'auto' : 'smooth' });
      sync(target);
      clearTimeout(settle);
      settle = setTimeout(function () { target = -1; }, 800);
    };
    /* les clics rapides s'additionnent : on part de la cible en cours, pas de la position à l'écran */
    var base = function () { return target >= 0 ? target : current(); };
    if (prev) prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') go(base() - 1); });
    if (next) next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') go(base() + 1); });
    var build = function () {
      var n = pageCount();
      var per = Math.max(1, cards.length - n + 1);
      if (n <= 1) rv.setAttribute('data-static', ''); else rv.removeAttribute('data-static');
      if (totEl) totEl.textContent = String(n);
      if (n !== dots.length) {
        dotsBox.innerHTML = '';
        dots = [];
        for (var i = 0; i < n; i++) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', per > 1 ? 'Avis ' + (i + 1) + ' à ' + (i + per) : 'Avis ' + (i + 1));
          b.addEventListener('click', go.bind(null, i));
          dotsBox.appendChild(b);
          dots.push(b);
        }
      }
      last = -1;
      sync(current());
    };
    var rvRaf = 0;
    track.addEventListener('scroll', function () {
      if (rvRaf || target >= 0) return;
      rvRaf = requestAnimationFrame(function () { rvRaf = 0; sync(current()); });
    }, { passive: true });
    track.addEventListener('scrollend', function () { target = -1; sync(current()); });
    var rvT = 0;
    window.addEventListener('resize', function () { clearTimeout(rvT); rvT = setTimeout(build, 150); });
    build();
  }

  if (reduce) return;

  /* ---------- apparitions au défilement ----------
     Seuls les blocs encore sous la ligne de flottaison sont masqués : rien de ce
     qui est déjà à l'écran ne disparaît, et l'apparition est courte (≈ 0,45 s). */
  if (hasIO) {
    var sel = '.sec-head, .g-stats, .about > *, .svc, .path, .g-faq > *, .g-contact > *, .g-why > *, .g-cards > *, .rv, .risk, .promo-in > .btn, .g-steps > *, .g-2col > *, .g-foot > *';
    var fold = window.innerHeight;
    var targets = $$(sel).filter(function (el) { return el.getBoundingClientRect().top > fold * 0.9; });
    targets.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return targets.indexOf(c) !== -1; }) : [el];
      var idx = Math.max(0, sib.indexOf(el));
      el.style.setProperty('--d', Math.min(idx * 0.06, 0.18) + 's');
      el.setAttribute('data-r', '');
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.setAttribute('data-in', '');
        rio.unobserve(e.target);
      });
    }, { threshold: 0 });
    targets.forEach(function (el) { rio.observe(el); });
    /* un bloc atteint au clavier apparaît tout de suite */
    document.addEventListener('focusin', function (e) {
      var b = e.target.closest && e.target.closest('[data-r]:not([data-in])');
      if (b) { b.setAttribute('data-in', ''); rio.unobserve(b); }
    });
  }

  /* ---------- poussière d'or (ordinateurs puissants uniquement, 6 s puis s'efface) ---------- */
  var cv = $('.dust');
  var strong = (navigator.hardwareConcurrency || 8) > 4;
  if (cv && cv.getContext && strong && mm('(hover: hover) and (pointer: fine) and (min-width: 1025px)').matches) {
    var ctx = cv.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, id = 0, lastT = 0, start = 0, visible = true;
    /* particule lumineuse pré-rendue (évite shadowBlur à chaque image) */
    var sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    var sctx = sprite.getContext('2d');
    var grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,226,140,1)');
    grad.addColorStop(0.35, 'rgba(233,182,59,.85)');
    grad.addColorStop(1, 'rgba(233,182,59,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
    var size = function () {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var sizeT = 0;
    size();
    window.addEventListener('resize', function () { clearTimeout(sizeT); sizeT = setTimeout(size, 150); });
    var ps = [];
    for (var k = 0; k < 40; k++) {
      ps.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.0012 + Math.random() * 0.003, w: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6 });
    }
    var draw = function (t) {
      id = 0;
      if (!visible || document.hidden) return;
      if (!start) start = t;
      if (t - start > 6000) { cv.classList.add('done'); return; }
      id = requestAnimationFrame(draw);
      if (t - lastT < 32) return; /* ~30 images/s suffisent pour un décor */
      lastT = t;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.y -= p.s; p.w += 0.02;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        var fade = Math.min(1, p.y * 3, (1.05 - p.y) * 4);
        var d = p.r * 5;
        ctx.globalAlpha = Math.max(0, p.a * fade * (0.6 + 0.4 * Math.sin(t / 600 + p.w)));
        ctx.drawImage(sprite, (p.x + Math.sin(p.w) * 0.015) * W - d / 2, p.y * H - d / 2, d, d);
      }
    };
    var wake = function () { if (visible && !document.hidden && !id && !cv.classList.contains('done')) id = requestAnimationFrame(draw); };
    if (hasIO) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; wake(); }).observe(cv);
    } else {
      wake();
    }
    document.addEventListener('visibilitychange', wake);
  } else if (cv) {
    cv.remove();
  }
})();

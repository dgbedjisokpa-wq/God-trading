/* Composants d'interface partagés : toasts, modales, confettis, anneaux de progression. */
(function (App) {
  'use strict';

  var U = App.U, h = U.h;
  var UI = {};

  /* ---------- Toast ---------- */
  var toastBox;
  UI.toast = function (text, icon, ms) {
    if (!toastBox) {
      toastBox = h('div.toasts', { role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toastBox);
    }
    var t = h('div.toast', { html: (icon ? App.icon(icon) : '') + '<span>' + U.esc(text) + '</span>' });
    toastBox.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(-8px)';
      setTimeout(function () { t.remove(); }, 320);
    }, ms || 2600);
  };

  /* ---------- Modale ---------- */
  /* UI.modal({title, body (HTML ou nœud), mascot: 'happy', actions: [{label, cls, onClick}], wide, onClose}) */
  UI.modal = function (o) {
    var prevFocus = document.activeElement;
    var back = h('div.modal-back', { role: 'dialog', 'aria-modal': 'true' });
    var box = h('div.modal' + (o.wide ? '.wide' : ''));
    if (o.style) Object.assign(box.style, o.style);
    if (o.mascot) box.appendChild(App.Mascot.el({ mood: o.mascot, size: o.mascotSize || 110 }));
    if (o.title) {
      var t = h('h2', { text: o.title, id: 'modal-title' });
      box.appendChild(t);
      back.setAttribute('aria-labelledby', 'modal-title');
    }
    if (o.body) {
      if (typeof o.body === 'string') box.appendChild(h('div', { html: o.body }));
      else box.appendChild(o.body);
    }
    var actions = h('div.modal-actions');
    (o.actions || [{ label: 'OK', cls: '' }]).forEach(function (a) {
      var b = h('button.btn' + (a.cls ? '.' + a.cls.split(' ').join('.') : ''), { type: 'button', text: a.label });
      b.addEventListener('click', function () {
        var keep = a.onClick ? a.onClick() : false;
        if (keep !== true) close();
      });
      actions.appendChild(b);
    });
    box.appendChild(actions);
    back.appendChild(box);

    function close() {
      document.removeEventListener('keydown', onKey, true);
      back.remove();
      if (o.onClose) o.onClose();
      if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) { /* rien */ } }
    }
    function onKey(e) {
      if (e.key === 'Escape' && o.dismissable !== false) { e.stopPropagation(); close(); }
    }
    back.addEventListener('click', function (e) { if (e.target === back && o.dismissable !== false) close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(back);
    var first = actions.querySelector('button');
    if (first) setTimeout(function () { first.focus(); }, 30);
    return { close: close, el: box };
  };

  UI.confirm = function (o) {
    return new Promise(function (resolve) {
      UI.modal({
        title: o.title, body: o.body ? '<p>' + o.body + '</p>' : '', mascot: o.mascot || 'sad',
        actions: [
          { label: o.yes || 'Confirmer', cls: o.yesCls || '', onClick: function () { resolve(true); } },
          { label: o.no || 'Annuler', cls: 'flat', onClick: function () { resolve(false); } }
        ],
        onClose: function () { resolve(false); }
      });
    });
  };

  /* ---------- Anneau de progression SVG ---------- */
  UI.ring = function (size, stroke, pct, color, track) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r;
    var off = c * (1 - U.clamp(pct, 0, 1));
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (track || 'var(--line)') + '" stroke-width="' + stroke + '"/>' +
      '<circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke +
      '" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" style="transition: stroke-dashoffset .3s linear"/></svg>';
  };
  UI.setRing = function (svgParent, pct) {
    var c = svgParent.querySelector('.ring-fg');
    if (!c) return;
    var r = +c.getAttribute('r'), len = 2 * Math.PI * r;
    c.setAttribute('stroke-dashoffset', len * (1 - U.clamp(pct, 0, 1)));
  };

  /* ---------- Confettis ---------- */
  UI.confetti = function (ms) {
    if (U.prefersReducedMotion()) return;
    var cv = h('canvas.confetti', { 'aria-hidden': 'true' });
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d');
    var W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    var colors = ['#8A3FFC', '#C084FC', '#FFC800', '#FF4B91', '#58CC02', '#1CB0F6', '#A855F7'];
    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({
        x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35 + (Math.random() - .5) * 40,
        vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 4,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
        c: colors[i % colors.length]
      });
    }
    var start = performance.now(), dur = ms || 2600;
    (function frame(now) {
      var t = now - start;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t / dur);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 2);
        ctx.restore();
      });
      if (t < dur) requestAnimationFrame(frame);
      else cv.remove();
    })(start);
  };

  /* ---------- Divers ---------- */
  UI.switchRow = function (title, sub, checked, onChange) {
    var input = h('input', { type: 'checkbox', role: 'switch', 'aria-label': title });
    input.checked = !!checked;
    input.addEventListener('change', function () { onChange(input.checked); });
    return h('div.switch-row', null, [
      h('div', null, [h('div.t', { text: title }), sub ? h('div.s', { text: sub }) : null]),
      h('label.switch', null, [input, h('span')])
    ]);
  };

  UI.pageHead = function (title, mood, sub) {
    return h('div.page-head', null, [
      App.Mascot.el({ mood: mood || 'idle', size: 70 }),
      h('div', null, [h('h1', { text: title }), sub ? h('p.muted', { text: sub, style: { margin: '4px 0 0', fontWeight: 700 } }) : null])
    ]);
  };

  /* Courbe d'intonation (demi-tons) */
  UI.pitchSVG = function (contour) {
    var pts = contour || [];
    var W = 600, H = 90;
    var n = pts.length;
    if (n < 2) return '';
    var d = '', pen = false;
    for (var i = 0; i < n; i++) {
      var v = pts[i];
      if (v === null) { pen = false; continue; }
      var x = (i / (n - 1)) * W, y = H / 2 - (v / 10) * (H / 2 - 8);
      d += (pen ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      pen = true;
    }
    return '<svg class="pitch-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Courbe de la mélodie de ta voix">' +
      '<line x1="0" y1="' + H / 2 + '" x2="' + W + '" y2="' + H / 2 + '" stroke="var(--line-strong)" stroke-dasharray="4 6"/>' +
      '<path d="' + d + '" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
  };

  App.UI = UI;
})(window.App = window.App || {});

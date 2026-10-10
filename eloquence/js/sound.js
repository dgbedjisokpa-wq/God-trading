/* Effets sonores synthétisés (aucun fichier audio). */
(function (App) {
  'use strict';

  var ctx = null;

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* rien */ } }
    return ctx;
  }

  function enabled() {
    return !App.Store || App.Store.get().settings.sound !== false;
  }

  function tone(freq, start, dur, opts) {
    var a = ac();
    if (!a) return;
    opts = opts || {};
    var t0 = a.currentTime + start;
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(opts.slide, t0 + dur);
    var vol = opts.vol || 0.18;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  var FX = {
    tap: function () { tone(660, 0, 0.06, { type: 'triangle', vol: 0.08 }); },
    correct: function () {
      tone(784, 0, 0.14, { type: 'triangle', vol: 0.2 });
      tone(1175, 0.09, 0.28, { type: 'triangle', vol: 0.2 });
    },
    wrong: function () {
      tone(220, 0, 0.18, { type: 'square', vol: 0.06, slide: 180 });
      tone(185, 0.12, 0.26, { type: 'square', vol: 0.06, slide: 150 });
    },
    match: function () { tone(988, 0, 0.1, { type: 'triangle', vol: 0.14 }); },
    complete: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.1, 0.32, { type: 'triangle', vol: 0.18 }); });
      tone(1319, 0.42, 0.6, { type: 'sine', vol: 0.14 });
    },
    streak: function () {
      [392, 523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.07, 0.25, { type: 'sawtooth', vol: 0.05 }); });
    },
    chest: function () {
      [659, 831, 988, 1319].forEach(function (f, i) { tone(f, i * 0.06, 0.2, { type: 'triangle', vol: 0.15 }); });
    },
    tick: function () { tone(1200, 0, 0.03, { type: 'square', vol: 0.03 }); },
    breathIn: function () { tone(330, 0, 0.5, { type: 'sine', vol: 0.06, slide: 440 }); },
    breathOut: function () { tone(440, 0, 0.6, { type: 'sine', vol: 0.06, slide: 294 }); },
    start: function () { tone(880, 0, 0.12, { type: 'sine', vol: 0.12 }); },
    stop: function () { tone(660, 0, 0.1, { type: 'sine', vol: 0.12 }); tone(440, 0.08, 0.14, { type: 'sine', vol: 0.12 }); }
  };

  App.Sound = {
    play: function (name) {
      if (!enabled() || !FX[name]) return;
      try { FX[name](); } catch (e) { /* rien */ }
    },
    unlock: function () { ac(); },
    context: ac
  };
})(window.App = window.App || {});

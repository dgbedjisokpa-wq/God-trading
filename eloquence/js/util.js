/* Petits outils partagés : DOM, hasard, dates, texte. */
(function (App) {
  'use strict';

  var U = {};

  /* ---------- DOM ---------- */
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* h('div.card#id', {onclick: fn, html: '...'}, [enfants]) */
  U.h = function (spec, attrs, children) {
    var m = /^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i.exec(spec) || [];
    var node = document.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, function (_, t, v) {
      if (t === '.') node.classList.add(v); else node.id = v;
    });
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = U.fr(v);
        else if (k === 'class') node.className += (node.className ? ' ' : '') + v;
        else if (k === 'style' && typeof v === 'object') {
          Object.keys(v).forEach(function (sk) {
            if (sk.slice(0, 2) === '--') node.style.setProperty(sk, v[sk]);
            else node.style[sk] = v[sk];
          });
        }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children !== undefined && children !== null) U.append(node, children);
    return node;
  };

  U.append = function (node, children) {
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) U.append(node, c);
      else node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return node;
  };

  U.clear = function (node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; };

  /* Typographie française : espace insécable avant ! ? : ; » et après « */
  U.fr = function (s) {
    return String(s).replace(/ ([!?:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
  };
  U.esc = function (s) {
    return U.fr(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* Mise en forme légère : **gras**, *italique*, retours à la ligne. Le texte est échappé d'abord. */
  U.md = function (s) {
    return U.esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  /* ---------- Hasard ---------- */
  U.rand = Math.random;
  U.seeded = function (seed) {
    var s = 0;
    for (var i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.shuffle = function (arr, rnd) {
    rnd = rnd || U.rand;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  U.pick = function (arr, rnd) { return arr[Math.floor((rnd || U.rand)() * arr.length)]; };
  U.sample = function (arr, n, rnd) { return U.shuffle(arr, rnd).slice(0, n); };
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  U.clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---------- Dates (heure locale) ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  U.dayKey = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  U.parseDay = function (k) {
    var p = k.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  };
  U.addDays = function (k, n) {
    var d = U.parseDay(k);
    d.setDate(d.getDate() + n);
    return U.dayKey(d);
  };
  U.daysBetween = function (a, b) {
    return Math.round((U.parseDay(b) - U.parseDay(a)) / 86400000);
  };
  U.fmtTime = function (secs) {
    secs = Math.max(0, Math.round(secs));
    var m = Math.floor(secs / 60), s = secs % 60;
    return m + ':' + pad(s);
  };
  U.fmtDuration = function (secs) {
    secs = Math.round(secs);
    if (secs < 60) return secs + ' s';
    var m = Math.floor(secs / 60), s = secs % 60;
    return m + ' min' + (s ? ' ' + pad(s) : '');
  };
  U.plural = function (n, one, many) { return U.num(n) + ' ' + (n >= 2 ? (many || one + 's') : one); };
  /* Nombre à la française : 2,4 */
  U.num = function (n) { return String(n).replace('.', ','); };
  U.DAYS_SHORT = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];

  /* ---------- Texte ---------- */
  U.stripAccents = function (s) {
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  };

  var UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  var TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  function below100(n) {
    if (n < 20) return UNITS[n];
    var t = Math.floor(n / 10), u = n % 10;
    if (t === 7 || t === 9) return TENS[t] + (u === 1 && t === 7 ? ' et ' : '-') + UNITS[10 + u];
    if (u === 0) return t === 8 ? 'quatre-vingts' : TENS[t];
    if (u === 1 && t !== 8) return TENS[t] + ' et un';
    return TENS[t] + '-' + UNITS[u];
  }
  function below1000(n) {
    var c = Math.floor(n / 100), r = n % 100;
    var hs = c === 0 ? '' : (c === 1 ? 'cent' : UNITS[c] + ' cent' + (r === 0 ? 's' : ''));
    return [hs, r || c === 0 ? below100(r) : ''].filter(Boolean).join(' ');
  }
  U.numToFr = function (n) {
    n = Math.floor(n);
    if (n < 1000) return below1000(n);
    if (n < 1000000) {
      var k = Math.floor(n / 1000), r = n % 1000;
      return (k === 1 ? 'mille' : below1000(k) + ' mille') + (r ? ' ' + below1000(r) : '');
    }
    return String(n);
  };

  /* Texte → liste de mots comparables (minuscules, sans accents ni ponctuation, nombres en lettres). */
  U.words = function (s) {
    s = String(s || '').toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/\d+/g, function (d) { return ' ' + U.numToFr(+d) + ' '; });
    s = U.stripAccents(s)
      .replace(/['\-]/g, ' ')
      .replace(/[^a-z0-9œæ ]+/g, ' ');
    return s.split(/\s+/).filter(Boolean);
  };

  /* Clé phonétique très simplifiée du français, pour tolérer les homophones. */
  U.phon = function (w) {
    w = String(w).toLowerCase().replace(/ç/g, 's');
    w = U.stripAccents(w).replace(/[^a-z]/g, '');
    w = w.replace(/eaux?$/, 'o').replace(/eau/g, 'o').replace(/aux$/, 'o').replace(/au/g, 'o')
      .replace(/ph/g, 'f').replace(/qu/g, 'k').replace(/gu(?=[eiy])/g, 'g')
      .replace(/sch|ch/g, 'C').replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k')
      .replace(/g(?=[eiy])/g, 'j').replace(/h/g, '')
      .replace(/(ain|ein|aim|in|im|yn|ym|un|um)(?![aeiouy])/g, '1')
      .replace(/(an|am|en|em)(?![aeiouy])/g, '2')
      .replace(/(on|om)(?![aeiouy])/g, '3')
      .replace(/oi/g, 'wa').replace(/ou/g, 'U').replace(/(ai|ei)/g, 'e')
      .replace(/y/g, 'i')
      .replace(/(ent|es|er|ez|et|s|t|x|d|e|p)$/, '')
      .replace(/([aeiou])s(?=[aeiou])/g, '$1z')
      .replace(/(.)\1+/g, '$1');
    return w;
  };

  U.lev = function (a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [], cur = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  };

  U.wordsMatch = function (a, b) {
    if (a === b) return true;
    if (U.phon(a) === U.phon(b)) return true;
    var L = Math.max(a.length, b.length);
    var d = U.lev(a, b);
    return (L >= 5 && d <= 1) || (L >= 8 && d <= 2);
  };

  /* Aligne le texte attendu et le texte entendu (plus longue sous-séquence commune).
     Renvoie {score: 0..1, matched: [bool par mot attendu], expected: [mots]} */
  U.compareSpeech = function (expected, heard) {
    var A = U.words(expected), B = U.words(heard);
    var m = A.length, n = B.length;
    var dp = [];
    for (var i = 0; i <= m; i++) { dp[i] = []; for (var j = 0; j <= n; j++) dp[i][j] = 0; }
    for (i = m - 1; i >= 0; i--) {
      for (j = n - 1; j >= 0; j--) {
        dp[i][j] = U.wordsMatch(A[i], B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var matched = A.map(function () { return false; });
    i = 0; j = 0;
    while (i < m && j < n) {
      if (U.wordsMatch(A[i], B[j]) && dp[i][j] === dp[i + 1][j + 1] + 1) { matched[i] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    var hits = matched.filter(Boolean).length;
    // Pénalise légèrement les mots en trop (bégaiements, ajouts)
    var extra = Math.max(0, n - m);
    var score = m ? hits / (m + extra * 0.25) : 0;
    // Second regard, son par son : tolère un découpage différent (« t'a-t-il » / « ta til »)
    var pa = A.map(U.phon).join(''), pb = B.map(U.phon).join('');
    var L = Math.max(pa.length, pb.length);
    var sound = L ? (1 - U.lev(pa, pb) / L) * 0.97 : 0;
    if (sound > score) {
      score = sound;
      if (sound >= 0.8) matched = matched.map(function () { return true; });
    }
    return { score: U.clamp(score, 0, 1), matched: matched, expected: A };
  };

  /* Découpe un texte affiché en mots, en gardant la correspondance avec U.words. */
  U.displayTokens = function (text) {
    var out = [];
    String(text).split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { out.push({ space: part }); return; }
      out.push({ text: part, n: U.words(part).length });
    });
    return out;
  };

  U.debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  };

  U.vibrate = function (pattern) {
    try {
      if (App.Store && !App.Store.get().settings.haptics) return;
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { /* rien */ }
  };

  U.prefersReducedMotion = function () {
    try {
      if (App.Store && App.Store.get().settings.reduceMotion) return true;
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  };

  App.U = U;
})(window.App = window.App || {});

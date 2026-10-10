/* Analyse d'une prise de parole : débit, tics de langage, pauses, intonation,
   répétitions, richesse du vocabulaire, puis note globale et conseils d'Ahouéfa. */
(function (App) {
  'use strict';

  var U = App.U;
  var A = {};

  /* Tics de langage reconnus (formes sans accents, en minuscules). */
  var FILLERS = [
    { re: /\b(euh+|heu+|euhm|hum+|hmm+|bah|ben|beh)\b/g, label: 'euh / bah / ben' },
    { re: /\ben fait\b/g, label: 'en fait' },
    { re: /\bdu coup\b/g, label: 'du coup' },
    { re: /\bgenre\b/g, label: 'genre' },
    { re: /\bvoila\b/g, label: 'voilà' },
    { re: /\b(tu vois|vous voyez)\b/g, label: 'tu vois' },
    { re: /\b(tu sais|vous savez)\b/g, label: 'tu sais' },
    { re: /\ben gros\b/g, label: 'en gros' },
    { re: /\b(je veux dire|j veux dire)\b/g, label: 'je veux dire' },
    { re: /\ben mode\b/g, label: 'en mode' },
    { re: /\ben vrai\b/g, label: 'en vrai' },
    { re: /\b(enfin bref|bref)\b/g, label: 'bref' },
    { re: /\bquoi$/g, label: 'quoi (en fin de phrase)' }
  ];
  A.FILLER_LABELS = FILLERS.map(function (f) { return f.label; });

  var STOP = ('le la les un une des de du d l et a au aux en dans sur pour par avec sans sous est sont etre ai as avons avez ont ' +
    'je tu il elle on nous vous ils elles me te se moi toi lui leur leurs mon ma mes ton ta tes son sa ses notre nos votre vos ' +
    'ce cet cette ces ca cela c qui que qu quoi dont ou mais donc or ni car ne pas plus tres bien tout tous toute toutes ' +
    'y a si comme alors aussi fait faire peu meme deja encore la ici ont etait sont j n s m t est c est il y vraiment').split(' ');
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = true; });

  function norm(s) {
    return U.stripAccents(String(s || '').toLowerCase()).replace(/[’']/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* Repère les tics dans un texte. Renvoie {total, byLabel: {label: n}} */
  A.findFillers = function (text) {
    var segments = String(text || '').split(/[.!?…\n]+/);
    var byLabel = {}, total = 0;
    segments.forEach(function (seg) {
      var t = norm(seg);
      if (!t) return;
      FILLERS.forEach(function (f) {
        var m = t.match(f.re);
        if (m) { byLabel[f.label] = (byLabel[f.label] || 0) + m.length; total += m.length; }
      });
    });
    return { total: total, byLabel: byLabel };
  };

  /* Surligne les tics dans un texte affiché (HTML). */
  A.highlightFillers = function (text) {
    var html = U.esc(text);
    var forms = ['euh', 'heu', 'euhm', 'hum', 'hmm', 'bah', 'ben', 'en fait', 'du coup', 'genre', 'voilà', 'voila', 'tu vois',
      'vous voyez', 'tu sais', 'vous savez', 'en gros', 'je veux dire', 'en mode', 'en vrai', 'enfin bref', 'bref'];
    forms.sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp('(^|[\\s,;:.!?«"(])(' + forms.join('|') + ')(?=$|[\\s,;:.!?»")])', 'gi');
    return html.replace(re, '$1<mark class="filler">$2</mark>');
  };

  function percentile(arr, p) {
    if (!arr.length) return 0;
    var a = arr.slice().sort(function (x, y) { return x - y; });
    return a[Math.min(a.length - 1, Math.max(0, Math.floor(p * (a.length - 1))))];
  }
  function mean(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function std(a) {
    if (a.length < 2) return 0;
    var m = mean(a);
    return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1));
  }

  /* Analyse audio : temps de parole, pauses, hauteur de voix. frames = [{t, rms, f0}] toutes les 100 ms. */
  A.audio = function (frames) {
    var res = { voicedSecs: 0, pauses: 0, longPauses: 0, pitchVar: null, pitchMedian: null, firstVoice: null, lastVoice: null, contour: [] };
    if (!frames || frames.length < 5) return res;
    var rms = frames.map(function (f) { return f.rms; });
    var floor = percentile(rms, 0.15);
    var peak = percentile(rms, 0.95);
    var thr = Math.max(0.008, floor * 2.2, floor + (peak - floor) * 0.12);
    var voiced = rms.map(function (r) { return r > thr; });
    var first = voiced.indexOf(true), last = voiced.lastIndexOf(true);
    if (first < 0) return res;
    res.firstVoice = frames[first].t;
    res.lastVoice = frames[last].t;
    var run = 0, vcount = 0;
    for (var i = first; i <= last; i++) {
      if (voiced[i]) {
        vcount++;
        if (run >= 5) { res.pauses++; if (run >= 25) res.longPauses++; }
        run = 0;
      } else run++;
    }
    res.voicedSecs = vcount * 0.1;
    res.speakSpan = res.lastVoice - res.firstVoice + 0.1;

    var f0s = [];
    frames.forEach(function (f, k) { if (voiced[k] && f.f0 > 0) f0s.push(f.f0); });
    if (f0s.length >= 8) {
      var med = percentile(f0s, 0.5);
      var st = f0s.map(function (f) { return 12 * Math.log(f / med) / Math.LN2; }).filter(function (x) { return Math.abs(x) < 12; });
      res.pitchMedian = Math.round(med);
      res.pitchVar = Math.round(std(st) * 10) / 10;
      // Courbe d'intonation pour l'affichage (demi-tons, lissée)
      var c = [];
      frames.forEach(function (f, k) {
        if (k < first || k > last) return;
        c.push(voiced[k] && f.f0 > 0 ? U.clamp(12 * Math.log(f.f0 / med) / Math.LN2, -10, 10) : null);
      });
      res.contour = c;
    }
    var vr = [];
    frames.forEach(function (f, k) { if (voiced[k]) vr.push(20 * Math.log(f.rms) / Math.LN10); });
    res.volumeDb = Math.round(mean(vr));
    res.volumeVar = Math.round(std(vr) * 10) / 10;
    return res;
  };

  /* Analyse texte : mots, répétitions, richesse. */
  A.text = function (transcript) {
    var words = norm(transcript).split(' ').filter(Boolean);
    var counts = {};
    words.forEach(function (w) {
      if (w.length < 4 || STOPSET[w]) return;
      counts[w] = (counts[w] || 0) + 1;
    });
    var repeated = Object.keys(counts).filter(function (w) { return counts[w] >= 3; })
      .sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 3)
      .map(function (w) { return { word: w, n: counts[w] }; });
    var content = words.filter(function (w) { return !STOPSET[w]; });
    var uniq = {};
    content.forEach(function (w) { uniq[w] = 1; });
    var richness = content.length >= 15 ? Object.keys(uniq).length / content.length : null;
    return { words: words.length, repeated: repeated, richness: richness };
  };

  function band(v, lo, hi, minLo, maxHi) {
    if (v >= lo && v <= hi) return 100;
    if (v < lo) return U.clamp(100 - (lo - v) / (lo - minLo) * 60, 30, 100);
    return U.clamp(100 - (v - hi) / (maxHi - hi) * 60, 30, 100);
  }

  /* Analyse complète d'un enregistrement (résultat de Speech.session().stop()). */
  A.analyze = function (rec, opts) {
    opts = opts || {};
    var au = A.audio(rec.frames);
    var tx = A.text(rec.transcript || '');
    var fl = A.findFillers(rec.transcript || '');
    var hasText = tx.words >= 3;
    // Certains téléphones ne partagent pas le micro entre la transcription et l'enregistrement :
    // l'audio est alors muet alors que le texte existe. On se fie au texte et à la durée.
    var audioMuted = hasText && au.voicedSecs < 1;
    if (audioMuted) au = { voicedSecs: 0, pauses: 0, longPauses: 0, pitchVar: null, pitchMedian: null, contour: [] };
    var span = audioMuted ? (rec.duration || 0) : (au.speakSpan || rec.duration || 0);
    var minutes = Math.max(span, 1) / 60;

    var r = {
      kind: opts.kind,
      duration: rec.duration,
      speakSpan: span,
      transcript: rec.transcript || '',
      hasText: hasText,
      words: tx.words,
      wpm: hasText && span >= 5 ? Math.round(tx.words / minutes) : null,
      fillers: hasText ? fl.total : null,
      fillersBy: fl.byLabel,
      fillersPerMin: hasText ? Math.round(fl.total / minutes * 10) / 10 : null,
      repeated: tx.repeated,
      richness: tx.richness,
      pauses: au.pauses,
      longPauses: au.longPauses,
      pausesPerMin: span >= 5 && !audioMuted ? Math.round(au.pauses / minutes * 10) / 10 : null,
      audioMuted: audioMuted,
      pitchVar: au.pitchVar,
      pitchMedian: au.pitchMedian,
      contour: au.contour,
      voicedSecs: au.voicedSecs,
      target: opts.target || 0
    };

    var parts = [];
    if (r.wpm !== null) parts.push({ key: 'debit', score: band(r.wpm, 120, 170, 70, 230) });
    if (r.fillersPerMin !== null) parts.push({ key: 'tics', score: U.clamp(100 - r.fillersPerMin * 9, 25, 100) });
    if (r.pausesPerMin !== null && au.voicedSecs > 3) {
      var ps = band(r.pausesPerMin, 3, 16, 0, 30) - r.longPauses * 8;
      parts.push({ key: 'pauses', score: U.clamp(ps, 25, 100) });
    }
    if (r.pitchVar !== null) parts.push({ key: 'intonation', score: r.pitchVar >= 3 ? 100 : r.pitchVar >= 2 ? 82 : r.pitchVar >= 1.3 ? 62 : 45 });
    if (r.target) parts.push({ key: 'duree', score: U.clamp(Math.round(span / r.target * 100), 20, 100) });
    if (r.richness !== null) parts.push({ key: 'vocabulaire', score: U.clamp(Math.round(r.richness * 130), 40, 100) });

    r.parts = parts;
    r.score = parts.length ? Math.round(parts.reduce(function (s, p) { return s + p.score; }, 0) / parts.length) : null;
    r.feedback = feedback(r);
    return r;
  };

  var LABELS = { debit: 'Débit', tics: 'Tics de langage', pauses: 'Pauses', intonation: 'Intonation', duree: 'Durée', vocabulaire: 'Vocabulaire' };
  A.LABELS = LABELS;

  function feedback(r) {
    var good = [], tips = [];
    if (r.wpm !== null) {
      if (r.wpm < 110) tips.push('Ton débit est un peu lent (' + r.wpm + ' mots/min). Ose un rythme plus vif, autour de 130 à 160 mots par minute.');
      else if (r.wpm > 180) tips.push('Tu parles vite (' + r.wpm + ' mots/min). Ralentis et laisse respirer tes phrases : vise 130 à 160.');
      else good.push('Ton débit est idéal (' + r.wpm + ' mots/min).');
    }
    if (r.fillers !== null) {
      if (r.fillers === 0) good.push('Aucun tic de langage repéré, bravo !');
      else {
        var top = Object.keys(r.fillersBy).sort(function (a, b) { return r.fillersBy[b] - r.fillersBy[a]; })[0];
        tips.push('J\'ai repéré ' + U.plural(r.fillers, 'tic') + ', surtout « ' + top + ' ». Remplace-le par un court silence.');
      }
    }
    if (r.longPauses > 0) tips.push('Tu as eu ' + U.plural(r.longPauses, 'blanc') + ' de plus de 2 secondes. Prépare 3 mots-clés pour garder le fil.');
    else if (r.pausesPerMin !== null && r.pausesPerMin < 2.5 && r.speakSpan > 15) tips.push('Tu enchaînes presque sans pause. Marque un silence après chaque idée importante : il donne du poids.');
    else if (r.pausesPerMin !== null && r.speakSpan > 15) good.push('Tes pauses rythment bien ton discours.');
    if (r.pitchVar !== null) {
      if (r.pitchVar < 1.5) tips.push('Ta voix est assez monotone. Fais monter et descendre ta voix pour souligner les mots importants.');
      else if (r.pitchVar >= 3) good.push('Ta voix est expressive et vivante.');
    }
    if (r.repeated && r.repeated.length) tips.push('Tu répètes souvent « ' + r.repeated[0].word + ' » (' + r.repeated[0].n + ' fois). Cherche un synonyme.');
    if (r.target && r.speakSpan < r.target * 0.6) tips.push('Tu t\'es ' + U.g('arrêté', 'arrêtée', 'arrêté(e)') + ' tôt. Entraîne-toi à développer : une idée, une raison, un exemple.');
    return { good: good, tips: tips };
  }

  App.Analysis = A;
})(window.App = window.App || {});

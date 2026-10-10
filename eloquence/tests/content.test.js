/* Vérifie le contenu pédagogique et les fonctions de texte, sans navigateur.
   Lancer : node eloquence/tests/content.test.js */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var root = path.join(__dirname, '..');
var store = {};
var sandbox = {
  console: console, Math: Math, Date: Date, JSON: JSON, setTimeout: setTimeout, clearTimeout: clearTimeout,
  localStorage: {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  },
  navigator: {}, performance: { now: function () { return Date.now(); } }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
['js/util.js', 'js/icons.js', 'js/store.js', 'js/analysis.js', 'js/data/banks.js', 'js/data/course.js', 'js/generators.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
});
var App = sandbox.App, U = App.U;

var failures = 0, checks = 0;
function test(name, fn) {
  try { fn(); checks++; }
  catch (e) { failures++; console.error('✗ ' + name + '\n   ' + e.message); }
}

function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }).length === a.length; }

function checkStep(s, where) {
  var w = where + ' [' + s.type + ']';
  switch (s.type) {
    case 'info':
      assert(s.title || s.body || s.bullets, w + ' : info vide');
      break;
    case 'mcq':
      assert(Array.isArray(s.options) && s.options.length >= 2, w + ' : options manquantes');
      assert(Number.isInteger(s.answer) && s.answer >= 0 && s.answer < s.options.length, w + ' : réponse hors limites (' + s.answer + ')');
      assert(uniq(s.options), w + ' : options en double : ' + s.options.join(' | '));
      assert(s.prompt, w + ' : question manquante');
      break;
    case 'tf':
      assert(typeof s.statement === 'string' && s.statement, w + ' : affirmation manquante');
      assert(typeof s.answer === 'boolean', w + ' : réponse non booléenne');
      break;
    case 'fill':
      assert(s.sentence.split('___').length === 2, w + ' : il faut exactement un « ___ »');
      assert(s.options.indexOf(s.answer) >= 0, w + ' : la réponse n\'est pas dans les options');
      assert(uniq(s.options), w + ' : options en double');
      break;
    case 'order':
      assert(s.items.length >= 2 && uniq(s.items), w + ' : éléments invalides');
      break;
    case 'match':
      assert(s.pairs.length >= 2, w + ' : pas assez de paires');
      assert(uniq(s.pairs.map(function (p) { return p[0]; })), w + ' : gauches en double');
      assert(uniq(s.pairs.map(function (p) { return p[1]; })), w + ' : droites en double');
      break;
    case 'tap':
      assert(/\[[^\]]+\]/.test(s.text), w + ' : aucune cible [entre crochets]');
      assert((s.text.match(/\[/g) || []).length === (s.text.match(/\]/g) || []).length, w + ' : crochets déséquilibrés');
      break;
    case 'speak':
      assert(U.words(s.text).length >= 2, w + ' : texte trop court');
      assert.strictEqual(U.compareSpeech(s.text, s.text.replace(/\/\/?/g, '')).score, 1, w + ' : le texte lui-même ne donne pas 100 % : ' + s.text);
      break;
    case 'voice':
      assert(s.text, w + ' : texte manquant');
      break;
    case 'breath':
      assert(s.pattern.inhale > 0 && s.pattern.exhale > 0 && s.cycles > 0, w + ' : motif invalide');
      break;
    case 'timed':
      assert(s.steps.length && s.steps.every(function (x) { return x.t && x.secs > 0; }), w + ' : étapes invalides');
      break;
    case 'free':
      assert(s.topic && s.duration > 0, w + ' : sujet ou durée manquants');
      if (s.mode === 'read') assert(s.text, w + ' : texte de lecture manquant');
      break;
    default:
      throw new Error(w + ' : type inconnu');
  }
}

/* ---------- Parcours ---------- */
test('10 unités de 5 leçons, identifiants uniques', function () {
  assert.strictEqual(App.Course.units.length, 10);
  var ids = [];
  App.Course.units.forEach(function (u) {
    assert.strictEqual(u.lessons.length, 5, u.id);
    assert(u.guide && u.guide.length >= 3, u.id + ' : guide');
    assert(/^#[0-9A-F]{6}$/i.test(u.color) && /^#[0-9A-F]{6}$/i.test(u.dark), u.id + ' : couleurs');
    ids.push(u.id);
    u.lessons.forEach(function (l) { ids.push(l.id); assert(App.Icons[l.icon], l.id + ' : icône inconnue ' + l.icon); });
  });
  assert(uniq(ids), 'identifiants en double');
});

App.Course.units.forEach(function (u) {
  u.lessons.forEach(function (l) {
    test('Leçon ' + l.id + ' (tirages multiples)', function () {
      for (var k = 0; k < 25; k++) {
        var steps = App.Gen.resolve(l.steps);
        assert(steps.length >= 1, l.id + ' : aucune étape');
        steps.forEach(function (s, i) { checkStep(s, l.id + '#' + i); });
      }
    });
  });
  test('Révision ' + u.id, function () {
    for (var k = 0; k < 10; k++) {
      var steps = App.Course.reviewSteps(u, 10);
      assert(steps.length >= 6, u.id + ' : révision trop courte (' + steps.length + ')');
      steps.forEach(function (s, i) { checkStep(s, u.id + '-review#' + i); });
    }
  });
});

/* ---------- Banques ---------- */
test('Virelangues reconnus à 100 % sur leur propre texte', function () {
  App.Banks.virelangues.forEach(function (v) {
    assert.strictEqual(U.compareSpeech(v.t, v.t).score, 1, v.t);
    assert([1, 2, 3].indexOf(v.l) >= 0, v.t + ' : niveau');
  });
});
test('Chiffres et homophones tolérés par la reconnaissance', function () {
  var t = 'Si six scies scient six cyprès, six cent six scies scient six cent six cyprès.';
  assert(U.compareSpeech(t, 'si 6 scies scient 6 cyprès 606 scies scient 606 cyprès').score >= 0.9);
  assert(U.compareSpeech('Ton thé t\'a-t-il ôté ta toux ?', 'ton thé ta til oté ta tout').score >= 0.65);
  assert(U.compareSpeech('Lily lit le livre dans le lit.', 'bonjour à tous').score < 0.3);
});
test('Nombres en lettres', function () {
  assert.strictEqual(U.numToFr(6), 'six');
  assert.strictEqual(U.numToFr(71), 'soixante et onze');
  assert.strictEqual(U.numToFr(80), 'quatre-vingts');
  assert.strictEqual(U.numToFr(606), 'six cent six');
  assert.strictEqual(U.numToFr(200), 'deux cents');
  assert.strictEqual(U.numToFr(1999), 'mille neuf cent quatre-vingt-dix-neuf');
});
test('Textes de lecture : pauses et emphase bien formées', function () {
  App.Banks.textes.forEach(function (t) {
    assert(((t.t.match(/\*/g) || []).length % 2) === 0, t.id + ' : astérisques impairs');
    assert(t.titre && t.auteur, t.id);
  });
});
test('Mot du jour : 40 mots avec définition et exemple', function () {
  assert(App.Banks.mots.length >= 40);
  assert(uniq(App.Banks.mots.map(function (m) { return m.w; })));
  App.Banks.mots.forEach(function (m) { assert(m.d && m.ex, m.w); });
});

/* ---------- Analyse ---------- */
test('Détection des tics de langage', function () {
  var f = App.Analysis.findFillers('Euh alors en fait du coup je pense que genre voilà. Bon, tu vois, c\'est bien quoi');
  assert.strictEqual(f.byLabel['en fait'], 1);
  assert.strictEqual(f.byLabel['du coup'], 1);
  assert.strictEqual(f.byLabel['genre'], 1);
  assert.strictEqual(f.byLabel['voilà'], 1);
  assert.strictEqual(f.byLabel['tu vois'], 1);
  assert(f.byLabel['euh / bah / ben'] >= 1);
  assert.strictEqual(f.byLabel['quoi (en fin de phrase)'], 1);
  assert.strictEqual(App.Analysis.findFillers('De quoi parles-tu ? Je pense donc je suis.').total, 0);
});
test('Analyse audio et note globale', function () {
  var frames = [], t = 0;
  // 30 s : 2 s de parole (voix qui varie entre 180 et 260 Hz), puis 0,6 s de pause
  while (t < 30) {
    var cycle = t % 2.6;
    var speaking = cycle < 2;
    frames.push({ t: t, rms: speaking ? 0.08 : 0.004, f0: speaking ? 220 + 40 * Math.sin(t * 3) : -1 });
    t += 0.1;
  }
  var words = [];
  for (var i = 0; i < 70; i++) words.push(['parole', 'clair', 'idée', 'public', 'voix', 'souffle', 'rythme'][i % 7] + i);
  var r = App.Analysis.analyze({ frames: frames, transcript: words.join(' '), duration: 30 }, { target: 30 });
  assert(r.wpm >= 120 && r.wpm <= 160, 'débit ' + r.wpm);
  assert.strictEqual(r.fillers, 0);
  assert(r.pauses >= 8 && r.longPauses === 0, 'pauses ' + r.pauses);
  assert(r.pitchVar > 1.5, 'intonation ' + r.pitchVar);
  assert(r.score >= 80, 'score ' + r.score);
  var mono = App.Analysis.audio(frames.map(function (f) { return { t: f.t, rms: f.rms, f0: f.f0 > 0 ? 200 : -1 }; }));
  assert(mono.pitchVar < 0.5, 'voix monotone ' + mono.pitchVar);
});

/* ---------- Progression ---------- */
test('Série, XP, quêtes et niveaux', function () {
  var S = App.Store;
  S.reset();
  assert.strictEqual(S.level().level, 1);
  var r = S.completeLesson({ id: 'u1l1', kind: 'lesson', xp: 15, accuracy: 1, perfect: true, total: 6, correct: 6, bestCombo: 6, counts: { speakOk: 1 } });
  assert.strictEqual(r.streak.count, 1);
  assert(r.streak.extended);
  assert.strictEqual(S.get().xp.total, 15);
  assert(App.Course.isDone('u1l1'));
  assert.strictEqual(App.Course.state().map.u1l2, 'current');
  assert.strictEqual(App.Course.state().map.u1l3, 'locked');
  // Le lendemain, la série continue ; deux jours d'absence la remettent à zéro (sans gel)
  S.get().streak.last = U.addDays(U.dayKey(), -1);
  assert.strictEqual(S.touchStreak().count, 2);
  S.get().streak.last = U.addDays(U.dayKey(), -3);
  assert.strictEqual(JSON.stringify(S.checkStreak()), '{"lost":2}');
  // Avec un gel, la série est protégée
  S.get().streak = { count: 5, best: 5, last: U.addDays(U.dayKey(), -2), freezes: 1, frozen: [] };
  assert.strictEqual(JSON.stringify(S.checkStreak()), '{"frozen":1}');
  assert.strictEqual(S.touchStreak().count, 6);
  assert.strictEqual(S.quests().length, 3);
  assert.strictEqual(S.levelFor(60).level, 2);
  assert(S.buy('flower').ok);
  assert(S.outfit().flower);
});

console.log((failures ? '✗ ' : '✓ ') + checks + ' vérifications réussies, ' + failures + ' échec(s).');
process.exit(failures ? 1 : 0);

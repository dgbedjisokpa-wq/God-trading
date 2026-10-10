/* État de l'application, sauvegardé dans le navigateur (localStorage).
   Gère XP, série, objectif quotidien, quêtes, badges, améthystes et boutique. */
(function (App) {
  'use strict';

  var U = App.U;
  var KEY = 'ahouefa-eloquence-v1';
  var listeners = [];
  var state;

  function defaults() {
    return {
      v: 1,
      onboarded: false,
      createdAt: U.dayKey(),
      profile: { name: '', reasons: [], feeling: -1, gender: '', dailyGoal: 20 },
      settings: {
        sound: true, haptics: true, theme: 'auto', reduceMotion: false,
        voiceURI: '', rate: 0.95, srLang: 'fr-FR', mic: true,
        reminder: '', lastExportAt: 0, snooze: {}
      },
      progress: {},          // id de leçon -> { count, best, last }
      chests: {},            // id de coffre -> true
      xp: { total: 0, byDay: {} },
      streak: { count: 0, best: 0, last: '', freezes: 0, frozen: [] },
      gems: 100,
      stats: {
        lessons: 0, perfect: 0, answered: 0, correct: 0, bestCombo: 0,
        speakOk: 0, virelangues: 0, breath: 0, speeches: 0, speakSecs: 0,
        zeroFillers: 0, units: 0, minutes: 0
      },
      speeches: [],          // historique des analyses de parole
      assessments: [],       // bilans vocaux : départ, mi-parcours, final
      diploma: null,         // { at } quand le parcours est terminé
      mistakes: [],          // exercices ratés à revoir
      quests: { day: '', list: [] },
      badges: {},            // id -> palier atteint (1..n)
      shop: { owned: {}, equipped: {}, boostUntil: 0 },
      cantSpeakUntil: 0,
      wordSeen: {}
    };
  }

  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(saved).forEach(function (k) {
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k])) {
        base[k] = merge(base[k], saved[k]);
      } else {
        base[k] = saved[k];
      }
    });
    return base;
  }

  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    state = merge(defaults(), saved);
    migrate(state);
  }

  /* Anciennes sauvegardes : une seule motivation (texte), ressenti en texte. */
  function migrate(s) {
    var p = s.profile;
    if (!Array.isArray(p.reasons)) p.reasons = [];
    if (typeof p.reason === 'string' && p.reason && !p.reasons.length) {
      var map = { 'Réussir mes entretiens et ma carrière': 'carriere', 'Briller à mes examens et oraux': 'etudes', 'Prendre confiance en moi': 'confiance', 'Parler devant un public': 'public', 'Mieux convaincre au quotidien': 'convaincre', 'Juste pour progresser': 'progresser' };
      if (map[p.reason]) p.reasons = [map[p.reason]];
    }
    delete p.reason;
    if (typeof p.feeling !== 'number') p.feeling = -1;
    if (!s.settings.snooze || typeof s.settings.snooze !== 'object') s.settings.snooze = {};
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
    listeners.forEach(function (fn) { try { fn(state); } catch (e) { console.error(e); } });
  }

  var S = {};
  S.get = function () { return state; };
  S.save = save;
  S.onChange = function (fn) { listeners.push(fn); };
  S.update = function (fn) { fn(state); save(); };
  S.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* rien */ }
    state = defaults();
    save();
  };
  S.exportJSON = function () { return JSON.stringify(state, null, 2); };
  S.importJSON = function (txt) {
    var data = JSON.parse(txt);
    if (!data || typeof data !== 'object' || !data.xp || !data.progress) throw new Error('Fichier non reconnu');
    state = merge(defaults(), data);
    migrate(state);
    save();
  };

  /* ---------- Niveaux ---------- */
  var LEVELS = [0, 60, 150, 280, 450, 680, 970, 1320, 1740, 2240, 2830, 3520, 4320, 5240, 6300];
  var TITLES = ['Murmure', 'Petite voix', 'Voix qui s\'éveille', 'Apprenti orateur', 'Parole assurée', 'Conteur',
    'Voix posée', 'Orateur', 'Rhéteur', 'Tribun', 'Grand orateur', 'Virtuose du verbe', 'Maître de la parole',
    'Griot', 'Légende de l\'éloquence'];
  var TITLES_F = ['Murmure', 'Petite voix', 'Voix qui s\'éveille', 'Apprentie oratrice', 'Parole assurée', 'Conteuse',
    'Voix posée', 'Oratrice', 'Rhétoricienne', 'Voix qui porte', 'Grande oratrice', 'Virtuose du verbe', 'Maîtresse de la parole',
    'Griotte', 'Légende de l\'éloquence'];
  S.levelFor = function (xp) {
    var l = 0;
    while (l + 1 < LEVELS.length && xp >= LEVELS[l + 1]) l++;
    var cur = LEVELS[l], next = LEVELS[l + 1];
    return {
      level: l + 1,
      title: (state && state.profile.gender === 'f' ? TITLES_F : TITLES)[l],
      max: !next,
      xpIn: xp - cur,
      xpNeed: next ? next - cur : 0,
      progress: next ? (xp - cur) / (next - cur) : 1
    };
  };
  S.level = function () { return S.levelFor(state.xp.total); };

  /* ---------- XP & objectif ---------- */
  S.todayXP = function () { return state.xp.byDay[U.dayKey()] || 0; };
  S.boostActive = function () { return state.shop.boostUntil > Date.now(); };
  S.addXP = function (n) {
    var day = U.dayKey();
    var before = state.xp.byDay[day] || 0;
    if (S.boostActive()) n *= 2;
    state.xp.total += n;
    state.xp.byDay[day] = before + n;
    var goal = state.profile.dailyGoal || 20;
    return { xp: n, goalReachedNow: before < goal && before + n >= goal };
  };

  /* ---------- Série ---------- */
  /* Au chargement : si des jours ont été manqués, on utilise les gels disponibles, sinon la série retombe à 0. */
  S.checkStreak = function () {
    var st = state.streak, today = U.dayKey();
    if (!st.last || st.count === 0) return null;
    var gap = U.daysBetween(st.last, today);
    if (gap <= 1) return null;
    var missed = gap - 1;
    if (st.freezes >= missed) {
      st.freezes -= missed;
      for (var i = 1; i <= missed; i++) st.frozen.push(U.addDays(st.last, i));
      st.frozen = st.frozen.slice(-60);
      st.last = U.addDays(today, -1);
      save();
      return { frozen: missed };
    }
    var lost = st.count;
    st.count = 0;
    save();
    return { lost: lost };
  };
  /* Appelé à chaque leçon terminée. */
  S.touchStreak = function () {
    var st = state.streak, today = U.dayKey();
    if (st.last === today) return { extended: false, count: st.count };
    if (st.last && U.daysBetween(st.last, today) === 1 && st.count > 0) st.count += 1;
    else st.count = 1;
    st.last = today;
    st.best = Math.max(st.best, st.count);
    return { extended: true, count: st.count };
  };
  S.practicedOn = function (day) {
    return (state.xp.byDay[day] || 0) > 0;
  };

  /* ---------- Quêtes du jour ---------- */
  var QUEST_TYPES = {
    xp: { label: function (n) { return 'Gagne ' + n + ' XP'; }, targets: [20, 30, 40], gems: 15, icon: 'xp' },
    lessons: { label: function (n) { return 'Termine ' + U.plural(n, 'leçon'); }, targets: [2, 3], gems: 15, icon: 'bookFill' },
    speak: { label: function (n) { return 'Réussis ' + n + ' exercices de parole'; }, targets: [3, 5], gems: 20, icon: 'micFill' },
    perfect: { label: function () { return 'Termine une leçon sans faute'; }, targets: [1], gems: 20, icon: 'star' },
    combo: { label: function (n) { return 'Enchaîne ' + n + ' bonnes réponses'; }, targets: [5, 8], gems: 15, icon: 'boltFill' },
    speech: { label: function () { return 'Fais analyser un discours libre'; }, targets: [1], gems: 25, icon: 'chat' },
    breath: { label: function () { return 'Fais un exercice de respiration'; }, targets: [1], gems: 10, icon: 'windFill' },
    seconds: { label: function (n) { return 'Parle ' + Math.round(n / 60) + ' minutes au total'; }, targets: [120, 180], gems: 20, icon: 'clock' },
    virelangue: { label: function (n) { return 'Réussis ' + n + ' virelangues'; }, targets: [2, 3], gems: 15, icon: 'feather' }
  };
  S.QUEST_TYPES = QUEST_TYPES;

  S.quests = function () {
    var today = U.dayKey();
    if (state.quests.day !== today) {
      var rnd = U.seeded('q' + today);
      var pool = U.shuffle(['lessons', 'speak', 'perfect', 'combo', 'speech', 'breath', 'seconds', 'virelangue'], rnd);
      var types = ['xp', pool[0], pool[1]];
      state.quests = {
        day: today,
        list: types.map(function (t) {
          var q = QUEST_TYPES[t];
          return { type: t, target: U.pick(q.targets, rnd), progress: 0, claimed: false, gems: q.gems };
        })
      };
      save();
    }
    return state.quests.list;
  };
  S.questLabel = function (q) { return QUEST_TYPES[q.type].label(q.target); };

  /* type : xp | lessons | speak | perfect | combo (valeur max) | speech | breath | seconds | virelangue */
  S.questEvent = function (type, amount, isMax) {
    var done = [];
    S.quests().forEach(function (q) {
      if (q.type !== type || q.progress >= q.target) return;
      q.progress = isMax ? Math.max(q.progress, amount) : q.progress + amount;
      if (q.progress >= q.target) { q.progress = q.target; done.push(q); }
    });
    return done;
  };
  S.claimQuest = function (i) {
    var q = S.quests()[i];
    if (!q || q.claimed || q.progress < q.target) return 0;
    q.claimed = true;
    state.gems += q.gems;
    save();
    return q.gems;
  };
  S.unclaimedQuests = function () {
    return S.quests().filter(function (q) { return !q.claimed && q.progress >= q.target; }).length;
  };

  /* ---------- Badges ---------- */
  var BADGES = [
    { id: 'serie', name: 'En feu', icon: 'flame', color: '#FF9600', tiers: [3, 7, 14, 30, 100], val: function (s) { return s.streak.best; }, desc: function (n) { return 'Atteins une série de ' + n + ' jours'; } },
    { id: 'xp', name: 'Érudit', icon: 'xp', color: '#FFC800', tiers: [100, 500, 1000, 2500, 5000], val: function (s) { return s.xp.total; }, desc: function (n) { return 'Gagne ' + n + ' XP'; } },
    { id: 'lecons', name: 'Assidu', icon: 'bookFill', color: '#1CB0F6', tiers: [5, 20, 50, 100, 200], val: function (s) { return s.stats.lessons; }, desc: function (n) { return 'Termine ' + n + ' leçons'; } },
    { id: 'parfait', name: 'Sans faute', icon: 'star', color: '#58CC02', tiers: [1, 5, 20, 50], val: function (s) { return s.stats.perfect; }, desc: function (n) { return 'Termine ' + U.plural(n, 'leçon') + ' sans erreur'; } },
    { id: 'orateur', name: 'Orateur', icon: 'chat', color: '#8A3FFC', tiers: [1, 5, 20, 50], val: function (s) { return s.stats.speeches; }, desc: function (n) { return 'Fais analyser ' + U.plural(n, 'discours', 'discours'); } },
    { id: 'virelangue', name: 'Langue agile', icon: 'feather', color: '#FF4B91', tiers: [5, 20, 50, 100], val: function (s) { return s.stats.virelangues; }, desc: function (n) { return 'Réussis ' + n + ' virelangues'; } },
    { id: 'zen', name: 'Zen', icon: 'windFill', color: '#2DD4BF', tiers: [1, 5, 20, 50], val: function (s) { return s.stats.breath; }, desc: function (n) { return 'Fais ' + U.plural(n, 'exercice') + ' de respiration'; } },
    { id: 'explorateur', name: 'Explorateur', icon: 'trophy', color: '#E5A400', tiers: [1, 3, 5, 10], val: function (s) { return s.stats.units; }, desc: function (n) { return 'Termine ' + U.plural(n, 'unité'); } },
    { id: 'zerotic', name: 'Zéro tic', icon: 'sparkle', color: '#A855F7', tiers: [1, 5, 15], val: function (s) { return s.stats.zeroFillers; }, desc: function (n) { return 'Parle 30 s ou plus sans tic, ' + U.plural(n, 'fois', 'fois'); } },
    { id: 'combo', name: 'Inarrêtable', icon: 'boltFill', color: '#FF4B4B', tiers: [5, 10, 20, 40], val: function (s) { return s.stats.bestCombo; }, desc: function (n) { return 'Enchaîne ' + n + ' bonnes réponses'; } }
  ];
  S.BADGES = BADGES;
  S.badgeTier = function (b) {
    var v = b.val(state), t = 0;
    while (t < b.tiers.length && v >= b.tiers[t]) t++;
    return t;
  };
  S.checkBadges = function () {
    var fresh = [];
    BADGES.forEach(function (b) {
      var t = S.badgeTier(b);
      if (t > (state.badges[b.id] || 0)) {
        state.badges[b.id] = t;
        fresh.push({ badge: b, tier: t });
      }
    });
    return fresh;
  };

  /* ---------- Boutique ---------- */
  S.SHOP = [
    { id: 'freeze', name: 'Gel de série', desc: 'Protège ta série si tu manques un jour. Tu peux en avoir 2 d\'avance.', price: 100, icon: 'snow', consumable: true },
    { id: 'boost', name: 'Boost d\'XP', desc: 'Double tes XP pendant 15 minutes.', price: 80, icon: 'xp', consumable: true },
    { id: 'flower', name: 'Fleur violette', desc: 'Une violette pour le foulard d\'Ahouéfa. Sa fleur préférée !', price: 100, outfit: true },
    { id: 'glasses', name: 'Lunettes rondes', desc: 'Pour un air d\'oratrice érudite.', price: 150, outfit: true },
    { id: 'scarf', name: 'Écharpe dorée', desc: 'Élégante pour les grands discours.', price: 200, outfit: true },
    { id: 'mic', name: 'Micro doré', desc: 'Le micro des grandes scènes.', price: 250, outfit: true },
    { id: 'crown', name: 'Couronne', desc: 'Réservée aux reines de l\'éloquence.', price: 400, outfit: true }
  ];
  S.buy = function (id) {
    var item = S.SHOP.filter(function (x) { return x.id === id; })[0];
    if (!item) return { ok: false, msg: 'Article inconnu' };
    if (state.gems < item.price) return { ok: false, msg: 'Pas assez d\'améthystes' };
    if (id === 'freeze' && state.streak.freezes >= 2) return { ok: false, msg: 'Tu as déjà 2 gels de série' };
    if (item.outfit && state.shop.owned[id]) return { ok: false, msg: 'Déjà acheté' };
    state.gems -= item.price;
    if (id === 'freeze') state.streak.freezes += 1;
    else if (id === 'boost') state.shop.boostUntil = Math.max(Date.now(), state.shop.boostUntil) + 15 * 60 * 1000;
    else { state.shop.owned[id] = true; state.shop.equipped[id] = true; }
    save();
    return { ok: true };
  };
  S.toggleOutfit = function (id) {
    if (!state.shop.owned[id]) return;
    state.shop.equipped[id] = !state.shop.equipped[id];
    save();
  };
  S.outfit = function () {
    var o = {};
    if (!state) return o;
    Object.keys(state.shop.equipped).forEach(function (k) { if (state.shop.equipped[k] && state.shop.owned[k]) o[k] = true; });
    return o;
  };

  /* ---------- Erreurs à revoir ---------- */
  function stepKey(step) {
    return step.type + '|' + (step.prompt || '') + '|' + (step.question || step.statement || step.sentence || step.text || '');
  }
  S.stepKey = stepKey;
  S.addMistake = function (step) {
    if (!step || /^(info|breath|timed|free|voice|speak)$/.test(step.type)) return;
    var k = stepKey(step);
    state.mistakes = state.mistakes.filter(function (m) { return stepKey(m) !== k; });
    var copy = U.clone(step);
    delete copy._id;
    state.mistakes.push(copy);
    state.mistakes = state.mistakes.slice(-40);
  };
  S.removeMistake = function (step) {
    var k = stepKey(step);
    state.mistakes = state.mistakes.filter(function (m) { return stepKey(m) !== k; });
  };

  /* ---------- Parole ---------- */
  S.canSpeak = function () {
    return state.settings.mic !== false && Date.now() > (state.cantSpeakUntil || 0);
  };
  /* Bilans vocaux (départ, mi-parcours, final) pour mesurer la progression. */
  S.recordAssessment = function (kind, a) {
    state.assessments = state.assessments.filter(function (x) { return x.kind !== kind; });
    state.assessments.push({
      kind: kind, at: Date.now(), dur: Math.round(a.speakSpan || a.duration || 0),
      wpm: a.wpm || null, fillers: typeof a.fillers === 'number' ? a.fillers : null,
      fpm: typeof a.fillersPerMin === 'number' ? a.fillersPerMin : null,
      pitch: typeof a.pitchVar === 'number' ? a.pitchVar : null,
      pauses: typeof a.pausesPerMin === 'number' ? a.pausesPerMin : null,
      score: typeof a.score === 'number' ? a.score : null
    });
    save();
  };
  S.assessment = function (kind) {
    return state.assessments.filter(function (x) { return x.kind === kind; })[0] || null;
  };

  S.recordSpeech = function (a) {
    state.speeches.push({
      at: Date.now(), kind: a.kind || 'libre', dur: Math.round(a.duration || 0), words: a.words || 0,
      wpm: a.wpm || null, fillers: a.fillers, fpm: a.fillersPerMin, pitch: a.pitchVar, score: a.score
    });
    state.speeches = state.speeches.slice(-60);
  };

  /* ---------- Fin de leçon ---------- */
  /* r = { id, kind, xp, total, correct, perfect, bestCombo, counts: {speakOk, virelangues, breath, speeches, speakSecs, zeroFillers} } */
  S.completeLesson = function (r) {
    var out = { levelBefore: S.level().level };
    var c = r.counts || {};
    var st = state.stats;

    if (r.id) {
      var p = state.progress[r.id] || { count: 0, best: 0 };
      p.count += 1;
      p.best = Math.max(p.best, r.accuracy || 0);
      p.last = U.dayKey();
      state.progress[r.id] = p;
    }
    st.lessons += 1;
    if (r.perfect) st.perfect += 1;
    st.answered += r.total || 0;
    st.correct += r.correct || 0;
    st.bestCombo = Math.max(st.bestCombo, r.bestCombo || 0);
    st.speakOk += c.speakOk || 0;
    st.virelangues += c.virelangues || 0;
    st.breath += c.breath || 0;
    st.speeches += c.speeches || 0;
    st.speakSecs += Math.round(c.speakSecs || 0);
    st.zeroFillers += c.zeroFillers || 0;
    if (r.unitDone) st.units += 1;

    var xpRes = S.addXP(r.xp);
    out.xp = xpRes.xp;
    out.goalReachedNow = xpRes.goalReachedNow;
    out.streak = S.touchStreak();

    var quests = [];
    function q(type, n, isMax) { if (n) quests = quests.concat(S.questEvent(type, n, isMax)); }
    q('xp', xpRes.xp);
    q('lessons', 1);
    q('speak', c.speakOk);
    q('perfect', r.perfect ? 1 : 0);
    q('combo', r.bestCombo, true);
    q('speech', c.speeches);
    q('breath', c.breath);
    q('seconds', Math.round(c.speakSecs || 0));
    q('virelangue', c.virelangues);
    out.quests = quests;

    out.badges = S.checkBadges();
    out.levelAfter = S.level().level;
    save();
    return out;
  };

  load();
  App.Store = S;
})(window.App = window.App || {});

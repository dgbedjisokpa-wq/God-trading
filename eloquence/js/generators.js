/* Générateurs d'exercices à partir des banques de contenu.
   Une leçon peut contenir {gen: 'nom', ...options} : on le remplace au lancement
   par des exercices tirés au hasard (chaque partie est donc un peu différente). */
(function (App) {
  'use strict';

  var U = App.U, B = App.Banks;
  var G = {};

  function others(list, exclude, n) {
    return U.sample(list.filter(function (x) { return x !== exclude; }), n);
  }

  function mcq(prompt, answer, wrong, extra) {
    var opts = U.shuffle([answer].concat(wrong));
    return Object.assign({ type: 'mcq', prompt: prompt, options: opts, answer: opts.indexOf(answer) }, extra || {});
  }

  G.virelangue = function (o) {
    var pool = B.virelangues.filter(function (v) { return !o.level || v.l === o.level; });
    return U.sample(pool, o.count || 1).map(function (v) {
      return {
        type: 'speak', kind: 'virelangue',
        prompt: o.prompt || 'Dis ce virelangue sans trébucher',
        text: v.t, hint: 'Son travaillé : ' + v.son + (v.src ? ' · ' + v.src : '')
      };
    });
  };

  G.verbes = function (o) {
    return U.sample(B.verbesPrecis, o.count || 1).map(function (v) {
      var opts = U.shuffle([v.a].concat(v.d));
      return {
        type: 'fill', prompt: 'Choisis le verbe le plus précis',
        sentence: v.s, options: opts, answer: v.a,
        explain: 'Plutôt que « ' + v.weak + ' », le verbe juste est « ' + v.a + ' ».'
      };
    });
  };

  G.intensifs = function (o) {
    if (o.format === 'match') {
      return [{ type: 'match', prompt: 'Associe chaque expression à son mot fort', pairs: U.sample(B.intensifs, 4) }];
    }
    return U.sample(B.intensifs, o.count || 1).map(function (p) {
      var wrong = others(B.intensifs, p, 3).map(function (x) { return x[1]; });
      return mcq('Remplace « ' + p[0] + ' » par un seul mot fort', p[1], wrong, {
        explain: '« ' + p[0] + ' » → « ' + p[1] + ' ». Un mot fort frappe plus qu\'un « très ».'
      });
    });
  };

  function motsPart(part) {
    if (part === 1) return B.mots.slice(0, 20);
    if (part === 2) return B.mots.slice(20);
    return B.mots;
  }

  G.mots = function (o) {
    var pool = motsPart(o.part);
    if (o.format === 'match') {
      return [{
        type: 'match', prompt: 'Associe chaque mot à sa définition',
        pairs: U.sample(pool, 4).map(function (m) { return [m.w, m.d]; })
      }];
    }
    return U.sample(pool, o.count || 1).map(function (m) {
      var wrongs = others(pool, m, 3);
      if (o.format === 'reverse') {
        return mcq('Quel mot correspond à cette définition ?', m.w, wrongs.map(function (x) { return x.w; }), {
          quote: m.d, explain: '« ' + m.w + ' » : ' + m.d + ' Exemple : ' + m.ex
        });
      }
      return mcq('Que signifie « ' + m.w + ' » ?', m.d, wrongs.map(function (x) { return x.d; }), {
        explain: 'Exemple : ' + m.ex
      });
    });
  };

  G.pleonasmes = function (o) {
    return U.sample(B.pleonasmes, o.count || 1).map(function (p) {
      return { type: 'tap', prompt: 'Touche le ou les mots en trop', text: p.text, explain: p.explain };
    });
  };

  G.formulations = function (o) {
    return U.sample(B.formulations, o.count || 1).map(function (f) {
      var opts = U.shuffle([f.ok].concat(f.ko));
      return { type: 'mcq', prompt: 'Quelle phrase est correcte ?', options: opts, answer: opts.indexOf(f.ok), explain: f.explain };
    });
  };

  G.anglicismes = function () {
    return [{ type: 'match', prompt: 'Trouve l\'équivalent français', pairs: U.sample(B.anglicismes, 4) }];
  };

  G.connecteurs = function (o) {
    return U.sample(B.connecteurs, o.count || 1).map(function (c) {
      var opts = U.shuffle([c.a].concat(c.d));
      return {
        type: 'fill', prompt: 'Choisis le bon connecteur', sentence: c.s, options: opts, answer: c.a,
        explain: '« ' + c.a + ' » exprime ici ' + ({
          opposition: 'une opposition', 'conséquence': 'une conséquence', addition: 'un ajout', illustration: 'un exemple',
          cause: 'une cause', conclusion: 'une conclusion', concession: 'une concession', but: 'un but', ordre: 'une étape'
        }[c.f] || 'le lien logique') + '.'
      };
    });
  };

  G.fonctions = function () {
    // Évite deux connecteurs de même fonction dans un même exercice
    var seen = {}, pairs = [];
    U.shuffle(B.fonctionsConnecteurs).forEach(function (p) {
      if (pairs.length < 4 && !seen[p[1]]) { seen[p[1]] = 1; pairs.push(p); }
    });
    return [{ type: 'match', prompt: 'Associe chaque connecteur à sa fonction', pairs: pairs }];
  };

  G.figures = function (o) {
    var pool = B.figures.filter(function (f) { return !o.set || f.set === o.set; });
    if (o.format === 'match') {
      return [{ type: 'match', prompt: 'Associe chaque figure à sa définition', pairs: U.sample(pool, 4).map(function (f) { return [f.n, f.d]; }) }];
    }
    return U.sample(pool, o.count || 1).map(function (f) {
      var wrong = others(B.figures, f, 3).map(function (x) { return x.n; });
      return mcq('Quelle figure de style reconnais-tu ?', f.n, wrong, {
        quote: U.pick(f.ex), explain: f.n + ' : ' + f.d
      });
    });
  };

  G.sophismes = function (o) {
    if (o.format === 'match') {
      return [{ type: 'match', prompt: 'Associe chaque sophisme à sa définition', pairs: U.sample(B.sophismes, 4).map(function (s) { return [s.n, s.d]; }) }];
    }
    return U.sample(B.sophismes, o.count || 1).map(function (s) {
      var wrong = others(B.sophismes, s, 3).map(function (x) { return x.n; });
      return mcq('Quel piège de raisonnement est utilisé ?', s.n, wrong, { quote: s.ex, explain: s.n + ' : ' + s.d });
    });
  };

  G.epl = function (o) {
    return U.sample(B.ethosPathosLogos, o.count || 1).map(function (e) {
      var opts = ['Ethos', 'Pathos', 'Logos'];
      return { type: 'mcq', prompt: 'Quel levier de persuasion est utilisé ?', quote: e.t, options: opts, answer: opts.indexOf(e.a), explain: e.why };
    });
  };

  G.accroches = function (o) {
    var types = B.accroches.map(function (a) { return a.a; });
    return U.sample(B.accroches, o.count || 1).map(function (a) {
      return mcq('Quel type d\'accroche est utilisé ?', a.a, U.sample(types.filter(function (t) { return t !== a.a; }), 3), {
        quote: a.t, explain: 'C\'est une accroche de type « ' + a.a.toLowerCase() + ' ».'
      });
    });
  };

  G.tics = function (o) {
    return U.sample(B.ticsTextes, o.count || 1).map(function (t) {
      return { type: 'tap', prompt: 'Touche tous les tics de langage', text: t, explain: 'Sans ces tics, la phrase est plus claire et plus assurée.' };
    });
  };

  var SOCIETE = 26;  // index des sujets de société dans B.sujets
  G.impro = function (o) {
    var pool = B.sujets;
    if (o.pool === 'societe') pool = B.sujets.slice(SOCIETE);
    if (o.pool === 'perso') pool = B.sujets.slice(14, SOCIETE);
    if (o.pool === 'fun') pool = B.sujets.slice(0, 14);
    return [{
      type: 'free', prompt: o.prompt || 'Improvisation', topic: U.pick(pool),
      prep: o.prep || 20, duration: o.duration || 60, focus: o.focus || 'general',
      tips: o.tips || ['Une idée principale', 'Deux raisons ou une anecdote', 'Une phrase de conclusion'],
      reroll: true
    }];
  };

  G.motsImposes = function (o) {
    var words = U.sample(B.motsImposes, 3);
    return [{
      type: 'free', prompt: 'Les mots imposés', topic: 'Raconte une histoire qui contient ces trois mots :',
      words: words, prep: o.prep || 20, duration: o.duration || 60, focus: 'general',
      tips: ['Place les trois mots', 'Un début, un problème, une fin', 'Amuse-toi !'], reroll: true
    }];
  };

  G.debat = function (o) {
    var motion = U.pick(B.debats);
    return [
      {
        type: 'free', prompt: 'Avocat du diable (1/2) : POUR', topic: 'Défends cette affirmation : « ' + motion + ' »',
        prep: o.prep || 20, duration: o.duration || 45, focus: 'general',
        tips: ['Ton avis en une phrase', 'Deux arguments solides', 'Un exemple concret']
      },
      {
        type: 'free', prompt: 'Avocat du diable (2/2) : CONTRE', topic: 'Maintenant, attaque la même affirmation : « ' + motion + ' »',
        prep: o.prep || 20, duration: o.duration || 45, focus: 'general',
        tips: ['Reconnais un point adverse', 'Deux contre-arguments', 'Une conclusion nette']
      }
    ];
  };

  G.entretien = function (o) {
    var q = U.pick(B.entretien);
    return [{
      type: 'free', prompt: 'Entretien d\'embauche', topic: '« ' + q.q + ' »', prep: o.prep || 30,
      duration: o.duration || 60, focus: 'general', tips: [q.tip], reroll: true, rerollGen: 'entretien'
    }];
  };

  G.lecture = function (o) {
    var t = o.id ? B.textes.filter(function (x) { return x.id === o.id; })[0] : U.pick(B.textes);
    return [{
      type: 'free', mode: 'read', prompt: o.prompt || 'Lecture expressive', topic: t.titre, author: t.auteur,
      text: t.t, prep: 0, duration: o.duration || 40, focus: o.focus || 'lecture',
      tips: ['« / » : petite pause', '« // » : grande pause', 'Appuie sur les mots en gras']
    }];
  };

  /* Remplace les générateurs par des exercices concrets. */
  G.resolve = function (steps) {
    var out = [];
    (steps || []).forEach(function (s) {
      if (s.gen) {
        var fn = G[s.gen];
        if (!fn) { console.warn('Générateur inconnu', s.gen); return; }
        out = out.concat(fn(s));
      } else {
        out.push(U.clone(s));
      }
    });
    return out;
  };

  /* Nouveau tirage pour un exercice libre (bouton « Autre sujet »). */
  G.reroll = function (step) {
    if (step.rerollGen === 'entretien') return G.entretien(step)[0];
    if (step.words) return G.motsImposes(step)[0];
    var n = G.impro({ prep: step.prep, duration: step.duration, focus: step.focus, tips: step.tips, prompt: step.prompt })[0];
    return n;
  };

  App.Gen = G;
})(window.App = window.App || {});

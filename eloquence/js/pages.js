/* Les pages : parcours, entraînement, quêtes, profil, boutique, réglages. */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Store = App.Store, UI = App.UI, C = App.Course, B = App.Banks;
  var P = {};

  /* ---------- Lancer une leçon / un entraînement ---------- */
  P.startLesson = function (id) {
    var f = C.find(id);
    if (!f) return;
    if (f.review) {
      App.Lesson.start({
        id: id, kind: 'review', title: 'Révision : ' + f.unit.title, unit: f.unit,
        steps: C.reviewSteps(f.unit, 10), xp: 20, onExit: afterLesson
      });
      return;
    }
    App.Lesson.start({
      id: id, kind: 'lesson', title: f.lesson.title, unit: f.unit,
      steps: App.Gen.resolve(f.lesson.steps), xp: 10, onExit: afterLesson
    });
  };
  function afterLesson(done) {
    App.render();
    if (done) setTimeout(function () { var cur = U.$('.node-wrap.is-current'); if (cur) cur.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 120);
  }

  P.practice = function (title, steps, xp, color) {
    App.Lesson.start({
      id: null, kind: 'practice', title: title, steps: steps, xp: xp || 10,
      unit: color ? { color: color[0], dark: color[1] } : App.Course.units[0],
      onExit: function () { App.render(); }
    });
  };

  /* ================= PARCOURS ================= */
  var OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];
  var openPop = null;

  function closePop() {
    if (openPop) { if (openPop.parentNode) openPop.parentNode.classList.remove('has-pop'); openPop.remove(); openPop = null; }
  }
  document.addEventListener('click', function (e) {
    if (openPop && !e.target.closest('.popover') && !e.target.closest('.node')) closePop();
  });

  P.learn = function (main) {
    var st = C.state();
    var wrap = h('div.learn');
    C.units.forEach(function (u, ui) {
      var sec = h('section.unit', { 'aria-labelledby': 'unit-' + u.id });
      sec.style.setProperty('--uc', u.color);
      sec.style.setProperty('--ud', u.dark);
      var nodes = C.nodes(u);
      var unitLocked = st.map[nodes[0].id] === 'locked';
      var guideBtn = h('button.unit-guide', { type: 'button', html: App.icon('book') + '<span>Guide</span>' });
      guideBtn.addEventListener('click', function () { showGuide(u, ui); });
      var right = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' } }, [guideBtn]);
      if (unitLocked && ui > 0) {
        var jump = h('button.unit-guide', { type: 'button', html: App.icon('next') + '<span>Sauter ici ?</span>' });
        jump.addEventListener('click', function () { jumpTest(ui); });
        right.appendChild(jump);
      }
      sec.appendChild(h('div.unit-banner', null, [
        h('div', null, [
          h('div.over', { text: 'Unité ' + (ui + 1) }),
          h('h2', { id: 'unit-' + u.id, text: u.title }),
          h('div.desc', { text: u.desc })
        ]),
        right
      ]));

      var path = h('div.path');
      var flip = ui % 2 === 1 ? -1 : 1;
      nodes.forEach(function (n, i) {
        var state = st.map[n.id] || 'locked';
        var x = OFFSETS[i % OFFSETS.length] * flip;
        var nw = h('div.node-wrap' + (state === 'current' ? '.is-current' : ''), { style: { transform: 'translateX(' + x + 'px)' } });
        var btn;
        if (n.kind === 'lesson') {
          var li = u.lessons.indexOf(n.lesson);
          btn = h('button.node.' + state, {
            type: 'button',
            'aria-label': 'Leçon ' + (li + 1) + ' : ' + n.lesson.title + (state === 'done' ? ' (terminée)' : state === 'locked' ? ' (verrouillée)' : ''),
            html: App.icon(state === 'done' ? 'check' : state === 'locked' ? (n.lesson.icon === 'star' ? 'star' : n.lesson.icon) : n.lesson.icon)
          });
        } else if (n.kind === 'chest') {
          btn = h('button.node.chest-node.' + state, { type: 'button', 'aria-label': state === 'done' ? 'Coffre ouvert' : state === 'open' ? 'Ouvrir le coffre' : 'Coffre verrouillé', html: App.icon(state === 'done' ? 'chestOpen' : 'chest') });
        } else {
          btn = h('button.node.review-node.' + state, { type: 'button', 'aria-label': 'Révision de l\'unité' + (state === 'done' ? ' (terminée)' : ''), html: App.icon('trophy') });
        }
        if (state === 'current') {
          nw.appendChild(h('div.node-ring'));
          nw.appendChild(h('div.start-bubble', { text: 'Commencer' }));
        }
        nw.appendChild(btn);
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          App.Sound.play('tap');
          if (n.kind === 'chest') { openChest(n, state); return; }
          togglePop(nw, n, u, state);
        });
        path.appendChild(nw);
      });
      // Ahouéfa à côté du chemin
      var moods = ['wave', 'talk', 'happy', 'think', 'idle'];
      var pm = h('div.path-mascot', { 'aria-hidden': 'true', html: App.Mascot.svg({ mood: moods[ui % moods.length], size: 120, label: false }) });
      pm.style.top = (84 + 2 * 86 - 40) + 'px';
      pm.style.left = flip === 1 ? 'calc(50% - 175px)' : 'calc(50% + 55px)';
      path.appendChild(pm);
      sec.appendChild(path);
      wrap.appendChild(sec);
    });
    var allDone = C.units.every(C.unitDone);
    wrap.appendChild(h('div.path-end', null, allDone
      ? [App.Mascot.el({ mood: 'celebrate', size: 120 }), h('p', { text: 'Bravo ! Tu as terminé tout le parcours. Continue à t\'entraîner chaque jour dans l\'onglet Entraînement.' })]
      : [h('p', { text: 'De nouvelles unités arrivent bientôt. En attendant, l\'onglet Entraînement t\'attend !' })]));
    main.appendChild(wrap);

    setTimeout(function () {
      var cur = U.$('.node-wrap.is-current');
      if (cur && !P._scrolled) { P._scrolled = true; cur.scrollIntoView({ block: 'center' }); }
    }, 30);
  };

  function togglePop(nw, n, u, state) {
    if (openPop && openPop.parentNode === nw) { closePop(); return; }
    closePop();
    var pop = h('div.popover' + (state === 'locked' ? '.locked' : ''), { role: 'dialog' });
    if (n.kind === 'lesson') {
      var li = u.lessons.indexOf(n.lesson);
      pop.appendChild(h('h3', { text: n.lesson.title }));
      if (state === 'locked') pop.appendChild(h('p', { text: 'Termine tous les niveaux précédents pour débloquer celui-ci !' }));
      else if (state === 'done') pop.appendChild(h('p', { text: 'Leçon ' + (li + 1) + ' sur ' + u.lessons.length + ' · Terminée. Refais-la pour t\'entraîner !' }));
      else pop.appendChild(h('p', { text: 'Leçon ' + (li + 1) + ' sur ' + u.lessons.length }));
      var b = h('button.btn', { type: 'button', text: state === 'locked' ? 'Verrouillé' : (state === 'done' ? 'Refaire +10 XP' : 'Commencer +10 XP') });
      if (state === 'locked') b.disabled = true;
      else b.addEventListener('click', function () { closePop(); P.startLesson(n.id); });
      pop.appendChild(b);
    } else {
      pop.appendChild(h('h3', { text: 'Révision : ' + u.title }));
      pop.appendChild(h('p', { text: state === 'locked' ? 'Termine les leçons de l\'unité pour débloquer la révision.' : 'Prouve que tu maîtrises cette unité. 10 exercices variés.' }));
      var rb = h('button.btn', { type: 'button', text: state === 'locked' ? 'Verrouillé' : (state === 'done' ? 'Réviser +20 XP' : 'Commencer +20 XP') });
      if (state === 'locked') rb.disabled = true;
      else rb.addEventListener('click', function () { closePop(); P.startLesson(n.id); });
      pop.appendChild(rb);
    }
    var tx = /translateX\((-?\d+)px\)/.exec(nw.style.transform);
    pop.style.setProperty('--px', (tx ? tx[1] : 0) + 'px');
    nw.classList.add('has-pop');
    nw.appendChild(pop);
    openPop = pop;
    setTimeout(function () {
      var r = pop.getBoundingClientRect();
      if (r.bottom > innerHeight - 80) window.scrollBy({ top: r.bottom - innerHeight + 100, behavior: 'smooth' });
    }, 30);
  }

  function openChest(n, state) {
    if (state === 'locked') { UI.toast('Termine les leçons précédentes pour ouvrir ce coffre.', 'lock'); return; }
    if (state === 'done') { UI.toast('Tu as déjà ouvert ce coffre.', 'chestOpen'); return; }
    var gems = 15 + Math.floor(Math.random() * 4) * 5;
    Store.update(function (s) { s.chests[n.id] = true; s.gems += gems; });
    App.Sound.play('chest');
    UI.confetti(1800);
    UI.modal({
      title: 'Coffre ouvert !',
      body: '<div style="display:flex;justify-content:center;gap:8px;align-items:center;font-size:32px;font-weight:900;color:#A855F7;margin:8px 0">' + App.icon('gem') + '+' + gems + '</div><p>Des améthystes, les pierres préférées d\'Ahouéfa ! Dépense-les dans la boutique.</p>',
      mascot: 'happy',
      actions: [{ label: 'Super !', onClick: function () { App.render(); } }]
    });
  }

  function showGuide(u, ui) {
    var body = h('div', null, [
      h('p', { text: u.desc }),
      h('ul.guide-list', { style: { '--uc': u.color } }, u.guide.map(function (g) { return h('li', { text: g }); }))
    ]);
    UI.modal({ title: 'Guide · Unité ' + (ui + 1) + ' : ' + u.title, body: body, wide: true, actions: [{ label: 'Compris !' }] });
  }

  function jumpTest(ui) {
    var prev = C.units[ui - 1];
    UI.modal({
      title: 'Sauter à l\'unité ' + (ui + 1) + ' ?',
      body: '<p>Réussis un test de 10 questions sur l\'unité ' + ui + ' (« ' + U.esc(prev.title) + ' ») avec au moins 80 % de bonnes réponses du premier coup, et tout ce qui précède sera débloqué.</p>',
      mascot: 'think',
      actions: [
        {
          label: 'Passer le test', onClick: function () {
            var steps = [];
            for (var k = Math.max(0, ui - 2); k < ui; k++) steps = steps.concat(C.reviewSteps(C.units[k], 12));
            steps = U.sample(steps.filter(function (s) { return !/^(speak|voice|free)$/.test(s.type); }), 10);
            App.Lesson.start({
              id: null, kind: 'jump', title: 'Test de niveau', unit: prev, steps: steps, xp: 10,
              onExit: function (done, sum) {
                if (done && sum && sum.accuracy >= 0.8) {
                  Store.update(function (s) {
                    for (var j = 0; j < ui; j++) {
                      var u = C.units[j];
                      u.lessons.map(function (l) { return l.id; }).concat([u.id + '-review']).forEach(function (id) {
                        if (!s.progress[id]) s.progress[id] = { count: 1, best: 0, last: U.dayKey(), skipped: true };
                      });
                    }
                  });
                  UI.toast('Unité ' + (ui + 1) + ' débloquée ! Bravo !', 'trophy', 3500);
                } else if (done) {
                  UI.toast('Pas tout à fait : ' + Math.round((sum ? sum.accuracy : 0) * 100) + ' %. Réessaie plus tard !', 'alert', 3500);
                }
                App.render();
              }
            });
          }
        },
        { label: 'Annuler', cls: 'flat' }
      ]
    });
  }

  /* ================= ENTRAÎNEMENT ================= */
  var TOOLS = [
    { id: 'impro', name: 'Improvisation', desc: 'Un sujet au hasard, une minute pour convaincre.', icon: 'dice', c: ['#FF4B91', '#D9367A'] },
    { id: 'virelangues', name: 'Virelangues', desc: '42 phrases pour une diction parfaite.', icon: 'featherFill', c: ['#D93A72', '#A8285A'] },
    { id: 'respiration', name: 'Respiration', desc: 'Calme ton trac et pose ta voix.', icon: 'windFill', c: ['#00897A', '#006B5F'] },
    { id: 'studio', name: 'Studio d\'analyse', desc: 'Parle librement : débit, tics, pauses, intonation.', icon: 'chart', c: ['#8A3FFC', '#6929C4'] },
    { id: 'lecture', name: 'Grands textes', desc: 'Lis Hugo, Jaurès, Zola, La Fontaine…', icon: 'bookFill', c: ['#5148D9', '#3B33B0'] },
    { id: 'debat', name: 'Débat express', desc: 'Défends une idée, puis attaque-la.', icon: 'scale', c: ['#E02F2F', '#B32020'] },
    { id: 'entretien', name: 'Entretien d\'embauche', desc: 'Les questions qui tombent toujours.', icon: 'briefcase', c: ['#D46A00', '#A65300'] },
    { id: 'mots', name: 'Mots imposés', desc: 'Trois mots, une histoire.', icon: 'letters', c: ['#3E9102', '#2F6F01'] },
    { id: 'mot', name: 'Mot du jour', desc: 'Apprends-le, puis place-le dans une phrase.', icon: 'sparkle', c: ['#A55CE6', '#7F3DBA'] },
    { id: 'miroir', name: 'Miroir', desc: 'Filme-toi : posture, regard, gestes.', icon: 'camera', c: ['#0E8BC8', '#0A6E9F'] }
  ];

  P.wordOfDay = function () {
    var n = Math.floor(U.parseDay(U.dayKey()).getTime() / 86400000);
    return B.mots[((n % B.mots.length) + B.mots.length) % B.mots.length];
  };

  P.practicePage = function (main, sub) {
    if (sub === 'virelangues') return virelanguesPage(main);
    if (sub === 'respiration') return respirationPage(main);
    if (sub === 'lecture') return lecturePage(main);
    if (sub === 'miroir') return mirrorPage(main);

    main.appendChild(UI.pageHead('Entraînement', 'happy', 'Exercices libres, à refaire autant que tu veux.'));
    var mistakes = Store.get().mistakes.length;
    var grid = h('div.tools');
    var mis = h('button.tool.wide', { type: 'button', style: { '--tc': '#FFC800', '--td': '#E5A400' } }, [
      h('div.ti', { html: App.icon('refresh') }),
      h('div.grow', null, [h('h3', { text: 'Revoir mes erreurs' }), h('p', { text: mistakes ? U.plural(mistakes, 'exercice') + ' à retravailler.' : 'Aucune erreur à revoir pour l\'instant. Bravo !' })])
    ]);
    mis.addEventListener('click', function () {
      if (!Store.get().mistakes.length) { UI.toast('Aucune erreur à revoir !', 'check'); return; }
      App.Lesson.start({
        id: null, kind: 'mistakes', title: 'Mes erreurs', steps: U.sample(Store.get().mistakes, 10).map(U.clone), xp: 10,
        unit: { color: '#B07D00', dark: '#8C6400' }, onExit: function () { App.render(); }
      });
    });
    grid.appendChild(mis);
    TOOLS.forEach(function (t) {
      var b = h('button.tool', { type: 'button', style: { '--tc': t.c[0], '--td': t.c[1] } }, [
        h('div.ti', { html: App.icon(t.icon) }), h('h3', { text: t.name }), h('p', { text: t.desc })
      ]);
      b.addEventListener('click', function () { runTool(t); });
      grid.appendChild(b);
    });
    main.appendChild(grid);
  };

  function runTool(t) {
    var G = App.Gen;
    switch (t.id) {
      case 'virelangues': case 'respiration': case 'lecture': case 'miroir':
        location.hash = '#/entrainement/' + t.id; return;
      case 'impro': P.practice('Improvisation', G.impro({ prep: 20, duration: 60 }), 10, t.c); return;
      case 'studio':
        P.practice('Studio d\'analyse', [{
          type: 'free', prompt: 'Studio d\'analyse', topic: 'Parle de ce que tu veux : ta journée, un projet, une idée qui te tient à cœur.',
          prep: 0, duration: 90, focus: 'general', tips: ['Parle naturellement', 'Au moins 30 secondes pour une analyse fiable']
        }], 10, t.c); return;
      case 'debat': P.practice('Débat express', G.debat({ prep: 20, duration: 45 }), 10, t.c); return;
      case 'entretien':
        P.practice('Entretien d\'embauche', G.entretien({ prep: 30, duration: 60 }).concat(G.entretien({ prep: 30, duration: 60 })), 10, t.c); return;
      case 'mots': P.practice('Mots imposés', G.motsImposes({ prep: 20, duration: 60 }), 10, t.c); return;
      case 'mot':
        var w = P.wordOfDay();
        P.practice('Mot du jour', [
          { type: 'info', mood: 'wow', title: 'Le mot du jour : « ' + w.w + ' »', body: '**Définition :** ' + w.d + '\n\n**Exemple :** ' + w.ex },
          { type: 'mcq', prompt: 'Que signifie « ' + w.w + ' » ?', options: U.shuffle([w.d].concat(U.sample(B.mots.filter(function (x) { return x !== w; }), 3).map(function (x) { return x.d; }))), answer: -1, explain: 'Exemple : ' + w.ex },
          { type: 'speak', prompt: 'Lis l\'exemple à voix haute', text: w.ex },
          { type: 'free', prompt: 'À toi de l\'utiliser', topic: 'Invente une ou deux phrases avec le mot « ' + w.w + ' ».', prep: 10, duration: 20, focus: 'general', tips: ['Une phrase simple suffit', 'Puis une deuxième, plus audacieuse'] }
        ].map(function (s) {
          if (s.type === 'mcq' && s.answer === -1) s.answer = s.options.indexOf(w.d);
          return s;
        }), 10, t.c);
        return;
    }
  }

  function subHead(main, title, sub, mood) {
    main.appendChild(h('a.back-link', { href: '#/entrainement', html: App.icon('back') + '<span>Entraînement</span>' }));
    main.appendChild(UI.pageHead(title, mood || 'talk', sub));
  }

  function virelanguesPage(main) {
    subHead(main, 'Virelangues', 'Commence lentement, accélère ensuite. Précision avant vitesse !', 'happy');
    var filter = 0;
    var seg = h('div.seg', { style: { marginBottom: '16px' } });
    var labels = ['Tous', 'Facile', 'Moyen', 'Difficile'];
    var listBox = h('div.list');
    labels.forEach(function (l, i) {
      var b = h('button.choice' + (i === 0 ? '.sel' : ''), { type: 'button', text: l });
      b.addEventListener('click', function () {
        filter = i;
        U.$$('button', seg).forEach(function (x) { x.classList.toggle('sel', x === b); });
        renderList();
      });
      seg.appendChild(b);
    });
    var rnd = h('button.btn.block', { type: 'button', html: App.icon('shuffle') + '<span>Série de 5 au hasard</span>', style: { marginBottom: '16px' } });
    rnd.addEventListener('click', function () {
      P.practice('Virelangues', App.Gen.virelangue({ level: filter || 0, count: 5 }), 10, ['#D93A72', '#A8285A']);
    });
    main.appendChild(seg);
    main.appendChild(rnd);
    main.appendChild(listBox);
    function renderList() {
      U.clear(listBox);
      B.virelangues.filter(function (v) { return !filter || v.l === filter; }).forEach(function (v) {
        var dots = h('span.dots', { 'aria-label': 'Difficulté ' + v.l + ' sur 3' }, [1, 2, 3].map(function (k) { return h('i' + (k <= v.l ? '.on' : '')); }));
        var row = h('div.row-item', null, [
          h('div.grow', null, [h('div.t', { text: v.t }), h('div.s', null, [dots, ' Son : ' + v.son])]),
          App.Speech.ttsSupported() ? h('button.round-mini', { type: 'button', 'aria-label': 'Écouter', html: App.icon('volume'), onclick: function () { App.Speech.say(v.t); } }) : null,
          h('button.btn.sm', {
            type: 'button', text: 'Go', 'aria-label': 'S\'entraîner sur ce virelangue', onclick: function () {
              P.practice('Virelangue', [
                { type: 'speak', kind: 'virelangue', prompt: 'Lentement, en articulant bien', text: v.t, hint: 'Son travaillé : ' + v.son },
                { type: 'speak', kind: 'virelangue', prompt: 'Maintenant plus vite !', text: v.t, hint: 'Garde la netteté de chaque syllabe' }
              ], 5, ['#D93A72', '#A8285A']);
            }
          })
        ]);
        listBox.appendChild(row);
      });
    }
    renderList();
  }

  function respirationPage(main) {
    subHead(main, 'Respiration', 'Avant de parler, trois minutes suffisent pour poser ta voix.', 'idle');
    var list = h('div.list');
    B.respirations.forEach(function (r) {
      var row = h('div.row-item', null, [
        h('div.ti', { html: App.icon('windFill'), style: { width: '48px', height: '48px', borderRadius: '14px', display: 'grid', placeItems: 'center', background: '#00897A', color: '#fff', flex: 'none' } }),
        h('div.grow', null, [h('div.t', { text: r.nom }), h('div.s', { text: r.desc })]),
        h('button.btn.sm', {
          type: 'button', text: 'Go', 'aria-label': 'Commencer : ' + r.nom, onclick: function () {
            P.practice(r.nom, [{ type: 'breath', title: r.nom, body: r.desc, pattern: r.pattern, cycles: r.cycles }], 5, ['#00897A', '#006B5F']);
          }
        })
      ]);
      list.appendChild(row);
    });
    main.appendChild(list);
  }

  function lecturePage(main) {
    subHead(main, 'Grands textes', 'Lis à voix haute. « / » = petite pause, « // » = grande pause, gras = à appuyer.', 'think');
    var list = h('div.list');
    B.textes.forEach(function (t) {
      list.appendChild(h('div.row-item', null, [
        h('div.grow', null, [h('div.t', { text: t.titre }), h('div.s', { text: t.auteur })]),
        h('button.btn.sm', {
          type: 'button', text: 'Lire', 'aria-label': 'Lire : ' + t.titre, onclick: function () {
            P.practice(t.titre, App.Gen.lecture({ id: t.id, duration: Math.max(15, Math.round(U.words(t.t).length / 2.3)) }), 10, ['#5148D9', '#3B33B0']);
          }
        })
      ]));
    });
    main.appendChild(list);
  }

  /* Miroir : se filmer pour observer son langage corporel */
  var mirrorState = null;
  function stopMirror() {
    if (!mirrorState) return;
    try { if (mirrorState.rec && mirrorState.rec.state !== 'inactive') mirrorState.rec.stop(); } catch (e) { /* rien */ }
    if (mirrorState.stream) mirrorState.stream.getTracks().forEach(function (t) { t.stop(); });
    clearInterval(mirrorState.tick);
    mirrorState = null;
  }
  P.stopMirror = stopMirror;

  function mirrorPage(main) {
    subHead(main, 'Miroir', 'Filme-toi en parlant, puis observe ta posture, ton regard et tes gestes.', 'wow');
    var topic = U.pick(B.sujets);
    var topicBox = h('div.topic-card', null, [h('div.lbl', { text: 'Sujet suggéré' }), h('div.topic', { text: topic })]);
    var stage = h('div.mirror');
    var video = h('video', { playsinline: true, muted: true, autoplay: true });
    video.muted = true;
    stage.appendChild(video);
    var ph = h('div.placeholder', { text: 'Caméra éteinte' });
    stage.appendChild(ph);
    var startBtn = h('button.btn', { type: 'button', html: App.icon('camera') + '<span>Allumer la caméra</span>' });
    var recBtn = h('button.btn.red.hidden', { type: 'button', html: App.icon('micFill') + '<span>Enregistrer</span>' });
    var info = h('p.hint.center');
    var checklist = h('div.card.hidden', null, [
      h('h3', { text: 'Observe-toi' }),
      h('ul.fb-list', null, ['Ma posture est-elle ancrée, sans balancement ?', 'Mon regard est-il face caméra (ton public) ?', 'Mes mains sont-elles visibles et ouvertes ?', 'Est-ce que je souris au début et à la fin ?', 'Mon visage exprime-t-il ce que je dis ?'].map(function (t) {
        return h('li.t', { html: App.icon('bulb') + '<span>' + U.esc(t) + '</span>' });
      }))
    ]);
    var row = h('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' } }, [startBtn, recBtn]);
    main.appendChild(topicBox);
    main.appendChild(h('div', { style: { height: '16px' } }));
    main.appendChild(stage);
    main.appendChild(row);
    main.appendChild(info);
    main.appendChild(checklist);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      startBtn.disabled = true;
      info.textContent = 'La caméra n\'est pas disponible dans ce navigateur (il faut une adresse en https).';
      return;
    }
    startBtn.addEventListener('click', function () {
      stopMirror();
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true }).then(function (stream) {
        mirrorState = { stream: stream };
        video.classList.remove('playback');
        video.controls = false;
        video.muted = true;
        video.srcObject = stream;
        ph.remove();
        startBtn.classList.add('hidden');
        recBtn.classList.remove('hidden');
        info.textContent = 'Place-toi à environ un mètre, cadre ton buste et tes mains.';
      }).catch(function () {
        info.textContent = 'Impossible d\'accéder à la caméra. Vérifie les autorisations du navigateur.';
      });
    });
    recBtn.addEventListener('click', function () {
      if (!mirrorState) return;
      if (mirrorState.rec && mirrorState.rec.state === 'recording') {
        mirrorState.rec.stop();
        return;
      }
      if (typeof MediaRecorder === 'undefined') { info.textContent = 'L\'enregistrement vidéo n\'est pas pris en charge ici, mais tu peux t\'observer en direct.'; return; }
      var chunks = [];
      var rec;
      try { rec = new MediaRecorder(mirrorState.stream); } catch (e) { info.textContent = 'Enregistrement impossible sur ce navigateur.'; return; }
      mirrorState.rec = rec;
      var t0 = Date.now();
      var dot = h('div.rec-dot', { text: '● 0:00' });
      stage.appendChild(dot);
      mirrorState.tick = setInterval(function () {
        var s = (Date.now() - t0) / 1000;
        dot.textContent = '● ' + U.fmtTime(s);
        if (s > 180) rec.stop();
      }, 500);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var secs = (Date.now() - t0) / 1000;
        clearInterval(mirrorState && mirrorState.tick);
        dot.remove();
        var blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
        if (mirrorState && mirrorState.stream) mirrorState.stream.getTracks().forEach(function (t) { t.stop(); });
        mirrorState = null;
        video.srcObject = null;
        video.src = URL.createObjectURL(blob);
        video.classList.add('playback');
        video.muted = false;
        video.controls = true;
        recBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.innerHTML = App.icon('refresh') + '<span>Recommencer</span>';
        checklist.classList.remove('hidden');
        info.textContent = 'Regarde ta vidéo (elle reste sur ton appareil).';
        if (secs >= 10) {
          var sum = Store.completeLesson({ id: null, kind: 'practice', xp: 5, total: 0, correct: 0, counts: { speakSecs: secs } });
          UI.toast('+' + sum.xp + ' XP · Bravo pour cette séance miroir !', 'xp');
        }
      };
      rec.start(500);
      recBtn.innerHTML = App.icon('stop') + '<span>Arrêter</span>';
      info.textContent = 'Parle du sujet ci-dessus. Appuie sur « Arrêter » quand tu as fini.';
    });
  }

  /* ================= QUÊTES ================= */
  P.quests = function (main) {
    var now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0);
    var hrs = Math.max(1, Math.round((mid - now) / 3600000));
    main.appendChild(UI.pageHead('Quêtes du jour', 'happy', 'Nouvelles quêtes dans ' + U.plural(hrs, 'heure') + '.'));
    var card = h('div.card');
    Store.quests().forEach(function (q, i) {
      var qt = Store.QUEST_TYPES[q.type];
      var pct = q.progress / q.target;
      var right;
      if (q.claimed) right = h('span.pill', { html: App.icon('check') + ' Récupéré' });
      else if (q.progress >= q.target) {
        right = h('button.btn.gold.sm', { type: 'button', 'aria-label': 'Récupérer ' + q.gems + ' améthystes', html: App.icon('gem') + '<span>+' + q.gems + '</span>' });
        right.addEventListener('click', function () {
          var g = Store.claimQuest(i);
          if (g) { App.Sound.play('chest'); UI.confetti(1500); UI.toast('+' + g + ' améthystes !', 'gem'); App.render(); }
        });
      } else right = h('span.reward', { html: App.icon('gem') + q.gems });
      var label = Store.questLabel(q);
      var shown = q.type === 'seconds' ? Math.floor(q.progress / 60) + ' / ' + Math.round(q.target / 60) + ' min' : q.progress + ' / ' + q.target;
      card.appendChild(h('div.quest', null, [
        h('span', { html: App.icon(qt.icon) }),
        h('div.grow', null, [
          h('div.t', { text: label }),
          h('div.bar', { role: 'progressbar', 'aria-valuenow': String(Math.round(pct * 100)), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': label }, [h('i', { style: { width: Math.round(pct * 100) + '%' } }), h('span.bar-label', { text: shown })])
        ]),
        right
      ]));
    });
    main.appendChild(card);

    main.appendChild(h('h2.section-title', { text: 'Badges', style: { marginTop: '32px' } }));
    var grid = h('div.badges');
    Store.BADGES.forEach(function (b) {
      var tier = Store.badgeTier(b);
      var nextT = b.tiers[tier];
      var val = b.val(Store.get());
      var prevT = tier ? b.tiers[tier - 1] : 0;
      var pct = nextT ? (val - prevT) / (nextT - prevT) : 1;
      grid.appendChild(h('div.badge' + (tier ? '' : '.off'), null, [
        h('div.bi', { style: { background: b.color }, html: App.icon(b.icon) + (tier ? '<span class="lv">' + tier + '/' + b.tiers.length + '</span>' : '') }),
        h('div.n', { text: b.name }),
        h('div.d', { text: nextT ? b.desc(nextT) : 'Niveau maximum !' }),
        nextT ? h('div.bar.purple', null, h('i', { style: { width: Math.round(U.clamp(pct, 0, 1) * 100) + '%' } })) : null
      ]));
    });
    main.appendChild(grid);
  };

  /* ================= PROFIL ================= */
  function weekChart() {
    var days = [], max = 0, today = U.dayKey();
    for (var i = -6; i <= 0; i++) {
      var d = U.addDays(today, i);
      var v = Store.get().xp.byDay[d] || 0;
      max = Math.max(max, v);
      days.push({ d: d, v: v, label: U.DAYS_SHORT[U.parseDay(d).getDay()], today: i === 0 });
    }
    var goal = Store.get().profile.dailyGoal || 20;
    var top = Math.max(max, goal) * 1.15 || 10;
    var W = 400, H = 170, padB = 24, padT = 22, bw = 34, gap = (W - bw * 7) / 7;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="XP gagnés ces 7 derniers jours">';
    var gy = padT + (H - padB - padT) * (1 - goal / top);
    s += '<line class="grid-line" x1="0" x2="' + W + '" y1="' + (H - padB) + '" y2="' + (H - padB) + '"/>';
    s += '<line x1="0" x2="' + W + '" y1="' + gy + '" y2="' + gy + '" stroke="var(--gold-dark)" stroke-dasharray="5 6" stroke-width="2"/>';
    s += '<text class="axis" x="2" y="' + (gy - 6) + '" text-anchor="start">Objectif ' + goal + ' XP</text>';
    days.forEach(function (o, k) {
      var x = gap / 2 + k * (bw + gap);
      var bh = (H - padB - padT) * (o.v / top);
      var y = H - padB - bh;
      if (o.v > 0) {
        var r = Math.min(4, bh / 2);
        s += '<path d="M' + x + ' ' + (H - padB) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + bw - r) + 'Q' + (x + bw) + ' ' + y + ' ' + (x + bw) + ' ' + (y + r) + 'V' + (H - padB) + 'Z" fill="' + (o.today ? 'var(--primary)' : 'var(--primary-line)') + '"><title>' + o.label + ' : ' + o.v + ' XP</title></path>';
        if (o.today || o.v === max) s += '<text class="val" x="' + (x + bw / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + o.v + '</text>';
      }
      s += '<text class="axis" x="' + (x + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + o.label + '</text>';
    });
    s += '</svg>';
    return h('div.chart', { html: s });
  }

  function speechChart(list) {
    var pts = list.filter(function (x) { return typeof x.score === 'number'; }).slice(-12);
    if (pts.length < 2) return null;
    var W = 400, H = 160, padB = 14, padT = 18, padL = 30;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Évolution du score de tes prises de parole">';
    [0, 50, 100].forEach(function (g) {
      var y = padT + (H - padB - padT) * (1 - g / 100);
      s += '<line class="grid-line" x1="' + padL + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="axis" x="' + (padL - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + g + '</text>';
    });
    var d = '';
    var coords = pts.map(function (p, i) {
      var x = padL + 10 + i * ((W - padL - 20) / (pts.length - 1));
      var y = padT + (H - padB - padT) * (1 - p.score / 100);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      return { x: x, y: y, p: p };
    });
    s += '<path d="' + d + '" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    coords.forEach(function (c, i) {
      var date = new Date(c.p.at);
      s += '<circle cx="' + c.x + '" cy="' + c.y + '" r="5" fill="var(--primary)" stroke="var(--surface)" stroke-width="2"><title>' + date.toLocaleDateString('fr-FR') + ' : ' + c.p.score + '/100' + (c.p.wpm ? ' · ' + c.p.wpm + ' mots/min' : '') + (typeof c.p.fillers === 'number' ? ' · ' + c.p.fillers + ' tics' : '') + '</title></circle>';
      if (i === coords.length - 1) s += '<text class="val" x="' + c.x + '" y="' + (c.y - 10) + '" text-anchor="middle">' + c.p.score + '</text>';
    });
    s += '</svg>';
    return h('div.chart', { html: s });
  }

  P.profile = function (main) {
    var s = Store.get(), lv = Store.level();
    var name = s.profile.name || 'Orateur';
    var head = h('div.profile-head', null, [
      h('div.avatar', { text: name.charAt(0), 'aria-hidden': 'true' }),
      h('div', { style: { flex: '1', minWidth: '0' } }, [
        h('h1', { text: name }),
        h('p.muted', { text: 'Membre depuis le ' + U.parseDay(s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), style: { fontWeight: 700, margin: '2px 0 10px' } }),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
          h('span.lvl-badge', { text: String(lv.level) }),
          h('div', { style: { flex: '1' } }, [
            h('div', { text: lv.title, style: { fontWeight: 900 } }),
            h('div.bar.purple', { style: { height: '10px', marginTop: '4px' }, 'aria-label': 'Progression vers le niveau suivant' }, h('i', { style: { width: Math.round(lv.progress * 100) + '%' } }))
          ])
        ]),
        lv.max ? null : h('div.small.muted', { text: (lv.xpNeed - lv.xpIn) + ' XP avant le niveau ' + (lv.level + 1), style: { fontWeight: 700, marginTop: '4px' } })
      ]),
      h('a.icon-btn', { href: '#/reglages', 'aria-label': 'Réglages', html: App.icon('settings') })
    ]);
    main.appendChild(head);

    main.appendChild(h('h2.section-title', { text: 'Statistiques' }));
    var acc = s.stats.answered ? Math.round(s.stats.correct / s.stats.answered * 100) + ' %' : '—';
    var items = [
      ['flame', s.streak.count, 'Jours de série'],
      ['xp', s.xp.total, 'XP au total'],
      ['bookFill', s.stats.lessons, 'Leçons terminées', 'var(--blue)'],
      ['clock', Math.round(s.stats.speakSecs / 60) + ' min', 'Temps de parole', 'var(--primary)'],
      ['chat', s.stats.speeches, 'Discours analysés', 'var(--pink)'],
      ['featherFill', s.stats.virelangues, 'Virelangues réussis', 'var(--pink)'],
      ['target', acc, 'Précision', 'var(--green)'],
      ['trophy', s.streak.best, 'Meilleure série', 'var(--gold-dark)']
    ];
    main.appendChild(h('div.stat-grid', null, items.map(function (it) {
      return h('div.stat-box', null, [
        h('span', { html: App.icon(it[0]), style: { color: it[3] || '' } }),
        h('div', null, [h('div.v', { text: String(it[1]) }), h('div.k', { text: it[2] })])
      ]);
    })));

    main.appendChild(h('h2.section-title', { text: 'Ta semaine', style: { marginTop: '28px' } }));
    main.appendChild(h('div.card', null, weekChart()));

    main.appendChild(h('h2.section-title', { text: 'Tes prises de parole', style: { marginTop: '28px' } }));
    var sp = s.speeches;
    if (!sp.length) {
      main.appendChild(h('div.card.center', null, [
        h('p.muted', { text: 'Fais ton premier discours analysé dans l\'onglet Entraînement (Studio d\'analyse) pour suivre ta progression ici.', style: { fontWeight: 700 } }),
        h('a.btn', { href: '#/entrainement', text: 'S\'entraîner' })
      ]));
    } else {
      var card = h('div.card');
      var ch = speechChart(sp);
      if (ch) { card.appendChild(h('div', { text: 'Score sur 100, par prise de parole', style: { fontWeight: 800, color: 'var(--text-soft)', fontSize: '14px', marginBottom: '6px' } })); card.appendChild(ch); }
      var list = h('div.list', { style: { marginTop: ch ? '16px' : '0' } });
      sp.slice(-5).reverse().forEach(function (x) {
        var bits = [U.fmtDuration(x.dur || 0)];
        if (x.wpm) bits.push(x.wpm + ' mots/min');
        if (typeof x.fillers === 'number') bits.push(U.plural(x.fillers, 'tic'));
        if (typeof x.pitch === 'number') bits.push(U.num(x.pitch) + ' demi-tons');
        list.appendChild(h('div.row-item', null, [
          h('div.grow', null, [
            h('div.t', { text: (x.kind === 'lecture' ? 'Lecture' : 'Parole libre') + ' · ' + new Date(x.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }),
            h('div.s', { text: bits.join(' · ') })
          ]),
          typeof x.score === 'number' ? h('span.score-pill', { text: x.score + '/100' }) : null
        ]));
      });
      card.appendChild(list);
      main.appendChild(card);
    }

    var unlocked = Store.BADGES.filter(function (b) { return Store.badgeTier(b) > 0; }).length;
    main.appendChild(h('h2.section-title', { text: 'Badges', style: { marginTop: '28px' } }));
    main.appendChild(h('a.row-item', { href: '#/quetes', style: { textDecoration: 'none', color: 'inherit' } }, [
      h('span', { html: App.icon('medal'), style: { fontSize: '40px' } }),
      h('div.grow', null, [h('div.t', { text: unlocked + ' badge' + (unlocked > 1 ? 's' : '') + ' sur ' + Store.BADGES.length }), h('div.s', { text: 'Voir tous les badges' })]),
      h('span', { html: App.icon('next'), style: { fontSize: '22px', color: 'var(--text-faint)' } })
    ]));
  };

  /* ================= BOUTIQUE ================= */
  P.shop = function (main) {
    var s = Store.get();
    main.appendChild(h('div.page-head', null, [
      App.Mascot.el({ mood: 'happy', size: 90 }),
      h('div', { style: { flex: '1' } }, [h('h1', { text: 'Boutique' }), h('p.muted', { text: 'Dépense tes améthystes, gagnées avec les quêtes et les coffres.', style: { fontWeight: 700, margin: '4px 0 0' } })]),
      h('span.stat.gem', { html: App.icon('gem') + '<span>' + s.gems + '</span>', 'aria-label': s.gems + ' améthystes' })
    ]));

    function itemRow(item) {
      var owned = !!s.shop.owned[item.id];
      var equipped = !!s.shop.equipped[item.id];
      var icon;
      if (item.outfit) { var o = {}; o[item.id] = true; icon = App.Mascot.svg({ mood: 'happy', size: 56, outfit: o, label: false }); }
      else icon = App.icon(item.icon);
      var extra = '';
      if (item.id === 'freeze') extra = ' Tu en as ' + s.streak.freezes + ' / 2.';
      if (item.id === 'boost' && Store.boostActive()) extra = ' Actif encore ' + Math.ceil((s.shop.boostUntil - Date.now()) / 60000) + ' min.';
      var btn;
      if (item.outfit && owned) {
        btn = h('button.btn.sm' + (equipped ? '.ghost' : ''), { type: 'button', text: equipped ? 'Retirer' : 'Porter' });
        btn.addEventListener('click', function () { Store.toggleOutfit(item.id); App.render(); });
      } else {
        btn = h('button.btn.ghost.sm', { type: 'button', 'aria-label': 'Acheter pour ' + item.price + ' améthystes', html: '<span class="price">' + App.icon('gem') + item.price + '</span>' });
        if (s.gems < item.price || (item.id === 'freeze' && s.streak.freezes >= 2)) btn.disabled = true;
        btn.addEventListener('click', function () {
          var r = Store.buy(item.id);
          if (r.ok) { App.Sound.play('chest'); UI.toast(item.name + ' : c\'est à toi !', 'check'); App.render(); }
          else UI.toast(r.msg, 'alert');
        });
      }
      return h('div.shop-item', null, [
        h('div.si', { html: icon }),
        h('div.grow', null, [h('div.t', { text: item.name }), h('div.s', { text: item.desc + extra })]),
        btn
      ]);
    }

    main.appendChild(h('h2.section-title', { text: 'Bonus' }));
    main.appendChild(h('div.card', null, Store.SHOP.filter(function (i) { return !i.outfit; }).map(itemRow)));
    main.appendChild(h('h2.section-title', { text: 'Tenues d\'Ahouéfa', style: { marginTop: '28px' } }));
    main.appendChild(h('div.card', null, [
      h('div.center', { style: { marginBottom: '8px' } }, [App.Mascot.el({ mood: 'wave', size: 130 })]),
      h('p.center.muted', { text: 'Ahouéfa adore le violet… et les accessoires !', style: { fontWeight: 700 } })
    ].concat(Store.SHOP.filter(function (i) { return i.outfit; }).map(itemRow))));
  };

  /* ================= RÉGLAGES ================= */
  P.settings = function (main) {
    var s = Store.get();
    main.appendChild(UI.pageHead('Réglages', 'think'));

    // Profil
    var card1 = h('div.card');
    card1.appendChild(h('h3', { text: 'Profil' }));
    var nameIn = h('input.input', { id: 'set-name', value: s.profile.name || '', maxlength: '30', autocomplete: 'given-name' });
    nameIn.addEventListener('change', function () { Store.update(function (st) { st.profile.name = nameIn.value.trim(); }); UI.toast('Prénom enregistré', 'check'); });
    card1.appendChild(h('div.field', null, [h('label', { for: 'set-name', text: 'Prénom' }), nameIn]));
    var goals = [[10, 'Détente'], [20, 'Normal'], [30, 'Sérieux'], [50, 'Intense']];
    var seg = h('div.seg', { role: 'radiogroup', 'aria-label': 'Objectif quotidien' });
    goals.forEach(function (g) {
      var b = h('button.choice' + (s.profile.dailyGoal === g[0] ? '.sel' : ''), { type: 'button', role: 'radio', 'aria-checked': s.profile.dailyGoal === g[0] ? 'true' : 'false', html: '<span>' + g[1] + '<span class="sub">' + g[0] + ' XP</span></span>' });
      b.addEventListener('click', function () { Store.update(function (st) { st.profile.dailyGoal = g[0]; }); App.render(); });
      seg.appendChild(b);
    });
    card1.appendChild(h('div.field', null, [h('div.lbl', { text: 'Objectif quotidien' }), seg]));
    main.appendChild(card1);

    // Préférences
    var card2 = h('div.card');
    card2.appendChild(h('h3', { text: 'Préférences' }));
    card2.appendChild(UI.switchRow('Effets sonores', 'Sons de bonne réponse, de fin de leçon…', s.settings.sound, function (v) { Store.update(function (st) { st.settings.sound = v; }); }));
    card2.appendChild(UI.switchRow('Vibrations', 'Sur téléphone, en cas d\'erreur', s.settings.haptics, function (v) { Store.update(function (st) { st.settings.haptics = v; }); }));
    card2.appendChild(UI.switchRow('Animations réduites', 'Moins de mouvements à l\'écran', s.settings.reduceMotion, function (v) { Store.update(function (st) { st.settings.reduceMotion = v; }); App.applyTheme(); }));
    var themeSeg = h('div.seg', { role: 'radiogroup', 'aria-label': 'Thème' });
    [['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].forEach(function (t) {
      var b = h('button.choice' + (s.settings.theme === t[0] ? '.sel' : ''), { type: 'button', role: 'radio', 'aria-checked': s.settings.theme === t[0] ? 'true' : 'false', text: t[1] });
      b.addEventListener('click', function () { Store.update(function (st) { st.settings.theme = t[0]; }); App.applyTheme(); App.render(); });
      themeSeg.appendChild(b);
    });
    card2.appendChild(h('div.field', { style: { marginTop: '14px' } }, [h('div.lbl', { text: 'Thème' }), themeSeg]));
    main.appendChild(card2);

    // Voix et micro
    var card3 = h('div.card');
    card3.appendChild(h('h3', { text: 'Voix et micro' }));
    card3.appendChild(UI.switchRow('Exercices de parole', 'Utiliser le micro dans les leçons', s.settings.mic !== false && Date.now() > s.cantSpeakUntil, function (v) {
      Store.update(function (st) { st.settings.mic = v; if (v) st.cantSpeakUntil = 0; });
    }));
    var langSel = h('select.input', { id: 'set-lang' });
    [['fr-FR', 'Français (France)'], ['fr-BE', 'Français (Belgique)'], ['fr-CA', 'Français (Canada)'], ['fr-CH', 'Français (Suisse)']].forEach(function (l) {
      var o = h('option', { value: l[0], text: l[1] });
      if (s.settings.srLang === l[0]) o.selected = true;
      langSel.appendChild(o);
    });
    langSel.addEventListener('change', function () { Store.update(function (st) { st.settings.srLang = langSel.value; }); });
    card3.appendChild(h('div.field', { style: { marginTop: '14px' } }, [h('label', { for: 'set-lang', text: 'Langue de reconnaissance vocale' }), langSel]));

    if (App.Speech.ttsSupported()) {
      var voiceSel = h('select.input', { id: 'set-voice' });
      function fillVoices() {
        U.clear(voiceSel);
        voiceSel.appendChild(h('option', { value: '', text: 'Automatique' }));
        App.Speech.frenchVoices().forEach(function (v) {
          var o = h('option', { value: v.voiceURI, text: v.name + ' (' + v.lang + ')' });
          if (Store.get().settings.voiceURI === v.voiceURI) o.selected = true;
          voiceSel.appendChild(o);
        });
      }
      fillVoices();
      setTimeout(fillVoices, 600);
      voiceSel.addEventListener('change', function () { Store.update(function (st) { st.settings.voiceURI = voiceSel.value; }); });
      var rate = h('input', { type: 'range', min: '0.6', max: '1.3', step: '0.05', value: String(s.settings.rate || 0.95), id: 'set-rate', style: { width: '100%' } });
      rate.addEventListener('change', function () { Store.update(function (st) { st.settings.rate = parseFloat(rate.value); }); });
      var test = h('button.btn.ghost.sm', { type: 'button', html: App.icon('volume') + '<span>Écouter Ahouéfa</span>' });
      test.addEventListener('click', function () { App.Speech.say('Bonjour ! Moi, c\'est Ahouéfa. J\'adore le violet, et je suis ravie de t\'entraîner.'); });
      card3.appendChild(h('div.field', null, [h('label', { for: 'set-voice', text: 'Voix d\'Ahouéfa' }), voiceSel]));
      card3.appendChild(h('div.field', null, [h('label', { for: 'set-rate', text: 'Vitesse de lecture' }), rate, h('div', null, test)]));
    }
    var micTest = h('button.btn.ghost.sm', { type: 'button', html: App.icon('mic') + '<span>Tester mon micro</span>' });
    micTest.addEventListener('click', P.micTest);
    card3.appendChild(micTest);
    card3.appendChild(h('p.hint', { style: { marginTop: '12px' }, text: diagText() }));
    main.appendChild(card3);

    // Données
    var card4 = h('div.card');
    card4.appendChild(h('h3', { text: 'Mes données' }));
    card4.appendChild(h('p.muted', { text: 'Ta progression est enregistrée uniquement sur cet appareil. Exporte-la pour la sauvegarder ou la transférer.', style: { fontWeight: 600 } }));
    var exp = h('button.btn.ghost.sm', { type: 'button', html: App.icon('download') + '<span>Exporter</span>' });
    exp.addEventListener('click', function () {
      var blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      var a = h('a', { href: URL.createObjectURL(blob), download: 'ahouefa-progression-' + U.dayKey() + '.json' });
      document.body.appendChild(a); a.click(); a.remove();
    });
    var file = h('input', { type: 'file', accept: 'application/json,.json', class: 'hidden' });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { Store.importJSON(rd.result); UI.toast('Progression importée !', 'check'); App.applyTheme(); App.render(); }
        catch (e) { UI.toast('Fichier invalide.', 'alert'); }
      };
      rd.readAsText(f);
    });
    var imp = h('button.btn.ghost.sm', { type: 'button', html: App.icon('upload') + '<span>Importer</span>' });
    imp.addEventListener('click', function () { file.click(); });
    var reset = h('button.btn.red.sm', { type: 'button', html: App.icon('trash') + '<span>Tout effacer</span>' });
    reset.addEventListener('click', function () {
      UI.confirm({ title: 'Tout effacer ?', body: 'Ta progression, tes XP, ta série et tes badges seront supprimés. C\'est définitif.', yes: 'Tout effacer', yesCls: 'red', no: 'Annuler' }).then(function (ok) {
        if (ok) { Store.reset(); location.hash = '#/apprendre'; App.applyTheme(); App.render(); }
      });
    });
    card4.appendChild(h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } }, [exp, imp, reset, file]));
    main.appendChild(card4);

    main.appendChild(h('p.center.small.muted', { text: 'Ahouéfa · Coach d\'éloquence · version 1.0', style: { marginTop: '24px', fontWeight: 700 } }));
  };

  function diagText() {
    var bits = [];
    bits.push(App.Speech.srSupported() ? 'Reconnaissance vocale : disponible.' : 'Reconnaissance vocale : non disponible dans ce navigateur (utilise Chrome ou Safari pour l\'analyse complète).');
    bits.push(App.Speech.micSupported() ? 'Micro : disponible.' : 'Micro : indisponible (il faut une adresse en https).');
    return bits.join(' ');
  }

  /* Test du micro : vu-mètre pendant quelques secondes */
  P.micTest = function () {
    var meter = h('div.level-meter', { style: { justifyContent: 'center', margin: '16px 0' } });
    var bars = [];
    for (var i = 0; i < 20; i++) { var b = h('i'); bars.push(b); meter.appendChild(b); }
    var msg = h('p', { text: 'Autorise le micro, puis dis quelques mots.' });
    var session = null, best = 0;
    var m = UI.modal({
      title: 'Test du micro', body: h('div', null, [meter, msg]), mascot: 'talk',
      actions: [{ label: 'Terminer' }],
      onClose: function () { if (session) session.cancel(); }
    });
    session = App.Speech.session({
      transcribe: false, record: false,
      onLevel: function (rms) {
        best = Math.max(best, rms);
        var lvl = U.clamp(rms * 9, 0, 1);
        bars.forEach(function (b, k) { b.style.height = Math.round(6 + lvl * 38 * (0.5 + 0.5 * Math.abs(Math.sin(Date.now() / 100 + k)))) + 'px'; });
        if (best > 0.03) msg.textContent = 'Parfait, je t\'entends bien !';
      }
    });
    session.start().catch(function (err) { msg.textContent = App.Speech.errorText(err); });
    return m;
  };

  App.Pages = P;
})(window.App = window.App || {});

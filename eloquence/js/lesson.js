/* Moteur de leçon : enchaîne les exercices, gère la barre de progression,
   les réponses (bonnes / à revoir), puis les écrans de fin (XP, série, badges). */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Store = App.Store, UI = App.UI;
  var SPEAKING = /^(speak|voice|free)$/;
  var active = null;

  function praise(combo) {
    var list = combo >= 5 ? ['Inarrêtable !', 'En feu !', 'Quelle série !'] : ['Excellent !', 'Bravo !', 'Parfait !', 'Bien joué !', 'Super !', 'Génial !'];
    return U.pick(list);
  }

  /* opts = { id, kind, title, unit, steps, xp, onExit(done) } */
  function start(opts) {
    if (active) active.destroy();
    var steps = opts.steps.slice();
    var removedSpeaking = 0;
    if (!Store.canSpeak()) {
      var kept = steps.filter(function (s) { return !SPEAKING.test(s.type); });
      removedSpeaking = steps.length - kept.length;
      if (!kept.some(function (s) { return s.type !== 'info'; })) {
        UI.modal({
          title: 'Cette leçon se fait à voix haute',
          body: '<p>Tu as indiqué ne pas pouvoir parler en ce moment. On réactive les exercices de parole ?</p>',
          mascot: 'think',
          actions: [
            { label: 'Oui, je peux parler', onClick: function () { Store.update(function (s) { s.cantSpeakUntil = 0; }); start(opts); } },
            { label: 'Plus tard', cls: 'flat', onClick: function () { if (opts.onExit) opts.onExit(false); } }
          ],
          dismissable: false
        });
        return;
      }
      steps = kept;
    }
    steps.forEach(function (s, i) { s._id = i; });

    var L = {
      queue: steps.slice(), total: steps.length, doneCount: 0,
      combo: 0, bestCombo: 0, mistakes: 0,
      firstTry: {}, counts: {}, bonusXP: 0,
      started: Date.now(), ex: null, state: 'idle', result: null
    };
    var unit = opts.unit || App.Course.units[0];

    /* ---------- DOM ---------- */
    var root = h('div.lesson', { role: 'main', 'aria-label': opts.title || 'Leçon' });
    root.style.setProperty('--uc', unit.color);
    root.style.setProperty('--ud', unit.dark);
    var closeBtn = h('button.icon-btn', { type: 'button', 'aria-label': 'Quitter la leçon', html: App.icon('close') });
    var bar = h('i');
    var progress = h('div.lesson-progress', { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Progression' }, bar);
    var comboEl = h('div.combo', { 'aria-live': 'polite' });
    var top = h('div.lesson-top', null, [closeBtn, progress, comboEl]);
    var inner = h('div.lesson-inner');
    var body = h('div.lesson-body', null, inner);
    var footIn = h('div.lesson-foot-in');
    var foot = h('div.lesson-foot', null, footIn);
    root.appendChild(top); root.appendChild(body); root.appendChild(foot);
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';

    closeBtn.addEventListener('click', askQuit);

    function setProgress() {
      var pct = L.total ? L.doneCount / L.total : 1;
      bar.style.width = Math.round(pct * 100) + '%';
      progress.setAttribute('aria-valuenow', String(Math.round(pct * 100)));
    }
    function setCombo() {
      if (L.combo >= 3) {
        comboEl.innerHTML = App.icon('flame') + '<span>' + L.combo + '</span>';
        comboEl.title = L.combo + ' bonnes réponses d\'affilée';
        comboEl.classList.remove('pop'); void comboEl.offsetWidth; comboEl.classList.add('pop');
      } else comboEl.innerHTML = '';
    }

    /* ---------- Pied de page ---------- */
    function footer(state, res) {
      L.state = state;
      U.clear(footIn);
      foot.className = 'lesson-foot';
      var ex = L.ex, step = L.queue[0];
      if (state === 'idle') {
        var left = null, right = null;
        if (ex.kind === 'info') {
          right = h('button.btn', { type: 'button', text: 'Continuer' });
          right.addEventListener('click', next);
        } else if (ex.kind === 'graded') {
          left = h('button.btn.flat', { type: 'button', text: 'Passer' });
          left.addEventListener('click', skipGraded);
          right = h('button.btn', { type: 'button', text: 'Vérifier' });
          right.disabled = !ex.ready();
          right.addEventListener('click', check);
        } else {
          if (SPEAKING.test(step.type)) {
            left = h('button.btn.flat', { type: 'button', text: 'Je ne peux pas parler' });
            left.addEventListener('click', cantSpeak);
          } else {
            left = h('button.btn.flat', { type: 'button', text: 'Passer' });
            left.addEventListener('click', skipActivity);
          }
          if (ex.kind === 'activity') {
            right = h('button.btn', { type: 'button', text: 'Continuer' });
            right.disabled = true;
          }
          if (SPEAKING.test(step.type) && step.type !== 'speak') {
            var sk = h('button.btn.flat', { type: 'button', text: 'Passer' });
            sk.addEventListener('click', skipActivity);
            left = h('div.foot-alt', null, [left, sk]);
          }
        }
        footIn.appendChild(left || h('span'));
        if (right) footIn.appendChild(right);
        L.primary = right;
      } else {
        // Retour : bonne / mauvaise réponse, ou activité terminée
        var ok = res.correct !== false;
        if (!res.quiet) foot.classList.add(ok ? 'ok' : 'ko');
        var fb = null;
        if (!res.quiet) {
          var text = '';
          if (!ok && (res.solution || res.solutionHTML)) {
            text = '<strong>Bonne réponse :</strong> ' + (res.solutionHTML || U.esc(res.solution));
            if (res.explain) text += '<br>' + U.esc(res.explain);
          } else if (res.explain) text = U.esc(res.explain);
          fb = h('div.feedback', { role: 'status' }, [
            h('div.fb-icon', { html: App.icon(ok ? 'check' : 'x') }),
            h('div', null, [h('div.fb-title', { text: res.title || (ok ? praise(L.combo) : 'Pas tout à fait…') }), text ? h('div.fb-text', { html: text }) : null])
          ]);
        }
        var cont = h('button.btn' + (res.quiet ? '' : ok ? '.green' : '.red'), { type: 'button', text: 'Continuer' });
        cont.addEventListener('click', next);
        footIn.appendChild(fb || h('span'));
        footIn.appendChild(cont);
        L.primary = cont;
        setTimeout(function () { try { cont.focus({ preventScroll: true }); } catch (e) { cont.focus(); } }, 50);
      }
    }

    /* ---------- Contexte fourni aux exercices ---------- */
    var ctx = {
      unit: unit,
      complete: function (res) { finishStep(res); },
      offerNoSpeak: function () {
        UI.modal({
          title: 'Le micro n\'est pas accessible',
          body: '<p>Autorise le micro dans ton navigateur (icône à gauche de l\'adresse), ou continue sans exercices de parole. Tu pourras les réactiver dans Réglages.</p>',
          mascot: 'think',
          actions: [
            { label: 'Continuer sans micro', onClick: function () { Store.update(function (s) { s.settings.mic = false; }); dropSpeaking('Exercices de parole désactivés. Réactive-les dans Réglages.'); } },
            { label: 'Réessayer', cls: 'flat' }
          ]
        });
      }
    };

    function record(step, correct) {
      if (L.firstTry[step._id] === undefined) L.firstTry[step._id] = !!correct;
      if (correct) {
        L.combo++;
        L.bestCombo = Math.max(L.bestCombo, L.combo);
      } else {
        L.combo = 0;
        L.mistakes++;
      }
      setCombo();
    }
    function addCounts(c) {
      if (!c) return;
      Object.keys(c).forEach(function (k) { L.counts[k] = (L.counts[k] || 0) + (c[k] || 0); });
    }

    /* Résultat d'un exercice qui se termine tout seul (paires, parole, activité) */
    function finishStep(res) {
      var step = L.queue[0];
      addCounts(res.counts);
      if (res.bonusXP) L.bonusXP += res.bonusXP;
      if (res.activity) {
        if (!res.quiet) App.Sound.play('correct');
        L.doneCount++;
        setProgress();
        footer('feedback', res);
        return;
      }
      record(step, res.correct);
      App.Sound.play(res.correct ? 'correct' : 'wrong');
      if (!res.correct) U.vibrate(120);
      var noRequeue = res.noRequeue || opts.noRetry;
      if (res.correct || noRequeue) { L.doneCount++; setProgress(); }
      if (!res.correct && !noRequeue) { L.queue.push(step); Store.addMistake(step); }
      if (!res.correct && res.noRequeue && step.type !== 'speak') Store.addMistake(step);
      if (res.correct && opts.kind === 'mistakes') Store.removeMistake(step);
      footer('feedback', res);
    }

    function check() {
      if (L.state !== 'idle' || !L.ex.ready || !L.ex.ready()) return;
      var res = L.ex.check();
      var step = L.queue[0];
      record(step, res.correct);
      App.Sound.play(res.correct ? 'correct' : 'wrong');
      if (res.correct) {
        L.doneCount++;
        setProgress();
        if (opts.kind === 'mistakes') Store.removeMistake(step);
      } else {
        U.vibrate(120);
        if (opts.noRetry) { L.doneCount++; setProgress(); } else L.queue.push(step);
        Store.addMistake(step);
      }
      footer('feedback', res);
    }

    function skipGraded() {
      if (L.state !== 'idle') return;
      var res = L.ex.check();
      var step = L.queue[0];
      record(step, false);
      App.Sound.play('wrong');
      if (opts.noRetry) { L.doneCount++; setProgress(); } else L.queue.push(step);
      Store.addMistake(step);
      res.correct = false;
      res.title = 'Réponse passée';
      footer('feedback', res);
    }
    function skipActivity() {
      if (L.state !== 'idle') return;
      L.doneCount++;
      setProgress();
      L.ex.destroy && L.ex.destroy();
      L.queue.shift();
      show();
    }
    function cantSpeak() {
      Store.update(function (s) { s.cantSpeakUntil = Date.now() + 60 * 60 * 1000; });
      dropSpeaking('Exercices de parole en pause pendant 1 heure.');
    }
    function dropSpeaking(msg) {
      UI.toast(msg, 'micFill', 3500);
      L.ex.destroy && L.ex.destroy();
      var before = L.queue.length;
      L.queue = L.queue.filter(function (s) { return !SPEAKING.test(s.type); });
      L.total -= (before - L.queue.length);
      setProgress();
      show();
    }

    function next() {
      if (L.ex && L.ex.destroy) L.ex.destroy();
      if (L.state === 'feedback' || (L.ex && L.ex.kind !== 'graded')) {
        if (L.ex && L.ex.kind === 'info') { L.doneCount++; setProgress(); }
        L.queue.shift();
      }
      show();
    }

    function show() {
      if (!L.queue.length) { finish(); return; }
      var step = L.queue[0];
      var make = App.Ex[step.type];
      if (!make) { console.warn('Type inconnu', step.type); L.queue.shift(); L.doneCount++; show(); return; }
      U.clear(inner);
      var ex = make(step, ctx);
      ex.changed = function () {
        if (L.state === 'idle' && L.primary && ex.kind === 'graded') L.primary.disabled = !ex.ready();
      };
      L.ex = ex;
      inner.appendChild(ex.el);
      body.scrollTop = 0;
      footer('idle');
      var f = ex.el.querySelector('button:not([disabled])');
      if (f && ex.kind !== 'info') { try { f.focus({ preventScroll: true }); } catch (e) { /* rien */ } }
    }

    function onKey(e) {
      if (document.querySelector('.modal-back')) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Escape') { if (!document.querySelector('.screen')) askQuit(); return; }
      if (e.key === 'Enter') {
        // Entrée valide la réponse (comme Duolingo), sauf sur les autres boutons (écouter, micro…)
        if (tag === 'BUTTON' && e.target !== L.primary && !e.target.closest('.lesson-foot') && !e.target.matches('.choice, .chip, .tw')) return;
        if (L.primary && !L.primary.disabled) { e.preventDefault(); L.primary.click(); }
        return;
      }
      if (L.state === 'idle' && L.ex && L.ex.onKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (L.ex.onKey(e)) e.preventDefault();
      }
    }
    document.addEventListener('keydown', onKey);

    function askQuit() {
      UI.modal({
        title: 'Attends, ne pars pas !',
        body: '<p>Si tu quittes maintenant, tu perdras ta progression dans cette leçon.</p>',
        mascot: 'sad',
        actions: [
          { label: 'Continuer la leçon', cls: '' },
          { label: 'Quitter', cls: 'flat', onClick: function () { destroy(); if (opts.onExit) opts.onExit(false); } }
        ]
      });
    }

    function destroy() {
      releaseBack();
      if (L.ex && L.ex.destroy) L.ex.destroy();
      document.removeEventListener('keydown', onKey);
      root.remove();
      document.body.style.overflow = '';
      App.Speech.stopSaying();
      active = null;
    }

    /* ---------- Fin de leçon ---------- */
    function finish() {
      var ids = Object.keys(L.firstTry);
      var correctFirst = ids.filter(function (k) { return L.firstTry[k]; }).length;
      var accuracy = ids.length ? correctFirst / ids.length : 1;
      var perfect = L.mistakes === 0 && ids.length > 0;
      var baseXP = opts.xp || 10;
      var xp = baseXP + (perfect ? 5 : 0) + L.bonusXP;
      var wasUnitDone = opts.kind === 'review' && App.Course.isDone(opts.id);
      var summary = Store.completeLesson({
        id: opts.id, kind: opts.kind, xp: xp, accuracy: accuracy, perfect: perfect,
        total: ids.length, correct: correctFirst, bestCombo: L.bestCombo, counts: L.counts,
        unitDone: opts.kind === 'review' && !wasUnitDone
      });
      summary.accuracy = accuracy;
      summary.results = steps.filter(function (s) { return L.firstTry[s._id] !== undefined; })
        .map(function (s) { return { unit: s._unit, type: s.type, ok: L.firstTry[s._id] }; });
      var secs = (Date.now() - L.started) / 1000;
      destroy();
      showEndScreens(summary, { accuracy: accuracy, secs: secs, perfect: perfect, kind: opts.kind, unit: unit }, function () {
        if (opts.onExit) opts.onExit(true, summary);
      });
    }

    // Le bouton « retour » du téléphone demande confirmation au lieu de quitter l'application
    var releaseBack = UI.guardBack(function () { if (!document.querySelector('.modal-back')) askQuit(); });
    setProgress();
    show();
    if (removedSpeaking) UI.toast('Exercices de parole masqués pendant ta pause micro.', 'micFill');
    active = { destroy: destroy, step: function () { return L.queue[0]; }, state: function () { return L.state; } };
    return active;
  }

  /* ---------- Écrans de fin ---------- */
  function screen(content, btnLabel, onNext, extra) {
    var s = h('div.screen', { role: 'dialog', 'aria-modal': 'true' });
    var bodyEl = h('div.screen-body', null, content);
    var btn = h('button.btn', { type: 'button', text: btnLabel || 'Continuer' });
    var footIn = h('div.screen-foot-in', null, [extra || null, btn]);
    s.appendChild(bodyEl);
    s.appendChild(h('div.screen-foot', null, footIn));
    document.body.appendChild(s);
    document.body.style.overflow = 'hidden';
    var release = UI.guardBack(function () { /* on reste sur l'écran de fin */ });
    function go() { release(); document.removeEventListener('keydown', key); s.remove(); document.body.style.overflow = ''; onNext(); }
    function key(e) { if (e.key === 'Enter') { e.preventDefault(); go(); } }
    btn.addEventListener('click', go);
    document.addEventListener('keydown', key);
    setTimeout(function () { btn.focus(); }, 60);
    return s;
  }

  function weekRow() {
    var st = Store.get().streak;
    var today = U.dayKey();
    var row = h('div.week');
    for (var i = -6; i <= 0; i++) {
      var d = U.addDays(today, i);
      var on = Store.practicedOn(d);
      var frozen = st.frozen.indexOf(d) >= 0;
      var cls = 'd' + (on ? ' on' : frozen ? ' frozen' : '') + (i === 0 ? ' today' : '');
      row.appendChild(h('div', { class: cls }, [
        h('span', { text: U.DAYS_SHORT[U.parseDay(d).getDay()] }),
        h('i', { html: on ? App.icon('check') : frozen ? App.icon('snow') : '' })
      ]));
    }
    return row;
  }

  function showEndScreens(sum, info, done) {
    var queue = [];
    var title = info.kind === 'review' ? 'Unité révisée !' : info.kind === 'practice' ? 'Entraînement terminé !' : 'Leçon terminée !';
    var timeStr = U.fmtTime(info.secs);
    var acc = Math.round(info.accuracy * 100);

    queue.push(function (next) {
      App.Sound.play('complete');
      UI.confetti();
      screen([
        App.Mascot.el({ mood: 'celebrate', size: 170 }),
        h('h1.screen-title', { text: title }),
        info.perfect ? h('p.screen-sub', { text: 'Sans aucune erreur ! +5 XP bonus' }) : null,
        h('div.result-cards', null, [
          h('div.rcard', { style: { '--rc': 'var(--gold)' } }, [h('div.h', { text: 'Total XP' }), h('div.b', { html: App.icon('xp') + '<span>' + sum.xp + '</span>' })]),
          h('div.rcard', { style: { '--rc': 'var(--green)' } }, [h('div.h', { text: acc >= 90 ? 'Superbe' : acc >= 70 ? 'Précision' : 'Courage' }), h('div.b', { html: App.icon('target') + '<span>' + acc + ' %</span>' })]),
          h('div.rcard', { style: { '--rc': 'var(--blue)' } }, [h('div.h', { text: info.secs < 240 ? 'Rapide' : 'Durée' }), h('div.b', { html: App.icon('clock') + '<span>' + timeStr + '</span>' })])
        ])
      ], 'Continuer', next);
    });

    if (sum.streak && sum.streak.extended) {
      queue.push(function (next) {
        App.Sound.play('streak');
        var n = sum.streak.count;
        screen([
          h('div.big-flame', { html: App.icon('flame') }),
          h('div.streak-num', { text: String(n) }),
          h('h1.screen-title.orange', { text: n > 1 ? 'jours de série !' : 'jour de série !' }),
          weekRow(),
          h('p.screen-sub', { text: n === 1 ? 'Ta série commence ! Reviens demain pour l\'entretenir.' : 'Petit à petit, l\'oiseau fait son nid. Reviens demain !' })
        ], 'Continuer', next);
      });
    }
    if (sum.goalReachedNow) {
      queue.push(function (next) {
        App.Sound.play('chest');
        screen([
          App.Mascot.el({ mood: 'happy', size: 150 }),
          h('h1.screen-title.purple', { text: 'Objectif du jour atteint !' }),
          h('p.screen-sub', { text: 'Tu as gagné ' + Store.todayXP() + ' XP aujourd\'hui. Ahouéfa est fière de toi !' })
        ], 'Continuer', next);
      });
    }
    if (sum.levelAfter > sum.levelBefore) {
      queue.push(function (next) {
        App.Sound.play('complete');
        UI.confetti(2000);
        var lv = Store.level();
        screen([
          h('div.badge-big', { style: { background: 'var(--primary)' }, html: '<span style="font-size:56px;font-weight:900">' + lv.level + '</span>' }),
          h('h1.screen-title.purple', { text: 'Niveau ' + lv.level + ' !' }),
          h('p.screen-sub', { text: 'Nouveau titre : « ' + lv.title + ' ».' })
        ], 'Continuer', next);
      });
    }
    (sum.badges || []).forEach(function (b) {
      queue.push(function (next) {
        App.Sound.play('chest');
        screen([
          h('div.badge-big', { style: { background: b.badge.color }, html: App.icon(b.badge.icon) }),
          h('h1.screen-title.purple', { text: 'Nouveau badge !' }),
          h('p.screen-sub', { text: b.badge.name + ' (niveau ' + b.tier + ') : ' + b.badge.desc(b.badge.tiers[b.tier - 1]) + '.' })
        ], 'Super !', next);
      });
    });

    (function run() {
      var f = queue.shift();
      if (f) f(run);
      else {
        (sum.quests || []).forEach(function (q, i) {
          setTimeout(function () { UI.toast('Quête terminée : ' + Store.questLabel(q), 'target'); }, 400 + i * 600);
        });
        done();
      }
    })();
  }

  App.Lesson = { start: start, active: function () { return active; } };
})(window.App = window.App || {});

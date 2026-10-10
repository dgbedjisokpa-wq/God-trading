/* Premier lancement : Ahouéfa se présente et construit un plan personnalisé.
   Étapes : accueil, prénom, motivations (plusieurs choix), ressenti, objectif,
   rappel, micro (+ reconnaissance vocale), plan final. */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Store = App.Store;
  var DRAFT = 'ahouefa-onb';

  var GOALS = [
    [10, 'Détente', '5 min par jour', 5],
    [20, 'Normal', '10 min par jour', 10],
    [30, 'Sérieux', '15 min par jour', 15],
    [50, 'Intense', '20 min par jour', 20]
  ];

  function saveDraft(d) { try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch (e) { /* rien */ } }
  function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (e) { return null; } }
  function clearDraft() { try { localStorage.removeItem(DRAFT); } catch (e) { /* rien */ } }

  /* onDone(action) : 'first' (première leçon), 'placement' (test de niveau), 'path' (parcours), 'import' */
  function run(onDone) {
    var Plan = App.Plan;
    var draft = loadDraft();
    var data = (draft && draft.data) || { name: '', gender: '', reasons: [], feeling: -1, goal: 20, reminder: '19:00', mic: true };
    var steps = [hero, nameStep, reasonStep, feelingStep, goalStep, reminderStep, micStep, finalStep];
    var MIC = steps.indexOf(micStep);
    var stepIdx = draft ? Math.min(draft.step || 0, MIC) : 0;
    var cleanup = null;

    var appEl = document.getElementById('app');
    if (appEl) { appEl.inert = true; appEl.setAttribute('aria-hidden', 'true'); }

    var root = h('div.onb', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Bienvenue' });
    var top = h('div.onb-top');
    var back = h('button.icon-btn', { type: 'button', 'aria-label': 'Retour', html: App.icon('back') });
    var bar = h('i');
    var prog = h('div.lesson-progress', { 'aria-hidden': 'true' }, bar);
    top.appendChild(back); top.appendChild(prog);
    var body = h('div.onb-body');
    var footIn = h('div.lesson-foot-in');
    var foot = h('div.lesson-foot', null, footIn);
    root.appendChild(top); root.appendChild(body); root.appendChild(foot);
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';

    function goBack() { if (stepIdx > 0 && stepIdx < steps.length - 1) { stepIdx--; render(); } }
    back.addEventListener('click', goBack);
    var releaseBack = App.UI.guardBack(goBack);

    function render() {
      if (cleanup) { cleanup(); cleanup = null; }
      U.clear(body); U.clear(footIn);
      var showTop = stepIdx > 0 && stepIdx < steps.length - 1;
      top.style.display = showTop ? '' : 'none';
      foot.classList.toggle('bare', !showTop);
      bar.style.width = Math.round(stepIdx / (steps.length - 1) * 100) + '%';
      if (stepIdx < steps.length - 1) saveDraft({ step: stepIdx, data: data });
      steps[stepIdx]();
      body.scrollTop = 0;
      var target = body.querySelector('input, .bubble');
      if (target && stepIdx > 0) {
        if (!target.matches('input')) target.setAttribute('tabindex', '-1');
        setTimeout(function () { try { target.focus({ preventScroll: true }); } catch (e) { /* rien */ } }, 60);
      }
    }
    function next() { App.Sound.play('tap'); stepIdx++; render(); }
    function primary(label, enabled, onClick) {
      var b = h('button.btn', { type: 'button', text: label || 'Continuer' });
      b.disabled = enabled === false;
      b.addEventListener('click', onClick || next);
      return b;
    }
    function footer(main, secondary) {
      footIn.appendChild(secondary || h('span'));
      footIn.appendChild(main);
    }
    function says(text, mood) {
      return App.Mascot.says(text, { mood: mood || 'talk', size: 96, talkFor: 1500, after: mood && mood !== 'talk' ? mood : 'idle' });
    }
    function name() { return U.esc(data.name.trim()); }

    /* Liste de choix : unique (radio) ou multiple (cases à cocher) */
    function optionList(items, opts) {
      var multi = !!opts.multi;
      var list = h('div.choices', { role: multi ? 'group' : 'radiogroup', 'aria-label': opts.label });
      var btns = items.map(function (it, i) {
        var sel = opts.isSel(i);
        var b = h('button.choice' + (sel ? '.sel' : '') + (multi ? '.multi' : ''), {
          type: 'button', role: multi ? 'checkbox' : 'radio', 'aria-checked': sel ? 'true' : 'false'
        }, [it.icon, h('span.grow', null, [it.label, it.sub ? h('span.sub', { text: it.sub }) : null]), it.right || null, multi ? h('span.check', { html: App.icon('check'), 'aria-hidden': 'true' }) : null]);
        b.addEventListener('click', function () {
          opts.onPick(i);
          refresh();
          App.Sound.play('tap');
        });
        if (!multi) {
          b.addEventListener('keydown', function (e) {
            var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            var n = btns[(i + d + btns.length) % btns.length];
            n.focus(); n.click();
          });
        }
        list.appendChild(b);
        return b;
      });
      /* Un seul arrêt de tabulation pour un groupe à choix unique (flèches pour se déplacer) */
      function refresh() {
        var any = btns.some(function (x, k) { return opts.isSel(k); });
        btns.forEach(function (x, k) {
          var s = opts.isSel(k);
          x.classList.toggle('sel', s);
          x.setAttribute('aria-checked', s ? 'true' : 'false');
          if (!multi) x.tabIndex = (any ? s : k === 0) ? 0 : -1;
        });
      }
      refresh();
      return list;
    }
    function tile(iconName, color) {
      return h('span.opt-tile', { style: { '--tc': color }, html: App.icon(iconName), 'aria-hidden': 'true' });
    }
    function emojiTile(e) { return h('span.opt-tile.emoji', { text: e, 'aria-hidden': 'true' }); }

    /* 0. Accueil */
    function hero() {
      var imp = h('input', { type: 'file', accept: 'application/json,.json', class: 'hidden', 'aria-hidden': 'true' });
      imp.addEventListener('change', function () {
        var f = imp.files && imp.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          try {
            Store.importJSON(rd.result);
            Store.update(function (s) { s.onboarded = true; });
            finish('import');
          } catch (e) { App.UI.toast('Ce fichier n\'est pas une sauvegarde Ahouéfa.', 'alert'); }
          imp.value = '';
        };
        rd.readAsText(f);
      });
      var go = primary('C\'est parti !', true, function () { App.Sound.unlock(); next(); });
      var have = h('button.btn.ghost', { type: 'button', text: 'J\'ai déjà une sauvegarde' });
      have.addEventListener('click', function () { imp.click(); });
      body.appendChild(h('div.onb-hero', null, [
        App.Mascot.el({ mood: 'wave', size: 200 }),
        h('h1', { html: 'Bonjour&nbsp;!<br>Moi, c’est Ahouéfa.' }),
        h('p', { text: 'Je vais t\'aider à parler avec clarté, confiance et impact. Cinq minutes par jour suffisent.' }),
        imp
      ]));
      footer(go, have);
    }

    /* 1. Prénom et accord */
    function nameStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Comment veux-tu que je t\'appelle ?'));
      var input = h('input.input', { id: 'onb-name', value: data.name, maxlength: '30', autocomplete: 'given-name', placeholder: 'Ton prénom', 'aria-label': 'Ton prénom', enterkeyhint: 'next' });
      inner.appendChild(input);
      var seg = h('div.seg', { role: 'radiogroup', 'aria-labelledby': 'onb-g' });
      [['f', 'Au féminin'], ['m', 'Au masculin'], ['', 'Peu importe']].forEach(function (g) {
        var b = h('button.choice' + (data.gender === g[0] ? '.sel' : ''), { type: 'button', role: 'radio', 'aria-checked': data.gender === g[0] ? 'true' : 'false', text: g[1] });
        b.addEventListener('click', function () {
          data.gender = g[0];
          Store.update(function (s) { s.profile.gender = g[0]; });
          U.$$('.choice', seg).forEach(function (x) { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
          App.Sound.play('tap');
        });
        seg.appendChild(b);
      });
      inner.appendChild(h('div.field', null, [h('div.lbl', { id: 'onb-g', text: 'Je te parle…' }), seg]));
      body.appendChild(inner);
      var b = primary('Continuer', !!data.name.trim());
      footer(b);
      input.addEventListener('input', function () { data.name = input.value; b.disabled = !input.value.trim(); });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && input.value.trim()) next(); });
    }

    /* 2. Motivations : plusieurs choix possibles */
    function reasonStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Enchantée, ' + name() + ' ! Pourquoi veux-tu mieux t\'exprimer ?', 'happy'));
      inner.appendChild(h('p.onb-hint', { html: App.icon('check') + '<span>Choisis tout ce qui te correspond</span>' }));
      var b;
      inner.appendChild(optionList(Plan.REASONS.map(function (r) { return { icon: tile(r.icon, r.color), label: r.label }; }), {
        multi: true, label: 'Tes motivations',
        isSel: function (i) { return data.reasons.indexOf(Plan.REASONS[i].key) >= 0; },
        onPick: function (i) {
          var k = Plan.REASONS[i].key, at = data.reasons.indexOf(k);
          if (at >= 0) data.reasons.splice(at, 1); else data.reasons.push(k);
          b.disabled = !data.reasons.length;
          App.Mascot.setMood(inner, data.reasons.length ? 'happy' : 'idle');
        }
      }));
      body.appendChild(inner);
      b = primary('Continuer', data.reasons.length > 0);
      footer(b);
    }

    /* 3. Ressenti : un seul choix */
    function feelingStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Comment te sens-tu quand tu prends la parole ?', 'think'));
      var b;
      inner.appendChild(optionList(Plan.FEELINGS.map(function (f) { return { icon: emojiTile(f.emoji), label: Plan.feelingLabel(f), sub: f.sub }; }), {
        label: 'Ton ressenti',
        isSel: function (i) { return data.feeling === i; },
        onPick: function (i) { data.feeling = i; b.disabled = false; App.Mascot.setMood(inner, Plan.FEELINGS[i].mood); }
      }));
      body.appendChild(inner);
      b = primary('Continuer', data.feeling >= 0);
      footer(b);
    }

    /* 4. Objectif quotidien */
    function goalStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says(Plan.FEELINGS[Math.max(0, data.feeling)].reply + ' Quel objectif quotidien te convient ?', 'happy'));
      inner.appendChild(optionList(GOALS.map(function (g, k) {
        var lvl = h('span.goal-lvl', { 'aria-hidden': 'true' });
        for (var j = 0; j < 4; j++) lvl.appendChild(h('i' + (j <= k ? '.on' : '')));
        return { icon: lvl, label: g[1], sub: g[2], right: h('span.pill.xp-pill', { html: App.icon('xp') + g[0] + ' XP' }) };
      }), {
        label: 'Objectif quotidien',
        isSel: function (i) { return data.goal === GOALS[i][0]; },
        onPick: function (i) { data.goal = GOALS[i][0]; App.Mascot.setMood(inner, i === 3 ? 'wow' : 'happy'); }
      }));
      body.appendChild(inner);
      footer(primary('Continuer'));
    }

    /* 5. Rappel quotidien */
    function reminderStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Les meilleurs orateurs s\'entraînent tous les jours. À quel moment veux-tu que je te le rappelle ?', 'talk'));
      var items = Plan.REMINDERS.map(function (r) { return { icon: tile('clock', '#8A3FFC'), label: r[1], sub: r[2] }; });
      items.push({ icon: tile('close', '#A398B3'), label: 'Pas de rappel', sub: 'Je m\'organise ' + U.g('seul', 'seule', 'seul(e)') });
      inner.appendChild(optionList(items, {
        label: 'Moment du rappel',
        isSel: function (i) { return i < Plan.REMINDERS.length ? data.reminder === Plan.REMINDERS[i][0] : !data.reminder; },
        onPick: function (i) { data.reminder = i < Plan.REMINDERS.length ? Plan.REMINDERS[i][0] : ''; }
      }));
      inner.appendChild(h('p.onb-note', { html: App.icon('clock') + '<span>À la fin, tu pourras ajouter ce rappel à l\'agenda de ton téléphone.</span>' }));
      body.appendChild(inner);
      footer(primary('Continuer'));
    }

    /* 6. Micro : niveau sonore puis reconnaissance vocale */
    function micStep() {
      var inner = h('div.onb-inner');
      var bubble = says('Pour les exercices de parole, j\'ai besoin de t\'entendre. On teste ton micro ?', 'talk');
      inner.appendChild(bubble);
      var IDLE = [10, 16, 24, 32, 22, 14, 26, 36, 28, 18, 12, 22, 34, 26, 16, 24, 30, 20, 14, 10];
      var meter = h('div.level-meter', { 'aria-hidden': 'true' });
      var bars = IDLE.map(function (v) { var b = h('i'); b.style.height = v + 'px'; meter.appendChild(b); return b; });
      var micBtn = h('button.mic-btn', { type: 'button', 'aria-label': 'Tester mon micro', html: App.icon('micFill') });
      var msg = h('p.mic-label.onb-mic-msg', { 'aria-live': 'polite', text: 'Touche le micro et dis quelques mots' });
      var heard = h('p.onb-heard', { 'aria-live': 'polite' });
      var zone = h('div.mic-zone.onb-mic', null, [micBtn, meter, msg, heard]);
      inner.appendChild(zone);
      inner.appendChild(h('p.onb-note', { html: App.icon('lock') + '<span>Tes enregistrements restent sur ton appareil. La transcription peut passer par le service vocal de ton navigateur.</span>' }));
      body.appendChild(inner);

      var session = null, listen = null, timer = null, best = 0, phase = 'idle';
      var cont = primary('Continuer');
      var later = h('button.btn.flat', { type: 'button', text: 'Pas maintenant' });
      later.addEventListener('click', function () {
        data.mic = false;
        App.UI.toast('D\'accord ! Tu pourras activer le micro dans Réglages.', 'micFill', 3500);
        next();
      });
      footer(cont, later);

      function idleBars() { bars.forEach(function (b, k) { b.style.height = IDLE[k] + 'px'; }); }
      function stopAll() {
        clearTimeout(timer);
        if (session) { session.cancel(); session = null; }
        if (listen) { listen.abort(); listen = null; }
      }
      cleanup = stopAll;
      function setState(state, text) {
        micBtn.classList.remove('rec', 'ok', 'ko');
        meter.classList.remove('live', 'ok');
        msg.classList.remove('ok', 'ko');
        if (state) { micBtn.classList.add(state); msg.classList.add(state === 'rec' ? 'x' : state); }
        if (state === 'rec') meter.classList.add('live');
        if (state === 'ok') { meter.classList.add('ok'); micBtn.innerHTML = App.icon('check'); }
        else micBtn.innerHTML = App.icon('micFill');
        msg.textContent = text;
      }

      function srPhase() {
        if (!App.Speech.srSupported()) {
          phase = 'done';
          setState('ok', 'Micro OK ! ' + (App.PREVIEW ? '' : 'Ton navigateur ne transcrit pas la voix : tu t\'enregistreras et tu t\'évalueras. Pour la transcription, utilise Chrome ou Safari.'));
          return;
        }
        phase = 'sr';
        setState('', 'Super ! Maintenant, touche le micro et dis : « Bonjour Ahouéfa ! »');
        micBtn.innerHTML = App.icon('micFill');
      }

      micBtn.addEventListener('click', function () {
        if (phase === 'level' || phase === 'listening') return;
        if (phase === 'sr' || phase === 'sr-retry') {
          phase = 'listening';
          setState('rec', 'Je t\'écoute…');
          heard.textContent = '';
          listen = App.Speech.listen({ expectedWords: 2, onInterim: function (t) { heard.textContent = '« ' + t + ' »'; } });
          listen.promise.then(function (r) {
            listen = null;
            var t = r.transcripts[0] || '';
            heard.textContent = '« ' + t + ' »';
            phase = 'done';
            Store.update(function (s) { s.settings.srOkAt = Date.now(); });
            setState('ok', 'Je t\'ai bien compris ! Tout est prêt.');
            App.Mascot.setMood(inner, 'celebrate');
            App.Sound.play('correct');
          }).catch(function (err) {
            listen = null;
            phase = 'sr-retry';
            var e = err && err.error;
            if (e === 'network') setState('ko', 'La transcription a besoin d\'Internet. Sans connexion, tu t\'enregistreras et tu t\'évalueras.');
            else if (e === 'not-allowed' || e === 'service-not-allowed') setState('ko', 'La reconnaissance vocale est bloquée. Autorise-la dans ton navigateur, ou continue : tu t\'évalueras toi-même.');
            else setState('ko', 'Je n\'ai rien compris. Retouche le micro et parle près du téléphone.');
            App.Mascot.setMood(inner, 'sad');
          });
          return;
        }
        // Phase 1 : niveau sonore
        phase = 'level';
        best = 0;
        setState('rec', 'Je t\'écoute… dis quelques mots');
        App.Mascot.setMood(inner, 'think');
        session = App.Speech.session({
          transcribe: false, record: false,
          onLevel: function (rms) {
            best = Math.max(best, rms);
            var lvl = U.clamp(rms * 9, 0, 1);
            bars.forEach(function (b, k) { b.style.height = Math.round(6 + lvl * 34 * (0.5 + 0.5 * Math.abs(Math.sin(Date.now() / 100 + k)))) + 'px'; });
            if (best > 0.03 && phase === 'level') {
              stopAll();
              idleBars();
              Store.update(function (s) { s.settings.micOkAt = Date.now(); });
              App.Mascot.setMood(inner, 'happy');
              App.Sound.play('correct');
              srPhase();
            }
          }
        });
        session.start().then(function () {
          timer = setTimeout(function () {
            if (phase !== 'level') return;
            stopAll();
            idleBars();
            phase = 'idle';
            setState('ko', 'Je ne t\'ai pas entendu. Vérifie que ton micro n\'est pas coupé, puis réessaie.');
            App.Mascot.setMood(inner, 'sad');
          }, 6000);
        }).catch(function (err) {
          session = null;
          phase = 'idle';
          idleBars();
          setState('ko', App.Speech.errorText(err));
          App.Mascot.setMood(inner, 'sad');
          if (err && /not-allowed|no-mic|unsupported/.test(err.error)) later.textContent = 'Continuer sans micro';
        });
      });
      if (!App.Speech.micSupported()) {
        micBtn.disabled = true;
        setState('', App.Speech.errorText({ error: 'unsupported' }));
        later.textContent = 'Continuer sans micro';
      }
    }

    /* 7. Le plan personnalisé */
    function finalStep() {
      var goal = GOALS.filter(function (g) { return g[0] === data.goal; })[0] || GOALS[1];
      Store.update(function (s) {
        s.profile.name = data.name.trim();
        s.profile.gender = data.gender;
        s.profile.reasons = data.reasons.slice();
        s.profile.feeling = data.feeling;
        s.profile.dailyGoal = data.goal;
        s.settings.reminder = data.reminder;
        if (!data.mic) s.settings.mic = false;
        s.onboarded = true;
      });
      clearDraft();
      App.Sound.play('complete');
      App.UI.confetti(2000);
      var rem = Plan.REMINDERS.filter(function (r) { return r[0] === data.reminder; })[0];
      var list = h('ul.plan-list', null, Plan.bullets(goal[3]).map(function (t) { return h('li', null, [h('span', { html: App.icon('check') }), h('span', { text: t })]); }));
      var extras = h('div.onb-extras');
      if (rem) {
        var cal = h('button.btn.ghost.sm', { type: 'button', html: App.icon('clock') + '<span>Rappel à ' + rem[2] + ' dans mon agenda</span>' });
        cal.addEventListener('click', function () { Plan.addToCalendar(rem[0]); });
        extras.appendChild(cal);
      }
      if (Plan.canInstall()) {
        var inst = h('button.btn.ghost.sm', { type: 'button', html: App.icon('download') + '<span>Installer l\'application</span>' });
        inst.addEventListener('click', Plan.install);
        extras.appendChild(inst);
      }
      body.appendChild(h('div.onb-final', null, [
        App.Mascot.el({ mood: 'celebrate', size: 150 }),
        h('h1', null, ['Ton plan, ', h('span.onb-name', { text: data.name.trim() }), ' !']),
        list,
        extras.children.length ? extras : null
      ]));
      var expert = data.feeling >= 2;
      var go = primary(expert ? 'Trouver mon niveau' : 'Ma première leçon', true, function () { finish(expert ? 'placement' : 'first'); });
      var alt = h('button.btn.flat', { type: 'button', text: expert ? 'Commencer au début' : 'Voir mon parcours' });
      alt.addEventListener('click', function () { finish(expert ? 'first' : 'path'); });
      footer(go, alt);
    }

    function finish(action) {
      if (cleanup) { cleanup(); cleanup = null; }
      releaseBack();
      clearDraft();
      root.remove();
      document.body.style.overflow = '';
      if (appEl) { appEl.inert = false; appEl.removeAttribute('aria-hidden'); }
      onDone(action);
    }

    render();
  }

  App.Onboarding = { run: run };
})(window.App = window.App || {});

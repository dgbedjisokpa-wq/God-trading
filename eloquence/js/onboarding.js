/* Premier lancement : Ahouéfa se présente et personnalise le parcours. */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Store = App.Store;

  var REASONS = [
    ['💼', 'Réussir mes entretiens et ma carrière'],
    ['🎓', 'Briller à mes examens et oraux'],
    ['💪', 'Prendre confiance en moi'],
    ['🎤', 'Parler devant un public'],
    ['🤝', 'Mieux convaincre au quotidien'],
    ['✨', 'Juste pour progresser']
  ];
  var FEELINGS = [
    ['😰', 'Très stressé(e)', 'Je tremble rien que d\'y penser', 'Alors on va commencer tout doux, avec la respiration et le trac. Tu verras, ça change tout.'],
    ['😬', 'Un peu nerveux(se)', 'Ça dépend des situations', 'C\'est tout à fait normal ! On va transformer ce stress en énergie.'],
    ['🙂', 'Plutôt à l\'aise', 'Mais je peux mieux faire', 'Super base ! On va affiner ta clarté, ta voix et ton impact.'],
    ['😎', 'À l\'aise, je veux exceller', 'Je vise le niveau supérieur', 'J\'adore ! Tu pourras sauter les premières unités avec un test de niveau.']
  ];
  var GOALS = [
    [10, 'Détente', '5 min par jour'],
    [20, 'Normal', '10 min par jour'],
    [30, 'Sérieux', '15 min par jour'],
    [50, 'Intense', '20 min par jour']
  ];

  function run(onDone) {
    var data = { name: '', reason: '', feeling: -1, goal: 20 };
    var stepIdx = 0;
    var root = h('div.onb');
    var top = h('div.onb-top');
    var back = h('button.icon-btn', { type: 'button', 'aria-label': 'Retour', html: App.icon('back') });
    var bar = h('i');
    var prog = h('div.lesson-progress', null, bar);
    top.appendChild(back); top.appendChild(prog);
    var body = h('div.onb-body');
    var footIn = h('div.lesson-foot-in');
    var foot = h('div.lesson-foot', null, footIn);
    root.appendChild(top); root.appendChild(body); root.appendChild(foot);
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';

    back.addEventListener('click', function () { if (stepIdx > 0) { stepIdx--; render(); } });

    var steps = [hero, nameStep, reasonStep, feelingStep, goalStep, micStep, finalStep];

    function render() {
      U.clear(body); U.clear(footIn);
      var showTop = stepIdx > 0 && stepIdx < steps.length - 1;
      top.style.visibility = showTop ? 'visible' : 'hidden';
      bar.style.width = Math.round(stepIdx / (steps.length - 1) * 100) + '%';
      foot.style.display = stepIdx === 0 ? 'none' : '';
      steps[stepIdx]();
      body.scrollTop = 0;
    }
    function next() { App.Sound.play('tap'); stepIdx++; render(); }
    function continueBtn(enabled, label, onClick) {
      var b = h('button.btn', { type: 'button', text: label || 'Continuer' });
      b.disabled = !enabled;
      b.addEventListener('click', onClick || next);
      footIn.appendChild(h('span'));
      footIn.appendChild(b);
      return b;
    }
    function says(text, mood) {
      return App.Mascot.says(text, { mood: mood || 'talk', size: 96, after: 'idle' });
    }

    function hero() {
      var imp = h('input', { type: 'file', accept: 'application/json,.json', class: 'hidden' });
      imp.addEventListener('change', function () {
        var f = imp.files && imp.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          try {
            Store.importJSON(rd.result);
            Store.update(function (s) { s.onboarded = true; });
            finish(false);
          } catch (e) { App.UI.toast('Fichier invalide.', 'alert'); }
        };
        rd.readAsText(f);
      });
      var go = h('button.btn.block', { type: 'button', text: 'C\'est parti !' });
      go.addEventListener('click', function () { App.Sound.unlock(); next(); });
      var have = h('button.btn.ghost.block', { type: 'button', text: 'J\'ai une sauvegarde' });
      have.addEventListener('click', function () { imp.click(); });
      body.appendChild(h('div.onb-hero', null, [
        App.Mascot.el({ mood: 'wave', size: 200 }),
        h('h1', { text: 'Bonjour ! Moi, c\'est Ahouéfa.' }),
        h('p', { text: 'Je vais t\'aider à parler avec clarté, confiance et impact. Cinq minutes par jour suffisent.' }),
        h('div.btns', null, [go, have, imp])
      ]));
      setTimeout(function () { go.focus(); }, 50);
    }

    function nameStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Comment veux-tu que je t\'appelle ?'));
      var input = h('input.input', { id: 'onb-name', value: data.name, maxlength: '30', autocomplete: 'given-name', placeholder: 'Ton prénom', 'aria-label': 'Ton prénom' });
      inner.appendChild(input);
      body.appendChild(inner);
      var b = continueBtn(!!data.name.trim());
      input.addEventListener('input', function () { data.name = input.value; b.disabled = !input.value.trim(); });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && input.value.trim()) next(); });
      setTimeout(function () { input.focus(); }, 60);
    }

    function optionList(items, isSel, onPick) {
      var list = h('div.choices', { role: 'radiogroup' });
      items.forEach(function (it, i) {
        var b = h('button.choice' + (isSel(i) ? '.sel' : ''), { type: 'button', role: 'radio', 'aria-checked': isSel(i) ? 'true' : 'false' }, [
          h('span.opt-icon', { text: it[0], 'aria-hidden': 'true' }),
          h('span.grow', null, [it[1], it[2] ? h('span.sub', { text: it[2] }) : null])
        ]);
        b.addEventListener('click', function () {
          onPick(i);
          U.$$('.choice', list).forEach(function (x, k) { x.classList.toggle('sel', k === i); x.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
          App.Sound.play('tap');
        });
        list.appendChild(b);
      });
      return list;
    }

    function reasonStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Enchantée, ' + data.name.trim() + ' ! Pourquoi veux-tu mieux t\'exprimer ?', 'happy'));
      var b;
      inner.appendChild(optionList(REASONS, function (i) { return data.reason === REASONS[i][1]; }, function (i) { data.reason = REASONS[i][1]; b.disabled = false; }));
      body.appendChild(inner);
      b = continueBtn(!!data.reason);
    }

    function feelingStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Comment te sens-tu quand tu prends la parole ?', 'think'));
      var b;
      inner.appendChild(optionList(FEELINGS.map(function (f) { return [f[0], f[1], f[2]]; }), function (i) { return data.feeling === i; }, function (i) { data.feeling = i; b.disabled = false; }));
      body.appendChild(inner);
      b = continueBtn(data.feeling >= 0);
    }

    function goalStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says(FEELINGS[data.feeling][3] + ' Quel objectif quotidien te convient ?', 'happy'));
      inner.appendChild(optionList(GOALS.map(function (g) { return ['🎯', g[1], g[2] + ' · ' + g[0] + ' XP'] }), function (i) { return data.goal === GOALS[i][0]; }, function (i) { data.goal = GOALS[i][0]; }));
      body.appendChild(inner);
      continueBtn(true);
    }

    function micStep() {
      var inner = h('div.onb-inner');
      inner.appendChild(says('Pour les exercices de parole, j\'ai besoin de t\'entendre. Tes enregistrements restent sur ton appareil ; pour transcrire ta voix, ton navigateur peut utiliser son service de reconnaissance vocale en ligne.', 'talk'));
      var meter = h('div.level-meter', { style: { justifyContent: 'center' } });
      var bars = [];
      for (var i = 0; i < 20; i++) { var bb = h('i'); bars.push(bb); meter.appendChild(bb); }
      var msg = h('p.center', { style: { fontWeight: 800 }, text: '' });
      var test = h('button.btn', { type: 'button', html: App.icon('micFill') + '<span>Tester mon micro</span>' });
      var session = null, best = 0;
      test.addEventListener('click', function () {
        if (session) return;
        test.disabled = true;
        msg.textContent = 'Dis quelques mots…';
        session = App.Speech.session({
          transcribe: false, record: false,
          onLevel: function (rms) {
            best = Math.max(best, rms);
            var lvl = U.clamp(rms * 9, 0, 1);
            bars.forEach(function (b, k) { b.style.height = Math.round(6 + lvl * 38 * (0.5 + 0.5 * Math.abs(Math.sin(Date.now() / 100 + k)))) + 'px'; });
            if (best > 0.03) { msg.textContent = 'Parfait, je t\'entends très bien !'; App.Mascot.setMood(inner, 'happy'); }
          }
        });
        session.start().then(function () {
          setTimeout(function () { if (session) { session.cancel(); session = null; } test.disabled = false; }, 6000);
        }).catch(function (err) {
          session = null;
          test.disabled = false;
          msg.textContent = App.Speech.errorText(err) + ' Tu pourras activer le micro plus tard.';
        });
      });
      if (!App.Speech.micSupported()) {
        test.disabled = true;
        msg.textContent = 'Le micro n\'est pas accessible ici (il faut une adresse en https). Tu pourras quand même faire les exercices à voix haute.';
      }
      inner.appendChild(h('div.card.center', { style: { display: 'grid', gap: '14px', justifyItems: 'center' } }, [meter, test, msg]));
      if (!App.Speech.srSupported()) {
        inner.appendChild(h('div.alert', { html: App.icon('bulb') + '<span>Astuce : pour la reconnaissance vocale complète, utilise Google Chrome ou Safari.</span>' }));
      }
      body.appendChild(inner);
      continueBtn(true, 'Continuer', function () { if (session) { session.cancel(); session = null; } next(); });
    }

    function finalStep() {
      Store.update(function (s) {
        s.profile.name = data.name.trim();
        s.profile.reason = data.reason;
        s.profile.feeling = FEELINGS[data.feeling] ? FEELINGS[data.feeling][1] : '';
        s.profile.dailyGoal = data.goal;
        s.onboarded = true;
      });
      App.Sound.play('complete');
      App.UI.confetti(2000);
      body.appendChild(h('div.onb-hero', null, [
        App.Mascot.el({ mood: 'celebrate', size: 200 }),
        h('h1', { text: 'Parfait, ' + data.name.trim() + ' !' }),
        h('p', { text: 'Ton parcours est prêt : 10 unités, 50 leçons et des dizaines d\'exercices pour devenir un orateur ou une oratrice hors pair.' })
      ]));
      var later = h('button.btn.flat', { type: 'button', text: 'Voir mon parcours' });
      later.addEventListener('click', function () { finish(false); });
      var go = h('button.btn', { type: 'button', text: 'Ma première leçon' });
      go.addEventListener('click', function () { finish(true); });
      footIn.appendChild(later);
      footIn.appendChild(go);
      setTimeout(function () { go.focus(); }, 60);
    }

    function finish(startFirst) {
      root.remove();
      document.body.style.overflow = '';
      onDone(startFirst);
    }

    render();
  }

  App.Onboarding = { run: run };
})(window.App = window.App || {});

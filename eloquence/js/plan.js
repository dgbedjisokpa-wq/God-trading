/* Accompagnement personnalisé : objectifs et recommandations, bilans vocaux
   (départ, mi-parcours, final), diplôme de fin de parcours, rappel quotidien,
   installation sur l'écran d'accueil. */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Store = App.Store;
  var Plan = {};

  /* ---------- Objectifs ---------- */
  Plan.REASONS = [
    { key: 'carriere', label: 'Réussir mes entretiens et ma carrière', icon: 'briefcase', color: '#1CB0F6', tools: ['entretien', 'studio'], lessons: ['u10l3', 'u10l2'], tip: 'Prépare tes réponses d\'entretien à voix haute' },
    { key: 'etudes', label: 'Briller à mes examens et oraux', icon: 'bookFill', color: '#8A3FFC', tools: ['lecture', 'impro'], lessons: ['u5l2', 'u10l5'], tip: 'Structure tes réponses avec la méthode PREP' },
    { key: 'confiance', label: 'Prendre confiance en moi', icon: 'star', color: '#E5A400', tools: ['respiration', 'miroir'], lessons: ['u1l5', 'u1l2'], tip: 'Apprivoise ton trac par la respiration' },
    { key: 'public', label: 'Parler devant un public', icon: 'micFill', color: '#FF4B91', tools: ['studio', 'miroir'], lessons: ['u10l1', 'u10l4'], tip: 'Travaille ta voix et ton langage corporel' },
    { key: 'convaincre', label: 'Mieux convaincre au quotidien', icon: 'scale', color: '#3E9102', tools: ['debat', 'impro'], lessons: ['u6l1', 'u6l4'], tip: 'Apprends les leviers de la persuasion' },
    { key: 'progresser', label: 'Juste pour progresser', icon: 'sparkle', color: '#FF9600', tools: ['impro', 'virelangues'], lessons: [], tip: 'Un peu chaque jour, c\'est le secret' }
  ];
  Plan.FEELINGS = [
    { emoji: '😰', label: 'Très stressé(e)', f: 'Très stressée', m: 'Très stressé', sub: 'Je tremble rien que d\'y penser', reply: 'Alors on va commencer tout doux, avec la respiration et le trac. Tu verras, ça change tout.', mood: 'sad' },
    { emoji: '😬', label: 'Un peu nerveux(se)', f: 'Un peu nerveuse', m: 'Un peu nerveux', sub: 'Ça dépend des situations', reply: 'C\'est tout à fait normal ! On va transformer ce stress en énergie.', mood: 'think' },
    { emoji: '🙂', label: 'Plutôt à l\'aise', sub: 'Mais je peux mieux faire', reply: 'Super base ! On va affiner ta clarté, ta voix et ton impact.', mood: 'happy' },
    { emoji: '😎', label: 'À l\'aise, je veux exceller', sub: 'Je vise le niveau supérieur', reply: 'J\'adore ! Tu peux passer un test de niveau pour commencer plus loin.', mood: 'celebrate' }
  ];
  Plan.feelingLabel = function (f) { return U.g(f.m || f.label, f.f || f.label, f.label); };

  Plan.reasons = function () {
    var keys = Store.get().profile.reasons || [];
    return Plan.REASONS.filter(function (r) { return keys.indexOf(r.key) >= 0; });
  };
  Plan.recommendedTools = function () {
    var out = [];
    Plan.reasons().forEach(function (r) { r.tools.forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); }); });
    if (Store.get().profile.feeling === 0 && out.indexOf('respiration') < 0) out.unshift('respiration');
    return out;
  };

  /* Les 3 à 4 phrases de « Ton plan » à la fin de l'accueil */
  Plan.bullets = function (goalMinutes) {
    var s = Store.get(), b = [];
    var rs = Plan.reasons();
    b.push((goalMinutes || 10) + ' minutes par jour, à ton rythme, ' + U.g('guidé', 'guidée', 'guidé(e)') + ' par Ahouéfa.');
    rs.slice(0, 2).forEach(function (r) { b.push(r.tip + '.'); });
    if (s.profile.feeling === 0) b.push('Avant chaque exercice de parole : une minute de respiration.');
    b.push('Un bilan vocal au départ, à mi-parcours et à la fin pour mesurer tes progrès.');
    return b;
  };

  /* ---------- Bilans vocaux ---------- */
  Plan.ASSESS = {
    depart: { title: 'Ton bilan de départ', short: 'Bilan de départ', desc: 'Présente-toi pendant 45 secondes. Je mesure ton point de départ : débit, tics, pauses, mélodie.', topic: 'Présente-toi : qui tu es, ce que tu fais, et ce que tu aimerais améliorer quand tu parles.' },
    milieu: { title: 'Ton bilan de mi-parcours', short: 'Bilan de mi-parcours', desc: 'Tu as fini la moitié du parcours ! Refais le même exercice pour voir le chemin parcouru.', topic: 'Présente-toi à nouveau : qui tu es, ce que tu as appris, et ce que tu veux encore améliorer.' },
    final: { title: 'Ton bilan final', short: 'Bilan final', desc: 'Dernier enregistrement, puis ton diplôme ! Compare avec ton tout premier bilan.', topic: 'Présente-toi comme un(e) pro : qui tu es, ce que tu as accompli, et ce que tu vises maintenant.' }
  };
  Plan.dueAssessment = function () {
    var s = Store.get();
    if (!s.onboarded) return null;
    var C = App.Course;
    if (C.unitDone(C.units[9])) return Store.assessment('final') ? null : 'final';
    if (!Store.assessment('depart')) return 'depart';
    if (C.unitDone(C.units[4]) && !Store.assessment('milieu') && !C.unitDone(C.units[9])) return 'milieu';
    return null;
  };
  Plan.assessmentStep = function (kind) {
    var a = Plan.ASSESS[kind];
    return {
      type: 'free', prompt: a.title, topic: a.topic.replace('un(e) pro', U.g('un pro', 'une pro', 'un(e) pro')),
      prep: 20, duration: 45, focus: 'general', assessment: kind,
      tips: ['Qui tu es', 'Ce que tu fais ou as fait', 'Ce que tu veux améliorer']
    };
  };
  Plan.startAssessment = function (kind) {
    App.Lesson.start({
      id: null, kind: 'practice', title: Plan.ASSESS[kind].title, steps: [Plan.assessmentStep(kind)], xp: 15,
      unit: { color: '#8A3FFC', dark: '#6929C4' },
      onExit: function (done) {
        App.render();
        if (done && kind === 'final' && Plan.diplomaEarned()) setTimeout(Plan.showDiploma, 400);
      }
    });
  };

  /* Comparaison entre deux bilans : lignes {label, before, after, better} */
  Plan.compare = function (a, b) {
    var rows = [];
    function row(label, x, y, unit, higherIsBetter, fmt) {
      if (typeof x !== 'number' || typeof y !== 'number') return;
      var better = higherIsBetter === null ? null : (higherIsBetter ? y > x : y < x);
      rows.push({ label: label, before: (fmt || U.num)(x) + unit, after: (fmt || U.num)(y) + unit, better: x === y ? null : better });
    }
    row('Note globale', a.score, b.score, '/100', true);
    row('Tics par minute', a.fpm, b.fpm, '', false);
    row('Mélodie de la voix', a.pitch, b.pitch, ' demi-tons', true);
    if (typeof a.wpm === 'number' && typeof b.wpm === 'number') {
      // Le débit idéal est une zone : on se rapproche de 145 mots/min
      var da = Math.abs(a.wpm - 145), db = Math.abs(b.wpm - 145);
      rows.push({ label: 'Débit', before: a.wpm + ' mots/min', after: b.wpm + ' mots/min', better: da === db ? null : db < da });
    }
    return rows;
  };
  Plan.compareTable = function (a, b, labels) {
    var rows = Plan.compare(a, b);
    if (!rows.length) return null;
    var t = h('div.compare');
    t.appendChild(h('div.compare-head', null, [h('span'), h('span', { text: labels ? labels[0] : 'Avant' }), h('span', { text: labels ? labels[1] : 'Maintenant' })]));
    rows.forEach(function (r) {
      t.appendChild(h('div.compare-row' + (r.better === true ? '.up' : r.better === false ? '.down' : ''), null, [
        h('span.k', { text: r.label }), h('span.v', { text: r.before }),
        h('span.v.now', { html: U.esc(r.after) + (r.better === true ? App.icon('check') : '') })
      ]));
    });
    return t;
  };

  /* ---------- Diplôme ---------- */
  Plan.diplomaEarned = function () {
    return App.Course.units.every(App.Course.unitDone);
  };
  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }
  Plan.drawDiploma = function () {
    var s = Store.get();
    var W = 1600, H = 1130;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var svg = App.Mascot.svg({ mood: 'celebrate', size: 300, label: false });
    var mascotSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.all([loadImage(mascotSrc), fontsReady]).then(function (res) {
      var img = res[0];
      var F = '"Nunito", "Segoe UI", Arial, sans-serif';
      // Fond et cadre
      c.fillStyle = '#FFFDF7'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#8A3FFC'; c.lineWidth = 26; c.strokeRect(30, 30, W - 60, H - 60);
      c.strokeStyle = '#FFC800'; c.lineWidth = 6; c.strokeRect(70, 70, W - 140, H - 140);
      // Pois dorés, comme le foulard d'Ahouéfa
      c.fillStyle = 'rgba(255, 200, 0, .55)';
      for (var i = 0; i < 26; i++) {
        var x = 110 + (i * 57) % (W - 220), y = i % 2 ? 110 : H - 110;
        c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
      }
      c.textAlign = 'center';
      c.fillStyle = '#6929C4';
      c.font = '900 34px ' + F;
      c.fillText('AHOUÉFA · COACH D\'ÉLOQUENCE', W / 2, 190);
      c.fillStyle = '#3B2E4A';
      c.font = '900 92px ' + F;
      c.fillText('Diplôme d\'éloquence', W / 2, 310);
      c.font = '700 38px ' + F;
      c.fillStyle = '#75698A';
      c.fillText('décerné à', W / 2, 390);
      c.fillStyle = '#8A3FFC';
      c.font = '900 110px ' + F;
      var name = (s.profile.name || U.g('Orateur', 'Oratrice')).slice(0, 26);
      c.fillText(name, W / 2, 510);
      c.fillStyle = '#3B2E4A';
      c.font = '700 36px ' + F;
      c.fillText('pour avoir terminé les 10 unités du parcours :', W / 2, 590);
      c.fillText('souffle, diction, rhétorique, récit, improvisation, voix et prise de parole.', W / 2, 640);
      var bits = [s.xp.total + ' XP', U.plural(s.stats.lessons, 'leçon'), s.stats.speeches + ' discours analysé' + (s.stats.speeches > 1 ? 's' : ''), 'série record : ' + U.plural(s.streak.best, 'jour')];
      c.font = '800 32px ' + F;
      c.fillStyle = '#6929C4';
      c.fillText(bits.join('  ·  '), W / 2, 720);
      var a = Store.assessment('depart'), f = Store.assessment('final');
      if (a && f && typeof a.score === 'number' && typeof f.score === 'number') {
        c.fillStyle = '#3D8B00';
        c.fillText('Note au bilan : ' + a.score + '/100 au départ → ' + f.score + '/100 à la fin', W / 2, 775);
      }
      var d = s.diploma && s.diploma.at ? new Date(s.diploma.at) : new Date();
      c.fillStyle = '#75698A';
      c.font = '700 30px ' + F;
      c.textAlign = 'left';
      c.fillText('Le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 150, H - 170);
      c.textAlign = 'right';
      c.fillStyle = '#3B2E4A';
      c.font = 'italic 800 40px ' + F;
      c.fillText('Ahouéfa', W - 380, H - 175);
      c.font = '700 26px ' + F;
      c.fillStyle = '#75698A';
      c.fillText('ta coach d\'éloquence', W - 380, H - 135);
      // Sceau
      c.save();
      c.translate(W - 250, H - 230);
      c.fillStyle = '#FFC800';
      for (var k = 0; k < 24; k++) { c.rotate(Math.PI / 12); c.fillRect(-8, -95, 16, 22); }
      c.beginPath(); c.arc(0, 0, 82, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E5A400'; c.beginPath(); c.arc(0, 0, 64, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '900 30px ' + F;
      c.fillText('10/10', 0, 10);
      c.restore();
      if (img) c.drawImage(img, 120, H - 470, 230, 276);
      return cv;
    });
  };
  Plan.showDiploma = function () {
    if (!Plan.diplomaEarned()) return;
    Store.update(function (s) { if (!s.diploma) s.diploma = { at: Date.now() }; });
    Plan.drawDiploma().then(function (cv) {
      var img = h('img.diploma-img', { src: cv.toDataURL('image/png'), alt: 'Ton diplôme d\'éloquence' });
      var actions = [];
      if (!App.PREVIEW) {
        actions.push({ label: 'Télécharger', onClick: function () {
          cv.toBlob(function (blob) {
            if (!blob) return;
            var a = h('a', { href: URL.createObjectURL(blob), download: 'diplome-eloquence-ahouefa.png' });
            document.body.appendChild(a); a.click(); a.remove();
          });
          return true;
        } });
        if (navigator.canShare) {
          actions.push({ label: 'Partager', cls: 'ghost', onClick: function () {
            cv.toBlob(function (blob) {
              var file = new File([blob], 'diplome-eloquence.png', { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'Mon diplôme d\'éloquence', text: 'J\'ai terminé le parcours d\'éloquence avec Ahouéfa !' }).catch(function () { /* annulé */ });
            });
            return true;
          } });
        }
      }
      actions.push({ label: 'Fermer', cls: 'flat' });
      App.UI.confetti(2500);
      App.Sound.play('complete');
      App.UI.modal({ title: 'Félicitations !', body: h('div', null, [img, h('p', { text: 'Tu as terminé tout le parcours. Ton diplôme t\'attend aussi dans ton profil.' })]), wide: true, actions: actions });
    });
  };

  /* ---------- Rappel quotidien (fichier d'agenda .ics) ---------- */
  Plan.REMINDERS = [['08:00', 'Le matin', '8 h'], ['12:30', 'À midi', '12 h 30'], ['19:00', 'Le soir', '19 h'], ['21:00', 'Avant de dormir', '21 h']];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  Plan.ics = function (time) {
    var p = time.split(':');
    var d = new Date();
    d.setDate(d.getDate() + 1);
    var day = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var now = new Date();
    var stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + '00Z';
    var url = location.href.split('#')[0];
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ahouefa//Eloquence//FR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:ahouefa-rappel-' + now.getTime() + '@ahouefa', 'DTSTAMP:' + stamp,
      'DTSTART:' + day + 'T' + pad(+p[0]) + pad(+p[1]) + '00', 'DURATION:PT10M', 'RRULE:FREQ=DAILY',
      'SUMMARY:Séance d\'éloquence avec Ahouéfa', 'DESCRIPTION:5 à 10 minutes pour garder ta série ! ' + url, 'URL:' + url,
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:C\'est l\'heure de ta séance avec Ahouéfa !', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  };
  Plan.addToCalendar = function (time) {
    if (App.PREVIEW) { App.UI.toast('L\'ajout à l\'agenda fonctionne dans l\'application en ligne.', 'clock', 3500); return; }
    var blob = new Blob([Plan.ics(time)], { type: 'text/calendar;charset=utf-8' });
    var a = h('a', { href: URL.createObjectURL(blob), download: 'rappel-ahouefa.ics' });
    document.body.appendChild(a); a.click(); a.remove();
    App.UI.toast('Ouvre le fichier pour ajouter le rappel à ton agenda.', 'clock', 4000);
  };

  /* ---------- Installation sur l'écran d'accueil ---------- */
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; });
  Plan.isStandalone = function () {
    return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  };
  Plan.isIOS = function () { return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; };
  Plan.canInstall = function () { return !App.PREVIEW && !Plan.isStandalone() && (!!installEvt || Plan.isIOS()); };
  Plan.install = function () {
    if (installEvt) {
      installEvt.prompt();
      installEvt.userChoice.then(function (r) { if (r && r.outcome === 'accepted') App.UI.toast('Ahouéfa est sur ton écran d\'accueil !', 'check'); installEvt = null; });
      return;
    }
    App.UI.modal({
      title: 'Installer sur iPhone',
      body: '<p>Dans Safari, touche le bouton <strong>Partager</strong> (le carré avec une flèche), puis <strong>Sur l\'écran d\'accueil</strong>.</p>',
      mascot: 'happy', actions: [{ label: 'Compris !' }]
    });
  };

  App.Plan = Plan;
})(window.App = window.App || {});

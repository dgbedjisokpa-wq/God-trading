/* Test de bout en bout dans Chromium (Playwright) : accueil, leçon complète,
   pages, entraînement avec analyse de la voix, respiration.
   La reconnaissance vocale est simulée ; le micro est un micro factice de Chromium.
   Lancer : node eloquence/tests/e2e.test.js   (Playwright doit être installé)
   Captures d'écran : dossier $SHOTS (par défaut, dossier temporaire du système). */
'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  console.error('Playwright est requis : npm i -D playwright (ou NODE_PATH vers une installation globale).');
  process.exit(2);
}

var ROOT = path.join(__dirname, '..');
var SHOTS = process.env.SHOTS || path.join(os.tmpdir(), 'ahouefa-shots');
fs.mkdirSync(SHOTS, { recursive: true });
var TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise(function (resolve) {
    var srv = http.createServer(function (req, res) {
      var p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      var f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', function () { resolve(srv); });
  });
}

/* Reconnaissance vocale simulée : renvoie le texte de window.__say */
var MOCK_SR = function () {
  function MockSR() { this.continuous = false; this.interimResults = false; this.lang = 'fr-FR'; this.maxAlternatives = 1; this._on = false; }
  MockSR.prototype.start = function () {
    if (this._on) throw new Error('already started');
    var self = this; self._on = true;
    var text = window.__say || '';
    setTimeout(function () {
      if (!self._on) return;
      if (!text) { if (self.onerror) self.onerror({ error: 'no-speech' }); self._end(); return; }
      var r = [{ transcript: text, confidence: 0.92 }]; r.isFinal = true;
      if (self.onresult) self.onresult({ resultIndex: 0, results: [r] });
      setTimeout(function () { self._end(); }, 300);
    }, 300);
  };
  MockSR.prototype._end = function () { if (!this._on) return; this._on = false; if (this.onend) this.onend(); };
  MockSR.prototype.stop = function () { var s = this; setTimeout(function () { s._end(); }, 50); };
  MockSR.prototype.abort = function () { this._end(); };
  window.SpeechRecognition = MockSR;
  window.webkitSpeechRecognition = MockSR;
};

var errors = [];
var passed = 0;
function ok(cond, msg) { if (!cond) throw new Error('Échec : ' + msg); passed++; }

async function newPage(browser, w, h, state) {
  var ctx = await browser.newContext({ viewport: { width: w, height: h }, permissions: ['microphone', 'camera'] });
  var page = await ctx.newPage();
  page.on('console', function (m) { if (m.type() === 'error') errors.push(w + 'px console: ' + m.text()); });
  page.on('pageerror', function (e) { errors.push(w + 'px pageerror: ' + e.message); });
  await page.addInitScript(MOCK_SR);
  if (state) await page.addInitScript(function (s) { if (!localStorage.getItem('ahouefa-eloquence-v1')) localStorage.setItem('ahouefa-eloquence-v1', s); }, state);
  return page;
}

/* Joue l'exercice en cours correctement, à partir de l'état exposé par l'application */
async function playStep(page) {
  var step = await page.evaluate(function () { var a = App.Lesson.active(); return a ? a.step() : null; });
  if (!step) return false;
  var foot = page.locator('.lesson-foot');
  async function verifyAndContinue() {
    await foot.getByRole('button', { name: 'Vérifier' }).click();
    await foot.locator('.feedback').waitFor();
    var ko = await page.locator('.lesson-foot.ko').count();
    ok(ko === 0, 'réponse jugée fausse pour ' + step.type + ' : ' + (step.prompt || step.statement || ''));
    await foot.getByRole('button', { name: 'Continuer' }).click();
  }
  switch (step.type) {
    case 'info':
      await foot.getByRole('button', { name: 'Continuer' }).click();
      break;
    case 'mcq':
      await page.locator('.choices .choice').nth(step.answer).click();
      await verifyAndContinue();
      break;
    case 'tf':
      await page.locator('.choices .choice').nth(step.answer ? 0 : 1).click();
      await verifyAndContinue();
      break;
    case 'fill':
      await page.locator('.chips .chip', { hasText: step.answer }).first().click();
      await verifyAndContinue();
      break;
    case 'order':
      for (var i = 0; i < step.items.length; i++) {
        await page.locator('.step > .chips .chip:not(.used)', { hasText: step.items[i] }).first().click();
      }
      await verifyAndContinue();
      break;
    case 'match':
      for (var j = 0; j < step.pairs.length; j++) {
        await page.locator('.match .col').nth(0).locator('.choice:not(.done)', { hasText: step.pairs[j][0] }).first().click();
        await page.locator('.match .col').nth(1).locator('.choice:not(.done)', { hasText: step.pairs[j][1] }).first().click();
        await page.waitForTimeout(320);
      }
      await foot.locator('.feedback').waitFor();
      ok(await page.locator('.lesson-foot.ok').count() === 1, 'paires sans faute');
      await foot.getByRole('button', { name: 'Continuer' }).click();
      break;
    case 'tap':
      var targets = (step.text.match(/\[([^\]]+)\]/g) || []).map(function (t) { return t.slice(1, -1); });
      for (var k = 0; k < targets.length; k++) {
        await page.locator('.tw:not(.sel)', { hasText: new RegExp('^' + targets[k].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).first().click();
      }
      await verifyAndContinue();
      break;
    case 'speak':
      await page.evaluate(function (t) { window.__say = t.replace(/\/\/?/g, ''); }, step.text);
      await page.locator('.mic-btn').click();
      await foot.locator('.feedback').waitFor({ timeout: 8000 });
      ok(await page.locator('.lesson-foot.ok').count() === 1, 'phrase reconnue : ' + step.text);
      await foot.getByRole('button', { name: 'Continuer' }).click();
      break;
    case 'voice':
      await page.locator('.mic-btn').click();
      await page.waitForTimeout(1500);
      await page.locator('.mic-btn').click();
      await page.locator('.self-rate .choice').nth(1).click();
      await foot.getByRole('button', { name: 'Continuer' }).click();
      break;
    case 'timed':
      await page.locator('.lesson').getByRole('button', { name: 'Commencer', exact: true }).click();
      for (var s = 0; s < step.steps.length; s++) {
        var nb = page.getByRole('button', { name: 'Étape suivante' });
        if (await nb.isVisible()) await nb.click();
      }
      await foot.getByRole('button', { name: 'Continuer' }).click();
      break;
    case 'breath':
      // La respiration est testée à part (horloge accélérée) : ici on passe
      await foot.getByRole('button', { name: 'Passer' }).click();
      break;
    case 'free':
      await page.evaluate(function () {
        window.__say = 'Bonjour à tous. Aujourd\'hui je vais vous parler d\'un sujet passionnant. En fait c\'est une idée simple. ' +
          'Chaque jour nous parlons, pour convaincre, pour expliquer et pour partager. Du coup il faut apprendre à bien parler. ' +
          'Premièrement la clarté, deuxièmement la voix, troisièmement les pauses. Voilà pourquoi je vous invite à pratiquer.';
      });
      var start = page.locator('.step .btn', { hasText: /Préparer|Je commence/ });
      await start.click();
      var ready = page.getByRole('button', { name: /^Je suis prêt/ });
      if (await ready.count()) await ready.click();
      await page.getByRole('button', { name: 'Terminer' }).waitFor();
      await page.waitForTimeout(8500);
      await page.getByRole('button', { name: 'Terminer' }).click();
      await page.locator('.report-head, .seg').first().waitFor({ timeout: 8000 });
      await foot.getByRole('button', { name: 'Continuer' }).click();
      break;
    default:
      throw new Error('type inattendu ' + step.type);
  }
  return true;
}

async function playLesson(page, shotPrefix) {
  var n = 0;
  while (await page.locator('.lesson').count()) {
    if (shotPrefix && n < 40) await page.waitForTimeout(450);
    if (shotPrefix && n < 40) await page.screenshot({ path: path.join(SHOTS, shotPrefix + '-' + String(n).padStart(2, '0') + '.png') });
    var more = await playStep(page);
    if (!more) break;
    n++;
    if (n > 60) throw new Error('Leçon infinie ?');
  }
  return n;
}

async function finishScreens(page, shotPrefix) {
  var i = 0;
  while (await page.locator('.screen').count()) {
    if (shotPrefix) { await page.waitForTimeout(600); await page.screenshot({ path: path.join(SHOTS, shotPrefix + '-end' + i + '.png') }); }
    await page.locator('.screen .screen-foot .btn').click();
    await page.waitForTimeout(150);
    i++;
  }
  return i;
}

(async function main() {
  var srv = await serve();
  var base = 'http://127.0.0.1:' + srv.address().port + '/';
  var browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  try {
    /* 1. Accueil personnalisé + première leçon, sur téléphone */
    var page = await newPage(browser, 390, 844);
    await page.goto(base);
    var onbFoot = page.locator('.onb .lesson-foot');
    await page.getByRole('button', { name: 'C\'est parti !' }).click();
    await page.fill('#onb-name', 'Rania');
    await page.getByRole('radio', { name: 'Au féminin' }).click();
    await onbFoot.getByRole('button', { name: 'Continuer' }).click();
    // Motivations : plusieurs choix possibles (on coche, décoche, recoche)
    var boxes = page.locator('.onb [role=checkbox]');
    ok(await boxes.count() === 6, 'six motivations proposées');
    ok(await onbFoot.getByRole('button', { name: 'Continuer' }).isDisabled(), 'au moins une motivation exigée');
    await boxes.nth(0).click();
    await boxes.nth(3).click();
    await boxes.nth(4).click();
    await boxes.nth(3).click();
    ok(await page.locator('.onb [role=checkbox][aria-checked=true]').count() === 2, 'deux motivations cochées');
    await page.screenshot({ path: path.join(SHOTS, 'm-onb-reasons.png') });
    await onbFoot.getByRole('button', { name: 'Continuer' }).click();
    await page.locator('.onb [role=radio]').nth(1).click();
    await onbFoot.getByRole('button', { name: 'Continuer' }).click();
    await page.locator('.onb [role=radio]', { hasText: 'Sérieux' }).click();
    await onbFoot.getByRole('button', { name: 'Continuer' }).click();
    await page.locator('.onb [role=radio]', { hasText: 'Le soir' }).click();
    await onbFoot.getByRole('button', { name: 'Continuer' }).click();
    // Micro : niveau sonore (micro factice de Chromium), puis reconnaissance vocale
    await page.locator('.onb .mic-btn').click();
    await page.locator('.onb-mic-msg', { hasText: 'Bonjour Ahouéfa' }).waitFor({ timeout: 8000 });
    await page.evaluate(function () { window.__say = 'Bonjour Ahouéfa'; });
    await page.locator('.onb .mic-btn').click();
    await page.locator('.onb .mic-btn.ok').waitFor({ timeout: 8000 });
    await page.screenshot({ path: path.join(SHOTS, 'm-onb-mic.png') });
    await onbFoot.getByRole('button', { name: 'Continuer' }).click();
    await page.locator('.onb-final').waitFor();
    ok(await page.locator('.plan-list li').count() >= 3, 'plan personnalisé affiché');
    ok(await page.getByRole('button', { name: /Rappel à 19 h/ }).count() === 1, 'rappel proposé dans l\'agenda');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SHOTS, 'm-onb-plan.png') });
    var prof = await page.evaluate(function () { var s = App.Store.get(); return { p: s.profile, r: s.settings.reminder, mic: s.settings.micOkAt, sr: s.settings.srOkAt }; });
    ok(prof.p.name === 'Rania' && prof.p.gender === 'f', 'prénom et accord enregistrés');
    ok(JSON.stringify(prof.p.reasons) === '["carriere","convaincre"]', 'motivations enregistrées : ' + prof.p.reasons);
    ok(prof.p.feeling === 1 && prof.p.dailyGoal === 30 && prof.r === '19:00', 'ressenti, objectif et rappel enregistrés');
    ok(prof.mic > 0 && prof.sr > 0, 'micro et reconnaissance vocale vérifiés');
    await page.getByRole('button', { name: 'Ma première leçon' }).click();
    await page.locator('.lesson').waitFor();
    var steps = await playLesson(page, 'm-u1l1');
    ok(steps >= 7, 'leçon 1 jouée (' + steps + ' étapes)');
    var screens = await finishScreens(page, 'm-u1l1');
    ok(screens >= 2, 'écrans de fin (leçon + série) : ' + screens);
    var st = await page.evaluate(function () { return App.Store.get(); });
    ok(st.progress.u1l1 && st.progress.u1l1.count === 1, 'leçon 1 enregistrée');
    ok(st.streak.count === 1, 'série démarrée');
    ok(st.xp.total >= 15, 'XP gagnés : ' + st.xp.total);
    ok(await page.locator('.node-wrap.is-current').count() === 1, 'nœud courant affiché');
    await page.screenshot({ path: path.join(SHOTS, 'm-path-after.png') });

    /* 1b. Le bouton « retour » du téléphone pendant une leçon demande confirmation */
    await page.evaluate(function () { App.Pages.startLesson('u1l2'); });
    await page.locator('.lesson').waitFor();
    await page.goBack();
    await page.locator('.modal').getByRole('button', { name: 'Continuer la leçon' }).click();
    ok(await page.locator('.lesson').count() === 1, 'retour : la leçon continue');
    await page.goBack();
    await page.locator('.modal').getByRole('button', { name: 'Quitter' }).click();
    ok(await page.locator('.lesson').count() === 0, 'retour puis Quitter : leçon fermée');

    /* 1c. Bilan vocal de départ depuis la carte du parcours */
    await page.locator('.top-card', { hasText: 'bilan de départ' }).getByRole('button', { name: 'Commencer' }).click();
    await page.locator('.lesson').waitFor();
    ok(await page.evaluate(function () { return App.Lesson.active().step().assessment; }) === 'depart', 'exercice du bilan de départ');
    await playLesson(page, 'm-depart');
    await finishScreens(page);
    var dep = await page.evaluate(function () { return App.Store.assessment('depart'); });
    ok(dep && typeof dep.wpm === 'number', 'bilan de départ enregistré : ' + JSON.stringify(dep));
    ok(await page.locator('.top-card', { hasText: 'bilan de départ' }).count() === 0, 'carte du bilan masquée une fois fait');

    /* 2. Toutes les leçons de l'unité 1 puis la révision, avec la parole */
    for (var l = 2; l <= 5; l++) {
      await page.evaluate(function (id) { App.Pages.startLesson(id); }, 'u1l' + l);
      await playLesson(page, l === 2 ? 'm-u1l2' : null);
      await finishScreens(page);
    }
    await page.evaluate(function () { App.Pages.startLesson('u1-review'); });
    await playLesson(page, 'm-review');
    await finishScreens(page, 'm-review');
    st = await page.evaluate(function () { return App.Store.get(); });
    ok(st.progress['u1-review'], 'révision de l\'unité 1 terminée');
    ok(st.stats.units === 1, 'unité comptée');
    // Le coffre de l'unité 1 s'ouvre et donne des améthystes
    var gemsBefore = st.gems;
    await page.locator('.node.chest-node.open').first().click();
    await page.locator('.modal').getByRole('button', { name: 'Super !' }).click();
    st = await page.evaluate(function () { return App.Store.get(); });
    ok(st.gems > gemsBefore && st.chests['u1-chest'], 'coffre ouvert : ' + gemsBefore + ' → ' + st.gems);

    /* 3. Une leçon de chaque unité (contenus variés : paires, tics, ordre, discours…) */
    var picks = ['u2l4', 'u3l1', 'u3l4', 'u4l5', 'u5l2', 'u6l2', 'u7l2', 'u8l4', 'u9l2', 'u10l2'];
    for (var p = 0; p < picks.length; p++) {
      await page.evaluate(function (id) { App.Pages.startLesson(id); }, picks[p]);
      await playLesson(page, ['u3l1', 'u5l2', 'u9l2'].indexOf(picks[p]) >= 0 ? 'm-' + picks[p] : null);
      await finishScreens(page);
    }
    st = await page.evaluate(function () { return App.Store.get(); });
    ok(st.stats.speeches >= 3, 'discours analysés : ' + st.stats.speeches);
    ok(st.speeches.some(function (x) { return typeof x.wpm === 'number'; }), 'débit mesuré : ' + JSON.stringify(st.speeches));

    /* 4. Pages, sur téléphone */
    var pages = ['entrainement', 'entrainement/virelangues', 'entrainement/respiration', 'entrainement/lecture', 'entrainement/miroir', 'quetes', 'profil', 'boutique', 'reglages'];
    for (var g = 0; g < pages.length; g++) {
      await page.goto(base + '#/' + pages[g]);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(SHOTS, 'm-page-' + pages[g].replace('/', '-') + '.png'), fullPage: true });
    }
    // Achat et port d'un accessoire
    await page.goto(base + '#/boutique');
    await page.locator('.shop-item', { hasText: 'Fleur violette' }).locator('button').click();
    st = await page.evaluate(function () { return App.Store.get(); });
    ok(st.shop.owned.flower && st.shop.equipped.flower, 'fleur achetée et portée');

    /* 5. Studio d'analyse avec rapport complet */
    await page.goto(base + '#/entrainement');
    await page.locator('.tool', { hasText: 'Studio d\'analyse' }).click();
    var free = await page.evaluate(function () { return App.Lesson.active().step().type; });
    ok(free === 'free', 'studio = parole libre');
    await page.evaluate(function () { window.__say = 'Euh, alors en fait je voulais parler du travail. Du coup, genre, c\'est important, voilà. Le travail donne un sens à la vie et le travail rassemble les gens autour d\'un projet commun.'; });
    await page.getByRole('button', { name: 'Je commence' }).click();
    await page.waitForTimeout(7000);
    await page.getByRole('button', { name: 'Terminer' }).click();
    await page.locator('.report-head').waitFor({ timeout: 8000 });
    await page.screenshot({ path: path.join(SHOTS, 'm-studio-report.png'), fullPage: true });
    var tics = await page.locator('.metric', { hasText: 'Tics' }).locator('.v').innerText();
    ok(+tics >= 5, 'tics détectés : ' + tics);
    await page.locator('.lesson-foot').getByRole('button', { name: 'Continuer' }).click();
    await finishScreens(page);

    /* 6. Respiration guidée, horloge accélérée */
    var bpage = await newPage(browser, 390, 844, await page.evaluate(function () { return localStorage.getItem('ahouefa-eloquence-v1'); }));
    await bpage.clock.install();
    await bpage.goto(base + '#/entrainement/respiration');
    await bpage.clock.runFor(500);
    await bpage.locator('.row-item', { hasText: 'Cohérence cardiaque' }).getByRole('button').click();
    await bpage.locator('.lesson').getByRole('button', { name: 'Commencer', exact: true }).click();
    await bpage.clock.runFor(2000);
    var label = await bpage.locator('.breath-label .what').innerText();
    ok(label === 'Inspire', 'phase inspire : ' + label);
    await bpage.screenshot({ path: path.join(SHOTS, 'm-breath.png') });
    await bpage.clock.runFor(4000);
    ok(await bpage.locator('.breath-label .what').innerText() === 'Expire', 'phase expire');
    await bpage.clock.runFor(12 * 10 * 1000);
    await bpage.locator('.lesson-foot.ok').waitFor();
    ok(true, 'respiration terminée');
    await bpage.context().close();

    /* 7. Test de niveau : sauter directement à l'unité 3 */
    var jpage = await newPage(browser, 390, 844, JSON.stringify({ onboarded: true, profile: { name: 'Test', dailyGoal: 20 } }));
    await jpage.goto(base);
    await jpage.locator('.unit', { hasText: 'Chasser les tics' }).getByRole('button', { name: 'Sauter ici ?' }).click();
    await jpage.locator('.modal').getByRole('button', { name: 'Passer le test' }).click();
    await jpage.locator('.lesson').waitFor();
    await playLesson(jpage, null);
    await finishScreens(jpage);
    var jst = await jpage.evaluate(function () { return { done: App.Course.isDone('u2l5') && App.Course.isDone('u1-review'), cur: App.Course.state().current.id }; });
    ok(jst.done && jst.cur === 'u3l1', 'unités 1 et 2 débloquées, reprise à ' + jst.cur);
    await jpage.context().close();

    /* 7b. Test de niveau proposé aux personnes à l'aise : tout juste → unité 10 */
    var ppage = await newPage(browser, 390, 844, JSON.stringify({ onboarded: true, profile: { name: 'Sam', gender: 'm', reasons: ['public'], feeling: 3, dailyGoal: 20 } }));
    await ppage.goto(base);
    await ppage.evaluate(function () { App.Pages.placementTest(); });
    await ppage.locator('.lesson').waitFor();
    var pn = await playLesson(ppage, null);
    ok(pn >= 19, 'test de niveau joué (' + pn + ' étapes)');
    await finishScreens(ppage);
    await ppage.locator('.modal', { hasText: 'unité 10' }).waitFor();
    await ppage.locator('.modal').getByRole('button', { name: 'Voir mon parcours' }).click();
    var pst = await ppage.evaluate(function () { return App.Course.state().current.id; });
    ok(pst === 'u10l1', 'test de niveau : reprise à ' + pst);

    /* 7c. Diplôme de fin de parcours */
    await ppage.evaluate(function () {
      App.Store.update(function (s) {
        App.Course.units.forEach(function (u) {
          u.lessons.map(function (l) { return l.id; }).concat([u.id + '-review']).forEach(function (id) { s.progress[id] = { count: 1, best: 1, last: App.U.dayKey() }; });
        });
      });
      App.render();
    });
    ok(await ppage.evaluate(function () { return App.Plan.diplomaEarned(); }), 'diplôme obtenu');
    ok(await ppage.locator('.top-card', { hasText: 'bilan final' }).count() === 1, 'bilan final proposé');
    await ppage.locator('.path-end .btn', { hasText: 'Voir mon diplôme' }).click();
    await ppage.locator('.modal .diploma-img').waitFor({ timeout: 8000 });
    await ppage.screenshot({ path: path.join(SHOTS, 'm-diploma.png') });
    var dsize = await ppage.evaluate(function () { var i = document.querySelector('.modal .diploma-img'); return i.naturalWidth || i.width; });
    ok(dsize >= 1000, 'image du diplôme générée (' + dsize + ' px)');
    await ppage.locator('.modal .modal-actions .btn').last().click();

    /* 7d. Réglages : motivations à choix multiples, rappel dans l'agenda */
    await ppage.goto(base + '#/reglages');
    var sboxes = ppage.locator('.chips [role=checkbox]');
    await sboxes.nth(1).click();
    await sboxes.nth(2).click();
    var reasons = await ppage.evaluate(function () { return App.Store.get().profile.reasons; });
    ok(reasons.length === 3 && reasons.indexOf('public') >= 0, 'réglages : plusieurs motivations (' + reasons + ')');
    var ics = await ppage.evaluate(function () { return App.Plan.ics('07:45'); });
    ok(/RRULE:FREQ=DAILY/.test(ics) && /DTSTART:\d{8}T074500/.test(ics) && /BEGIN:VALARM/.test(ics), 'fichier d\'agenda quotidien valide');
    await ppage.context().close();

    /* 8. Ordinateur : parcours avec colonne de droite, thème sombre */
    var dpage = await newPage(browser, 1366, 860, await page.evaluate(function () { return localStorage.getItem('ahouefa-eloquence-v1'); }));
    await dpage.goto(base);
    await dpage.waitForTimeout(400);
    await dpage.screenshot({ path: path.join(SHOTS, 'd-path.png') });
    ok(await dpage.locator('.aside').isVisible(), 'colonne de droite visible');
    await dpage.locator('.node-wrap.is-current .node').click();
    await dpage.screenshot({ path: path.join(SHOTS, 'd-popover.png') });
    await dpage.locator('.popover .btn').click();
    await dpage.locator('.lesson').waitFor();
    await dpage.screenshot({ path: path.join(SHOTS, 'd-lesson.png') });
    await playLesson(dpage, null);
    await finishScreens(dpage);
    await dpage.goto(base + '#/reglages');
    await dpage.getByRole('radio', { name: 'Sombre' }).click();
    await dpage.goto(base + '#/apprendre');
    await dpage.waitForTimeout(300);
    await dpage.screenshot({ path: path.join(SHOTS, 'd-path-dark.png') });
    await dpage.goto(base + '#/profil');
    await dpage.waitForTimeout(300);
    await dpage.screenshot({ path: path.join(SHOTS, 'd-profile-dark.png'), fullPage: true });
    await dpage.goto(base + '#/quetes');
    await dpage.waitForTimeout(300);
    await dpage.screenshot({ path: path.join(SHOTS, 'd-quests-dark.png'), fullPage: true });
  } finally {
    await browser.close();
    srv.close();
  }
  var real = errors.filter(function (e) { return !/fonts\.g(oogleapis|static)\.com|ERR_NAME_NOT_RESOLVED|ERR_TUNNEL|ERR_CONNECTION|net::ERR_/.test(e); });
  if (real.length) { console.error('Erreurs dans la page :\n' + real.join('\n')); process.exit(1); }
  console.log('✓ ' + passed + ' vérifications de bout en bout réussies. Captures : ' + SHOTS);
})().catch(function (e) {
  console.error(e);
  if (errors.length) console.error(errors.join('\n'));
  process.exit(1);
});

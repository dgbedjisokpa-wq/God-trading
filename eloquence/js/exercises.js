/* Les types d'exercices. Chaque fabrique renvoie :
   { el, kind, ready(), check(), onKey(e), destroy() }
   kind : 'info' (continuer), 'graded' (vérifier), 'auto' (se valide seul), 'activity' (à terminer). */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Sp = App.Speech, Store = App.Store;
  var Ex = {};

  function title(text) { return h('h2.step-title', { html: U.md(text) }); }
  function quoteCard(q, who) {
    return h('div.quote-card', { html: U.md(q) + (who ? '<span class="who">— ' + U.esc(who) + '</span>' : '') });
  }

  /* Texte avec pauses (« / », « // ») et mots en *gras* */
  function richText(text) {
    var html = U.esc(text)
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/(^|\s)\/\/(?=\s|$)/g, '$1<span class="pz" aria-label="grande pause">//</span>')
      .replace(/(^|\s)\/(?=\s|$)/g, '$1<span class="pz" aria-label="petite pause">/</span>');
    return html;
  }
  Ex.richText = richText;

  function listenButtons(text, mascotHost) {
    if (!Sp.ttsSupported()) return null;
    function play(rate) {
      App.Mascot.setMood(mascotHost, 'talk');
      Sp.say(text, { rate: rate }).then(function () { App.Mascot.setMood(mascotHost, 'idle'); });
    }
    return h('div.listen-row', null, [
      h('button.round-mini', { type: 'button', 'aria-label': 'Écouter Ahouéfa', title: 'Écouter', html: App.icon('volume'), onclick: function () { play(); } }),
      h('button.round-mini.slow', { type: 'button', 'aria-label': 'Écouter lentement', title: 'Écouter lentement', html: App.icon('turtle'), onclick: function () { play(0.65); } })
    ]);
  }

  /* ================= INFO ================= */
  Ex.info = function (step) {
    var masc = App.Mascot.el({ mood: step.mood || 'talk' });
    setTimeout(function () { if (!step.mood || step.mood === 'talk') App.Mascot.setMood(masc, 'idle'); }, 2200);
    var card = h('div.info-card', null, [masc]);
    if (step.title) card.appendChild(h('h2.step-title', { text: step.title }));
    if (step.quote) card.appendChild(quoteCard(step.quote.t, step.quote.a));
    if (step.body) card.appendChild(h('div.info-text', { html: U.md(step.body) }));
    if (step.bullets) {
      card.appendChild(h('ul.info-list', null, step.bullets.map(function (b) { return h('li', null, h('span', { html: U.md(b) })); })));
    }
    if (Sp.ttsSupported()) {
      var spoken = [step.title, step.quote ? step.quote.t : '', step.body, (step.bullets || []).join('. ')].filter(Boolean).join('. ');
      card.appendChild(h('button.btn.ghost.sm', {
        type: 'button', html: App.icon('volume') + '<span>Écouter Ahouéfa</span>',
        onclick: function () {
          App.Mascot.setMood(masc, 'talk');
          Sp.say(spoken.replace(/\*\*/g, '')).then(function () { App.Mascot.setMood(masc, 'idle'); });
        }
      }));
    }
    return { el: h('div.step', null, card), kind: 'info', destroy: function () { Sp.stopSaying(); } };
  };

  /* ================= QCM ================= */
  Ex.mcq = function (step) {
    var sel = -1, locked = false;
    var root = h('div.step', null, [h('span.tag-new', { html: App.icon('sparkle') + 'Question' }), title(step.prompt)]);
    if (step.quote) root.appendChild(quoteCard(step.quote));
    var list = h('div.choices', { role: 'radiogroup', 'aria-label': 'Réponses' });
    var btns = step.options.map(function (o, i) {
      var b = h('button.choice', { type: 'button', role: 'radio', 'aria-checked': 'false' }, [h('span.key', { text: String(i + 1) }), h('span.grow', { text: o })]);
      b.addEventListener('click', function () { choose(i); });
      list.appendChild(b);
      return b;
    });
    root.appendChild(list);
    var api = { el: root, kind: 'graded' };
    function choose(i) {
      if (locked) return;
      sel = i;
      btns.forEach(function (b, k) { b.classList.toggle('sel', k === i); b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
      App.Sound.play('tap');
      api.changed();
    }
    api.ready = function () { return sel >= 0; };
    api.check = function () {
      locked = true;
      var ok = sel === step.answer;
      btns.forEach(function (b, k) {
        b.disabled = true;
        b.classList.remove('sel');
        if (k === step.answer) b.classList.add('right');
        else if (k === sel) b.classList.add('wrong');
      });
      return { correct: ok, solution: step.options[step.answer], explain: step.explain };
    };
    api.onKey = function (e) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= btns.length) { choose(n - 1); return true; }
      return false;
    };
    return api;
  };

  /* ================= VRAI / FAUX ================= */
  Ex.tf = function (step) {
    var sel = null, locked = false;
    var root = h('div.step', null, [h('span.tag-new', { html: App.icon('sparkle') + 'Vrai ou faux ?' }), quoteCard(step.statement)]);
    var list = h('div.choices.two', { role: 'radiogroup', 'aria-label': 'Vrai ou faux' });
    var vals = [true, false];
    var btns = vals.map(function (v, i) {
      var b = h('button.choice.big', { type: 'button', role: 'radio', 'aria-checked': 'false', html: App.icon(v ? 'check' : 'x') + '<span>' + (v ? 'Vrai' : 'Faux') + '</span>' });
      b.addEventListener('click', function () { choose(i); });
      list.appendChild(b);
      return b;
    });
    root.appendChild(list);
    var api = { el: root, kind: 'graded' };
    function choose(i) {
      if (locked) return;
      sel = i;
      btns.forEach(function (b, k) { b.classList.toggle('sel', k === i); b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
      App.Sound.play('tap');
      api.changed();
    }
    api.ready = function () { return sel !== null; };
    api.check = function () {
      locked = true;
      var ok = vals[sel] === step.answer;
      var right = step.answer ? 0 : 1;
      btns.forEach(function (b, k) {
        b.disabled = true; b.classList.remove('sel');
        if (k === right) b.classList.add('right'); else if (k === sel) b.classList.add('wrong');
      });
      return { correct: ok, solution: step.answer ? 'Vrai' : 'Faux', explain: step.explain };
    };
    api.onKey = function (e) {
      if (e.key === '1' || e.key.toLowerCase() === 'v') { choose(0); return true; }
      if (e.key === '2' || e.key.toLowerCase() === 'f') { choose(1); return true; }
      return false;
    };
    return api;
  };

  /* ================= TEXTE À TROU ================= */
  Ex.fill = function (step) {
    var chosen = null, locked = false;
    var root = h('div.step', null, [title(step.prompt || 'Complète la phrase')]);
    var parts = step.sentence.split('___');
    var blank = h('span.blank', { html: '&nbsp;' });
    var sentence = h('div.fill-sentence', null, [parts[0], blank, parts.slice(1).join('___')]);
    root.appendChild(sentence);
    var chips = h('div.chips');
    var btns = step.options.map(function (o, i) {
      var b = h('button.chip', { type: 'button', text: o });
      b.addEventListener('click', function () { choose(i); });
      chips.appendChild(b);
      return b;
    });
    root.appendChild(chips);
    var api = { el: root, kind: 'graded' };
    function choose(i) {
      if (locked) return;
      chosen = i;
      btns.forEach(function (b, k) { b.classList.toggle('sel', k === i); });
      blank.textContent = step.options[i];
      blank.classList.add('filled');
      App.Sound.play('tap');
      api.changed();
    }
    blank.addEventListener('click', function () {
      if (locked || chosen === null) return;
      chosen = null;
      blank.innerHTML = '&nbsp;';
      blank.classList.remove('filled');
      btns.forEach(function (b) { b.classList.remove('sel'); });
      api.changed();
    });
    api.ready = function () { return chosen !== null; };
    api.check = function () {
      locked = true;
      btns.forEach(function (b) { b.disabled = true; });
      var ok = step.options[chosen] === step.answer;
      blank.classList.add(ok ? 'right' : 'wrong');
      return { correct: ok, solution: step.sentence.replace('___', step.answer), explain: step.explain };
    };
    api.onKey = function (e) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= btns.length) { choose(n - 1); return true; }
      return false;
    };
    return api;
  };

  /* ================= REMETTRE DANS L'ORDRE ================= */
  Ex.order = function (step) {
    var items = step.items;
    var long = items.some(function (x) { return x.length > 26; });
    var order;
    do { order = U.shuffle(items.map(function (_, i) { return i; })); } while (items.length > 1 && order.every(function (v, i) { return v === i; }));
    var picked = [], locked = false;

    var root = h('div.step', null, [title(step.prompt || 'Remets dans l\'ordre')]);
    var zone = h('div.answer-zone' + (long ? '.cards' : ''));
    var hint = h('div.zone-hint', { text: long ? 'Touche les éléments dans le bon ordre' : '' });
    var bank = h('div.chips');
    var bankBtns = {};
    order.forEach(function (idx) {
      var b = h('button.chip' + (long ? '.long' : ''), { type: 'button', text: items[idx] });
      b.addEventListener('click', function () { add(idx); });
      bankBtns[idx] = b;
      bank.appendChild(b);
    });
    root.appendChild(zone);
    root.appendChild(bank);

    var api = { el: root, kind: 'graded' };
    function render() {
      U.clear(zone);
      if (!picked.length && long) zone.appendChild(hint);
      picked.forEach(function (idx, pos) {
        var b = h('button.chip' + (long ? '.long' : ''), { type: 'button', 'aria-label': 'Retirer : ' + items[idx] }, [
          long ? h('span.n', { text: String(pos + 1) }) : null, items[idx]
        ]);
        b.addEventListener('click', function () { remove(pos); });
        zone.appendChild(b);
      });
      Object.keys(bankBtns).forEach(function (k) { bankBtns[k].classList.toggle('used', picked.indexOf(+k) >= 0); });
      api.changed && api.changed();
    }
    function add(idx) { if (locked || picked.indexOf(idx) >= 0) return; picked.push(idx); App.Sound.play('tap'); render(); }
    function remove(pos) { if (locked) return; picked.splice(pos, 1); render(); }
    render();

    api.ready = function () { return picked.length === items.length; };
    api.check = function () {
      locked = true;
      var ok = picked.every(function (v, i) { return v === i; });
      zone.classList.add(ok ? 'right' : 'wrong');
      U.$$('button', zone).forEach(function (b) { b.disabled = true; });
      var sol = long ? items.map(function (x, i) { return (i + 1) + '. ' + x; }).join('<br>') : items.join(' ');
      return { correct: ok, solutionHTML: sol, explain: step.explain };
    };
    return api;
  };

  /* ================= ASSOCIER LES PAIRES ================= */
  Ex.match = function (step, ctx) {
    var pairs = step.pairs;
    var long = pairs.some(function (p) { return p[1].length > 28 || p[0].length > 28; });
    var left = U.shuffle(pairs.map(function (p, i) { return i; }));
    var right = U.shuffle(pairs.map(function (p, i) { return i; }));
    var selL = null, selR = null, doneCount = 0, mistakes = 0, busy = false;

    var root = h('div.step', null, [title(step.prompt || 'Associe les paires')]);
    var grid = h('div.match');
    var colL = h('div.col'), colR = h('div.col');
    var bL = {}, bR = {};
    left.forEach(function (i, k) {
      var b = h('button.choice', { type: 'button' }, [h('span.key', { text: String(k + 1) }), h('span.grow', { text: pairs[i][0] })]);
      if (long) b.style.fontSize = '15px';
      b.addEventListener('click', function () { pick('L', i); });
      bL[i] = b; colL.appendChild(b);
    });
    right.forEach(function (i, k) {
      var b = h('button.choice', { type: 'button' }, [h('span.key', { text: String(k + 1 + pairs.length) }), h('span.grow', { text: pairs[i][1] })]);
      if (long) b.style.fontSize = '14px';
      b.addEventListener('click', function () { pick('R', i); });
      bR[i] = b; colR.appendChild(b);
    });
    grid.appendChild(colL); grid.appendChild(colR);
    root.appendChild(grid);

    function pick(side, i) {
      if (busy) return;
      var b = side === 'L' ? bL[i] : bR[i];
      if (b.classList.contains('done')) return;
      App.Sound.play('tap');
      if (side === 'L') { if (selL !== null) bL[selL].classList.remove('sel'); selL = (selL === i ? null : i); }
      else { if (selR !== null) bR[selR].classList.remove('sel'); selR = (selR === i ? null : i); }
      if (selL !== null) bL[selL].classList.add('sel');
      if (selR !== null) bR[selR].classList.add('sel');
      if (selL !== null && selR !== null) evaluate();
    }
    function evaluate() {
      var a = bL[selL], b = bR[selR];
      a.classList.remove('sel'); b.classList.remove('sel');
      busy = true;
      if (selL === selR) {
        a.classList.add('flash-ok'); b.classList.add('flash-ok');
        App.Sound.play('match');
        setTimeout(function () {
          a.classList.remove('flash-ok'); b.classList.remove('flash-ok');
          a.classList.add('done'); b.classList.add('done');
          a.disabled = b.disabled = true;
          busy = false;
          doneCount++;
          if (doneCount === pairs.length) {
            ctx.complete({
              correct: mistakes === 0,
              noRequeue: true,
              title: mistakes === 0 ? 'Parfait !' : 'Bien joué !',
              explain: mistakes === 0 ? 'Toutes les paires du premier coup.' : U.plural(mistakes, 'erreur') + ' en chemin, mais tu as tout trouvé.'
            });
          }
        }, 260);
      } else {
        mistakes++;
        a.classList.add('flash-ko'); b.classList.add('flash-ko');
        App.Sound.play('wrong');
        U.vibrate(80);
        setTimeout(function () { a.classList.remove('flash-ko'); b.classList.remove('flash-ko'); busy = false; }, 450);
      }
      selL = selR = null;
    }
    return {
      el: root, kind: 'auto',
      onKey: function (e) {
        var n = parseInt(e.key, 10);
        if (!(n >= 1)) return false;
        if (n <= pairs.length) { pick('L', left[n - 1]); return true; }
        if (n <= pairs.length * 2) { pick('R', right[n - 1 - pairs.length]); return true; }
        return false;
      }
    };
  };

  /* ================= TOUCHER LES MOTS ================= */
  Ex.tap = function (step) {
    var root = h('div.step', null, [title(step.prompt || 'Touche les bons mots')]);
    var box = h('div.tap-text');
    var tokens = [];
    String(step.text).split(/(\[[^\]]+\])/).forEach(function (part) {
      if (!part) return;
      if (part.charAt(0) === '[') {
        addTok(part.slice(1, -1), true);
        return;
      }
      part.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { box.appendChild(document.createTextNode(' ')); return; }
        var m = /^([«"(\[]*)(.*?)([.,;:!?»")…]*)$/.exec(w);
        if (m[1]) box.appendChild(document.createTextNode(m[1]));
        if (m[2]) addTok(m[2], false);
        if (m[3]) box.appendChild(document.createTextNode(m[3]));
      });
    });
    function addTok(text, target) {
      var b = h('button.tw', { type: 'button', text: text, 'aria-pressed': 'false' });
      var t = { el: b, target: target, sel: false };
      b.addEventListener('click', function () {
        if (b.disabled) return;
        t.sel = !t.sel;
        b.classList.toggle('sel', t.sel);
        b.setAttribute('aria-pressed', t.sel ? 'true' : 'false');
        App.Sound.play('tap');
        api.changed();
      });
      tokens.push(t);
      box.appendChild(b);
    }
    root.appendChild(box);
    var api = { el: root, kind: 'graded' };
    api.ready = function () { return tokens.some(function (t) { return t.sel; }); };
    api.check = function () {
      var ok = tokens.every(function (t) { return t.sel === t.target; });
      tokens.forEach(function (t) {
        t.el.disabled = true;
        t.el.classList.remove('sel');
        if (t.target && t.sel) t.el.classList.add('right');
        else if (t.target) t.el.classList.add('missed');
        else if (t.sel) t.el.classList.add('wrong');
      });
      var sol = tokens.filter(function (t) { return t.target; }).map(function (t) { return '« ' + t.el.textContent + ' »'; }).join(', ');
      return { correct: ok, solution: sol, explain: step.explain };
    };
    return api;
  };

  /* ================= PARLER : lire une phrase ================= */
  Ex.speak = function (step, ctx) {
    var isVire = step.kind === 'virelangue';
    var threshold = isVire ? 0.7 : 0.75;
    var attempts = 0, listening = null, finished = false;

    var root = h('div.step', null, [
      h('span.tag-new', { html: App.icon('micFill') + (isVire ? 'Virelangue' : 'Exercice de parole') }),
      title(step.prompt || 'Lis à voix haute')
    ]);
    var masc = App.Mascot.el({ mood: 'idle' });
    var textBox = h('div.speak-text');
    var tokens = U.displayTokens(step.text), wi = 0, spans = [];
    tokens.forEach(function (t) {
      if (t.space) { textBox.appendChild(document.createTextNode(' ')); return; }
      if (/^\/\/?$/.test(t.text)) { textBox.appendChild(h('span.pz', { text: t.text })); return; }
      var s = h('span.w', { text: t.text.replace(/\*/g, '') });
      spans.push({ el: s, start: wi, n: t.n });
      wi += t.n;
      textBox.appendChild(s);
    });
    var bubbleKids = [textBox];
    var lb = listenButtons(step.text, masc);
    if (lb) bubbleKids.push(lb);
    root.appendChild(h('div.speak-card', null, [masc, h('div.bubble', null, bubbleKids)]));
    if (step.hint) root.appendChild(h('div.hint', { text: step.hint }));

    var micBtn = h('button.mic-btn', { type: 'button', 'aria-label': 'Appuie pour parler', html: App.icon('micFill') });
    var label = h('div.mic-label', { text: 'Appuie et lis la phrase' });
    var live = h('div.live-text', { 'aria-live': 'polite' });
    var zone = h('div.mic-zone', null, [micBtn, label, live]);
    root.appendChild(zone);
    var alertBox = h('div');
    root.appendChild(alertBox);

    var api = { el: root, kind: 'auto', speaking: true };

    function showAlert(msg, icon) {
      U.clear(alertBox);
      if (msg) alertBox.appendChild(h('div.alert', { html: App.icon(icon || 'alert') + '<span>' + U.esc(msg) + '</span>' }));
    }

    function markWords(matched) {
      spans.forEach(function (s) {
        if (!s.n) return;
        var hits = 0;
        for (var k = 0; k < s.n; k++) if (matched[s.start + k]) hits++;
        s.el.classList.remove('ok', 'miss');
        s.el.classList.add(hits / s.n >= 0.5 ? 'ok' : 'miss');
      });
    }

    function finish(res) {
      if (finished) return;
      finished = true;
      micBtn.disabled = true;
      ctx.complete(res);
    }

    function addRetryOrSkip() {
      if (attempts >= 2) {
        var skip = h('button.btn.ghost.sm', { type: 'button', text: 'Continuer quand même' });
        skip.addEventListener('click', function () {
          finish({ correct: false, noRequeue: true, title: 'On continue !', explain: 'Ce n\'est pas grave : tu pourras retenter ce virelangue dans l\'entraînement.' });
        });
        U.clear(alertBox);
        alertBox.appendChild(skip);
      }
    }

    function startSR() {
      Sp.stopSaying();
      micBtn.classList.add('rec');
      micBtn.setAttribute('aria-label', 'Arrêter');
      label.textContent = 'Je t\'écoute…';
      live.textContent = '';
      showAlert('');
      App.Mascot.setMood(masc, 'think');
      listening = Sp.listen({
        expectedWords: U.words(step.text).length,
        onInterim: function (t) { live.textContent = t; }
      });
      listening.promise.then(function (r) {
        listening = null;
        micBtn.classList.remove('rec');
        var best = { score: 0, matched: [] };
        r.transcripts.forEach(function (t) {
          var c = U.compareSpeech(step.text, t);
          if (c.score > best.score) best = c;
        });
        markWords(best.matched);
        var pct = Math.round(best.score * 100);
        attempts++;
        if (best.score >= threshold) {
          App.Mascot.setMood(masc, 'happy');
          label.textContent = pct + ' % de mots reconnus';
          finish({
            correct: true, title: pct >= 95 ? 'Parfait !' : pct >= 85 ? 'Excellent !' : 'Bien dit !',
            explain: 'Prononciation reconnue à ' + pct + ' %.',
            counts: { speakOk: 1, virelangues: isVire ? 1 : 0, speakSecs: Math.max(3, U.words(step.text).length * 0.4) }
          });
        } else {
          App.Mascot.setMood(masc, 'sad');
          setTimeout(function () { App.Mascot.setMood(masc, 'idle'); }, 1500);
          label.textContent = 'Presque ! ' + pct + ' %. Les mots en rouge n\'ont pas été compris. Réessaie.';
          App.Sound.play('wrong');
          addRetryOrSkip();
        }
      }).catch(function (err) {
        listening = null;
        micBtn.classList.remove('rec');
        App.Mascot.setMood(masc, 'idle');
        label.textContent = 'Appuie et lis la phrase';
        var e = err && err.error;
        if (e === 'network' || e === 'service-not-allowed' || e === 'start-failed' || e === 'language-not-supported') {
          // La reconnaissance n'est pas disponible : on passe en auto-évaluation
          showAlert('La reconnaissance vocale ne fonctionne pas ici. Lis la phrase, puis évalue-toi.');
          selfMode();
          return;
        }
        showAlert(Sp.errorText(err));
        if (e === 'not-allowed') ctx.offerNoSpeak();
        else if (e === 'no-speech') { attempts++; addRetryOrSkip(); }
      });
    }

    /* Mode sans reconnaissance : enregistrement + réécoute + auto-évaluation */
    var session = null;
    function selfMode() {
      U.clear(zone);
      var rec = h('button.mic-btn', { type: 'button', 'aria-label': 'Enregistrer', html: App.icon('micFill') });
      var lab = h('div.mic-label', { text: Sp.micSupported() && Sp.recorderSupported() ? 'Enregistre-toi en lisant la phrase' : 'Lis la phrase à voix haute' });
      var after = h('div', { style: { display: 'grid', gap: '12px', width: '100%' } });
      zone.appendChild(rec); zone.appendChild(lab); zone.appendChild(after);
      if (!(Sp.micSupported() && Sp.recorderSupported())) {
        rec.remove();
        rateButtons(after);
        return;
      }
      rec.addEventListener('click', function () {
        if (session) {
          var s = session; session = null;
          rec.classList.remove('rec');
          s.stop().then(function (r) {
            lab.textContent = 'Réécoute-toi, puis évalue-toi';
            U.clear(after);
            if (r.url) after.appendChild(h('audio', { controls: true, src: r.url, style: { width: '100%' } }));
            rateButtons(after, r.duration);
          });
          return;
        }
        session = Sp.session({ transcribe: false });
        session.start().then(function () {
          rec.classList.add('rec');
          lab.textContent = 'Enregistrement… appuie pour arrêter';
        }).catch(function (err) {
          session = null;
          showAlert(Sp.errorText(err));
          rec.remove();
          rateButtons(after);
        });
      });
    }
    function rateButtons(host, secs) {
      var row = h('div.self-rate');
      [['😕', 'Pas encore', false], ['🙂', 'Bien', true], ['🤩', 'Parfait', true]].forEach(function (r) {
        var b = h('button.choice', { type: 'button' }, [h('span.e', { text: r[0] }), h('span', { text: r[1] })]);
        b.addEventListener('click', function () {
          finish({
            correct: r[2], noRequeue: true, title: r[2] ? 'Bravo !' : 'Continue comme ça !',
            explain: r[2] ? 'L\'auto-évaluation est une vraie compétence d\'orateur.' : 'Refais-le plus lentement, en exagérant chaque syllabe.',
            counts: r[2] ? { speakOk: 1, virelangues: isVire ? 1 : 0, speakSecs: secs || 4 } : { speakSecs: secs || 4 }
          });
        });
        row.appendChild(b);
      });
      host.appendChild(row);
    }

    micBtn.addEventListener('click', function () {
      if (finished) return;
      if (listening) { listening.stop(); return; }
      startSR();
    });

    if (!Sp.srSupported()) {
      showAlert('Ton navigateur ne reconnaît pas la voix (essaie Chrome ou Safari). Tu peux quand même t\'enregistrer et t\'évaluer.', 'bulb');
      selfMode();
    }

    api.destroy = function () {
      if (listening) listening.abort();
      if (session) session.cancel();
      Sp.stopSaying();
    };
    api.onKey = function (e) {
      if (e.key === ' ' && !finished && Sp.srSupported() && micBtn.isConnected) { e.preventDefault(); micBtn.click(); return true; }
      return false;
    };
    return api;
  };

  /* ================= VOIX : ton, émotion, projection ================= */
  Ex.voice = function (step, ctx) {
    var root = h('div.step', null, [
      h('span.tag-new', { html: App.icon('micFill') + (step.emotion ? 'Émotion : ' + step.emotion : 'Expression') }),
      title(step.prompt || 'Mets le ton')
    ]);
    if (step.instruction) root.appendChild(h('div.info-text', { html: U.md(step.instruction), style: { fontSize: '17px' } }));
    var masc = App.Mascot.el({ mood: 'idle' });
    root.appendChild(h('div.speak-card', null, [masc, h('div.bubble', { html: richText(step.text) })]));

    var micBtn = h('button.mic-btn', { type: 'button', 'aria-label': 'Enregistrer', html: App.icon('micFill') });
    var label = h('div.mic-label', { text: 'Appuie, dis la phrase, puis appuie de nouveau' });
    var meter = h('div.level-meter', { 'aria-hidden': 'true' });
    var bars = [];
    for (var i = 0; i < 14; i++) { var b = h('i'); bars.push(b); meter.appendChild(b); }
    var zone = h('div.mic-zone', null, [micBtn, meter, label]);
    var result = h('div', { style: { display: 'grid', gap: '14px' } });
    var alertBox = h('div');
    root.appendChild(zone); root.appendChild(alertBox); root.appendChild(result);

    var session = null, done = false, autoStop;
    var api = { el: root, kind: 'activity', speaking: true };

    function rate(secs) {
      result.appendChild(h('div.lbl', { text: 'Comment c\'était ?', style: { fontWeight: 900 } }));
      var row = h('div.self-rate');
      [['😕', 'À retravailler'], ['🙂', 'Bien'], ['🤩', 'Parfait']].forEach(function (r, k) {
        var b = h('button.choice', { type: 'button' }, [h('span.e', { text: r[0] }), h('span', { text: r[1] })]);
        b.addEventListener('click', function () {
          if (done) return;
          done = true;
          U.$$('button', row).forEach(function (x) { x.disabled = true; });
          b.classList.add('sel');
          ctx.complete({
            activity: true, title: k === 0 ? 'Chaque essai compte !' : 'Très bien !',
            explain: k === 0 ? 'Réessaie en exagérant : à l\'oral, il faut toujours en faire un peu plus qu\'on ne le pense.' : 'Ta voix est ton meilleur outil. Continue à jouer avec elle !',
            counts: { speakOk: k > 0 ? 1 : 0, speakSecs: secs || 4 }
          });
        });
        row.appendChild(b);
      });
      result.appendChild(row);
    }

    function stop() {
      clearTimeout(autoStop);
      var s = session; session = null;
      micBtn.classList.remove('rec');
      micBtn.disabled = true;
      bars.forEach(function (b) { b.style.height = '6px'; });
      s.stop().then(function (r) {
        var au = App.Analysis.audio(r.frames);
        label.textContent = 'Réécoute-toi :';
        micBtn.disabled = false;
        U.clear(result);
        if (r.url) result.appendChild(h('audio', { controls: true, src: r.url, style: { width: '100%' } }));
        if (au.pitchVar !== null) {
          var desc = au.pitchVar >= 3 ? 'Mélodie très expressive !' : au.pitchVar >= 2 ? 'Mélodie vivante.' : au.pitchVar >= 1.3 ? 'Mélodie un peu plate : exagère davantage.' : 'Voix assez monotone : fais monter et descendre ta voix.';
          if (step.showPitch !== false) result.appendChild(h('div', { html: UIpitch(au.contour) }));
          result.appendChild(h('div.hint', { text: 'Variation de ta voix : ' + U.num(au.pitchVar) + ' demi-tons. ' + desc }));
        } else if (au.voicedSecs < 0.5) {
          result.appendChild(h('div.alert', { html: App.icon('alert') + '<span>Je n\'ai presque rien entendu. Rapproche-toi du micro et parle plus fort.</span>' }));
        }
        rate(r.duration);
      });
    }
    function UIpitch(c) { return App.UI.pitchSVG(c); }

    function start() {
      U.clear(result); U.clear(alertBox);
      session = Sp.session({
        transcribe: false,
        onLevel: function (rms) {
          var lvl = U.clamp(rms * 9, 0, 1);
          bars.forEach(function (b, k) {
            var f = 0.5 + 0.5 * Math.sin((Date.now() / 90) + k);
            b.style.height = Math.round(6 + lvl * 38 * f) + 'px';
          });
        }
      });
      session.start().then(function () {
        micBtn.classList.add('rec');
        label.textContent = 'Enregistrement… appuie pour arrêter';
        autoStop = setTimeout(function () { if (session) stop(); }, 15000);
      }).catch(function (err) {
        session = null;
        alertBox.appendChild(h('div.alert', { html: App.icon('alert') + '<span>' + U.esc(Sp.errorText(err)) + ' Dis la phrase à voix haute, puis évalue-toi.</span>' }));
        zone.remove();
        rate(4);
        if (err && err.error === 'not-allowed') ctx.offerNoSpeak();
      });
    }

    micBtn.addEventListener('click', function () {
      if (done) return;
      Sp.stopSaying();
      if (session) stop(); else start();
    });
    if (!Sp.micSupported()) {
      zone.remove();
      alertBox.appendChild(h('div.alert', { html: App.icon('bulb') + '<span>Micro indisponible ici. Dis la phrase à voix haute deux fois, en exagérant le ton, puis évalue-toi.</span>' }));
      rate(4);
    }
    api.destroy = function () { clearTimeout(autoStop); if (session) session.cancel(); };
    return api;
  };

  /* ================= RESPIRATION ================= */
  Ex.breath = function (step, ctx) {
    var p = step.pattern, cycles = step.cycles || 4;
    var root = h('div.step', null, [
      h('span.tag-new', { html: App.icon('windFill') + 'Respiration' }),
      title(step.title || 'Respire avec moi')
    ]);
    if (step.body) root.appendChild(h('p.step-sub', { text: step.body }));
    var circle = h('div.breath-circle');
    var big = h('div.big', { text: '' });
    var what = h('div.what', { text: 'Prêt(e) ?' });
    circle.appendChild(h('div.breath-label', null, [big, what]));
    var count = h('div.breath-count', { text: cycles + ' cycles · ' + [p.inhale, p.hold, p.exhale, p.hold2].filter(Boolean).join('-') + ' s' });
    var startBtn = h('button.btn', { type: 'button', text: 'Commencer' });
    root.appendChild(h('div.breath', null, [circle, count, startBtn]));

    var timers = [], running = false;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function phase(name, secs, scale, sound, next) {
      if (!secs) { next(); return; }
      what.textContent = name;
      circle.style.setProperty('--dur', secs + 's');
      circle.style.setProperty('--scale', scale);
      if (sound) App.Sound.play(sound);
      var left = secs;
      big.textContent = left;
      for (var s = 1; s < secs; s++) {
        (function (k) { later(function () { big.textContent = secs - k; }, k * 1000); })(s);
      }
      later(next, secs * 1000);
    }
    function cycle(n) {
      if (n > cycles) {
        what.textContent = 'Bravo !';
        big.textContent = '✓';
        circle.style.setProperty('--scale', 0.75);
        ctx.complete({ activity: true, title: 'Bien respiré !', explain: 'Ton corps est plus calme, ta voix plus posée.', counts: { breath: 1 } });
        return;
      }
      count.textContent = 'Cycle ' + n + ' sur ' + cycles;
      phase('Inspire', p.inhale, 1, 'breathIn', function () {
        phase('Retiens', p.hold, 1, null, function () {
          phase('Expire', p.exhale, 0.55, 'breathOut', function () {
            phase('Pause', p.hold2, 0.55, null, function () { cycle(n + 1); });
          });
        });
      });
    }
    startBtn.addEventListener('click', function () {
      if (running) return;
      running = true;
      startBtn.remove();
      cycle(1);
    });
    return {
      el: root, kind: 'activity',
      destroy: function () { timers.forEach(clearTimeout); }
    };
  };

  /* ================= ÉTAPES MINUTÉES ================= */
  Ex.timed = function (step, ctx) {
    var root = h('div.step', null, [
      h('span.tag-new', { html: App.icon('clock') + 'Exercice guidé' }),
      title(step.title || 'À toi de jouer')
    ]);
    if (step.body) root.appendChild(h('p.step-sub', { text: step.body }));
    var list = h('div.timed-list');
    var rows = step.steps.map(function (s, i) {
      var num = h('div.num', { text: String(i + 1) });
      var row = h('div.timed-item', null, [num, h('div', { text: s.t })]);
      list.appendChild(row);
      return { row: row, num: num, secs: s.secs, t: s.t };
    });
    root.appendChild(list);
    var startBtn = h('button.btn', { type: 'button', text: 'Commencer' });
    var nextBtn = h('button.btn.ghost.sm.hidden', { type: 'button', text: 'Étape suivante' });
    var voiceOn = Sp.ttsSupported() && Store.get().settings.sound !== false;
    root.appendChild(h('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' } }, [startBtn, nextBtn]));
    if (Sp.ttsSupported()) root.appendChild(h('p.hint.center', { text: voiceOn ? 'Ahouéfa lit chaque étape à voix haute.' : '' }));

    var cur = -1, tick, remaining = 0, done = false;
    function go(i) {
      clearInterval(tick);
      if (cur >= 0 && rows[cur]) { rows[cur].row.classList.remove('active'); rows[cur].row.classList.add('done'); rows[cur].num.innerHTML = App.icon('check'); }
      cur = i;
      if (i >= rows.length) {
        done = true;
        nextBtn.classList.add('hidden');
        Sp.stopSaying();
        ctx.complete({ activity: true, title: 'Exercice terminé !', explain: 'Bien joué. Refais-le avant chaque prise de parole.' });
        return;
      }
      var r = rows[i];
      r.row.classList.add('active');
      r.row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      remaining = r.secs;
      r.num.innerHTML = '<span>' + remaining + '</span>' + App.UI.ring(48, 4, 1, 'var(--primary)', 'transparent').replace('<svg', '<svg class="ring"');
      if (voiceOn) Sp.say(r.t.replace(/[«»]/g, ''), { rate: 1 });
      tick = setInterval(function () {
        remaining--;
        if (remaining <= 0) { App.Sound.play('tick'); go(i + 1); return; }
        var sp = r.num.querySelector('span');
        if (sp) sp.textContent = remaining;
        App.UI.setRing(r.num, remaining / r.secs);
      }, 1000);
    }
    startBtn.addEventListener('click', function () {
      startBtn.classList.add('hidden');
      nextBtn.classList.remove('hidden');
      go(0);
    });
    nextBtn.addEventListener('click', function () { if (!done) go(cur + 1); });
    return {
      el: root, kind: 'activity',
      destroy: function () { clearInterval(tick); Sp.stopSaying(); }
    };
  };

  /* ================= PAROLE LIBRE + ANALYSE ================= */
  Ex.free = function (step, ctx) {
    var root = h('div.step');
    var phaseBox = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '18px' } });
    root.appendChild(phaseBox);
    var api = { el: root, kind: 'activity', speaking: true };
    var timers = [], session = null, prepTick, speakTick;
    var isRead = step.mode === 'read';
    var reported = false;

    function clearTimers() { clearInterval(prepTick); clearInterval(speakTick); timers.forEach(clearTimeout); }

    function topicCard() {
      if (isRead) {
        return h('div.topic-card', null, [
          h('div.lbl', { text: step.topic }),
          h('div.read-text', { html: richText(step.text), style: { marginTop: '8px' } }),
          step.author ? h('div.read-src', { text: step.author }) : null
        ]);
      }
      var kids = [h('div.lbl', { text: 'Ton sujet' }), h('div.topic', { text: step.topic })];
      if (step.words) kids.push(h('div.words', null, step.words.map(function (w) { return h('span', { text: w }); })));
      return h('div.topic-card', null, kids);
    }
    function tipsRow() {
      if (!step.tips || !step.tips.length) return null;
      return h('div.tips', null, step.tips.map(function (t) { return h('span', { text: t }); }));
    }

    /* 1. Présentation du sujet */
    function intro() {
      clearTimers();
      U.clear(phaseBox);
      phaseBox.appendChild(h('span.tag-new', { html: App.icon('micFill') + (isRead ? 'Lecture à voix haute' : 'Parole libre · ' + U.fmtDuration(step.duration)) }));
      phaseBox.appendChild(title(step.prompt || 'À toi la parole'));
      phaseBox.appendChild(topicCard());
      var t = tipsRow();
      if (t) phaseBox.appendChild(t);
      var row = h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' } });
      if (step.reroll && !isRead) {
        row.appendChild(h('button.btn.ghost', {
          type: 'button', html: App.icon('refresh') + '<span>Autre sujet</span>',
          onclick: function () {
            var n = App.Gen.reroll(step);
            step.topic = n.topic; step.words = n.words; step.tips = n.tips || step.tips;
            App.Sound.play('tap');
            intro();
          }
        }));
      }
      var go = h('button.btn', { type: 'button', text: isRead || !step.prep ? 'Je commence' : 'Préparer (' + step.prep + ' s)' });
      go.addEventListener('click', function () { if (isRead || !step.prep) speak(); else prep(); });
      row.appendChild(go);
      phaseBox.appendChild(row);
      if (!Sp.micSupported()) {
        phaseBox.appendChild(h('div.alert', { html: App.icon('bulb') + '<span>Micro indisponible ici : tu pourras parler avec le chronomètre, sans analyse automatique.</span>' }));
      } else if (!Sp.srSupported()) {
        phaseBox.appendChild(h('div.alert', { html: App.icon('bulb') + '<span>Ton navigateur ne transcrit pas la voix : j\'analyserai tes pauses et ta mélodie, et tu compteras tes tics en te réécoutant. Pour l\'analyse complète, utilise Chrome ou Safari.</span>' }));
      }
    }

    /* 2. Préparation */
    function prep() {
      clearTimers();
      U.clear(phaseBox);
      var left = step.prep;
      var num = h('div.prep-big', { text: String(left), 'aria-live': 'off' });
      phaseBox.appendChild(h('span.tag-new', { html: App.icon('clock') + 'Préparation' }));
      phaseBox.appendChild(topicCard());
      phaseBox.appendChild(h('div.center', null, [num, h('p.muted', { text: 'Trouve ton idée principale et deux arguments.', style: { fontWeight: 700, marginTop: '8px' } })]));
      var t = tipsRow();
      if (t) phaseBox.appendChild(t);
      var ready = h('button.btn', { type: 'button', text: 'Je suis prêt(e)' });
      ready.addEventListener('click', speak);
      phaseBox.appendChild(h('div.center', null, ready));
      prepTick = setInterval(function () {
        left--;
        num.textContent = String(Math.max(0, left));
        if (left <= 3 && left > 0) App.Sound.play('tick');
        if (left <= 0) speak();
      }, 1000);
    }

    /* 3. Prise de parole */
    function speak() {
      clearTimers();
      U.clear(phaseBox);
      var target = step.duration || 60;
      var ring = h('div.timer-ring', { html: App.UI.ring(150, 12, 0, 'var(--primary)') });
      var tLabel = h('div.t', { html: '0:00<small>sur ' + U.fmtTime(target) + '</small>' });
      ring.appendChild(tLabel);
      var meter = h('div.level-meter', { 'aria-hidden': 'true' });
      var bars = [];
      for (var i = 0; i < 18; i++) { var b = h('i'); bars.push(b); meter.appendChild(b); }
      var liveBox = h('div.live-box', { text: Sp.srSupported() ? 'La transcription apparaîtra ici…' : 'Parle librement, je mesure ta voix.' });
      var fillersLive = h('div.live-fillers');
      var stopBtn = h('button.btn.red', { type: 'button', html: App.icon('stop') + '<span>Terminer</span>' });
      var status = h('div.mic-label', { text: 'Démarrage du micro…' });

      phaseBox.appendChild(topicCard());
      phaseBox.appendChild(h('div.mic-zone', null, [ring, meter, status]));
      if (!isRead) { phaseBox.appendChild(liveBox); phaseBox.appendChild(fillersLive); }
      phaseBox.appendChild(h('div.center', null, stopBtn));

      var startedAt = Date.now();
      var noMic = false;
      function elapsed() { return (Date.now() - startedAt) / 1000; }
      function updateTimer() {
        var e = elapsed();
        tLabel.innerHTML = U.fmtTime(e) + '<small>sur ' + U.fmtTime(target) + '</small>';
        App.UI.setRing(ring, e / target);
        if (e >= target && !status.dataset.over) {
          status.dataset.over = '1';
          status.textContent = 'Temps atteint ! Termine ta phrase.';
          App.Sound.play('start');
        }
        if (e >= target + 20) stop();
      }

      function stop() {
        clearInterval(speakTick);
        stopBtn.disabled = true;
        status.textContent = 'Analyse en cours…';
        App.Sound.play('stop');
        if (noMic || !session) { selfReport(elapsed()); return; }
        var s = session; session = null;
        s.stop().then(function (r) { report(r); }).catch(function () { selfReport(elapsed()); });
      }
      stopBtn.addEventListener('click', stop);

      if (!Sp.micSupported()) { startNoMic(); return; }
      session = Sp.session({
        onLevel: function (rms) {
          var lvl = U.clamp(rms * 9, 0, 1);
          bars.forEach(function (b, k) {
            var f = 0.45 + 0.55 * Math.abs(Math.sin((Date.now() / 110) + k * 0.9));
            b.style.height = Math.round(6 + lvl * 38 * f) + 'px';
          });
        },
        onTranscript: function (t) {
          liveBox.innerHTML = App.Analysis.highlightFillers(t);
          liveBox.scrollTop = liveBox.scrollHeight;
          var n = App.Analysis.findFillers(t).total;
          fillersLive.textContent = n ? U.plural(n, 'tic repéré', 'tics repérés') : '';
        }
      });
      session.start().then(function () {
        startedAt = Date.now();
        status.textContent = 'Parle ! Je t\'écoute.';
        App.Sound.play('start');
        speakTick = setInterval(updateTimer, 250);
      }).catch(function (err) {
        session = null;
        status.textContent = Sp.errorText(err);
        if (err && err.error === 'not-allowed') ctx.offerNoSpeak();
        startNoMic();
      });

      function startNoMic() {
        noMic = true;
        meter.remove();
        status.textContent = 'Parle à voix haute, le chronomètre tourne.';
        startedAt = Date.now();
        speakTick = setInterval(updateTimer, 250);
      }
    }

    function ratingFor(key, r) {
      var s = (r.parts.filter(function (p) { return p.key === key; })[0] || {}).score;
      if (s === undefined) return '';
      return s >= 85 ? 'good' : s >= 60 ? 'mid' : 'bad';
    }
    function metric(k, v, sub, cls) {
      return h('div.metric.' + (cls || 'none'), null, [h('div.k', { text: k }), h('div.v', { html: v }), sub ? h('div.s', { text: sub }) : null]);
    }

    /* 4a. Rapport complet */
    function report(rec) {
      clearTimers();
      var r = App.Analysis.analyze(rec, { kind: isRead ? 'lecture' : 'libre', target: isRead ? 0 : step.duration });
      var readAcc = null;
      if (isRead && r.hasText) readAcc = Math.round(U.compareSpeech(step.text, rec.transcript).score * 100);
      showReport(r, rec, readAcc);
    }

    function showReport(r, rec, readAcc) {
      U.clear(phaseBox);
      var score = r.score;
      if (readAcc !== null) score = Math.round(((score || readAcc) + readAcc) / 2);
      var head = h('div.report-head');
      var color = score === null ? 'var(--primary)' : score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--gold)' : 'var(--red)';
      var sr = h('div.score-ring', { html: App.UI.ring(112, 12, (score || 0) / 100, color) });
      sr.appendChild(h('div.v', { html: (score === null ? '—' : score) + '<small>sur 100</small>' }));
      var mood = score === null ? 'happy' : score >= 80 ? 'celebrate' : score >= 60 ? 'happy' : 'talk';
      head.appendChild(sr);
      head.appendChild(h('div', null, [
        h('h2.step-title', { text: score === null ? 'Bravo, tu l\'as fait !' : score >= 85 ? 'Magnifique !' : score >= 70 ? 'Très bien !' : score >= 55 ? 'Bon début !' : 'Continue, ça vient !' }),
        h('p.muted', { text: 'Durée : ' + U.fmtDuration(r.speakSpan || r.duration), style: { fontWeight: 800, margin: '4px 0 0' } })
      ]));
      phaseBox.appendChild(head);

      var m = h('div.metrics');
      if (readAcc !== null) m.appendChild(metric('Lecture', readAcc + ' %', readAcc >= 90 ? 'Très précise' : readAcc >= 75 ? 'Correcte' : 'Des mots manqués', readAcc >= 90 ? 'good' : readAcc >= 75 ? 'mid' : 'bad'));
      if (r.wpm !== null) m.appendChild(metric('Débit', r.wpm + ' <small>mots/min</small>', r.wpm < 110 ? 'Un peu lent' : r.wpm > 180 ? 'Trop rapide' : 'Idéal', ratingFor('debit', r)));
      if (r.fillers !== null) m.appendChild(metric('Tics', String(r.fillers), r.fillers === 0 ? 'Aucun, bravo !' : U.num(r.fillersPerMin) + ' par minute', ratingFor('tics', r)));
      if (r.pausesPerMin !== null) m.appendChild(metric('Pauses', String(r.pauses), r.longPauses ? U.plural(r.longPauses, 'blanc') + ' de plus de 2 s' : r.pausesPerMin < 2.5 ? 'Peu de pauses' : 'Bien rythmé', ratingFor('pauses', r)));
      if (r.pitchVar !== null) m.appendChild(metric('Intonation', U.num(r.pitchVar) + ' <small>demi-tons</small>', r.pitchVar >= 3 ? 'Expressive' : r.pitchVar >= 2 ? 'Vivante' : 'Plutôt monotone', ratingFor('intonation', r)));
      if (r.richness !== null) m.appendChild(metric('Vocabulaire', Math.round(r.richness * 100) + ' %', r.richness >= 0.7 ? 'Varié' : 'Des répétitions', ratingFor('vocabulaire', r)));
      if (m.children.length) phaseBox.appendChild(m);

      // Conseils d'Ahouéfa
      var fbl = h('ul.fb-list');
      r.feedback.good.forEach(function (g) { fbl.appendChild(h('li.g', { html: App.icon('check') + '<span>' + U.esc(g) + '</span>' })); });
      r.feedback.tips.slice(0, 3).forEach(function (t) { fbl.appendChild(h('li.t', { html: App.icon('bulb') + '<span>' + U.esc(t) + '</span>' })); });
      if (fbl.children.length) phaseBox.appendChild(h('div.card', null, [h('h3', { text: 'Les conseils d\'Ahouéfa' }), fbl]));

      if (r.contour && r.contour.length > 5) {
        phaseBox.appendChild(h('div', null, [h('div.k', { text: 'La mélodie de ta voix', style: { fontWeight: 900, marginBottom: '6px' } }), h('div', { html: App.UI.pitchSVG(r.contour) })]));
      }

      if (rec && rec.url) {
        var audio = h('audio', { controls: true, src: rec.url, style: { width: '100%' } });
        phaseBox.appendChild(h('div', null, [h('div', { text: 'Réécoute-toi', style: { fontWeight: 900, marginBottom: '6px' } }), audio]));
        if (!r.hasText && !isRead) {
          // Pas de transcription : la personne compte elle-même ses tics
          var n = 0;
          var cnt = h('div.counter-big', { text: '0' });
          var plus = h('button.btn.red', { type: 'button', text: '+1 tic' });
          plus.addEventListener('click', function () {
            n++; cnt.textContent = String(n); App.Sound.play('tap');
            r.fillers = n;
            r.fillersPerMin = Math.round(n / Math.max(1, r.speakSpan) * 600) / 10;
          });
          phaseBox.appendChild(h('div.card.center', null, [
            h('h3', { text: 'Compte tes tics en te réécoutant' }),
            h('p.muted', { text: 'Lance l\'écoute et appuie à chaque « euh », « du coup », « en fait »…', style: { fontWeight: 700 } }),
            cnt, h('div', { style: { marginTop: '10px' } }, plus)
          ]));
        }
      }
      if (r.transcript) {
        phaseBox.appendChild(h('details.transcript', null, [
          h('summary', { text: 'Voir la transcription' }),
          h('p', { html: App.Analysis.highlightFillers(r.transcript) })
        ]));
      }
      var again = h('button.btn.ghost', { type: 'button', html: App.icon('refresh') + '<span>Recommencer</span>' });
      again.addEventListener('click', function () { intro(); });
      phaseBox.appendChild(h('div.center', null, again));

      if (!reported) {
        reported = true;
        Store.recordSpeech(Object.assign({}, r, { score: score }));
        var counts = { speeches: 1, speakSecs: r.speakSpan || r.duration || 0, speakOk: 1 };
        if (r.hasText && r.fillers === 0 && (r.speakSpan || 0) >= 30) counts.zeroFillers = 1;
        ctx.complete({ activity: true, quiet: true, counts: counts, bonusXP: 5 });
        var says = App.Mascot.says(score === null ? 'Super, tu as osé parler !' : score >= 80 ? 'Wahou, quelle aisance !' : 'Chaque prise de parole te rend plus fort(e) !', { mood: mood, size: 80, talkFor: 1800, after: mood === 'talk' ? 'happy' : mood });
        phaseBox.insertBefore(says, phaseBox.children[1] || null);
      }
    }

    /* 4b. Sans micro : auto-évaluation */
    function selfReport(secs) {
      clearTimers();
      U.clear(phaseBox);
      phaseBox.appendChild(App.Mascot.says('Bravo, tu as parlé ' + U.fmtDuration(secs) + ' ! Comment ça s\'est passé ?', { mood: 'happy', size: 90 }));
      var qs = [
        ['As-tu gardé le fil de tes idées ?', 'structure'],
        ['As-tu évité les « euh » et « du coup » ?', 'tics'],
        ['As-tu fait des pauses et varié ta voix ?', 'voix']
      ];
      var answers = {};
      var box = h('div', { style: { display: 'grid', gap: '16px' } });
      qs.forEach(function (q) {
        var row = h('div.seg');
        ['Pas vraiment', 'Plutôt', 'Oui !'].forEach(function (lbl, k) {
          var b = h('button.choice', { type: 'button', text: lbl });
          b.addEventListener('click', function () {
            answers[q[1]] = k;
            U.$$('button', row).forEach(function (x) { x.classList.toggle('sel', x === b); });
            if (Object.keys(answers).length === qs.length && !reported) {
              reported = true;
              var score = Math.round((answers.structure + answers.tics + answers.voix) / 6 * 100);
              Store.recordSpeech({ kind: isRead ? 'lecture' : 'libre', duration: secs, score: score });
              ctx.complete({ activity: true, quiet: true, counts: { speeches: 1, speakSecs: secs }, bonusXP: 5 });
            }
          });
          row.appendChild(b);
        });
        box.appendChild(h('div', null, [h('div', { text: q[0], style: { fontWeight: 800, marginBottom: '8px' } }), row]));
      });
      phaseBox.appendChild(box);
      var again = h('button.btn.ghost', { type: 'button', html: App.icon('refresh') + '<span>Recommencer</span>' });
      again.addEventListener('click', function () { intro(); });
      phaseBox.appendChild(h('div.center', null, again));
    }

    intro();
    api.destroy = function () { clearTimers(); if (session) session.cancel(); Sp.stopSaying(); };
    return api;
  };

  App.Ex = Ex;
})(window.App = window.App || {});

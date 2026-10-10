/* Voix : synthèse (Ahouéfa lit), reconnaissance vocale, enregistrement et mesures audio
   (volume, hauteur de la voix). Tout se passe dans le navigateur. */
(function (App) {
  'use strict';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var Sp = {};

  function settings() { return App.Store.get().settings; }

  Sp.srSupported = function () { return !!SR; };
  Sp.ttsSupported = function () { return 'speechSynthesis' in window; };
  Sp.micSupported = function () {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext !== false;
  };
  Sp.recorderSupported = function () { return typeof window.MediaRecorder !== 'undefined'; };

  /* ---------- Synthèse vocale ---------- */
  var voicesCache = [];
  function loadVoices() {
    if (!Sp.ttsSupported()) return [];
    voicesCache = window.speechSynthesis.getVoices() || [];
    return voicesCache;
  }
  if (Sp.ttsSupported()) {
    loadVoices();
    try { window.speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { /* ancien navigateur */ }
  }
  Sp.frenchVoices = function () {
    return loadVoices().filter(function (v) { return /^fr/i.test(v.lang); });
  };
  Sp.pickVoice = function () {
    var list = Sp.frenchVoices();
    if (!list.length) return null;
    var wanted = settings().voiceURI;
    if (wanted) {
      var w = list.filter(function (v) { return v.voiceURI === wanted; })[0];
      if (w) return w;
    }
    var fem = /(Amélie|Amelie|Audrey|Aurélie|Aurelie|Marie|Julie|Céline|Celine|Denise|Hortense|Virginie|Léa|Lea|Chantal|Sylvie|Vivienne|Eloise|Brigitte|Google français)/i;
    var fr = list.filter(function (v) { return /fr[-_]FR/i.test(v.lang); });
    return (fr.filter(function (v) { return fem.test(v.name); })[0]) || fr[0] || list[0];
  };

  Sp.say = function (text, opts) {
    opts = opts || {};
    if (!Sp.ttsSupported()) return Promise.resolve(false);
    var synth = window.speechSynthesis;
    try { synth.cancel(); } catch (e) { /* rien */ }
    var clean = String(text).replace(/\*\*?/g, '').replace(/\s\/\/?\s/g, ', ');
    var u = new window.SpeechSynthesisUtterance(clean);
    u.lang = 'fr-FR';
    u.rate = opts.rate || settings().rate || 0.95;
    u.pitch = opts.pitch || 1.08;
    var v = Sp.pickVoice();
    if (v) u.voice = v;
    return new Promise(function (resolve) {
      var done = false;
      function fin(ok) { if (!done) { done = true; resolve(ok); } }
      u.onend = function () { fin(true); };
      u.onerror = function () { fin(false); };
      synth.speak(u);
      // Garde-fou : certains navigateurs n'envoient jamais « end »
      setTimeout(function () { fin(true); }, 1500 + clean.length * 120);
    });
  };
  Sp.stopSaying = function () { if (Sp.ttsSupported()) { try { window.speechSynthesis.cancel(); } catch (e) { /* rien */ } } };

  /* ---------- Reconnaissance : une phrase ---------- */
  /* Écoute jusqu'à ce que la personne ait fini. Renvoie un contrôleur :
     { promise -> {transcripts: [..], interim}, stop() } */
  Sp.listen = function (opts) {
    opts = opts || {};
    var rec = new SR();
    rec.lang = settings().srLang || 'fr-FR';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 3;

    var finals = [];       // textes finaux successifs
    var alts = [];         // alternatives du dernier résultat final
    var interim = '';
    var lastAt = Date.now();
    var started = Date.now();
    var ended = false;
    var heardSomething = false;
    var expectedWords = opts.expectedWords || 8;
    var maxMs = opts.maxMs || Math.max(8000, expectedWords * 900 + 4000);
    var timer;

    var ctrl = {};
    ctrl.promise = new Promise(function (resolve, reject) {
      function finish(err) {
        if (ended) return;
        ended = true;
        clearInterval(timer);
        try { rec.stop(); } catch (e) { /* rien */ }
        var texts = candidates();
        if (err && !texts.length) reject(err);
        else if (!texts.length) reject({ error: 'no-speech' });
        else resolve({ transcripts: texts });
      }
      function candidates() {
        var c = [];
        var concat = finals.join(' ').trim();
        if (concat) c.push(concat);
        if (finals.length > 1) c.push(finals[finals.length - 1]);
        alts.forEach(function (a) { if (a) c.push(a); });
        if (interim) c.push((concat + ' ' + interim).trim(), interim);
        return c.filter(function (x, i) { return x && c.indexOf(x) === i; });
      }
      rec.onresult = function (ev) {
        lastAt = Date.now();
        heardSomething = true;
        interim = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var r = ev.results[i];
          if (r.isFinal) {
            var t = r[0].transcript.trim();
            var prev = finals[finals.length - 1];
            // Android répète parfois le texte cumulé : on remplace au lieu d'ajouter
            if (prev && t.toLowerCase().indexOf(prev.toLowerCase()) === 0) finals[finals.length - 1] = t;
            else if (t) finals.push(t);
            alts = [];
            for (var k = 1; k < r.length; k++) alts.push(r[k].transcript.trim());
          } else {
            interim += r[0].transcript;
          }
        }
        if (opts.onInterim) opts.onInterim((finals.join(' ') + ' ' + interim).trim());
      };
      rec.onerror = function (ev) {
        if (ev.error === 'no-speech' && heardSomething) return;
        if (ev.error === 'aborted' && ended) return;
        finish({ error: ev.error || 'error' });
      };
      rec.onend = function () {
        if (!ended) finish(null);
      };
      try { rec.start(); } catch (e) { finish({ error: 'start-failed' }); return; }
      if (opts.onStart) opts.onStart();
      timer = setInterval(function () {
        var now = Date.now();
        var said = App.U.words(finals.join(' ') + ' ' + interim).length;
        var silent = now - lastAt;
        if (heardSomething && said >= expectedWords && silent > 1100) finish(null);
        else if (heardSomething && silent > 2600) finish(null);
        else if (!heardSomething && now - started > 9000) finish({ error: 'no-speech' });
        else if (now - started > maxMs) finish(null);
      }, 200);
    });
    ctrl.stop = function () { try { rec.stop(); } catch (e) { /* rien */ } };
    ctrl.abort = function () { try { rec.abort(); } catch (e) { /* rien */ } };
    return ctrl;
  };

  /* ---------- Micro, enregistrement et analyse continue ---------- */
  Sp.getMic = function () {
    if (!Sp.micSupported()) return Promise.reject({ error: 'unsupported' });
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    }).catch(function (e) {
      var name = e && e.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') throw { error: 'not-allowed' };
      if (name === 'NotFoundError' || name === 'OverconstrainedError') throw { error: 'no-mic' };
      throw { error: 'mic-failed' };
    });
  };

  /* Détection de la fréquence fondamentale (méthode YIN simplifiée). */
  function pitchYIN(buf, sr) {
    var maxLag = Math.min(Math.floor(sr / 70), Math.floor(buf.length / 2));
    var minLag = Math.floor(sr / 450);
    var W = buf.length - maxLag;
    var d = new Float32Array(maxLag + 1);
    var cm = new Float32Array(maxLag + 1);
    var tau, j, s, x;
    for (tau = 1; tau <= maxLag; tau++) {
      s = 0;
      for (j = 0; j < W; j++) { x = buf[j] - buf[j + tau]; s += x * x; }
      d[tau] = s;
    }
    var run = 0;
    cm[0] = 1;
    for (tau = 1; tau <= maxLag; tau++) { run += d[tau]; cm[tau] = run ? d[tau] * tau / run : 1; }
    var best = -1;
    for (tau = minLag; tau <= maxLag; tau++) {
      if (cm[tau] < 0.15) {
        while (tau + 1 <= maxLag && cm[tau + 1] < cm[tau]) tau++;
        best = tau;
        break;
      }
    }
    if (best < 0) return -1;
    var x0 = cm[best - 1] !== undefined ? cm[best - 1] : cm[best];
    var x2 = best + 1 <= maxLag ? cm[best + 1] : cm[best];
    var den = 2 * (2 * cm[best] - x2 - x0);
    var t = den ? best + (x2 - x0) / den : best;
    return sr / t;
  }
  Sp._pitch = pitchYIN;

  /* Session d'enregistrement : micro + enregistreur + analyse audio + transcription (si possible). */
  Sp.session = function (opts) {
    opts = opts || {};
    var S = { frames: [], finals: [], interim: '', srError: null, active: false };
    var stream, actx, analyser, source, recorder, chunks = [], timer, rec, startedAt;
    var buf;

    S.start = function () {
      return Sp.getMic().then(function (st) {
        stream = st;
        S.active = true;
        startedAt = performance.now();
        var AC = window.AudioContext || window.webkitAudioContext;
        try {
          actx = App.Sound.context() || new AC();
          source = actx.createMediaStreamSource(stream);
          analyser = actx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          buf = new Float32Array(analyser.fftSize);
        } catch (e) { analyser = null; }

        if (Sp.recorderSupported() && opts.record !== false) {
          try {
            var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
            var mime = types.filter(function (t) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t); })[0];
            recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
            recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
            recorder.start(500);
          } catch (e) { recorder = null; }
        }

        timer = setInterval(sample, 100);
        if (opts.transcribe !== false && Sp.srSupported()) startSR();
        return S;
      });
    };

    function sample() {
      if (!analyser) return;
      if (analyser.getFloatTimeDomainData) analyser.getFloatTimeDomainData(buf);
      else {
        var b8 = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(b8);
        for (var k = 0; k < b8.length; k++) buf[k] = (b8[k] - 128) / 128;
      }
      var sum = 0;
      for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      var rms = Math.sqrt(sum / buf.length);
      var f0 = rms > 0.012 ? pitchYIN(buf, actx.sampleRate) : -1;
      if (f0 > 0 && (f0 < 70 || f0 > 450)) f0 = -1;
      var t = (performance.now() - startedAt) / 1000;
      S.frames.push({ t: t, rms: rms, f0: f0 });
      if (opts.onLevel) opts.onLevel(rms, f0, t);
    }

    function startSR() {
      try {
        rec = new SR();
        rec.lang = settings().srLang || 'fr-FR';
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = function (ev) {
          S.interim = '';
          for (var i = ev.resultIndex; i < ev.results.length; i++) {
            var r = ev.results[i];
            if (r.isFinal) {
              var t = r[0].transcript.trim();
              var prev = S.finals[S.finals.length - 1];
              if (prev && t.toLowerCase().indexOf(prev.toLowerCase()) === 0) S.finals[S.finals.length - 1] = t;
              else if (t) S.finals.push(t);
            } else S.interim += r[0].transcript;
          }
          if (opts.onTranscript) opts.onTranscript(S.transcript(true));
        };
        rec.onerror = function (ev) {
          if (ev.error === 'no-speech' || ev.error === 'aborted') return;
          S.srError = ev.error;
          if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed' || ev.error === 'network' || ev.error === 'audio-capture') rec = null;
        };
        rec.onend = function () {
          // La reconnaissance s'arrête d'elle-même après un silence : on relance tant que la session tourne
          if (S.active && rec) { try { rec.start(); } catch (e) { /* déjà relancée */ } }
        };
        rec.start();
      } catch (e) { S.srError = 'start-failed'; rec = null; }
    }

    S.transcript = function (withInterim) {
      return (S.finals.join(' ') + (withInterim && S.interim ? ' ' + S.interim : '')).replace(/\s+/g, ' ').trim();
    };
    S.elapsed = function () { return startedAt ? (performance.now() - startedAt) / 1000 : 0; };

    S.stop = function () {
      S.active = false;
      clearInterval(timer);
      var duration = S.elapsed();
      var srWas = rec;
      rec = null;
      if (srWas) { try { srWas.stop(); } catch (e) { /* rien */ } }
      var recDone = new Promise(function (resolve) {
        if (!recorder || recorder.state === 'inactive') return resolve(null);
        recorder.onstop = function () {
          var blob = chunks.length ? new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }) : null;
          resolve(blob);
        };
        try { recorder.stop(); } catch (e) { resolve(null); }
      });
      // Laisse 700 ms à la reconnaissance pour livrer ses derniers mots
      var srDone = new Promise(function (r) { setTimeout(r, srWas ? 700 : 0); });
      return Promise.all([recDone, srDone]).then(function (res) {
        var blob = res[0];
        try { if (source) source.disconnect(); } catch (e) { /* rien */ }
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
        if (S.interim) { S.finals.push(S.interim); S.interim = ''; }
        return {
          duration: duration,
          frames: S.frames,
          transcript: S.transcript(false),
          srAvailable: Sp.srSupported() && !S.srError,
          srError: S.srError,
          blob: blob,
          url: blob ? URL.createObjectURL(blob) : null
        };
      });
    };

    S.cancel = function () {
      S.active = false;
      clearInterval(timer);
      if (rec) { try { rec.abort(); } catch (e) { /* rien */ } rec = null; }
      try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch (e) { /* rien */ }
      try { if (source) source.disconnect(); } catch (e) { /* rien */ }
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    };

    return S;
  };

  /* Messages d'erreur lisibles */
  Sp.errorText = function (err) {
    var e = err && err.error;
    switch (e) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Le micro est bloqué. Autorise-le dans les réglages du navigateur (icône à gauche de l\'adresse), puis réessaie.';
      case 'no-mic':
      case 'audio-capture':
        return 'Aucun micro détecté. Branche un micro ou utilise un téléphone.';
      case 'no-speech':
        return 'Je n\'ai rien entendu. Parle un peu plus fort, près du micro.';
      case 'network':
        return 'La reconnaissance vocale a besoin d\'Internet dans ce navigateur.';
      case 'unsupported':
        return 'Ton navigateur ne permet pas d\'utiliser le micro ici (il faut une adresse en https).';
      default:
        return 'Le micro n\'a pas fonctionné. Réessaie.';
    }
  };

  App.Speech = Sp;
})(window.App = window.App || {});

// Maths APC — logique de l'interface.

import { CLASSES, PROGRAMMES_DEFAUT, SERIES_TECHNIQUES, cleClasse, libelleClasse, analyserProgramme, noteSerie } from './programmes.js';
import { messageFiche, messageEvaluation, messageModification, messageRetouche, libelleTypeEval } from './prompts.js';
import { renderMarkdown, decouper } from './markdown.js';
import { lireFichier, blocsPourIA, ACCEPTES } from './fichiers.js';
import * as S from './stockage.js';
import { telecharger, nomFichier, imprimer, copier, partager, partageDisponible } from './export.js';
import { blobDocx } from './docx.js';
import { genererViaClaude } from './ia-claude.js';
import { EXEMPLES } from './exemples.js';

const MODELES = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 (recommandé)' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 (plus économique)' },
];
const VUES = ['fiche', 'modifier', 'eval', 'docs', 'programmes', 'reglages', 'resultat'];
const AUTRE = '__autre';

const $ = (sel, racine = document) => racine.querySelector(sel);
const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];

const etat = {
  vue: null,
  vuePrecedente: 'fiche',
  doc: null,
  generation: null,
  fichiers: [], // { id, nom, statut: 'lecture'|'ok'|'erreur', donnees, message }
  // Ouverte comme page claude.ai, l'application utilise le compte Claude de la personne
  modeClaude: false,
  claude: { sample: null, downloads: null, imagesOk: false },
};

// L'IA (SDK de 300 ko) est chargée en arrière-plan, pas au démarrage.
let moduleIA = null;
function chargerIA() {
  if (!moduleIA) {
    moduleIA = import('./ia.js').catch(() => {
      moduleIA = null;
      throw new Error('Chargement de l\'IA impossible : vérifie ta connexion internet puis réessaie.');
    });
  }
  return moduleIA;
}

// ================================================================ outils

let minuteurToast;
function toast(message) {
  const t = $('#toast');
  t.textContent = message;
  t.classList.add('visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => t.classList.remove('visible'), 2800);
}

function aAcces(r = S.lireReglages()) {
  if (etat.claude.sample) return true;
  return (r.relais && r.relais.trim() && r.codeAcces && r.codeAcces.trim()) || (r.cle && r.cle.trim());
}

function programmeDe(cle) {
  const perso = S.lireProgrammesPerso()[cle];
  return {
    texte: perso && perso.texte != null ? perso.texte : (PROGRAMMES_DEFAUT[cle] || ''),
    notes: perso ? perso.notes || '' : '',
    modifie: !!perso,
  };
}

/** Contexte commun envoyé à l'IA pour une classe. */
function contexteClasse({ ens, classe, serie }) {
  const cle = cleClasse(ens, classe, serie);
  const prog = programmeDe(cle);
  const profil = S.lireProfil();
  return {
    ens, classe, serie,
    classeLibelle: libelleClasse(ens, classe, serie),
    noteSerie: noteSerie(ens, serie),
    programme: prog.texte,
    notesClasse: prog.notes,
    profil,
    consignesPerso: profil.consignes,
  };
}

function marquerInvalide(el, message) {
  el.classList.add('invalide');
  el.setAttribute('aria-invalid', 'true');
  let p = el.parentElement.querySelector('.erreur-champ');
  if (!p) {
    p = document.createElement('p');
    p.className = 'erreur-champ';
    p.id = `${el.id}-erreur`;
    el.after(p);
  }
  p.textContent = message;
  el.setAttribute('aria-describedby', p.id);
  el.focus();
  el.addEventListener('input', () => {
    el.classList.remove('invalide');
    el.removeAttribute('aria-invalid');
    p.remove();
  }, { once: true });
}

function dateCourte(ms) {
  try {
    return new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1);

// ================================================================ navigation

function afficherVue(nom, { historique = true } = {}) {
  if (!VUES.includes(nom)) nom = 'fiche';
  if (nom === 'resultat' && !etat.doc) nom = etat.vuePrecedente || 'fiche';
  for (const v of VUES) $(`#vue-${v}`).hidden = v !== nom;
  for (const b of $$('[data-vue]')) {
    if (b.dataset.vue === nom) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }
  if (nom !== 'resultat') etat.vuePrecedente = nom;
  const changement = etat.vue !== nom;
  etat.vue = nom;
  if (historique && changement) history.pushState({ vue: nom }, '', `#${nom === 'resultat' ? 'document' : nom}`);
  if (nom === 'docs') afficherDocuments();
  if (nom === 'programmes') chargerProgramme();
  if (nom === 'reglages') chargerReglages();
  if (nom === 'fiche') $('#vue-fiche .bandeau-cle').hidden = !!aAcces();
  if (changement) {
    window.scrollTo(0, 0);
    const titre = $(`#vue-${nom} h1`);
    if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
  }
}

window.addEventListener('popstate', e => {
  const v = (e.state && e.state.vue) || location.hash.slice(1) || 'fiche';
  afficherVue(v === 'document' ? 'resultat' : v, { historique: false });
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-vue]');
  if (b) {
    e.preventDefault();
    afficherVue(b.dataset.vue);
  }
});

window.addEventListener('beforeunload', e => {
  if (etat.generation) { e.preventDefault(); e.returnValue = ''; }
});

// ================================================================ choix de la classe

const selecteurs = {};

function creerChoixClasse(conteneur, onChange) {
  const pour = conteneur.dataset.pour;
  conteneur.innerHTML = `
    <div class="segments" role="radiogroup" aria-label="Enseignement">
      <label><input type="radio" name="ens-${pour}" value="general"><span>Général</span></label>
      <label><input type="radio" name="ens-${pour}" value="technique"><span>Technique</span></label>
    </div>
    <div class="grille-2">
      <div class="champ"><label for="classe-${pour}">Classe</label><select id="classe-${pour}"></select></div>
      <div class="champ"><label for="serie-${pour}">Série</label><select id="serie-${pour}"></select></div>
    </div>`;
  const radios = $$(`input[name="ens-${pour}"]`, conteneur);
  const selClasse = $(`#classe-${pour}`, conteneur);
  const selSerie = $(`#serie-${pour}`, conteneur);
  const blocSerie = selSerie.parentElement;

  const valeur = () => ({
    ens: radios.find(r => r.checked).value,
    classe: selClasse.value,
    serie: blocSerie.hidden ? '' : selSerie.value,
  });

  function remplirClasses(ens, classe) {
    selClasse.innerHTML = CLASSES[ens].map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    if (classe && CLASSES[ens].some(c => c.id === classe)) selClasse.value = classe;
  }
  function remplirSeries(ens, serie) {
    const c = CLASSES[ens].find(x => x.id === selClasse.value);
    const series = c ? c.series : [];
    blocSerie.hidden = !series.length;
    selSerie.innerHTML = series.map(s => `<option value="${s}">${ens === 'technique' && SERIES_TECHNIQUES[s] ? `${s} — ${SERIES_TECHNIQUES[s]}` : s}</option>`).join('');
    if (serie && series.includes(serie)) selSerie.value = serie;
  }
  function definir(v, { silencieux = false } = {}) {
    const ens = v && CLASSES[v.ens] ? v.ens : 'general';
    radios.forEach(r => { r.checked = r.value === ens; });
    remplirClasses(ens, v && v.classe);
    remplirSeries(ens, v && v.serie);
    if (!silencieux) changer();
  }
  function changer() {
    const v = valeur();
    S.ecrireMemoire(`classe-${pour}`, v);
    S.ecrireMemoire('classe-derniere', v);
    onChange(v);
  }

  radios.forEach(r => r.addEventListener('change', () => { remplirClasses(r.value); remplirSeries(r.value); changer(); }));
  selClasse.addEventListener('change', () => { remplirSeries(valeur().ens, selSerie.value); changer(); });
  selSerie.addEventListener('change', changer);

  definir(S.lireMemoire(`classe-${pour}`, null) || S.lireMemoire('classe-derniere', { ens: 'general', classe: '6e' }), { silencieux: true });
  const api = { valeur, definir };
  selecteurs[pour] = api;
  onChange(valeur());
  return api;
}

// ================================================================ fiche

function initFiche() {
  const selPartie = $('#fiche-partie');
  const selNotion = $('#fiche-notion');
  const libre = $('#fiche-notion-libre');
  let parties = [];

  function remplirNotions() {
    const p = parties.find(x => x.titre === selPartie.value);
    const contenus = p ? p.contenus : [];
    selNotion.innerHTML = contenus.map((c, i) => `<option value="${i}">${escapeAttr(c)}</option>`).join('')
      + `<option value="${AUTRE}">Autre notion (je la saisis)…</option>`;
    libre.hidden = contenus.length > 0;
    if (!contenus.length) selNotion.value = AUTRE;
  }

  creerChoixClasse($('.choix-classe[data-pour="fiche"]'), v => {
    parties = analyserProgramme(programmeDe(cleClasse(v.ens, v.classe, v.serie)).texte);
    selPartie.innerHTML = parties.map(p => `<option>${escapeAttr(p.titre)}</option>`).join('')
      + '<option value="">Non précisée</option>';
    remplirNotions();
  });
  selPartie.addEventListener('change', remplirNotions);
  selNotion.addEventListener('change', () => {
    libre.hidden = selNotion.value !== AUTRE;
    if (!libre.hidden) libre.focus();
  });

  $('#form-fiche').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget;
    const p = parties.find(x => x.titre === selPartie.value);
    const notion = selNotion.value === AUTRE ? libre.value.trim() : (p ? p.contenus[+selNotion.value] : '');
    if (!notion) {
      libre.hidden = false;
      selNotion.value = AUTRE;
      marquerInvalide(libre, 'Indique la notion de la séquence.');
      return;
    }
    const classe = selecteurs.fiche.valeur();
    const ctx = contexteClasse(classe);
    const contenu = messageFiche({
      ...ctx,
      partie: selPartie.value,
      notion,
      numero: f.numero.value.trim(),
      duree: f.duree.value,
      effectif: f.effectif.value.trim(),
      precisions: f.precisions.value,
    });
    lancer({
      type: 'fiche',
      titre: `Fiche ${ctx.classeLibelle} — ${notion}`,
      contexte: { ...classe, notion, partie: selPartie.value },
      contenu,
      effortAuto: 'medium',
    });
  });
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ================================================================ modifier

function initModifier() {
  creerChoixClasse($('.choix-classe[data-pour="modifier"]'), () => {});
  const entree = $('#modif-fichiers');
  entree.accept = ACCEPTES;
  entree.addEventListener('change', () => { ajouterFichiers(entree.files); entree.value = ''; });

  const depot = $('#depot');
  ['dragenter', 'dragover'].forEach(t => depot.addEventListener(t, e => { e.preventDefault(); depot.classList.add('survol'); }));
  ['dragleave', 'drop'].forEach(t => depot.addEventListener(t, () => depot.classList.remove('survol')));
  depot.addEventListener('drop', e => { e.preventDefault(); ajouterFichiers(e.dataTransfer.files); });

  $('#liste-fichiers').addEventListener('click', e => {
    const b = e.target.closest('button[data-id]');
    if (!b) return;
    etat.fichiers = etat.fichiers.filter(f => f.id !== b.dataset.id);
    afficherFichiers();
  });

  $('#form-modifier').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget;
    const demande = f.demande.value.trim();
    if (etat.fichiers.some(x => x.statut === 'lecture')) { toast('Patiente : lecture des fichiers en cours…'); return; }
    const prets = etat.fichiers.filter(x => x.statut === 'ok').map(x => x.donnees);
    const textes = prets.filter(x => x.genre === 'texte').map(x => (prets.length > 1 ? `### Fichier « ${x.nom} »\n${x.texte}` : x.texte));
    const texte = [f.texte.value.trim(), ...textes].filter(Boolean).join('\n\n');
    const joints = prets.filter(x => x.genre !== 'texte');
    if (!texte && !joints.length) {
      toast('Importe ta fiche ou colle son texte.');
      $('#modif-texte').focus();
      return;
    }
    if (!demande) { marquerInvalide($('#modif-demande'), 'Dis ce qu\'il faut changer.'); return; }
    const classe = selecteurs.modifier.valeur();
    const ctx = contexteClasse(classe);
    const contenu = [
      ...blocsPourIA(joints),
      { type: 'text', text: messageModification({ ...ctx, texte, nbFichiers: joints.length, demande }) },
    ];
    const source = prets[0] ? ` (${prets[0].nom})` : '';
    lancer({
      type: 'modification',
      titre: `Fiche modifiée — ${ctx.classeLibelle}${source}`,
      contexte: { ...classe, demande },
      contenu,
      effortAuto: 'medium',
    });
  });
}

function ajouterFichiers(liste) {
  for (const fichier of liste) {
    const item = { id: S.nouvelId(), nom: fichier.name, statut: 'lecture' };
    etat.fichiers.push(item);
    lireFichier(fichier)
      .then(d => {
        if (etat.modeClaude && d.genre === 'pdf') throw new Error('PDF non accepté dans claude.ai : envoie des photos des pages ou le fichier Word.');
        if (etat.modeClaude && d.genre === 'image' && !etat.claude.imagesOk) throw new Error('photos non acceptées dans cette vue : importe le fichier Word ou colle le texte.');
        item.donnees = d;
        item.statut = 'ok';
      })
      .catch(err => { item.statut = 'erreur'; item.message = err.message || 'Fichier illisible.'; })
      .finally(afficherFichiers);
  }
  afficherFichiers();
}

function afficherFichiers() {
  $('#liste-fichiers').innerHTML = etat.fichiers.map(f => {
    const info = f.statut === 'lecture' ? ' — lecture…' : f.statut === 'erreur' ? ` — ${f.message}` : '';
    return `<li class="${f.statut === 'erreur' ? 'erreur' : ''}"><span title="${escapeAttr(f.nom)}">${escapeAttr(f.nom)}${escapeAttr(info)}</span>
      <button type="button" data-id="${f.id}" aria-label="Retirer ${escapeAttr(f.nom)}"><svg aria-hidden="true"><use href="#i-x"/></svg></button></li>`;
  }).join('');
}

// ================================================================ évaluations

function initEval() {
  const boite = $('#eval-contenus');
  creerChoixClasse($('.choix-classe[data-pour="eval"]'), v => {
    const parties = analyserProgramme(programmeDe(cleClasse(v.ens, v.classe, v.serie)).texte);
    boite.innerHTML = parties.map((p, i) => `
      <details ${i === 0 ? 'open' : ''}>
        <summary>${escapeAttr(p.titre)}</summary>
        <label class="case tout"><input type="checkbox" data-tout="${i}"> <span>Toute la partie</span></label>
        ${p.contenus.map(c => `<label class="case"><input type="checkbox" name="contenu" data-partie="${i}" value="${escapeAttr(c)}" data-titre="${escapeAttr(p.titre)}"> <span>${escapeAttr(c)}</span></label>`).join('')}
      </details>`).join('') || '<p class="aide">Aucun programme pour cette classe : saisis les contenus ci-dessous ou complète l\'onglet Programmes.</p>';
  });
  boite.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.tout != null) {
      $$(`input[data-partie="${t.dataset.tout}"]`, boite).forEach(c => { c.checked = t.checked; });
    } else if (t.dataset.partie != null) {
      const cases = $$(`input[data-partie="${t.dataset.partie}"]`, boite);
      const tout = $(`input[data-tout="${t.dataset.partie}"]`, boite);
      tout.checked = cases.every(c => c.checked);
      tout.indeterminate = !tout.checked && cases.some(c => c.checked);
    }
  });

  const majPortee = () => {
    const type = $('input[name="type"]:checked', $('#form-eval')).value;
    $('#bloc-portee').hidden = type !== 'interrogation';
  };
  $('#eval-type').addEventListener('change', majPortee);
  majPortee();

  $('#form-eval').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget;
    const type = $('input[name="type"]:checked', f).value;
    const coches = $$('input[name="contenu"]:checked', boite).map(c => `${c.value} (${c.dataset.titre})`);
    const autres = f.autres.value.trim();
    const contenus = autres ? [...coches, autres] : coches;
    if (!contenus.length) {
      marquerInvalide($('#eval-autres'), 'Coche au moins une séquence ou saisis les contenus à évaluer.');
      return;
    }
    const parSequence = type === 'interrogation' && f.parSequence.checked && contenus.length > 1;
    const classe = selecteurs.eval.valeur();
    const ctx = contexteClasse(classe);
    const contenu = messageEvaluation({
      ...ctx,
      type,
      numero: f.numero.value.trim(),
      periode: f.periode.value,
      duree: f.duree.value,
      contenus,
      parSequence,
      bareme: f.bareme.value,
      grille: f.grille.value,
      format: f.format.value,
      reglesNotation: ctx.profil.notation,
      precisions: f.precisions.value,
    });
    const libelle = parSequence ? 'interrogations par séquence' : libelleTypeEval(type);
    const resume = contenus.length === 1 ? ` — ${contenus[0].replace(/ \(.*\)$/, '')}` : '';
    lancer({
      type: 'evaluation',
      titre: `${majuscule(libelle)}${f.numero.value.trim() && !parSequence ? ` n°${f.numero.value.trim()}` : ''} — ${ctx.classeLibelle}${resume}`,
      contexte: { ...classe, sousType: type },
      contenu,
      effortAuto: 'high',
    });
  });
}

/** Ouvre le formulaire d'évaluation prêt pour une interrogation sur la notion d'une fiche. */
function interrogationDepuis(doc) {
  afficherVue('eval');
  $('input[name="type"][value="interrogation"]', $('#form-eval')).checked = true;
  $('#bloc-portee').hidden = false;
  if (doc.classe) selecteurs.eval.definir({ ens: doc.ens, classe: doc.classe, serie: doc.serie });
  const boite = $('#eval-contenus');
  $$('input[type=checkbox]', boite).forEach(c => { c.checked = false; c.indeterminate = false; });
  const trouve = $$('input[name="contenu"]', boite).find(c => c.value === doc.notion);
  if (trouve) {
    trouve.checked = true;
    $$('details', boite).forEach(d => { d.open = d.contains(trouve); });
    $('#eval-autres').value = '';
  } else {
    $('#eval-autres').value = doc.notion || '';
  }
  toast('Vérifie les choix puis prépare l\'interrogation.');
}

// ================================================================ génération

async function lancer(demandeLancement) {
  const { type, titre, contexte, contenu, effortAuto, docExistant = null, demande = '' } = demandeLancement;
  const reglages = S.lireReglages();
  if (!aAcces(reglages)) {
    afficherVue('reglages');
    messageReglages('Ajoute ta clé API (ou l\'accès au relais) pour que l\'IA puisse rédiger.');
    $('#r-cle').focus();
    return;
  }
  if (etat.generation) { toast('Une rédaction est déjà en cours.'); return; }

  const doc = docExistant || { id: S.nouvelId(), type, titre, ...contexte, md: '', versions: [], cree: Date.now() };
  const ancien = docExistant ? docExistant.md : null;
  etat.doc = doc;
  afficherVue('resultat');
  ouvrirDocument(doc, { enCours: true, retouche: !!docExistant });

  const effort = reglages.effort === 'auto' ? effortAuto : reglages.effort;
  const debut = Date.now();
  let texte = '';
  let minuteurRendu = null;
  const feuille = $('#doc-feuille');

  const rendre = () => {
    minuteurRendu = null;
    if (etat.doc !== doc) return; // l'enseignant a ouvert un autre document entre-temps
    feuille.innerHTML = renderMarkdown(texte);
    const dernier = feuille.lastElementChild;
    if (dernier) dernier.classList.add('curseur');
  };
  const majStatut = () => {
    if (etat.doc !== doc) return;
    const s = Math.round((Date.now() - debut) / 1000);
    if (!texte) statut(`L'IA prépare le document… ${s} s`, 'encours');
    else statut(`Rédaction en cours… ${texte.split(/\s+/).length} mots`, 'encours');
  };
  majStatut();
  const minuteur = setInterval(majStatut, 1000);
  let eveil = null;
  try { eveil = navigator.wakeLock ? await navigator.wakeLock.request('screen') : null; } catch { /* facultatif */ }

  try {
    const onTexte = t => {
      texte = t;
      if (!minuteurRendu) minuteurRendu = setTimeout(rendre, 120);
    };
    let g;
    if (etat.claude.sample) {
      g = genererViaClaude({ sample: etat.claude.sample, contenu, onTexte });
    } else {
      const { generer } = await chargerIA();
      g = generer({ reglages, contenu, effort, onTexte });
    }
    etat.generation = g;
    const res = await g.promesse;
    if (ancien != null) doc.versions = [...(doc.versions || []), ancien];
    if (demande) doc.derniereDemande = demande;
    doc.md = res.texte;
    doc.incomplet = res.tronque;
    const ok = S.enregistrerDocument(doc);
    statut(ok ? 'Enregistré dans Mes documents' : 'Terminé (mémoire de l\'appareil pleine : non enregistré)', 'ok');
    if (res.tronque) alerte('Le document est très long et s\'est arrêté avant la fin. Demande une version plus courte, ou « continue à partir de … » dans une modification.', 'info');
  } catch (err) {
    const partiel = (err && err.partiel) || '';
    if (ancien != null) {
      doc.md = ancien;
    } else if (partiel.trim().length > 300) {
      doc.md = partiel;
      doc.incomplet = true;
      S.enregistrerDocument(doc);
    }
    statut(ancien != null ? 'Modification non appliquée' : (doc.md ? 'Document incomplet' : 'Échec'), 'erreur');
    // « Réessayer », sauf si l'enseignant a lui-même arrêté la rédaction
    const arretVolontaire = err && err.arret;
    alerte(err && err.message ? err.message : String(err), '', arretVolontaire ? null : () => lancer(demandeLancement));
  } finally {
    clearInterval(minuteur);
    clearTimeout(minuteurRendu);
    etat.generation = null;
    if (eveil) eveil.release().catch(() => {});
    if (etat.doc === doc) ouvrirDocument(doc, { garderAlerte: true, garderStatut: true });
  }
}

function statut(texte, genre = '') {
  const el = $('#doc-statut');
  el.className = `doc-statut ${genre === 'ok' ? 'ok' : ''}`;
  el.innerHTML = (genre === 'encours' ? '<span class="pastille" aria-hidden="true"></span>' : '') + escapeAttr(texte);
}

function alerte(message, genre = '', reessayer = null) {
  const a = $('#doc-alerte');
  a.className = `doc-alerte ${genre}`;
  a.textContent = message;
  if (reessayer) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-sec btn-petit';
    b.textContent = 'Réessayer';
    b.addEventListener('click', () => { a.hidden = true; reessayer(); }, { once: true });
    a.append(document.createElement('br'), b);
  }
  a.hidden = false;
}

function messageReglages(texte) {
  const m = $('#message-reglages');
  m.textContent = texte;
  m.hidden = false;
}

// ================================================================ affichage d'un document

function partiesDocument(md) {
  const parties = decouper(md);
  const estCorrige = p => /^#{1,3}\s*.*corrig/i.test(p.split('\n').find(l => l.trim()) || '');
  return { epreuve: parties.filter(p => !estCorrige(p)), corrige: parties.filter(estCorrige) };
}

function mdAExporter() {
  const doc = etat.doc;
  const choix = $('input[name="partie"]:checked', $('#doc-partie'));
  if (!doc || $('#doc-partie').hidden || !choix || choix.value === 'tout') return doc ? doc.md : '';
  const { epreuve, corrige } = partiesDocument(doc.md);
  return (choix.value === 'epreuve' ? epreuve : corrige).join('\n\n[SAUT DE PAGE]\n\n');
}

function suffixePartie() {
  const choix = $('input[name="partie"]:checked', $('#doc-partie'));
  if ($('#doc-partie').hidden || !choix || choix.value === 'tout') return '';
  return choix.value === 'epreuve' ? ' (épreuve)' : ' (corrigé)';
}

function ouvrirDocument(doc, { enCours = false, retouche = false, garderAlerte = false, garderStatut = false } = {}) {
  $('#t-doc').textContent = doc.titre;
  $('#doc-arreter').hidden = !enCours;
  $('#doc-outils').hidden = enCours || !doc.md;
  $('#form-retouche').hidden = enCours || !doc.md;
  $('#doc-editeur').hidden = true;
  $('#doc-editer').setAttribute('aria-pressed', 'false');
  if (!garderAlerte) $('#doc-alerte').hidden = true;
  if (!garderStatut && !enCours) statut(doc.incomplet ? 'Document incomplet' : `Rédigé le ${dateCourte(doc.maj || doc.cree)}`);

  const feuille = $('#doc-feuille');
  feuille.hidden = false;
  if (enCours && !retouche) {
    feuille.innerHTML = `<div class="attente"><span class="anneau" aria-hidden="true"></span>
      <p><strong>Rédaction en préparation.</strong><br>Un document complet prend en général 1 à 3 minutes. Garde cette page ouverte.${etat.modeClaude ? '<br>Si Claude te demande l\'autorisation, accepte-la.' : ''}</p></div>`;
  } else {
    feuille.innerHTML = renderMarkdown(doc.md);
  }

  if (!enCours) {
    const { corrige } = partiesDocument(doc.md || '');
    const aCorrige = doc.type === 'evaluation' || corrige.length > 0;
    $('#doc-partie').hidden = !aCorrige;
    if (aCorrige) $('input[name="partie"][value="tout"]', $('#doc-partie')).checked = true;
    $('#doc-version').hidden = !(doc.versions && doc.versions.length);
    $('#doc-interro').hidden = !(doc.type === 'fiche' && doc.notion);
    majOutils();
  }
}

/** Boutons d'export disponibles selon l'endroit où l'application est ouverte. */
function majOutils() {
  // dans claude.ai, la page ne peut ni imprimer ni ouvrir le partage du téléphone
  $('#doc-imprimer').hidden = etat.modeClaude;
  $('#doc-partager').hidden = etat.modeClaude || !partageDisponible();
  $('#doc-word').hidden = etat.modeClaude && !etat.claude.downloads;
}

/** Enregistre un fichier : téléchargement classique, ou demande à claude.ai. */
async function enregistrerFichier(blob, nom) {
  if (etat.claude.downloads) {
    try {
      await etat.claude.downloads.save({ filename: nom, data: blob });
      return true;
    } catch (e) {
      if (e && e.code !== 'declined') toast('Enregistrement impossible dans cette vue.');
      return false;
    }
  }
  telecharger(blob, nom);
  return true;
}

function initResultat() {
  $('#doc-retour').addEventListener('click', () => {
    if (history.state && history.state.vue === 'resultat' && history.length > 1) history.back();
    else afficherVue(etat.vuePrecedente || 'docs');
  });
  $('#doc-arreter').addEventListener('click', () => { if (etat.generation) etat.generation.arreter(); });

  $('#doc-word').addEventListener('click', async () => {
    const titre = etat.doc.titre + suffixePartie();
    if (await enregistrerFichier(blobDocx(titre, mdAExporter()), nomFichier(titre, 'docx'))) toast('Fichier Word enregistré');
  });
  $('#doc-imprimer').addEventListener('click', () => imprimer(mdAExporter()));
  $('#doc-copier').addEventListener('click', async () => {
    toast(await copier(mdAExporter()) ? 'Copié : colle-le dans Word ou WhatsApp' : 'Copie impossible sur cet appareil');
  });
  $('#doc-partager').addEventListener('click', async () => {
    try {
      await partager(etat.doc.titre + suffixePartie(), mdAExporter());
    } catch (e) {
      if (e && e.name !== 'AbortError') toast('Partage impossible : utilise le bouton Word.');
    }
  });

  $('#doc-editer').addEventListener('click', () => {
    const ouvert = $('#doc-editeur').hidden;
    basculerEditeur(ouvert);
  });
  $('#doc-source-annuler').addEventListener('click', () => basculerEditeur(false));
  $('#doc-source-ok').addEventListener('click', () => {
    const doc = etat.doc;
    const nouveau = $('#doc-source').value;
    if (nouveau !== doc.md) {
      doc.versions = [...(doc.versions || []), doc.md];
      doc.md = nouveau;
      doc.incomplet = false;
      S.enregistrerDocument(doc);
      toast('Texte enregistré');
    }
    ouvrirDocument(doc);
  });

  $('#doc-version').addEventListener('click', () => {
    const doc = etat.doc;
    if (!doc.versions || !doc.versions.length) return;
    doc.md = doc.versions[doc.versions.length - 1];
    doc.versions = doc.versions.slice(0, -1);
    S.enregistrerDocument(doc);
    ouvrirDocument(doc);
    toast('Version précédente rétablie');
  });

  $('#doc-interro').addEventListener('click', () => interrogationDepuis(etat.doc));

  $('#form-retouche').addEventListener('submit', e => {
    e.preventDefault();
    const champ = $('#retouche-demande');
    const demande = champ.value.trim();
    if (!demande) { marquerInvalide(champ, 'Écris la modification souhaitée.'); return; }
    const doc = etat.doc;
    const ctx = doc.classe ? contexteClasse({ ens: doc.ens, classe: doc.classe, serie: doc.serie }) : { classeLibelle: 'non précisée', profil: S.lireProfil() };
    champ.value = '';
    lancer({
      type: doc.type,
      titre: doc.titre,
      contexte: {},
      contenu: messageRetouche({ ...ctx, texte: doc.md, demande }),
      effortAuto: doc.type === 'evaluation' ? 'high' : 'medium',
      docExistant: doc,
      demande,
    });
  });
}

function basculerEditeur(ouvrir) {
  $('#doc-editeur').hidden = !ouvrir;
  $('#doc-feuille').hidden = ouvrir;
  $('#form-retouche').hidden = ouvrir;
  $('#doc-editer').setAttribute('aria-pressed', String(ouvrir));
  if (ouvrir) {
    const zone = $('#doc-source');
    zone.value = etat.doc.md;
    zone.focus();
  }
}

// ================================================================ mes documents

const LIBELLES_TYPE = { fiche: 'Fiche', evaluation: 'Épreuve', modification: 'Fiche modifiée' };

function afficherDocuments() {
  const q = $('#docs-recherche').value.trim().toLowerCase();
  const filtre = $('input[name="filtre"]:checked', $('#docs-filtre')).value;
  const docs = S.lireDocuments().filter(d => {
    if (filtre === 'fiche' && d.type === 'evaluation') return false;
    if (filtre === 'evaluation' && d.type !== 'evaluation') return false;
    return !q || (d.titre || '').toLowerCase().includes(q);
  });
  $('#liste-docs').innerHTML = docs.map(d => `
    <li>
      <button type="button" class="ouvrir" data-id="${d.id}">
        <span class="badge ${d.incomplet ? 'incomplet' : ''}">${LIBELLES_TYPE[d.type] || 'Document'}${d.exemple ? ' · exemple' : ''}${d.incomplet ? ' · incomplet' : ''}</span>
        <strong>${escapeAttr(d.titre || 'Sans titre')}</strong>
        <small>${dateCourte(d.maj || d.cree)}</small>
      </button>
      <button type="button" class="supprimer" data-suppr="${d.id}" aria-label="Supprimer « ${escapeAttr(d.titre || 'Sans titre')} »"><svg aria-hidden="true"><use href="#i-x"/></svg></button>
    </li>`).join('');
  $('#docs-vide').hidden = docs.length > 0;
  if (!docs.length && (q || filtre)) $('#docs-vide').textContent = 'Aucun document ne correspond.';
  else $('#docs-vide').textContent = 'Aucun document pour l\'instant. Rédige ta première fiche !';
}

function initDocuments() {
  $('#docs-recherche').addEventListener('input', afficherDocuments);
  $('#docs-filtre').addEventListener('change', afficherDocuments);
  $('#liste-docs').addEventListener('click', e => {
    const ouvrir = e.target.closest('[data-id]');
    const suppr = e.target.closest('[data-suppr]');
    if (ouvrir) {
      const doc = S.lireDocuments().find(d => d.id === ouvrir.dataset.id);
      if (!doc) return;
      if (etat.generation && etat.doc && etat.doc.id === doc.id) { afficherVue('resultat'); return; }
      etat.doc = doc;
      afficherVue('resultat');
      ouvrirDocument(doc);
    } else if (suppr) {
      const doc = S.lireDocuments().find(d => d.id === suppr.dataset.suppr);
      if (!doc) return;
      confirmer(`Supprimer « ${doc.titre} » ?`, 'Supprimer').then(oui => {
        if (!oui) return;
        S.supprimerDocument(doc.id);
        if (etat.doc && etat.doc.id === doc.id && !etat.generation) etat.doc = null;
        afficherDocuments();
        toast('Document supprimé');
      });
    }
  });

  $('#btn-exporter').addEventListener('click', async () => {
    const json = JSON.stringify(S.exporterTout(), null, 1);
    const jour = new Date().toISOString().slice(0, 10);
    if (await enregistrerFichier(new Blob([json], { type: 'application/json' }), `maths-apc-sauvegarde-${jour}.json`)) toast('Sauvegarde enregistrée');
  });
  $('#fichier-import').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const n = S.importerTout(JSON.parse(await f.text()));
      afficherDocuments();
      toast(`Sauvegarde restaurée : ${n} document${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''}`);
    } catch (err) {
      toast(err instanceof SyntaxError ? 'Ce fichier n\'est pas une sauvegarde valide.' : err.message);
    }
  });
}

// ================================================================ programmes

function chargerProgramme() {
  const v = selecteurs.programmes.valeur();
  const cle = cleClasse(v.ens, v.classe, v.serie);
  const p = programmeDe(cle);
  $('#prog-texte').value = p.texte;
  $('#prog-notes').value = p.notes;
  $('#prog-etat').hidden = !p.modifie;
}

function initProgrammes() {
  creerChoixClasse($('.choix-classe[data-pour="programmes"]'), () => { if (etat.vue === 'programmes') chargerProgramme(); });
  $('#form-programmes').addEventListener('submit', e => {
    e.preventDefault();
    const v = selecteurs.programmes.valeur();
    const cle = cleClasse(v.ens, v.classe, v.serie);
    const texte = $('#prog-texte').value.trim();
    const notes = $('#prog-notes').value.trim();
    const identique = texte === (PROGRAMMES_DEFAUT[cle] || '').trim();
    S.ecrireProgrammePerso(cle, identique ? null : texte, notes);
    rafraichirFormulaires();
    chargerProgramme();
    toast(`Programme de ${libelleClasse(v.ens, v.classe, v.serie)} enregistré`);
  });
  $('#prog-retablir').addEventListener('click', async () => {
    const v = selecteurs.programmes.valeur();
    if (!await confirmer(`Rétablir le programme d'origine pour ${libelleClasse(v.ens, v.classe, v.serie)} ? Tes corrections et tes notes seront effacées.`, 'Rétablir')) return;
    S.ecrireProgrammePerso(cleClasse(v.ens, v.classe, v.serie), null, '');
    rafraichirFormulaires();
    chargerProgramme();
    toast('Programme d\'origine rétabli');
  });
}

/** Après une correction de programme, les listes des formulaires se mettent à jour. */
function rafraichirFormulaires() {
  for (const pour of ['fiche', 'eval']) {
    const s = selecteurs[pour];
    if (s) s.definir(s.valeur());
  }
}

// ================================================================ réglages

function chargerReglages() {
  const r = S.lireReglages();
  const p = S.lireProfil();
  const fp = $('#form-profil');
  for (const k of ['enseignant', 'etablissement', 'annee', 'ville', 'consignes', 'notation']) fp[k].value = p[k] || '';
  const fi = $('#form-ia');
  fi.cle.value = r.cle;
  fi.modele.value = MODELES.some(m => m.id === r.modele) ? r.modele : MODELES[0].id;
  fi.effort.value = r.effort;
  fi.relais.value = r.relais;
  fi.codeAcces.value = r.codeAcces;
  if (r.relais) fi.querySelector('details').open = true;
  $('#r-resultat').textContent = '';
}

function lireFormIA() {
  const fi = $('#form-ia');
  return {
    cle: fi.cle.value.trim(),
    modele: fi.modele.value,
    effort: fi.effort.value,
    relais: fi.relais.value.trim().replace(/\/+$/, ''),
    codeAcces: fi.codeAcces.value.trim(),
  };
}

function initReglages() {
  $('#r-modele').innerHTML = MODELES.map(m => `<option value="${m.id}">${m.label}</option>`).join('');
  $('#form-profil').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget;
    const p = {};
    for (const k of ['enseignant', 'etablissement', 'annee', 'ville', 'consignes', 'notation']) p[k] = f[k].value.trim();
    S.ecrireProfil(p);
    toast('Profil enregistré');
  });
  $('#form-ia').addEventListener('submit', e => {
    e.preventDefault();
    const r = lireFormIA();
    if (r.cle && !r.cle.startsWith('sk-ant-')) {
      marquerInvalide($('#r-cle'), 'Une clé API Anthropic commence par « sk-ant- ».');
      return;
    }
    S.ecrireReglages(r);
    $('#message-reglages').hidden = true;
    toast(aAcces(r) ? 'Réglages enregistrés : tu peux rédiger' : 'Réglages enregistrés');
  });
  $('#r-voir').addEventListener('click', e => {
    const champ = $('#r-cle');
    const visible = champ.type === 'password';
    champ.type = visible ? 'text' : 'password';
    e.currentTarget.textContent = visible ? 'Masquer' : 'Afficher';
    e.currentTarget.setAttribute('aria-pressed', String(visible));
  });
  $('#r-tester').addEventListener('click', async e => {
    const r = lireFormIA();
    const sortie = $('#r-resultat');
    if (!aAcces(r)) { sortie.className = 'resultat-test ko'; sortie.textContent = 'Saisis d\'abord une clé API (ou un relais et son code).'; return; }
    const b = e.currentTarget;
    b.disabled = true;
    sortie.className = 'resultat-test';
    sortie.textContent = 'Test en cours…';
    try {
      const { testerAcces } = await chargerIA();
      await testerAcces(r);
      sortie.className = 'resultat-test ok';
      sortie.textContent = 'Accès à l\'IA vérifié. Pense à enregistrer.';
    } catch (err) {
      sortie.className = 'resultat-test ko';
      sortie.textContent = err.message;
    } finally {
      b.disabled = false;
    }
  });
}

// ================================================================ suggestions (puces)

function initPuces() {
  document.addEventListener('click', e => {
    const p = e.target.closest('.puce');
    if (!p) return;
    const cible = document.getElementById(p.closest('.puces').dataset.cible);
    const t = p.textContent.trim();
    cible.value = cible.value.trim() ? `${cible.value.trim()} ; ${t.charAt(0).toLowerCase()}${t.slice(1)}` : t;
    cible.dispatchEvent(new Event('input'));
    cible.focus();
  });
}

// ================================================================ confirmation dans la page

let modaleOuverte = null;
/** Remplace confirm() (bloqué dans certaines vues) : résout true si l'enseignant confirme. */
function confirmer(message, libelleOk = 'Confirmer') {
  const m = $('#modale');
  if (modaleOuverte) modaleOuverte(false);
  $('#modale-texte').textContent = message;
  $('#modale-ok').textContent = libelleOk;
  const retour = document.activeElement;
  m.hidden = false;
  $('#modale-annuler').focus();
  return new Promise(resoudre => {
    const fermer = oui => {
      m.hidden = true;
      modaleOuverte = null;
      document.removeEventListener('keydown', clavier, true);
      $('#modale-ok').onclick = null;
      $('#modale-annuler').onclick = null;
      m.onclick = null;
      if (retour && retour.focus) retour.focus({ preventScroll: true });
      resoudre(oui);
    };
    const clavier = e => {
      if (e.key === 'Escape') { e.preventDefault(); fermer(false); }
      if (e.key === 'Tab') { // le focus reste dans la boîte
        const b = [$('#modale-annuler'), $('#modale-ok')];
        const i = b.indexOf(document.activeElement);
        e.preventDefault();
        b[(i + (e.shiftKey ? b.length - 1 : 1)) % b.length].focus();
      }
    };
    modaleOuverte = fermer;
    document.addEventListener('keydown', clavier, true);
    $('#modale-ok').onclick = () => fermer(true);
    $('#modale-annuler').onclick = () => fermer(false);
    m.onclick = e => { if (e.target === m) fermer(false); };
  });
}

// ================================================================ claude.ai et exemples

async function detecterClaude() {
  try {
    const [sample, downloads] = await Promise.all([
      window.claude.use('sample').catch(() => null),
      window.claude.use('downloads').catch(() => null),
    ]);
    etat.claude.downloads = downloads;
    if (sample) {
      etat.claude.sample = sample;
      etat.modeClaude = true;
      const limites = await sample.limits().catch(() => null);
      etat.claude.imagesOk = !!(limites && limites.images);
    }
  } catch { /* hors claude.ai : mode clé API */ }
  appliquerMode();
}

function appliquerMode() {
  document.documentElement.classList.toggle('mode-claude', etat.modeClaude);
  $('#vue-fiche .bandeau-cle').hidden = !!aAcces();
  $('#carte-claude').hidden = !etat.modeClaude;
  $('#form-ia').hidden = etat.modeClaude;
  $('#depot .aide').textContent = etat.modeClaude
    ? (etat.claude.imagesOk ? 'Word (.docx) ou photos des pages. Tu peux ajouter plusieurs photos.' : 'Fichier Word (.docx) ou texte.')
    : 'Word (.docx), PDF ou photos. Tu peux ajouter plusieurs photos.';
  majOutils();
}

/** Chaque exemple est ajouté une seule fois à « Mes documents » : supprimé, il ne revient pas. */
function ajouterExemples() {
  const dejaAjoutes = new Set(S.lireMemoire('exemples-ajoutes', []));
  const presents = new Set(S.lireDocuments().map(d => d.id));
  for (const ex of EXEMPLES.slice().reverse()) {
    if (dejaAjoutes.has(ex.id)) continue;
    if (!presents.has(ex.id)) S.enregistrerDocument({ ...ex, versions: [] });
    dejaAjoutes.add(ex.id);
  }
  S.ecrireMemoire('exemples-ajoutes', [...dejaAjoutes]);
  // les liens « Voir un exemple » n'apparaissent que si l'exemple existe
  for (const b of $$('[data-exemple]')) b.hidden = !EXEMPLES.some(ex => ex.id === b.dataset.exemple);
}

function ouvrirExemple(id) {
  const doc = S.lireDocuments().find(d => d.id === id) || EXEMPLES.find(d => d.id === id);
  if (!doc) return;
  etat.doc = { versions: [], ...doc };
  afficherVue('resultat');
  ouvrirDocument(etat.doc);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-exemple]');
  if (b) ouvrirExemple(b.dataset.exemple);
});

// ================================================================ démarrage

function demarrer() {
  initFiche();
  initModifier();
  initEval();
  initResultat();
  initDocuments();
  initProgrammes();
  initReglages();
  initPuces();
  const depart = location.hash.slice(1);
  const vue = VUES.includes(depart) && depart !== 'resultat' ? depart : 'fiche';
  history.replaceState({ vue }, '', `#${vue}`);
  afficherVue(vue, { historique: false });
  // l'IA est chargée dès que le navigateur est libre, pour être prête au premier clic
  ajouterExemples();
  if (window.claude && typeof window.claude.use === 'function') {
    detecterClaude();
  } else {
    // hors claude.ai : l'IA est chargée dès que le navigateur est libre, pour être prête au premier clic
    (window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => chargerIA().catch(() => { moduleIA = null; }));
  }
}

demarrer();

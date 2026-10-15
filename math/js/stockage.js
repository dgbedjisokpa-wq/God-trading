// Mémoire locale de l'application (sur l'appareil de l'enseignant) :
// réglages, profil, programmes corrigés, documents rédigés.
// Chaque accès est protégé : en navigation privée ou si le stockage est plein,
// l'application continue de fonctionner (sans mémoriser).

const PREFIXE = 'mathsapc.';

function lire(cle, defaut) {
  try {
    const v = localStorage.getItem(PREFIXE + cle);
    return v == null ? defaut : JSON.parse(v);
  } catch {
    return defaut;
  }
}

function ecrire(cle, valeur) {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
    return true;
  } catch {
    return false;
  }
}

// petites préférences d'interface (dernière classe choisie, formulaires…)
export const lireMemoire = (cle, defaut) => lire(`memo.${cle}`, defaut);
export const ecrireMemoire = (cle, valeur) => ecrire(`memo.${cle}`, valeur);

// ---------------------------------------------------------------- réglages

const REGLAGES_DEFAUT = { cle: '', modele: 'claude-opus-5-5', effort: 'auto', relais: '', codeAcces: '' };
export const lireReglages = () => ({ ...REGLAGES_DEFAUT, ...lire('reglages', {}) });
export const ecrireReglages = r => ecrire('reglages', r);

const PROFIL_DEFAUT = { enseignant: '', etablissement: '', annee: '', ville: '', consignes: '', notation: '' };
export const lireProfil = () => ({ ...PROFIL_DEFAUT, ...lire('profil', {}) });
export const ecrireProfil = p => ecrire('profil', p);

// ---------------------------------------------------------------- programmes

export const lireProgrammesPerso = () => lire('programmes', {});
export function ecrireProgrammePerso(cle, texte, notes) {
  const tous = lireProgrammesPerso();
  if (texte == null && !notes) delete tous[cle];
  else tous[cle] = { texte, notes: notes || '' };
  return ecrire('programmes', tous);
}

// ---------------------------------------------------------------- documents

export const lireDocuments = () => lire('documents', []);

export function enregistrerDocument(doc) {
  const docs = lireDocuments();
  const i = docs.findIndex(d => d.id === doc.id);
  doc.maj = Date.now();
  if (i >= 0) docs[i] = doc; else docs.unshift(doc);
  // on garde au plus 3 versions précédentes par document
  if (doc.versions && doc.versions.length > 3) doc.versions = doc.versions.slice(-3);
  if (ecrire('documents', docs)) return true;
  // stockage plein : on retire les versions précédentes des plus anciens documents puis on réessaie
  for (const d of docs.slice().reverse()) {
    if (d.versions && d.versions.length) { d.versions = []; if (ecrire('documents', docs)) return true; }
  }
  return false;
}

export function supprimerDocument(id) {
  return ecrire('documents', lireDocuments().filter(d => d.id !== id));
}

export function nouvelId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------------------------------------------------------------- sauvegarde

export function exporterTout() {
  return {
    application: 'Maths APC',
    version: 1,
    date: new Date().toISOString(),
    profil: lireProfil(),
    programmes: lireProgrammesPerso(),
    documents: lireDocuments(),
  };
}

/** Fusionne une sauvegarde (les documents déjà présents ne sont pas dupliqués). */
export function importerTout(donnees) {
  if (!donnees || donnees.application !== 'Maths APC') throw new Error("Ce fichier n'est pas une sauvegarde Maths APC.");
  if (donnees.profil) ecrireProfil({ ...lireProfil(), ...donnees.profil });
  if (donnees.programmes) ecrire('programmes', { ...lireProgrammesPerso(), ...donnees.programmes });
  const docs = lireDocuments();
  const ids = new Set(docs.map(d => d.id));
  let ajoutes = 0;
  for (const d of donnees.documents || []) {
    if (d && d.id && typeof d.md === 'string' && !ids.has(d.id)) { docs.push(d); ajoutes++; }
  }
  docs.sort((a, b) => (b.maj || 0) - (a.maj || 0));
  if (!ecrire('documents', docs)) throw new Error("Mémoire de l'appareil pleine : supprime quelques documents puis réessaie.");
  return ajoutes;
}

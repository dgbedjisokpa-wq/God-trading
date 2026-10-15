// Mode aperçu claude.ai : quand l'application est ouverte comme page
// claude.ai, l'IA passe par le compte Claude de la personne qui la consulte
// (capacité « sample ») : aucune clé API n'est nécessaire.
// Même interface que ia.js : generer() → { promesse, arreter }.

import { SYSTEME } from './prompts.js';
import { ErreurIA } from './erreurs.js';

const MESSAGES = {
  not_granted: "Tu n'as pas autorisé cette page à utiliser Claude. Recharge la page et accepte la demande d'autorisation pour rédiger.",
  sampling_disabled: "Claude n'est pas disponible pour ce compte depuis cette page.",
  not_declared: "Cette page n'a pas accès à Claude.",
  capability_disabled: "Claude n'est pas disponible dans cette vue.",
  capability_removed: "Mets à jour l'application Claude pour rédiger depuis cette page.",
  rate_limited: 'Limite d\'utilisation de Claude atteinte pour le moment. Réessaie un peu plus tard.',
  session_expired: 'Ta session Claude a expiré : reconnecte-toi puis réessaie.',
  prompt_too_large: 'Le document envoyé est trop long. Envoie moins de pages ou un texte plus court.',
  image_rejected: 'Une photo a été refusée (format ou taille). Essaie une autre photo, en JPEG ou PNG.',
  images_unavailable: "Les photos ne peuvent pas être envoyées depuis cette vue. Colle plutôt le texte de la fiche ou importe un fichier Word.",
  refused: "Claude a refusé cette demande. Reformule-la (par exemple en précisant qu'il s'agit d'un document de mathématiques pour la classe).",
  empty_completion: "Claude n'a rien rédigé. Simplifie la demande puis réessaie.",
  upstream_error: 'Le service est momentanément indisponible. Réessaie dans un instant.',
};

/** Le texte de la demande : contenu = chaîne ou liste de blocs { type: 'text' | 'image', … }. */
function texteDe(contenu) {
  if (typeof contenu === 'string') return contenu;
  return contenu.filter(b => b.type === 'text').map(b => b.text).join('\n\n');
}

function base64EnBlob(b64, type) {
  const bin = atob(b64);
  const octets = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
  return new Blob([octets], { type });
}

export function genererViaClaude({ sample, contenu, onTexte }) {
  const ctl = new AbortController();
  const images = typeof contenu === 'string' ? [] : contenu
    .filter(b => b.type === 'image')
    .map(b => base64EnBlob(b.source.data, b.source.media_type));
  const entree = `${SYSTEME}\n\n---\n\n${texteDe(contenu)}`;

  const promesse = (async () => {
    try {
      const res = await sample(entree, {
        signal: ctl.signal,
        modelTier: 'complex',
        cache: false,
        ...(images.length ? { images } : {}),
        onText: ({ text }) => onTexte(text),
      });
      return { texte: res.text, tronque: !!res.truncated, modele: res.modelTierApplied };
    } catch (e) {
      const code = e && e.code;
      const partiel = (e && e.text) || '';
      if (code === 'cancelled') throw new ErreurIA('Rédaction arrêtée.', { partiel, arret: true });
      throw new ErreurIA(MESSAGES[code] || MESSAGES.upstream_error, { partiel });
    }
  })();

  return { promesse, arreter: () => ctl.abort() };
}

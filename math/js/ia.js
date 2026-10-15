// Appel à Claude (API Anthropic) avec le SDK officiel, depuis le navigateur.
// La clé reste sur l'appareil de l'enseignant (localStorage) ; si un relais
// est configuré (voir relais/relais.js), la clé est sur le relais et
// l'application n'envoie qu'un code d'accès.

import Anthropic from '../vendor/anthropic-sdk-0.134.0.min.js';
import { SYSTEME } from './prompts.js';
import { ErreurIA } from './erreurs.js';

export const MODELE_DEFAUT = 'claude-opus-5-5';

export { ErreurIA };

/**
 * Lance une génération en flux continu.
 * @returns {{ promesse: Promise<{texte:string, tronque:boolean, modele:string}>, arreter: () => void }}
 */
export function generer({ reglages, contenu, effort, onTexte }) {
  const relais = (reglages.relais || '').trim();
  const cle = (relais ? reglages.codeAcces : reglages.cle || '').trim();
  const modele = reglages.modele || MODELE_DEFAUT;

  const client = new Anthropic({
    apiKey: cle,
    baseURL: relais || undefined,
    dangerouslyAllowBrowser: true,
    maxRetries: 2,
    timeout: 15 * 60 * 1000,
  });

  const params = {
    model: modele,
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    output_config: { effort },
    // texte fixe → mis en cache par l'API d'une demande à l'autre
    system: [{ type: 'text', text: SYSTEME, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: contenu }],
    // si le modèle refuse par erreur, l'API relance la demande sur un autre modèle
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  };

  let texte = '';
  const flux = client.beta.messages.stream(params);
  flux.on('text', delta => {
    texte += delta;
    onTexte(texte);
  });

  const promesse = (async () => {
    let msg;
    try {
      msg = await flux.finalMessage();
    } catch (e) {
      throw traduireErreur(e, texte);
    }
    if (msg.stop_reason === 'refusal') {
      throw new ErreurIA("L'IA a refusé de traiter cette demande. Reformule-la (par exemple en précisant qu'il s'agit d'un document de mathématiques pour la classe) puis réessaie.", { partiel: texte });
    }
    const final = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return { texte: final || texte, tronque: msg.stop_reason === 'max_tokens', modele: msg.model };
  })();

  return { promesse, arreter: () => flux.abort() };
}

/** Petite requête pour vérifier la clé (ou le relais) sans rien rédiger. */
export async function testerAcces(reglages) {
  const relais = (reglages.relais || '').trim();
  const client = new Anthropic({
    apiKey: (relais ? reglages.codeAcces : reglages.cle || '').trim(),
    baseURL: relais || undefined,
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
  });
  try {
    await client.messages.create({
      model: reglages.modele || MODELE_DEFAUT,
      max_tokens: 64,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: 'Réponds seulement : OK' }],
    });
  } catch (e) {
    throw traduireErreur(e, '');
  }
}

function traduireErreur(e, partiel) {
  const opt = { partiel };
  if (e instanceof Anthropic.APIUserAbortError) return new ErreurIA('Rédaction arrêtée.', { partiel, arret: true });
  if (e instanceof Anthropic.AuthenticationError) return new ErreurIA('Clé API refusée. Vérifie la clé dans les Réglages (elle commence par « sk-ant- »).', opt);
  if (e instanceof Anthropic.PermissionDeniedError) return new ErreurIA("Accès refusé par l'API. Vérifie la clé ou le code d'accès dans les Réglages.", opt);
  if (e instanceof Anthropic.RateLimitError) return new ErreurIA("Trop de demandes en peu de temps. Patiente une minute puis réessaie.", opt);
  if (e instanceof Anthropic.NotFoundError) return new ErreurIA("Modèle ou adresse introuvable. Vérifie le modèle et l'adresse du relais dans les Réglages.", opt);
  if (e instanceof Anthropic.BadRequestError) {
    const m = String(e.message || '');
    if (/credit balance/i.test(m)) return new ErreurIA("Le crédit du compte Anthropic est épuisé. Recharge-le sur console.anthropic.com (Plans & Billing), puis réessaie.", opt);
    if (/too long|prompt is too long|too large/i.test(m)) return new ErreurIA('Le document envoyé est trop volumineux. Envoie moins de pages ou un fichier plus léger.', opt);
    return new ErreurIA(`Demande refusée par l'API : ${m}`, opt);
  }
  if (e instanceof Anthropic.InternalServerError || (e instanceof Anthropic.APIError && (e.status === 529 || e.status >= 500))) {
    return new ErreurIA('Le service est momentanément surchargé. Réessaie dans quelques instants.', opt);
  }
  if (e instanceof Anthropic.APIConnectionError) return new ErreurIA('Connexion impossible. Vérifie ta connexion internet (ou l\'adresse du relais) puis réessaie.', opt);
  if (e instanceof Anthropic.APIError) return new ErreurIA(`Erreur de l'API (${e.status || '?'}) : ${e.message}`, opt);
  return new ErreurIA(`Erreur inattendue : ${e && e.message ? e.message : e}`, opt);
}

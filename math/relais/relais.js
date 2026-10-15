// Relais Maths APC — facultatif (Cloudflare Workers, offre gratuite suffisante).
//
// À quoi ça sert : donner l'accès à l'IA à des collègues sans leur confier la
// clé API. La clé reste secrète sur le relais ; chaque enseignant saisit dans
// les Réglages de l'application l'adresse du relais et un code d'accès.
//
// Variables à définir dans Cloudflare (Settings → Variables and Secrets) :
//   ANTHROPIC_API_KEY  (secret) la clé API Anthropic, « sk-ant-… »
//   CODES_ACCES        (secret) codes autorisés, séparés par des virgules
//   ORIGINES           (texte)  sites autorisés, ex. « https://math.godtrading.store »

const MODELES_AUTORISES = ['claude-opus-5-5', 'claude-sonnet-5-5'];

export default {
  async fetch(request, env) {
    const origines = (env.ORIGINES || 'https://math.godtrading.store').split(',').map(s => s.trim()).filter(Boolean);
    const origine = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': origines.includes(origine) ? origine : origines[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Expose-Headers': 'request-id, retry-after',
      Vary: 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'content-type, x-api-key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const erreur = (status, type, message) => new Response(
      JSON.stringify({ type: 'error', error: { type, message } }),
      { status, headers: { ...cors, 'content-type': 'application/json' } },
    );

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/v1/messages') {
      return erreur(404, 'not_found_error', 'Adresse inconnue.');
    }
    if (origine && !origines.includes(origine)) {
      return erreur(403, 'permission_error', 'Site non autorisé.');
    }

    const codes = (env.CODES_ACCES || '').split(',').map(s => s.trim()).filter(Boolean);
    const code = (request.headers.get('x-api-key') || '').trim();
    if (!codes.length || !codes.includes(code)) {
      return erreur(401, 'authentication_error', "Code d'accès invalide.");
    }

    let corps;
    try {
      corps = await request.json();
    } catch {
      return erreur(400, 'invalid_request_error', 'Requête illisible.');
    }
    if (!MODELES_AUTORISES.includes(corps.model)) {
      return erreur(400, 'invalid_request_error', 'Modèle non autorisé sur ce relais.');
    }

    const entetes = new Headers({ 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY });
    for (const h of ['anthropic-version', 'anthropic-beta']) {
      const v = request.headers.get(h);
      if (v) entetes.set(h, v);
    }

    const reponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: entetes,
      body: JSON.stringify(corps),
    });

    const sortie = new Headers(reponse.headers);
    for (const [k, v] of Object.entries(cors)) sortie.set(k, v);
    return new Response(reponse.body, { status: reponse.status, headers: sortie });
  },
};

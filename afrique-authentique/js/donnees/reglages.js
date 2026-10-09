/* ==========================================================================
   AFRIQUE AUTHENTIQUE — RÉGLAGES GÉNÉRAUX
   --------------------------------------------------------------------------
   C'est le premier fichier à personnaliser : numéro WhatsApp, e-mail,
   réseaux sociaux, menu, rubriques, proverbes et partenaires.
   Règle d'or : modifiez uniquement le texte ENTRE les guillemets "…" ou '…'
   et gardez les virgules en fin de ligne.
   ========================================================================== */

const REGLAGES = { // Ouvre l'objet qui contient les réglages du site
  nomSite: 'Afrique Authentique', // Nom du site (utilisé dans les titres et messages WhatsApp)
  whatsapp: '22900000000', // ⚠ À REMPLACER : numéro WhatsApp des commandes, au format international, sans « + » ni espaces (ex. Bénin : 229 + numéro)
  telephoneAffiche: '+229 00 00 00 00', // ⚠ À REMPLACER : numéro tel qu'il s'affiche sur le site
  email: 'bonjour@afrique-authentique.com', // ⚠ À REMPLACER : adresse e-mail officielle
  ville: 'Cotonou, Bénin', // ⚠ À VÉRIFIER : ville affichée dans le pied de page et la page contact
  devise: 'FCFA', // Devise affichée après les prix
  communauteWhatsApp: '', // Lien d'invitation au groupe ou à la chaîne WhatsApp (laisser vide pour masquer)
  formulaireEndpoint: '', // Adresse d'un service d'envoi de formulaires (Formspree, Web3Forms…). Vide = ouverture de la messagerie e-mail
  reseaux: [ // Liste des réseaux sociaux (supprimez une ligne pour masquer un réseau)
    { nom: 'Instagram', url: 'https://www.instagram.com/' }, // ⚠ Remplacez par l'adresse de votre compte
    { nom: 'Facebook', url: 'https://www.facebook.com/' }, // ⚠ Idem
    { nom: 'TikTok', url: 'https://www.tiktok.com/' }, // ⚠ Idem
    { nom: 'YouTube', url: 'https://www.youtube.com/' }, // ⚠ Idem
  ], // Fin de la liste des réseaux
}; // Fin des réglages


/* MENU PRINCIPAL ------------------------------------------------------------
   Chaque ligne = un lien du menu. « id » doit correspondre à l'attribut
   data-page de la page concernée (pour la surligner quand on y est).
   « teinte » = couleur associée (laterite, ocre, indigo, palme, kola).     */

const MENU = [ // Ouvre la liste des liens
  { id: 'accueil', nom: 'Accueil', url: 'index.html', num: '00', teinte: 'laterite' }, // Lien vers l'accueil
  { id: 'aux-origines', nom: 'Aux origines', url: 'aux-origines.html', num: '01', teinte: 'laterite' }, // Rubrique 1
  { id: 'figures-et-horizons', nom: 'Figures & Horizons', url: 'figures-et-horizons.html', num: '02', teinte: 'indigo' }, // Rubrique 2
  { id: 'savoir-faire', nom: 'Savoir-Faire', url: 'savoir-faire.html', num: '03', teinte: 'ocre' }, // Rubrique 3
  { id: 'evenements', nom: 'Événements', url: 'evenements.html', num: '04', teinte: 'palme' }, // Rubrique 4
  { id: 'odyssees', nom: 'Odyssées', url: 'odyssees.html', num: '05', teinte: 'kola' }, // Voyages
  { id: 'tresors', nom: "Trésors d'Afrique", url: 'tresors.html', num: '06', teinte: 'ocre' }, // Boutique
]; // Fin du menu

const MENU_CERCLE = [ // Liens « communauté », affichés dans le menu et le pied de page
  { id: 'cercle', nom: 'Rejoindre le cercle', url: 'rejoindre-le-cercle.html' }, // Page contact
  { id: 'partenaire', nom: 'Devenir partenaire', url: 'devenir-partenaire.html' }, // Page partenaires
]; // Fin

const MENU_LEGAL = [ // Liens légaux, affichés tout en bas du site
  { id: 'mentions', nom: 'Mentions légales', url: 'mentions-legales.html' }, // Mentions légales
  { id: 'confidentialite', nom: 'Confidentialité', url: 'confidentialite.html' }, // Politique de confidentialité
  { id: 'cookies', nom: 'Cookies', url: 'cookies.html' }, // Politique cookies
  { id: 'conditions', nom: 'Conditions générales', url: 'conditions-generales.html' }, // Conditions de vente
]; // Fin


/* RUBRIQUES ÉDITORIALES -----------------------------------------------------
   Les récits (fichier recits.js) indiquent leur rubrique avec ces clés :
   'aux-origines', 'figures-et-horizons', 'savoir-faire', 'evenements'.     */

const RUBRIQUES = { // Ouvre la liste des rubriques
  'aux-origines': { // Clé de la rubrique 1
    nom: 'Aux origines', // Nom affiché
    num: '01', // Numéro
    url: 'aux-origines.html', // Page de la rubrique
    teinte: 'laterite', // Couleur
    resume: "Royaumes, symboles et lieux de mémoire : remonter le fil pour comprendre ce qui nous tient debout.", // Description courte
  }, // Fin de la rubrique 1
  'figures-et-horizons': { // Clé de la rubrique 2
    nom: 'Figures & Horizons', // Nom affiché
    num: '02', // Numéro
    url: 'figures-et-horizons.html', // Page
    teinte: 'indigo', // Couleur
    resume: "Portraits de celles et ceux qui ont marqué le continent, et regards sur ce qui s'invente aujourd'hui.", // Description
  }, // Fin de la rubrique 2
  'savoir-faire': { // Clé de la rubrique 3
    nom: 'Savoir-Faire', // Nom affiché
    num: '03', // Numéro
    url: 'savoir-faire.html', // Page
    teinte: 'ocre', // Couleur
    resume: "Tisser, teindre, façonner : les gestes transmis de main en main, documentés avec celles et ceux qui les pratiquent.", // Description
  }, // Fin de la rubrique 3
  'evenements': { // Clé de la rubrique 4
    nom: 'Événements', // Nom affiché
    num: '04', // Numéro
    url: 'evenements.html', // Page
    teinte: 'palme', // Couleur
    resume: "Fêtes, festivals, cérémonies et rencontres du cercle : là où la culture se vit au présent.", // Description
  }, // Fin de la rubrique 4
}; // Fin des rubriques


/* PROVERBES -----------------------------------------------------------------
   Affichés sur l'accueil (bouton « Un autre proverbe »). Ajoutez-en autant
   que vous voulez en copiant une ligne.                                      */

const PROVERBES = [ // Ouvre la liste
  { texte: "En Afrique, quand un vieillard meurt, c'est une bibliothèque qui brûle.", source: 'Amadou Hampâté Bâ, UNESCO, 1960' }, // Proverbe 1
  { texte: 'Quand la musique change, la danse change aussi.', source: 'Proverbe haoussa' }, // Proverbe 2
  { texte: 'La pluie ne tombe pas sur un seul toit.', source: 'Proverbe camerounais' }, // Proverbe 3
  { texte: "Le tronc d'arbre a beau séjourner dans l'eau, il ne deviendra jamais crocodile.", source: 'Proverbe bambara' }, // Proverbe 4
  { texte: "Il n'y a pas de mal à revenir chercher ce que l'on a oublié.", source: 'Proverbe akan — Sankofa' }, // Proverbe 5
]; // Fin des proverbes


/* PARTENAIRES ---------------------------------------------------------------
   Logos affichés sur la page « Devenir partenaire ». Tant que la liste est
   vide, un message d'invitation s'affiche à la place.
   Modèle d'une ligne : { nom: 'Atelier X', logo: 'assets/partenaires/x.png', url: 'https://…' },  */

const PARTENAIRES = [ // Ouvre la liste (vide pour l'instant)
]; // Fin des partenaires

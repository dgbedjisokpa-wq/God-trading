# Afrique Authentique — le blog

Site complet en HTML, CSS et JavaScript (sans outil à installer), conçu d'après le devis :
16 pages et modèles, boutique avec commande WhatsApp, agenda, formulaires et pages légales.
**Chaque ligne de code est commentée en français.**

---

## 1. Ouvrir le site

- **Le plus simple** : double-cliquez sur `index.html`. Le site s'ouvre dans le navigateur.
- **Comme en ligne** (recommandé pour tester) : dans ce dossier, lancez `python3 -m http.server`
  puis ouvrez <http://localhost:8000>.

## 2. Les pages

| Page | Fichier | Rôle |
|---|---|---|
| Accueil | `index.html` | Ouverture, à la une, rubriques, récits, proverbe, odyssées, trésors, agenda |
| Aux origines | `aux-origines.html` | Rubrique 01 (récits filtrables par pays) |
| Figures & Horizons | `figures-et-horizons.html` | Rubrique 02 (portraits) |
| Savoir-Faire | `savoir-faire.html` | Rubrique 03 |
| Événements | `evenements.html` | Agenda (à venir / passés, réservation WhatsApp, ajout à l'agenda) + récits |
| **Modèle** Article / Portrait | `article.html?id=…` | Une seule page pour tous les récits |
| Odyssées | `odyssees.html` | Voyages |
| **Modèle** Fiche destination | `destination.html?id=…` | Une seule page pour toutes les destinations |
| Trésors d'Afrique | `tresors.html` | Boutique (filtres par catégorie) |
| **Modèle** Fiche produit | `produit.html?id=…` | Une seule page pour tous les produits |
| Rejoindre le cercle | `rejoindre-le-cercle.html` | Contact + formulaire |
| Devenir partenaire | `devenir-partenaire.html` | Partenariats + formulaire |
| Mentions légales, Confidentialité, Cookies, Conditions générales | `mentions-legales.html`, `confidentialite.html`, `cookies.html`, `conditions-generales.html` | Pages institutionnelles |

## 3. Où se trouve quoi

```
afrique-authentique/
├── index.html … conditions-generales.html   ← les 16 pages
├── css/
│   ├── 1-fondations.css   ← COULEURS et POLICES (variables en haut du fichier), boutons
│   ├── 2-motifs.css       ← motifs textiles, teintes, cadres d'image, frise de kente, rideau
│   ├── 3-structure.css    ← en-tête, menu, pied de page, calebasse, cookies
│   ├── 4-sections.css     ← blocs de l'accueil, cartes, agenda
│   └── 5-pages.css        ← pages rubrique, récit, destination, produit, formulaires, légales
├── js/
│   ├── donnees/           ← TOUS LES CONTENUS (c'est ici que l'on écrit)
│   │   ├── reglages.js    ← WhatsApp, e-mail, réseaux, menu, proverbes, partenaires
│   │   ├── recits.js      ← les articles et portraits
│   │   ├── odyssees.js    ← les destinations
│   │   ├── tresors.js     ← les produits
│   │   └── agenda.js      ← les événements
│   ├── site.js            ← fonctionnement commun (menu, calebasse, formulaires…)
│   └── rendu.js           ← affiche les contenus dans les pages
└── assets/
    ├── favicon.svg        ← icône de l'onglet
    └── motifs/            ← dessins des motifs (bogolan, kente, adire, ndebele, kuba, cauris)
```

## 4. Les premières choses à remplacer

1. **`js/donnees/reglages.js`** : numéro WhatsApp des commandes (`whatsapp`, au format `229XXXXXXXXXX`,
   sans « + » ni espaces), e-mail, ville, liens des réseaux sociaux.
2. **Le logo** : dans `js/site.js`, cherchez `const LOGO` et remplacez le texte par
   `'<img src="assets/logo.svg" alt="Afrique Authentique">'` (déposez le fichier dans `assets/`).
3. **Les photos** (voir point 6).
4. **Les pages légales** : les passages surlignés en jaune `[ … ]` sont à compléter et à faire valider.
5. **Les contenus d'exemple** : récits, produits, prix, événements et destinations ont été rédigés
   pour la maquette. Ils sont à relire et à remplacer par les textes définitifs.
6. **L'image de partage** : déposez une image de 1200 × 630 px nommée `assets/partage.jpg`.

## 5. Ajouter un contenu (sans toucher au HTML)

Ouvrez le fichier de données, **copiez un bloc `{ … },` entier**, collez-le juste en dessous,
puis changez l'`id` (sans espace ni accent) et les textes. Le premier bloc de chaque fichier est
commenté ligne par ligne : il sert de modèle.

- Nouveau récit → `recits.js` : il apparaît dans sa rubrique, sur l'accueil et sur `article.html?id=son-id`.
- Nouveau produit → `tresors.js` : boutique, accueil, `produit.html?id=son-id`, calebasse et WhatsApp.
- Nouvelle destination → `odyssees.js`.
- Nouvel événement → `agenda.js` : il passe tout seul dans « Passés » une fois la date dépassée.

## 6. Mettre une vraie photo

Tant qu'il n'y a pas de photo, chaque cadre affiche une composition graphique
(couleur + motif textile + forme). Pour une photo :

- **dans les fichiers de données** : renseignez `image: 'assets/photos/ganvie.jpg'` et
  `alt: 'Pirogues sur le lac Nokoué'` (description pour les personnes malvoyantes et pour Google) ;
- **dans une page HTML** : placez une balise `<img>` dans le cadre :
  `<figure class="plaque" data-teinte="indigo"><img src="assets/photos/x.jpg" alt="…"></figure>`.

Conseil : photos en `.jpg` ou `.webp`, environ 1600 px de large, moins de 400 Ko.

## 7. Changer les couleurs ou les polices

Tout est en haut de `css/1-fondations.css` : `--laterite`, `--ocre`, `--indigo`, `--palme`,
`--kola`, `--sable`… Changez un code couleur et tout le site suit. Les polices
(`--f-titre`, `--f-texte`, `--f-ui`) se chargent depuis Google Fonts dans l'en-tête de chaque page.

## 8. Commandes, formulaires, cookies

- **Calebasse (panier)** : mémorisée dans le navigateur du visiteur. Le bouton
  « Commander via WhatsApp » envoie un récapitulatif (articles, variantes, quantités, total).
- **Formulaires** : sans réglage, ils ouvrent la messagerie e-mail du visiteur avec le message
  prêt, ou WhatsApp avec le bouton dédié. Pour recevoir les messages directement, créez un
  formulaire gratuit sur un service comme Formspree ou Web3Forms, puis collez son adresse dans
  `formulaireEndpoint` (fichier `reglages.js`).
- **Cookies** : le bandeau demande l'accord. Un outil de mesure d'audience éventuel se colle
  dans la fonction `chargerMesureAudience()` de `js/site.js` : il ne se charge qu'avec l'accord du visiteur.

## 9. Mise en ligne

Copiez tout le contenu de ce dossier chez l'hébergeur (dossier `public_html` ou `www`).
Aucune base de données ni installation n'est nécessaire.

## 10. Direction artistique

Le site est pensé comme un **carnet de cultures**, à la manière d'un magazine imprimé, et non
comme un modèle de site standard :

- **Références** : la presse culturelle et de mode africaine (*Nataal*, *Chimurenga*), les
  magazines éditoriaux indépendants (*Kinfolk*, *Apartamento*), les musées d'art africain
  contemporain (Zeitz MOCAA, Fondation Zinsou) et les sites primés sur Awwwards pour leurs
  mises en page asymétriques.
- **Typographie** : Bodoni Moda (titres de magazine), Newsreader (lecture longue), Archivo élargie
  (étiquettes).
- **Couleurs** : terre de latérite, ocre, indigo, vert palme, brun kola, sur un papier couleur raphia
  avec un léger grain.
- **Motifs** : dessinés d'après le bogolan, le kente, l'adire, les peintures ndebele, le velours
  kuba et les cauris. Ils sont recolorables et servent de visuels en attendant les photos.
- **Détails** : rideau de couleurs entre les pages, sceau qui tourne, « bienvenue » dans neuf
  langues, numérotation de magazine, index des rubriques avec aperçu qui suit la souris,
  calebasse à la place du panier.
- **Accessibilité** : navigation au clavier, contrastes vérifiés, respect du réglage
  « réduire les animations », textes alternatifs prévus pour chaque image.

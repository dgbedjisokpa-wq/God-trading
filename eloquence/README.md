# Ahouéfa · Coach d'éloquence

Application web pour travailler son éloquence : parler avec clarté, confiance et
impact, cinq minutes par jour. La mascotte **Ahouéfa** (foulard violet, sa
couleur préférée) guide l'utilisateur. L'interface s'inspire de Duolingo :
parcours en zigzag, boutons en relief, série de jours, XP, quêtes, coffres.

HTML, CSS et JavaScript, sans dépendance ni étape de construction. Tout tourne
dans le navigateur. La progression et les enregistrements restent sur
l'appareil (`localStorage`) ; l'analyse de la voix (volume, pauses, mélodie)
se fait localement. Seule la transcription utilise la reconnaissance vocale du
navigateur, qui passe par un service en ligne sur Chrome.

## Le parcours d'une personne, du début à la fin

1. **Accueil personnalisé** : prénom, accord au féminin ou au masculin,
   motivations (plusieurs choix possibles : carrière, examens, confiance,
   public, convaincre, progresser), ressenti à l'oral, objectif quotidien,
   heure du rappel, puis test du micro et de la reconnaissance vocale
   (« Dis : Bonjour Ahouéfa ! »). Ahouéfa construit alors un plan adapté.
2. **Point de départ** : les personnes à l'aise passent un test de niveau
   (questions et lectures sur les unités 1 à 9) et commencent directement
   au bon endroit ; les autres commencent à la première leçon.
3. **Bilan vocal de départ** : 45 secondes pour se présenter ; débit, tics,
   pauses, mélodie et note sur 100 sont enregistrés.
4. **Chaque jour** : leçons du parcours, rappel dans l'agenda du téléphone
   (fichier `.ics` quotidien) et dans l'application, série, quêtes, objectif.
   L'onglet Entraînement met en avant les outils liés aux motivations choisies.
5. **Mi-parcours** (après l'unité 5) puis **fin** (après l'unité 10) : même
   bilan vocal, comparé au départ, ligne par ligne.
6. **Diplôme** : une fois les 10 unités terminées, un diplôme d'éloquence au
   prénom de la personne, à télécharger ou partager.

Les motivations, l'accord, l'objectif et le rappel se modifient à tout moment
dans Réglages. Le bouton « retour » du téléphone ne fait jamais quitter une
leçon par erreur : il demande confirmation.

## Ce que contient l'application

**Parcours : 10 unités, 50 leçons, 10 révisions, 10 coffres**

1. Les fondations : souffle ventral, posture, échauffement vocal, trac
2. Articulation et diction : bouche, virelangues, exercice du bouchon, consonnes
3. Chasser les tics de langage : repérage, pouvoir du silence, mots béquilles
4. Enrichir son vocabulaire : verbes précis, mots forts, mots soutenus, fautes courantes
5. Structurer sa pensée : connecteurs, méthode PREP, plan en trois parties, concision, accroches
6. L'art de convaincre : ethos/pathos/logos, figures de style, sophismes, grands discours
7. Raconter des histoires : schéma narratif, trame express, détails sensoriels
8. Improvisation et répartie : « oui, et… », une minute sur un sujet tiré au sort, mots imposés, questions pièges, avocat du diable
9. Voix et expressivité : débit, intonation, emphase, lecture expressive
10. Prendre la parole en public : langage du corps, pitch de 60 secondes, entretien d'embauche, grand oral

**12 types d'exercices**

- QCM, vrai/faux, texte à trou, remise en ordre, association de paires
- Chasse aux tics : toucher les « euh », « du coup », « en fait »… dans un texte
- Lecture vocale : la reconnaissance vocale vérifie chaque mot (mots en vert ou en rouge)
- Intonation : enregistrement, réécoute et courbe de la mélodie de la voix
- Respiration guidée : cercle animé (cohérence cardiaque, 4-7-8, carrée…)
- Échauffements minutés, lus à voix haute par Ahouéfa
- Discours libre analysé : débit en mots par minute, tics repérés, pauses et
  blancs, variation de la voix en demi-tons, répétitions, richesse du
  vocabulaire, note sur 100 et conseils d'Ahouéfa

**Entraînement libre** : improvisation, 42 virelangues, 5 techniques de
respiration, studio d'analyse, lecture de grands textes du domaine public (Hugo,
Jaurès, Zola, La Fontaine, Rostand…), débat express, entretien d'embauche, mots
imposés, mot du jour, miroir (se filmer pour observer sa posture), révision des
erreurs.

**Motivation** : XP et 15 niveaux (de « Murmure » à « Légende de l'éloquence »),
série de jours avec gel de série, objectif quotidien, 3 quêtes par jour,
10 badges à paliers, améthystes, boutique (gel, boost d'XP, tenues
d'Ahouéfa), test de niveau pour sauter des unités, mode sombre, application
installable sur téléphone (PWA, fonctionne hors ligne).

## Tester en local

```sh
# depuis la racine du dépôt
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/eloquence/
```

Le micro n'est accessible que sur `https://` ou `localhost`. Ouvrir
`index.html` directement fonctionne aussi, mais sans micro ni mode hors ligne.

Une fois le dépôt publié par GitHub Pages, l'application est à l'adresse
`https://godtrading.store/eloquence/`.

## Compatibilité de la voix

| Navigateur | Reconnaissance vocale | Enregistrement et analyse de la voix |
| --- | --- | --- |
| Chrome, Edge (ordinateur, Android) | Oui (passe par le service de Google, il faut Internet) | Oui |
| Safari (iPhone, iPad, Mac) | Oui | Oui |
| Firefox | Non : la personne s'enregistre, se réécoute et s'auto-évalue | Oui |

Sans reconnaissance vocale, le discours libre mesure quand même les pauses et
l'intonation, et propose de compter ses tics en se réécoutant. Le bouton
« Je ne peux pas parler » met les exercices oraux en pause pendant une heure.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page unique qui charge les scripts dans l'ordre |
| `css/app.css` | Tout le design (couleurs en variables en haut du fichier, mode sombre) |
| `js/data/course.js` | Le parcours : unités, leçons, exercices, guides |
| `js/data/banks.js` | Banques de contenu : virelangues, mots, connecteurs, figures, sujets, textes… |
| `js/generators.js` | Tire au hasard des exercices dans les banques (chaque leçon varie) |
| `js/exercises.js` | Les 12 types d'exercices |
| `js/lesson.js` | Déroulé d'une leçon et écrans de fin |
| `js/pages.js` | Parcours, entraînement, quêtes, profil, boutique, réglages |
| `js/onboarding.js` | Premier lancement : questions, test du micro et de la reconnaissance vocale |
| `js/plan.js` | Plan personnalisé, bilans vocaux, diplôme, rappel `.ics`, installation |
| `js/store.js` | Progression, XP, série, quêtes, badges, boutique |
| `js/speech.js` | Synthèse vocale, reconnaissance, micro, détection de la hauteur de voix |
| `js/analysis.js` | Analyse d'un discours (débit, tics, pauses, intonation, note) |
| `js/mascot.js` | Ahouéfa en SVG et ses humeurs |
| `sw.js`, `manifest.webmanifest`, `icons/` | Application installable et hors ligne |
| `tests/` | Tests automatiques |

## Modifier le contenu

- **Ajouter un exercice à une leçon** : dans `js/data/course.js`, ajouter un
  objet dans `steps`. Exemples :
  - `{ type: 'mcq', prompt: 'Question ?', options: ['Bonne', 'Fausse'], answer: 0, explain: 'Pourquoi.' }`
  - `{ type: 'tf', statement: 'Affirmation.', answer: false, explain: '…' }`
  - `{ type: 'speak', prompt: 'Lis à voix haute', text: 'La phrase.' }`
  - `{ type: 'free', prompt: 'Titre', topic: 'Sujet', prep: 20, duration: 60 }`
- **Ajouter un virelangue, un mot du jour, un sujet d'improvisation** : une
  ligne dans la liste correspondante de `js/data/banks.js`.
- **Renommer l'application** : le nom apparaît dans `index.html`,
  `manifest.webmanifest`, `js/app.js` (logo) et `js/pages.js` (réglages).
- Après chaque modification publiée, incrémenter `VERSION` dans `sw.js` pour
  que les téléphones récupèrent la nouvelle version.

## Tests

```sh
node eloquence/tests/content.test.js   # contenu des 50 leçons, analyse, progression (sans navigateur)
node eloquence/tests/e2e.test.js       # parcours complet dans Chromium (nécessite Playwright)
```

Le test de bout en bout joue l'accueil, l'unité 1 entière avec sa révision, une
leçon de chaque unité, toutes les pages, le studio d'analyse vocale, la
respiration, le test de niveau, la boutique, puis le mode sombre sur ordinateur.
La reconnaissance vocale y est simulée ; le micro et la caméra sont ceux, factices, de Chromium.

## Pour la suite

- **Abonnement** : la boutique et les quêtes sont prêtes à accueillir une offre
  payante (unités avancées, analyses illimitées, coaching personnalisé…). Il
  faudra alors des comptes utilisateurs et un serveur pour synchroniser la
  progression entre appareils et gérer le paiement.
- **Classements entre amis** : ils nécessitent aussi un serveur.
- **Analyse par IA** : un serveur pourrait commenter le fond du discours
  (structure, arguments), en plus de la forme déjà mesurée.

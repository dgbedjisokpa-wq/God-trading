# Maths APC — fiches et épreuves de mathématiques (Bénin)

Application web destinée à **math.godtrading.store**, séparée du site GOD TRADING.
Elle rédige avec l'IA Claude (Anthropic), selon l'Approche Par Compétences
pratiquée au Bénin, de la 6e à la Terminale, en secondaire général comme dans
l'enseignement technique :

- **Fiche** : fiche pédagogique APC complète d'une séquence (éléments de
  planification, situation de départ, introduction, réalisation, retour et
  projection, exercice de maison).
- **Modifier** : l'enseignant importe sa fiche (Word .docx, PDF, photos des
  pages ou texte collé) et dit ce qu'il faut changer.
- **Évaluations** : interrogation (une seule, ou une par séquence), devoir de
  table, devoir de maison, composition, examen blanc ; toujours avec
  **corrigé type et barème** (critères Ca / Cm / Co + perfectionnement, ou
  CM1 / CM2 / CM3 + CP, ou points par question ; sur 20, 10 ou 100).
- **Documents** : tout est gardé sur l'appareil ; recherche, sauvegarde et
  restauration (.json).
- **Programmes** : la « mémoire » de chaque classe (situations
  d'apprentissage et séquences), modifiable par l'enseignant. L'IA s'en sert
  pour toutes les fiches et épreuves de la classe.

Chaque document peut être retouché (« Demander une modification »), modifié à
la main, exporté en **Word**, imprimé ou enregistré en **PDF**, copié ou
partagé (WhatsApp…). Pour une épreuve, on peut exporter l'épreuve seule (à
distribuer) ou le corrigé seul.

## Première utilisation

1. Créer une clé API sur [console.anthropic.com](https://console.anthropic.com/settings/keys)
   (rubrique API Keys) et recharger un peu de crédit (Plans & Billing).
2. Dans l'application : **Réglages** (roue dentée) → coller la clé →
   **Tester l'accès** → **Enregistrer**. Remplir aussi le profil
   (établissement, année scolaire) pour les en-têtes.
3. **Programmes** : vérifier le programme de ses classes avec le guide du
   programme et le corriger si besoin (le programme pré-rempli est une base).

La clé reste dans le navigateur de l'appareil et n'est envoyée qu'à
Anthropic. Coût indicatif : environ 0,20 à 0,40 $ (≈ 120 à 250 FCFA) par
document avec Claude Opus 5.5, environ moitié moins avec Claude Sonnet 5.5
(modèle au choix dans les Réglages ; vérifier les tarifs sur le site
d'Anthropic).

## Mise en ligne sur math.godtrading.store

GitHub Pages n'accepte qu'un domaine par dépôt : l'application a donc son
propre dépôt.

1. Sur GitHub, créer un dépôt (par exemple `maths-apc`) et y déposer **le
   contenu** du dossier `math/` (à la racine du dépôt, avec le fichier
   `CNAME`). Le dossier `relais/` et ce README peuvent être déposés aussi.
2. Dans le dépôt : *Settings → Pages → Build and deployment* : « Deploy from a
   branch », branche `main`, dossier `/ (root)`. *Custom domain* :
   `math.godtrading.store`, puis cocher *Enforce HTTPS* quand c'est proposé.
3. Chez le gestionnaire du nom de domaine godtrading.store, ajouter un
   enregistrement DNS : type **CNAME**, nom **math**, valeur
   **dgbedjisokpa-wq.github.io**. La mise en service prend de quelques minutes
   à quelques heures.

En attendant, une fois cette branche fusionnée dans le dépôt du site,
l'application est aussi accessible à l'adresse `godtrading.store/math/`
(tous les chemins sont relatifs : elle fonctionne aux deux adresses).

## Relais (facultatif) : donner l'accès à des collègues

Pour que des collègues utilisent l'application sans connaître la clé API,
installer le relais `relais/relais.js` sur Cloudflare Workers (offre gratuite) :

1. [dash.cloudflare.com](https://dash.cloudflare.com) → *Workers & Pages* →
   *Create* → *Worker* → remplacer le code par celui de `relais/relais.js` →
   *Deploy*.
2. *Settings → Variables and Secrets* : `ANTHROPIC_API_KEY` (secret, la clé),
   `CODES_ACCES` (secret, codes séparés par des virgules, un par collègue),
   `ORIGINES` (`https://math.godtrading.store`).
3. Chaque collègue saisit dans **Réglages → Utiliser un relais** l'adresse du
   worker (`https://….workers.dev`) et son code. Pour retirer un accès,
   supprimer son code de `CODES_ACCES`.

Toutes les demandes sont alors payées sur le compte Anthropic du propriétaire
du relais.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de l'application (onglets, formulaires, vue document) |
| `app.css` | Mise en page (mobile d'abord), feuille A4, impression |
| `js/app.js` | Logique de l'interface |
| `js/programmes.js` | Programmes pré-remplis par classe et série (6e → Tle, général et technique) |
| `js/prompts.js` | Consignes données à l'IA : modèle APC béninois de fiche et d'épreuve, barème |
| `js/ia.js` | Appel à Claude (SDK officiel Anthropic, réponse en continu) |
| `js/markdown.js` | Mise en forme des documents (tableaux, fractions, vecteurs, racines…) |
| `js/fichiers.js` | Lecture des fichiers importés (Word, PDF, photos) |
| `js/export.js` | Export Word, impression / PDF, copie, partage |
| `js/stockage.js` | Mémoire locale (réglages, programmes, documents, sauvegarde) |
| `vendor/` | SDK Anthropic 0.134.0 en un seul fichier (licence incluse) |
| `relais/relais.js` | Relais Cloudflare facultatif |

Pas d'étape de construction : les fichiers sont servis tels quels. Pour tester
en local depuis la racine du dépôt : `python3 -m http.server 8000`, puis
ouvrir `http://localhost:8000/math/`.

Pour changer le modèle d'IA par défaut : `MODELES` dans `js/app.js` et
`MODELE_DEFAUT` dans `js/ia.js`. Pour améliorer le modèle de fiche ou
d'épreuve : le texte `SYSTEME` de `js/prompts.js`.

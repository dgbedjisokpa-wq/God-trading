# GOD TRADING — site vitrine

Site d'une page de la formation GOD TRADING, publié sur
[godtrading.store](https://godtrading.store) via GitHub Pages (`CNAME`).

Le site est en HTML/CSS/JS statique, sans dépendance ni étape de build :
le contenu est directement dans `index.html`, il s'affiche donc même sans
JavaScript et il est lisible par les moteurs de recherche. Aucune ressource
n'est chargée depuis un serveur tiers (polices comprises).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Tout le contenu de la page (textes, prix, avis, FAQ, liens WhatsApp) |
| `style.css` | Mise en page, couleurs et typographie (variables en haut du fichier), responsive et mouvement |
| `script.js` | Menu mobile, en-tête, barre d'action mobile, carrousel des avis, apparitions au défilement |
| `assets/` | Images (JPEG + WebP), icônes, image de partage (`og-image.jpg`) |
| `assets/fonts/` | Polices Playfair Display, Manrope et Cinzel (logo), hébergées sur le site |
| `404.html` | Page « introuvable » |
| `site.webmanifest`, `favicon.ico` | Icônes du site |
| `robots.txt`, `sitemap.xml` | Référencement |
| `_config.yml` | Réglage GitHub Pages (n'y publie pas ce README) |
| `.claude/skills/apple-design/` | Guide de conception utilisé pour le mouvement et les interactions |

## Application Maths APC (`math/`)

Le dossier `math/` contient une application séparée, prévue pour
**math.godtrading.store** : rédaction de fiches pédagogiques APC,
d'interrogations, de devoirs et de compositions de mathématiques (Bénin,
6e à Tle) avec corrigé et barème. Sa mise en ligne et son fonctionnement sont
décrits dans `math/README.md`. Elle n'utilise aucun fichier du site vitrine.

## Modifier le contenu

- **Textes et prix** : directement dans `index.html`, section par section
  (chaque section commence par un commentaire `<!-- ===== … ===== -->`).
- **Avis** : section `AVIS` de `index.html`, un bloc `<figure class="rv-card">`
  par avis. Les avis actuels sont **fictifs** : les remplacer par de vrais
  témoignages d'élèves (avec leur accord) dès que possible. Les points,
  le compteur et les flèches du carrousel s'adaptent au nombre d'avis.
- **FAQ** : un bloc `<details class="faq-item">` par question.
- **WhatsApp** : les liens utilisent `https://wa.me/2290193324439?text=…`.
  Chaque bouton ajoute sa source au message (`[site : accueil]`,
  `[site : offres]`…) pour savoir quel bouton amène les demandes.
  Pour changer de numéro : remplacer `2290193324439` partout dans `index.html`,
  puis le numéro affiché `+229&nbsp;01&nbsp;93&nbsp;32&nbsp;44&nbsp;39` (en-tête,
  contact, pied de page), `+229 01 93 32 44 39` dans les `aria-label` et dans
  le bloc JSON-LD en haut de page.
- **Réseaux sociaux** : un bloc prêt à l'emploi est en commentaire dans le pied
  de page ; y mettre les vrais liens puis le décommenter.
- **Après une modification de `style.css` ou `script.js`** : incrémenter le
  numéro `?v=` dans `index.html` pour que les visiteurs reçoivent la nouvelle
  version tout de suite.

## Mouvement et interactions

Les animations suivent le guide `apple-design` : réponse immédiate au toucher,
mouvements interruptibles en « ressort » sans rebond (variable `--spring`),
seules `transform` et `opacity` sont animées, aucune animation en boucle.
Les réglages du téléphone sont respectés : « réduire les animations »,
« réduire la transparence » et « augmenter le contraste ».

## Tester en local

```sh
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

# GOD TRADING — site vitrine

Site d'une page de la formation GOD TRADING, publié sur
[godtrading.store](https://godtrading.store) via GitHub Pages (`CNAME`).

Le site est en HTML/CSS/JS statique, sans dépendance ni étape de build :
le contenu est directement dans `index.html`, il s'affiche donc même sans
JavaScript et il est lisible par les moteurs de recherche.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Tout le contenu de la page (textes, prix, avis, FAQ, liens WhatsApp) |
| `style.css` | Mise en page, couleurs (variables en haut du fichier), responsive et animations |
| `script.js` | Menu mobile, carrousel des avis, apparitions au défilement, effets souris |
| `assets/` | Images : emblème, manuel, favicon, image de partage (`og-image.jpg`) |
| `robots.txt`, `sitemap.xml` | Référencement |

## Modifier le contenu

- **Textes et prix** : directement dans `index.html`, section par section
  (chaque section commence par un commentaire `<!-- ===== … ===== -->`).
- **Avis** : section `AVIS` de `index.html`, un bloc `<figure class="rv-card">`
  par avis. Les avis actuels sont **fictifs** : les remplacer par de vrais
  témoignages d'élèves (avec leur accord) dès que possible. Les points et
  flèches du carrousel s'adaptent automatiquement au nombre d'avis.
- **FAQ** : un bloc `<details class="faq-item">` par question.
- **WhatsApp** : les liens utilisent `https://wa.me/2290193324439?text=…`.
  Pour changer de numéro, remplacer `2290193324439` partout dans `index.html`.
- **Réseaux sociaux** : un bloc prêt à l'emploi est en commentaire dans le pied
  de page ; y mettre les vrais liens puis le décommenter.

## Tester en local

```sh
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Application d'éloquence « Ahouéfa »

Le dossier [`eloquence/`](eloquence/) contient une application web séparée,
pour travailler son éloquence avec la mascotte Ahouéfa. Une fois publiée, elle
est accessible à l'adresse `https://godtrading.store/eloquence/`. Voir
[`eloquence/README.md`](eloquence/README.md).

/* ==========================================================================
   AFRIQUE AUTHENTIQUE — site.js
   --------------------------------------------------------------------------
   Tout ce qui est commun aux pages :
    1. Petites aides (formatage des prix, des dates, liens WhatsApp…)
    2. La calebasse (panier) : mémoire, calculs, message de commande
    3. Construction de l'en-tête, du menu, du pied de page, du tiroir
    4. Ouverture / fermeture des panneaux (menu, calebasse)
    5. Bandeau cookies
    6. Rideau de transition entre les pages
    7. En-tête qui se cache quand on descend
    8. Animations d'apparition au défilement
    9. Défilant, proverbes, défilement horizontal, aperçus
   10. Formulaires (vérification + envoi)
   11. Démarrage
   Les contenus (textes, produits…) sont dans le dossier js/donnees/.
   ========================================================================== */

(function () { // Fonction qui s'exécute immédiatement : nos variables restent « privées »
  'use strict'; // Mode strict : JavaScript signale davantage d'erreurs


  /* 1. PETITES AIDES ======================================================== */

  const $ = (selecteur, racine = document) => racine.querySelector(selecteur); // Trouve le premier élément qui correspond
  const $$ = (selecteur, racine = document) => Array.from(racine.querySelectorAll(selecteur)); // Trouve tous les éléments qui correspondent (en liste)
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // Vrai si le visiteur préfère moins d'animations
  const pageActuelle = document.body.dataset.page || ''; // Identifiant de la page (attribut data-page de <body>)

  function echapper(texte) { // Protège un texte avant de l'insérer dans du HTML (évite les caractères spéciaux cassants)
    return String(texte ?? '') // Convertit en texte (null ou undefined deviennent vides)
      .replace(/&/g, '&amp;') // & devient &amp;
      .replace(/</g, '&lt;') // < devient &lt;
      .replace(/>/g, '&gt;') // > devient &gt;
      .replace(/"/g, '&quot;') // " devient &quot;
      .replace(/'/g, '&#39;'); // ' devient &#39;
  } // Fin de echapper

  function majuscule(texte) { // Met la première lettre en majuscule
    return texte.charAt(0).toUpperCase() + texte.slice(1); // « mardi » devient « Mardi »
  } // Fin de majuscule

  function formaterPrix(montant) { // Affiche un prix lisible
    return new Intl.NumberFormat('fr-FR').format(montant) + ' ' + REGLAGES.devise; // 65000 devient « 65 000 FCFA »
  } // Fin de formaterPrix

  function dateDepuisIso(iso) { // Transforme « 2026-09-18 » en vraie date JavaScript
    const [annee, mois, jour] = iso.split('-').map(Number); // Découpe le texte en trois nombres
    return new Date(annee, mois - 1, jour); // Crée la date (les mois commencent à 0 en JavaScript)
  } // Fin de dateDepuisIso

  function formaterDate(iso, options) { // Écrit une date en toutes lettres
    const reglage = options || { day: 'numeric', month: 'long', year: 'numeric' }; // Par défaut : « 18 septembre 2026 »
    return new Intl.DateTimeFormat('fr-FR', reglage).format(dateDepuisIso(iso)); // Mise en forme en français
  } // Fin de formaterDate

  function lienWhatsApp(message) { // Crée un lien qui ouvre WhatsApp avec un message déjà écrit
    return 'https://wa.me/' + REGLAGES.whatsapp + '?text=' + encodeURIComponent(message); // encodeURIComponent protège accents et espaces
  } // Fin de lienWhatsApp

  function parametre(nom) { // Lit un paramètre de l'adresse (ex. ?id=ganvie)
    return new URLSearchParams(window.location.search).get(nom); // Renvoie la valeur, ou null s'il n'existe pas
  } // Fin de parametre

  function plaque(element, options = {}) { // Crée le HTML d'une « plaque » (cadre d'image) pour un récit, un produit…
    const balise = options.balise || 'figure'; // Balise utilisée (figure par défaut)
    const classes = 'plaque' + (options.classe ? ' ' + options.classe : ''); // Classes CSS
    const ratio = options.ratio ? ` style="--ratio:${options.ratio}"` : ''; // Proportions personnalisées (facultatif)
    const forme = options.forme || element.forme || 'aucune'; // Forme dessinée (soleil, arche…)
    const image = element.image // Si une photo est renseignée…
      ? `<img src="${echapper(element.image)}" alt="${echapper(element.alt || '')}" loading="lazy" decoding="async">` // …on l'affiche (chargement différé)
      : ''; // …sinon rien : la composition graphique s'affiche
    const legende = options.legende ? `<figcaption class="plaque__legende">${echapper(options.legende)}</figcaption>` : ''; // Petite légende (facultative)
    return `<${balise} class="${classes}" data-motif="${element.motif || 'bogolan'}" data-teinte="${element.teinte || 'sable'}" data-forme="${forme}"${ratio}>${image}${legende}</${balise}>`; // Assemble le tout
  } // Fin de plaque

  function lireStockage(cle) { // Lit une valeur mémorisée dans le navigateur
    try { return window.localStorage.getItem(cle); } catch (erreur) { return null; } // En navigation privée, la mémoire peut être bloquée : on renvoie « rien »
  } // Fin de lireStockage

  function ecrireStockage(cle, valeur) { // Mémorise une valeur dans le navigateur
    try { window.localStorage.setItem(cle, valeur); } catch (erreur) { /* mémoire indisponible : on ignore */ } // Sans planter le site
  } // Fin de ecrireStockage


  /* 2. LA CALEBASSE (panier) ================================================ */

  const CLE_CALEBASSE = 'aa-calebasse'; // Nom sous lequel la calebasse est mémorisée dans le navigateur
  let calebasseMemoire = []; // Copie de secours si la mémoire du navigateur est indisponible

  function trouverProduit(id) { // Retrouve un produit par son identifiant
    return PRODUITS.find((produit) => produit.id === id); // Parcourt la liste des produits (tresors.js)
  } // Fin de trouverProduit

  function prixUnitaire(produit, nomVariante) { // Prix d'un produit selon la variante choisie
    const variante = (produit.variantes || []).find((v) => v.nom === nomVariante); // Cherche la variante
    return variante && variante.prix ? variante.prix : produit.prix; // Prix de la variante s'il existe, sinon prix de base
  } // Fin de prixUnitaire

  const calebasse = { // Regroupe toutes les actions sur la calebasse
    lire() { // Renvoie la liste des articles
      const brut = lireStockage(CLE_CALEBASSE); // Lit la mémoire du navigateur
      let liste = calebasseMemoire; // Par défaut : la copie de secours
      if (brut) { try { liste = JSON.parse(brut); } catch (erreur) { liste = []; } } // Convertit le texte mémorisé en liste
      return Array.isArray(liste) ? liste.filter((ligne) => trouverProduit(ligne.id)) : []; // Ignore les produits qui n'existent plus
    }, // Fin de lire
    ecrire(liste) { // Enregistre la liste et met à jour l'affichage
      calebasseMemoire = liste; // Copie de secours
      ecrireStockage(CLE_CALEBASSE, JSON.stringify(liste)); // Mémorise dans le navigateur
      rendreCalebasse(); // Rafraîchit le tiroir et le compteur
    }, // Fin de ecrire
    ajouter(id, variante = '', quantite = 1) { // Ajoute un article
      const liste = this.lire(); // Liste actuelle
      const existante = liste.find((ligne) => ligne.id === id && ligne.variante === variante); // Le même article est-il déjà là ?
      if (existante) existante.quantite += quantite; // Oui : on augmente la quantité
      else liste.push({ id, variante, quantite }); // Non : on ajoute une ligne
      this.ecrire(liste); // Enregistre
      $$('[data-compteur]').forEach((compteur) => { // Petite animation sur le compteur
        compteur.classList.remove('compteur--pulse'); // Retire l'animation précédente…
        void compteur.offsetWidth; // …force le navigateur à « oublier » l'ancienne animation…
        compteur.classList.add('compteur--pulse'); // …et la relance
      }); // Fin de l'animation
    }, // Fin de ajouter
    changer(index, delta) { // Augmente ou diminue la quantité d'une ligne
      const liste = this.lire(); // Liste actuelle
      if (!liste[index]) return; // Ligne introuvable : on arrête
      liste[index].quantite = Math.max(1, liste[index].quantite + delta); // Jamais moins de 1
      this.ecrire(liste); // Enregistre
    }, // Fin de changer
    retirer(index) { // Supprime une ligne
      const liste = this.lire(); // Liste actuelle
      liste.splice(index, 1); // Retire la ligne
      this.ecrire(liste); // Enregistre
    }, // Fin de retirer
    vider() { // Vide entièrement la calebasse
      this.ecrire([]); // Liste vide
    }, // Fin de vider
  }; // Fin de l'objet calebasse

  function messageCommande(liste) { // Rédige le message WhatsApp de commande
    let total = 0; // Total en cours de calcul
    const lignes = liste.map((ligne) => { // Une ligne de texte par article
      const produit = trouverProduit(ligne.id); // Le produit
      const prix = prixUnitaire(produit, ligne.variante) * ligne.quantite; // Prix × quantité
      total += prix; // Ajoute au total
      const variante = ligne.variante ? ` (${ligne.variante})` : ''; // Variante entre parenthèses
      return `• ${ligne.quantite} × ${produit.nom}${variante} — ${formaterPrix(prix)}`; // Ex. « • 2 × Kente (Or & vert) — 130 000 FCFA »
    }); // Fin des lignes
    return [ // Assemble le message ligne par ligne
      `Bonjour ${REGLAGES.nomSite},`, // Salutation
      'Je souhaite commander :', // Introduction
      '', // Ligne vide
      ...lignes, // Les articles
      '', // Ligne vide
      `Total : ${formaterPrix(total)}`, // Total
      '', // Ligne vide
      'Nom :', // À compléter par le client
      'Ville de livraison :', // À compléter par le client
    ].join('\n'); // Retour à la ligne entre chaque élément
  } // Fin de messageCommande

  function rendreCalebasse() { // Met à jour le compteur et le contenu du tiroir
    const liste = calebasse.lire(); // Articles actuels
    const nombre = liste.reduce((somme, ligne) => somme + ligne.quantite, 0); // Nombre total d'articles
    $$('[data-compteur]').forEach((compteur) => { compteur.textContent = nombre; }); // Met à jour toutes les pastilles
    const zone = $('[data-calebasse-liste]'); // Liste dans le tiroir
    const pied = $('[data-calebasse-pied]'); // Bas du tiroir (total + boutons)
    if (!zone || !pied) return; // Tiroir absent : on arrête
    if (!liste.length) { // Calebasse vide
      zone.innerHTML = '<li class="calebasse__vide"><p>Votre calebasse est vide.</p><p>Parcourez les <a href="tresors.html">Trésors d’Afrique</a> pour la remplir.</p></li>'; // Message
      pied.hidden = true; // Cache le total et les boutons
      return; // Fin
    } // Fin du cas « vide »
    pied.hidden = false; // Affiche le bas du tiroir
    let total = 0; // Total
    zone.innerHTML = liste.map((ligne, index) => { // Construit chaque ligne
      const produit = trouverProduit(ligne.id); // Le produit
      const prix = prixUnitaire(produit, ligne.variante) * ligne.quantite; // Prix de la ligne
      total += prix; // Ajoute au total
      const variante = ligne.variante ? `<p class="ligne-calebasse__variante">${echapper(ligne.variante)}</p>` : ''; // Variante
      return `<li class="ligne-calebasse"> <!-- Une ligne de la calebasse -->
        ${plaque(produit, { balise: 'div' })} <!-- Vignette du produit -->
        <div> <!-- Colonne d'informations -->
          <h3>${echapper(produit.nom)}</h3>${variante} <!-- Nom du produit (+ variante choisie) -->
          <div class="ligne-calebasse__bas"> <!-- Ligne quantité + prix -->
            <div class="quantite"> <!-- Sélecteur de quantité -->
              <button type="button" data-qte="-1" data-index="${index}" aria-label="Diminuer la quantité">−</button> <!-- Bouton − -->
              <output aria-label="Quantité">${ligne.quantite}</output> <!-- Quantité actuelle -->
              <button type="button" data-qte="1" data-index="${index}" aria-label="Augmenter la quantité">+</button> <!-- Bouton + -->
            </div> <!-- Fin du sélecteur -->
            <strong>${formaterPrix(prix)}</strong> <!-- Prix de la ligne -->
          </div> <!-- Fin de la ligne quantité + prix -->
          <button class="ligne-calebasse__retirer" type="button" data-retirer="${index}">Retirer</button> <!-- Bouton « Retirer » -->
        </div> <!-- Fin de la colonne d'informations -->
      </li>`; // Vignette | nom, variante, quantité (− / +), prix, bouton « Retirer »
    }).join(''); // Colle toutes les lignes
    $('[data-calebasse-total]').textContent = formaterPrix(total); // Affiche le total
    $('[data-calebasse-commander]').href = lienWhatsApp(messageCommande(liste)); // Prépare le lien WhatsApp avec le récapitulatif
  } // Fin de rendreCalebasse


  /* 3. CONSTRUCTION DE L'EN-TÊTE, DU MENU, DU PIED DE PAGE ================== */

  const ICONE_CALEBASSE = '<svg class="icone-calebasse" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 11h20a10 10 0 0 1-20 0Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 7.5c1.6-1.6 6.4-1.6 8 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6 15h12" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.5 2"/></svg>'; // Dessin de calebasse : bol + anse + rangée de points
  const LOGO = '<span class="logo__afrique">Afrique</span><span class="logo__authentique">Authentique</span>'; // Logo en texte. Pour une image : '<img src="assets/logo.svg" alt="Afrique Authentique">'

  function construireEntete() { // Construit le bandeau + l'en-tête à l'emplacement [data-entete]
    const emplacement = $('[data-entete]'); // L'emplacement prévu dans la page
    if (!emplacement) return; // Pas d'emplacement : rien à faire
    const aujourdhui = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); // Date du jour en toutes lettres
    const liensRubriques = MENU.filter((lien) => lien.id !== 'accueil') // Tous les liens sauf « Accueil »…
      .map((lien) => `<a href="${lien.url}" style="--c: var(--${lien.teinte})"${lien.id === pageActuelle ? ' aria-current="page"' : ''}>${echapper(lien.nom)}</a>`) // …chacun avec sa couleur ; la page actuelle est marquée
      .join(''); // Colle les liens
    emplacement.outerHTML = /* Remplace l'emplacement par le HTML ci-dessous */ `
      <div class="bandeau"> <!-- Bandeau foncé tout en haut -->
        <p class="etiquette bandeau__date">${majuscule(aujourdhui)}</p> <!-- Date du jour -->
        <p class="etiquette bandeau__milieu"><span lang="fon">Kwabɔ</span> · <span lang="tw">Akwaaba</span> · <span lang="sw">Karibu</span> — bienvenue</p> <!-- Mot de bienvenue en trois langues (fon, twi, swahili) -->
        <p class="etiquette"><a href="${lienWhatsApp('Bonjour ' + REGLAGES.nomSite + ' !')}" target="_blank" rel="noopener">Une question ? WhatsApp ↗</a></p> <!-- Lien WhatsApp -->
      </div> <!-- Fin du bandeau -->
      <header class="entete"> <!-- En-tête collant -->
        <div class="entete__barre"> <!-- Barre : Menu | logo | actions -->
          <button class="bouton-menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-ouvrir><span class="icone-menu" aria-hidden="true"><span></span><span></span><span></span></span>Menu</button> <!-- Bouton Menu et son icône à trois fils -->
          <a class="logo" href="index.html" aria-label="${echapper(REGLAGES.nomSite)}, retour à l’accueil">${LOGO}</a> <!-- Logo (retour à l'accueil) -->
          <div class="entete__actions"> <!-- Zone de droite -->
            <a class="entete__cercle" href="rejoindre-le-cercle.html">Le cercle</a> <!-- Lien « Le cercle » -->
            <button class="bouton-calebasse" type="button" aria-expanded="false" aria-controls="calebasse" data-calebasse-ouvrir>${ICONE_CALEBASSE}<span class="bouton-calebasse__mot">Calebasse</span><span class="compteur" data-compteur>0</span><span class="sr-only"> article(s)</span></button> <!-- Bouton Calebasse : icône, mot, compteur -->
          </div> <!-- Fin de la zone de droite -->
        </div> <!-- Fin de la barre -->
        <nav class="rubriques-nav" aria-label="Rubriques">${liensRubriques}</nav> <!-- Ligne des rubriques (ordinateur) -->
      </header>`; // Bandeau (date · bienvenue · WhatsApp) puis en-tête (Menu | logo | Le cercle + Calebasse) puis ligne des rubriques
  } // Fin de construireEntete

  function construireMenu() { // Ajoute le menu plein écran à la fin de la page
    const liens = MENU.map((lien, i) => `<li style="--i:${i}"><a class="menu__lien" href="${lien.url}"${lien.id === pageActuelle ? ' aria-current="page"' : ''}><span class="num">${lien.num}</span><span class="menu__texte">${echapper(lien.nom)}</span></a></li>`).join(''); // Un grand lien numéroté par rubrique
    const cercle = MENU_CERCLE.map((lien) => `<a href="${lien.url}">${echapper(lien.nom)}</a>`).join(''); // Liens « communauté »
    const proverbe = PROVERBES[Math.floor(Math.random() * PROVERBES.length)] || { texte: '', source: '' }; // Un proverbe tiré au hasard
    document.body.insertAdjacentHTML('beforeend', /* Ajoute le menu à la fin de la page */ `
      <div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu principal" inert> <!-- Panneau du menu (inactif tant qu'il est fermé) -->
        <div class="menu__haut"> <!-- Haut du menu -->
          <a class="logo" href="index.html" aria-label="Accueil">${LOGO}</a> <!-- Logo -->
          <button class="menu__fermer" type="button" data-panneau-fermer>Fermer <span aria-hidden="true">×</span></button> <!-- Bouton Fermer -->
        </div> <!-- Fin du haut -->
        <div class="menu__corps"> <!-- Corps du menu -->
          <nav aria-label="Navigation principale"><ol class="menu__liste">${liens}</ol></nav> <!-- Liste des grands liens -->
          <div class="menu__cote"> <!-- Colonne d'informations -->
            <div><p class="etiquette">Le cercle</p>${cercle}</div> <!-- Liens du cercle -->
            <div><p class="etiquette">Nous écrire</p><a href="${lienWhatsApp('Bonjour ' + REGLAGES.nomSite + ' !')}" target="_blank" rel="noopener">WhatsApp ↗</a><a href="mailto:${REGLAGES.email}">${echapper(REGLAGES.email)}</a></div> <!-- WhatsApp et e-mail -->
            <p class="menu__proverbe">« ${echapper(proverbe.texte)} »<br><span class="etiquette">${echapper(proverbe.source)}</span></p> <!-- Proverbe tiré au hasard -->
          </div> <!-- Fin de la colonne -->
        </div> <!-- Fin du corps -->
        <div class="kente" aria-hidden="true"></div> <!-- Frise de kente en bas du menu -->
      </div>`); // Haut (logo + Fermer), corps (liens + colonne d'infos), frise de kente
  } // Fin de construireMenu

  function construirePied() { // Construit le pied de page à l'emplacement [data-pied]
    const emplacement = $('[data-pied]'); // L'emplacement prévu
    if (!emplacement) return; // Absent : rien à faire
    const lien = (l) => `<li><a href="${l.url}">${echapper(l.nom)}</a></li>`; // Petit modèle pour un lien de liste
    const rubriques = Object.values(RUBRIQUES).map((r) => lien({ url: r.url, nom: r.nom })).join(''); // Les 4 rubriques
    const voyager = MENU.filter((l) => l.id === 'odyssees' || l.id === 'tresors').map(lien).join(''); // Odyssées + Trésors
    const cercle = MENU_CERCLE.map(lien).join('') + `<li><a href="${lienWhatsApp('Bonjour ' + REGLAGES.nomSite + ' !')}" target="_blank" rel="noopener">WhatsApp ↗</a></li>`; // Le cercle + WhatsApp
    const reseaux = REGLAGES.reseaux.map((r) => `<li><a href="${r.url}" target="_blank" rel="noopener">${echapper(r.nom)} ↗</a></li>`).join(''); // Réseaux sociaux
    const legaux = MENU_LEGAL.map(lien).join(''); // Liens légaux
    emplacement.outerHTML = /* Remplace l'emplacement par le pied de page ci-dessous */ `
      <footer class="pied"> <!-- Pied de page -->
        <div class="kente kente--epaisse" aria-hidden="true"></div> <!-- Frise de kente épaisse -->
        <div class="conteneur pied__haut"> <!-- Partie haute -->
          <div class="pied__lettre"> <!-- Bloc « La lettre du cercle » -->
            <p class="etiquette">La lettre du cercle</p> <!-- Surtitre -->
            <h2>Une lettre par mois. <em>Des récits, pas du bruit.</em></h2> <!-- Titre -->
            <p>Nouveaux récits, prochaines odyssées, trésors tout juste arrivés : l’essentiel, une fois par mois.</p> <!-- Texte -->
            <form class="lettre-form" data-formulaire="lettre" data-sujet="Inscription à la lettre du cercle" novalidate> <!-- Formulaire d'inscription (géré par initFormulaires) -->
              <label class="sr-only" for="lettre-email">Votre adresse e-mail</label> <!-- Intitulé invisible, lu par les lecteurs d'écran -->
              <input id="lettre-email" name="email" type="email" placeholder="Votre adresse e-mail" autocomplete="email" required> <!-- Champ e-mail -->
              <button type="submit">S’inscrire <span class="fleche" aria-hidden="true">→</span></button> <!-- Bouton S'inscrire -->
            </form> <!-- Fin du formulaire -->
          </div> <!-- Fin du bloc lettre -->
          <nav class="pied__colonnes" aria-label="Plan du site"> <!-- Colonnes de liens -->
            <div><p class="etiquette">Le carnet</p><ul>${rubriques}</ul></div> <!-- Colonne 1 : les rubriques -->
            <div><p class="etiquette">Voyager &amp; chiner</p><ul>${voyager}</ul></div> <!-- Colonne 2 : odyssées et trésors -->
            <div><p class="etiquette">Le cercle</p><ul>${cercle}</ul></div> <!-- Colonne 3 : le cercle -->
            <div><p class="etiquette">Suivre</p><ul>${reseaux}</ul></div> <!-- Colonne 4 : réseaux sociaux -->
          </nav> <!-- Fin des colonnes -->
        </div> <!-- Fin de la partie haute -->
        <p class="pied__marque" aria-hidden="true">Afrique <em>Authentique</em></p> <!-- Grand logo en bas -->
        <div class="conteneur"> <!-- Conteneur de la dernière ligne -->
          <div class="pied__bas etiquette"> <!-- Dernière ligne -->
            <p>© ${new Date().getFullYear()} ${echapper(REGLAGES.nomSite)} · ${echapper(REGLAGES.ville)}</p> <!-- Copyright, nom et ville -->
            <ul>${legaux}<li><button type="button" data-cookies-gerer>Gérer les cookies</button></li></ul> <!-- Liens légaux + bouton cookies -->
          </div> <!-- Fin de la dernière ligne -->
        </div> <!-- Fin du conteneur -->
      </footer>`; // Frise | lettre du cercle + 4 colonnes de liens | grand logo | copyright + liens légaux
  } // Fin de construirePied

  function construireTiroir() { // Ajoute le tiroir de la calebasse, son voile et la zone des messages
    document.body.insertAdjacentHTML('beforeend', /* Ajoute le tiroir à la fin de la page */ `
      <div class="voile" data-voile></div> <!-- Voile sombre derrière le tiroir -->
      <aside class="calebasse" id="calebasse" role="dialog" aria-modal="true" aria-labelledby="calebasse-titre" inert> <!-- Tiroir de la calebasse (inactif tant qu'il est fermé) -->
        <div class="calebasse__tete"> <!-- Haut du tiroir -->
          <h2 id="calebasse-titre">Votre <em>calebasse</em></h2> <!-- Titre -->
          <button class="menu__fermer" type="button" data-panneau-fermer>Fermer <span aria-hidden="true">×</span></button> <!-- Bouton Fermer -->
        </div> <!-- Fin du haut -->
        <ul class="calebasse__liste" data-calebasse-liste></ul> <!-- Liste des articles (remplie par rendreCalebasse) -->
        <div class="calebasse__pied" data-calebasse-pied hidden> <!-- Bas du tiroir (caché si la calebasse est vide) -->
          <p class="calebasse__total"><span class="etiquette">Total</span><strong data-calebasse-total></strong></p> <!-- Total -->
          <a class="bouton bouton--whatsapp bouton--large" href="#" target="_blank" rel="noopener" data-calebasse-commander>Commander via WhatsApp <span class="fleche" aria-hidden="true">→</span></a> <!-- Bouton de commande WhatsApp (lien préparé par rendreCalebasse) -->
          <p class="calebasse__note">Votre commande s’ouvre dans WhatsApp sous forme de message. Nous confirmons avec vous la disponibilité, la livraison et le paiement.</p> <!-- Note explicative -->
          <button class="lien-fleche" type="button" data-calebasse-vider>Vider la calebasse</button> <!-- Bouton « Vider » -->
        </div> <!-- Fin du bas -->
      </aside> <!-- Fin du tiroir -->
      <div class="toast" role="status" aria-live="polite" data-toast></div>`); // Voile sombre | tiroir (titre, liste, total + bouton WhatsApp) | zone des messages brefs
  } // Fin de construireTiroir

  function marquerPage(id) { // Surligne un lien du menu (utile pour les pages récit, qui appartiennent à une rubrique)
    $$('.rubriques-nav a, .menu__lien').forEach((lien) => { // Tous les liens du menu
      const cible = MENU.find((l) => lien.getAttribute('href') === l.url); // Le lien correspondant dans la liste MENU
      if (cible && cible.id === id) lien.setAttribute('aria-current', 'page'); // Marque le bon lien
    }); // Fin de la boucle
  } // Fin de marquerPage


  /* 4. OUVERTURE / FERMETURE DES PANNEAUX =================================== */

  let panneauOuvert = null; // Panneau actuellement ouvert (menu ou calebasse), sinon null
  let declencheur = null; // Bouton qui l'a ouvert (pour y revenir à la fermeture)

  function ouvrirPanneau(id) { // Ouvre le menu (id = 'menu') ou la calebasse (id = 'calebasse')
    const panneau = document.getElementById(id); // Le panneau
    if (!panneau) return; // Introuvable : on arrête
    if (panneauOuvert) fermerPanneau(false); // Ferme l'autre panneau s'il est ouvert
    declencheur = document.activeElement; // Retient l'élément actif
    panneauOuvert = panneau; // Mémorise le panneau ouvert
    panneau.inert = false; // Rend le panneau utilisable
    panneau.classList.add(id === 'menu' ? 'menu--ouvert' : 'calebasse--ouverte'); // Lance l'animation d'ouverture
    $$(`[aria-controls="${id}"]`).forEach((bouton) => bouton.setAttribute('aria-expanded', 'true')); // Indique aux lecteurs d'écran que c'est ouvert
    document.documentElement.classList.add('sans-defilement'); // Bloque le défilement de la page derrière
    if (id === 'calebasse') $('[data-voile]').classList.add('voile--visible'); // Voile sombre derrière la calebasse
    window.setTimeout(() => { const premier = panneau.querySelector('button, a[href]'); if (premier) premier.focus(); }, 80); // Place le focus clavier dans le panneau
  } // Fin de ouvrirPanneau

  function fermerPanneau(rendreFocus = true) { // Ferme le panneau ouvert
    if (!panneauOuvert) return; // Rien d'ouvert : on arrête
    const id = panneauOuvert.id; // Identifiant du panneau
    panneauOuvert.classList.remove('menu--ouvert', 'calebasse--ouverte'); // Lance l'animation de fermeture
    panneauOuvert.inert = true; // Rend le panneau inactif (clavier, lecteurs d'écran)
    $$(`[aria-controls="${id}"]`).forEach((bouton) => bouton.setAttribute('aria-expanded', 'false')); // Indique que c'est fermé
    document.documentElement.classList.remove('sans-defilement'); // Réautorise le défilement
    $('[data-voile]').classList.remove('voile--visible'); // Retire le voile
    panneauOuvert = null; // Plus rien d'ouvert
    if (rendreFocus && declencheur && declencheur.focus) declencheur.focus(); // Remet le focus sur le bouton d'origine
  } // Fin de fermerPanneau

  function garderFocus(evenement) { // Empêche la touche Tab de sortir du panneau ouvert
    if (!panneauOuvert || evenement.key !== 'Tab') return; // Seulement si un panneau est ouvert et qu'on appuie sur Tab
    const elements = $$('a[href], button:not([disabled]), input, select, textarea', panneauOuvert).filter((el) => el.offsetParent !== null); // Éléments atteignables et visibles
    if (!elements.length) return; // Aucun : on arrête
    const premier = elements[0]; // Le premier
    const dernier = elements[elements.length - 1]; // Le dernier
    if (evenement.shiftKey && document.activeElement === premier) { evenement.preventDefault(); dernier.focus(); } // Maj+Tab sur le premier : on va au dernier
    else if (!evenement.shiftKey && document.activeElement === dernier) { evenement.preventDefault(); premier.focus(); } // Tab sur le dernier : on revient au premier
  } // Fin de garderFocus


  /* 5. BANDEAU COOKIES ====================================================== */

  const CLE_COOKIES = 'aa-cookies'; // Nom sous lequel le choix est mémorisé
  const DUREE_CHOIX = 1000 * 60 * 60 * 24 * 182; // Le choix est redemandé après environ 6 mois (en millisecondes)

  function lireChoixCookies() { // Renvoie 'accepte', 'refuse' ou null (pas encore choisi / choix expiré)
    try { // On tente de lire…
      const choix = JSON.parse(lireStockage(CLE_COOKIES)); // …le choix mémorisé
      if (choix && Date.now() - choix.date < DUREE_CHOIX) return choix.valeur; // Choix encore valable
    } catch (erreur) { /* rien de mémorisé */ } // Pas de choix lisible
    return null; // Pas de choix
  } // Fin de lireChoixCookies

  function chargerMesureAudience() { // Appelé seulement si le visiteur accepte
    /* Collez ici, plus tard, le code de votre outil de mesure d'audience
       (Google Analytics, Matomo, Plausible…). Il ne sera chargé qu'avec
       l'accord du visiteur, comme l'exige la réglementation.               */
  } // Fin de chargerMesureAudience

  function construireCookies() { // Ajoute le bandeau cookies et l'affiche si nécessaire
    document.body.insertAdjacentHTML('beforeend', /* Ajoute le bandeau cookies à la fin de la page */ `
      <div class="cookies" role="region" aria-label="Choix des cookies" data-cookies-bandeau hidden> <!-- Bandeau cookies (caché par défaut) -->
        <p><strong>Un mot sur les cookies.</strong> Le site utilise uniquement ce qui est nécessaire à son fonctionnement (votre calebasse, par exemple) et, avec votre accord, un outil de mesure d’audience. <a href="cookies.html">En savoir plus</a></p> <!-- Texte d'information -->
        <div class="cookies__actions"> <!-- Boutons -->
          <button class="bouton bouton--petit" type="button" data-cookies="refuse">Refuser</button> <!-- Refuser -->
          <button class="bouton bouton--petit bouton--plein" type="button" data-cookies="accepte">Accepter</button> <!-- Accepter -->
        </div> <!-- Fin des boutons -->
      </div>`); // Texte + boutons Refuser / Accepter
    const choix = lireChoixCookies(); // Choix déjà fait ?
    if (!choix) $('[data-cookies-bandeau]').hidden = false; // Non : on affiche le bandeau
    else if (choix === 'accepte') chargerMesureAudience(); // Oui et accepté : on charge la mesure d'audience
  } // Fin de construireCookies

  function enregistrerCookies(valeur) { // Mémorise le choix et ferme le bandeau
    ecrireStockage(CLE_COOKIES, JSON.stringify({ valeur, date: Date.now() })); // Mémorise avec la date
    $('[data-cookies-bandeau]').hidden = true; // Cache le bandeau
    if (valeur === 'accepte') chargerMesureAudience(); // Charge la mesure d'audience si acceptée
    afficherMessage(valeur === 'accepte' ? 'Merci, votre choix est enregistré.' : 'C’est noté : aucun cookie de mesure.'); // Confirmation
  } // Fin de enregistrerCookies


  /* MESSAGE BREF (« toast ») ------------------------------------------------ */

  let minuteurMessage = null; // Minuteur qui cache le message

  function afficherMessage(texte) { // Affiche un petit message en bas de l'écran pendant 3 secondes
    const zone = $('[data-toast]'); // Zone du message
    if (!zone) return; // Absente : on arrête
    zone.textContent = texte; // Écrit le message (il est aussi lu par les lecteurs d'écran)
    zone.classList.add('toast--visible'); // Le fait apparaître
    window.clearTimeout(minuteurMessage); // Annule le minuteur précédent
    minuteurMessage = window.setTimeout(() => zone.classList.remove('toast--visible'), 3200); // Le cache après 3,2 secondes
  } // Fin de afficherMessage


  /* 6. RIDEAU DE TRANSITION ================================================= */

  function initTransitions() { // Fait retomber le rideau coloré quand on clique sur un lien interne
    const rideau = $('.rideau'); // Le rideau (présent en haut de chaque page)
    if (!rideau || mouvementReduit) return; // Pas de rideau ou animations réduites : on arrête
    document.addEventListener('click', (evenement) => { // Écoute tous les clics de la page
      const lien = evenement.target.closest('a[href]'); // Le clic vient-il d'un lien ?
      if (!lien || evenement.defaultPrevented) return; // Non, ou déjà géré ailleurs : on arrête
      if (evenement.button !== 0 || evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey) return; // Ouverture dans un nouvel onglet : on laisse faire
      if ((lien.target && lien.target !== '_self') || lien.hasAttribute('download')) return; // Lien externe ou téléchargement : on laisse faire
      const adresse = new URL(lien.href, window.location.href); // Adresse complète du lien
      if (adresse.protocol !== window.location.protocol || adresse.host !== window.location.host) return; // Autre site, e-mail, téléphone : on laisse faire
      if (adresse.pathname === window.location.pathname && adresse.search === window.location.search) return; // Ancre sur la même page : on laisse faire
      evenement.preventDefault(); // Bloque la navigation immédiate…
      rideau.classList.add('rideau--ferme'); // …fait retomber le rideau…
      window.setTimeout(() => { window.location.href = adresse.href; }, 520); // …puis change de page une demi-seconde plus tard
    }); // Fin de l'écoute des clics
    window.addEventListener('pageshow', (evenement) => { // Retour arrière depuis le cache du navigateur
      if (evenement.persisted) rideau.classList.remove('rideau--ferme'); // On relève le rideau
    }); // Fin
  } // Fin de initTransitions


  /* 7. EN-TÊTE QUI SE CACHE ================================================= */

  function initEntete() { // Cache l'en-tête quand on descend, le montre quand on remonte
    const entete = $('.entete'); // L'en-tête
    if (!entete) return; // Absent : on arrête
    const majHauteur = () => document.documentElement.style.setProperty('--hauteur-entete', entete.offsetHeight + 'px'); // Mesure la hauteur de l'en-tête (utilisée par le CSS)
    majHauteur(); // Mesure une première fois
    window.addEventListener('resize', majHauteur); // Et à chaque redimensionnement
    let dernierePosition = window.scrollY; // Position de défilement précédente
    let enAttente = false; // Évite de recalculer trop souvent
    window.addEventListener('scroll', () => { // À chaque défilement
      if (enAttente) return; // Calcul déjà prévu : on attend
      enAttente = true; // On prévoit un calcul
      window.requestAnimationFrame(() => { // Au prochain affichage
        const position = window.scrollY; // Position actuelle
        const descend = position > dernierePosition && position > 260; // Vrai si on descend (et qu'on a dépassé le haut de page)
        entete.classList.toggle('entete--cachee', descend); // Cache ou montre l'en-tête
        dernierePosition = position; // Mémorise la position
        enAttente = false; // Calcul terminé
      }); // Fin
    }, { passive: true }); // « passive » : n'empêche jamais le défilement d'être fluide
    entete.addEventListener('focusin', () => entete.classList.remove('entete--cachee')); // Navigation au clavier : l'en-tête réapparaît
  } // Fin de initEntete


  /* 8. ANIMATIONS D'APPARITION ============================================== */

  let observateur = null; // Surveille les éléments qui entrent dans l'écran

  function initApparitions(racine = document) { // Prépare les apparitions (peut être rappelée après un nouvel affichage)
    const groupes = $$('[data-cascade]', racine); // Groupes « en cascade » contenus dans la zone…
    if (racine !== document && racine.matches('[data-cascade]')) groupes.push(racine); // …y compris la zone elle-même
    groupes.forEach((groupe) => { // Pour chaque groupe
      Array.from(groupe.children).forEach((enfant, i) => { // Chaque enfant du groupe…
        enfant.setAttribute('data-revele', ''); // …apparaîtra au défilement…
        enfant.style.setProperty('--i', i % 6); // …avec un petit retard selon sa position (0 à 5)
      }); // Fin
    }); // Fin des groupes
    const elements = $$('[data-revele]:not(.est-visible)', racine); // Éléments pas encore apparus
    if (mouvementReduit || !('IntersectionObserver' in window)) { // Animations réduites ou navigateur ancien…
      elements.forEach((el) => el.classList.add('est-visible')); // …tout s'affiche directement
      return; // Fin
    } // Fin
    if (!observateur) { // Crée l'observateur une seule fois
      observateur = new IntersectionObserver((entrees) => { // Fonction appelée quand un élément entre ou sort de l'écran
        entrees.forEach((entree) => { // Pour chaque élément concerné
          if (!entree.isIntersecting) return; // Pas encore visible : on attend
          entree.target.classList.add('est-visible'); // Visible : on déclenche l'animation
          observateur.unobserve(entree.target); // Et on arrête de le surveiller
        }); // Fin
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 }); // Se déclenche quand l'élément dépasse le bas de l'écran de 8 %
    } // Fin de la création
    elements.forEach((el) => observateur.observe(el)); // Surveille tous les éléments
  } // Fin de initApparitions


  /* 9. DÉFILANT, PROVERBES, DÉFILEMENT HORIZONTAL, APERÇUS ================== */

  function initDefilants() { // Duplique le contenu des bandes défilantes pour une boucle sans fin
    $$('[data-defilant] .defilant__piste').forEach((piste) => { // Chaque bande
      const groupe = piste.firstElementChild; // Le groupe de mots d'origine
      if (!groupe) return; // Absent : on arrête
      const copie = groupe.cloneNode(true); // Copie à l'identique
      copie.setAttribute('aria-hidden', 'true'); // La copie n'est pas lue par les lecteurs d'écran
      piste.appendChild(copie); // Ajoute la copie à la suite
    }); // Fin
  } // Fin de initDefilants

  function initProverbes() { // Bouton « Un autre proverbe »
    const bloc = $('[data-proverbes]'); // La section proverbe
    if (!bloc || !PROVERBES.length) return; // Absente ou liste vide : on arrête
    const texte = $('[data-proverbe-texte]', bloc); // Zone du texte
    const source = $('[data-proverbe-source]', bloc); // Zone de la source
    const compteur = $('[data-proverbe-compteur]', bloc); // Zone « 01 / 05 »
    let index = 0; // Proverbe affiché
    const afficher = () => { // Affiche le proverbe numéro « index »
      texte.textContent = PROVERBES[index].texte; // Texte
      source.textContent = PROVERBES[index].source; // Source
      if (compteur) compteur.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(PROVERBES.length).padStart(2, '0'); // Compteur sur deux chiffres
    }; // Fin
    afficher(); // Premier affichage
    $('[data-proverbe-suivant]', bloc).addEventListener('click', () => { // Au clic sur « Un autre proverbe »
      bloc.classList.add('proverbe--change'); // Le proverbe actuel s'efface
      window.setTimeout(() => { // Puis, une fois effacé…
        index = (index + 1) % PROVERBES.length; // …on passe au suivant (et on revient au premier après le dernier)…
        afficher(); // …on l'écrit…
        bloc.classList.remove('proverbe--change'); // …et il réapparaît
      }, mouvementReduit ? 0 : 450); // Délai de l'effacement
    }); // Fin
  } // Fin de initProverbes

  function initDefiles() { // Rangées horizontales : boutons ← → et glisser à la souris
    $$('[data-defile]').forEach((defile) => { // Chaque rangée
      const pas = () => { const carte = defile.firstElementChild; return carte ? carte.getBoundingClientRect().width + 24 : 320; }; // Distance d'un « cran » : la largeur d'une carte
      const comportement = mouvementReduit ? 'auto' : 'smooth'; // Défilement doux ou immédiat
      $$(`[data-defile-precedent="${defile.id}"]`).forEach((b) => b.addEventListener('click', () => defile.scrollBy({ left: -pas(), behavior: comportement }))); // Bouton ←
      $$(`[data-defile-suivant="${defile.id}"]`).forEach((b) => b.addEventListener('click', () => defile.scrollBy({ left: pas(), behavior: comportement }))); // Bouton →
      let actif = false; // Un glisser est-il en cours ?
      let aBouge = false; // La souris a-t-elle réellement bougé ?
      let departX = 0; // Position de départ de la souris
      let departDefilement = 0; // Position de départ du défilement
      defile.addEventListener('pointerdown', (e) => { // Bouton de la souris enfoncé
        if (e.pointerType !== 'mouse' || e.button !== 0) return; // Seulement la souris, clic gauche (le tactile défile déjà tout seul)
        actif = true; aBouge = false; departX = e.clientX; departDefilement = defile.scrollLeft; // Mémorise le départ
      }); // Fin
      window.addEventListener('pointermove', (e) => { // La souris bouge
        if (!actif) return; // Pas de glisser en cours : on ignore
        const ecart = e.clientX - departX; // Distance parcourue
        if (Math.abs(ecart) > 5) { aBouge = true; defile.classList.add('defile--glisse'); } // Au-delà de 5 px, c'est un vrai glisser
        defile.scrollLeft = departDefilement - ecart; // Fait défiler la rangée
      }); // Fin
      window.addEventListener('pointerup', () => { // Bouton relâché
        if (!actif) return; // Rien en cours
        actif = false; // Fin du glisser
        defile.classList.remove('defile--glisse'); // Réactive l'aimantation des cartes
      }); // Fin
      defile.addEventListener('click', (e) => { // Clic après un glisser
        if (aBouge) { e.preventDefault(); e.stopPropagation(); aBouge = false; } // On n'ouvre pas la carte par erreur
      }, true); // « true » : intercepte le clic avant les autres
      defile.addEventListener('dragstart', (e) => e.preventDefault()); // Empêche le glisser natif des liens et images
    }); // Fin des rangées
  } // Fin de initDefiles

  function initApercus() { // L'image d'aperçu de l'index des rubriques suit la souris
    $$('[data-suivi]').forEach((zone) => { // Chaque zone concernée
      zone.addEventListener('pointermove', (e) => { // La souris bouge dans la zone
        const ligne = e.target.closest('.index__ligne'); // Ligne survolée
        if (!ligne) return; // Aucune : on arrête
        const cadre = ligne.getBoundingClientRect(); // Position de la ligne à l'écran
        ligne.style.setProperty('--x', (e.clientX - cadre.left) + 'px'); // Position horizontale de la souris dans la ligne
        ligne.style.setProperty('--y', (e.clientY - cadre.top) + 'px'); // Position verticale
      }); // Fin
    }); // Fin
  } // Fin de initApercus


  function initLiensReglages() { // Remplit les liens de contact à partir de reglages.js (un seul endroit à modifier)
    $$('[data-whatsapp]').forEach((lien) => { // Liens WhatsApp avec message prérempli
      lien.href = lienWhatsApp(lien.dataset.whatsapp || 'Bonjour ' + REGLAGES.nomSite + ' !'); // Adresse wa.me avec le message
      lien.target = '_blank'; // Nouvel onglet
      lien.rel = 'noopener'; // Sécurité
    }); // Fin
    $$('[data-communaute]').forEach((lien) => { // Lien vers la communauté WhatsApp
      lien.href = REGLAGES.communauteWhatsApp || lienWhatsApp('Bonjour, je souhaite rejoindre la communauté WhatsApp du cercle.'); // Lien d'invitation, sinon message direct
      lien.target = '_blank'; // Nouvel onglet
      lien.rel = 'noopener'; // Sécurité
    }); // Fin
    $$('[data-email]').forEach((lien) => { lien.href = 'mailto:' + REGLAGES.email; lien.textContent = REGLAGES.email; }); // Liens e-mail
    $$('[data-telephone]').forEach((el) => { el.textContent = REGLAGES.telephoneAffiche; }); // Numéro affiché
    $$('[data-ville]').forEach((el) => { el.textContent = REGLAGES.ville; }); // Ville
    $$('[data-reseaux]').forEach((el) => { // Liste des réseaux sociaux
      el.innerHTML = REGLAGES.reseaux.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${echapper(r.nom)} ↗</a>`).join(' · '); // Liens séparés par des points
    }); // Fin
  } // Fin de initLiensReglages


  /* 10. FORMULAIRES ========================================================= */

  function messageErreur(champ) { // Renvoie le message d'erreur d'un champ (ou une chaîne vide si tout va bien)
    const etat = champ.validity; // État de validité fourni par le navigateur
    if (etat.valueMissing) return champ.type === 'checkbox' ? 'Merci de cocher cette case pour continuer.' : 'Ce champ est nécessaire.'; // Champ obligatoire vide
    if (etat.typeMismatch && champ.type === 'email') return 'Cette adresse e-mail ne semble pas complète.'; // E-mail mal formé
    if (etat.typeMismatch && champ.type === 'url') return 'L’adresse doit commencer par https://'; // Adresse web mal formée
    if (etat.tooShort) return `Encore quelques mots : ${champ.minLength} caractères minimum.`; // Texte trop court
    if (etat.patternMismatch) return champ.dataset.erreur || 'Le format ne semble pas correct.'; // Format particulier non respecté
    return ''; // Tout va bien
  } // Fin de messageErreur

  function verifierChamp(champ) { // Vérifie un champ et affiche (ou retire) son message d'erreur
    const message = messageErreur(champ); // Message éventuel
    const conteneur = champ.closest('.champ, .case'); // Bloc qui entoure le champ
    if (!conteneur) return !message; // Pas de bloc : on renvoie seulement le résultat
    let zone = conteneur.querySelector('.champ__erreur'); // Zone d'erreur existante
    if (message) { // Il y a une erreur
      if (!zone) { // Pas encore de zone : on la crée
        zone = document.createElement('p'); // Nouveau paragraphe
        zone.className = 'champ__erreur'; // Style d'erreur
        zone.id = (champ.id || champ.name) + '-erreur'; // Identifiant unique
        conteneur.appendChild(zone); // Placé sous le champ
      } // Fin de la création
      zone.textContent = message; // Écrit le message
      champ.setAttribute('aria-invalid', 'true'); // Signale l'erreur aux lecteurs d'écran
      champ.setAttribute('aria-describedby', zone.id); // Relie le message au champ
      conteneur.classList.add('champ--erreur'); // Style d'erreur sur le bloc
    } else { // Pas d'erreur
      if (zone) zone.remove(); // Retire l'ancien message
      champ.removeAttribute('aria-invalid'); // Retire le signalement
      champ.removeAttribute('aria-describedby'); // Retire le lien
      conteneur.classList.remove('champ--erreur'); // Retire le style d'erreur
    } // Fin
    return !message; // Vrai si le champ est valide
  } // Fin de verifierChamp

  function formulaireValide(formulaire) { // Vérifie tous les champs ; place le curseur sur la première erreur
    const champs = $$('input, select, textarea', formulaire).filter((c) => c.name && c.type !== 'hidden' && !c.closest('.piege')); // Champs à vérifier
    let premiereErreur = null; // Premier champ en erreur
    champs.forEach((champ) => { if (!verifierChamp(champ) && !premiereErreur) premiereErreur = champ; }); // Vérifie chaque champ
    if (premiereErreur) premiereErreur.focus(); // Place le curseur sur la première erreur
    return !premiereErreur; // Vrai si tout est bon
  } // Fin de formulaireValide

  function texteFormulaire(formulaire) { // Transforme les réponses du formulaire en texte lisible
    const lignes = []; // Lignes du texte
    new FormData(formulaire).forEach((valeur, nom) => { // Pour chaque réponse
      if (nom.startsWith('_') || !String(valeur).trim()) return; // Ignore les champs techniques et vides
      const champ = formulaire.querySelector(`[name="${nom}"]`); // Le champ
      const etiquette = champ && champ.id ? formulaire.querySelector(`label[for="${champ.id}"]`) : null; // Son intitulé
      const intitule = etiquette ? etiquette.textContent.replace(/\*/g, '').trim() : nom; // Texte de l'intitulé (sans les astérisques)
      lignes.push(`${intitule} : ${valeur}`); // Ajoute la ligne « Intitulé : réponse »
    }); // Fin
    return lignes.join('\n'); // Une réponse par ligne
  } // Fin de texteFormulaire

  function afficherResultat(formulaire, texte, erreur = false) { // Affiche un message sous le formulaire
    if (formulaire.dataset.formulaire === 'lettre') { afficherMessage(texte); return; } // Lettre du cercle : simple message bref
    let zone = $('.formulaire__message', formulaire); // Zone de message existante
    if (!zone) { // Pas encore créée
      zone = document.createElement('p'); // Nouveau paragraphe
      zone.setAttribute('role', 'status'); // Lu automatiquement par les lecteurs d'écran
      formulaire.appendChild(zone); // Ajouté en bas du formulaire
    } // Fin
    zone.className = 'formulaire__message' + (erreur ? ' formulaire__message--erreur' : ''); // Style (succès ou erreur)
    zone.textContent = texte; // Texte du message
  } // Fin de afficherResultat

  function initFormulaires() { // Active la vérification et l'envoi de tous les formulaires [data-formulaire]
    $$('form[data-formulaire]').forEach((formulaire) => { // Chaque formulaire
      formulaire.setAttribute('novalidate', ''); // Désactive les bulles d'erreur du navigateur (on affiche les nôtres)
      formulaire.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') verifierChamp(e.target); }); // Corrige l'erreur en direct pendant la saisie
      formulaire.addEventListener('focusout', (e) => { if (e.target.matches('input, select, textarea') && e.target.value) verifierChamp(e.target); }); // Vérifie un champ rempli quand on le quitte

      $$('[data-envoi-whatsapp]', formulaire).forEach((lien) => { // Lien « Envoyer sur WhatsApp » (facultatif)
        const sujet = formulaire.dataset.sujet || 'Message depuis le site'; // Sujet du message
        lien.href = lienWhatsApp(sujet); // Adresse de départ (au cas où le clic arriverait avant toute saisie)
        lien.addEventListener('click', (e) => { // Au clic
          if (!formulaireValide(formulaire)) { e.preventDefault(); return; } // Formulaire incomplet : on bloque le lien et on montre les erreurs
          lien.href = lienWhatsApp(`${sujet}\n\n${texteFormulaire(formulaire)}`); // Met le message complet dans le lien, juste avant son ouverture
          afficherResultat(formulaire, 'WhatsApp s’ouvre avec votre message prêt à partir. Il ne reste qu’à l’envoyer.'); // Confirmation
        }); // Fin
      }); // Fin des liens WhatsApp

      formulaire.addEventListener('submit', async (e) => { // Envoi du formulaire
        e.preventDefault(); // Bloque l'envoi classique (rechargement de page)
        if (!formulaireValide(formulaire)) return; // Formulaire incomplet : on arrête
        const piege = formulaire.querySelector('.piege input'); // Champ invisible anti-robots
        if (piege && piege.value) return; // Rempli = robot : on ignore silencieusement
        const sujet = formulaire.dataset.sujet || 'Message depuis le site'; // Sujet du message
        const bouton = formulaire.querySelector('[type="submit"]'); // Bouton d'envoi
        if (REGLAGES.formulaireEndpoint) { // Un service d'envoi est configuré (reglages.js)
          bouton.disabled = true; // Évite les doubles envois
          try { // On tente l'envoi…
            const donnees = new FormData(formulaire); // Toutes les réponses
            donnees.append('_sujet', sujet); // Ajoute le sujet
            const reponse = await fetch(REGLAGES.formulaireEndpoint, { method: 'POST', body: donnees, headers: { Accept: 'application/json' } }); // Envoi au service
            if (!reponse.ok) throw new Error('Envoi refusé'); // Le service a refusé : on passe à l'erreur
            formulaire.reset(); // Vide le formulaire
            afficherResultat(formulaire, formulaire.dataset.formulaire === 'lettre' ? 'Bienvenue dans le cercle ! Première lettre très bientôt.' : 'Merci, votre message est bien parti. Nous vous répondons sous quelques jours.'); // Succès
          } catch (erreur) { // En cas de problème
            afficherResultat(formulaire, 'L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez-nous sur WhatsApp.', true); // Message d'erreur
          } finally { // Dans tous les cas
            bouton.disabled = false; // Réactive le bouton
          } // Fin
          return; // Fin de l'envoi
        } // Fin du cas « service configuré »
        const corps = texteFormulaire(formulaire); // Sinon : on prépare un e-mail
        window.location.href = `mailto:${REGLAGES.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`; // Ouvre la messagerie avec le message prêt
        afficherResultat(formulaire, formulaire.dataset.formulaire === 'lettre' ? 'Votre messagerie s’ouvre : envoyez le message pour confirmer votre inscription.' : 'Votre messagerie s’ouvre avec votre message prêt à partir. Il ne reste qu’à l’envoyer.'); // Explication
      }); // Fin de l'envoi
    }); // Fin des formulaires
  } // Fin de initFormulaires


  /* 11. DÉMARRAGE =========================================================== */

  construireEntete(); // Construit l'en-tête
  construireMenu(); // Construit le menu
  construirePied(); // Construit le pied de page
  construireTiroir(); // Construit le tiroir de la calebasse
  construireCookies(); // Construit le bandeau cookies

  document.addEventListener('click', (e) => { // Un seul « écouteur » pour tous les boutons du site
    const cible = e.target.closest('button, a, [data-voile]'); // Élément cliqué (bouton, lien ou voile)
    if (!cible) return; // Rien d'intéressant : on arrête
    if (cible.matches('[data-menu-ouvrir]')) ouvrirPanneau('menu'); // Bouton Menu
    else if (cible.matches('[data-calebasse-ouvrir]')) ouvrirPanneau('calebasse'); // Bouton Calebasse
    else if (cible.matches('[data-panneau-fermer], [data-voile]')) fermerPanneau(); // Bouton Fermer ou clic sur le voile
    else if (cible.matches('[data-ajouter]')) { // Bouton « + » d'une carte produit
      const produit = trouverProduit(cible.dataset.ajouter); // Le produit
      if (!produit) return; // Introuvable : on arrête
      const variante = produit.variantes && produit.variantes.length ? produit.variantes[0].nom : ''; // Première variante par défaut
      calebasse.ajouter(produit.id, variante, 1); // Ajoute à la calebasse
      afficherMessage(`${produit.nom}${variante ? ' (' + variante + ')' : ''} a rejoint votre calebasse.`); // Confirmation
    } // Fin de l'ajout rapide
    else if (cible.matches('[data-qte]')) calebasse.changer(Number(cible.dataset.index), Number(cible.dataset.qte)); // Boutons − / + du tiroir
    else if (cible.matches('[data-retirer]')) calebasse.retirer(Number(cible.dataset.retirer)); // Bouton « Retirer »
    else if (cible.matches('[data-calebasse-vider]')) { // Bouton « Vider la calebasse » : confirmation en deux clics
      window.clearTimeout(Number(cible.dataset.minuteur)); // Annule un éventuel retour à l'état normal déjà prévu
      if (cible.dataset.confirmer === 'oui') { calebasse.vider(); cible.dataset.confirmer = ''; cible.textContent = 'Vider la calebasse'; } // 2e clic : on vide et le bouton revient à son texte d'origine
      else { // 1er clic : on demande confirmation
        cible.dataset.confirmer = 'oui'; // Mémorise qu'une confirmation est attendue
        cible.textContent = 'Confirmer : tout retirer ?'; // Le bouton change de texte
        cible.dataset.minuteur = window.setTimeout(() => { cible.dataset.confirmer = ''; cible.textContent = 'Vider la calebasse'; }, 4000); // Sans 2e clic sous 4 secondes, rien n'est retiré
      } // Fin
    } // Fin du bouton « Vider »
    else if (cible.matches('[data-cookies]')) enregistrerCookies(cible.dataset.cookies); // Boutons Accepter / Refuser
    else if (cible.matches('[data-cookies-gerer]')) $('[data-cookies-bandeau]').hidden = false; // « Gérer les cookies » : rouvre le bandeau
    else if (cible.matches('.menu a[href]')) fermerPanneau(false); // Clic sur un lien du menu : on le referme
  }); // Fin de l'écouteur de clics

  document.addEventListener('keydown', (e) => { // Touches du clavier
    if (e.key === 'Escape') fermerPanneau(); // Échap ferme le menu ou la calebasse
    garderFocus(e); // Tab reste dans le panneau ouvert
  }); // Fin

  window.addEventListener('storage', (e) => { if (e.key === CLE_CALEBASSE) rendreCalebasse(); }); // Calebasse modifiée dans un autre onglet : on met à jour

  document.addEventListener('DOMContentLoaded', () => { // Quand toute la page (et rendu.js) est prête
    rendreCalebasse(); // Affiche la calebasse et le compteur
    initTransitions(); // Rideau entre les pages
    initEntete(); // En-tête qui se cache
    initDefilants(); // Bandes défilantes
    initProverbes(); // Proverbes
    initDefiles(); // Rangées horizontales
    initApercus(); // Aperçus qui suivent la souris
    initLiensReglages(); // Liens WhatsApp, e-mail, réseaux
    initFormulaires(); // Formulaires
    initApparitions(); // Animations d'apparition
  }); // Fin du démarrage

  window.AA = { // Outils partagés avec rendu.js (« AA » pour Afrique Authentique)
    $, $$, echapper, formaterPrix, formaterDate, dateDepuisIso, lienWhatsApp, parametre, plaque, // Aides
    calebasse, trouverProduit, prixUnitaire, afficherMessage, ouvrirPanneau, marquerPage, initApparitions, // Calebasse, messages, menu, animations
  }; // Fin des outils partagés
})(); // Fin et exécution immédiate de la fonction

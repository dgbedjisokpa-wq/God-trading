/* ==========================================================================
   AFRIQUE AUTHENTIQUE — rendu.js
   --------------------------------------------------------------------------
   Ce fichier affiche automatiquement les contenus des fichiers js/donnees/
   dans les emplacements prévus des pages HTML. Chaque emplacement est une
   balise vide avec un attribut « data-… » :
     data-a-la-une          → le récit vedette (accueil)
     data-recits-recents    → les derniers récits (accueil)
     data-liste-recits      → les récits d'une rubrique (+ data-filtres)
     data-odyssees          → les destinations ("defile" ou "liste")
     data-tresors           → les produits (nombre, ou "tous" + filtres)
     data-agenda            → les événements ("apercu" ou "complet")
     data-recit             → la page d'un récit (article.html?id=…)
     data-destination       → la page d'une destination (destination.html?id=…)
     data-produit           → la page d'un produit (produit.html?id=…)
     data-partenaires       → les logos partenaires
     data-sommaire          → le sommaire des pages légales
   ========================================================================== */

(function () { // Fonction exécutée immédiatement (variables privées)
  'use strict'; // Mode strict

  const { $, $$, echapper, formaterPrix, formaterDate, dateDepuisIso, lienWhatsApp, parametre, plaque, calebasse, trouverProduit, prixUnitaire, afficherMessage, ouvrirPanneau, marquerPage, initApparitions } = window.AA; // Récupère les outils fournis par site.js


  /* 1. PETITS OUTILS ======================================================== */

  const triRecents = (liste) => [...liste].sort((a, b) => b.date.localeCompare(a.date)); // Trie du plus récent au plus ancien
  const deuxChiffres = (n) => String(n).padStart(2, '0'); // 3 devient « 03 »
  const paysDe = (element) => String(element.pays || '').split('·').map((p) => p.trim()).filter(Boolean); // « Ghana · Togo » devient ['Ghana', 'Togo']

  function tempsLecture(article) { // Calcule le temps de lecture (≈ 180 mots par minute, arrondi au-dessus)
    const texte = article.corps.map((bloc) => bloc.texte || '').join(' ').replace(/<[^>]+>/g, ''); // Tout le texte, sans balises HTML
    const mots = texte.split(/\s+/).filter(Boolean).length; // Nombre de mots
    return Math.max(1, Math.ceil(mots / 180)); // Au moins 1 minute
  } // Fin de tempsLecture

  function aujourdhuiIso() { // Date du jour au format AAAA-MM-JJ
    const d = new Date(); // Maintenant
    return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`; // Ex. « 2026-10-09 »
  } // Fin de aujourdhuiIso

  const estPasse = (evenement) => (evenement.dateFin || evenement.date) < aujourdhuiIso(); // Vrai si l'événement est terminé

  function majTitre(titre, description) { // Met à jour le titre de l'onglet et la description (Google, partages)
    document.title = `${titre} — ${REGLAGES.nomSite}`; // Titre de l'onglet
    const texte = String(description || '').replace(/<[^>]+>/g, ''); // Description sans HTML
    $$('meta[name="description"], meta[property="og:description"]').forEach((meta) => { if (texte) meta.setAttribute('content', texte); }); // Met à jour les descriptions
    $$('meta[property="og:title"]').forEach((meta) => meta.setAttribute('content', titre)); // Titre de partage
  } // Fin de majTitre

  function introuvable(titre, texte, url, libelle) { // Message affiché si l'identifiant de l'adresse ne correspond à rien
    return `<div class="conteneur introuvable"><p class="etiquette">Chemin introuvable</p><h1>${titre}</h1><p class="chapo">${texte}</p><a class="bouton bouton--plein" href="${url}">${libelle} <span class="fleche" aria-hidden="true">→</span></a></div>`; // Surtitre, titre, texte, bouton de retour
  } // Fin de introuvable

  function filAriane(liens) { // Fil d'Ariane « Accueil / Rubrique / … »
    const morceaux = [{ url: 'index.html', nom: 'Accueil' }, ...liens].map((l) => (l.url ? `<a href="${l.url}">${echapper(l.nom)}</a>` : `<span aria-current="page">${echapper(l.nom)}</span>`)); // Liens (le dernier, sans adresse, est la page actuelle)
    return `<nav class="fil-ariane etiquette" aria-label="Fil d’Ariane">${morceaux.join('<span aria-hidden="true">/</span>')}</nav>`; // Séparés par « / »
  } // Fin de filAriane


  /* 2. CARTES =============================================================== */

  function carteRecit(article, options = {}) { // Carte d'un récit (listes, accueil)
    const rubrique = RUBRIQUES[article.rubrique] || {}; // Rubrique du récit
    return `<article class="carte carte-recit${options.vedette ? ' carte--vedette' : ''}"> <!-- Carte d'un récit -->
      <a class="carte__lien" href="article.html?id=${encodeURIComponent(article.id)}"> <!-- Lien vers la page du récit -->
        ${plaque(article)} <!-- Image (photo ou composition) -->
        <div class="carte__texte"> <!-- Bloc de texte -->
          <p class="carte__meta etiquette"><span class="pastille" style="--c: var(--${rubrique.teinte})">${echapper(rubrique.nom)}</span><span>${echapper(article.pays)}</span></p> <!-- Rubrique (avec sa couleur) · pays -->
          <h3 class="carte__titre"><span class="souligne">${echapper(article.titre)}</span></h3> <!-- Titre (souligné au survol) -->
          <p class="carte__chapo">${echapper(article.chapo)}</p> <!-- Introduction -->
          <p class="carte__pied etiquette"><span>${article.type === 'portrait' ? 'Portrait' : 'Récit'} · ${tempsLecture(article)} min</span><span class="fleche" aria-hidden="true">→</span></p> <!-- Type · durée de lecture · flèche -->
        </div> <!-- Fin du bloc de texte -->
      </a> <!-- Fin du lien -->
    </article>`; // Image | rubrique · pays | titre | introduction | type · durée →
  } // Fin de carteRecit

  function carteUne(article) { // Grande carte « À la une »
    const rubrique = RUBRIQUES[article.rubrique] || {}; // Rubrique du récit
    return `<a class="carte-une" href="article.html?id=${encodeURIComponent(article.id)}" data-revele> <!-- Carte vedette (toute la carte est un lien) -->
      ${plaque(article, { legende: `${rubrique.nom} — ${article.pays}` })} <!-- Image avec légende -->
      <div class="carte-une__texte"> <!-- Bloc de texte -->
        <p class="etiquette"><span class="pastille" style="--c: var(--${rubrique.teinte})">${echapper(rubrique.nom)}</span></p> <!-- Rubrique -->
        <h3 class="carte-une__titre"><span class="souligne">${echapper(article.titre)}</span></h3> <!-- Titre -->
        <p class="carte-une__chapo">${echapper(article.chapo)}</p> <!-- Introduction -->
        <p class="etiquette carte-une__meta">${echapper(article.auteur)} · ${formaterDate(article.date)} · ${tempsLecture(article)} min de lecture</p> <!-- Auteur · date · durée -->
        <span class="bouton bouton--plein">Lire le récit <span class="fleche" aria-hidden="true">→</span></span> <!-- Bouton « Lire le récit » -->
      </div> <!-- Fin du bloc de texte -->
    </a>`; // Image avec légende | rubrique | titre | introduction | auteur · date · durée | bouton
  } // Fin de carteUne

  function carteOdyssee(destination) { // Carte d'une destination (rangée horizontale)
    const numero = deuxChiffres(DESTINATIONS.indexOf(destination) + 1); // Numéro 01, 02…
    return `<article class="carte carte-odyssee"> <!-- Carte d'une destination -->
      <a class="carte__lien" href="destination.html?id=${encodeURIComponent(destination.id)}"> <!-- Lien vers la fiche -->
        <div class="carte-odyssee__visuel" data-teinte="${destination.teinte}">${plaque(destination)}<span class="carte-odyssee__num" aria-hidden="true">${numero}</span></div> <!-- Image + grand numéro -->
        <p class="etiquette carte-odyssee__pays">${echapper(destination.pays)}</p> <!-- Pays -->
        <h3 class="carte-odyssee__titre"><span class="souligne">${echapper(destination.nom)}</span></h3> <!-- Nom -->
        <p class="carte-odyssee__accroche">${echapper(destination.accroche)}</p> <!-- Accroche -->
        <p class="carte-odyssee__infos etiquette"><span>${echapper(destination.duree)}</span><span>${echapper(destination.saison)}</span></p> <!-- Durée · saison -->
      </a> <!-- Fin du lien -->
    </article>`; // Image + numéro | pays | nom | accroche | durée · saison
  } // Fin de carteOdyssee

  function ligneOdyssee(destination) { // Grande ligne d'une destination (page Odyssées)
    const numero = deuxChiffres(DESTINATIONS.indexOf(destination) + 1); // Numéro
    return `<article class="carte ligne-odyssee" data-revele> <!-- Grande ligne d'une destination -->
      <a class="carte__lien" href="destination.html?id=${encodeURIComponent(destination.id)}"> <!-- Lien vers la fiche -->
        ${plaque(destination)} <!-- Image -->
        <div class="ligne-odyssee__textes"> <!-- Colonne de texte -->
          <p class="ligne-odyssee__num" aria-hidden="true">${numero}</p> <!-- Numéro en contour -->
          <p class="etiquette">${echapper(destination.pays)}</p> <!-- Pays -->
          <h3 class="ligne-odyssee__nom"><span class="souligne">${echapper(destination.nom)}</span></h3> <!-- Nom -->
          <p class="destination__accroche">${echapper(destination.accroche)}</p> <!-- Accroche -->
          <p class="carte__chapo">${echapper(destination.intro)}</p> <!-- Introduction -->
          <p class="mini-faits etiquette"><span>Durée : ${echapper(destination.duree)}</span><span>Saison : ${echapper(destination.saison)}</span></p> <!-- Durée et saison -->
          <span class="lien-fleche">Découvrir l’odyssée <span class="fleche" aria-hidden="true">→</span></span> <!-- Lien « Découvrir » -->
        </div> <!-- Fin de la colonne -->
      </a> <!-- Fin du lien -->
    </article>`; // Image | numéro, pays, nom, accroche, introduction, infos, lien
  } // Fin de ligneOdyssee

  function prixAffiche(produit) { // Prix affiché sur une carte : « À partir de … » si les variantes ont des prix différents
    const prix = (produit.variantes || []).map((v) => v.prix || produit.prix); // Prix de chaque variante
    const minimum = prix.length ? Math.min(...prix) : produit.prix; // Le plus bas
    const different = prix.some((p) => p !== minimum); // Les prix diffèrent-ils ?
    return (different ? 'À partir de ' : '') + formaterPrix(minimum); // Texte final
  } // Fin de prixAffiche

  function carteTresor(produit) { // Carte d'un produit
    return `<article class="carte carte-tresor"> <!-- Carte d'un produit -->
      <a class="carte__lien" href="produit.html?id=${encodeURIComponent(produit.id)}"> <!-- Lien vers la fiche produit -->
        ${plaque(produit)} <!-- Image -->
        <p class="etiquette carte-tresor__origine">${echapper(produit.origine)}</p> <!-- Origine -->
        <h3 class="carte-tresor__nom"><span class="souligne">${echapper(produit.nom)}</span></h3> <!-- Nom -->
        <p class="carte-tresor__prix">${prixAffiche(produit)}</p> <!-- Prix -->
      </a> <!-- Fin du lien -->
      <button class="carte-tresor__ajout" type="button" data-ajouter="${produit.id}" aria-label="Ajouter « ${echapper(produit.nom)} » à la calebasse">+</button> <!-- Bouton rond « + » (ajout rapide à la calebasse) -->
    </article>`; // Image | origine | nom | prix + bouton rond « + »
  } // Fin de carteTresor

  function ligneAgenda(evenement) { // Une ligne de l'agenda
    const debut = dateDepuisIso(evenement.date); // Date de début
    const jour = evenement.dateFin ? `${debut.getDate()}–${dateDepuisIso(evenement.dateFin).getDate()}` : debut.getDate(); // « 14 » ou « 8–10 »
    const mois = formaterDate(evenement.date, { month: 'short', year: 'numeric' }); // « nov. 2026 »
    const passe = estPasse(evenement); // Événement terminé ?
    const quand = formaterDate(evenement.date) + (evenement.heure ? ', ' + evenement.heure : ''); // Date et heure en toutes lettres
    const actions = []; // Boutons à afficher
    if (!passe && evenement.reservation) actions.push(`<a class="bouton bouton--whatsapp bouton--petit" href="${lienWhatsApp(`Bonjour ${REGLAGES.nomSite}, je souhaite réserver pour « ${evenement.titre} » (${quand}, ${evenement.lieu}).\nNombre de places :\nNom :`)}" target="_blank" rel="noopener">Réserver <span class="fleche" aria-hidden="true">→</span></a>`); // Réservation WhatsApp
    if (!passe) actions.push(`<button class="lien-fleche" type="button" data-ics="${evenement.id}">Ajouter à mon agenda</button>`); // Fichier agenda (.ics)
    if (evenement.lien) actions.push(`<a class="lien-fleche" href="${echapper(evenement.lien)}" target="_blank" rel="noopener">Site officiel ↗</a>`); // Lien externe
    const confirmer = evenement.aConfirmer ? '<span class="agenda__confirmer">Dates à confirmer</span>' : ''; // Mention « à confirmer »
    return `<li class="agenda__ligne${passe ? ' agenda__ligne--passe' : ''}"> <!-- Ligne d'événement (atténuée s'il est passé) -->
      <time class="agenda__date" datetime="${evenement.date}"><span class="agenda__jour">${jour}</span><span class="agenda__mois etiquette">${mois}</span></time> <!-- Date : jour en grand, mois et année -->
      <div> <!-- Bloc d'informations -->
        <p class="agenda__type etiquette">${echapper(evenement.type)}${confirmer}</p> <!-- Type (+ « dates à confirmer ») -->
        <h3 class="agenda__titre">${echapper(evenement.titre)}</h3> <!-- Titre -->
        <p class="agenda__lieu">${echapper(evenement.lieu)}${evenement.heure ? ' · ' + echapper(evenement.heure) : ''}</p> <!-- Lieu · horaire -->
        <p class="agenda__desc">${echapper(evenement.description)}</p> <!-- Description -->
      </div> <!-- Fin du bloc -->
      ${actions.length ? `<div class="agenda__actions">${actions.join('')}</div>` : ''} <!-- Boutons (réserver, agenda, site officiel) -->
    </li>`; // Date | type, titre, lieu, description | boutons
  } // Fin de ligneAgenda

  function telechargerIcs(evenement) { // Crée et télécharge un fichier .ics (compatible Google Agenda, Outlook, iPhone)
    const compact = (iso) => iso.replace(/-/g, ''); // « 2026-11-14 » devient « 20261114 »
    const fin = dateDepuisIso(evenement.dateFin || evenement.date); // Dernier jour
    fin.setDate(fin.getDate() + 1); // Le format .ics attend le lendemain du dernier jour
    const finIso = `${fin.getFullYear()}${deuxChiffres(fin.getMonth() + 1)}${deuxChiffres(fin.getDate())}`; // Date de fin compacte
    const proteger = (t) => String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); // Protège les caractères spéciaux du format .ics
    const contenu = [ // Lignes du fichier
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Afrique Authentique//Agenda//FR', 'BEGIN:VEVENT', // Début
      `UID:${evenement.id}@afrique-authentique`, // Identifiant unique
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`, // Date de création
      `DTSTART;VALUE=DATE:${compact(evenement.date)}`, // Premier jour
      `DTEND;VALUE=DATE:${finIso}`, // Fin
      `SUMMARY:${proteger(evenement.titre)}`, // Titre
      `LOCATION:${proteger(evenement.lieu)}`, // Lieu
      `DESCRIPTION:${proteger((evenement.heure ? 'Horaire : ' + evenement.heure + '. ' : '') + evenement.description)}`, // Description
      'END:VEVENT', 'END:VCALENDAR', // Fin
    ].join('\r\n'); // Le format exige ce type de retour à la ligne
    const lien = document.createElement('a'); // Lien temporaire
    lien.href = URL.createObjectURL(new Blob([contenu], { type: 'text/calendar;charset=utf-8' })); // Fichier créé en mémoire
    lien.download = `${evenement.id}.ics`; // Nom du fichier téléchargé
    document.body.appendChild(lien); // Ajouté à la page…
    lien.click(); // …cliqué…
    lien.remove(); // …puis retiré
    window.setTimeout(() => URL.revokeObjectURL(lien.href), 2000); // Libère la mémoire
    afficherMessage('Fichier agenda téléchargé : ouvrez-le pour ajouter l’événement.'); // Confirmation
  } // Fin de telechargerIcs


  /* 3. FILTRES (rubriques et boutique) ====================================== */

  function creerFiltres(barre, options, auChoix) { // Crée une rangée de filtres texte
    if (!barre) return; // Pas de rangée : on arrête
    if (options.length <= 2) { barre.hidden = true; return; } // « Tous » + une seule option : inutile d'afficher
    barre.innerHTML = '<span class="etiquette filtres__titre">Filtrer</span>' + options.map((o, i) => `<button class="filtre" type="button" data-filtre="${echapper(o.valeur)}" aria-pressed="${i === 0}">${echapper(o.nom)}<sup>${o.nombre}</sup></button>`).join(''); // Un bouton par option, avec le nombre de résultats
    barre.addEventListener('click', (e) => { // Au clic
      const bouton = e.target.closest('[data-filtre]'); // Bouton cliqué
      if (!bouton) return; // Aucun : on arrête
      $$('[data-filtre]', barre).forEach((b) => b.setAttribute('aria-pressed', String(b === bouton))); // Active seulement ce filtre
      auChoix(bouton.dataset.filtre); // Réaffiche la liste filtrée
    }); // Fin
  } // Fin de creerFiltres


  /* 4. REMPLISSAGE DES EMPLACEMENTS ========================================= */

  const zoneUne = $('[data-a-la-une]'); // Emplacement « À la une »
  const recitUne = ARTICLES.find((a) => a.une) || triRecents(ARTICLES)[0]; // Le récit marqué « une », sinon le plus récent
  if (zoneUne && recitUne) zoneUne.innerHTML = carteUne(recitUne); // Affiche la carte vedette

  $$('[data-recits-recents]').forEach((zone) => { // Emplacements « derniers récits »
    const nombre = Number(zone.dataset.recitsRecents) || 4; // Nombre de récits à afficher (4 par défaut)
    zone.innerHTML = triRecents(ARTICLES).filter((a) => a !== recitUne).slice(0, nombre).map((a) => carteRecit(a)).join(''); // Les plus récents, sauf celui à la une
  }); // Fin

  $$('[data-liste-recits]').forEach((zone) => { // Liste d'une rubrique
    const recits = triRecents(ARTICLES.filter((a) => a.rubrique === zone.dataset.listeRecits)); // Récits de cette rubrique
    const compte = $('[data-compte-recits]'); // Zone « N récits »
    if (compte) compte.textContent = `${recits.length} récit${recits.length > 1 ? 's' : ''} dans cette rubrique`; // Affiche le nombre
    const afficher = (pays) => { // Affiche la liste (filtrée par pays si besoin)
      const liste = pays ? recits.filter((a) => paysDe(a).includes(pays)) : recits; // Filtrage
      zone.innerHTML = liste.length ? liste.map((a, i) => carteRecit(a, { vedette: i === 0 && liste.length > 2 })).join('') : '<p class="vide">Aucun récit ici pour l’instant. Le carnet s’écrit au fil des mois.</p>'; // Cartes (la première en grand)
      initApparitions(zone); // Animations d'apparition
    }; // Fin
    const tousLesPays = [...new Set(recits.flatMap(paysDe))].sort((a, b) => a.localeCompare(b, 'fr')); // Liste des pays, sans doublon, triée
    creerFiltres($('[data-filtres]'), [{ valeur: '', nom: 'Tous', nombre: recits.length }, ...tousLesPays.map((p) => ({ valeur: p, nom: p, nombre: recits.filter((a) => paysDe(a).includes(p)).length }))], afficher); // Filtres par pays
    afficher(''); // Premier affichage : tout
  }); // Fin

  $$('[data-odyssees]').forEach((zone) => { // Emplacements des destinations
    const mode = zone.dataset.odyssees; // « defile » (rangée) ou « liste » (grandes lignes)
    zone.innerHTML = DESTINATIONS.map(mode === 'liste' ? ligneOdyssee : carteOdyssee).join(''); // Affiche toutes les destinations
  }); // Fin

  $$('[data-tresors]').forEach((zone) => { // Emplacements des produits
    const reglage = zone.dataset.tresors; // Nombre à afficher, ou « tous »
    if (reglage !== 'tous') { zone.innerHTML = PRODUITS.slice(0, Number(reglage) || 4).map(carteTresor).join(''); return; } // Aperçu : les premiers produits
    const afficher = (categorie) => { // Boutique complète, filtrée par catégorie
      const liste = categorie ? PRODUITS.filter((p) => p.categorie === categorie) : PRODUITS; // Filtrage
      zone.innerHTML = liste.map(carteTresor).join(''); // Cartes
      initApparitions(zone); // Animations
    }; // Fin
    const categories = [...new Set(PRODUITS.map((p) => p.categorie))]; // Catégories sans doublon
    creerFiltres($('[data-filtres-tresors]'), [{ valeur: '', nom: 'Tout', nombre: PRODUITS.length }, ...categories.map((c) => ({ valeur: c, nom: c, nombre: PRODUITS.filter((p) => p.categorie === c).length }))], afficher); // Filtres
    afficher(''); // Premier affichage
  }); // Fin

  $$('[data-agenda]').forEach((zone) => { // Emplacements de l'agenda
    const tries = [...EVENEMENTS].sort((a, b) => a.date.localeCompare(b.date)); // Du plus proche au plus lointain
    const aVenir = tries.filter((e) => !estPasse(e)); // Événements à venir
    const passes = tries.filter(estPasse).reverse(); // Événements passés (le plus récent d'abord)
    const vide = '<p class="vide">Le prochain rendez-vous se prépare. Revenez bientôt.</p>'; // Message si rien à venir
    if (zone.dataset.agenda === 'apercu') { zone.innerHTML = aVenir.length ? `<ol class="agenda" data-cascade>${aVenir.slice(0, 3).map(ligneAgenda).join('')}</ol>` : vide; return; } // Accueil : les 3 prochains
    const afficher = (quoi) => { // Agenda complet : « À venir » ou « Passés »
      const liste = quoi === 'passes' ? passes : aVenir; // Liste choisie
      zone.innerHTML = liste.length ? `<ol class="agenda" data-cascade>${liste.map(ligneAgenda).join('')}</ol>` : (quoi === 'passes' ? '<p class="vide">Aucun événement passé pour l’instant.</p>' : vide); // Lignes ou message
      initApparitions(zone); // Animations
    }; // Fin
    const onglets = $('[data-onglets-agenda]'); // Rangée d'onglets
    if (onglets) { // Si elle existe
      onglets.innerHTML = `<button class="filtre" type="button" data-onglet="avenir" aria-pressed="true">À venir<sup>${aVenir.length}</sup></button><button class="filtre" type="button" data-onglet="passes" aria-pressed="false">Passés<sup>${passes.length}</sup></button>`; // Deux onglets
      onglets.addEventListener('click', (e) => { // Au clic
        const bouton = e.target.closest('[data-onglet]'); // Onglet cliqué
        if (!bouton) return; // Aucun : on arrête
        $$('[data-onglet]', onglets).forEach((b) => b.setAttribute('aria-pressed', String(b === bouton))); // Active l'onglet
        afficher(bouton.dataset.onglet); // Affiche la liste correspondante
      }); // Fin
    } // Fin des onglets
    afficher('avenir'); // Premier affichage
  }); // Fin

  document.addEventListener('click', (e) => { // Bouton « Ajouter à mon agenda »
    const bouton = e.target.closest('[data-ics]'); // Bouton cliqué ?
    if (!bouton) return; // Non : on arrête
    const evenement = EVENEMENTS.find((ev) => ev.id === bouton.dataset.ics); // L'événement
    if (evenement) telechargerIcs(evenement); // Téléchargement du fichier
  }); // Fin

  const zonePartenaires = $('[data-partenaires]'); // Emplacement des partenaires
  if (zonePartenaires) { // S'il existe
    zonePartenaires.innerHTML = PARTENAIRES.length // Y a-t-il des partenaires ?
      ? `<div class="grille-partenaires">${PARTENAIRES.map((p) => `<a href="${echapper(p.url || '#')}" target="_blank" rel="noopener">${p.logo ? `<img src="${echapper(p.logo)}" alt="${echapper(p.nom)}" loading="lazy">` : `<span class="etiquette">${echapper(p.nom)}</span>`}</a>`).join('')}</div>` // Oui : mur de logos
      : '<p class="partenaires-vide">Le cercle s’agrandit. Votre structure pourrait être la première à figurer ici.</p>'; // Non : message d'invitation
  } // Fin

  const sommaire = $('[data-sommaire]'); // Sommaire des pages légales
  if (sommaire) { // S'il existe
    const titres = $$('.legal__contenu h2'); // Tous les titres de partie
    titres.forEach((titre, i) => { if (!titre.id) titre.id = 'partie-' + (i + 1); }); // Donne une ancre à chaque titre
    sommaire.innerHTML = titres.map((titre) => `<li><a href="#${titre.id}">${echapper(titre.textContent)}</a></li>`).join(''); // Un lien par titre
  } // Fin


  /* 5. PAGE RÉCIT (article.html?id=…) ======================================= */

  function blocRecit(bloc) { // Transforme un bloc du corps en HTML
    if (bloc.type === 'h2') return `<h2>${echapper(bloc.texte)}</h2>`; // Intertitre
    if (bloc.type === 'citation') return `<blockquote class="recit__citation"><p>${echapper(bloc.texte)}</p>${bloc.source ? `<cite>${echapper(bloc.source)}</cite>` : ''}</blockquote>`; // Citation
    if (bloc.type === 'figure') return `<figure class="recit__figure">${plaque(bloc, { balise: 'div' })}${bloc.legende ? `<figcaption>${echapper(bloc.legende)}</figcaption>` : ''}</figure>`; // Image + légende
    return `<p>${bloc.texte}</p>`; // Paragraphe (le HTML simple est autorisé : <em>, <a>…)
  } // Fin de blocRecit

  const zoneRecit = $('[data-recit]'); // Emplacement de la page récit
  if (zoneRecit) { // Si on est sur article.html
    const article = ARTICLES.find((a) => a.id === (parametre('id') || ARTICLES[0].id)); // Le récit demandé (ou le premier si aucun n'est précisé)
    if (!article) { // Identifiant inconnu
      zoneRecit.innerHTML = introuvable('Ce récit s’est égaré.', 'Il a peut-être changé d’adresse. Le carnet, lui, reste ouvert.', 'index.html', 'Retour à l’accueil'); // Message
      majTitre('Récit introuvable'); // Titre de l'onglet
    } else { // Récit trouvé
      const rubrique = RUBRIQUES[article.rubrique] || { nom: 'Le carnet', url: 'index.html', teinte: 'laterite' }; // Sa rubrique
      majTitre(article.titre, article.chapo); // Titre de l'onglet et description
      marquerPage(article.rubrique); // Surligne la rubrique dans le menu
      const fiche = article.type === 'portrait' && article.fiche // Fiche d'identité (portraits seulement)
        ? `<div class="fiche"><p class="fiche__titre etiquette">Fiche portrait</p><dl>${article.fiche.map(([intitule, valeur]) => `<dt class="etiquette">${echapper(intitule)}</dt><dd>${echapper(valeur)}</dd>`).join('')}</dl></div>` // Bandeau + liste
        : ''; // Sinon rien
      const adresse = window.location.href; // Adresse de la page (pour le partage)
      zoneRecit.innerHTML = /* Construit toute la page du récit */ `
        <header class="recit__tete conteneur"> <!-- En-tête du récit -->
          <div class="recit__tete-texte"> <!-- Textes de l'en-tête -->
            ${filAriane([{ url: rubrique.url, nom: rubrique.nom }])} <!-- Fil d'Ariane -->
            <p class="etiquette"><span class="pastille" style="--c: var(--${rubrique.teinte})">${article.type === 'portrait' ? 'Portrait' : 'Récit'}</span> · ${echapper(article.pays)}</p> <!-- Type (récit ou portrait) · pays -->
            <h1 class="recit__titre">${echapper(article.titre)}</h1> <!-- Titre -->
            <p class="recit__chapo">${echapper(article.chapo)}</p> <!-- Introduction -->
            <p class="recit__meta etiquette"><span>Par ${echapper(article.auteur)}</span><time datetime="${article.date}">${formaterDate(article.date)}</time><span>${tempsLecture(article)} min de lecture</span></p> <!-- Signature · date · durée de lecture -->
          </div> <!-- Fin des textes -->
          ${plaque(article, { classe: 'recit__visuel' })} <!-- Grande image -->
        </header> <!-- Fin de l'en-tête -->
        <div class="conteneur recit__mise"> <!-- Mise en page : colonne + texte -->
          <aside class="recit__cote"> <!-- Colonne d'infos -->
            ${fiche} <!-- Fiche portrait (vide pour un simple récit) -->
            <div class="partage"> <!-- Bloc de partage -->
              <p class="etiquette">Partager ce récit</p> <!-- Surtitre -->
              <div class="partage__liens"> <!-- Boutons -->
                <a href="https://wa.me/?text=${encodeURIComponent(article.titre + ' — ' + adresse)}" target="_blank" rel="noopener">WhatsApp</a> <!-- Partage WhatsApp -->
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(adresse)}" target="_blank" rel="noopener">Facebook</a> <!-- Partage Facebook -->
                <button type="button" data-copier>Copier le lien</button> <!-- Copie du lien -->
              </div> <!-- Fin des boutons -->
            </div> <!-- Fin du partage -->
          </aside> <!-- Fin de la colonne -->
          <div class="recit__corps">${article.corps.map(blocRecit).join('')}</div> <!-- Texte du récit, bloc par bloc -->
        </div>`; // En-tête (fil d'Ariane, type, titre, introduction, signature, image) puis colonne (fiche + partage) et texte
      const copier = $('[data-copier]', zoneRecit); // Bouton « Copier le lien »
      copier.addEventListener('click', () => { // Au clic
        if (navigator.clipboard) navigator.clipboard.writeText(adresse).then(() => afficherMessage('Lien copié.'), () => window.prompt('Copiez ce lien :', adresse)); // Copie automatique (ou fenêtre de secours)
        else window.prompt('Copiez ce lien :', adresse); // Navigateur ancien : fenêtre de secours
      }); // Fin
      const progression = $('.progression span'); // Barre de progression de lecture
      const corps = $('.recit__corps', zoneRecit); // Le texte
      if (progression && corps) { // Si les deux existent
        const majProgression = () => { // Calcule l'avancée de la lecture
          const cadre = corps.getBoundingClientRect(); // Position du texte à l'écran
          const avancee = (window.innerHeight * 0.6 - cadre.top) / cadre.height; // Part du texte déjà lue
          progression.style.setProperty('--avancee', Math.min(1, Math.max(0, avancee)).toFixed(3)); // Entre 0 et 1
        }; // Fin
        window.addEventListener('scroll', majProgression, { passive: true }); // À chaque défilement
        majProgression(); // Premier calcul
      } // Fin de la progression
      const lies = $('[data-recits-lies]'); // Emplacement « Pour aller plus loin »
      if (lies) { // S'il existe
        const memeRubrique = triRecents(ARTICLES.filter((a) => a !== article && a.rubrique === article.rubrique)); // D'abord la même rubrique
        const autres = triRecents(ARTICLES.filter((a) => a.rubrique !== article.rubrique)); // Puis les autres
        lies.innerHTML = [...memeRubrique, ...autres].slice(0, 3).map((a) => carteRecit(a)).join(''); // Trois récits
      } // Fin
    } // Fin du récit trouvé
  } // Fin de la page récit


  /* 6. PAGE DESTINATION (destination.html?id=…) ============================= */

  const zoneDestination = $('[data-destination]'); // Emplacement de la page destination
  if (zoneDestination) { // Si on est sur destination.html
    const destination = DESTINATIONS.find((d) => d.id === (parametre('id') || DESTINATIONS[0].id)); // La destination demandée
    if (!destination) { // Identifiant inconnu
      zoneDestination.innerHTML = introuvable('Cette odyssée reste à écrire.', 'La destination demandée n’existe pas (ou plus).', 'odyssees.html', 'Voir toutes les odyssées'); // Message
      majTitre('Odyssée introuvable'); // Titre
    } else { // Destination trouvée
      majTitre(`${destination.nom} — Odyssées`, destination.intro); // Titre et description
      marquerPage('odyssees'); // Surligne « Odyssées » dans le menu
      const numero = deuxChiffres(DESTINATIONS.indexOf(destination) + 1); // Numéro
      const message = `Bonjour ${REGLAGES.nomSite}, je souhaite organiser l’odyssée « ${destination.nom} » (${destination.pays}).\nDates envisagées :\nNombre de voyageurs :\nVille de départ :`; // Message WhatsApp prérempli
      const partenaires = (destination.partenaires || []).map((p) => `<li><a href="${echapper(p.url)}"${p.url && p.url !== '#' ? ' target="_blank" rel="noopener"' : ''}>${echapper(p.nom)} <span aria-hidden="true">↗</span></a></li>`).join(''); // Liens partenaires
      zoneDestination.innerHTML = /* Construit toute la fiche destination */ `
        <section class="conteneur destination__tete"> <!-- Haut de la fiche -->
          <div class="destination__textes"> <!-- Colonne de texte -->
            ${filAriane([{ url: 'odyssees.html', nom: 'Odyssées' }, { nom: destination.nom }])} <!-- Fil d'Ariane -->
            <p class="etiquette"><span class="num">N° ${numero}</span> · ${echapper(destination.pays)}</p> <!-- Numéro · pays -->
            <h1 class="destination__nom">${echapper(destination.nom)}</h1> <!-- Nom de la destination -->
            <p class="destination__accroche">${echapper(destination.accroche)}</p> <!-- Accroche -->
            <dl class="faits">${destination.faits.map(([intitule, valeur]) => `<div><dt class="etiquette">${echapper(intitule)}</dt><dd>${echapper(valeur)}</dd></div>`).join('')}</dl> <!-- Fiche pratique -->
          </div> <!-- Fin de la colonne -->
          <div class="destination__visuel">${plaque(destination)}</div> <!-- Grande image -->
        </section> <!-- Fin du haut -->
        <section class="section"> <!-- Section « L'expérience » -->
          <div class="conteneur"> <!-- Conteneur -->
            <p class="etiquette tete-section__surtitre"><span class="num">01</span> L’expérience</p> <!-- Surtitre -->
            <p class="destination__intro" data-revele>${echapper(destination.intro)}</p> <!-- Texte d'introduction en grand -->
          </div> <!-- Fin du conteneur -->
        </section> <!-- Fin de la section -->
        <section class="section section--serree"> <!-- Section « À vivre sur place » -->
          <div class="conteneur deux-colonnes deux-colonnes--etroite"> <!-- Deux colonnes -->
            <header class="tete-section"><p class="etiquette tete-section__surtitre"><span class="num">02</span> À vivre sur place</p><h2 class="titre-section">Ce qu’on y <em>vit</em></h2></header> <!-- En-tête de section -->
            <ol class="experiences" data-cascade>${destination.experiences.map((x) => `<li><h3>${echapper(x.titre)}</h3><p>${echapper(x.texte)}</p></li>`).join('')}</ol> <!-- Liste des expériences -->
          </div> <!-- Fin des colonnes -->
        </section> <!-- Fin de la section -->
        <section class="section section--serree"> <!-- Section « Itinéraire » -->
          <div class="conteneur deux-colonnes deux-colonnes--etroite"> <!-- Deux colonnes -->
            <header class="tete-section"><p class="etiquette tete-section__surtitre"><span class="num">03</span> Itinéraire</p><h2 class="titre-section">Pas à <em>pas</em></h2></header> <!-- En-tête de section -->
            <ol class="itineraire" data-cascade>${destination.itineraire.map((x) => `<li><p class="etiquette itineraire__moment">${echapper(x.moment)}</p><h3>${echapper(x.titre)}</h3><p>${echapper(x.texte)}</p></li>`).join('')}</ol> <!-- Étapes jour par jour -->
          </div> <!-- Fin des colonnes -->
        </section> <!-- Fin de la section -->
        <section class="section"> <!-- Section « Bon à savoir » + « Partir » -->
          <div class="conteneur deux-colonnes"> <!-- Deux colonnes -->
            <div> <!-- Colonne des conseils -->
              <p class="etiquette tete-section__surtitre"><span class="num">04</span> Bon à savoir</p> <!-- Surtitre -->
              <ul class="liste-losanges destination__conseils">${destination.bonASavoir.map((c) => `<li>${echapper(c)}</li>`).join('')}</ul> <!-- Liste des conseils -->
            </div> <!-- Fin de la colonne -->
            <div class="encadre" data-revele> <!-- Encadré foncé « Partir » -->
              <p class="etiquette">Partir</p> <!-- Surtitre -->
              <h2>Organiser cette <em>odyssée</em></h2> <!-- Titre -->
              <p>Dites-nous vos dates et vos envies : nous construisons le parcours avec nos partenaires sur place.</p> <!-- Texte -->
              <a class="bouton bouton--whatsapp" href="${lienWhatsApp(message)}" target="_blank" rel="noopener">Écrire sur WhatsApp <span class="fleche" aria-hidden="true">→</span></a> <!-- Bouton WhatsApp prérempli -->
              ${partenaires ? `<ul class="liens-externes">${partenaires}</ul>` : ''} <!-- Liens vers les partenaires -->
            </div> <!-- Fin de l'encadré -->
          </div> <!-- Fin des colonnes -->
        </section>`; // En-tête (textes + fiche pratique + image) | expérience | à vivre | itinéraire | bon à savoir + encadré « Partir »
      const autres = $('[data-autres-odyssees]'); // Emplacement « Autres odyssées »
      if (autres) autres.innerHTML = DESTINATIONS.filter((d) => d !== destination).map(carteOdyssee).join(''); // Les autres destinations
    } // Fin de la destination trouvée
  } // Fin de la page destination


  /* 7. PAGE PRODUIT (produit.html?id=…) ===================================== */

  const zoneProduit = $('[data-produit]'); // Emplacement de la page produit
  if (zoneProduit) { // Si on est sur produit.html
    const produit = trouverProduit(parametre('id') || PRODUITS[0].id); // Le produit demandé
    if (!produit) { // Identifiant inconnu
      zoneProduit.innerHTML = introuvable('Ce trésor a déjà trouvé preneur.', 'Ou bien l’adresse est incorrecte. D’autres pièces vous attendent.', 'tresors.html', 'Voir les Trésors d’Afrique'); // Message
      majTitre('Trésor introuvable'); // Titre
    } else { // Produit trouvé
      majTitre(`${produit.nom} — Trésors d’Afrique`, produit.accroche); // Titre et description
      marquerPage('tresors'); // Surligne « Trésors » dans le menu
      const variantes = produit.variantes || []; // Variantes proposées
      const vues = (produit.galerie && produit.galerie.length) // Plusieurs photos fournies ?
        ? produit.galerie.map((src) => ({ ...produit, image: src })) // Oui : une vue par photo
        : [{ ...produit }, { ...produit, image: '', forme: 'aucune' }, { ...produit, image: '', forme: produit.forme === 'soleil' ? 'arche' : 'soleil' }]; // Non : la photo principale (ou la composition) + deux variations graphiques
      const recitLie = produit.recit ? ARTICLES.find((a) => a.id === produit.recit) : null; // Récit lié éventuel
      zoneProduit.innerHTML = /* Construit toute la fiche produit */ `
        <div class="conteneur"> <!-- Conteneur -->
          <div class="produit__fil">${filAriane([{ url: 'tresors.html', nom: 'Trésors d’Afrique' }, { nom: produit.nom }])}</div> <!-- Fil d'Ariane -->
          <div class="produit"> <!-- Mise en page : galerie | infos -->
            <div class="produit__galerie"> <!-- Galerie -->
              <div class="produit__principale" data-vue-principale>${plaque(vues[0])}</div> <!-- Grande vue -->
              <div class="produit__vignettes">${vues.map((vue, i) => `<button class="produit__vignette" type="button" data-vue="${i}" aria-pressed="${i === 0}" aria-label="Afficher la vue ${i + 1}">${plaque(vue, { balise: 'div' })}</button>`).join('')}</div> <!-- Vignettes cliquables -->
            </div> <!-- Fin de la galerie -->
            <div class="produit__infos"> <!-- Colonne d'informations -->
              <p class="etiquette">${echapper(produit.origine)} · ${echapper(produit.categorie)}</p> <!-- Origine · catégorie -->
              <h1 class="produit__nom">${echapper(produit.nom)}</h1> <!-- Nom -->
              <p class="produit__prix" data-prix aria-live="polite"></p> <!-- Prix (calculé par majAchat) -->
              <p class="produit__description">${echapper(produit.description)}</p> <!-- Description -->
              ${variantes.length ? `<fieldset class="choix"><legend class="etiquette">Choisir</legend><div class="choix__options">${variantes.map((v, i) => `<label class="choix__option"><input type="radio" name="variante" value="${echapper(v.nom)}"${i === 0 ? ' checked' : ''}><span>${echapper(v.nom)}${v.prix && v.prix !== produit.prix ? ' — ' + formaterPrix(v.prix) : ''}</span></label>`).join('')}</div></fieldset>` : ''} <!-- Choix de la variante (si le produit en a) -->
              <div class="produit__achat"> <!-- Zone d'achat -->
                <div class="produit__quantite"><span class="etiquette" id="quantite-titre">Quantité</span><div class="quantite"><button type="button" data-pas="-1" aria-label="Diminuer la quantité">−</button><input type="number" min="1" max="99" value="1" inputmode="numeric" aria-labelledby="quantite-titre" data-quantite><button type="button" data-pas="1" aria-label="Augmenter la quantité">+</button></div></div> <!-- Sélecteur de quantité -->
                <button class="bouton bouton--plein bouton--large" type="button" data-ajouter-produit>Ajouter à la calebasse <span class="fleche" aria-hidden="true">+</span></button> <!-- Bouton « Ajouter à la calebasse » -->
                <a class="bouton bouton--whatsapp bouton--large" href="#" target="_blank" rel="noopener" data-commande-directe>Commander directement sur WhatsApp <span class="fleche" aria-hidden="true">→</span></a> <!-- Bouton « Commander sur WhatsApp » (lien préparé par majAchat) -->
              </div> <!-- Fin de la zone d'achat -->
              <div class="produit__details"> <!-- Blocs dépliables -->
                <details open><summary class="etiquette">Caractéristiques</summary><dl>${(produit.details || []).map(([intitule, valeur]) => `<dt class="etiquette">${echapper(intitule)}</dt><dd>${echapper(valeur)}</dd>`).join('')}</dl></details> <!-- Caractéristiques -->
                <details><summary class="etiquette">Comment commander ?</summary><p>Ajoutez vos trésors à la calebasse puis envoyez-nous la commande sur WhatsApp, ou commandez directement cet objet. Nous confirmons avec vous la disponibilité, la livraison et le paiement.</p></details> <!-- Comment commander -->
                ${recitLie ? `<details><summary class="etiquette">L’histoire de l’objet</summary><p>${echapper(recitLie.chapo)}</p><p><a class="lien-fleche" href="article.html?id=${encodeURIComponent(recitLie.id)}">Lire le récit <span class="fleche" aria-hidden="true">→</span></a></p></details>` : ''} <!-- Récit lié (si renseigné) -->
              </div> <!-- Fin des blocs -->
            </div> <!-- Fin de la colonne -->
          </div> <!-- Fin de la mise en page -->
        </div>`; // Fil d'Ariane | galerie (grande vue + vignettes) | origine, nom, prix, description, variantes, quantité, boutons, détails
      const champQuantite = $('[data-quantite]', zoneProduit); // Champ quantité
      const varianteChoisie = () => { const choix = $('input[name="variante"]:checked', zoneProduit); return choix ? choix.value : ''; }; // Variante sélectionnée
      const quantite = () => Math.min(99, Math.max(1, parseInt(champQuantite.value, 10) || 1)); // Quantité entre 1 et 99
      const majAchat = () => { // Met à jour le prix et le lien WhatsApp direct
        const unitaire = prixUnitaire(produit, varianteChoisie()); // Prix unitaire de la variante
        const total = unitaire * quantite(); // Prix total
        $('[data-prix]', zoneProduit).textContent = quantite() > 1 ? `${formaterPrix(unitaire)} × ${quantite()} = ${formaterPrix(total)}` : formaterPrix(unitaire); // Affichage du prix
        const variante = varianteChoisie() ? ` (${varianteChoisie()})` : ''; // Variante entre parenthèses
        $('[data-commande-directe]', zoneProduit).href = lienWhatsApp(`Bonjour ${REGLAGES.nomSite},\nJe souhaite commander :\n\n• ${quantite()} × ${produit.nom}${variante} — ${formaterPrix(total)}\n\nNom :\nVille de livraison :`); // Lien WhatsApp prérempli
      }; // Fin
      majAchat(); // Premier calcul
      zoneProduit.addEventListener('change', majAchat); // Changement de variante ou de quantité
      champQuantite.addEventListener('input', majAchat); // Saisie de la quantité au clavier
      zoneProduit.addEventListener('click', (e) => { // Clics dans la fiche
        const pas = e.target.closest('[data-pas]'); // Boutons − / +
        if (pas) { champQuantite.value = Math.min(99, Math.max(1, quantite() + Number(pas.dataset.pas))); majAchat(); return; } // Change la quantité
        if (e.target.closest('[data-ajouter-produit]')) { // Bouton « Ajouter à la calebasse »
          calebasse.ajouter(produit.id, varianteChoisie(), quantite()); // Ajoute
          ouvrirPanneau('calebasse'); // Ouvre la calebasse pour montrer l'ajout
          return; // Fin
        } // Fin
        const vignette = e.target.closest('[data-vue]'); // Vignette de la galerie
        if (vignette) { // Si on a cliqué sur une vignette
          $$('[data-vue]', zoneProduit).forEach((b) => b.setAttribute('aria-pressed', String(b === vignette))); // Marque la vignette active
          $('[data-vue-principale]', zoneProduit).innerHTML = plaque(vues[Number(vignette.dataset.vue)]); // Affiche cette vue en grand
        } // Fin
      }); // Fin des clics
      const lies = $('[data-tresors-lies]'); // Emplacement « Vous aimerez aussi »
      if (lies) { // S'il existe
        const memeCategorie = PRODUITS.filter((p) => p !== produit && p.categorie === produit.categorie); // Même catégorie d'abord
        const autres = PRODUITS.filter((p) => p !== produit && p.categorie !== produit.categorie); // Puis les autres
        lies.innerHTML = [...memeCategorie, ...autres].slice(0, 4).map(carteTresor).join(''); // Quatre produits
      } // Fin
    } // Fin du produit trouvé
  } // Fin de la page produit
})(); // Fin et exécution immédiate

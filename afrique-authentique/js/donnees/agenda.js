/* ==========================================================================
   AFRIQUE AUTHENTIQUE — L'AGENDA (événements)
   --------------------------------------------------------------------------
   Les événements s'affichent sur evenements.html (onglets « À venir » et
   « Passés ») et les trois prochains sur l'accueil. Le site trie et classe
   automatiquement selon la date du jour : pas besoin de retirer les
   événements passés, ils basculent tout seuls dans « Passés ».
   Le PREMIER événement est commenté ligne par ligne (modèle).
   Contenus d'exemple : à remplacer par la vraie programmation.
   ========================================================================== */

const EVENEMENTS = [ // Ouvre la liste des événements

  { // ===== ÉVÉNEMENT MODÈLE (commenté) =====
    id: 'veillee-contes', // Identifiant unique (sans espaces ni accents)
    titre: 'Veillée de contes sous les étoiles', // Nom de l'événement
    type: 'Rencontre du cercle', // Type (affiché en petit au-dessus du titre)
    date: '2026-11-14', // Date de début, format AAAA-MM-JJ
    dateFin: '', // Date de fin pour un événement sur plusieurs jours (sinon laisser vide)
    heure: '19 h', // Horaire affiché (texte libre)
    lieu: 'Cotonou, Bénin', // Lieu
    description: "Une soirée de contes en fon et en français, accompagnée au tambour. Places limitées : réservation conseillée.", // Description courte
    reservation: true, // true = bouton « Réserver via WhatsApp » ; false = pas de bouton
    lien: '', // Lien externe facultatif (site officiel, billetterie…)
    aConfirmer: false, // true = affiche la mention « dates à confirmer »
  }, // ===== Fin de l'événement modèle =====

  { // Événement
    id: 'atelier-indigo', // Identifiant
    titre: 'Atelier : teindre à l’indigo', // Titre
    type: 'Atelier', // Type
    date: '2026-11-29', dateFin: '', heure: '9 h 30 – 13 h', // Dates et horaire
    lieu: 'Porto-Novo, Bénin', // Lieu
    description: "Une matinée pour s'initier aux techniques de réserve (nouer, coudre, peindre) et repartir avec son propre foulard teint.", // Description
    reservation: true, lien: '', aConfirmer: false, // Options
  }, // Fin

  { // Événement
    id: 'marche-createurs', // Identifiant
    titre: 'Marché des créateurs — édition de fin d’année', // Titre
    type: 'Marché', // Type
    date: '2026-12-12', dateFin: '', heure: '11 h – 20 h', // Dates et horaire
    lieu: 'Cotonou, Bénin', // Lieu
    description: 'Artisans, créatrices et coopératives partenaires réunis pour une journée de vente directe, de démonstrations et de rencontres.', // Description
    reservation: false, lien: '', aConfirmer: false, // Options
  }, // Fin

  { // Événement
    id: 'vodun-days-2027', // Identifiant
    titre: 'Vodun Days — voyage du cercle', // Titre
    type: 'Festival', // Type
    date: '2027-01-08', dateFin: '2027-01-10', heure: '', // Dates
    lieu: 'Ouidah, Bénin', // Lieu
    description: 'Trois jours de cérémonies, de masques et de musique à Ouidah. Nous organisons un séjour en petit groupe avec un guide local.', // Description
    reservation: true, lien: '', aConfirmer: true, // Options
  }, // Fin

  { // Événement
    id: 'fespaco-2027', // Identifiant
    titre: 'FESPACO — 30ᵉ édition', // Titre
    type: 'Festival', // Type
    date: '2027-02-27', dateFin: '', heure: '', // Dates
    lieu: 'Ouagadougou, Burkina Faso', // Lieu
    description: 'Le grand rendez-vous des cinémas d’Afrique et de la diaspora. Dates officielles à paraître.', // Description
    reservation: false, lien: '', aConfirmer: true, // Options
  }, // Fin

  { // Événement passé
    id: 'lecture-amkoullel', // Identifiant
    titre: 'Lecture : « Amkoullel, l’enfant peul »', // Titre
    type: 'Lecture', // Type
    date: '2026-09-20', dateFin: '', heure: '17 h', // Dates
    lieu: 'Cotonou, Bénin', // Lieu
    description: "Lecture d'extraits des mémoires d'Amadou Hampâté Bâ, suivie d'un échange autour de la transmission orale.", // Description
    reservation: false, lien: '', aConfirmer: false, // Options
  }, // Fin

  { // Événement passé
    id: 'projection-timbuktu', // Identifiant
    titre: 'Projection-débat : « Timbuktu »', // Titre
    type: 'Cinéma', // Type
    date: '2026-07-18', dateFin: '', heure: '19 h 30', // Dates
    lieu: 'Cotonou, Bénin', // Lieu
    description: "Projection du film d'Abderrahmane Sissako, suivie d'une discussion sur la place des cinémas africains aujourd'hui.", // Description
    reservation: false, lien: '', aConfirmer: false, // Options
  }, // Fin

]; // Fin de la liste des événements

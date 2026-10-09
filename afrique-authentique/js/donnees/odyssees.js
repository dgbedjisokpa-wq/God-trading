/* ==========================================================================
   AFRIQUE AUTHENTIQUE — LES ODYSSÉES (destinations de voyage)
   --------------------------------------------------------------------------
   Chaque destination s'affiche sur odyssees.html, sur l'accueil, et sur sa
   fiche : destination.html?id=identifiant
   La PREMIÈRE destination est commentée ligne par ligne (modèle).
   Les liens « partenaires » (agences, hébergements…) sont à compléter :
   remplacez les « # » par les vraies adresses.
   ========================================================================== */

const DESTINATIONS = [ // Ouvre la liste des destinations

  { // ===== DESTINATION MODÈLE (commentée) =====
    id: 'ouidah', // Identifiant unique utilisé dans l'adresse : destination.html?id=ouidah
    nom: 'Ouidah', // Nom de la destination
    pays: 'Bénin', // Pays
    accroche: "Sur la Route des Esclaves, de la ville jusqu'à l'océan.", // Phrase d'accroche (cartes et haut de fiche)
    intro: "Ancien comptoir de la traite atlantique, Ouidah est aujourd'hui l'un des grands lieux de mémoire du golfe du Bénin. C'est aussi une ville vivante, capitale spirituelle du vodun, où les temples côtoient les églises et les maisons afro-brésiliennes.", // Texte d'introduction
    duree: '2 jours', // Durée conseillée (affichée sur les cartes)
    saison: 'Novembre à mars', // Meilleure saison (affichée sur les cartes)
    faits: [ // Fiche pratique : [intitulé, valeur]
      ['Pays', 'Bénin'], // Ligne
      ['Depuis Cotonou', 'environ 40 km'], // Ligne
      ['Meilleure saison', 'novembre à mars'], // Ligne
      ['Durée conseillée', '2 jours'], // Ligne
      ['Langues', 'fon, français'], // Ligne
      ['Temps fort', 'Vodun Days, en janvier'], // Ligne
    ], // Fin de la fiche pratique
    experiences: [ // « À vivre sur place » : { titre, texte }
      { titre: 'La Route des Esclaves', texte: "Environ quatre kilomètres de piste, de la place des enchères jusqu'à la plage, jalonnés de monuments. Au bout : la Porte du Non-Retour, face à l'océan." }, // Expérience 1
      { titre: 'Le Temple des Pythons', texte: "Sanctuaire dédié à Dangbé, le python sacré, situé face à la basilique de l'Immaculée Conception." }, // Expérience 2
      { titre: 'La forêt sacrée de Kpassè', texte: 'Un bois sacré peuplé de sculptures, lié à la légende du roi Kpassè.' }, // Expérience 3
      { titre: "Le musée d'histoire", texte: "Installé dans l'ancien fort portugais, il retrace l'histoire de la traite et les liens entre le golfe du Bénin et les Amériques." }, // Expérience 4
    ], // Fin des expériences
    itineraire: [ // Programme : { moment, titre, texte }
      { moment: 'Jour 1', titre: 'La ville et ses mémoires', texte: "Matinée au musée d'histoire, déjeuner en ville, puis visite du Temple des Pythons et de la basilique. En fin de journée, promenade parmi les maisons afro-brésiliennes." }, // Étape 1
      { moment: 'Jour 2', titre: "Jusqu'à l'océan", texte: 'Forêt sacrée de Kpassè au matin, puis la Route des Esclaves à pied ou à vélo jusqu’à la Porte du Non-Retour. Coucher de soleil sur la plage.' }, // Étape 2
    ], // Fin de l'itinéraire
    bonASavoir: [ // Conseils pratiques (un par ligne)
      "Demandez toujours l'autorisation avant de photographier une personne, une cérémonie ou un lieu sacré.", // Conseil 1
      'Prévoyez des tenues légères et couvrantes : le soleil est fort toute l’année.', // Conseil 2
      'En janvier, la ville accueille les Vodun Days : réservez votre hébergement longtemps à l’avance.', // Conseil 3
    ], // Fin des conseils
    partenaires: [ // Liens externes vers les partenaires : { nom, url }
      { nom: 'Réserver avec notre agence partenaire', url: '#' }, // ⚠ Remplacez « # » par l'adresse du partenaire
      { nom: 'Hébergements recommandés', url: '#' }, // ⚠ Idem
    ], // Fin des partenaires
    image: '', // Photo principale (ex. 'assets/photos/ouidah.jpg'). Vide = composition graphique
    alt: '', // Description de la photo
    motif: 'cauris', // Motif graphique
    teinte: 'kola', // Couleur
    forme: 'arche', // Forme
  }, // ===== Fin de la destination modèle =====

  { // Destination : Ganvié
    id: 'ganvie', // Identifiant
    nom: 'Ganvié', // Nom
    pays: 'Bénin', // Pays
    accroche: 'La cité sur pilotis du lac Nokoué.', // Accroche
    intro: "À quelques kilomètres de Cotonou, Ganvié surgit des eaux du lac Nokoué : des milliers de maisons sur pilotis, des pirogues en guise de rues, un marché qui flotte. Selon la tradition, la cité fut fondée par les Tofinu, qui trouvèrent refuge sur le lac pour échapper aux razzias.", // Introduction
    duree: '1 journée', // Durée
    saison: "Toute l'année", // Saison
    faits: [ // Fiche pratique
      ['Pays', 'Bénin'], // Ligne
      ['Accès', "en barque depuis Abomey-Calavi"], // Ligne
      ['Meilleure saison', "toute l'année, idéalement de novembre à mars"], // Ligne
      ['Durée conseillée', 'une demi-journée à une journée'], // Ligne
      ['Langues', 'tofin, fon, français'], // Ligne
    ], // Fin
    experiences: [ // À vivre
      { titre: 'La traversée', texte: "Depuis l'embarcadère d'Abomey-Calavi, une traversée d'une trentaine de minutes mène au cœur de la cité." }, // Expérience
      { titre: 'Le marché flottant', texte: 'Les femmes y vendent poissons, fruits et épices directement depuis leurs pirogues.' }, // Expérience
      { titre: 'Les acadjas', texte: 'Ces enclos de branchages plantés dans le lac servent à attirer et élever les poissons : une technique de pêche ancestrale.' }, // Expérience
    ], // Fin
    itineraire: [ // Programme
      { moment: 'Matin', titre: 'Départ sur le lac', texte: "Embarquement tôt, quand la lumière est douce et que le marché s'anime." }, // Étape
      { moment: 'Midi', titre: "Déjeuner sur l'eau", texte: 'Pause dans un restaurant sur pilotis, poisson grillé du lac.' }, // Étape
      { moment: 'Après-midi', titre: 'Retour par les acadjas', texte: 'Retour en longeant les enclos de pêche et les villages voisins.' }, // Étape
    ], // Fin
    bonASavoir: [ // Conseils
      'Ganvié est un lieu de vie : saluez, souriez, et demandez avant de photographier les habitants.', // Conseil
      "Privilégiez les guides et les embarcations officiels au départ de l'embarcadère.", // Conseil
      "Emportez chapeau, crème solaire et de l'eau.", // Conseil
    ], // Fin
    partenaires: [ // Partenaires
      { nom: 'Réserver une sortie sur le lac', url: '#' }, // ⚠ À compléter
    ], // Fin
    image: '', alt: '', motif: 'adire', teinte: 'indigo', forme: 'demi', // Visuel
  }, // Fin de la destination

  { // Destination : Kumasi & Bonwire
    id: 'kumasi-bonwire', // Identifiant
    nom: 'Kumasi & Bonwire', // Nom
    pays: 'Ghana', // Pays
    accroche: "Au pays ashanti, de l'or au kente.", // Accroche
    intro: "Ancienne capitale de l'empire ashanti, Kumasi reste le cœur culturel du peuple akan. Autour de la ville, des villages spécialisés perpétuent les grands savoir-faire : le kente à Bonwire, l'adinkra à Ntonso, la sculpture sur bois à Ahwiaa.", // Introduction
    duree: '3 jours', // Durée
    saison: 'Novembre à mars', // Saison
    faits: [ // Fiche pratique
      ['Pays', 'Ghana'], // Ligne
      ['Région', 'Ashanti'], // Ligne
      ['Meilleure saison', 'novembre à mars'], // Ligne
      ['Durée conseillée', '3 jours'], // Ligne
      ['Langues', 'twi, anglais'], // Ligne
    ], // Fin
    experiences: [ // À vivre
      { titre: 'Le palais de Manhyia', texte: "Résidence de l'Asantehene, le roi des Ashanti, dont une partie est ouverte à la visite sous forme de musée." }, // Expérience
      { titre: 'Le marché de Kejetia', texte: "L'un des plus grands marchés d'Afrique de l'Ouest : un labyrinthe de tissus, d'épices et d'outils." }, // Expérience
      { titre: 'Bonwire, le village du kente', texte: 'Rencontre avec les tisserands et démonstration sur métier à bande étroite.' }, // Expérience
      { titre: 'Ntonso et Ahwiaa', texte: 'Impression adinkra au tampon, puis ateliers de sculpture sur bois.' }, // Expérience
    ], // Fin
    itineraire: [ // Programme
      { moment: 'Jour 1', titre: 'Kumasi royale', texte: 'Palais de Manhyia, centre culturel national, puis immersion au marché de Kejetia.' }, // Étape
      { moment: 'Jour 2', titre: 'Le village du kente', texte: 'Journée à Bonwire avec les tisserands ; essai de tissage pour les plus curieux.' }, // Étape
      { moment: 'Jour 3', titre: 'Signes et sculptures', texte: "Matinée à Ntonso pour l'adinkra, après-midi à Ahwiaa chez les sculpteurs." }, // Étape
    ], // Fin
    bonASavoir: [ // Conseils
      'La monnaie est le cedi ; les cartes bancaires ne sont pas acceptées partout.', // Conseil
      "Les ressortissants de la CEDEAO n'ont pas besoin de visa ; pour les autres, vérifiez les conditions avant le départ.", // Conseil
      'Lors des cérémonies traditionnelles, certains espaces du palais peuvent être fermés.', // Conseil
    ], // Fin
    partenaires: [ // Partenaires
      { nom: 'Réserver avec notre agence partenaire', url: '#' }, // ⚠ À compléter
      { nom: 'Ateliers de tissage à Bonwire', url: '#' }, // ⚠ À compléter
    ], // Fin
    image: '', alt: '', motif: 'kente', teinte: 'ocre', forme: 'bandes', // Visuel
  }, // Fin de la destination

  { // Destination : Saint-Louis
    id: 'saint-louis', // Identifiant
    nom: 'Saint-Louis', // Nom
    pays: 'Sénégal', // Pays
    accroche: "L'île entre fleuve et océan.", // Accroche
    intro: "Ancienne capitale de l'Afrique-Occidentale française puis du Sénégal, Saint-Louis s'étire sur une île du fleuve Sénégal, à deux pas de l'Atlantique. Son centre historique, aux maisons à balcons, est inscrit au patrimoine mondial de l'UNESCO.", // Introduction
    duree: '3 jours', // Durée
    saison: 'Novembre à mai', // Saison
    faits: [ // Fiche pratique
      ['Pays', 'Sénégal'], // Ligne
      ['Depuis Dakar', 'environ 260 km'], // Ligne
      ['Meilleure saison', 'novembre à mai'], // Ligne
      ['Durée conseillée', '3 jours'], // Ligne
      ['Langues', 'wolof, français'], // Ligne
    ], // Fin
    experiences: [ // À vivre
      { titre: 'Le pont Faidherbe', texte: "Long de plus de 500 mètres, il relie l'île au continent depuis 1897." }, // Expérience
      { titre: 'Guet Ndar', texte: 'Le quartier des pêcheurs, sur la Langue de Barbarie, et ses centaines de pirogues peintes.' }, // Expérience
      { titre: 'Le parc du Djoudj', texte: "À une soixantaine de kilomètres, l'un des grands sanctuaires d'oiseaux migrateurs au monde, de novembre à avril." }, // Expérience
      { titre: 'Le festival de jazz', texte: 'Chaque printemps depuis 1993, Saint-Louis vibre au rythme de son festival international de jazz.' }, // Expérience
    ], // Fin
    itineraire: [ // Programme
      { moment: 'Jour 1', titre: "L'île à pied", texte: 'Balade dans le centre historique, ses maisons à balcons et ses galeries ; coucher de soleil sur le pont Faidherbe.' }, // Étape
      { moment: 'Jour 2', titre: "Côté océan", texte: 'Matinée à Guet Ndar au retour des pêcheurs, après-midi sur la Langue de Barbarie.' }, // Étape
      { moment: 'Jour 3', titre: 'Le Djoudj', texte: 'Excursion en pirogue au milieu des pélicans et des flamants (en saison).' }, // Étape
    ], // Fin
    bonASavoir: [ // Conseils
      'La meilleure période pour les oiseaux du Djoudj s’étend de novembre à avril.', // Conseil
      'Réservez tôt si vous venez pendant le festival de jazz.', // Conseil
      'Convenez du tarif des calèches et des taxis avant le départ.', // Conseil
    ], // Fin
    partenaires: [ // Partenaires
      { nom: 'Réserver avec notre agence partenaire', url: '#' }, // ⚠ À compléter
    ], // Fin
    image: '', alt: '', motif: 'ndebele', teinte: 'laterite', forme: 'soleil', // Visuel
  }, // Fin de la destination

]; // Fin de la liste des destinations

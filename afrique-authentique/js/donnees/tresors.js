/* ==========================================================================
   AFRIQUE AUTHENTIQUE — LES TRÉSORS (produits de la boutique)
   --------------------------------------------------------------------------
   Chaque produit s'affiche sur tresors.html, sur l'accueil, et sur sa fiche :
   produit.html?id=identifiant
   La commande se fait par WhatsApp (numéro réglé dans reglages.js).
   Le PREMIER produit est commenté ligne par ligne (modèle).
   Prix : un nombre entier, sans espaces (65000 et non 65 000).
   ========================================================================== */

const PRODUITS = [ // Ouvre la liste des produits

  { // ===== PRODUIT MODÈLE (commenté) =====
    id: 'kente-tisse-main', // Identifiant unique utilisé dans l'adresse : produit.html?id=kente-tisse-main
    nom: 'Kente tissé main', // Nom du produit
    origine: 'Bonwire, Ghana', // Lieu de fabrication
    categorie: 'Textiles', // Catégorie (sert aux filtres de la boutique)
    prix: 65000, // Prix de base, en FCFA
    accroche: 'Bandes tissées sur métier étroit, assemblées à la main.', // Phrase courte (cartes)
    description: "Ce kente est tissé par un atelier familial de Bonwire, bande après bande, puis assemblé à la main. Chaque pièce est unique : de légères variations de motifs témoignent du travail du tisserand.", // Description complète (fiche produit)
    variantes: [ // Choix proposés au client (couleur, taille…). « prix » facultatif : s'il manque, le prix de base s'applique
      { nom: 'Or & vert' }, // Variante 1
      { nom: 'Or & bleu' }, // Variante 2
      { nom: 'Rouge & noir' }, // Variante 3
    ], // Fin des variantes
    details: [ // Caractéristiques : [intitulé, valeur]
      ['Matière', 'Coton et fils de viscose'], // Ligne
      ['Dimensions', 'environ 2 m × 1,10 m'], // Ligne
      ['Entretien', 'Lavage à la main, eau froide'], // Ligne
      ['Disponibilité', 'Sous 7 à 10 jours'], // Ligne
    ], // Fin des caractéristiques
    recit: 'kente', // Identifiant d'un récit lié (affiche « Lire l'histoire de l'objet »). Vide = pas de lien
    image: '', // Photo (ex. 'assets/photos/kente.jpg'). Vide = composition graphique
    galerie: [], // Facultatif : plusieurs photos pour la fiche, ex. ['assets/photos/kente-1.jpg', 'assets/photos/kente-2.jpg']
    alt: '', // Description de la photo
    motif: 'kente', // Motif graphique
    teinte: 'ocre', // Couleur
    forme: 'bandes', // Forme
  }, // ===== Fin du produit modèle =====

  { // Produit : bogolan
    id: 'bogolan-de-segou', // Identifiant
    nom: 'Bogolan de Ségou', // Nom
    origine: 'Ségou, Mali', // Origine
    categorie: 'Textiles', // Catégorie
    prix: 38000, // Prix
    accroche: 'Teinture végétale et minérale, motifs peints à la main.', // Accroche
    description: "Peint à la main selon la technique traditionnelle : bain de feuilles, puis application de terre fermentée. Idéal en tenture murale, en jeté de canapé ou pour la confection.", // Description
    variantes: [{ nom: 'Écru & noir' }, { nom: 'Ocre & noir' }], // Variantes
    details: [['Matière', 'Coton tissé main'], ['Dimensions', 'environ 1,50 m × 1 m'], ['Entretien', 'Lavage à la main, savon doux, sans frotter']], // Caractéristiques
    recit: 'bogolan', // Récit lié
    image: '', alt: '', motif: 'bogolan', teinte: 'sable', forme: 'aucune', // Visuel
  }, // Fin

  { // Produit : karité
    id: 'beurre-de-karite', // Identifiant
    nom: 'Beurre de karité brut', // Nom
    origine: 'Nord-Bénin', // Origine
    categorie: 'Beauté', // Catégorie
    prix: 6500, // Prix de base
    accroche: 'Non raffiné, préparé par une coopérative de femmes.', // Accroche
    description: 'Un beurre brut, non raffiné et sans parfum ajouté, préparé de manière traditionnelle par une coopérative de femmes. Pour le corps, les cheveux et les mains.', // Description
    variantes: [{ nom: 'Pot de 250 g', prix: 6500 }, { nom: 'Pot de 500 g', prix: 11000 }], // Variantes avec prix différents
    details: [['Composition', '100 % beurre de karité'], ['Conservation', "À l'abri de la chaleur"], ['Texture', 'Fond au contact de la peau']], // Caractéristiques
    recit: 'karite', // Récit lié
    image: '', alt: '', motif: 'cauris', teinte: 'palme', forme: 'soleil', // Visuel
  }, // Fin

  { // Produit : savon noir
    id: 'savon-noir-alata', // Identifiant
    nom: 'Savon noir alata samina', // Nom
    origine: 'Ghana', // Origine
    categorie: 'Beauté', // Catégorie
    prix: 3500, // Prix
    accroche: 'Le savon noir traditionnel, à base de cendres végétales.', // Accroche
    description: "Fabriqué à partir de cendres de végétaux (cabosses de cacao, peaux de plantain) et d'huiles végétales, ce savon noir nettoie en douceur le visage, le corps et les cheveux.", // Description
    variantes: [{ nom: "À l'unité", prix: 3500 }, { nom: 'Lot de 3', prix: 9500 }], // Variantes
    details: [['Poids', 'environ 200 g'], ['Usage', 'Visage, corps, cheveux']], // Caractéristiques
    recit: '', // Pas de récit lié
    image: '', alt: '', motif: 'ndebele', teinte: 'kola', forme: 'demi', // Visuel
  }, // Fin

  { // Produit : panier Bolga
    id: 'panier-bolga', // Identifiant
    nom: 'Panier de Bolgatanga', // Nom
    origine: 'Bolgatanga, Ghana', // Origine
    categorie: 'Maison', // Catégorie
    prix: 24000, // Prix de base
    accroche: 'Tressé en herbe à éléphant, anses en cuir.', // Accroche
    description: "Tressés à la main dans le nord du Ghana, ces paniers robustes servent au marché comme à la maison. Les couleurs varient d'une pièce à l'autre : chacune est unique.", // Description
    variantes: [{ nom: 'Taille moyenne', prix: 24000 }, { nom: 'Grande taille', prix: 32000 }], // Variantes
    details: [['Matière', 'Herbe à éléphant, cuir'], ['Fabrication', 'Tressage à la main']], // Caractéristiques
    recit: '', // Pas de récit lié
    image: '', alt: '', motif: 'kuba', teinte: 'laterite', forme: 'arche', // Visuel
  }, // Fin

  { // Produit : perles de Krobo
    id: 'bracelet-perles-krobo', // Identifiant
    nom: 'Bracelet en perles de Krobo', // Nom
    origine: 'Odumase-Krobo, Ghana', // Origine
    categorie: 'Bijoux', // Catégorie
    prix: 9000, // Prix
    accroche: 'Perles de verre recyclé, moulées et cuites au four.', // Accroche
    description: 'Les Krobo fabriquent leurs perles à partir de verre recyclé, broyé puis cuit dans des moules en terre. Un savoir-faire ancien, transmis de génération en génération.', // Description
    variantes: [{ nom: 'Terre & ocre' }, { nom: 'Indigo & blanc' }, { nom: 'Multicolore' }], // Variantes
    details: [['Matière', 'Verre recyclé, fil élastique'], ['Taille', 'Ajustable']], // Caractéristiques
    recit: '', // Pas de récit lié
    image: '', alt: '', motif: 'cauris', teinte: 'indigo', forme: 'soleil', // Visuel
  }, // Fin

  { // Produit : foulard adire
    id: 'foulard-adire', // Identifiant
    nom: 'Foulard adire indigo', // Nom
    origine: 'Abeokuta, Nigeria', // Origine
    categorie: 'Textiles', // Catégorie
    prix: 18000, // Prix
    accroche: "Teint à la main, motifs réservés à l'amidon de manioc.", // Accroche
    description: "Réalisé par des teinturières d'Abeokuta selon la technique de l'adire eleko : le motif est peint à la pâte de manioc avant les bains d'indigo successifs.", // Description
    variantes: [], // Pas de variante
    details: [['Matière', 'Coton'], ['Dimensions', 'environ 180 × 70 cm'], ['Entretien', "Premiers lavages à part : l'indigo peut dégorger"]], // Caractéristiques
    recit: 'adire', // Récit lié
    image: '', alt: '', motif: 'adire', teinte: 'indigo', forme: 'arche', // Visuel
  }, // Fin

  { // Produit : tenture d'Abomey
    id: 'tenture-abomey', // Identifiant
    nom: "Tenture appliquée d'Abomey", // Nom
    origine: 'Abomey, Bénin', // Origine
    categorie: 'Maison', // Catégorie
    prix: 45000, // Prix de base
    accroche: 'Figures découpées et cousues à la main, d’après les emblèmes royaux.', // Accroche
    description: "Réalisée par un atelier d'Abomey selon la technique de l'appliqué : chaque figure est découpée dans un tissu de couleur, puis cousue à la main sur la toile de fond.", // Description
    variantes: [{ nom: 'Format 60 × 40 cm', prix: 45000 }, { nom: 'Format 120 × 80 cm', prix: 85000 }], // Variantes
    details: [['Matière', 'Coton'], ['Fabrication', 'Appliqué cousu main'], ['Accrochage', 'Fourreau en haut pour une tringle']], // Caractéristiques
    recit: 'abomey-memoire-cousue', // Récit lié
    image: '', alt: '', motif: 'kuba', teinte: 'kola', forme: 'losange', // Visuel
  }, // Fin

]; // Fin de la liste des produits

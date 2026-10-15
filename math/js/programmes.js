// Programmes de mathématiques pré-remplis, par classe et par série.
//
// Format texte volontairement simple (le même que dans l'écran « Programmes »,
// où l'enseignant peut tout corriger) :
//   - une ligne qui commence par « SA » ou « Partie » ouvre une partie ;
//   - une ligne qui commence par « - » est une séquence / un contenu de la partie.
//
// Les intitulés suivent la structure des programmes d'études par compétences
// du Bénin (premier cycle : 4 situations d'apprentissage ; second cycle :
// configurations de l'espace, organisation des données, lieux géométriques).
// Ils sont à vérifier avec le guide du programme de l'enseignant : la version
// corrigée dans l'application remplace celle-ci.

export const ENSEIGNEMENTS = [
  { id: 'general', label: 'Secondaire général' },
  { id: 'technique', label: 'Enseignement technique' },
];

export const CLASSES = {
  general: [
    { id: '6e', label: '6e', cycle: 1, series: [] },
    { id: '5e', label: '5e', cycle: 1, series: [] },
    { id: '4e', label: '4e', cycle: 1, series: [] },
    { id: '3e', label: '3e', cycle: 1, series: [] },
    { id: '2nde', label: '2nde', cycle: 2, series: ['A', 'B', 'C', 'D'] },
    { id: '1ere', label: '1ère', cycle: 2, series: ['A1', 'A2', 'B', 'C', 'D'] },
    { id: 'Tle', label: 'Tle', cycle: 2, series: ['A1', 'A2', 'B', 'C', 'D'] },
  ],
  technique: [
    { id: '2nde', label: '2nde', cycle: 2, series: ['E', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3'] },
    { id: '1ere', label: '1ère', cycle: 2, series: ['E', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3'] },
    { id: 'Tle', label: 'Tle', cycle: 2, series: ['E', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3'] },
  ],
};

export const SERIES_TECHNIQUES = {
  E: 'Mathématiques et techniques',
  F1: 'Construction mécanique',
  F2: 'Électronique',
  F3: 'Électrotechnique',
  F4: 'Génie civil',
  G1: 'Techniques administratives',
  G2: 'Techniques quantitatives de gestion',
  G3: 'Techniques commerciales',
};

/** Clé unique d'une classe : « 4e », « Tle-D », « tech-1ere-F3 ». */
export function cleClasse(ens, classe, serie) {
  const base = serie ? `${classe}-${serie}` : classe;
  return ens === 'technique' ? `tech-${base}` : base;
}

/** Libellé lisible : « 4e », « Tle D », « 1ère F3 (Électrotechnique) ». */
export function libelleClasse(ens, classe, serie) {
  const c = [...CLASSES.general, ...CLASSES.technique].find(x => x.id === classe);
  const nom = c ? c.label : classe;
  if (!serie) return nom;
  if (ens === 'technique' && SERIES_TECHNIQUES[serie]) return `${nom} ${serie} (${SERIES_TECHNIQUES[serie]})`;
  return `${nom} ${serie}`;
}

const P = {};

// ------------------------------------------------------------------
// PREMIER CYCLE
// ------------------------------------------------------------------

P['6e'] = `SA n°1 : Configurations de l'espace
- Solides usuels : cube, pavé droit, cylindre droit, prisme droit (faces, arêtes, sommets)
- Représentation du cube et du pavé droit en perspective cavalière
- Patrons du cube et du pavé droit
- Aire latérale et aire totale du cube et du pavé droit
- Volume du cube et du pavé droit ; unités de volume et de capacité
SA n°2 : Configurations du plan
- Point, droite, demi-droite, segment ; points alignés
- Droites sécantes, parallèles, perpendiculaires (tracés à la règle et à l'équerre)
- Longueur d'un segment, milieu ; distance d'un point à une droite
- Cercle et disque : centre, rayon, diamètre, corde, arc
- Angles : vocabulaire, mesure au rapporteur, angles aigu, droit, obtus, plat ; bissectrice
- Triangles particuliers (isocèle, équilatéral, rectangle) : construction
- Quadrilatères particuliers : rectangle, losange, carré (propriétés et construction)
- Périmètres et aires : carré, rectangle, triangle, disque ; longueur du cercle
SA n°3 : Applications du plan
- Symétrie orthogonale (par rapport à une droite) : symétrique d'un point, d'un segment, d'une figure
- Propriétés de conservation : longueurs, angles, alignement
- Axes de symétrie des figures usuelles
- Médiatrice d'un segment
SA n°4 : Organisation des données
- Nombres entiers naturels : écriture, lecture, comparaison, rangement
- Nombres décimaux : écriture, comparaison, rangement, valeur approchée, arrondi
- Opérations sur les entiers et les décimaux ; division euclidienne ; priorités opératoires
- Multiples et diviseurs ; critères de divisibilité par 2, 3, 4, 5, 9, 10
- Fractions : écriture fractionnaire, fractions égales, simplification, comparaison, fraction d'une quantité
- Proportionnalité : tableaux, coefficient, pourcentages, échelles
- Repérage sur une droite graduée et dans le plan
- Lecture et construction de tableaux et de diagrammes (bâtons, circulaires)
- Grandeurs et mesures : longueurs, masses, durées, monnaie (FCFA), conversions`;

P['5e'] = `SA n°1 : Configurations de l'espace
- Prisme droit et cylindre de révolution : description, perspective cavalière, patrons
- Aire latérale et aire totale du prisme droit et du cylindre
- Volume du prisme droit et du cylindre de révolution
SA n°2 : Configurations du plan
- Angles adjacents, complémentaires, supplémentaires, opposés par le sommet
- Angles formés par deux parallèles et une sécante (alternes-internes, correspondants)
- Triangle : inégalité triangulaire, construction, somme des angles
- Droites remarquables du triangle : médiatrices, hauteurs, médianes, bissectrices ; cercle circonscrit
- Parallélogramme : définition, propriétés ; parallélogrammes particuliers
- Aires du parallélogramme, du triangle et du trapèze
SA n°3 : Applications du plan
- Symétrie centrale : construction, propriétés de conservation
- Centre de symétrie d'une figure
- Comparaison de la symétrie centrale et de la symétrie orthogonale
SA n°4 : Organisation des données
- Nombres décimaux relatifs : comparaison, addition, soustraction, multiplication, division
- Repérage dans le plan : coordonnées d'un point
- Fractions : addition, soustraction, multiplication ; quotients
- Calcul littéral : expressions littérales, réduction, distributivité
- Équations simples du premier degré (x + a = b ; ax = b)
- Proportionnalité : représentation graphique, pourcentages, vitesse moyenne
- Statistique : effectifs, fréquences, diagrammes, moyenne`;

P['4e'] = `SA n°1 : Configurations de l'espace
- Pyramide et cône de révolution : description, représentation, patrons
- Volume de la pyramide et du cône de révolution
- Positions relatives de droites et de plans (à partir du cube et du pavé droit)
SA n°2 : Configurations du plan
- Droite des milieux dans un triangle (propriétés et réciproques)
- Propriété de Thalès dans le triangle ; proportionnalité des longueurs
- Triangle rectangle : propriété de Pythagore et sa réciproque
- Cercle circonscrit au triangle rectangle
- Cosinus d'un angle aigu dans un triangle rectangle
- Tangente à un cercle ; distance d'un point à une droite ; propriété de la bissectrice
SA n°3 : Applications du plan
- Translation : définition, construction, propriétés
- Vecteurs : égalité de deux vecteurs, somme de deux vecteurs, relation de Chasles
- Composée de deux symétries centrales ; composée de deux symétries orthogonales d'axes parallèles
SA n°4 : Organisation des données
- Puissances d'exposant entier relatif ; écriture scientifique
- Racine carrée d'un nombre positif
- Calcul littéral : développement, factorisation, identités remarquables
- Équations et inéquations du premier degré à une inconnue ; mise en équation
- Proportionnalité et application linéaire ; pourcentages
- Statistique : regroupement en classes, effectifs cumulés, moyenne, histogramme`;

P['3e'] = `SA n°1 : Configurations de l'espace
- Sphère et boule : aire et volume
- Sections planes du cube, du pavé droit, du cylindre, de la pyramide, du cône et de la sphère
- Agrandissement et réduction : effet sur les longueurs, les aires et les volumes
- Tronc de pyramide et tronc de cône : volume
SA n°2 : Configurations du plan
- Propriété de Thalès et sa réciproque
- Relations trigonométriques dans le triangle rectangle : cosinus, sinus, tangente
- Angles inscrits et angles au centre ; polygones réguliers
- Repère orthonormé : coordonnées du milieu, distance de deux points
- Équation d'une droite ; droites parallèles, droites perpendiculaires ; demi-plans
SA n°3 : Applications du plan
- Vecteurs : coordonnées, colinéarité, somme, produit d'un vecteur par un réel
- Translations, symétries, rotations : images de figures, propriétés de conservation
SA n°4 : Organisation des données
- Racines carrées : propriétés, calculs, rendre rationnel un dénominateur
- Calcul littéral : identités remarquables, factorisation, équations produits, équations x² = a
- Fractions rationnelles : condition d'existence, simplification
- Inéquations du premier degré ; systèmes de deux équations à deux inconnues (méthodes algébriques et graphique)
- Applications affines et linéaires : représentation graphique, applications affines par intervalles
- Statistique : séries à caractère quantitatif, effectifs et fréquences cumulés, moyenne, médiane, mode`;

// ------------------------------------------------------------------
// SECOND CYCLE — ENSEIGNEMENT GÉNÉRAL
// ------------------------------------------------------------------

P['2nde-A'] = `SA n°1 : Organisation des données
- Calcul dans ℝ : puissances, racines carrées, valeur absolue, intervalles
- Pourcentages, proportionnalité, échelles
- Équations et inéquations du premier degré ; systèmes de deux équations à deux inconnues
- Fonctions affines : représentation graphique, sens de variation
- Statistique : séries à une variable, moyenne, mode, médiane, diagrammes
SA n°2 : Lieux géométriques
- Vecteurs du plan : somme, produit par un réel, colinéarité
- Repérage : coordonnées, équation de droite
- Configurations usuelles : Thalès, Pythagore, trigonométrie dans le triangle rectangle`;

P['2nde-B'] = `SA n°1 : Organisation des données
- Calcul dans ℝ : puissances, racines carrées, valeur absolue, intervalles, encadrements
- Pourcentages : augmentations, réductions, taux successifs
- Polynômes du premier et du second degré : factorisation
- Équations et inéquations du premier et du second degré ; systèmes linéaires
- Fonctions numériques : généralités, fonctions de référence, fonctions affines par intervalles
- Statistique : séries à une variable, paramètres de position et de dispersion
SA n°2 : Lieux géométriques
- Vecteurs du plan et repérage ; équations de droites
- Configurations usuelles du plan (Thalès, Pythagore, trigonométrie)`;

P['2nde-C'] = `SA n°1 : Configurations de l'espace
- Droites et plans de l'espace : règles d'incidence, positions relatives
- Parallélisme dans l'espace : droites, droite et plan, plans parallèles
- Orthogonalité dans l'espace : droites orthogonales, droite perpendiculaire à un plan
- Sections planes du cube et du tétraèdre ; aires et volumes des solides usuels
SA n°2 : Organisation des données
- Ensembles de nombres ℕ, ℤ, 𝔻, ℚ, ℝ ; intervalles, valeur absolue, encadrements
- Calcul algébrique : puissances, racines carrées, identités remarquables
- Polynômes : égalité, factorisation, division par x − a ; fractions rationnelles
- Équations et inéquations du premier et du second degré ; équations avec valeur absolue
- Systèmes d'équations et d'inéquations linéaires à deux inconnues
- Fonctions numériques : ensemble de définition, sens de variation, parité, fonctions de référence, représentations graphiques
- Statistique : séries à une variable, paramètres de position et de dispersion
SA n°3 : Lieux géométriques
- Vecteurs du plan : opérations, colinéarité, bases et repères
- Barycentre de deux et de trois points pondérés
- Repérage : équations de droites, conditions de parallélisme et d'orthogonalité
- Angles orientés et trigonométrie : cercle trigonométrique, cosinus, sinus et tangente d'un réel
- Transformations du plan : translations, homothéties, symétries, rotations
- Lieux géométriques : médiatrice, bissectrice, cercle ; recherche de lieux`;

P['2nde-D'] = `SA n°1 : Configurations de l'espace
- Droites et plans de l'espace : positions relatives, parallélisme, orthogonalité
- Aires et volumes des solides usuels ; sections planes simples
SA n°2 : Organisation des données
- Calcul dans ℝ : intervalles, valeur absolue, puissances, racines carrées
- Polynômes et fractions rationnelles : factorisation, signe
- Équations et inéquations du premier et du second degré ; systèmes linéaires
- Fonctions numériques : généralités, fonctions de référence, représentations graphiques
- Statistique : séries à une variable, paramètres de position et de dispersion
SA n°3 : Lieux géométriques
- Vecteurs du plan, repérage, équations de droites
- Barycentre de deux points
- Angles orientés et trigonométrie : cercle trigonométrique
- Transformations du plan : translations, homothéties, symétries, rotations`;

P['1ere-A1'] = `SA n°1 : Organisation des données
- Polynômes et second degré : équations, inéquations, signe du trinôme
- Fonctions numériques : dérivée, sens de variation, étude de fonctions polynômes simples
- Suites arithmétiques et suites géométriques
- Dénombrement : principe multiplicatif, arrangements, combinaisons
- Statistique : séries à une variable, paramètres de position et de dispersion
SA n°2 : Lieux géométriques
- Repérage dans le plan, équations de droites et de cercles
- Systèmes linéaires et programmation linéaire (régionnement du plan)`;

P['1ere-A2'] = `SA n°1 : Organisation des données
- Calcul numérique : pourcentages, proportionnalité, taux d'évolution
- Équations et inéquations du premier et du second degré
- Fonctions affines et fonction carré : représentations graphiques
- Suites arithmétiques et suites géométriques (initiation)
- Statistique : tableaux, diagrammes, moyenne, médiane, écart type
SA n°2 : Lieux géométriques
- Repérage dans le plan ; régionnement du plan`;

P['1ere-B'] = `SA n°1 : Organisation des données
- Second degré : équations, inéquations, signe du trinôme
- Fonctions numériques : limites, dérivation, étude de fonctions polynômes et rationnelles
- Suites arithmétiques et géométriques ; intérêts simples et composés
- Statistique à une variable et initiation aux séries à deux variables
- Dénombrement
SA n°2 : Lieux géométriques
- Repérage, équations de droites ; systèmes linéaires
- Programmation linéaire : régionnement du plan, optimisation`;

P['1ere-C'] = `SA n°1 : Configurations de l'espace
- Vecteurs de l'espace, repérage dans l'espace
- Barycentre dans l'espace
- Orthogonalité dans l'espace ; produit scalaire dans l'espace
SA n°2 : Organisation des données
- Polynômes ; second degré : équations, inéquations, signe du trinôme
- Fonctions numériques : limites, continuité, dérivation, étude et représentation graphique
- Suites numériques : généralités, suites arithmétiques et géométriques, raisonnement par récurrence
- Dénombrement : arrangements, permutations, combinaisons, formule du binôme
- Trigonométrie : formules d'addition et de duplication, équations et inéquations trigonométriques
- Statistique
SA n°3 : Lieux géométriques
- Barycentre et lignes de niveau
- Produit scalaire dans le plan : propriétés, relations métriques dans le triangle, équations de cercles
- Angles orientés de vecteurs
- Rotations, homothéties ; isométries du plan ; composées
- Lieux géométriques`;

P['1ere-D'] = `SA n°1 : Configurations de l'espace
- Vecteurs de l'espace, repérage dans l'espace
- Orthogonalité dans l'espace
SA n°2 : Organisation des données
- Second degré : équations, inéquations, signe du trinôme
- Fonctions numériques : limites, continuité, dérivation, étude et représentation graphique
- Suites numériques : suites arithmétiques et géométriques
- Dénombrement : arrangements, permutations, combinaisons
- Trigonométrie : formules d'addition, équations trigonométriques
- Statistique
SA n°3 : Lieux géométriques
- Barycentre et lignes de niveau
- Produit scalaire dans le plan ; équations de cercles
- Angles orientés de vecteurs
- Rotations et homothéties`;

P['Tle-A1'] = `SA n°1 : Organisation des données
- Suites numériques : suites arithmétiques et géométriques, comportement à l'infini
- Fonctions numériques : limites, dérivées, étude de fonctions ; fonction logarithme népérien
- Dénombrement et probabilités : probabilité d'un événement, équiprobabilité
- Statistique : séries à deux variables, ajustement linéaire
SA n°2 : Lieux géométriques
- Programmation linéaire`;

P['Tle-A2'] = `SA n°1 : Organisation des données
- Suites arithmétiques et suites géométriques ; applications (épargne, population)
- Pourcentages et taux d'évolution
- Fonctions numériques : étude de fonctions simples, lecture graphique
- Statistique : séries à une et à deux variables
- Dénombrement et probabilités simples`;

P['Tle-B'] = `SA n°1 : Organisation des données
- Fonctions numériques : limites, continuité, dérivation ; fonctions logarithme népérien et exponentielle
- Primitives et calcul intégral (initiation)
- Suites numériques ; mathématiques financières : intérêts composés, valeur actuelle, annuités
- Statistique à deux variables : ajustement linéaire, coefficient de corrélation
- Probabilités : dénombrement, probabilité conditionnelle, variable aléatoire
SA n°2 : Lieux géométriques
- Programmation linéaire ; systèmes linéaires`;

P['Tle-C'] = `SA n°1 : Configurations de l'espace
- Produit scalaire et produit vectoriel dans l'espace ; produit mixte
- Droites et plans de l'espace : représentations paramétriques, équations cartésiennes, distances
- Transformations de l'espace : translations, homothéties, symétries
SA n°2 : Organisation des données
- Limites, continuité, théorème des valeurs intermédiaires ; bijection et fonction réciproque
- Dérivabilité ; étude de fonctions
- Fonctions logarithme népérien, exponentielle, puissances ; croissances comparées
- Primitives et calcul intégral ; calcul d'aires et de volumes
- Équations différentielles linéaires du premier et du second ordre à coefficients constants
- Suites numériques : convergence, suites adjacentes, suites récurrentes
- Arithmétique : divisibilité dans ℤ, congruences, PGCD, PPCM, théorèmes de Bézout et de Gauss, nombres premiers
- Probabilités : probabilités conditionnelles, indépendance, variables aléatoires, loi binomiale
- Statistique à deux variables : ajustement linéaire, covariance, coefficient de corrélation
SA n°3 : Lieux géométriques
- Nombres complexes : formes algébrique, trigonométrique et exponentielle ; racines n-ièmes ; équations dans ℂ
- Nombres complexes et géométrie
- Isométries planes ; similitudes planes directes et indirectes
- Coniques : parabole, ellipse, hyperbole (foyer, directrice, excentricité, équations réduites)
- Barycentre et lignes de niveau`;

P['Tle-D'] = `SA n°1 : Configurations de l'espace
- Produit scalaire et produit vectoriel dans l'espace
- Droites et plans de l'espace : représentations paramétriques, équations cartésiennes, distances
SA n°2 : Organisation des données
- Limites, continuité, dérivabilité ; bijection et fonction réciproque
- Fonctions logarithme népérien et exponentielle ; étude de fonctions
- Primitives et calcul intégral ; calcul d'aires
- Équations différentielles (y' = ay + b ; y'' + ay' + by = 0)
- Suites numériques : convergence, suites récurrentes
- Probabilités : probabilités conditionnelles, indépendance, variables aléatoires, loi binomiale
- Statistique à deux variables : ajustement linéaire, coefficient de corrélation
SA n°3 : Lieux géométriques
- Nombres complexes : formes algébrique, trigonométrique et exponentielle ; équations dans ℂ
- Nombres complexes et transformations du plan
- Similitudes planes directes`;

// ------------------------------------------------------------------
// ENSEIGNEMENT TECHNIQUE
// ------------------------------------------------------------------

const TECH_F = {
  '2nde': `Partie 1 : Algèbre et analyse
- Calcul numérique et algébrique : puissances, racines carrées, écriture scientifique, unités
- Équations et inéquations du premier et du second degré ; systèmes linéaires
- Fonctions de référence ; fonctions affines ; lecture graphique
- Proportionnalité et pourcentages appliqués aux situations techniques
Partie 2 : Géométrie et trigonométrie
- Vecteurs du plan et repérage
- Trigonométrie : cercle trigonométrique, résolution du triangle rectangle et du triangle quelconque
- Géométrie plane et dans l'espace : aires et volumes de pièces usuelles
Partie 3 : Statistique
- Séries statistiques à une variable`,
  '1ere': `Partie 1 : Algèbre et analyse
- Second degré ; polynômes
- Fonctions numériques : limites, dérivées, étude de fonctions
- Suites arithmétiques et géométriques
- Fonctions circulaires (sinus, cosinus) ; formules trigonométriques
- Nombres complexes (initiation)
Partie 2 : Géométrie
- Produit scalaire ; géométrie dans l'espace (sections, volumes)
Partie 3 : Statistique
- Séries à une variable ; séries à deux variables (initiation)`,
  'Tle': `Partie 1 : Algèbre et analyse
- Nombres complexes : formes algébrique, trigonométrique et exponentielle
- Fonctions logarithme népérien et exponentielle ; étude de fonctions
- Primitives et calcul intégral ; valeur moyenne, valeur efficace
- Équations différentielles du premier et du second ordre
- Suites numériques
Partie 2 : Géométrie
- Géométrie dans l'espace : produit vectoriel, volumes, centres de gravité
Partie 3 : Statistique et probabilités
- Statistique à deux variables ; probabilités, loi binomiale`,
};

const TECH_G = {
  '2nde': `Partie 1 : Calcul commercial et algèbre
- Calcul numérique ; proportionnalité ; pourcentages (TVA, remises, marges)
- Équations et inéquations du premier degré ; systèmes de deux équations
- Fonctions affines ; lecture et représentation graphiques
Partie 2 : Mathématiques financières
- Intérêts simples ; escompte commercial
Partie 3 : Statistique
- Séries statistiques à une variable : tableaux, diagrammes, moyenne, médiane, écart type`,
  '1ere': `Partie 1 : Algèbre et analyse
- Second degré ; fonctions numériques et dérivées ; étude de fonctions (coût, recette, bénéfice)
- Suites arithmétiques et géométriques
- Programmation linéaire
Partie 2 : Mathématiques financières
- Intérêts composés ; valeur acquise, valeur actuelle
Partie 3 : Statistique et dénombrement
- Statistique à une variable ; dénombrement`,
  'Tle': `Partie 1 : Analyse
- Fonctions logarithme népérien et exponentielle ; applications économiques (élasticité, coût marginal)
- Suites numériques
Partie 2 : Mathématiques financières
- Annuités ; emprunts indivis, tableaux d'amortissement ; rentabilité d'un investissement
Partie 3 : Statistique et probabilités
- Statistique à deux variables : ajustement linéaire (méthode des moindres carrés)
- Probabilités ; loi binomiale
- Programmation linéaire`,
};

const NOTES_TECH = {
  E: 'Série E : programme proche de la série C (géométrie et analyse approfondies), avec des applications techniques.',
  F1: 'Série F1 : applications à la construction mécanique (pièces, volumes, cinématique).',
  F2: 'Série F2 : applications à l\'électronique (signaux sinusoïdaux, complexes, valeurs moyenne et efficace, équations différentielles des circuits).',
  F3: 'Série F3 : applications à l\'électrotechnique (impédances complexes, puissances, régimes transitoires des circuits RL et RC).',
  F4: 'Série F4 : applications au génie civil (métrés, surfaces, volumes, pentes, résistance des ouvrages).',
  G1: 'Série G1 : applications aux techniques administratives (calculs commerciaux, statistiques de gestion).',
  G2: 'Série G2 : applications aux techniques quantitatives de gestion (mathématiques financières, statistique, programmation linéaire).',
  G3: 'Série G3 : applications aux techniques commerciales (prix, marges, statistiques de ventes, prévisions).',
};

for (const classe of ['2nde', '1ere', 'Tle']) {
  for (const serie of ['F1', 'F2', 'F3', 'F4']) P[`tech-${classe}-${serie}`] = TECH_F[classe];
  for (const serie of ['G1', 'G2', 'G3']) P[`tech-${classe}-${serie}`] = TECH_G[classe];
  P[`tech-${classe}-E`] = P[`${classe}-C`];
}

export const PROGRAMMES_DEFAUT = P;

export function noteSerie(ens, serie) {
  return ens === 'technique' ? (NOTES_TECH[serie] || '') : '';
}

/** Découpe le texte d'un programme en parties { titre, contenus[] }. */
export function analyserProgramme(texte) {
  const parties = [];
  let courante = null;
  for (const brute of (texte || '').split('\n')) {
    const ligne = brute.trim();
    if (!ligne) continue;
    if (/^[-•*]\s*/.test(ligne)) {
      const contenu = ligne.replace(/^[-•*]\s*/, '').trim();
      if (!contenu) continue;
      if (!courante) { courante = { titre: 'Contenus', contenus: [] }; parties.push(courante); }
      courante.contenus.push(contenu);
    } else {
      courante = { titre: ligne.replace(/^#+\s*/, ''), contenus: [] };
      parties.push(courante);
    }
  }
  return parties;
}

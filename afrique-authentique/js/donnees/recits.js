/* ==========================================================================
   AFRIQUE AUTHENTIQUE — LES RÉCITS (articles et portraits)
   --------------------------------------------------------------------------
   Chaque récit est une « fiche » entre accolades { … }. Il s'affiche :
   - dans sa rubrique (aux-origines.html, savoir-faire.html…),
   - sur l'accueil (les plus récents),
   - et sur sa propre page : article.html?id=identifiant-du-recit
   Le PREMIER récit est commenté ligne par ligne : il sert de modèle.
   Pour ajouter un récit : copiez un bloc { … }, collez-le, changez l'id
   (sans espaces ni accents) et les textes.

   Les textes des paragraphes peuvent contenir un peu de HTML :
   <em>italique</em>, <strong>gras</strong>, <a href="…">lien</a>.

   Contenus d'exemple : textes rédigés pour la maquette, à relire et
   remplacer par les contenus définitifs de la cliente.
   ========================================================================== */

const ARTICLES = [ // Ouvre la liste de tous les récits

  { // ===== RÉCIT MODÈLE (commenté) =====
    id: 'abomey-memoire-cousue', // Identifiant unique, utilisé dans l'adresse : article.html?id=abomey-memoire-cousue
    rubrique: 'aux-origines', // Rubrique : 'aux-origines', 'figures-et-horizons', 'savoir-faire' ou 'evenements'
    type: 'recit', // 'recit' (article) ou 'portrait' (affiche en plus une fiche d'identité)
    une: true, // true = mis « À la une » sur l'accueil (un seul récit à la fois)
    titre: 'Abomey, la mémoire cousue des rois', // Titre du récit
    chapo: "Sur les tentures appliquées d'Abomey, chaque roi du Danxomè a laissé un emblème. Lire ces toiles, c'est remonter le fil d'un royaume.", // Introduction (affichée sous le titre et sur les cartes)
    pays: 'Bénin', // Pays ou région (sert aussi aux filtres)
    auteur: 'La rédaction', // Signature
    date: '2026-09-18', // Date de publication au format AAAA-MM-JJ (sert à trier les récits)
    image: '', // Photo principale : chemin du fichier (ex. 'assets/photos/abomey.jpg'). Vide = composition graphique
    alt: '', // Description de la photo pour les personnes malvoyantes et Google
    motif: 'kuba', // Motif graphique tant qu'il n'y a pas de photo : bogolan, kente, adire, ndebele, kuba, cauris
    teinte: 'laterite', // Couleur : laterite, ocre, indigo, palme, kola, sable
    forme: 'soleil', // Forme : soleil, arche, losange, demi, bandes, aucune
    corps: [ // Le texte du récit, bloc par bloc (dans l'ordre d'affichage)
      { type: 'p', texte: "À Abomey, l'histoire ne s'est pas seulement transmise par la parole. Elle s'est aussi cousue. Sur des toiles de coton aux fonds sombres, des figures découpées dans des tissus de couleur racontent les règnes successifs du royaume du Danxomè, que l'on a longtemps écrit Dahomey." }, // 'p' = paragraphe
      { type: 'p', texte: "Ces tentures appliquées étaient destinées à la cour : elles paraient les cérémonies, accompagnaient les sorties du roi, rappelaient ses victoires. Elles faisaient office d'archives que l'on pouvait déplier." }, // Paragraphe
      { type: 'h2', texte: 'Un emblème pour chaque règne' }, // 'h2' = intertitre
      { type: 'p', texte: "Chaque souverain choisissait des symboles associés à ses noms forts et à ses devises. Le buffle de Ghézo, le lion de Glèlè, le requin de Béhanzin : repris sur les tentures, les bas-reliefs des palais et les objets de cour, ces emblèmes fonctionnaient comme une signature." }, // Paragraphe
      { type: 'citation', texte: 'Pour qui sait les lire, chaque tenture est un chapitre.', source: '' }, // 'citation' = phrase mise en exergue ; « source » facultative
      { type: 'h2', texte: 'Des ateliers devenus lignées' }, // Intertitre
      { type: 'p', texte: "La confection était confiée à des familles d'artisans attachées au palais, qui se transmettaient le métier de génération en génération. À Abomey, des ateliers perpétuent aujourd'hui encore la technique de l'appliqué, entre pièces traditionnelles et créations contemporaines." }, // Paragraphe
      { type: 'figure', legende: "Inspiré des tentures appliquées : des emblèmes découpés puis cousus sur le coton.", image: '', alt: '', motif: 'kuba', teinte: 'kola', forme: 'losange' }, // 'figure' = image dans le texte, avec sa légende
      { type: 'h2', texte: 'Les palais, une mémoire inscrite' }, // Intertitre
      { type: 'p', texte: "Les palais royaux d'Abomey sont inscrits sur la Liste du patrimoine mondial de l'UNESCO depuis 1985. Ils s'étendent sur 47 hectares au cœur de la ville et témoignent d'un royaume qui fut l'un des plus puissants de la côte ouest-africaine, du XVII<sup>e</sup> à la fin du XIX<sup>e</sup> siècle." }, // Paragraphe
      { type: 'p', texte: 'Pour qui sait les lire, chaque tenture est un chapitre. Prenez le temps de vous asseoir devant : les figures, d’abord décoratives, deviennent peu à peu des phrases.' }, // Dernier paragraphe
    ], // Fin du corps du récit
  }, // ===== Fin du récit modèle =====

  { // Récit : Sankofa
    id: 'sankofa', // Identifiant
    rubrique: 'aux-origines', // Rubrique
    type: 'recit', // Article
    titre: "Sankofa : revenir chercher ce que l'on a laissé derrière soi", // Titre
    chapo: "Un oiseau qui tourne la tête vers son dos, un œuf dans le bec. Chez les Akan, ce symbole adinkra dit une chose simple : il n'est jamais trop tard pour reprendre ce que l'on a oublié.", // Introduction
    pays: 'Ghana', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-08-30', // Date
    image: '', alt: '', motif: 'adire', teinte: 'kola', forme: 'arche', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "Le mot vient du twi, la langue des Akan du Ghana. <em>San</em> : revenir. <em>Ko</em> : aller. <em>Fa</em> : prendre. Sankofa, c'est le mouvement de celui qui retourne sur ses pas pour récupérer ce qu'il a laissé tomber." }, // Paragraphe
      { type: 'p', texte: 'Le proverbe complet le formule ainsi : « <em>Se wo were fi na wosankofa a yenkyi</em> ».' }, // Paragraphe
      { type: 'citation', texte: "Il n'y a pas de mal à revenir chercher ce que l'on a oublié.", source: 'Proverbe akan' }, // Citation
      { type: 'h2', texte: 'Un alphabet de symboles' }, // Intertitre
      { type: 'p', texte: "Sankofa appartient à la grande famille des symboles adinkra. Chacun porte un proverbe, une valeur, un conseil. Traditionnellement, on les imprimait sur des étoffes à l'aide de tampons taillés dans des calebasses, trempés dans une encre sombre obtenue à partir d'écorce bouillie." }, // Paragraphe
      { type: 'p', texte: "Deux dessins coexistent : l'oiseau qui regarde en arrière, et une forme stylisée qui rappelle un cœur. Les deux disent la même chose." }, // Paragraphe
      { type: 'h2', texte: 'Ntonso, le village des tampons' }, // Intertitre
      { type: 'p', texte: "Près de Kumasi, le village de Ntonso est réputé pour la fabrication des étoffes adinkra. On peut y voir sculpter les tampons, préparer l'encre et imprimer les tissus, motif après motif." }, // Paragraphe
      { type: 'p', texte: "Sankofa est devenu bien plus qu'un motif : un mot de ralliement pour celles et ceux qui, sur le continent comme dans la diaspora, interrogent leurs racines pour mieux choisir leur route." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Récit : les griots
    id: 'griot-bibliotheque-vivante', // Identifiant
    rubrique: 'aux-origines', // Rubrique
    type: 'recit', // Article
    titre: 'Le griot, bibliothèque vivante', // Titre
    chapo: "Généalogiste, historien, musicien, médiateur : dans l'aire mandingue, le griot porte la mémoire des familles et des empires. Sa voix est une archive.", // Introduction
    pays: 'Mali · Guinée · Sénégal', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-07-12', // Date
    image: '', alt: '', motif: 'cauris', teinte: 'ocre', forme: 'demi', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "On les appelle griots en français, <em>jeli</em> ou <em>djéli</em> dans les langues mandingues. Leur rôle dépasse de loin celui de chanteur : ils connaissent les lignées, récitent les généalogies, rappellent les alliances et apaisent les conflits." }, // Paragraphe
      { type: 'p', texte: "Leur savoir se transmet au sein des familles, accompagné d'instruments qui lui sont attachés : la kora, le balafon, le ngoni." }, // Paragraphe
      { type: 'h2', texte: 'La voix de Soundiata' }, // Intertitre
      { type: 'p', texte: "L'épopée de Soundiata Keïta, fondateur de l'empire du Mali au XIII<sup>e</sup> siècle, nous est parvenue grâce à eux. La tradition rapporte que Balla Fasséké Kouyaté fut le griot de Soundiata ; aujourd'hui encore, la famille Kouyaté demeure l'une des grandes lignées de griots." }, // Paragraphe
      { type: 'citation', texte: "En Afrique, quand un vieillard meurt, c'est une bibliothèque qui brûle.", source: 'Amadou Hampâté Bâ, UNESCO, 1960' }, // Citation
      { type: 'h2', texte: 'Une mémoire qui se réinvente' }, // Intertitre
      { type: 'p', texte: "La parole des griots circule désormais aussi sur les ondes, dans les studios et sur les scènes du monde entier. La forme change ; la fonction demeure : relier les vivants à ceux qui les ont précédés." }, // Paragraphe
      { type: 'p', texte: "Écouter un griot, c'est accepter que l'histoire se raconte en musique, avec des silences, des reprises et des détours. Une autre manière de faire de l'histoire, qui a fait ses preuves depuis huit siècles." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Portrait : Yaa Asantewaa
    id: 'yaa-asantewaa', // Identifiant
    rubrique: 'figures-et-horizons', // Rubrique
    type: 'portrait', // Portrait : affiche une fiche d'identité
    titre: "Yaa Asantewaa, la reine mère qui refusa de livrer le Tabouret d'or", // Titre
    chapo: "En 1900, quand le gouverneur britannique exige de s'asseoir sur le trône sacré des Ashanti, une femme d'Ejisu prend la tête de la résistance.", // Introduction
    pays: 'Ghana', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-09-05', // Date
    image: '', alt: '', motif: 'kente', teinte: 'ocre', forme: 'arche', // Visuel
    fiche: [ // Fiche d'identité (seulement pour les portraits) : [intitulé, valeur]
      ['Nom', 'Yaa Asantewaa'], // Ligne de la fiche
      ['Époque', 'vers 1840 – 1921'], // Ligne
      ['Lieu', 'Ejisu, royaume ashanti'], // Ligne
      ['Rôle', "Reine mère d'Ejisu, cheffe de guerre"], // Ligne
      ['À retenir', "La guerre du Tabouret d'or, 1900"], // Ligne
    ], // Fin de la fiche
    corps: [ // Texte
      { type: 'p', texte: "Le Tabouret d'or, <em>Sika Dwa Kofi</em>, n'est pas un siège ordinaire. Pour les Ashanti, il abrite l'âme de la nation : personne ne s'y assoit, pas même le roi. Aussi, lorsqu'en mars 1900 le gouverneur britannique Frederick Hodgson réclame le tabouret pour s'y installer, l'affront est immense." }, // Paragraphe
      { type: 'p', texte: "Le roi Prempeh I<sup>er</sup> a été arrêté et exilé par les Britanniques en 1896, avec plusieurs dignitaires — parmi eux, le petit-fils de Yaa Asantewaa, chef d'Ejisu. Les hommes hésitent. Elle, non." }, // Paragraphe
      { type: 'citation', texte: 'Si vous, hommes de l’Ashanti, ne voulez pas avancer, nous le ferons. Nous, les femmes, nous combattrons.', source: 'Paroles attribuées à Yaa Asantewaa, 1900' }, // Citation
      { type: 'h2', texte: "La guerre du Tabouret d'or" }, // Intertitre
      { type: 'p', texte: "Elle prend la tête d'une résistance armée qui assiège pendant plusieurs mois le fort britannique de Kumasi. Le soulèvement est finalement réprimé ; Yaa Asantewaa est capturée puis exilée aux Seychelles, où elle meurt en 1921." }, // Paragraphe
      { type: 'p', texte: "Mais le Tabouret d'or, lui, n'a jamais été livré. Caché, il a traversé la période coloniale et demeure aujourd'hui le cœur symbolique du royaume ashanti." }, // Paragraphe
      { type: 'h2', texte: "Une figure pour aujourd'hui" }, // Intertitre
      { type: 'p', texte: "Au Ghana, son nom est porté par des écoles, dont un lycée de jeunes filles à Kumasi, et son histoire est enseignée comme un modèle de courage." }, // Paragraphe
      { type: 'p', texte: "Elle rappelle que, dans de nombreuses sociétés africaines, les femmes n'ont pas attendu qu'on leur fasse une place dans l'histoire : elles l'ont prise." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du portrait

  { // Portrait : Béhanzin
    id: 'behanzin', // Identifiant
    rubrique: 'figures-et-horizons', // Rubrique
    type: 'portrait', // Portrait
    titre: 'Béhanzin, le roi requin', // Titre
    chapo: "Dernier grand roi du Danxomè indépendant, Béhanzin affronta l'armée coloniale française pendant quatre ans. Son emblème : un requin.", // Introduction
    pays: 'Bénin', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-08-14', // Date
    image: '', alt: '', motif: 'kuba', teinte: 'indigo', forme: 'soleil', // Visuel
    fiche: [ // Fiche d'identité
      ['Nom', 'Béhanzin (Gbèhanzin)'], // Ligne
      ['Règne', '1889 – 1894'], // Ligne
      ['Lieu', 'Abomey, royaume du Danxomè'], // Ligne
      ['Rôle', 'Roi'], // Ligne
      ['Emblèmes', "Le requin, l'œuf"], // Ligne
    ], // Fin de la fiche
    corps: [ // Texte
      { type: 'p', texte: "Son nom est tiré d'une formule : « <em>Gbè hin azin bo ayi djlè</em> », le monde tient l'œuf que la terre désire. Son autre emblème, le requin, dit la menace venue de la mer et la volonté de la repousser." }, // Paragraphe
      { type: 'p', texte: "Il accède au trône en 1889, au moment où la France cherche à étendre son contrôle sur la côte, notamment autour de Cotonou et de Porto-Novo." }, // Paragraphe
      { type: 'h2', texte: 'Quatre ans de résistance' }, // Intertitre
      { type: 'p', texte: "Deux guerres l'opposent aux troupes françaises, en 1890 puis à partir de 1892. Les soldats du Danxomè, parmi lesquels les guerrières agojie, opposent une résistance acharnée. Face à une armée mieux équipée, Abomey finit par tomber ; plutôt que de laisser l'ennemi s'emparer des palais, Béhanzin y fait mettre le feu avant de se replier." }, // Paragraphe
      { type: 'p', texte: "En janvier 1894, il se rend. Il est déporté en Martinique, puis en Algérie, où il meurt en 1906. Ses restes sont rapatriés au Dahomey en 1928." }, // Paragraphe
      { type: 'citation', texte: "Le monde tient l'œuf que la terre désire.", source: 'Sens du nom fort de Béhanzin' }, // Citation
      { type: 'h2', texte: 'Le retour des trésors' }, // Intertitre
      { type: 'p', texte: "En 2021, la France a restitué au Bénin vingt-six trésors royaux d'Abomey, emportés lors de la conquête de 1892. Parmi eux, une statue mi-homme mi-requin : Béhanzin, tel qu'il voulait être représenté." }, // Paragraphe
      { type: 'p', texte: "Au Bénin, son nom est donné à des rues, des écoles et des places, et son histoire continue d'inspirer artistes, écrivains et cinéastes." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du portrait

  { // Portrait : Kimpa Vita
    id: 'kimpa-vita', // Identifiant
    rubrique: 'figures-et-horizons', // Rubrique
    type: 'portrait', // Portrait
    titre: 'Kimpa Vita, la prophétesse qui voulait réunifier le Kongo', // Titre
    chapo: "À vingt ans à peine, Dona Beatriz Kimpa Vita prêche la réconciliation d'un royaume déchiré. Elle le paiera de sa vie en 1706.", // Introduction
    pays: 'Angola · RD Congo', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-07-28', // Date
    image: '', alt: '', motif: 'kuba', teinte: 'palme', forme: 'arche', // Visuel
    fiche: [ // Fiche d'identité
      ['Nom', 'Kimpa Vita (Dona Beatriz)'], // Ligne
      ['Époque', 'vers 1684 – 1706'], // Ligne
      ['Lieu', 'Royaume du Kongo'], // Ligne
      ['Rôle', 'Prophétesse, réformatrice'], // Ligne
      ['Mouvement', 'Les Antoniens'], // Ligne
    ], // Fin de la fiche
    corps: [ // Texte
      { type: 'p', texte: "À la fin du XVII<sup>e</sup> siècle, le royaume du Kongo sort exsangue de décennies de guerres civiles. Sa capitale, Mbanza Kongo — que les Portugais appellent São Salvador — est abandonnée, et plusieurs prétendants se disputent le trône." }, // Paragraphe
      { type: 'p', texte: "En 1704, une jeune femme noble, Kimpa Vita, baptisée Beatriz, affirme être habitée par saint Antoine. Elle prêche le retour à la capitale et la réunification du royaume." }, // Paragraphe
      { type: 'h2', texte: 'Un christianisme africain' }, // Intertitre
      { type: 'p', texte: "Son message bouscule l'Église de l'époque : elle affirme que Jésus est né à Mbanza Kongo et que les saints étaient kongo. Ses fidèles, les Antoniens, sont des milliers à la suivre et à repeupler l'ancienne capitale." }, // Paragraphe
      { type: 'p', texte: "Perçue comme une menace par le roi Pedro IV et par les missionnaires capucins, elle est arrêtée, jugée pour hérésie et brûlée vive en juillet 1706." }, // Paragraphe
      { type: 'citation', texte: 'Une femme de vingt-deux ans qui voulait recoudre un royaume déchiré.', source: '' }, // Citation
      { type: 'h2', texte: 'Une mémoire qui résiste' }, // Intertitre
      { type: 'p', texte: "Son mouvement lui survit quelque temps, et sa figure n'a jamais quitté les mémoires. Elle est aujourd'hui célébrée en Angola comme en République démocratique du Congo." }, // Paragraphe
      { type: 'p', texte: "Trois siècles plus tard, on retient surtout cela : une femme de vingt-deux ans qui voulait recoudre un royaume déchiré." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du portrait

  { // Récit : Afrobeat
    id: 'afrobeat-afrobeats', // Identifiant
    rubrique: 'figures-et-horizons', // Rubrique
    type: 'recit', // Article
    titre: 'Afrobeat, Afrobeats : un « s » et cinquante ans d’histoire', // Titre
    chapo: "De Fela Kuti aux stades du monde entier, la musique nigériane a changé d'échelle. Mais derrière un nom presque identique se cachent deux histoires distinctes.", // Introduction
    pays: 'Nigeria', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-09-26', // Date
    image: '', alt: '', motif: 'ndebele', teinte: 'laterite', forme: 'demi', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "À la fin des années 1960, à Lagos, le saxophoniste et chanteur Fela Kuti invente avec le batteur Tony Allen un son nouveau : l'afrobeat. Des morceaux longs, souvent plus de dix minutes, où se mêlent highlife, jazz, funk et rythmes yoruba, portés par des cuivres puissants et des textes politiques." }, // Paragraphe
      { type: 'p', texte: "Avec son groupe Africa 70, Fela fait de la musique une arme : il dénonce la corruption, la brutalité militaire, la soumission culturelle. Sa maison-studio, la Kalakuta Republic, devient un symbole — et une cible." }, // Paragraphe
      { type: 'h2', texte: 'Puis vint le « s »' }, // Intertitre
      { type: 'p', texte: "Dans les années 2000 et 2010, une nouvelle génération d'artistes ouest-africains invente une pop dansante, nourrie de hip-hop, de dancehall et de highlife. On l'appelle <em>afrobeats</em>, au pluriel : un terme parapluie plus qu'un genre." }, // Paragraphe
      { type: 'p', texte: "En 2021, Burna Boy remporte le Grammy Award du meilleur album de musique du monde pour <em>Twice as Tall</em>. La scène nigériane, et avec elle celle du Ghana et de toute la sous-région, remplit désormais les plus grandes salles du monde." }, // Paragraphe
      { type: 'citation', texte: 'Derrière un nom presque identique se cachent deux histoires distinctes.', source: '' }, // Citation
      { type: 'h2', texte: 'Ce qui les relie' }, // Intertitre
      { type: 'p', texte: "Les deux héritages ne s'opposent pas. Beaucoup d'artistes d'aujourd'hui revendiquent Fela comme une figure tutélaire, et Lagos continue de célébrer sa mémoire chaque mois d'octobre, autour de sa date de naissance, lors du Felabration." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Récit : Bogolan
    id: 'bogolan', // Identifiant
    rubrique: 'savoir-faire', // Rubrique
    type: 'recit', // Article
    titre: "Le bogolan, ou l'art d'écrire avec la terre", // Titre
    chapo: 'Au Mali, on peint le coton avec de la boue fermentée. Le résultat : des étoffes graphiques dont chaque signe a un sens.', // Introduction
    pays: 'Mali', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-09-10', // Date
    image: '', alt: '', motif: 'bogolan', teinte: 'sable', forme: 'aucune', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "En bambara, <em>bogolanfini</em> signifie à peu près « étoffe faite avec de la terre » : <em>bogo</em>, la terre ; <em>lan</em>, avec ; <em>fini</em>, le tissu. Le nom dit tout de la technique." }, // Paragraphe
      { type: 'h2', texte: 'Trois gestes, une alchimie' }, // Intertitre
      { type: 'p', texte: "Le coton, tissé en bandes étroites puis assemblé, est d'abord trempé dans une décoction de feuilles — notamment celles du n'galama — qui le teinte en jaune. On y applique ensuite, au pinceau ou au bâtonnet, une boue riche en fer, longuement fermentée." }, // Paragraphe
      { type: 'p', texte: "Au contact des tanins des feuilles, le fer de la boue noircit. Les parties non peintes sont ensuite éclaircies : apparaissent alors les motifs clairs sur fond sombre qui font la signature du bogolan." }, // Paragraphe
      { type: 'citation', texte: 'Le nom dit tout de la technique.', source: '' }, // Citation
      { type: 'h2', texte: 'Un vocabulaire de signes' }, // Intertitre
      { type: 'p', texte: "Les motifs portent des noms et des significations : ils peuvent évoquer un événement, un animal, un proverbe, ou signaler le statut de la personne qui porte l'étoffe. Autrefois, certains bogolans étaient réservés aux chasseurs ou aux femmes à des moments clés de leur vie." }, // Paragraphe
      { type: 'figure', legende: 'Motifs inspirés du bogolan : zigzags, croix, losanges et rangs de points.', image: '', alt: '', motif: 'bogolan', teinte: 'kola', forme: 'aucune' }, // Image
      { type: 'h2', texte: 'De Ségou aux podiums' }, // Intertitre
      { type: 'p', texte: "Depuis la fin des années 1970, des artistes maliens — comme le collectif Bogolan Kasobane — ont fait entrer le bogolan dans l'art contemporain, tandis que le styliste Chris Seydou en a fait un langage de la mode. Le même geste, d'autres récits." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Récit : Kente
    id: 'kente', // Identifiant
    rubrique: 'savoir-faire', // Rubrique
    type: 'recit', // Article
    titre: 'Kente : chaque bande est une phrase', // Titre
    chapo: "Tissé sur des métiers étroits par les Ashanti et les Ewe, le kente est bien plus qu'une étoffe de fête : un langage de couleurs et de motifs.", // Introduction
    pays: 'Ghana · Togo', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-08-22', // Date
    image: '', alt: '', motif: 'kente', teinte: 'ocre', forme: 'bandes', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "Le kente naît sur des métiers à tisser étroits, actionnés à la main et au pied. On y tisse des bandes d'une dizaine de centimètres de large, ensuite cousues bord à bord pour former une grande étoffe." }, // Paragraphe
      { type: 'p', texte: "Deux grandes traditions coexistent : celle des Ashanti, dont le village de Bonwire, près de Kumasi, est le centre le plus célèbre, et celle des Ewe, de part et d'autre de la frontière entre le Ghana et le Togo." }, // Paragraphe
      { type: 'h2', texte: 'Des couleurs qui parlent' }, // Intertitre
      { type: 'p', texte: "Chaque couleur porte une valeur : l'or évoque la richesse et le prestige royal, le vert la croissance et les récoltes, le bleu la paix et l'harmonie, le rouge le sacrifice et la lutte, le noir la maturité et le lien avec les ancêtres." }, // Paragraphe
      { type: 'citation', texte: 'Un kente se lit autant qu’il se porte.', source: '' }, // Citation
      { type: 'h2', texte: 'Des motifs qui ont un nom' }, // Intertitre
      { type: 'p', texte: "Chaque motif a un nom, souvent tiré d'un proverbe, d'un événement ou d'une personnalité. Le plus élaboré, l'<em>adwinasa</em>, est si richement orné que son nom signifie à peu près « mon savoir-faire est épuisé » : le tisserand y a mis tout ce qu'il savait." }, // Paragraphe
      { type: 'p', texte: "Longtemps réservé à la royauté et aux grandes occasions, le kente se porte aujourd'hui lors des remises de diplômes, des mariages et des fêtes. Un kente se lit autant qu'il se porte." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Récit : Karité
    id: 'karite', // Identifiant
    rubrique: 'savoir-faire', // Rubrique
    type: 'recit', // Article
    titre: 'Le karité, de la noix au geste', // Titre
    chapo: 'Avant de devenir un beurre, le karité est une longue patience : celle des arbres, et celle des femmes qui le transforment.', // Introduction
    pays: 'Burkina Faso · Bénin', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-07-04', // Date
    image: '', alt: '', motif: 'cauris', teinte: 'palme', forme: 'soleil', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "Le karité, <em>Vitellaria paradoxa</em>, pousse à l'état sauvage dans les savanes, de l'Afrique de l'Ouest jusqu'à l'Afrique de l'Est. On ne le plante presque jamais : on le protège. Un arbre peut mettre une quinzaine d'années avant de donner ses premiers fruits, et vivre plus de deux siècles." }, // Paragraphe
      { type: 'h2', texte: 'Un savoir de femmes' }, // Intertitre
      { type: 'p', texte: "La cueillette et la transformation sont, dans leur immense majorité, l'affaire des femmes. On ramasse les fruits tombés, on retire la pulpe, puis les noix sont bouillies, séchées et décortiquées." }, // Paragraphe
      { type: 'p', texte: "Les amandes sont ensuite concassées, torréfiées, moulues en pâte. Vient le moment le plus physique : le barattage, où l'on bat la pâte à la main avec de l'eau jusqu'à ce que la matière grasse se sépare. Le beurre est enfin chauffé, filtré, puis laissé à figer." }, // Paragraphe
      { type: 'citation', texte: 'On ne le plante presque jamais : on le protège.', source: '' }, // Citation
      { type: 'h2', texte: 'Acheter juste' }, // Intertitre
      { type: 'p', texte: "Le karité fait vivre des millions de femmes en Afrique de l'Ouest. Privilégier un beurre acheté directement auprès de coopératives, c'est permettre que la valeur reste au plus près de celles qui la créent." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Récit : Adire
    id: 'adire', // Identifiant
    rubrique: 'savoir-faire', // Rubrique
    type: 'recit', // Article
    titre: "Adire : l'indigo d'Abeokuta", // Titre
    chapo: 'Dans le sud-ouest du Nigeria, les teinturières yoruba réservent le tissu avant de le plonger dans l’indigo. Ce qui reste clair dessine le motif.', // Introduction
    pays: 'Nigeria', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-06-18', // Date
    image: '', alt: '', motif: 'adire', teinte: 'indigo', forme: 'soleil', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "<em>Adire</em> signifie « nouer et teindre » en yoruba. Le principe est celui de la réserve : on protège certaines zones du tissu pour qu'elles ne prennent pas la teinture, puis on plonge l'étoffe, encore et encore, dans des bains d'indigo." }, // Paragraphe
      { type: 'h2', texte: 'Nouer, coudre ou peindre' }, // Intertitre
      { type: 'p', texte: "Plusieurs techniques coexistent. Dans l'<em>adire oniko</em>, on noue le tissu avec du raphia. Dans l'<em>adire alabere</em>, on le coud avant la teinture. Dans l'<em>adire eleko</em>, on peint ou on applique au pochoir une pâte d'amidon de manioc qui fera barrière à l'indigo." }, // Paragraphe
      { type: 'citation', texte: 'Ce qui reste clair dessine le motif.', source: '' }, // Citation
      { type: 'h2', texte: "Abeokuta, capitale de l'indigo" }, // Intertitre
      { type: 'p', texte: "La ville d'Abeokuta, et notamment le quartier d'Itoku, est depuis longtemps un haut lieu de l'adire. Le savoir-faire s'y transmet surtout entre femmes, qui ont fait de cet artisanat une véritable économie." }, // Paragraphe
      { type: 'p', texte: "Après un déclin face aux tissus industriels, l'adire connaît un fort regain : créatrices et créateurs de mode s'en emparent, et les ateliers d'initiation se multiplient." }, // Paragraphe
    ], // Fin du texte
  }, // Fin du récit

  { // Récit d'événement : Vodun Days
    id: 'vodun-days-ouidah', // Identifiant
    rubrique: 'evenements', // Rubrique
    type: 'recit', // Article
    titre: 'Ouidah, quand janvier fait battre le cœur du vodun', // Titre
    chapo: 'Chaque 10 janvier, le Bénin célèbre ses religions endogènes. À Ouidah, la fête est devenue un rendez-vous de plusieurs jours : les Vodun Days.', // Introduction
    pays: 'Bénin', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-01-20', // Date
    image: '', alt: '', motif: 'cauris', teinte: 'kola', forme: 'soleil', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "Au Bénin, le 10 janvier est un jour férié consacré aux religions endogènes, au premier rang desquelles le vodun. Depuis 2024, l'État organise autour de cette date les Vodun Days, plusieurs jours de célébrations à Ouidah." }, // Paragraphe
      { type: 'p', texte: "Sur la plage, non loin de la Porte du Non-Retour, se succèdent cérémonies, chants, danses et sorties de masques. Des milliers de personnes, venues du pays, de la sous-région et de la diaspora, s'y retrouvent." }, // Paragraphe
      { type: 'h2', texte: 'Les masques, gardiens et revenants' }, // Intertitre
      { type: 'p', texte: "On y croise les Zangbeto, gardiens de la nuit vêtus de raphia qui tournoient sans visage, et les Egungun, revenants aux costumes richement brodés, qui incarnent les ancêtres revenus visiter les vivants." }, // Paragraphe
      { type: 'citation', texte: "Le vodun n'est pas un spectacle : c'est une religion, avec ses lieux, ses règles et ses silences.", source: '' }, // Citation
      { type: 'h2', texte: 'Y aller, avec respect' }, // Intertitre
      { type: 'p', texte: "Le vodun n'est pas un spectacle : c'est une religion, avec ses lieux, ses règles et ses silences. Demandez toujours avant de photographier, suivez les indications des organisateurs et des dignitaires, et acceptez que certaines choses ne se montrent pas." }, // Paragraphe
      { type: 'p', texte: 'Afrique Authentique organise chaque année un voyage du cercle à Ouidah pendant cette période. Les informations sont publiées dans <a href="evenements.html">l’agenda</a>.' }, // Paragraphe avec lien
    ], // Fin du texte
  }, // Fin du récit

  { // Récit d'événement : FESPACO
    id: 'fespaco', // Identifiant
    rubrique: 'evenements', // Rubrique
    type: 'recit', // Article
    titre: 'FESPACO : Ouagadougou, capitale du cinéma africain', // Titre
    chapo: 'Depuis 1969, le Festival panafricain du cinéma et de la télévision de Ouagadougou rassemble tous les deux ans les cinémas d’Afrique et de sa diaspora.', // Introduction
    pays: 'Burkina Faso', // Pays
    auteur: 'La rédaction', // Signature
    date: '2026-05-15', // Date
    image: '', alt: '', motif: 'ndebele', teinte: 'ocre', forme: 'losange', // Visuel
    corps: [ // Texte
      { type: 'p', texte: "Né en 1969, le FESPACO est devenu le plus grand festival de cinéma du continent. Il se tient tous les deux ans à Ouagadougou, la capitale du Burkina Faso." }, // Paragraphe
      { type: 'h2', texte: "L'Étalon d'or de Yennenga" }, // Intertitre
      { type: 'p', texte: "Sa récompense suprême, l'Étalon d'or de Yennenga, doit son nom à la princesse Yennenga, figure fondatrice du peuple mossi, souvent représentée sur son cheval." }, // Paragraphe
      { type: 'citation', texte: "On y vient voir des films, mais aussi l'Afrique se regarder elle-même.", source: '' }, // Citation
      { type: 'h2', texte: "Bien plus qu'une compétition" }, // Intertitre
      { type: 'p', texte: "Projections en plein air, marché du film, débats, rencontres professionnelles : pendant une semaine, la ville entière vit au rythme du cinéma. On y vient voir des films, mais aussi l'Afrique se regarder elle-même." }, // Paragraphe
      { type: 'p', texte: 'La prochaine édition est attendue en 2027. Retrouvez les dates dans <a href="evenements.html">notre agenda</a> dès leur annonce officielle.' }, // Paragraphe avec lien
    ], // Fin du texte
  }, // Fin du récit

]; // Fin de la liste des récits

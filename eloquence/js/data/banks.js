/* Banques de contenu : virelangues, vocabulaire, connecteurs, figures de style,
   sophismes, tics, erreurs courantes, sujets d'improvisation, textes à lire… */
(function (App) {
  'use strict';

  var B = {};

  /* ---------- Virelangues (niveau 1 à 3, son travaillé) ---------- */
  B.virelangues = [
    { t: 'Les chaussettes de l\'archiduchesse sont-elles sèches ? Archi-sèches !', l: 1, son: 'ch / s' },
    { t: 'Un chasseur sachant chasser doit savoir chasser sans son chien.', l: 1, son: 'ch / s' },
    { t: 'Ton thé t\'a-t-il ôté ta toux ?', l: 1, son: 't' },
    { t: 'Panier, piano. Panier, piano. Panier, piano.', l: 1, son: 'p' },
    { t: 'Trois tortues trottaient sur un trottoir très étroit.', l: 1, son: 'tr' },
    { t: 'Lily lit le livre dans le lit.', l: 1, son: 'l' },
    { t: 'Cinq chiens chassent six chats.', l: 1, son: 'ch / s' },
    { t: 'Fruits frais, fruits frits, fruits cuits, fruits crus.', l: 1, son: 'fr / cr' },
    { t: 'Douze douches douces.', l: 1, son: 'd / ch' },
    { t: 'Pruneau cuit, pruneau cru.', l: 1, son: 'pr / cr' },
    { t: 'Tas de riz, tas de rats.', l: 1, son: 'r' },
    { t: 'Dans ta tente, ta tante t\'attend.', l: 1, son: 't' },
    { t: 'Le ver vert va vers le verre vert.', l: 1, son: 'v' },
    { t: 'Sacha chassa son chat, le chat chassa Sacha.', l: 1, son: 'ch / s' },
    { t: 'Ahouéfa aime les violettes, et les violettes aiment Ahouéfa.', l: 1, son: 'v / l' },
    { t: 'Seize chaises sèchent.', l: 1, son: 's / ch' },
    { t: 'Je veux et j\'exige d\'exquises excuses.', l: 2, son: 'j / x' },
    { t: 'Natacha n\'attacha pas son chat Pacha qui s\'échappa.', l: 2, son: 'ch' },
    { t: 'Si six scies scient six cyprès, six cent six scies scient six cent six cyprès.', l: 2, son: 's' },
    { t: 'Les vers verts levèrent le verre vert.', l: 2, son: 'v' },
    { t: 'Suis-je chez ce cher Serge ?', l: 2, son: 'ch / s / j' },
    { t: 'Didon dîna, dit-on, du dos d\'un dodu dindon.', l: 2, son: 'd' },
    { t: 'Le cricri de la crique crie son cri cru et critique.', l: 2, son: 'cr' },
    { t: 'Pauvre petit pêcheur, prends patience pour prendre plusieurs petits poissons.', l: 2, son: 'p' },
    { t: 'Un généreux déjeuner régénérerait des généraux dégénérés.', l: 2, son: 'j' },
    { t: 'La pie niche haut, l\'oie niche bas. Où l\'hibou niche-t-il ?', l: 2, son: 'n / ch' },
    { t: 'Qu\'a bu l\'âne au lac ? L\'âne au lac a bu l\'eau.', l: 2, son: 'l / b' },
    { t: 'Le mur murant Paris rend Paris murmurant.', l: 2, son: 'm / r' },
    { t: 'Ciel ! Si ceci se sait, ces soins sont sans succès.', l: 2, son: 's' },
    { t: 'Un dragon gradé dégrade un gradé dragon.', l: 2, son: 'gr / dr' },
    { t: 'Les rues de Rouen sont rudes à rouler.', l: 2, son: 'r' },
    { t: 'Pour qui sont ces serpents qui sifflent sur vos têtes ?', l: 2, son: 's', src: 'Racine, Andromaque' },
    { t: 'Je dis que tu l\'as dit à Didi ce que j\'ai dit jeudi.', l: 2, son: 'd' },
    { t: 'Trois gros rats gris dans trois gros trous ronds rongent trois gros croûtons ronds.', l: 3, son: 'gr / r' },
    { t: 'Ces six saucissons-ci sont si secs qu\'on ne sait si c\'en sont.', l: 3, son: 's' },
    { t: 'Combien sont ces six saucissons-ci ? Ces six saucissons-ci sont six sous.', l: 3, son: 's' },
    { t: 'Il faut qu\'un sage garde-chasse sache chasser sans son chien de chasse.', l: 3, son: 's / ch' },
    { t: 'Je suis ce que je suis, et si je suis ce que je suis, qu\'est-ce que je suis ?', l: 3, son: 's / ch' },
    { t: 'Kiki était cocotte, et Coco concasseur de cacao. Kiki la cocotte convoitait les cocos de Coco.', l: 3, son: 'k' },
    { t: 'Tatie, ton thé t\'a-t-il ôté ta toux ? disait la tortue au tatou. Mais pas du tout, dit le tatou, je tousse tant que l\'on m\'entend de Tahiti à Tombouctou.', l: 3, son: 't' },
    { t: 'Chat vit rôt, rôt tenta chat, chat mit patte à rôt, rôt brûla patte à chat, chat quitta rôt.', l: 3, son: 'ch / r' },
    { t: 'Un pâtissier qui pâtissait chez un tapissier qui tapissait demanda un jour au tapissier : vaut-il mieux pâtisser chez un tapissier ou tapisser chez un pâtissier ?', l: 3, son: 'p / t / s' }
  ];

  /* ---------- Vocabulaire : verbes précis à la place des mots passe-partout ---------- */
  B.verbesPrecis = [
    { s: 'Elle a ___ une grave erreur.', a: 'commis', d: ['effectué', 'réalisé', 'produit'], weak: 'fait' },
    { s: 'Le président a ___ un discours émouvant.', a: 'prononcé', d: ['raconté', 'parlé', 'causé'], weak: 'fait' },
    { s: 'Il a ___ son désaccord avec fermeté.', a: 'exprimé', d: ['raconté', 'parlé', 'causé'], weak: 'dit' },
    { s: 'Elle ___ un poste de directrice.', a: 'occupe', d: ['possède', 'détient', 'tient'], weak: 'a' },
    { s: 'Il a ___ son diplôme avec mention.', a: 'obtenu', d: ['eu', 'pris', 'reçu de'], weak: 'eu' },
    { s: 'L\'école a ___ une nouvelle règle.', a: 'instauré', d: ['mis', 'fait', 'posé'], weak: 'mis en place' },
    { s: 'Ce professeur ___ de précieux conseils.', a: 'prodigue', d: ['fait', 'met', 'dit'], weak: 'donne' },
    { s: 'Elle a ___ un poème devant la classe.', a: 'récité', d: ['dit', 'fait', 'parlé'], weak: 'dit' },
    { s: 'Les enquêteurs ___ une enquête minutieuse.', a: 'mènent', d: ['font', 'mettent', 'tiennent'], weak: 'font' },
    { s: 'Notre équipe a ___ un grand succès.', a: 'remporté', d: ['fait', 'eu', 'pris'], weak: 'eu' },
    { s: 'Il a ___ des efforts considérables.', a: 'fourni', d: ['fait de', 'mis', 'donné de'], weak: 'fait' },
    { s: 'Elle m\'a ___ un secret.', a: 'confié', d: ['parlé', 'fait', 'mis'], weak: 'dit' },
    { s: 'Le maçon a ___ un mur solide.', a: 'bâti', d: ['fait', 'mis', 'posé de'], weak: 'fait' },
    { s: 'Pour répondre, il faut ___ des preuves.', a: 'apporter', d: ['faire', 'mettre', 'dire'], weak: 'donner' },
    { s: 'Ce texte ___ que la jeunesse est l\'avenir.', a: 'affirme', d: ['fait', 'parle', 'met'], weak: 'dit' },
    { s: 'Il a ___ son manteau avant de sortir.', a: 'enfilé', d: ['fait', 'posé', 'pris dessus'], weak: 'mis' }
  ];

  /* ---------- Intensifs : « très + adjectif » → un mot fort ---------- */
  B.intensifs = [
    ['très content', 'ravi'], ['très fatigué', 'épuisé'], ['très grand', 'immense'], ['très petit', 'minuscule'],
    ['très beau', 'splendide'], ['très laid', 'hideux'], ['très bon (plat)', 'délicieux'], ['très mauvais', 'exécrable'],
    ['très froid', 'glacial'], ['très chaud', 'brûlant'], ['très peur', 'terrifié'], ['très en colère', 'furieux'],
    ['très triste', 'effondré'], ['très surpris', 'stupéfait'], ['très important', 'primordial'], ['très intéressant', 'passionnant'],
    ['très sale', 'crasseux'], ['très drôle', 'hilarant'], ['très rapide', 'fulgurant'], ['très connu', 'célèbre'],
    ['très riche', 'fortuné'], ['très difficile', 'ardu'], ['très facile', 'enfantin'], ['très mouillé', 'trempé'],
    ['très faim', 'affamé'], ['très calme', 'paisible'], ['très fort (bruit)', 'assourdissant'], ['très vieux (objet)', 'vétuste']
  ];

  /* ---------- Mots soutenus (mot du jour, définitions) ---------- */
  B.mots = [
    { w: 'laconique', d: 'Qui s\'exprime en très peu de mots.', ex: 'Sa réponse fut laconique : « Non. »' },
    { w: 'prolixe', d: 'Qui parle ou écrit trop longuement.', ex: 'Un orateur prolixe finit par perdre son public.' },
    { w: 'éloquent', d: 'Qui s\'exprime avec aisance et sait persuader.', ex: 'Son plaidoyer éloquent a convaincu le jury.' },
    { w: 'véhément', d: 'Qui s\'exprime avec une grande force, avec passion.', ex: 'Il a protesté de façon véhémente.' },
    { w: 'pérenne', d: 'Qui dure longtemps, durable.', ex: 'Nous voulons une solution pérenne.' },
    { w: 'éphémère', d: 'Qui ne dure que très peu de temps.', ex: 'La gloire des réseaux sociaux est souvent éphémère.' },
    { w: 'corroborer', d: 'Confirmer par de nouvelles preuves.', ex: 'Les témoignages corroborent sa version.' },
    { w: 'étayer', d: 'Appuyer une idée par des arguments ou des preuves.', ex: 'Étaye ton point de vue avec un exemple.' },
    { w: 'éluder', d: 'Éviter habilement de répondre ou de traiter quelque chose.', ex: 'Le ministre a éludé la question.' },
    { w: 'fustiger', d: 'Critiquer avec violence.', ex: 'L\'éditorial fustige l\'inaction des dirigeants.' },
    { w: 'exhorter', d: 'Encourager vivement quelqu\'un à agir.', ex: 'Elle exhorte les jeunes à voter.' },
    { w: 'pléthore', d: 'Quantité excessive.', ex: 'Il y a pléthore de candidats pour ce poste.' },
    { w: 'inexorable', d: 'Qu\'on ne peut ni arrêter ni fléchir.', ex: 'La marche inexorable du temps.' },
    { w: 'fallacieux', d: 'Trompeur, destiné à induire en erreur.', ex: 'Il a avancé un argument fallacieux.' },
    { w: 'probant', d: 'Qui prouve de façon convaincante.', ex: 'Les résultats de l\'essai sont probants.' },
    { w: 'idoine', d: 'Qui convient parfaitement, approprié.', ex: 'Voici l\'outil idoine pour ce travail.' },
    { w: 'sempiternel', d: 'Qui se répète sans cesse, au point de lasser.', ex: 'Encore ses sempiternelles excuses !' },
    { w: 'subjuguer', d: 'Captiver, séduire complètement.', ex: 'L\'oratrice a subjugué la salle.' },
    { w: 'ambivalent', d: 'Qui a deux aspects opposés.', ex: 'J\'ai un sentiment ambivalent face à ce projet.' },
    { w: 'pragmatique', d: 'Tourné vers l\'action concrète et l\'efficacité.', ex: 'Soyons pragmatiques : que peut-on faire dès demain ?' },
    { w: 'dithyrambique', d: 'Extrêmement élogieux.', ex: 'La critique a été dithyrambique.' },
    { w: 'péremptoire', d: 'Tranchant, qui n\'admet pas la contradiction.', ex: 'Il a parlé d\'un ton péremptoire.' },
    { w: 'circonspect', d: 'Prudent, qui réfléchit avant d\'agir.', ex: 'Restons circonspects face à cette rumeur.' },
    { w: 'velléitaire', d: 'Qui a des intentions mais ne passe jamais à l\'action.', ex: 'Ne sois pas velléitaire : commence aujourd\'hui.' },
    { w: 'sagace', d: 'D\'un esprit fin et perspicace.', ex: 'Une remarque sagace a débloqué la discussion.' },
    { w: 'truisme', d: 'Vérité si évidente qu\'il est inutile de la dire.', ex: '« Il faut travailler pour réussir » : c\'est un truisme.' },
    { w: 'digression', d: 'Passage qui s\'écarte du sujet principal.', ex: 'Pardonnez cette digression ; revenons au sujet.' },
    { w: 'verve', d: 'Imagination et entrain dans la parole.', ex: 'Il raconte ses aventures avec verve.' },
    { w: 'faconde', d: 'Grande facilité de parole, parfois excessive.', ex: 'Le vendeur avait une faconde irrésistible.' },
    { w: 'élocution', d: 'Manière de s\'exprimer oralement, d\'articuler.', ex: 'Une élocution claire rassure l\'auditoire.' },
    { w: 'harangue', d: 'Discours solennel adressé à une foule.', ex: 'Le capitaine lança une harangue à ses troupes.' },
    { w: 'concis', d: 'Qui dit beaucoup en peu de mots.', ex: 'Sois concis : une idée par phrase.' },
    { w: 'verbiage', d: 'Abondance de mots vides de sens.', ex: 'Ce rapport n\'est que du verbiage.' },
    { w: 'tribun', d: 'Orateur populaire qui défend une cause avec éloquence.', ex: 'Jaurès était un grand tribun.' },
    { w: 'rhétorique', d: 'Art de bien parler pour convaincre.', ex: 'La rhétorique s\'enseigne depuis l\'Antiquité.' },
    { w: 'emphase', d: 'Ton exagérément solennel, pompeux.', ex: 'Il lit ses notes avec trop d\'emphase.' },
    { w: 'quintessence', d: 'Ce qu\'il y a de meilleur, de plus pur.', ex: 'Ce discours est la quintessence de son talent.' },
    { w: 'nonobstant', d: 'Malgré, en dépit de.', ex: 'Nonobstant la pluie, la fête a eu lieu.' },
    { w: 'antinomique', d: 'Qui est en contradiction totale.', ex: 'Vitesse et précision sont-elles antinomiques ?' },
    { w: 'intrinsèque', d: 'Qui appartient à la nature même d\'une chose.', ex: 'La valeur intrinsèque d\'une idée.' }
  ];

  /* ---------- Bien parler : pléonasmes (mot en trop) ---------- */
  B.pleonasmes = [
    { text: 'Nous allons collaborer [ensemble] sur ce projet.', explain: '« Collaborer » veut déjà dire travailler ensemble.' },
    { text: 'Il faut prévoir [à l\'avance] les questions du public.', explain: '« Prévoir », c\'est déjà voir à l\'avance.' },
    { text: 'Montez [en haut] de l\'estrade, s\'il vous plaît.', explain: 'On ne monte jamais en bas : « montez sur l\'estrade » suffit.' },
    { text: 'Le public s\'est mis à applaudir [des deux mains].', explain: 'On applaudit forcément avec les mains.' },
    { text: 'Il est sorti [dehors] pour répéter son discours.', explain: '« Sortir » implique d\'aller dehors.' },
    { text: 'D\'abord, je présente le problème, puis [ensuite] la solution.', explain: '« Puis » et « ensuite » ont le même sens : gardez-en un.' },
    { text: 'Le prix a augmenté, il a [voire même] doublé.', explain: '« Voire » signifie déjà « et même ». On dit « voire doublé ».' },
    { text: 'Il faut ajouter [en plus] un exemple concret.', explain: '« Ajouter » contient déjà l\'idée de « en plus ».' },
    { text: 'Ne reculez pas [en arrière] face à la difficulté.', explain: 'On recule toujours en arrière !' },
    { text: '[Au jour d\'aujourd\'hui], tout le monde a un téléphone.', explain: '« Aujourd\'hui » contient déjà « au jour d\'hui ». Dites simplement « aujourd\'hui ».' }
  ];

  /* ---------- Bien parler : la bonne formulation ---------- */
  B.formulations = [
    { ok: 'Bien qu\'il pleuve, nous sortirons.', ko: ['Malgré qu\'il pleuve, nous sortirons.'], explain: '« Malgré que » est fautif à l\'oral soigné : on dit « bien que » ou « malgré la pluie ».' },
    { ok: 'Il faut pallier ce problème.', ko: ['Il faut pallier à ce problème.'], explain: '« Pallier » se construit sans préposition : on pallie quelque chose.' },
    { ok: 'Je me rappelle cette histoire.', ko: ['Je me rappelle de cette histoire.'], explain: 'On se rappelle quelque chose, mais on se souvient DE quelque chose.' },
    { ok: 'Si j\'avais su, je serais venu.', ko: ['Si j\'aurais su, je serais venu.'], explain: 'Après « si » de condition, jamais de conditionnel : « si j\'avais su ».' },
    { ok: 'Il est venu quand même.', ko: ['Il est venu comme même.'], explain: 'L\'expression correcte est « quand même ».' },
    { ok: 'Je vais chez le coiffeur.', ko: ['Je vais au coiffeur.'], explain: 'On va « chez » une personne, « à » un lieu.' },
    { ok: 'Ils croient en leur projet.', ko: ['Ils croivent en leur projet.'], explain: 'Le verbe croire donne « ils croient ».' },
    { ok: 'En termes de qualité, c\'est excellent.', ko: ['En terme de qualité, c\'est excellent.'], explain: 'L\'expression s\'écrit et se dit au pluriel : « en termes de ».' },
    { ok: 'Il est censé arriver à midi.', ko: ['Il est sensé arriver à midi.'], explain: '« Censé » = supposé. « Sensé » = qui a du bon sens.' },
    { ok: 'Cette idée a du sens.', ko: ['Cette idée fait du sens.'], explain: '« Faire du sens » est un calque de l\'anglais (to make sense). En français : « avoir du sens ».' },
    { ok: 'Il faut que tu viennes demain.', ko: ['Il faut que tu viens demain.'], explain: '« Il faut que » est suivi du subjonctif : « que tu viennes ».' },
    { ok: 'Après qu\'il est parti, la réunion a continué.', ko: ['Après qu\'il soit parti, la réunion a continué.'], explain: '« Après que » est suivi de l\'indicatif (le fait est accompli).' },
    { ok: 'Nous partons à Cotonou demain.', ko: ['Nous partons sur Cotonou demain.'], explain: 'On part « à » ou « pour » une ville, pas « sur ».' },
    { ok: 'On n\'a pas le temps.', ko: ['On a pas le temps.'], explain: 'À l\'oral soigné, gardez la négation complète : « on n\'a pas ».' },
    { ok: 'Quoi que tu fasses, fais-le bien.', ko: ['Quoique tu fasses, fais-le bien.'], explain: '« Quoi que » (en deux mots) = quelle que soit la chose que. « Quoique » = bien que.' },
    { ok: 'Le médecin a dit que c\'était grave.', ko: ['Le médecin, il a dit que c\'était grave.'], explain: 'Évitez de doubler le sujet (« le médecin, il ») : c\'est très oral et peu élégant.' },
    { ok: 'C\'est ma faute.', ko: ['C\'est de ma faute.'], explain: 'La forme soignée est « c\'est ma faute ».' }
  ];

  /* ---------- Anglicismes ---------- */
  B.anglicismes = [
    ['deadline', 'échéance'], ['meeting', 'réunion'], ['feedback', 'retour'], ['challenge', 'défi'],
    ['checker', 'vérifier'], ['booster', 'stimuler'], ['brainstorming', 'remue-méninges'], ['process', 'processus'],
    ['timing', 'calendrier'], ['planning', 'programme'], ['briefer', 'informer'], ['news', 'actualités']
  ];

  /* ---------- Connecteurs logiques ---------- */
  B.connecteurs = [
    { s: 'J\'adore ce métier. ___, il est mal payé.', a: 'Cependant', d: ['Par conséquent', 'De plus', 'Par exemple'], f: 'opposition' },
    { s: 'Il a beaucoup révisé. ___, il a réussi son examen.', a: 'Par conséquent', d: ['Cependant', 'Bien que', 'Par exemple'], f: 'conséquence' },
    { s: 'Ce projet est rentable. ___, il crée des emplois.', a: 'De plus', d: ['Pourtant', 'Donc', 'Bien que'], f: 'addition' },
    { s: 'Certains fruits sont riches en vitamine C, ___ l\'orange.', a: 'notamment', d: ['cependant', 'donc', 'pourtant'], f: 'illustration' },
    { s: 'Je reste à la maison ___ il pleut.', a: 'car', d: ['donc', 'mais', 'pourtant'], f: 'cause' },
    { s: '___, ce plan est le meilleur des trois.', a: 'En définitive', d: ['Par exemple', 'Bien que', 'D\'abord'], f: 'conclusion' },
    { s: 'Il est talentueux ; ___, il manque de rigueur.', a: 'toutefois', d: ['ainsi', 'en effet', 'car'], f: 'opposition' },
    { s: '___ il soit fatigué, il continue à s\'entraîner.', a: 'Bien qu\'', d: ['Parce qu\'', 'Puisqu\'', 'Donc'], f: 'concession' },
    { s: 'Elle parle très bien ; ___, elle écoute peu.', a: 'en revanche', d: ['par conséquent', 'de plus', 'en effet'], f: 'opposition' },
    { s: 'Il s\'entraîne chaque jour ___ réussir son concours.', a: 'afin de', d: ['bien que', 'malgré', 'car'], f: 'but' },
    { s: '___, présentons le problème. Ensuite, nous verrons la solution.', a: 'D\'abord', d: ['Enfin', 'Pourtant', 'Ainsi'], f: 'ordre' },
    { s: 'La route était bloquée ; ___ je suis arrivé en retard.', a: 'c\'est pourquoi', d: ['bien que', 'pourtant', 'notamment'], f: 'conséquence' },
    { s: 'Cette candidate est compétente. ___, elle est très motivée.', a: 'En outre', d: ['Néanmoins', 'Donc', 'Bien que'], f: 'addition' },
    { s: '___ les efforts de l\'équipe, le résultat est décevant.', a: 'Malgré', d: ['Grâce à', 'Afin de', 'Car'], f: 'opposition' },
    { s: 'Les ventes ont chuté ___ la crise.', a: 'en raison de', d: ['malgré', 'afin de', 'bien que'], f: 'cause' },
    { s: 'Certes, ce plan coûte cher, ___ il est efficace.', a: 'mais', d: ['donc', 'car', 'ainsi'], f: 'concession' },
    { s: 'Il n\'a pas abandonné ; ___, il a redoublé d\'efforts.', a: 'au contraire', d: ['par exemple', 'de plus', 'enfin'], f: 'opposition' },
    { s: 'Ce candidat parle trois langues ; il est ___ idéal pour ce poste.', a: 'donc', d: ['mais', 'cependant', 'pourtant'], f: 'conséquence' }
  ];
  B.fonctionsConnecteurs = [
    ['Cependant', 'Opposition'], ['Par conséquent', 'Conséquence'], ['En outre', 'Ajout'], ['Car', 'Cause'],
    ['Par exemple', 'Illustration'], ['En somme', 'Conclusion'], ['Afin de', 'But'], ['Bien que', 'Concession'],
    ['D\'abord', 'Ordre'], ['Néanmoins', 'Opposition'], ['Puisque', 'Cause'], ['Ainsi', 'Conséquence']
  ];

  /* ---------- Figures de style ---------- */
  B.figures = [
    { n: 'Métaphore', d: 'Comparer sans outil de comparaison.', ex: ['Cet homme est un lion.', 'Cette salle est une fournaise.'], set: 1 },
    { n: 'Comparaison', d: 'Rapprocher deux éléments avec « comme », « tel », « pareil à »…', ex: ['Il est fort comme un lion.', 'Ses yeux brillaient comme des étoiles.'], set: 1 },
    { n: 'Anaphore', d: 'Répéter un mot ou un groupe en début de phrase.', ex: ['Un jour viendra où les armes vous tomberont des mains. Un jour viendra où la guerre paraîtra absurde. (Victor Hugo)', 'Chaque jour, je travaille. Chaque jour, je progresse. Chaque jour, je m\'approche du but.'], set: 1 },
    { n: 'Hyperbole', d: 'Exagérer pour frapper les esprits.', ex: ['Je te l\'ai dit mille fois !', 'Je meurs de faim.'], set: 1 },
    { n: 'Personnification', d: 'Donner des traits humains à une chose ou un animal.', ex: ['Le vent hurle dans la nuit.', 'La ville s\'éveille doucement.'], set: 1 },
    { n: 'Question rhétorique', d: 'Poser une question qui n\'attend pas de réponse.', ex: ['Qui n\'a jamais eu peur de parler en public ?', 'Allons-nous rester les bras croisés ?'], set: 1 },
    { n: 'Gradation', d: 'Enchaîner des termes de plus en plus forts.', ex: ['Va, cours, vole, et nous venge. (Corneille)', 'C\'est un roc ! C\'est un pic ! C\'est un cap ! Que dis-je, c\'est un cap ? C\'est une péninsule ! (Rostand)'], set: 1 },
    { n: 'Antithèse', d: 'Rapprocher deux idées opposées.', ex: ['Il est petit par la taille, mais grand par le cœur.', 'Je vis, je meurs ; je me brûle et me noie. (Louise Labé)'], set: 2 },
    { n: 'Oxymore', d: 'Accoler deux mots de sens contraire.', ex: ['Cette obscure clarté qui tombe des étoiles. (Corneille)', 'Un silence assourdissant.'], set: 2 },
    { n: 'Chiasme', d: 'Construire en miroir (A-B / B-A).', ex: ['Il faut manger pour vivre et non pas vivre pour manger. (Molière)', 'Un pour tous, tous pour un.'], set: 2 },
    { n: 'Litote', d: 'Dire moins pour faire entendre plus.', ex: ['Va, je ne te hais point. (Corneille)', 'Ce n\'est pas mauvais du tout !'], set: 2 },
    { n: 'Euphémisme', d: 'Adoucir une réalité dure ou choquante.', ex: ['Il nous a quittés.', 'Les personnes à mobilité réduite.'], set: 2 },
    { n: 'Prétérition', d: 'Dire qu\'on ne va pas parler d\'une chose… tout en en parlant.', ex: ['Je ne vous dirai pas combien ce projet m\'a coûté de nuits blanches.', 'Inutile de rappeler qu\'il est arrivé en retard trois fois.'], set: 2 },
    { n: 'Allitération', d: 'Répéter un même son consonne.', ex: ['Pour qui sont ces serpents qui sifflent sur vos têtes ? (Racine)'], set: 2 },
    { n: 'Apostrophe', d: 'S\'adresser directement à une personne ou une chose.', ex: ['Ô temps, suspends ton vol ! (Lamartine)', 'Jeunesse, c\'est à toi que je parle !'], set: 2 },
    { n: 'Épiphore', d: 'Répéter un mot en fin de phrase.', ex: ['Je veux la paix pour nos enfants, la justice pour nos enfants, l\'avenir pour nos enfants.'], set: 2 }
  ];

  /* ---------- Sophismes ---------- */
  B.sophismes = [
    { n: 'Attaque personnelle', d: 'Attaquer la personne plutôt que son argument.', ex: 'Tu veux parler d\'écologie ? Tu as pourtant une voiture !' },
    { n: 'Homme de paille', d: 'Déformer l\'argument adverse pour l\'attaquer plus facilement.', ex: '— On pourrait réduire un peu le sucre à la cantine. — Donc tu veux priver les enfants de tout plaisir ?' },
    { n: 'Pente glissante', d: 'Prétendre qu\'une petite décision mènera forcément à une catastrophe.', ex: 'Si on autorise les téléphones en classe, bientôt plus personne ne viendra en cours.' },
    { n: 'Faux dilemme', d: 'Présenter seulement deux options alors qu\'il en existe d\'autres.', ex: 'Soit tu es avec nous, soit tu es contre nous.' },
    { n: 'Généralisation hâtive', d: 'Tirer une règle générale de quelques cas.', ex: 'J\'ai croisé deux chauffeurs impolis : les chauffeurs sont tous impolis.' },
    { n: 'Appel à la popularité', d: 'Dire qu\'une idée est vraie parce que beaucoup de gens y croient.', ex: 'Tout le monde le fait, donc c\'est forcément bien.' },
    { n: 'Appel à la tradition', d: 'Justifier une chose uniquement parce qu\'on l\'a toujours faite.', ex: 'On a toujours fait comme ça, il n\'y a aucune raison de changer.' },
    { n: 'Fausse cause', d: 'Croire que si B suit A, alors A a causé B.', ex: 'J\'ai porté mon tee-shirt porte-bonheur et on a gagné : il nous porte chance.' },
    { n: 'Autorité abusive', d: 'Invoquer une personne célèbre qui n\'est pas experte du sujet.', ex: 'C\'est vrai : un chanteur connu l\'a dit à la télévision.' }
  ];

  /* ---------- Ethos, pathos, logos ---------- */
  B.ethosPathosLogos = [
    { t: 'Selon une étude menée sur dix mille élèves, ceux qui lisent chaque jour progressent plus vite.', a: 'Logos', why: 'On s\'appuie sur des faits et des chiffres : c\'est la raison.' },
    { t: 'Imaginez le visage de cet enfant qui attend, seul, que quelqu\'un lui tende la main.', a: 'Pathos', why: 'On fait appel aux émotions de l\'auditoire.' },
    { t: 'Médecin depuis vingt ans, j\'ai accompagné des milliers de patients dans cette épreuve.', a: 'Ethos', why: 'L\'orateur établit sa crédibilité et son expérience.' },
    { t: 'Si ce produit coûte moins cher et dure deux fois plus longtemps, alors c\'est le meilleur choix.', a: 'Logos', why: 'Un raisonnement logique, étape par étape.' },
    { t: 'Pensez à la fierté que vous ressentirez le jour où vous tiendrez votre diplôme.', a: 'Pathos', why: 'On fait ressentir une émotion : la fierté.' },
    { t: 'J\'ai moi-même dirigé cette entreprise pendant dix ans, je sais de quoi je parle.', a: 'Ethos', why: 'L\'orateur met en avant son autorité personnelle.' },
    { t: 'Trois pays sur quatre ont déjà adopté cette mesure, avec des résultats mesurables.', a: 'Logos', why: 'Des données comparatives : c\'est la logique.' },
    { t: 'Comme vous, j\'ai grandi dans ce quartier ; ses difficultés, je les ai vécues.', a: 'Ethos', why: 'L\'orateur crée la confiance par la proximité et l\'expérience vécue.' }
  ];

  /* ---------- Accroches ---------- */
  B.accroches = [
    { t: 'Levez la main si vous avez déjà eu peur de prendre la parole.', a: 'Interpeller le public' },
    { t: 'Il y a cinq ans, à trois heures du matin, mon téléphone a sonné…', a: 'Anecdote' },
    { t: '« La vérité est en marche, et rien ne l\'arrêtera. » Ces mots de Zola résonnent encore.', a: 'Citation' },
    { t: 'Imaginez : demain matin, vous vous réveillez et vous ne pouvez plus parler.', a: 'Projection' },
    { t: 'Cent. C\'est le nombre de fois où j\'ai répété ce discours avant de vous le présenter.', a: 'Chiffre choc' },
    { t: 'Les réunions ne servent à rien. Du moins, la plupart d\'entre elles.', a: 'Affirmation provocante' }
  ];

  /* ---------- Tics de langage (exercices « touche les tics ») ---------- */
  B.ticsTextes = [
    '[Euh], alors [en fait] je voulais vous parler de mon projet. [Du coup], c\'est un projet [genre] très important pour moi, [voilà].',
    '[Bah] [en fait], la réunion a commencé en retard, [du coup] on n\'a pas pu tout finir, [tu vois].',
    'Notre entreprise, [euh], propose des solutions [en gros] pour simplifier, [voilà], la vie de nos clients.',
    'Je pense que, [du coup], c\'est la meilleure option. [En fait], elle coûte moins cher, [tu vois].',
    'Le climat change, [en fait], et [genre] il faut agir vite. [Enfin bref], c\'est urgent.',
    'J\'ai [euh] trois ans d\'expérience [en fait] dans la vente. [Voilà], [du coup] je postule chez vous.',
    '[Ben] le film était super, [en vrai]. Le héros, [genre], il sauve tout le monde, [tu vois].',
    'Ce matin, [euh], j\'ai raté le bus, [du coup] je suis arrivé en retard, [en fait] c\'était la panique.'
  ];

  /* ---------- Sujets d'improvisation ---------- */
  B.sujets = [
    // Ludiques
    'Convaincs-nous que le lundi est le meilleur jour de la semaine.',
    'Vends-nous l\'objet le plus proche de toi comme s\'il était unique au monde.',
    'Explique le football à un extraterrestre qui débarque sur Terre.',
    'Si tu pouvais avoir un super-pouvoir pendant une journée, lequel choisirais-tu et pourquoi ?',
    'Défends l\'idée que la pluie est la meilleure météo.',
    'Présente ton plat préféré comme un grand chef étoilé.',
    'Raconte la journée d\'un téléphone portable, de son point de vue.',
    'Convaincs un ami de se lever à 5 heures du matin.',
    'Invente une nouvelle fête et explique comment la célébrer.',
    'Pourquoi le violet est-il la plus belle des couleurs ?',
    'Présente une invention inutile mais géniale.',
    'Fais l\'éloge de la sieste.',
    'Si les animaux pouvaient parler, lequel serait le plus bavard ?',
    'Si tu étais maire de ta ville pendant une semaine, que changerais-tu ?',
    // Personnels
    'Raconte un souvenir d\'enfance qui t\'a marqué.',
    'Présente une personne qui t\'inspire.',
    'Quel est ton plus grand rêve ?',
    'Décris ta journée idéale, du réveil au coucher.',
    'Une compétence que tu aimerais maîtriser, et pourquoi.',
    'Un livre, un film ou une chanson qui a changé ta façon de voir les choses.',
    'De quoi es-tu le plus fier ou la plus fière aujourd\'hui ?',
    'Présente ta ville ou ton village à un touriste.',
    'Un échec qui t\'a appris quelque chose d\'important.',
    'Que dirais-tu à la personne que tu étais il y a dix ans ?',
    'Le meilleur conseil qu\'on t\'ait jamais donné.',
    'Présente un plat traditionnel de ton pays à quelqu\'un qui ne le connaît pas.',
    // Société
    'Les réseaux sociaux nous rapprochent-ils ou nous éloignent-ils ?',
    'Faut-il apprendre à parler en public dès l\'école primaire ?',
    'Le travail à distance : progrès ou piège ?',
    'L\'argent fait-il le bonheur ?',
    'Faut-il interdire les téléphones portables en classe ?',
    'L\'intelligence artificielle va-t-elle remplacer les enseignants ?',
    'Vaut-il mieux être respecté ou être aimé ?',
    'La politesse est-elle encore utile aujourd\'hui ?',
    'Faut-il voyager pour s\'ouvrir au monde ?',
    'Les langues locales doivent-elles être enseignées à l\'école ?',
    'Faut-il toujours dire la vérité ?',
    'Le sport devrait-il être pratiqué chaque jour à l\'école ?',
    // Professionnels
    'Présente ton métier, ou celui de tes rêves, en une minute.',
    'Explique à un enfant de huit ans ce qu\'est une entreprise.',
    'Comment remotiverais-tu une équipe découragée ?',
    'Quelle qualité est indispensable pour diriger, selon toi ?',
    'Présente un projet qui te tient à cœur à de futurs investisseurs.',
    'Pourquoi la ponctualité est-elle importante ?'
  ];

  /* ---------- Débats (avocat du diable) ---------- */
  B.debats = [
    'Il faut interdire les devoirs à la maison.',
    'Les réseaux sociaux font plus de mal que de bien.',
    'Tout le monde devrait apprendre à cuisiner.',
    'L\'uniforme scolaire devrait être obligatoire.',
    'Il vaut mieux vivre à la campagne qu\'en ville.',
    'Les jeux vidéo rendent plus intelligent.',
    'Le travail le week-end devrait être interdit.',
    'Il faut apprendre à coder dès l\'école primaire.',
    'Le bonheur est plus important que la réussite.',
    'Il faut limiter le temps d\'écran des adultes aussi.'
  ];

  /* ---------- Entretien d'embauche ---------- */
  B.entretien = [
    { q: 'Parlez-moi de vous.', tip: 'En 1 minute : qui vous êtes aujourd\'hui, deux réussites concrètes, et pourquoi ce poste est la suite logique.' },
    { q: 'Pourquoi voulez-vous ce poste ?', tip: 'Reliez ce que vous aimez faire, ce que vous savez faire et ce dont l\'entreprise a besoin.' },
    { q: 'Quelles sont vos principales qualités ?', tip: 'Deux qualités maximum, chacune prouvée par un exemple précis.' },
    { q: 'Quel est votre plus grand défaut ?', tip: 'Un vrai défaut (pas « je suis trop perfectionniste »), puis ce que vous faites concrètement pour le corriger.' },
    { q: 'Racontez une difficulté que vous avez surmontée.', tip: 'Méthode STAR : Situation, Tâche, Action, Résultat.' },
    { q: 'Où vous voyez-vous dans cinq ans ?', tip: 'Montrez de l\'ambition réaliste et votre envie d\'évoluer dans cette entreprise.' },
    { q: 'Pourquoi devrions-nous vous choisir ?', tip: 'Trois arguments : une compétence, un résultat, une qualité humaine.' },
    { q: 'Racontez un échec et ce que vous en avez appris.', tip: 'Assumez, restez bref sur l\'échec et développez la leçon tirée.' },
    { q: 'Comment gérez-vous la pression ?', tip: 'Donnez une méthode concrète et un exemple vécu.' }
  ];

  /* ---------- Mots imposés ---------- */
  B.motsImposes = ['parapluie', 'girafe', 'ordinateur', 'mangue', 'courage', 'horloge', 'pirogue', 'tambour', 'étoile',
    'chaussure', 'miroir', 'secret', 'marché', 'avion', 'baobab', 'lune', 'clé', 'guitare', 'valise', 'tempête', 'bonbon',
    'robot', 'plage', 'dragon', 'lettre', 'montagne', 'bougie', 'photo', 'train', 'vélo', 'boussole', 'trésor', 'chapeau',
    'océan', 'forêt', 'jardin', 'cerf-volant', 'papillon', 'crocodile', 'ananas', 'violon', 'couronne', 'fusée', 'sable',
    'nuage', 'pont', 'lanterne', 'carte', 'pinceau', 'plume', 'masque', 'éléphant', 'tortue', 'café', 'hamac', 'cascade',
    'horizon', 'foulard violet', 'gâteau', 'cadenas', 'marmite', 'calebasse', 'moto', 'radio', 'champion', 'bibliothèque'];

  /* ---------- Textes à lire (domaine public) ---------- */
  /* « / » = petite pause, « // » = grande pause, *mot* = à appuyer */
  B.textes = [
    {
      id: 'hugo-misere', titre: 'Discours sur la misère', auteur: 'Victor Hugo, 1849',
      t: 'Je ne suis pas, messieurs, / de ceux qui croient qu\'on peut *supprimer* la souffrance en ce monde ; // la souffrance est une loi divine ; // mais je suis de ceux qui pensent / et qui affirment / qu\'on peut *détruire la misère*.'
    },
    {
      id: 'hugo-paix', titre: 'Un jour viendra', auteur: 'Victor Hugo, Congrès de la paix, 1849',
      t: '*Un jour viendra* / où les armes vous tomberont des mains, / à vous aussi ! // *Un jour viendra* / où la guerre paraîtra aussi absurde / et sera aussi impossible / entre Paris et Londres, / entre Pétersbourg et Berlin, / entre Vienne et Turin, / qu\'elle serait impossible / et qu\'elle paraîtrait absurde aujourd\'hui / entre Rouen et Amiens, / entre Boston et Philadelphie.'
    },
    {
      id: 'jaures-courage', titre: 'Discours à la jeunesse', auteur: 'Jean Jaurès, 1903',
      t: '*Le courage*, / c\'est d\'aimer la vie / et de regarder la mort d\'un regard tranquille ; // c\'est d\'aller à l\'idéal / et de comprendre le réel ; // c\'est d\'agir / et de se donner aux grandes causes / sans savoir quelle récompense réserve à notre effort / l\'univers profond, / ni s\'il lui réserve une récompense.'
    },
    {
      id: 'zola-verite', titre: 'J\'accuse', auteur: 'Émile Zola, 1898',
      t: 'Quand on enferme *la vérité* sous terre, / elle s\'y amasse, / elle y prend une force telle d\'explosion / que, le jour où elle éclate, / elle fait *tout sauter* avec elle.'
    },
    {
      id: 'danton', titre: 'De l\'audace', auteur: 'Danton, 1792',
      t: 'Pour les vaincre, / il nous faut de *l\'audace*, / encore de *l\'audace*, / toujours de *l\'audace*, // et la France est sauvée !'
    },
    {
      id: 'mirabeau', titre: 'La volonté du peuple', auteur: 'Mirabeau, 1789',
      t: 'Allez dire à ceux qui vous envoient / que nous sommes ici / *par la volonté du peuple*, // et que nous n\'en sortirons / que par la force des baïonnettes.'
    },
    {
      id: 'cyrano', titre: 'La tirade du nez', auteur: 'Edmond Rostand, Cyrano de Bergerac, 1897',
      t: 'C\'est un *roc* ! / … c\'est un *pic* ! / … c\'est un *cap* ! // Que dis-je, c\'est un cap ? / … // C\'est une *péninsule* !'
    },
    {
      id: 'corbeau', titre: 'Le Corbeau et le Renard', auteur: 'Jean de La Fontaine, 1668',
      t: 'Maître Corbeau, / sur un arbre perché, / tenait en son bec un fromage. // Maître Renard, / par l\'odeur alléché, / lui tint à peu près ce langage : // « Hé ! *bonjour*, Monsieur du Corbeau. / Que vous êtes joli ! / que vous me semblez beau ! // Sans mentir, / si votre ramage / se rapporte à votre plumage, / vous êtes *le Phénix* des hôtes de ces bois. »'
    },
    {
      id: 'boileau', titre: 'L\'Art poétique', auteur: 'Nicolas Boileau, 1674',
      t: 'Ce que l\'on conçoit bien / s\'énonce *clairement*, // et les mots pour le dire / arrivent *aisément*.'
    },
    {
      id: 'ahouefa', titre: 'Le pouvoir de la parole', auteur: 'Texte original d\'Ahouéfa',
      t: 'Chaque jour, / nous parlons. // Pour demander, / pour expliquer, / pour convaincre, / pour aimer. // Pourtant, / on ne nous apprend presque jamais *à bien parler*. // La bonne nouvelle ? / L\'éloquence n\'est pas un don. // C\'est un *muscle*. / Et un muscle, / ça s\'entraîne.'
    }
  ];

  /* ---------- Citations et proverbes ---------- */
  B.citations = [
    { t: 'Ce que l\'on conçoit bien s\'énonce clairement, et les mots pour le dire arrivent aisément.', a: 'Nicolas Boileau' },
    { t: 'L\'éloquence est une peinture de la pensée.', a: 'Blaise Pascal' },
    { t: 'La vraie éloquence se moque de l\'éloquence.', a: 'Blaise Pascal' },
    { t: 'C\'est en forgeant qu\'on devient forgeron.', a: 'Proverbe' },
    { t: 'Petit à petit, l\'oiseau fait son nid.', a: 'Proverbe' },
    { t: 'Tourne sept fois ta langue dans ta bouche avant de parler.', a: 'Proverbe' },
    { t: 'Rien ne sert de courir ; il faut partir à point.', a: 'Jean de La Fontaine' },
    { t: 'Il n\'est point de vent favorable pour celui qui ne sait où il va.', a: 'Sénèque' },
    { t: 'Le courage, c\'est de chercher la vérité et de la dire.', a: 'Jean Jaurès' },
    { t: 'La parole est d\'argent, mais le silence est d\'or.', a: 'Proverbe' },
    { t: 'Qui parle sème, qui écoute récolte.', a: 'Proverbe' },
    { t: 'Les paroles s\'envolent, les écrits restent.', a: 'Proverbe latin' }
  ];

  /* ---------- Techniques de respiration ---------- */
  B.respirations = [
    { id: 'coherence', nom: 'Cohérence cardiaque', desc: 'Inspire 5 s, expire 5 s. Idéal avant une prise de parole pour calmer le cœur.', pattern: { inhale: 5, hold: 0, exhale: 5, hold2: 0 }, cycles: 12, icon: 'windFill' },
    { id: 'ventrale', nom: 'Respiration ventrale', desc: 'Inspire 4 s en gonflant le ventre, expire 6 s lentement. La base d\'une voix posée.', pattern: { inhale: 4, hold: 0, exhale: 6, hold2: 0 }, cycles: 8, icon: 'windFill' },
    { id: 'carree', nom: 'Respiration carrée', desc: 'Inspire 4 s, bloque 4 s, expire 4 s, bloque 4 s. Utilisée pour garder son calme sous pression.', pattern: { inhale: 4, hold: 4, exhale: 4, hold2: 4 }, cycles: 5, icon: 'windFill' },
    { id: '478', nom: 'Respiration 4-7-8', desc: 'Inspire 4 s, retiens 7 s, expire 8 s. Très apaisante contre le trac.', pattern: { inhale: 4, hold: 7, exhale: 8, hold2: 0 }, cycles: 4, icon: 'windFill' },
    { id: 'souffle', nom: 'Souffle long', desc: 'Inspire 3 s puis expire le plus longtemps possible sur un « sss ». Pour tenir de longues phrases.', pattern: { inhale: 3, hold: 0, exhale: 12, hold2: 0 }, cycles: 4, icon: 'windFill' }
  ];

  App.Banks = B;
})(window.App = window.App || {});

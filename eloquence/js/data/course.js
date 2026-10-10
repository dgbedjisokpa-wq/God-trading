/* Le parcours : 10 unités × 5 leçons, une révision (trophée) et un coffre par unité. */
(function (App) {
  'use strict';

  var awa = [
    'Awa était une élève timide qui n\'osait jamais lever la main.',
    'Un jour, son professeur lui annonça qu\'elle présenterait un exposé devant toute l\'école.',
    'Pendant des semaines, elle s\'entraîna devant son miroir, oublia son texte, recommença.',
    'Le jour J, face à trois cents personnes, sa voix trembla… puis elle respira et se lança.',
    'Depuis ce jour, Awa est déléguée de sa classe et adore prendre la parole.'
  ];

  var UNITS = [
    /* ================= UNITÉ 1 ================= */
    {
      id: 'u1', title: 'Les fondations', desc: 'Respirer, se tenir droit, apprivoiser le trac',
      color: '#8A3FFC', dark: '#6929C4',
      guide: [
        'L\'éloquence s\'apprend : c\'est un muscle qui se travaille chaque jour.',
        'Respire avec le ventre : il se gonfle à l\'inspiration, les épaules ne bougent pas.',
        'Ancre-toi : pieds écartés de la largeur du bassin, poids sur les deux jambes.',
        'Échauffe ta voix : bâillements, « brrr » des lèvres, sirènes.',
        'Le trac est de l\'énergie : dis-toi « je suis prêt(e) », pas « calme-toi ».'
      ],
      lessons: [
        {
          id: 'u1l1', title: 'Bienvenue dans l\'éloquence', icon: 'star', steps: [
            { type: 'info', mood: 'wave', title: 'Bienvenue !', body: 'Moi, c\'est **Ahouéfa**. Je vais t\'accompagner chaque jour pour t\'aider à parler avec **clarté**, **assurance** et **impact**. Ici, pas de long cours : on s\'entraîne, un petit exercice après l\'autre.' },
            { type: 'mcq', prompt: 'Selon toi, qu\'est-ce qu\'un discours éloquent ?', options: ['Un discours clair, vivant et adapté à son public', 'Un discours rempli de mots compliqués', 'Un discours très long et très détaillé', 'Un discours récité par cœur sans la moindre erreur'], answer: 0, explain: 'L\'éloquence, c\'est d\'abord la clarté. Les mots rares ne servent à rien si le public ne comprend pas.' },
            { type: 'info', mood: 'think', title: 'La règle d\'or', quote: { t: 'Ce que l\'on conçoit bien s\'énonce clairement, et les mots pour le dire arrivent aisément.', a: 'Nicolas Boileau' }, body: 'Avant de bien dire, il faut savoir **ce que tu veux dire**.' },
            { type: 'tf', statement: 'L\'éloquence est un don : on naît bon orateur ou on ne l\'est pas.', answer: false, explain: 'Faux ! L\'éloquence s\'apprend comme un sport. Les grands orateurs se sont entraînés pendant des années.' },
            { type: 'mcq', prompt: 'Quand tu parles, qu\'est-ce qui marque le plus ton public ?', options: ['Le fond, la forme (voix, regard, gestes) et l\'émotion, ensemble', 'Uniquement les mots choisis', 'Uniquement ta tenue', 'La longueur de ton discours'], answer: 0, explain: 'Le public retient un tout : ce que tu dis, comment tu le dis et ce qu\'il ressent.' },
            { type: 'tf', statement: 'Le fameux « 93 % de la communication est non verbale » s\'applique à tous les discours.', answer: false, explain: 'C\'est un mythe ! L\'étude d\'origine portait seulement sur l\'expression de sentiments avec des mots isolés. Le contenu compte énormément ; la voix et le corps le renforcent.' },
            { type: 'speak', prompt: 'Lis cette phrase à voix haute', text: 'Je m\'entraîne chaque jour pour parler avec clarté et assurance.' },
            { type: 'info', mood: 'happy', title: 'Comment ça marche', bullets: ['Chaque leçon dure environ 5 minutes.', 'Tu gagnes des **XP** et tu entretiens ta **série** en pratiquant chaque jour.', 'Pour les exercices de parole, parle clairement, près du micro.', 'Pas possible de parler maintenant ? Appuie sur « Je ne peux pas parler ».'] }
          ]
        },
        {
          id: 'u1l2', title: 'Respirer avec le ventre', icon: 'windFill', steps: [
            { type: 'info', title: 'Le souffle, moteur de ta voix', body: 'Une voix posée commence par une **respiration ventrale**. Quand tu inspires, ton ventre se gonfle ; quand tu parles, il se dégonfle doucement. Respirer avec le haut de la poitrine rend la voix aiguë et tremblante.' },
            { type: 'mcq', prompt: 'En respiration ventrale, que fait ton ventre quand tu inspires ?', options: ['Il se gonfle', 'Il se creuse', 'Il ne bouge pas', 'Il se contracte fort'], answer: 0, explain: 'Le diaphragme descend et pousse le ventre vers l\'avant. Les épaules, elles, restent immobiles.' },
            { type: 'timed', title: 'Pose tes mains', steps: [
              { t: 'Pose une main sur ton ventre, l\'autre sur ta poitrine.', secs: 6 },
              { t: 'Inspire par le nez : seule la main du ventre doit monter.', secs: 6 },
              { t: 'Expire par la bouche, lentement, comme dans une paille.', secs: 8 },
              { t: 'Recommence, sans lever les épaules.', secs: 12 }
            ] },
            { type: 'breath', title: 'Respiration ventrale', body: 'Inspire en gonflant le ventre, expire lentement.', pattern: { inhale: 4, hold: 0, exhale: 6, hold2: 0 }, cycles: 4 },
            { type: 'tf', statement: 'Pendant une respiration ventrale, les épaules doivent monter.', answer: false, explain: 'Non : des épaules qui montent trahissent une respiration haute, qui crée des tensions dans la gorge.' },
            { type: 'mcq', prompt: 'Pourquoi une expiration plus longue que l\'inspiration aide-t-elle à se calmer ?', options: ['Elle active le système nerveux qui ralentit le cœur', 'Elle apporte plus d\'oxygène au cerveau', 'Elle réchauffe la gorge', 'Elle ne change rien'], answer: 0, explain: 'Une expiration longue active le système parasympathique : le cœur ralentit, le stress baisse.' },
            { type: 'timed', title: 'Le souffle long', steps: [
              { t: 'Inspire profondément, par le ventre.', secs: 4 },
              { t: 'Expire sur un « sssss » régulier, le plus longtemps possible.', secs: 15 },
              { t: 'Encore : inspire…', secs: 4 },
              { t: '… et « sssss » le plus longtemps possible. Bats ton record !', secs: 18 }
            ] },
            { type: 'speak', prompt: 'Dis cette phrase d\'une voix posée', text: 'Je respire calmement, ma voix est posée et assurée.' }
          ]
        },
        {
          id: 'u1l3', title: 'La posture de l\'orateur', icon: 'crown', steps: [
            { type: 'info', title: 'Ancre-toi dans le sol', body: 'Avant même que tu parles, ton corps parle pour toi. Une posture **ancrée** inspire confiance : pieds écartés de la largeur du bassin, poids sur les deux jambes, genoux souples, dos droit, épaules relâchées.' },
            { type: 'mcq', prompt: 'Quelle posture inspire le plus confiance ?', options: ['Pieds ancrés, poids sur les deux jambes, regard vers le public', 'Bras croisés et poids sur une jambe', 'Mains dans les poches, regard vers le sol', 'Se balancer d\'avant en arrière'], answer: 0, explain: 'L\'ancrage montre que tu es stable et présent. Les balancements et les bras croisés trahissent la nervosité ou la fermeture.' },
            { type: 'match', prompt: 'Associe chaque attitude à ce qu\'elle transmet', pairs: [['Bras croisés', 'Fermeture'], ['Paumes ouvertes', 'Sincérité'], ['Se balancer', 'Nervosité'], ['Regard qui balaie la salle', 'Connexion']] },
            { type: 'tf', statement: 'Pendant un discours, il vaut mieux fixer un point au fond de la salle.', answer: false, explain: 'Regarde de vraies personnes, 3 à 5 secondes chacune, en changeant de zone. C\'est ce qui crée le lien.' },
            { type: 'timed', title: 'La posture d\'ancrage', steps: [
              { t: 'Lève-toi. Pieds écartés de la largeur du bassin.', secs: 6 },
              { t: 'Genoux légèrement fléchis, poids réparti sur les deux pieds.', secs: 6 },
              { t: 'Grandis-toi, comme si un fil tirait le sommet de ta tête.', secs: 6 },
              { t: 'Relâche les épaules. Souris légèrement. Respire.', secs: 8 },
              { t: 'Garde cette posture et respire calmement.', secs: 12 }
            ] },
            { type: 'mcq', prompt: 'Que faire de tes mains quand tu parles ?', options: ['Les garder visibles, entre la taille et les épaules, pour accompagner tes idées', 'Les cacher derrière le dos', 'Les garder dans les poches', 'Serrer fort ton stylo'], answer: 0, explain: 'Des mains visibles et mobiles rendent ton discours vivant et sincère.' },
            { type: 'speak', prompt: 'Debout et bien ancré(e), dis cette phrase en souriant', text: 'Bonjour à toutes et à tous, merci d\'être venus aujourd\'hui.' }
          ]
        },
        {
          id: 'u1l4', title: 'Réveiller sa voix', icon: 'micFill', steps: [
            { type: 'info', title: 'Comme les chanteurs', body: 'Les comédiens et les chanteurs échauffent leur voix avant de monter sur scène. Quelques minutes suffisent pour une voix plus **claire**, plus **forte** et moins fatiguée.' },
            { type: 'timed', title: 'Échauffement vocal', steps: [
              { t: 'Bâille en grand, deux fois, pour ouvrir la gorge.', secs: 8 },
              { t: 'Masse doucement tes joues et ta mâchoire.', secs: 8 },
              { t: 'Fais vibrer tes lèvres : « brrrrr », comme un moteur.', secs: 8 },
              { t: 'Bouche fermée, fais « mmmmm » : sens la vibration sur tes lèvres.', secs: 8 },
              { t: 'Fais une sirène : « ouuu » du plus grave au plus aigu, puis redescends.', secs: 10 }
            ] },
            { type: 'mcq', prompt: 'Pourquoi fait-on vibrer ses lèvres (« brrr ») avant de parler ?', options: ['Pour détendre la bouche et régulariser le souffle', 'Pour faire rire le public', 'Pour s\'éclaircir la gorge', 'Ça n\'a aucun effet'], answer: 0, explain: 'Les vibrations détendent les lèvres et obligent à garder un souffle régulier. Un classique des chanteurs.' },
            { type: 'tf', statement: 'Se racler fort la gorge est bon pour la voix.', answer: false, explain: 'Le raclement irrite les cordes vocales. Bois plutôt une gorgée d\'eau ou avale ta salive.' },
            { type: 'timed', title: 'Les voyelles exagérées', steps: [
              { t: 'Articule très lentement en exagérant : A… É… I… O… OU…', secs: 10 },
              { t: 'Encore : bouche grande ouverte sur le A, lèvres tirées sur le I, en avant sur le OU.', secs: 10 },
              { t: 'Plus vite maintenant : A-É-I-O-OU, trois fois de suite.', secs: 8 }
            ] },
            { type: 'mcq', prompt: 'Quelle boisson est la meilleure pour ta voix avant de parler ?', options: ['De l\'eau à température ambiante', 'Une boisson glacée', 'Un café très fort', 'Une boisson gazeuse'], answer: 0, explain: 'L\'eau tempérée hydrate les cordes vocales. Le froid les crispe ; le café et les sodas peuvent assécher ou gêner.' },
            { type: 'speak', prompt: 'Lis cette phrase avec ta voix réveillée', text: 'Ma voix est réveillée, claire et prête à porter loin.' },
            { type: 'voice', prompt: 'Projette ta voix', instruction: 'Dis cette phrase comme si tu parlais à quelqu\'un au fond d\'une grande salle, **sans crier** : la force vient du ventre.', text: 'Bienvenue à tous, installez-vous !' }
          ]
        },
        {
          id: 'u1l5', title: 'Le trac, ton allié', icon: 'boltFill', steps: [
            { type: 'info', title: 'Tout le monde a le trac', body: 'Cœur qui bat, mains moites, gorge sèche : c\'est l\'**adrénaline**. Elle prépare ton corps à donner le meilleur. Le but n\'est pas de supprimer le trac, mais de **l\'apprivoiser**.' },
            { type: 'tf', statement: 'Les orateurs expérimentés n\'ont plus jamais le trac.', answer: false, explain: 'Beaucoup d\'artistes et d\'orateurs confirmés ont encore le trac. Ils ont simplement appris à s\'en servir.' },
            { type: 'mcq', prompt: 'Juste avant de parler, ton cœur bat fort. Que te dis-tu ?', options: ['« Je suis prêt(e), mon corps me donne de l\'énergie. »', '« Calme-toi, calme-toi, calme-toi. »', '« Je vais sûrement tout rater. »', '« Surtout, que ça ne se voie pas. »'], answer: 0, explain: 'Des recherches en psychologie montrent que voir son anxiété comme de l\'excitation améliore la performance, mieux que de vouloir se calmer de force.' },
            { type: 'breath', title: 'Cohérence cardiaque', body: 'Six respirations par minute : le rythme qui apaise le cœur.', pattern: { inhale: 5, hold: 0, exhale: 5, hold2: 0 }, cycles: 6 },
            { type: 'match', prompt: 'Associe chaque technique à son effet', pairs: [['Respiration lente', 'Ralentit le cœur'], ['Préparer son début', 'Évite le blanc au départ'], ['Visualiser sa réussite', 'Renforce la confiance'], ['Regarder un visage bienveillant', 'Rassure pendant le discours']] },
            { type: 'mcq', prompt: 'Quelle partie du discours connaître presque par cœur pour réduire le trac ?', options: ['L\'introduction', 'Le milieu du développement', 'Les remerciements', 'Aucune'], answer: 0, explain: 'Les 30 premières secondes sont les plus stressantes. Un début solide te donne confiance pour la suite.' },
            { type: 'timed', title: 'Visualisation', steps: [
              { t: 'Ferme les yeux. Imagine la salle où tu vas parler.', secs: 8 },
              { t: 'Vois-toi entrer, calme, et te placer face au public.', secs: 8 },
              { t: 'Entends ta voix, claire et posée, dire ta première phrase.', secs: 8 },
              { t: 'Imagine les sourires et les applaudissements à la fin.', secs: 8 },
              { t: 'Ouvre les yeux. Garde ce sentiment.', secs: 5 }
            ] },
            { type: 'speak', prompt: 'Dis-le avec conviction', text: 'J\'ai le trac, et c\'est très bien : mon corps se prépare à briller.' }
          ]
        }
      ]
    },

    /* ================= UNITÉ 2 ================= */
    {
      id: 'u2', title: 'Articulation et diction', desc: 'Ouvrir la bouche, faire sonner chaque syllabe',
      color: '#D93A72', dark: '#A8285A',
      guide: [
        'Ouvre la bouche et détends la mâchoire : une mâchoire serrée étouffe les sons.',
        'Prononce les consonnes, surtout en fin de mot.',
        'Virelangues : lentement d\'abord, puis de plus en plus vite. Précision avant vitesse.',
        'L\'exercice du bouchon (stylo entre les dents) muscle ta diction.',
        'Avoir un accent n\'est pas un problème : la clarté, oui.'
      ],
      lessons: [
        {
          id: 'u2l1', title: 'Bien ouvrir la bouche', icon: 'micFill', steps: [
            { type: 'info', title: 'Articuler, c\'est respecter ton public', body: 'Un public qui doit se concentrer pour te comprendre se fatigue vite et décroche. Bien articuler, c\'est **ouvrir la bouche**, bouger les lèvres et faire sonner chaque syllabe.' },
            { type: 'mcq', prompt: 'Quelle est la cause la plus fréquente d\'une articulation floue ?', options: ['Une mâchoire trop serrée', 'Un débit trop lent', 'Un accent', 'Des mots trop courts'], answer: 0, explain: 'Une mâchoire crispée étouffe les sons. Un accent n\'est pas un problème : on peut avoir un accent et être parfaitement clair !' },
            { type: 'tf', statement: 'Avoir un accent empêche d\'être éloquent.', answer: false, explain: 'Absolument pas. Ton accent fait partie de toi. Ce qui compte, c\'est la clarté : articulation, rythme, volume.' },
            { type: 'timed', title: 'Gymnastique de la bouche', steps: [
              { t: 'Ouvre grand la bouche comme pour croquer une pomme, puis referme. Cinq fois.', secs: 10 },
              { t: 'Fais un grand sourire, puis avance les lèvres en bisou. Cinq fois.', secs: 10 },
              { t: 'Passe ta langue sur tes dents, à l\'intérieur des lèvres, dans les deux sens.', secs: 8 },
              { t: 'Dis « pa-ta-ka » en articulant, de plus en plus vite.', secs: 10 }
            ] },
            { type: 'mcq', prompt: 'Sur quoi être particulièrement attentif pour bien articuler ?', options: ['Les consonnes, surtout en fin de mot', 'Uniquement les voyelles', 'Les lettres muettes', 'Les mots très longs'], answer: 0, explain: 'Les consonnes donnent la netteté. Une consonne finale bien prononcée empêche les mots de se fondre entre eux.' },
            { gen: 'virelangue', level: 1, count: 2 }
          ]
        },
        {
          id: 'u2l2', title: 'Premiers virelangues', icon: 'featherFill', steps: [
            { type: 'info', title: 'Le secret des virelangues', body: 'Un virelangue est une phrase difficile à prononcer. La méthode : **1.** lentement, en exagérant chaque syllabe ; **2.** à vitesse normale ; **3.** vite, sans perdre la netteté. **La précision d\'abord, la vitesse ensuite !**' },
            { type: 'mcq', prompt: 'Quelle est la bonne méthode pour travailler un virelangue ?', options: ['Lentement d\'abord, puis accélérer peu à peu', 'Le plus vite possible dès le début', 'En chuchotant', 'Une seule lecture suffit'], answer: 0, explain: 'Ta bouche doit d\'abord apprendre le bon mouvement. La vitesse vient ensuite toute seule.' },
            { gen: 'virelangue', level: 1, count: 3 },
            { type: 'tf', statement: 'Les virelangues ne servent qu\'aux enfants.', answer: false, explain: 'Comédiens, journalistes et avocats les utilisent pour s\'échauffer : ils assouplissent la langue, les lèvres et la mâchoire.' },
            { gen: 'virelangue', level: 1, count: 1 }
          ]
        },
        {
          id: 'u2l3', title: 'L\'exercice du bouchon', icon: 'dumbbell', steps: [
            { type: 'info', title: 'Un exercice de comédien', body: 'On place un **bouchon** (ou un stylo propre, à l\'horizontale) entre les dents, et on lit un texte en articulant au maximum. Ta bouche travaille deux fois plus. Quand tu l\'enlèves, ta diction est bien plus nette !' },
            { type: 'mcq', prompt: 'Comment tenir le stylo pour l\'exercice du bouchon ?', options: ['À l\'horizontale, entre les dents, sans mordre fort', 'Dans la main, pour suivre le texte', 'Derrière l\'oreille', 'Entre les lèvres, à la verticale'], answer: 0, explain: 'Tenu à l\'horizontale entre les dents, il oblige les lèvres et la langue à travailler davantage.' },
            { type: 'timed', title: 'Avec le bouchon', steps: [
              { t: 'Place un stylo propre à l\'horizontale entre tes dents.', secs: 6 },
              { t: 'Lis à voix haute en exagérant : « Je parle clairement, je prononce chaque mot, je prends mon temps. »', secs: 15 },
              { t: 'Encore une fois, en articulant encore plus.', secs: 15 },
              { t: 'Retire le stylo.', secs: 4 }
            ] },
            { type: 'speak', prompt: 'Sans le stylo maintenant : sens la différence !', text: 'Je parle clairement, je prononce chaque mot, je prends mon temps.' },
            { type: 'tf', statement: 'Avec le bouchon, il faut parler le plus vite possible.', answer: false, explain: 'Au contraire : ralentis et exagère chaque mouvement. C\'est de la musculation, pas une course.' },
            { gen: 'virelangue', level: 2, count: 2 }
          ]
        },
        {
          id: 'u2l4', title: 'Les consonnes explosives', icon: 'boltFill', steps: [
            { type: 'info', title: 'P, T, K, B, D, G', body: 'Les consonnes **explosives** se forment en bloquant l\'air puis en le relâchant d\'un coup. Ce sont elles qui donnent du **punch** à ta parole. Fais-les claquer !' },
            { type: 'match', prompt: 'Associe chaque son à l\'endroit où il se forme', pairs: [['P / B', 'Les deux lèvres'], ['T / D', 'La langue derrière les dents'], ['K / G', 'Le fond de la bouche'], ['F / V', 'Les dents sur la lèvre']] },
            { type: 'speak', kind: 'virelangue', prompt: 'Fais claquer les T', text: 'Ton thé t\'a-t-il ôté ta toux ?' },
            { type: 'speak', kind: 'virelangue', prompt: 'Fais claquer les D', text: 'Didon dîna, dit-on, du dos d\'un dodu dindon.' },
            { type: 'mcq', prompt: 'Quel virelangue fait surtout travailler le son « K » ?', options: ['Kiki était cocotte, et Coco concasseur de cacao.', 'Lily lit le livre dans le lit.', 'Le ver vert va vers le verre vert.', 'Douze douches douces.'], answer: 0, explain: 'Kiki, cocotte, Coco, concasseur, cacao : le « K » claque à chaque mot.' },
            { type: 'speak', kind: 'virelangue', prompt: 'Fais claquer les P', text: 'Pauvre petit pêcheur, prends patience pour prendre plusieurs petits poissons.' },
            { type: 'tf', statement: 'Les consonnes explosives se forment en bloquant l\'air puis en le relâchant d\'un coup.', answer: true, explain: 'Exactement. C\'est pour ça qu\'on les appelle aussi « occlusives ».' }
          ]
        },
        {
          id: 'u2l5', title: 'Virelangues de champion', icon: 'crown', steps: [
            { type: 'info', mood: 'wow', title: 'Niveau supérieur', body: 'Prêt(e) pour les virelangues les plus redoutables ? Rappelle-toi : **précision avant vitesse**. Si tu trébuches, souris et recommence !' },
            { gen: 'virelangue', level: 2, count: 2 },
            { gen: 'virelangue', level: 3, count: 3 }
          ]
        }
      ]
    },

    /* ================= UNITÉ 3 ================= */
    {
      id: 'u3', title: 'Chasser les tics de langage', desc: '« Euh », « du coup », « en fait »… au revoir !',
      color: '#0E8BC8', dark: '#0A6E9F',
      guide: [
        'Les tics comblent la peur du silence. Remplace-les par une pause.',
        'Une pause d\'une seconde paraît longue pour toi, mais réfléchie pour ton public.',
        'Ferme la bouche et inspire avant de commencer une phrase : le « euh » disparaît.',
        'Remplace « du coup » par « donc », et « en fait » par « en réalité ».',
        'Termine tes phrases nettement, sans « voilà » ni « quoi ».'
      ],
      lessons: [
        {
          id: 'u3l1', title: 'Repérer ses tics', icon: 'bubble', steps: [
            { type: 'info', title: 'Les tics de langage', body: '« Euh », « en fait », « du coup », « genre », « voilà »… Ces petits mots **remplissent les silences**. Un ou deux passent inaperçus ; en grand nombre, ils donnent une impression d\'hésitation et fatiguent le public.' },
            { gen: 'tics', count: 1 },
            { type: 'mcq', prompt: 'Pourquoi utilise-t-on des tics de langage ?', options: ['Par peur du silence, pour garder la parole pendant qu\'on réfléchit', 'Pour paraître plus intelligent', 'Parce que la grammaire l\'exige', 'Pour parler plus vite'], answer: 0, explain: 'Le cerveau cherche ses mots et comble le vide. Bonne nouvelle : on peut remplacer ce réflexe par une pause.' },
            { gen: 'tics', count: 2 },
            { type: 'tf', statement: 'Un « euh » de temps en temps suffit à ruiner un discours.', answer: false, explain: 'Quelques hésitations sont naturelles et humaines. C\'est la répétition systématique qui gêne.' },
            { type: 'info', mood: 'happy', title: 'Ton premier pas', body: 'Le plus important : **prendre conscience** de tes propres tics. Dans les exercices de parole libre, je les compterai pour toi. Et réécoute-toi : c\'est souvent une révélation !' }
          ]
        },
        {
          id: 'u3l2', title: 'Le pouvoir du silence', icon: 'star', steps: [
            { type: 'info', title: 'Le silence est d\'or', body: 'Remplace chaque « euh » par une **pause**. Pour toi, une seconde de silence paraît une éternité. Pour ton public, elle paraît **réfléchie** et donne du poids à ce que tu viens de dire.' },
            { type: 'tf', statement: 'Une pause de deux secondes paraît bien plus longue à l\'orateur qu\'au public.', answer: true, explain: 'Sous l\'effet du trac, ta perception du temps s\'accélère. Le public, lui, apprécie ces respirations.' },
            { type: 'mcq', prompt: 'Où placer une pause pour un maximum d\'effet ?', options: ['Juste avant ou juste après une idée importante', 'Au milieu d\'un mot', 'Seulement à la fin du discours', 'Nulle part : il faut combler chaque silence'], answer: 0, explain: 'Une pause avant une idée crée l\'attente ; une pause après la laisse résonner.' },
            { type: 'info', title: 'Lire les pauses', body: 'Dans les textes à lire, « / » indique une **petite pause** et « // » une **grande pause**. Respire à chaque grande pause.' },
            { type: 'speak', prompt: 'Lis en marquant bien les pauses', text: 'Ce que l\'on conçoit bien / s\'énonce clairement, // et les mots pour le dire / arrivent aisément.' },
            { type: 'mcq', prompt: 'Tu perds le fil en plein discours. Que fais-tu ?', options: ['Une pause : je respire et je reprends ma dernière idée', 'Je dis « euh » jusqu\'à ce que ça revienne', 'Je m\'excuse longuement', 'Je change complètement de sujet'], answer: 0, explain: 'Le silence te donne le temps de retrouver le fil. Le public croira à une pause volontaire.' },
            { type: 'speak', prompt: 'Marque les pauses, sans « euh »', text: 'Aujourd\'hui, // je vais vous parler / d\'une idée simple : // le silence est une force.' }
          ]
        },
        {
          id: 'u3l3', title: 'Les mots béquilles', icon: 'featherFill', steps: [
            { type: 'info', title: 'Remplacer plutôt que supprimer', body: '« Du coup » et « en fait » servent souvent à relier les idées. Remplace-les par de **vrais connecteurs** : « donc », « par conséquent », « en réalité », « ainsi »…' },
            { type: 'fill', prompt: 'Remplace le tic par un vrai connecteur', sentence: 'Il pleuvait ; ___ le match a été reporté.', options: ['par conséquent', 'du coup', 'genre', 'en fait'], answer: 'par conséquent', explain: '« Du coup » est familier. « Par conséquent », « donc » ou « c\'est pourquoi » sont plus clairs.' },
            { type: 'fill', prompt: 'Choisis l\'expression la plus claire', sentence: 'On croit que c\'est facile. ___, c\'est un vrai travail.', options: ['En réalité', 'Du coup', 'Genre', 'Voilà'], answer: 'En réalité', explain: '« En réalité » (ou « pourtant ») exprime l\'opposition avec netteté, là où « en fait » sonne comme un tic.' },
            { gen: 'tics', count: 2 },
            { type: 'match', prompt: 'Trouve une alternative élégante', pairs: [['Du coup', 'Par conséquent'], ['En fait', 'En réalité'], ['Genre', 'Par exemple'], ['Voilà (pour conclure)', 'En somme']] },
            { type: 'mcq', prompt: 'Quelle phrase est la plus claire ?', options: ['Le projet est en retard, c\'est pourquoi nous renforçons l\'équipe.', 'Le projet, en fait, il est en retard, du coup on ajoute quelqu\'un.', 'Genre le projet est en retard, voilà, on ajoute quelqu\'un.', 'Le projet est en retard, en gros, du coup, voilà.'], answer: 0, explain: 'Une seule idée, un connecteur précis, aucun tic.' }
          ]
        },
        {
          id: 'u3l4', title: 'Parler sans « euh »', icon: 'micFill', steps: [
            { type: 'info', title: 'Le défi des 30 secondes', body: 'Tu vas parler 30 secondes sur un sujet simple. Objectif : **zéro tic**. Si tu sens un « euh » arriver, **ferme la bouche** et fais une pause. Je compterai tes tics.' },
            { type: 'free', prompt: 'Défi zéro tic', topic: 'Présente ton plat préféré et explique pourquoi tu l\'aimes.', prep: 15, duration: 30, focus: 'tics', tips: ['Bouche fermée avant chaque phrase', 'Une pause plutôt qu\'un « euh »', 'Des phrases courtes'] },
            { type: 'mcq', prompt: 'Quelle astuce aide à éviter le « euh » en début de phrase ?', options: ['Fermer la bouche et inspirer avant de parler', 'Commencer chaque phrase par « alors »', 'Parler plus vite', 'Regarder ses pieds'], answer: 0, explain: 'Le « euh » sort quand on ouvre la bouche avant d\'avoir sa phrase. Inspire bouche fermée, puis parle.' },
            { type: 'free', prompt: 'Défi zéro tic (2)', topic: 'Décris ta journée d\'hier, du réveil jusqu\'au coucher.', prep: 10, duration: 30, focus: 'tics', tips: ['Raconte dans l\'ordre', 'Pause entre chaque moment', 'Zéro « du coup » !'] }
          ]
        },
        {
          id: 'u3l5', title: 'Finir ses phrases avec force', icon: 'boltFill', steps: [
            { type: 'info', title: 'Les phrases qui s\'éteignent', body: 'Beaucoup d\'orateurs finissent leurs phrases par « …voilà », « …quoi », « …enfin bref », ou en laissant leur voix s\'éteindre. Résultat : l\'idée perd sa force. **Termine nettement, puis tais-toi.**' },
            { type: 'mcq', prompt: 'Quelle fin de phrase a le plus d\'impact ?', options: ['« …et c\'est pour ça que je crois en ce projet. »', '« …et c\'est pour ça que je crois en ce projet, voilà. »', '« …et c\'est pour ça, enfin bref, vous voyez. »', '« …et c\'est pour ça que, quoi. »'], answer: 0, explain: 'Une phrase qui se termine nettement, suivie d\'un silence, donne de l\'autorité.' },
            { type: 'tap', prompt: 'Touche les mots qui affaiblissent la fin', text: 'Merci de votre attention, [voilà]. J\'espère que ça vous a plu, [enfin bref], [quoi].', explain: '« Merci de votre attention. J\'espère que cela vous a plu. » : net et élégant.' },
            { type: 'tf', statement: 'Il faut garder assez de volume jusqu\'au dernier mot de la phrase.', answer: true, explain: 'La mélodie peut descendre pour marquer la fin, mais le volume doit rester audible jusqu\'au bout.' },
            { type: 'speak', prompt: 'Termine nettement', text: 'C\'est pourquoi je vous demande de soutenir ce projet.' },
            { type: 'voice', prompt: 'Une fin assurée', instruction: 'Dis cette phrase avec une fin **nette et assurée**, puis garde le silence deux secondes.', text: 'Ensemble, nous allons réussir.' }
          ]
        }
      ]
    },

    /* ================= UNITÉ 4 ================= */
    {
      id: 'u4', title: 'Enrichir son vocabulaire', desc: 'Le mot juste, au bon moment',
      color: '#3E9102', dark: '#2F6F01',
      guide: [
        'Remplace les mots passe-partout (faire, dire, chose…) par des mots précis.',
        'Un adjectif fort vaut mieux que « très » + adjectif : épuisé, ravi, immense.',
        'Un mot soutenu par phrase, pas plus, et seulement si tu es sûr(e) de son sens.',
        'Attention aux pléonasmes : « monter en haut », « prévoir à l\'avance »…',
        'À l\'oral soigné, évite « malgré que », « pallier à », « si j\'aurais ».'
      ],
      lessons: [
        {
          id: 'u4l1', title: 'Adieu les mots fades', icon: 'bookFill', steps: [
            { type: 'info', title: 'Les mots passe-partout', body: '« Faire », « dire », « avoir », « mettre », « chose », « truc »… Ces mots sont pratiques mais **flous**. Un verbe précis rend ta phrase plus claire et plus élégante : on ne « fait » pas une erreur, on la **commet**.' },
            { gen: 'verbes', count: 3 },
            { type: 'mcq', prompt: 'Quelle phrase est la plus précise ?', options: ['Ce projet comporte trois risques majeurs.', 'Il y a des choses pas bien dans ce projet.', 'Ce projet, il a des trucs qui vont pas.', 'Il y a plein de problèmes et tout ça.'], answer: 0, explain: '« Comporte », « trois », « risques majeurs » : chaque mot apporte une information.' },
            { gen: 'verbes', count: 3 }
          ]
        },
        {
          id: 'u4l2', title: 'Les mots forts', icon: 'boltFill', steps: [
            { type: 'info', title: 'Remplace « très »', body: '« Très content », « très fatigué », « très grand »… Le mot « très » affaiblit souvent ton propos. Un **adjectif fort** frappe davantage : **ravi**, **épuisé**, **immense**.' },
            { gen: 'intensifs', count: 3 },
            { gen: 'intensifs', format: 'match' },
            { gen: 'intensifs', count: 2 }
          ]
        },
        {
          id: 'u4l3', title: 'Mots soutenus (1)', icon: 'featherFill', steps: [
            { type: 'info', title: 'Des mots qui font mouche', body: 'Un mot rare, bien placé, impressionne. Mais attention : **un seul** par phrase, et seulement si tu es sûr(e) de son sens. Sinon, l\'effet est inverse !' },
            { gen: 'mots', part: 1, count: 3 },
            { gen: 'mots', part: 1, format: 'match' },
            { gen: 'mots', part: 1, format: 'reverse', count: 2 }
          ]
        },
        {
          id: 'u4l4', title: 'Mots soutenus (2)', icon: 'crown', steps: [
            { type: 'info', title: 'Encore plus de nuances', body: 'Plus ton vocabulaire est riche, plus ta pensée est précise. Astuce : chaque jour, utilise **le mot du jour** dans une vraie conversation.' },
            { gen: 'mots', part: 2, count: 3 },
            { gen: 'mots', part: 2, format: 'match' },
            { gen: 'mots', part: 2, format: 'reverse', count: 2 }
          ]
        },
        {
          id: 'u4l5', title: 'Bien parler français', icon: 'star', steps: [
            { type: 'info', title: 'Les pièges de l\'oral', body: 'Certaines fautes sont si fréquentes qu\'on ne les entend plus : « malgré que », « pallier à », « si j\'aurais »… En entretien, en exposé ou en réunion, elles peuvent nuire à ta crédibilité.' },
            { gen: 'formulations', count: 3 },
            { gen: 'pleonasmes', count: 2 },
            { gen: 'anglicismes' },
            { gen: 'formulations', count: 2 }
          ]
        }
      ]
    },

    /* ================= UNITÉ 5 ================= */
    {
      id: 'u5', title: 'Structurer sa pensée', desc: 'Connecteurs, plans et méthode PREP',
      color: '#D46A00', dark: '#A65300',
      guide: [
        'Les connecteurs logiques guident ton public comme des panneaux sur la route.',
        'PREP : Point, Raison, Exemple, Point. Parfait pour répondre en une minute.',
        'La règle de trois : trois parties, trois arguments, trois exemples.',
        'Une idée par phrase. Des phrases courtes. Des mots simples.',
        'Commence par une accroche, termine par un appel à l\'action ou un retour à l\'accroche.'
      ],
      lessons: [
        {
          id: 'u5l1', title: 'Les connecteurs logiques', icon: 'bookFill', steps: [
            { type: 'info', title: 'Les panneaux de signalisation', body: 'Les connecteurs logiques guident ton public comme des **panneaux sur la route** : « d\'abord », « cependant », « par conséquent », « enfin »… À l\'oral, ils sont encore plus précieux qu\'à l\'écrit, car on ne peut pas revenir en arrière.' },
            { gen: 'connecteurs', count: 3 },
            { gen: 'fonctions' },
            { gen: 'connecteurs', count: 3 }
          ]
        },
        {
          id: 'u5l2', title: 'La méthode PREP', icon: 'star', steps: [
            { type: 'info', title: 'PREP : convaincre en 4 temps', body: 'Pour défendre une idée en moins d\'une minute : **P**oint (ton idée), **R**aison (pourquoi), **E**xemple (une preuve concrète), **P**oint (tu répètes ton idée). Simple, clair, redoutable.' },
            { type: 'order', prompt: 'Remets cette réponse PREP dans l\'ordre', items: ['Je pense que chacun devrait faire du sport chaque jour.', 'Parce que le sport améliore la concentration et réduit le stress.', 'Par exemple, depuis que je marche 30 minutes par jour, je dors beaucoup mieux.', 'Voilà pourquoi je recommande à tous de bouger chaque jour.'], explain: 'Point → Raison → Exemple → Point.' },
            { type: 'mcq', prompt: 'Dans la méthode PREP, que signifie le E ?', options: ['Exemple', 'Émotion', 'Explication', 'Énergie'], answer: 0, explain: 'L\'exemple rend ton idée concrète et crédible.' },
            { type: 'mcq', prompt: 'Pourquoi répéter le point à la fin ?', options: ['Pour que le public retienne l\'idée principale', 'Pour gagner du temps', 'Parce qu\'on a oublié la suite', 'Pour remplir le silence'], answer: 0, explain: 'La répétition ancre le message : c\'est ce que le public emportera.' },
            { type: 'free', prompt: 'À toi : méthode PREP', topic: 'Faut-il apprendre à parler en public à l\'école ?', prep: 30, duration: 45, focus: 'structure', tips: ['Point : ton avis en une phrase', 'Raison : « parce que… »', 'Exemple : « par exemple… »', 'Point : « voilà pourquoi… »'] }
          ]
        },
        {
          id: 'u5l3', title: 'Le plan en trois parties', icon: 'bookFill', steps: [
            { type: 'info', title: 'La règle de trois', body: 'Le cerveau retient facilement **trois** éléments. Trois arguments, trois exemples, trois parties : c\'est le rythme parfait. « Je suis venu, j\'ai vu, j\'ai vaincu. »' },
            { type: 'order', prompt: 'Remets les étapes d\'un discours dans l\'ordre', items: ['L\'accroche : capter l\'attention', 'L\'annonce du plan', 'Le développement en trois idées', 'La conclusion et l\'appel à l\'action'], explain: 'Accroche, annonce, développement, conclusion : la colonne vertébrale de tout discours.' },
            { type: 'match', prompt: 'Associe chaque plan à son usage', pairs: [['Problème, causes, solutions', 'Proposer une solution'], ['Passé, présent, avenir', 'Raconter une évolution'], ['Thèse, antithèse, synthèse', 'Débattre d\'une question'], ['Avantages, inconvénients, avis', 'Aider à décider']] },
            { type: 'mcq', prompt: 'Pourquoi annoncer ton plan au début ?', options: ['Pour que le public sache où tu l\'emmènes', 'Pour allonger le discours', 'C\'est une obligation', 'Pour impressionner'], answer: 0, explain: 'Un public qui connaît le chemin suit plus facilement… et se sent rassuré.' },
            { type: 'mcq', prompt: 'Quel plan pour « Faut-il interdire la voiture en ville ? »', options: ['Thèse, antithèse, synthèse', 'Passé, présent, avenir', 'Une liste de dix idées au hasard', 'Aucun plan'], answer: 0, explain: 'Une question qui divise appelle un plan dialectique : pour, contre, puis ton avis nuancé.' },
            { type: 'tf', statement: 'Sept arguments convainquent toujours mieux que trois.', answer: false, explain: 'Au-delà de trois, le public oublie. Mieux vaut trois arguments forts que sept moyens.' }
          ]
        },
        {
          id: 'u5l4', title: 'Être concis', icon: 'featherFill', steps: [
            { type: 'info', title: 'Moins, c\'est plus', body: 'Une idée par phrase. Des phrases courtes. Des mots simples. La concision montre que tu maîtrises ton sujet, et elle respecte le temps de ton public.' },
            { type: 'mcq', prompt: 'Quelle version est la plus concise ?', options: ['Nous devons réduire nos dépenses.', 'Il serait peut-être envisageable, dans une certaine mesure, d\'envisager une réduction de nos dépenses.', 'Au niveau des dépenses, il faudrait voir à faire en sorte de les diminuer un peu.', 'Les dépenses, je pense qu\'on pourrait peut-être, si possible, les baisser.'], answer: 0, explain: 'Sujet, verbe, complément : six mots suffisent.' },
            { type: 'mcq', prompt: 'Reformule de façon concise : « Au jour d\'aujourd\'hui, à l\'heure actuelle, nous sommes en train de vivre un changement. »', options: ['Aujourd\'hui, nous vivons un changement.', 'Actuellement, au jour d\'aujourd\'hui, nous changeons.', 'Nous sommes en train de vivre, aujourd\'hui, actuellement, un changement.', 'À l\'heure d\'aujourd\'hui, ça change.'], answer: 0, explain: 'On supprime les répétitions (« aujourd\'hui », « à l\'heure actuelle ») et le « en train de ».' },
            { type: 'tf', statement: 'Les phrases longues et compliquées montrent qu\'on est intelligent.', answer: false, explain: 'Elles montrent surtout qu\'on n\'a pas fini de réfléchir. La clarté est la vraie marque de l\'intelligence.' },
            { type: 'mcq', prompt: 'Quelle phrase va droit au but ?', options: ['Je vous propose trois solutions.', 'Alors, ce que je voulais un peu vous dire, c\'est que j\'aurais peut-être des solutions.', 'Il y aurait éventuellement des pistes de solutions à explorer.', 'Bon, des solutions, il y en a, enfin je crois.'], answer: 0, explain: 'Annonce directe, chiffre précis : ton public sait immédiatement à quoi s\'attendre.' },
            { type: 'free', prompt: 'Le pitch en 20 secondes', topic: 'Explique en 20 secondes ce que tu fais dans la vie : études ou travail.', prep: 15, duration: 20, focus: 'concision', tips: ['Qui tu es', 'Ce que tu fais', 'Ce qui te passionne'] }
          ]
        },
        {
          id: 'u5l5', title: 'Accrocher et conclure', icon: 'micFill', steps: [
            { type: 'info', title: 'Les 30 premières secondes', body: 'Ton public décide très vite s\'il va t\'écouter. Ne commence pas par « Bonjour, je m\'appelle… et je vais vous parler de… ». Commence par une **accroche** : une question, une anecdote, une citation, un chiffre choc…' },
            { gen: 'accroches', count: 3 },
            { type: 'info', title: 'Une conclusion qui marque', body: 'La fin est ce que le public retient le mieux. Termine par un **appel à l\'action**, une phrase forte ou un **retour à ton accroche**. Et surtout, pas de « voilà, c\'est tout ».' },
            { type: 'mcq', prompt: 'Quelle conclusion est la plus forte ?', options: ['« Alors, dès demain, posez-vous cette question : qu\'est-ce que j\'ose dire ? »', '« Voilà, c\'est tout, merci. »', '« Bon, je crois que j\'ai fini. Des questions ? »', '« Désolé d\'avoir été un peu long. »'], answer: 0, explain: 'Un appel à l\'action laisse le public avec une mission. Ne t\'excuse jamais en conclusion !' },
            { type: 'free', prompt: 'Ton accroche', topic: 'Trouve une accroche pour un discours sur l\'importance du sommeil, puis enchaîne pendant 30 secondes.', prep: 30, duration: 30, focus: 'structure', tips: ['Question, anecdote, chiffre ou citation', 'Puis ton idée principale', 'Une phrase de fin nette'] }
          ]
        }
      ]
    },

    /* ================= UNITÉ 6 ================= */
    {
      id: 'u6', title: 'L\'art de convaincre', desc: 'Rhétorique, figures de style, sophismes',
      color: '#A55CE6', dark: '#7F3DBA',
      guide: [
        'Ethos (crédibilité), pathos (émotion), logos (logique) : combine les trois.',
        'Une anaphore (répétition en début de phrase) rend un discours mémorable.',
        'Antithèses et chiasmes créent des contrastes qui frappent l\'oreille.',
        'Repère les sophismes : attaque personnelle, homme de paille, faux dilemme…',
        'Face à une attaque, ramène calmement le débat sur les arguments.'
      ],
      lessons: [
        {
          id: 'u6l1', title: 'Ethos, pathos, logos', icon: 'crown', steps: [
            { type: 'info', title: 'Les trois leviers d\'Aristote', body: 'Il y a plus de 2 300 ans, Aristote décrivait trois façons de convaincre : l\'**ethos** (ta crédibilité), le **pathos** (les émotions du public) et le **logos** (la logique et les preuves). Les meilleurs discours combinent les trois.' },
            { type: 'match', prompt: 'Associe chaque levier à sa définition', pairs: [['Ethos', 'La crédibilité de l\'orateur'], ['Pathos', 'Les émotions du public'], ['Logos', 'La logique et les preuves']] },
            { gen: 'epl', count: 4 },
            { type: 'tf', statement: 'Un bon discours ne doit contenir que des arguments logiques.', answer: false, explain: 'La logique convainc l\'esprit, l\'émotion fait agir. Sans pathos, le public comprend… mais ne bouge pas.' }
          ]
        },
        {
          id: 'u6l2', title: 'Figures de style (1)', icon: 'featherFill', steps: [
            { type: 'info', title: 'Les épices du discours', body: 'Les figures de style rendent ton discours **mémorable**. Pas besoin d\'en mettre partout : une métaphore bien choisie ou une anaphore au bon moment suffisent à marquer les esprits.' },
            { gen: 'figures', set: 1, format: 'match' },
            { gen: 'figures', set: 1, count: 4 },
            { type: 'speak', prompt: 'Prononce cette anaphore avec conviction', text: 'Chaque jour, je travaille. Chaque jour, je progresse. Chaque jour, je me rapproche de mon but.' }
          ]
        },
        {
          id: 'u6l3', title: 'Figures de style (2)', icon: 'mask', steps: [
            { type: 'info', title: 'Jouer avec les contraires', body: 'Antithèse, oxymore, chiasme : ces figures créent des **contrastes** qui frappent l\'oreille. Molière : « Il faut manger pour vivre et non pas vivre pour manger. »' },
            { gen: 'figures', set: 2, format: 'match' },
            { gen: 'figures', set: 2, count: 4 }
          ]
        },
        {
          id: 'u6l4', title: 'Démasquer les sophismes', icon: 'boltFill', steps: [
            { type: 'info', title: 'Les pièges du raisonnement', body: 'Un **sophisme** est un argument qui a l\'air logique… mais qui ne l\'est pas. Savoir les repérer te protège de la manipulation, et t\'évite de les utiliser sans le vouloir.' },
            { gen: 'sophismes', count: 4 },
            { gen: 'sophismes', format: 'match' },
            { type: 'mcq', prompt: 'On te dit : « Tu n\'as pas d\'enfants, ton avis sur l\'école ne compte pas. » Que réponds-tu ?', options: ['« Mon argument ne dépend pas de ma vie privée : parlons des faits. »', '« Toi non plus, tu n\'es pas parfait ! »', '« Tu es méchant. »', 'Rien : je me tais'], answer: 0, explain: 'Face à une attaque personnelle, ramène calmement le débat sur les arguments.' }
          ]
        },
        {
          id: 'u6l5', title: 'Les grands discours', icon: 'star', steps: [
            { type: 'info', title: 'Apprendre des maîtres', body: 'Victor Hugo, Jean Jaurès, Émile Zola… Leurs discours ont traversé les siècles grâce au **rythme**, aux **répétitions** et aux **images**. Lis-les à voix haute pour sentir leur musique.' },
            { type: 'mcq', prompt: 'Quelle figure structure ce discours ?', quote: '« Un jour viendra où les armes vous tomberont des mains… Un jour viendra où la guerre paraîtra absurde… » (Victor Hugo)', options: ['Anaphore', 'Litote', 'Euphémisme', 'Oxymore'], answer: 0, explain: '« Un jour viendra » est répété en début de phrase : c\'est une anaphore, qui donne un souffle prophétique.' },
            { type: 'mcq', prompt: 'Quelle figure de style ?', quote: '« Il nous faut de l\'audace, encore de l\'audace, toujours de l\'audace. » (Danton)', options: ['Gradation', 'Chiasme', 'Litote', 'Euphémisme'], answer: 0, explain: '« De l\'audace, encore…, toujours… » : la répétition monte en intensité. C\'est une gradation.' },
            { gen: 'lecture', id: 'hugo-misere', prompt: 'Lis ce discours avec conviction', duration: 30 },
            { type: 'mcq', prompt: 'Quel conseil d\'éloquence donne Boileau ?', quote: '« Ce que l\'on conçoit bien s\'énonce clairement. »', options: ['Clarifie ta pensée avant de parler', 'Parle le plus vite possible', 'Utilise des mots rares', 'Apprends tout par cœur'], answer: 0, explain: 'Une pensée claire donne une parole claire.' }
          ]
        }
      ]
    },

    /* ================= UNITÉ 7 ================= */
    {
      id: 'u7', title: 'Raconter des histoires', desc: 'Captiver avec le storytelling',
      color: '#00897A', dark: '#006B5F',
      guide: [
        'Une histoire captive grâce à un obstacle à surmonter.',
        'Schéma en 5 temps : situation, déclencheur, péripéties, point culminant, fin.',
        'La trame express : Il était une fois… Chaque jour… Mais un jour… À cause de ça… Jusqu\'à ce que… Et depuis ce jour…',
        'Montre plutôt que dire : des détails qui se voient, s\'entendent, se sentent.',
        'Deux ou trois détails forts valent mieux que dix détails faibles.'
      ],
      lessons: [
        {
          id: 'u7l1', title: 'Pourquoi les histoires captivent', icon: 'bookFill', steps: [
            { type: 'info', title: 'Le pouvoir du récit', body: 'Depuis toujours, les humains se transmettent le savoir par des histoires. Les **griots** d\'Afrique de l\'Ouest en sont les maîtres : une histoire capte l\'attention, crée de l\'émotion et se retient bien mieux qu\'une liste de faits.' },
            { type: 'mcq', prompt: 'Pourquoi une anecdote rend-elle un discours plus efficace ?', options: ['Elle crée de l\'émotion et se retient facilement', 'Elle rallonge le discours', 'Elle évite de donner des arguments', 'Elle fait toujours rire'], answer: 0, explain: 'Le cerveau retient les histoires bien mieux que les faits isolés.' },
            { type: 'tf', statement: 'Une bonne anecdote dans un discours doit durer au moins dix minutes.', answer: false, explain: 'De 30 secondes à 2 minutes suffisent souvent. L\'essentiel : qu\'elle serve ton message.' },
            { type: 'mcq', prompt: 'Qu\'est-ce qu\'un griot ?', options: ['Un conteur, gardien de la parole en Afrique de l\'Ouest', 'Un instrument de musique', 'Un plat traditionnel', 'Un type de discours politique'], answer: 0, explain: 'Le griot est poète, musicien, généalogiste et conteur : la mémoire vivante de la communauté, et un maître de l\'éloquence.' },
            { type: 'mcq', prompt: 'Quel ingrédient rend une histoire captivante ?', options: ['Un obstacle à surmonter', 'Une longue liste de dates', 'Beaucoup de détails techniques', 'Une fin annoncée dès le début'], answer: 0, explain: 'Sans obstacle, pas de suspense. Le public veut savoir comment le héros va s\'en sortir.' }
          ]
        },
        {
          id: 'u7l2', title: 'La structure en 5 temps', icon: 'star', steps: [
            { type: 'info', title: 'Le schéma narratif', body: 'La plupart des histoires suivent 5 étapes : **la situation initiale**, **l\'élément déclencheur**, **les péripéties**, **le point culminant** et **la situation finale**.' },
            { type: 'order', prompt: 'Remets l\'histoire d\'Awa dans l\'ordre', items: awa, explain: 'Situation, déclencheur, péripéties, point culminant, situation finale.' },
            { type: 'match', prompt: 'Associe chaque étape à son rôle', pairs: [['Situation initiale', 'Présenter le héros'], ['Élément déclencheur', 'Le problème qui lance l\'histoire'], ['Péripéties', 'Les obstacles et les efforts'], ['Point culminant', 'Le moment de vérité'], ['Situation finale', 'Ce qui a changé']] },
            { type: 'mcq', prompt: 'Dans l\'histoire d\'Awa, quel est l\'élément déclencheur ?', options: ['L\'annonce de l\'exposé devant toute l\'école', 'Sa timidité', 'Ses semaines d\'entraînement', 'Son élection comme déléguée'], answer: 0, explain: 'C\'est l\'événement qui bouscule la vie d\'Awa et lance l\'histoire.' }
          ]
        },
        {
          id: 'u7l3', title: 'La trame express', icon: 'featherFill', steps: [
            { type: 'info', title: 'Une recette d\'histoire', body: 'Cette trame, imaginée par l\'auteur de théâtre Kenn Adams et rendue célèbre par les studios Pixar, permet d\'inventer une histoire en quelques secondes : **Il était une fois… Chaque jour… Mais un jour… À cause de ça… Jusqu\'à ce que… Et depuis ce jour…**' },
            { type: 'order', prompt: 'Remets la trame dans l\'ordre', items: ['Il était une fois…', 'Chaque jour…', 'Mais un jour…', 'À cause de ça…', 'Jusqu\'à ce que, finalement…', 'Et depuis ce jour…'] },
            { type: 'order', prompt: 'Remets cette mini-histoire dans l\'ordre', items: ['Il était une fois un jeune vendeur de jus au marché.', 'Chaque jour, il criait les mêmes mots, et peu de clients s\'arrêtaient.', 'Mais un jour, il décida de raconter l\'histoire de ses mangues aux passants.', 'À cause de ça, les gens s\'arrêtaient pour l\'écouter, puis achetaient.', 'Jusqu\'à ce que, finalement, sa file d\'attente devienne la plus longue du marché.', 'Et depuis ce jour, il sait qu\'une histoire vend mieux qu\'un slogan.'] },
            { type: 'free', prompt: 'Improvise avec la trame', topic: 'Raconte une histoire avec la trame express. Ton héros : un vieux baobab.', prep: 30, duration: 60, focus: 'general', tips: ['Il était une fois… / Chaque jour…', 'Mais un jour… / À cause de ça…', 'Jusqu\'à ce que… / Et depuis ce jour…'] }
          ]
        },
        {
          id: 'u7l4', title: 'Les détails qui font vivre', icon: 'mask', steps: [
            { type: 'info', title: 'Montrer plutôt que dire', body: 'Au lieu de dire « J\'avais peur », **montre-le** : « Mes mains tremblaient, ma bouche était sèche, j\'entendais mon cœur battre. » Les détails sensoriels plongent ton public dans l\'histoire.' },
            { type: 'mcq', prompt: 'Quelle phrase « montre » au lieu de « dire » ?', options: ['Mes mains tremblaient et ma voix se brisait.', 'J\'étais très stressé.', 'J\'avais peur, vraiment peur.', 'C\'était un moment stressant.'], answer: 0, explain: 'On voit les mains, on entend la voix : le public ressent le stress sans qu\'on le nomme.' },
            { type: 'mcq', prompt: 'Quelle phrase plonge le plus dans l\'ambiance d\'un marché ?', options: ['L\'odeur des beignets chauds se mêlait aux cris des vendeuses.', 'Le marché était animé.', 'Il y avait beaucoup de monde au marché.', 'C\'était un marché normal.'], answer: 0, explain: 'Une odeur et un son : deux détails suffisent à faire vivre la scène.' },
            { type: 'match', prompt: 'Associe chaque détail au sens qu\'il éveille', pairs: [['Le parfum du café', 'L\'odorat'], ['Le grondement du tonnerre', 'L\'ouïe'], ['La chaleur du sable', 'Le toucher'], ['Le ciel orangé du soir', 'La vue']] },
            { type: 'tf', statement: 'Plus on ajoute de détails, meilleure est l\'histoire.', answer: false, explain: 'Choisis deux ou trois détails forts. Trop de détails noient l\'action.' },
            { type: 'voice', prompt: 'Fais vivre le suspense', instruction: 'Ralentis, baisse un peu la voix, fais sentir le **suspense**.', text: 'La porte grinça lentement… et dans le noir, quelqu\'un murmura mon nom.' }
          ]
        },
        {
          id: 'u7l5', title: 'Raconte ton anecdote', icon: 'micFill', steps: [
            { type: 'info', title: 'À toi de raconter', body: 'Choisis un vrai souvenir. Suis la structure : situation, déclencheur, obstacles, moment fort, ce que tu en as appris. Ajoute **deux détails sensoriels**.' },
            { type: 'free', prompt: 'Ton anecdote', topic: 'Raconte un moment où tu as eu très peur ou très honte, et ce que tu en as appris.', prep: 45, duration: 90, focus: 'general', tips: ['Où, quand, qui ?', 'Le problème, les obstacles', 'Le moment fort', 'Ce que tu en as appris'] }
          ]
        }
      ]
    },

    /* ================= UNITÉ 8 ================= */
    {
      id: 'u8', title: 'Improvisation et répartie', desc: 'Parler sans préparation, rebondir sur tout',
      color: '#E02F2F', dark: '#B32020',
      guide: [
        '« Oui, et… » : accepte l\'idée et développe-la au lieu de la bloquer.',
        'Pour improviser, utilise une structure express : passé, présent, avenir.',
        'Question piège : respire, reformule, réponds brièvement, ramène à ton message.',
        'Tu ne sais pas ? Dis-le : « Je vérifie et je reviens vers vous. »',
        'Défendre les deux camps d\'un débat te rend redoutable.'
      ],
      lessons: [
        {
          id: 'u8l1', title: 'Oui, et…', icon: 'bubble', steps: [
            { type: 'info', title: 'La règle d\'or de l\'impro', body: 'En théâtre d\'improvisation, on ne dit pas « non, mais ». On dit « **oui, et…** » : on accepte l\'idée et on la développe. Dans la vie, ça rend les échanges plus fluides et te permet de rebondir sur tout.' },
            { type: 'mcq', prompt: '« Et si on faisait la réunion dehors ? » Quelle réponse suit le principe « oui, et » ?', options: ['« Oui, et on pourrait marcher en discutant ! »', '« Non, il fait trop chaud. »', '« Oui, mais ça ne marchera jamais. »', '« Pourquoi pas… enfin bon. »'], answer: 0, explain: 'Tu acceptes l\'idée et tu l\'enrichis : la conversation avance.' },
            { type: 'tf', statement: 'Improviser, c\'est parler sans aucune structure.', answer: false, explain: 'Les bons improvisateurs utilisent des structures simples (PREP, passé-présent-avenir, la trame d\'histoire) qu\'ils remplissent sur le moment.' },
            { type: 'mcq', prompt: 'On te demande de parler une minute sans préparation. Quelle structure express ?', options: ['Passé, présent, avenir', 'Aucune, on verra bien', 'Une liste de douze idées', 'Réciter un texte appris'], answer: 0, explain: 'Hier, aujourd\'hui, demain : ça marche pour presque tous les sujets.' },
            { gen: 'impro', prep: 15, duration: 30, pool: 'fun' }
          ]
        },
        {
          id: 'u8l2', title: 'Une minute sur n\'importe quoi', icon: 'boltFill', steps: [
            { type: 'info', title: 'L\'entraînement roi', body: 'Parler une minute sur un sujet tiré au hasard : c\'est **l\'exercice le plus efficace** pour gagner en aisance. Tu as 20 secondes pour trouver ton angle : une idée principale, deux arguments ou une anecdote.' },
            { gen: 'impro', prep: 20, duration: 60 },
            { gen: 'impro', prep: 20, duration: 60 }
          ]
        },
        {
          id: 'u8l3', title: 'Les mots imposés', icon: 'star', steps: [
            { type: 'info', title: 'Trois mots, une histoire', body: 'Je vais te donner **trois mots au hasard**. Invente une histoire qui les utilise tous. Cet exercice muscle ta créativité et ta capacité à relier des idées.' },
            { gen: 'motsImposes', prep: 20, duration: 60 },
            { gen: 'motsImposes', prep: 20, duration: 45 }
          ]
        },
        {
          id: 'u8l4', title: 'Les questions difficiles', icon: 'mask', steps: [
            { type: 'info', title: 'Garder la main', body: 'Face à une question piège : **1.** respire ; **2.** reformule la question ; **3.** réponds brièvement ; **4.** ramène vers ton message. Et si tu ne sais pas, dis-le : « Je ne sais pas, mais je vais vérifier. »' },
            { type: 'mcq', prompt: 'On te pose une question dont tu ignores la réponse. Que fais-tu ?', options: ['« Bonne question. Je n\'ai pas le chiffre exact : je vous le transmets demain. »', 'J\'invente une réponse avec aplomb', 'Je fais semblant de ne pas avoir entendu', 'Je réponds à côté, longuement'], answer: 0, explain: 'L\'honnêteté renforce ta crédibilité. Inventer, c\'est risquer de la perdre.' },
            { type: 'mcq', prompt: 'À quoi sert de reformuler une question avant d\'y répondre ?', options: ['Vérifier qu\'on a bien compris et gagner un temps de réflexion', 'Faire perdre du temps', 'Montrer que la question est bête', 'Éviter de répondre'], answer: 0, explain: 'Tu t\'assures de répondre à la bonne question… et ton cerveau prépare la réponse.' },
            { type: 'mcq', prompt: 'Quelqu\'un t\'interrompt : « C\'est n\'importe quoi ! » Quelle réponse est la plus habile ?', options: ['« Je vois que ce point vous fait réagir. Qu\'est-ce qui vous gêne exactement ? »', '« C\'est vous qui dites n\'importe quoi ! »', 'L\'ignorer et parler plus fort', '« Si vous n\'êtes pas content, partez. »'], answer: 0, explain: 'Accueillir l\'émotion et poser une question ouverte désamorce le conflit et te garde en position de force.' },
            { type: 'order', prompt: 'Remets la méthode dans l\'ordre', items: ['Respirer', 'Reformuler la question', 'Répondre brièvement', 'Ramener à ton message'] },
            { gen: 'entretien', prep: 20, duration: 45 }
          ]
        },
        {
          id: 'u8l5', title: 'L\'avocat du diable', icon: 'crown', steps: [
            { type: 'info', title: 'Défendre les deux camps', body: 'Les grands débatteurs savent défendre **n\'importe quelle position**. Je vais te donner une affirmation : défends-la d\'abord, puis attaque-la. Tu comprendras mieux les arguments adverses… et tu deviendras redoutable.' },
            { gen: 'debat', prep: 20, duration: 45 }
          ]
        }
      ]
    },

    /* ================= UNITÉ 9 ================= */
    {
      id: 'u9', title: 'Voix et expressivité', desc: 'Débit, intonation, pauses, emphase',
      color: '#5148D9', dark: '#3B33B0',
      guide: [
        'Débit idéal : environ 130 à 160 mots par minute. Ralentis sur l\'essentiel.',
        'Le stress fait accélérer : ralentis volontairement au début.',
        'L\'intonation donne le sens : une voix qui monte et descend garde le public éveillé.',
        'Pour souligner un mot : appuie dessus et fais une pause juste avant.',
        'Joue avec quatre curseurs : volume, hauteur, débit, pauses.'
      ],
      lessons: [
        {
          id: 'u9l1', title: 'Le bon débit', icon: 'micFill', steps: [
            { type: 'info', title: 'Ni trop vite, ni trop lent', body: 'À l\'oral, un débit agréable se situe autour de **130 à 160 mots par minute**. Trop vite, le public décroche ; trop lent, il s\'ennuie. Le secret : **varier** ton débit selon l\'importance de ce que tu dis.' },
            { type: 'mcq', prompt: 'Quand faut-il ralentir ?', options: ['Sur les idées importantes et les chiffres clés', 'Sur les transitions', 'Pendant les remerciements', 'Jamais'], answer: 0, explain: 'Ralentir, c\'est dire à ton public : « Attention, ceci est important. »' },
            { type: 'tf', statement: 'Le stress pousse la plupart des gens à parler plus vite.', answer: true, explain: 'L\'adrénaline accélère tout. Ralentis volontairement, surtout au début.' },
            { gen: 'lecture', id: 'ahouefa', prompt: 'Lis ce texte à un rythme posé : je mesure ton débit', duration: 30, focus: 'debit' },
            { type: 'mcq', prompt: 'Ton analyse indique 210 mots par minute. Que faire ?', options: ['Ralentir et marquer davantage de pauses', 'Accélérer encore', 'Parler plus bas', 'Supprimer les pauses'], answer: 0, explain: 'À ce rythme, le public perd le fil. Les pauses sont ton meilleur frein.' }
          ]
        },
        {
          id: 'u9l2', title: 'Mettre le ton', icon: 'mask', steps: [
            { type: 'info', title: 'La mélodie de la voix', body: 'Une même phrase peut exprimer la joie, la colère, la surprise ou l\'inquiétude. C\'est l\'**intonation** qui donne le sens. Une voix qui monte et descend garde le public en éveil ; une voix plate l\'endort.' },
            { type: 'voice', prompt: 'Avec joie', emotion: 'Joie', instruction: 'Dis cette phrase avec **joie**, comme une excellente nouvelle !', text: 'Il est arrivé ce matin.', showPitch: true },
            { type: 'voice', prompt: 'Avec surprise', emotion: 'Surprise', instruction: 'Maintenant avec **surprise**, comme si tu n\'en croyais pas tes oreilles !', text: 'Il est arrivé ce matin.', showPitch: true },
            { type: 'voice', prompt: 'Avec inquiétude', emotion: 'Inquiétude', instruction: 'Maintenant avec **inquiétude**, comme une nouvelle qui te préoccupe.', text: 'Il est arrivé ce matin.', showPitch: true },
            { type: 'mcq', prompt: 'À l\'oral, quelle intonation marque une question ?', options: ['La voix monte en fin de phrase', 'La voix descend en fin de phrase', 'La voix reste plate', 'On parle plus fort'], answer: 0, explain: '« Tu viens ? » : la mélodie monte. « Tu viens. » : elle descend.' },
            { type: 'mcq', prompt: 'Qu\'est-ce qu\'une voix monotone ?', options: ['Une voix qui reste sur la même hauteur, sans variation', 'Une voix trop forte', 'Une voix aiguë', 'Une voix avec un accent'], answer: 0, explain: 'La monotonie endort. Dans tes analyses, je mesure la variation de ta voix.' }
          ]
        },
        {
          id: 'u9l3', title: 'Pauses et emphase', icon: 'star', steps: [
            { type: 'info', title: 'Souligner à l\'oral', body: 'À l\'écrit, on souligne en gras. À l\'oral, on **appuie** sur un mot (un peu plus fort, un peu plus lent) et on fait une **pause** juste avant ou après. Dans les textes, les mots en gras sont à appuyer.' },
            { type: 'mcq', prompt: '« **JE** n\'ai pas dit qu\'il avait volé l\'argent. » Que comprend-on ?', options: ['Quelqu\'un d\'autre l\'a dit', 'Il a volé autre chose', 'Il l\'a seulement emprunté', 'Personne ne l\'a volé'], answer: 0, explain: 'En appuyant sur « je », on sous-entend : « ce n\'est pas moi qui l\'ai dit ».' },
            { type: 'mcq', prompt: '« Je n\'ai pas dit qu\'il avait volé **L\'ARGENT**. » Que comprend-on ?', options: ['Il a volé autre chose', 'Quelqu\'un d\'autre l\'a dit', 'Il l\'a seulement emprunté', 'Je l\'ai écrit, pas dit'], answer: 0, explain: 'L\'accent porte sur l\'objet : ce n\'est pas l\'argent qui a été volé.' },
            { type: 'mcq', prompt: '« Je n\'ai pas dit qu\'il avait **VOLÉ** l\'argent. » Que comprend-on ?', options: ['Il a pris l\'argent autrement : emprunté, trouvé…', 'Quelqu\'un d\'autre l\'a dit', 'Il a volé autre chose', 'Ce n\'est pas lui'], answer: 0, explain: 'Un seul mot appuyé change tout le sens de la phrase. C\'est la force de l\'emphase !' },
            { gen: 'lecture', id: 'jaures-courage', prompt: 'Lis en appuyant sur les mots en gras', duration: 30 }
          ]
        },
        {
          id: 'u9l4', title: 'Varier sa voix', icon: 'micFill', steps: [
            { type: 'info', title: 'Les 4 curseurs de la voix', body: 'Tu disposes de quatre curseurs : le **volume** (fort / doux), la **hauteur** (grave / aigu), le **débit** (rapide / lent) et les **pauses**. Un orateur captivant les fait varier en permanence.' },
            { type: 'match', prompt: 'Associe chaque intention à l\'effet de voix', pairs: [['Créer le suspense', 'Ralentir et baisser le volume'], ['Montrer l\'enthousiasme', 'Accélérer et monter dans les aigus'], ['Asseoir son autorité', 'Voix grave et posée'], ['Souligner un mot clé', 'Pause juste avant']] },
            { type: 'voice', prompt: 'Le suspense', instruction: 'Crée le **suspense** : ralentis, baisse le volume, fais une vraie pause sur les points de suspension.', text: 'Et c\'est là… que tout a basculé.', showPitch: true },
            { type: 'voice', prompt: 'L\'enthousiasme', instruction: 'Avec **enthousiasme** et énergie, comme un présentateur de spectacle !', text: 'Mesdames et messieurs, voici enfin le moment que vous attendiez tous !', showPitch: true },
            { type: 'tf', statement: 'Pour paraître sûr de soi, il faut parler fort en permanence.', answer: false, explain: 'L\'assurance vient de la maîtrise : savoir parler doucement, puis fort, au bon moment.' }
          ]
        },
        {
          id: 'u9l5', title: 'Lire un grand texte', icon: 'crown', steps: [
            { type: 'info', title: 'La lecture expressive', body: 'Lire à voix haute est un excellent entraînement : articulation, souffle, pauses et ton. Respecte les pauses marquées et **appuie** sur les mots en gras.' },
            { gen: 'lecture', id: 'corbeau', duration: 45 },
            { gen: 'lecture', id: 'cyrano', duration: 15 }
          ]
        }
      ]
    },

    /* ================= UNITÉ 10 ================= */
    {
      id: 'u10', title: 'Prendre la parole en public', desc: 'Corps, pitch, entretien, grand oral',
      color: '#C026D3', dark: '#9A1BA8',
      guide: [
        'Ton corps doit dire la même chose que tes mots.',
        'Regarde chaque personne 3 à 5 secondes, puis passe à une autre zone.',
        'Pitch : qui je suis, ce que j\'ai accompli, ce que je cherche.',
        'En entretien, raconte tes expériences avec la méthode STAR.',
        'Relance l\'attention : question, anecdote, changement de rythme.'
      ],
      lessons: [
        {
          id: 'u10l1', title: 'Le langage du corps', icon: 'star', steps: [
            { type: 'info', title: 'Ton corps parle avant toi', body: 'Regard, gestes, sourire, posture : ton corps doit **dire la même chose** que tes mots. Si tu dis « je suis ravi d\'être ici » les bras croisés, c\'est ton corps que le public croira.' },
            { type: 'mcq', prompt: 'Combien de temps regarder une personne du public ?', options: ['Environ 3 à 5 secondes, puis passer à une autre', 'Moins d\'une demi-seconde', 'Pendant tout le discours', 'Ne regarder personne'], answer: 0, explain: 'Assez pour créer un lien, pas assez pour mettre mal à l\'aise.' },
            { type: 'mcq', prompt: 'Quel geste renforce une énumération de trois arguments ?', options: ['Compter sur ses doigts : un, deux, trois', 'Croiser les bras', 'Se toucher le visage', 'Mettre les mains dans les poches'], answer: 0, explain: 'Le geste illustre la structure : le public voit où tu en es.' },
            { type: 'tf', statement: 'Sourire au début d\'un discours aide à créer un lien avec le public.', answer: true, explain: 'Le sourire détend… le public comme l\'orateur !' },
            { type: 'match', prompt: 'Associe chaque attitude à ce qu\'elle trahit', pairs: [['Se toucher le cou', 'Nervosité'], ['Lire ses notes sans arrêt', 'Manque de préparation'], ['Avancer d\'un pas vers le public', 'Implication'], ['Paumes ouvertes vers le public', 'Ouverture']] },
            { type: 'info', mood: 'happy', title: 'Le miroir', body: 'Dans l\'onglet **Entraînement**, l\'outil **Miroir** te permet de te filmer pendant que tu parles. Observe ta posture et tes gestes : c\'est le meilleur des professeurs !' }
          ]
        },
        {
          id: 'u10l2', title: 'Se présenter en 60 secondes', icon: 'micFill', steps: [
            { type: 'info', title: 'Le pitch personnel', body: 'Savoir te présenter en une minute est une arme pour les entretiens, les réseaux et les rencontres. Structure : **qui je suis** (une phrase), **ce que j\'ai accompli** (une ou deux preuves), **ce que je cherche**.' },
            { type: 'order', prompt: 'Remets ce pitch dans l\'ordre', items: ['Je m\'appelle Koffi, je suis étudiant en commerce.', 'L\'an dernier, j\'ai organisé un salon qui a réuni trois cents visiteurs.', 'J\'adore convaincre et rassembler des gens autour d\'un projet.', 'Aujourd\'hui, je cherche un stage en marketing pour développer ces talents.'], explain: 'Qui je suis → une preuve → ce qui me motive → ce que je cherche.' },
            { type: 'mcq', prompt: 'Quelle première phrase de pitch est la plus percutante ?', options: ['« J\'aide les petites entreprises à trouver leurs premiers clients. »', '« Alors, euh, je vais essayer de me présenter. »', '« Je suis quelqu\'un de très motivé et dynamique. »', '« Je ne sais pas trop par où commencer. »'], answer: 0, explain: 'Une phrase concrète qui dit ce que tu apportes vaut mieux que des adjectifs que tout le monde utilise.' },
            { type: 'free', prompt: 'Ton pitch', topic: 'Présente-toi en 60 secondes : qui tu es, ce que tu as accompli, ce que tu cherches.', prep: 45, duration: 60, focus: 'general', tips: ['Qui je suis', 'Une ou deux réussites concrètes', 'Ce que je cherche'] }
          ]
        },
        {
          id: 'u10l3', title: 'L\'entretien d\'embauche', icon: 'crown', steps: [
            { type: 'info', title: 'Les questions classiques', body: 'Certaines questions reviennent dans presque tous les entretiens. Les préparer **à voix haute** fait toute la différence. Pour raconter une expérience, utilise la méthode **STAR** : Situation, Tâche, Action, Résultat.' },
            { type: 'order', prompt: 'Remets la méthode STAR dans l\'ordre', items: ['Situation : le contexte', 'Tâche : ce que tu devais faire', 'Action : ce que tu as fait concrètement', 'Résultat : ce que ça a donné'] },
            { type: 'mcq', prompt: '« Quel est votre plus grand défaut ? » Quelle réponse est la meilleure ?', options: ['« Je peux être impatient. J\'ai appris à planifier mes projets pour mieux accepter les délais. »', '« Je suis trop perfectionniste. »', '« Je n\'ai aucun défaut. »', '« Je suis souvent en retard, mais ce n\'est pas grave. »'], answer: 0, explain: 'Un vrai défaut, assumé, suivi de ce que tu fais pour progresser : honnête et rassurant.' },
            { gen: 'entretien', prep: 30, duration: 60 }
          ]
        },
        {
          id: 'u10l4', title: 'Captiver son public', icon: 'boltFill', steps: [
            { type: 'info', title: 'Garder l\'attention', body: 'L\'attention du public baisse au bout de quelques minutes. Relance-la : pose une **question**, raconte une **anecdote**, change de **rythme**, montre un **objet**, fais **participer**.' },
            { type: 'mcq', prompt: 'Tu sens que le public décroche. Que fais-tu ?', options: ['Je pose une question à la salle ou je raconte une anecdote', 'J\'accélère pour finir plus tôt', 'Je lis mes notes avec plus d\'attention', 'Je continue comme si de rien n\'était'], answer: 0, explain: 'Une rupture de rythme réveille l\'attention.' },
            { type: 'mcq', prompt: 'Avant de préparer un discours, quelle est la première question à te poser ?', options: ['Qui est mon public et qu\'attend-il ?', 'Quelle police pour mes diapositives ?', 'Combien de blagues placer ?', 'Quelle tenue porter ?'], answer: 0, explain: 'Tout part du public : son niveau, ses attentes, ses préoccupations.' },
            { type: 'tf', statement: 'Un même discours fonctionne aussi bien devant des enfants que devant des experts.', answer: false, explain: 'Adapte toujours ton vocabulaire, tes exemples et ta durée à ton public.' },
            { type: 'match', prompt: 'Associe chaque technique à son effet', pairs: [['Question à la salle', 'Réveille l\'attention'], ['Anecdote personnelle', 'Crée l\'émotion'], ['Silence de trois secondes', 'Prépare une idée forte'], ['Objet montré', 'Rend l\'idée concrète']] }
          ]
        },
        {
          id: 'u10l5', title: 'Le grand oral', icon: 'crown', steps: [
            { type: 'info', mood: 'celebrate', title: 'Ton grand oral', body: 'C\'est le moment de tout réunir : accroche, plan, connecteurs, voix posée, pauses, regard, conclusion forte. Tu as **1 minute** de préparation et **2 minutes** pour convaincre. Je suis tellement fière de ton parcours !' },
            { gen: 'impro', pool: 'societe', prompt: 'Le grand oral', prep: 60, duration: 120, focus: 'complet', tips: ['Une accroche', 'Trois idées reliées par des connecteurs', 'Une conclusion forte'] }
          ]
        }
      ]
    }
  ];

  /* ---------- Accès et progression ---------- */
  var C = { units: UNITS };

  C.allLessons = function () {
    var out = [];
    UNITS.forEach(function (u, ui) {
      u.lessons.forEach(function (l, li) { out.push({ unit: u, lesson: l, ui: ui, li: li }); });
    });
    return out;
  };

  /* Ordre des nœuds d'une unité : 3 leçons, un coffre, 2 leçons, la révision. */
  C.nodes = function (u) {
    var n = [];
    u.lessons.forEach(function (l, i) {
      n.push({ kind: 'lesson', id: l.id, lesson: l });
      if (i === 2) n.push({ kind: 'chest', id: u.id + '-chest' });
    });
    n.push({ kind: 'review', id: u.id + '-review' });
    return n;
  };

  C.find = function (id) {
    for (var i = 0; i < UNITS.length; i++) {
      var u = UNITS[i];
      if (u.id + '-review' === id) return { unit: u, review: true, ui: i };
      for (var j = 0; j < u.lessons.length; j++) if (u.lessons[j].id === id) return { unit: u, lesson: u.lessons[j], ui: i, li: j };
    }
    return null;
  };

  function done(id) { var p = App.Store.get().progress[id]; return !!(p && p.count > 0); }
  C.isDone = done;

  /* Séquence linéaire de tous les nœuds (pour savoir lequel est débloqué). */
  C.sequence = function () {
    var seq = [];
    UNITS.forEach(function (u) { C.nodes(u).forEach(function (n) { seq.push(Object.assign({ unit: u }, n)); }); });
    return seq;
  };
  C.nodeDone = function (n) {
    if (n.kind === 'chest') return !!App.Store.get().chests[n.id];
    return done(n.id);
  };
  /* Un nœud est disponible si tous les nœuds précédents (hors coffres) sont faits. */
  C.state = function () {
    var seq = C.sequence();
    var map = {}, currentFound = false, current = null;
    for (var i = 0; i < seq.length; i++) {
      var n = seq[i];
      var isDone = C.nodeDone(n);
      if (isDone) { map[n.id] = 'done'; continue; }
      if (n.kind === 'chest') {
        map[n.id] = currentFound ? 'locked' : 'open';
        continue;
      }
      if (!currentFound) { map[n.id] = 'current'; currentFound = true; current = n; }
      else map[n.id] = 'locked';
    }
    return { map: map, current: current };
  };
  C.unitDone = function (u) { return done(u.id + '-review'); };
  C.unitProgress = function (u) {
    var ids = u.lessons.map(function (l) { return l.id; }).concat([u.id + '-review']);
    return ids.filter(done).length / ids.length;
  };

  /* Révision d'unité : exercices notés tirés de toutes les leçons de l'unité. */
  C.reviewSteps = function (u, n) {
    var steps = [];
    u.lessons.forEach(function (l) { steps = steps.concat(App.Gen.resolve(l.steps)); });
    var graded = steps.filter(function (s) { return /^(mcq|tf|fill|order|match|tap)$/.test(s.type); });
    var speak = steps.filter(function (s) { return s.type === 'speak'; });
    var pick = App.U.sample(graded, (n || 10) - (speak.length ? 2 : 0)).concat(App.U.sample(speak, 2));
    return App.U.shuffle(pick);
  };

  App.Course = C;
})(window.App = window.App || {});

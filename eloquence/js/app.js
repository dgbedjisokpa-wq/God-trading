/* Démarrage, navigation (routes #/...), barre latérale, barre du haut, colonne de droite. */
(function (App) {
  'use strict';

  var U = App.U, h = U.h, Store = App.Store, P = App.Pages;

  var NAV = [
    { id: 'apprendre', label: 'Apprendre', icon: 'home' },
    { id: 'entrainement', label: 'Entraînement', icon: 'mic' },
    { id: 'quetes', label: 'Quêtes', icon: 'target' },
    { id: 'profil', label: 'Profil', icon: 'user' },
    { id: 'boutique', label: 'Boutique', icon: 'shop' },
    { id: 'reglages', label: 'Réglages', icon: 'settings', desktopOnly: true }
  ];

  function route() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    var page = parts[0] || 'apprendre';
    if (!NAV.some(function (n) { return n.id === page; })) page = 'apprendre';
    return { page: page, sub: parts[1] || '' };
  }

  App.applyTheme = function () {
    var s = Store.get().settings;
    var d = document.documentElement;
    // En « auto », on ne retire l'attribut que si c'est nous qui l'avions posé (l'hôte peut imposer son thème)
    if (s.theme === 'light' || s.theme === 'dark') { d.setAttribute('data-theme', s.theme); App._themeSet = true; }
    else if (App._themeSet) { d.removeAttribute('data-theme'); App._themeSet = false; }
    d.classList.toggle('reduce-motion', !!s.reduceMotion);
    var dark = s.theme === 'dark' || (s.theme !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#15101C' : '#FFFFFF');
  };

  /* ---------- Éléments de la coque ---------- */
  function statsBar() {
    var s = Store.get();
    var practicedToday = Store.practicedOn(U.dayKey());
    var lv = Store.level();
    return h('div.stats', null, [
      h('a.stat.lvl', { href: '#/profil', title: 'Niveau ' + lv.level + ' : ' + lv.title, 'aria-label': 'Niveau ' + lv.level }, h('span.lvl-badge', { text: String(lv.level) })),
      h('a.stat.flame' + (practicedToday ? '' : '.off'), {
        href: '#/profil', title: s.streak.count + ' jours de série',
        'aria-label': s.streak.count + ' jours de série', html: App.icon(practicedToday ? 'flame' : 'flameOff') + '<span>' + s.streak.count + '</span>'
      }),
      h('a.stat.gem', { href: '#/boutique', title: s.gems + ' améthystes', 'aria-label': s.gems + ' améthystes', html: App.icon('gem') + '<span>' + s.gems + '</span>' }),
      Store.boostActive() ? h('span.stat', { title: 'Boost d\'XP actif', html: App.icon('xp') + '<span>×2</span>' }) : null
    ]);
  }

  function navLinks(cur, mobile) {
    var dot = Store.unclaimedQuests() > 0;
    return NAV.filter(function (n) { return !(mobile && n.desktopOnly); }).map(function (n) {
      var a = h('a.nav-item' + (cur === n.id ? '.active' : ''), {
        href: '#/' + n.id, 'aria-label': n.label, 'aria-current': cur === n.id ? 'page' : null,
        html: App.icon(n.icon) + '<span class="nav-lbl">' + U.esc(n.label) + '</span>'
      });
      if (n.id === 'quetes' && dot) a.appendChild(h('i.nav-dot', { 'aria-label': 'Récompense à récupérer' }));
      return a;
    });
  }

  function aside() {
    var s = Store.get();
    var box = h('aside.aside', { 'aria-label': 'Ta progression' });
    box.appendChild(h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, statsBar()));

    // Objectif du jour
    var goal = s.profile.dailyGoal || 20, today = Store.todayXP();
    box.appendChild(h('div.card', null, [
      h('h3', { text: 'Objectif du jour' }),
      h('div.goal-row', null, [
        h('span', { html: App.icon('goal') }),
        h('div.bar', { role: 'progressbar', 'aria-valuenow': String(Math.min(today, goal)), 'aria-valuemin': '0', 'aria-valuemax': String(goal), 'aria-label': 'Objectif du jour' }, [
          h('i', { style: { width: Math.round(Math.min(1, today / goal) * 100) + '%' } }), h('span.bar-label', { text: today + ' / ' + goal + ' XP' })
        ])
      ])
    ]));

    // Quêtes
    var qc = h('div.card', null, [h('h3', null, ['Quêtes du jour', h('a', { href: '#/quetes', text: 'Voir tout' })])]);
    Store.quests().forEach(function (q) {
      var qt = Store.QUEST_TYPES[q.type];
      qc.appendChild(h('div.quest-mini', null, [
        h('span', { html: App.icon(qt.icon) }),
        h('div.grow', null, [
          h('div.t', { text: Store.questLabel(q) }),
          h('div.bar', { style: { height: '12px' } }, h('i', { style: { width: Math.round(q.progress / q.target * 100) + '%' } }))
        ]),
        q.claimed ? h('span', { html: App.icon('check'), style: { color: 'var(--green)' } }) : h('span', { html: App.icon('gem') })
      ]));
    });
    box.appendChild(qc);

    // Mot du jour
    var w = P.wordOfDay();
    box.appendChild(h('div.card.word-card', null, [
      h('h3', null, ['Mot du jour', App.Speech.ttsSupported() ? h('button.round-mini', { type: 'button', 'aria-label': 'Écouter le mot du jour', html: App.icon('volume'), onclick: function () { App.Speech.say(w.w + '. ' + w.d + ' ' + w.ex); } }) : null]),
      h('div.w', { text: w.w }),
      h('div.d', { text: w.d }),
      h('div.ex', { text: '« ' + w.ex + ' »' })
    ]));

    var cit = App.Banks.citations[Math.floor(Date.now() / 86400000) % App.Banks.citations.length];
    box.appendChild(h('div.card', null, [
      h('div.quote-card', { html: U.esc(cit.t) + '<span class="who">— ' + U.esc(cit.a) + '</span>', style: { fontSize: '16px' } })
    ]));
    box.appendChild(h('div.footer-links', null, [h('span', { text: 'Ahouéfa · Coach d\'éloquence' }), h('a', { href: '#/reglages', text: 'Réglages' })]));
    return box;
  }

  /* ---------- Rendu ---------- */
  var appEl;
  App.render = function () {
    if (!appEl) return;
    if (App.Pages.stopMirror) App.Pages.stopMirror();
    var r = route();
    var scrollY = window.scrollY;
    var samePage = appEl.dataset.page === r.page + '/' + r.sub;
    U.clear(appEl);
    appEl.dataset.page = r.page + '/' + r.sub;

    var side = h('nav.side', { 'aria-label': 'Navigation principale' }, [
      h('a.brand', { href: '#/apprendre', 'aria-label': 'Ahouéfa, accueil' }, [
        h('span.brand-mark', { html: App.Mascot.svg({ mood: 'idle', size: 40, label: false }) }),
        h('span.brand-name', { text: 'ahouéfa' })
      ])
    ].concat(navLinks(r.page)));
    var topbar = h('header.topbar', null, [
      h('a.brand', { href: '#/apprendre', style: { padding: '0' }, 'aria-label': 'Ahouéfa, accueil' }, h('span.brand-mark', { html: App.Mascot.svg({ mood: 'idle', size: 40, label: false }) })),
      statsBar()
    ]);
    var content = h('main.content', { id: 'contenu' });
    var main = h('div.main', null, [content]);
    if (r.page === 'apprendre' || r.page === 'quetes' || r.page === 'entrainement') main.appendChild(aside());
    var bottom = h('nav.bottomnav', { 'aria-label': 'Navigation' }, navLinks(r.page, true));

    appEl.appendChild(side);
    appEl.appendChild(topbar);
    appEl.appendChild(main);
    appEl.appendChild(bottom);

    switch (r.page) {
      case 'entrainement': P.practicePage(content, r.sub); break;
      case 'quetes': P.quests(content); break;
      case 'profil': P.profile(content); break;
      case 'boutique': P.shop(content); break;
      case 'reglages': P.settings(content); break;
      default: P.learn(content);
    }
    if (samePage) window.scrollTo(0, scrollY);
    else if (r.page !== 'apprendre') window.scrollTo(0, 0);
  };

  /* Rafraîchit seulement les compteurs quand l'état change (sans tout redessiner). */
  Store.onChange(U.debounce(function () {
    U.$$('.stats').forEach(function (old) { old.replaceWith(statsBar()); });
  }, 50));

  /* ---------- Démarrage ---------- */
  function boot() {
    appEl = U.$('#app');
    App.applyTheme();
    if (window.matchMedia) {
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', App.applyTheme); } catch (e) { /* ancien navigateur */ }
    }
    var streakNews = Store.checkStreak();
    Store.quests();
    window.addEventListener('hashchange', function () { if (!App.Lesson.active()) App.render(); });
    document.addEventListener('pointerdown', function unlock() { App.Sound.unlock(); document.removeEventListener('pointerdown', unlock); });

    if (!Store.get().onboarded) {
      App.render();
      App.Onboarding.run(function (startFirst) {
        location.hash = '#/apprendre';
        App.render();
        if (startFirst) P.startLesson('u1l1');
      });
    } else {
      App.render();
      if (streakNews && streakNews.frozen) App.UI.toast('Ton gel de série a protégé ta série ! (' + U.plural(streakNews.frozen, 'jour') + ')', 'snow', 4000);
      else if (streakNews && streakNews.lost) App.UI.toast('Ta série de ' + U.plural(streakNews.lost, 'jour') + ' s\'est arrêtée. On recommence aujourd\'hui !', 'flame', 4000);
    }

    // Application installable et utilisable hors ligne
    if (!App.PREVIEW && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne indisponible */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.App = window.App || {});

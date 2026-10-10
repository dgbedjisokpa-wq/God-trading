/* Ahouéfa, la mascotte : un personnage SVG avec plusieurs humeurs.
   Humeurs : idle, talk, happy, wow, think, sad, celebrate, wave.
   Accessoires (boutique) : glasses, crown, flower, scarf, mic. */
(function (App) {
  'use strict';

  var C = {
    skin: '#A5683D',
    skinDark: '#8A522E',
    wrap: '#8A3FFC',
    wrapDark: '#6929C4',
    wrapLight: '#B78BFF',
    dot: '#FFD45C',
    dress: '#7C3AED',
    dressDark: '#5B21B6',
    ink: '#2A1736',
    mouth: '#5E1F3D',
    cheek: '#FF7EB6',
    gold: '#FFC800',
    goldDark: '#E5A400'
  };

  var uid = 0;

  function svg(opts) {
    opts = opts || {};
    var mood = opts.mood || 'idle';
    var size = opts.size || 160;
    var o = opts.outfit || (App.Store && App.Store.outfit ? App.Store.outfit() : {});
    var id = 'ah' + (++uid);
    var label = opts.label === false ? '' : ' role="img" aria-label="Ahouéfa"';
    var hidden = opts.label === false ? ' aria-hidden="true"' : '';

    var s = '';
    s += '<svg class="ah" data-mood="' + mood + '" viewBox="0 0 200 240" width="' + size + '" height="' + Math.round(size * 1.2) + '"' + label + hidden + ' focusable="false">';
    s += '<defs>';
    s += '<radialGradient id="' + id + 'g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="' + C.wrapLight + '"/><stop offset="1" stop-color="' + C.wrap + '"/></radialGradient>';
    s += '<clipPath id="' + id + 'c"><circle cx="100" cy="116" r="50"/></clipPath>';
    s += '</defs>';

    // Ombre au sol
    s += '<ellipse class="ah-shadow" cx="100" cy="236" rx="46" ry="4" fill="#000" opacity=".08"/>';

    s += '<g class="ah-all">';

    // Pieds
    s += '<ellipse cx="85" cy="232" rx="11" ry="6" fill="' + C.dressDark + '"/>';
    s += '<ellipse cx="115" cy="232" rx="11" ry="6" fill="' + C.dressDark + '"/>';


    // Corps (robe)
    s += '<rect x="90" y="150" width="20" height="24" rx="6" fill="' + C.skinDark + '"/>';
    s += '<path d="M60 232 C58 198 72 168 100 168 C128 168 142 198 140 232 Q100 240 60 232 Z" fill="' + C.dress + '"/>';
    s += '<path d="M72 196 Q100 214 128 196" fill="none" stroke="' + C.dressDark + '" stroke-width="3" stroke-linecap="round" opacity=".55"/>';
    s += '<path d="M66 216 Q100 230 134 216" fill="none" stroke="' + C.gold + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/>';
    // Col
    s += '<path d="M84 176 Q100 192 116 176" fill="none" stroke="' + C.wrapLight + '" stroke-width="5" stroke-linecap="round"/>';
    // Bras le long du corps (devant la robe, manches un peu plus foncées)
    s += arm('l', 74, 186, '#6D28D9');
    s += arm('r', 126, 186, '#6D28D9');

    if (o.scarf) {
      s += '<path d="M72 178 Q100 196 128 178 L126 188 Q100 206 74 188 Z" fill="' + C.gold + '"/>';
      s += '<path d="M112 190 L122 214 L110 212 Z" fill="' + C.goldDark + '"/>';
    }

    // Oreilles + boucles
    s += '<circle cx="51" cy="122" r="9" fill="' + C.skin + '"/>';
    s += '<circle cx="149" cy="122" r="9" fill="' + C.skin + '"/>';
    s += '<circle cx="50" cy="136" r="4.5" fill="' + C.gold + '" stroke="' + C.goldDark + '" stroke-width="1.5"/>';
    s += '<circle cx="150" cy="136" r="4.5" fill="' + C.gold + '" stroke="' + C.goldDark + '" stroke-width="1.5"/>';

    // Tête
    s += '<circle cx="100" cy="116" r="50" fill="' + C.skin + '"/>';
    // Ombre sous le foulard
    s += '<g clip-path="url(#' + id + 'c)"><path d="M40 96 Q100 82 160 96 L160 104 Q100 92 40 104 Z" fill="' + C.skinDark + '" opacity=".55"/></g>';

    // Foulard (gele) : volume, éventail, bandeau
    s += '<path d="M132 52 C140 18 186 14 184 46 C183 64 164 74 142 70 Z" fill="' + C.wrapDark + '"/>';
    s += '<path d="M138 56 C150 30 176 30 176 48" fill="none" stroke="' + C.wrap + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M150 64 C160 52 172 50 178 54" fill="none" stroke="' + C.wrap + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M54 82 C46 40 76 10 106 12 C140 14 160 42 150 84 Z" fill="url(#' + id + 'g)"/>';
    s += '<path d="M46 106 C42 70 66 50 100 50 C134 50 158 70 154 106 C146 94 128 88 100 88 C72 88 54 94 46 106 Z" fill="' + C.wrap + '"/>';
    // Plis
    s += '<path d="M60 62 C78 44 122 40 142 58" fill="none" stroke="' + C.wrapDark + '" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
    s += '<path d="M64 38 C84 24 116 22 132 32" fill="none" stroke="' + C.wrapDark + '" stroke-width="3" stroke-linecap="round" opacity=".45"/>';
    s += '<path d="M54 92 C72 74 128 72 146 90" fill="none" stroke="' + C.wrapDark + '" stroke-width="3" stroke-linecap="round" opacity=".5"/>';
    // Motif doré
    var dots = [[78, 30], [100, 26], [122, 34], [70, 54], [94, 46], [118, 50], [138, 66], [62, 76], [84, 70], [108, 68], [130, 80], [160, 40], [170, 56]];
    for (var i = 0; i < dots.length; i++) {
      s += '<circle cx="' + dots[i][0] + '" cy="' + dots[i][1] + '" r="2.6" fill="' + C.dot + '"/>';
    }

    if (o.flower) {
      s += '<g transform="translate(66 60)">';
      for (var p = 0; p < 5; p++) {
        s += '<ellipse cx="0" cy="-9" rx="6" ry="9" fill="#C084FC" transform="rotate(' + (p * 72) + ')"/>';
      }
      s += '<circle r="5" fill="' + C.gold + '"/></g>';
    }
    if (o.crown) {
      s += '<path d="M78 16 L84 -6 L94 8 L100 -10 L106 8 L116 -6 L122 16 Z" fill="' + C.gold + '" stroke="' + C.goldDark + '" stroke-width="2" stroke-linejoin="round"/>';
      s += '<circle cx="100" cy="6" r="3" fill="#FF4B91"/>';
    }

    // Visage
    s += '<g class="ah-face">';
    // Joues
    s += '<ellipse cx="70" cy="136" rx="8.5" ry="5" fill="' + C.cheek + '" opacity=".38"/>';
    s += '<ellipse cx="130" cy="136" rx="8.5" ry="5" fill="' + C.cheek + '" opacity=".38"/>';

    // Sourcils
    s += '<g class="ah-brows ah-brows-n" fill="none" stroke="' + C.ink + '" stroke-width="3.6" stroke-linecap="round">';
    s += '<path d="M71 101 Q81 95 92 99"/><path d="M108 99 Q119 95 129 101"/></g>';
    s += '<g class="ah-brows ah-brows-up" fill="none" stroke="' + C.ink + '" stroke-width="3.6" stroke-linecap="round">';
    s += '<path d="M71 96 Q81 89 92 93"/><path d="M108 93 Q119 89 129 96"/></g>';
    s += '<g class="ah-brows ah-brows-sad" fill="none" stroke="' + C.ink + '" stroke-width="3.6" stroke-linecap="round">';
    s += '<path d="M72 99 Q82 99 91 94"/><path d="M109 94 Q118 99 128 99"/></g>';
    s += '<g class="ah-brows ah-brows-think" fill="none" stroke="' + C.ink + '" stroke-width="3.6" stroke-linecap="round">';
    s += '<path d="M71 101 Q81 98 92 100"/><path d="M108 94 Q119 86 129 92"/></g>';

    // Yeux ouverts
    s += '<g class="ah-eyes ah-eyes-open">';
    s += '<ellipse cx="82" cy="119" rx="10.5" ry="12.5" fill="#fff"/><ellipse cx="118" cy="119" rx="10.5" ry="12.5" fill="#fff"/>';
    s += '<g class="ah-pupils"><circle cx="83" cy="121" r="7" fill="' + C.ink + '"/><circle cx="119" cy="121" r="7" fill="' + C.ink + '"/>';
    s += '<circle cx="85.5" cy="118" r="2.4" fill="#fff"/><circle cx="121.5" cy="118" r="2.4" fill="#fff"/></g>';
    s += '<path d="M71.5 112 l-5 -4 M128.5 112 l5 -4" stroke="' + C.ink + '" stroke-width="2.6" stroke-linecap="round"/>';
    s += '</g>';
    // Yeux fermés de joie
    s += '<g class="ah-eyes ah-eyes-happy" fill="none" stroke="' + C.ink + '" stroke-width="4" stroke-linecap="round">';
    s += '<path d="M72 122 Q82 110 92 122"/><path d="M108 122 Q118 110 128 122"/></g>';

    if (o.glasses) {
      s += '<g fill="none" stroke="' + C.wrapDark + '" stroke-width="3.5">';
      s += '<circle cx="82" cy="119" r="15"/><circle cx="118" cy="119" r="15"/><path d="M97 117 Q100 114 103 117"/>';
      s += '<path d="M67 116 L52 112 M133 116 L148 112"/></g>';
    }

    // Nez
    s += '<path d="M96 129 Q100 133 104 129" fill="none" stroke="' + C.skinDark + '" stroke-width="3" stroke-linecap="round"/>';

    // Bouches
    s += '<path class="ah-mouth ah-m-smile" d="M88 140 Q100 151 112 140" fill="none" stroke="' + C.mouth + '" stroke-width="3.6" stroke-linecap="round"/>';
    s += '<g class="ah-mouth ah-m-grin"><path d="M85 138 Q100 160 115 138 Z" fill="' + C.mouth + '" stroke="' + C.mouth + '" stroke-width="2" stroke-linejoin="round"/>';
    s += '<path d="M88 139.5 L112 139.5 L110 143 Q100 145 90 143 Z" fill="#fff"/>';
    s += '<path d="M93 151 Q100 146 107 151 Q100 155 93 151 Z" fill="#FF6B8B"/></g>';
    s += '<g class="ah-mouth ah-m-talk"><ellipse class="ah-talk-a" cx="100" cy="144" rx="8" ry="7" fill="' + C.mouth + '"/>';
    s += '<ellipse class="ah-talk-a" cx="100" cy="148" rx="5" ry="2.6" fill="#FF6B8B"/></g>';
    s += '<ellipse class="ah-mouth ah-m-o" cx="100" cy="145" rx="6" ry="7" fill="' + C.mouth + '"/>';
    s += '<path class="ah-mouth ah-m-sad" d="M89 147 Q100 138 111 147" fill="none" stroke="' + C.mouth + '" stroke-width="3.6" stroke-linecap="round"/>';
    s += '<path class="ah-mouth ah-m-hmm" d="M91 143 Q100 147 110 140" fill="none" stroke="' + C.mouth + '" stroke-width="3.6" stroke-linecap="round"/>';
    s += '</g>';

    // Bras levés (devant)
    s += '<g class="ah-arms-up">' + arm('ul', 74, 186) + arm('ur', 126, 186) + '</g>';

    if (o.mic) {
      s += '<g class="ah-mic"><rect x="139" y="190" width="6" height="22" rx="3" fill="' + C.ink + '" transform="rotate(-20 142 200)"/>';
      s += '<circle cx="138" cy="188" r="8" fill="' + C.gold + '" stroke="' + C.goldDark + '" stroke-width="2"/></g>';
    }

    s += '</g></svg>';
    return s;
  }

  function arm(side, x, y, fill) {
    return '<g class="ah-arm ah-arm-' + side + '" style="transform-origin:' + x + 'px ' + y + 'px">' +
      '<rect x="' + (x - 8) + '" y="' + (y - 4) + '" width="16" height="38" rx="8" fill="' + (fill || C.dress) + '"/>' +
      '<circle cx="' + x + '" cy="' + (y + 38) + '" r="8.5" fill="' + C.skin + '"/></g>';
  }

  function el(opts) {
    var d = document.createElement('div');
    d.className = 'ah-wrap' + (opts && opts.className ? ' ' + opts.className : '');
    d.innerHTML = svg(opts);
    return d;
  }

  function setMood(node, mood) {
    var s = node && (node.tagName === 'svg' ? node : node.querySelector('svg.ah'));
    if (s) s.setAttribute('data-mood', mood);
  }

  /* Petite bulle « Ahouéfa dit… » */
  function says(text, opts) {
    opts = opts || {};
    var w = document.createElement('div');
    w.className = 'ah-says' + (opts.className ? ' ' + opts.className : '');
    w.appendChild(el({ mood: opts.mood || 'talk', size: opts.size || 96 }));
    var b = document.createElement('div');
    b.className = 'bubble';
    b.innerHTML = App.U ? App.U.fr(text) : text;
    w.appendChild(b);
    if (opts.talkFor !== 0) {
      setTimeout(function () { setMood(w, opts.after || 'idle'); }, opts.talkFor || Math.min(4000, 600 + text.length * 35));
    }
    return w;
  }

  /* SVG autonome (pour une image ou un canvas) : les règles CSS de la mascotte y sont copiées,
     sinon toutes les expressions s'afficheraient en même temps. */
  var cssCache = null;
  function mascotCSS() {
    if (cssCache !== null) return cssCache;
    var out = [];
    [].forEach.call(document.styleSheets, function (sh) {
      var rules;
      try { rules = sh.cssRules; } catch (e) { return; } // feuille d'un autre domaine (polices)
      [].forEach.call(rules || [], function (r) {
        if (r.selectorText && /(^|[\s,])\.ah(\b|-)/.test(r.selectorText) && !/\.ah-(wrap|says)/.test(r.selectorText)) out.push(r.cssText);
      });
    });
    cssCache = out.join('\n');
    return cssCache;
  }
  function standalone(opts) {
    return svg(opts)
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
      .replace('<defs>', '<defs><style><![CDATA[' + mascotCSS().replace(/]]>/g, '') + ']]></style>');
  }

  App.Mascot = { svg: svg, standalone: standalone, el: el, setMood: setMood, says: says, colors: C };
})(window.App = window.App || {});

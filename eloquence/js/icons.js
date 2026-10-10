/* Icônes SVG maison (24×24). Les icônes « trait » suivent currentColor,
   les icônes « pleines » (flamme, gemme…) ont leurs propres couleurs. */
(function (App) {
  'use strict';

  function stroke(body, w) {
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2.4) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  function fill(body, vb) {
    return '<svg class="ic" viewBox="' + (vb || '0 0 24 24') + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  var I = {
    home: stroke('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    mic: stroke('<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/><path d="M8.5 21.5h7"/>'),
    target: stroke('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
    user: stroke('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    shop: stroke('<path d="M4 9h16l-1.2 10.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z"/><path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2"/>'),
    settings: stroke('<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h3"/><path d="M11 12h9"/><circle cx="9" cy="12" r="2"/><path d="M4 18h11"/><path d="M19 18h1"/><circle cx="17" cy="18" r="2"/>'),
    close: stroke('<path d="M6 6l12 12M18 6 6 18"/>', 2.8),
    check: stroke('<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>', 3),
    x: stroke('<path d="M6 6l12 12M18 6 6 18"/>', 3),
    back: stroke('<path d="M15 5l-7 7 7 7"/>', 2.8),
    next: stroke('<path d="M9 5l7 7-7 7"/>', 2.8),
    play: fill('<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/>'),
    pause: fill('<rect x="6" y="4" width="4.5" height="16" rx="1.5" fill="currentColor"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.5" fill="currentColor"/>'),
    stop: fill('<rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor"/>'),
    volume: stroke('<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M19 5.5a9 9 0 0 1 0 13"/>'),
    turtle: stroke('<path d="M4 15c0-4 3.5-7 8-7s8 3 8 7z"/><path d="M20 13.5h1.5a1.5 1.5 0 0 0 0-3H20"/><path d="M6.5 15v3M17.5 15v3"/>'),
    book: stroke('<path d="M12 6.5C10.2 4.9 7.5 4.2 3.5 4.5V18c4-.2 6.7.5 8.5 2 1.8-1.5 4.5-2.2 8.5-2V4.5c-4-.3-6.7.4-8.5 2z"/><path d="M12 6.5V20"/>'),
    wind: stroke('<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>'),
    clock: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
    chat: stroke('<path d="M4 5h16v11H9l-5 4z"/>'),
    bulb: stroke('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>'),
    refresh: stroke('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>'),
    camera: stroke('<rect x="3" y="6.5" width="13" height="11" rx="2.5"/><path d="M16 10.5 21 7.5v9l-5-3"/>'),
    chart: stroke('<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>'),
    shuffle: stroke('<path d="M3 7h3.5c2.5 0 3.7 1.3 5 5s2.5 5 5 5H21"/><path d="M18 14l3 3-3 3"/><path d="M3 17h3.5c1.2 0 2-.3 2.7-.9"/><path d="M14.3 7.9c.7-.6 1.5-.9 2.7-.9H21"/><path d="M18 4l3 3-3 3"/>'),
    scale: stroke('<path d="M12 3v18M7 21h10"/><path d="M5 7h14"/><path d="M5 7 2 14a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/>'),
    briefcase: stroke('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2"/><path d="M3 12.5h18"/>'),
    feather: stroke('<path d="M20 4c-7 0-12 5-12 12v4"/><path d="M8 16c6 0 10-4 12-12"/><path d="M8 12h6"/>'),
    dice: stroke('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
    letters: stroke('<path d="M4 18 8 6l4 12"/><path d="M5.5 14h5"/><path d="M15 10.5a2.5 2.5 0 1 1 0 5h-1v-5z"/><path d="M14 6v12"/>'),
    alert: stroke('<path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'),
    download: stroke('<path d="M12 4v11"/><path d="M7 10.5l5 5 5-5"/><path d="M5 20h14"/>'),
    upload: stroke('<path d="M12 20V9"/><path d="M7 13.5l5-5 5 5"/><path d="M5 4h14"/>'),
    trash: stroke('<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6 7l1 13h10l1-13"/>'),
    sparkle: fill('<path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="currentColor"/>'),
    lock: fill('<rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" stroke-width="2.6"/>'),
    star: fill('<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z" fill="currentColor"/>'),
    trophy: fill('<path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10.5" y="13" width="3" height="4" fill="currentColor"/><rect x="7" y="17" width="10" height="3.5" rx="1.2" fill="currentColor"/>'),
    dumbbell: fill('<rect x="2" y="8.5" width="3" height="7" rx="1.2" fill="currentColor"/><rect x="5" y="6.5" width="3.5" height="11" rx="1.4" fill="currentColor"/><rect x="8.5" y="10.6" width="7" height="2.8" fill="currentColor"/><rect x="15.5" y="6.5" width="3.5" height="11" rx="1.4" fill="currentColor"/><rect x="19" y="8.5" width="3" height="7" rx="1.2" fill="currentColor"/>'),
    crown: fill('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z" fill="currentColor"/><rect x="5" y="19" width="14" height="2.5" rx="1" fill="currentColor"/>'),
    mask: fill('<path d="M3 5c3 1.2 6 1.2 9 0v6.5c0 3.6-2 6.5-4.5 6.5S3 15.1 3 11.5z" fill="currentColor"/><path d="M12 8.5c3 1.2 6 1.2 9 0V15c0 3.6-2 6.5-4.5 6.5S12 18.6 12 15" fill="currentColor" opacity=".7"/>'),
    bubble: fill('<path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17h-9l-5 4v-4H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 4z" fill="currentColor"/>'),
    micFill: fill('<rect x="8.5" y="2" width="7" height="13" rx="3.5" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M12 18v3.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    windFill: fill('<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'),
    bookFill: fill('<path d="M11 5.4C9 4 6.5 3.4 3.3 3.6a1 1 0 0 0-.9 1v13.6a1 1 0 0 0 1 1c3.1-.1 5.5.5 7.6 2z" fill="currentColor"/><path d="M13 5.4c2-1.4 4.5-2 7.7-1.8a1 1 0 0 1 .9 1v13.6a1 1 0 0 1-1 1c-3.1-.1-5.5.5-7.6 2z" fill="currentColor" opacity=".8"/>'),
    boltFill: fill('<path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.5z" fill="currentColor"/>'),
    featherFill: fill('<path d="M20.5 3.5C12 3.5 7 8.5 7 16l-2.5 4.5 1.6.8L8.4 17C16 17 20.5 12 20.5 3.5z" fill="currentColor"/>'),
    chest: fill('<path class="ch-b" d="M4 21c0-9.4 7.6-17 17-17h6c9.4 0 17 7.6 17 17v1H4z" fill="#FFB020"/><path class="ch-h" d="M11 10.5C13.6 7.6 17 6 20.5 6h3" fill="none" stroke="#FFE38A" stroke-width="2.6" stroke-linecap="round"/><rect class="ch-a" x="4" y="21" width="40" height="20" rx="4" fill="#FFC800"/><path class="ch-b" d="M4 33h40v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#E5A400"/><rect class="ch-c" x="2" y="18.5" width="44" height="5.5" rx="2.75" fill="#B87800"/><rect class="ch-d" x="19" y="16" width="10" height="13" rx="3" fill="#fff"/><circle class="ch-k" cx="24" cy="21.2" r="2" fill="#B87800"/><rect class="ch-k" x="23" y="21.5" width="2" height="4.5" rx="1" fill="#B87800"/>', '0 0 48 44'),
    chestOpen: fill('<path d="M6 18 9 4.4A3 3 0 0 1 11.9 2h24.2a3 3 0 0 1 2.9 2.4L42 18z" fill="#E5A400"/><path d="M11.6 6h24.8l2.1 10H9.5z" fill="#FFB020"/><rect x="4" y="15" width="40" height="8" rx="3.5" fill="#7A4A00"/><path d="M11.5 19.5 16.5 11l5 8.5-5 4z" fill="#C084FC"/><path d="M21.5 18.5 28 8.5l6.5 10-6.5 5z" fill="#A855F7"/><path d="M26 12l2-3.2.9 3z" fill="#fff" opacity=".75"/><path d="M33.5 20l3-4.2 3 4.2-3 2.5z" fill="#9333EA"/><rect x="4" y="22" width="40" height="19" rx="4" fill="#FFC800"/><path d="M4 33h40v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#E5A400"/><rect x="2" y="20.5" width="44" height="5.5" rx="2.75" fill="#B87800"/><rect x="19" y="24.5" width="10" height="9" rx="2.5" fill="#fff"/><circle cx="24" cy="28.2" r="1.7" fill="#B87800"/>', '0 0 48 44'),
    flame: fill('<path d="M12 1.5c1 3.7 5.5 5.8 5.5 11.3A5.6 5.6 0 0 1 12 18.5a5.6 5.6 0 0 1-5.5-5.7c0-2.7 1.3-4.4 2.6-5.6.2 1.7.9 2.8 2 3.3C11 7.7 10.6 4.5 12 1.5z" fill="#FF9600" transform="translate(0 2.5)"/><path d="M12 11c.6 1.8 2.6 2.7 2.6 5.1A2.6 2.6 0 0 1 12 18.8a2.6 2.6 0 0 1-2.6-2.7c0-1.6 1-2.6 1.9-3.3.1.8.5 1.3 1 1.5-.4-1.2-.5-2.3-.3-3.3z" fill="#FFC800" transform="translate(0 2.5)"/>'),
    flameOff: fill('<path d="M12 1.5c1 3.7 5.5 5.8 5.5 11.3A5.6 5.6 0 0 1 12 18.5a5.6 5.6 0 0 1-5.5-5.7c0-2.7 1.3-4.4 2.6-5.6.2 1.7.9 2.8 2 3.3C11 7.7 10.6 4.5 12 1.5z" fill="currentColor" opacity=".35" transform="translate(0 2.5)"/>'),
    gem: fill('<path d="M7 3.5h10l4.5 5.5L12 21 2.5 9z" fill="#A855F7"/><path d="M7 3.5 9.5 9 12 3.5 14.5 9 17 3.5" fill="#C084FC"/><path d="M2.5 9h19L12 21z" fill="#9333EA"/><path d="M9.5 9 12 21l2.5-12z" fill="#A855F7"/><path d="M8 5h3l-1.3 3z" fill="#fff" opacity=".7"/>'),
    xp: fill('<path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.5z" fill="#FFC800" stroke="#E5A400" stroke-width="1.2" stroke-linejoin="round"/>'),
    snow: fill('<g stroke="#38BDF8" stroke-width="2.4" stroke-linecap="round"><path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/></g>'),
    goal: fill('<circle cx="12" cy="12" r="9.5" fill="#FF4B91"/><circle cx="12" cy="12" r="6" fill="#fff"/><circle cx="12" cy="12" r="3" fill="#FF4B91"/>'),
    medal: fill('<path d="M7 2h4l2 6H9zM13 2h4l-2 6h-4z" fill="#8A3FFC"/><circle cx="12" cy="15" r="6.5" fill="#FFC800" stroke="#E5A400" stroke-width="1.5"/><path d="M12 11.5l1.1 2.2 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="#fff"/>')
  };

  App.Icons = I;
  App.icon = function (name, cls) {
    var s = I[name] || '';
    return cls ? s.replace('class="ic"', 'class="ic ' + cls + '"') : s;
  };
})(window.App = window.App || {});

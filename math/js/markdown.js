// Rendu Markdown → HTML, sans dépendance, pensé pour les documents scolaires :
// titres, paragraphes, listes (numérotation conservée telle quelle), tableaux,
// encadrés, sauts de page, et une petite notation mathématique
// (\frac, \sqrt, \vec, \angle, \overline, <sup>, <sub>).
//
// Sécurité : tout le texte est échappé ; seules les balises <br>, <sup>,
// <sub>, <u> (sans attribut) sont rétablies. Le texte de l'IA ou d'un fichier
// importé ne peut donc pas injecter de HTML ni de script.
//
// Option { word: true } : variante compatible Microsoft Word (export .doc).

import { MARQUE_SAUT } from './prompts.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ESC[c]);
}

// ---------------------------------------------------------------- maths

const SYMBOLES = {
  times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥',
  neq: '≠', ne: '≠', approx: '≈', simeq: '≃', equiv: '≡', in: '∈', notin: '∉', subset: '⊂',
  subseteq: '⊆', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅', infty: '∞',
  pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε',
  varepsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', sigma: 'σ', Sigma: 'Σ', omega: 'ω',
  Omega: 'Ω', varphi: 'φ', phi: 'φ', rho: 'ρ', tau: 'τ',
  rightarrow: '→', to: '→', longrightarrow: '→', leftarrow: '←', Rightarrow: '⇒',
  implies: '⇒', Leftrightarrow: '⇔', iff: '⇔', mapsto: '↦', forall: '∀', exists: '∃',
  perp: '⊥', parallel: '∥', sum: '∑', prod: '∏', int: '∫', ldots: '…', dots: '…',
  cdots: '⋯', degree: '°', circ: '°', quad: ' ', qquad: '  ', ',': ' ', ';': ' ', '!': '',
  lim: 'lim', ln: 'ln', log: 'log', sin: 'sin', cos: 'cos', tan: 'tan', exp: 'exp',
  left: '', right: '', displaystyle: '', '{': '{', '}': '}', '%': '%',
};
const DOUBLES = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', D: '𝔻' };
const AVEC_ARGUMENTS = new Set(['frac', 'dfrac', 'tfrac', 'sqrt', 'vec', 'overrightarrow', 'angle',
  'widehat', 'hat', 'overline', 'bar', 'text', 'textbf', 'mathrm', 'mathbf', 'mathbb', 'operatorname']);

/** Lit un groupe {…} à partir de s[i] === '{' ; renvoie [contenu, indexAprès]. */
function lireGroupe(s, i) {
  let prof = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') prof++;
    else if (s[j] === '}') { prof--; if (prof === 0) return [s.slice(i + 1, j), j + 1]; }
  }
  return [s.slice(i + 1), s.length];
}

function sauterEspaces(s, i) { while (s[i] === ' ') i++; return i; }

function chapeau(t) {
  const lettres = [...t];
  if (!lettres.length) return t;
  const k = lettres.length === 3 ? 1 : lettres.length - 1;
  lettres.splice(k + 1, 0, '̂');
  return lettres.join('');
}

/** Transforme les commandes \frac, \sqrt… (texte déjà échappé). */
function commandes(s, word) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c !== '\\') { out += c; i++; continue; }
    const m = /^\\([A-Za-z]+|[,;!{}%])/.exec(s.slice(i));
    if (!m) { out += c; i++; continue; }
    const nom = m[1];
    let j = i + m[0].length;
    if (AVEC_ARGUMENTS.has(nom)) {
      j = sauterEspaces(s, j);
      let arg = '';
      if (s[j] === '{') [arg, j] = lireGroupe(s, j);
      else if (s[j]) { arg = s[j]; j++; }
      const a = commandes(arg, word);
      if (nom === 'frac' || nom === 'dfrac' || nom === 'tfrac') {
        j = sauterEspaces(s, j);
        let den = '';
        if (s[j] === '{') [den, j] = lireGroupe(s, j);
        else if (s[j]) { den = s[j]; j++; }
        const d = commandes(den, word);
        if (word) {
          const simple = x => /^[\w.,]+$/.test(x.replace(/<[^>]+>/g, ''));
          out += `${simple(a) ? a : `(${a})`}/${simple(d) ? d : `(${d})`}`;
        } else {
          out += `<span class="frac"><span class="fn">${a}</span><span class="fd">${d}</span></span>`;
        }
      } else if (nom === 'sqrt') {
        if (word) out += /^[\w.,]+$/.test(a) ? `√${a}` : `√(${a})`;
        else out += `<span class="rad">√<span class="ovl">${a}</span></span>`;
      } else if (nom === 'vec' || nom === 'overrightarrow') {
        out += word ? `<span style="text-decoration:overline">${a}</span>` : `<span class="vec">${a}</span>`;
      } else if (nom === 'angle' || nom === 'widehat' || nom === 'hat') {
        out += chapeau(a);
      } else if (nom === 'overline' || nom === 'bar') {
        out += word ? `<span style="text-decoration:overline">${a}</span>` : `<span class="ovl">${a}</span>`;
      } else if (nom === 'mathbb') {
        out += [...a].map(x => DOUBLES[x] || x).join('');
      } else if (nom === 'textbf' || nom === 'mathbf') {
        out += `<b>${a}</b>`;
      } else {
        out += a;
      }
      i = j;
      continue;
    }
    if (nom in SYMBOLES) { out += SYMBOLES[nom]; i = j; continue; }
    out += m[0];
    i = j;
  }
  return out;
}

/** Exposants et indices écrits à la manière de LaTeX : x^2, x^{n+1}, u_{n}, u_n. */
function exposants(s) {
  s = s.replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>');
  s = s.replace(/\^(-?[\w°]+)/g, '<sup>$1</sup>');
  s = s.replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>');
  s = s.replace(/([A-Za-zÀ-ɏ)])_([A-Za-z0-9]{1,3})\b/g, '$1<sub>$2</sub>');
  return s;
}

// ---------------------------------------------------------------- en ligne

function enLigne(txt, opts) {
  let s = escapeHtml(txt);
  // balises autorisées (sans attribut)
  s = s.replace(/&lt;(\/?)(sup|sub|u)&gt;/gi, (_, f, t) => `<${f}${t.toLowerCase()}>`);
  s = s.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  // délimiteurs LaTeX laissés par erreur : $…$, \( … \)
  if ((s.match(/\$/g) || []).length >= 2) s = s.replace(/\$\$?/g, '');
  s = s.replace(/\\\(|\\\)|\\\[|\\\]/g, '');
  if (s.includes('\\')) s = commandes(s, opts.word);
  if (/[\^_]/.test(s)) s = exposants(s);
  // gras puis italique
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(?=[^_\s])([\s\S]*?[^_\s])__/g, '<strong>$1</strong>'); // « ______ » reste une ligne à compléter
  s = s.replace(/(^|[^*\w])\*(?=\S)([^*\n]*?\S)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

// ---------------------------------------------------------------- blocs

const RE_TITRE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RE_HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const RE_ITEM = /^(\s*)([-*+•]|\d{1,2}[.)]|[a-hA-H][.)]|[ivx]{1,4}[.)])\s+(.*)$/;
const RE_SEPARATEUR = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function cellules(ligne) {
  let l = ligne.trim();
  if (l.startsWith('|')) l = l.slice(1);
  if (l.endsWith('|') && !l.endsWith('\\|')) l = l.slice(0, -1);
  // découpe manuelle (pas de « lookbehind » : anciens Safari iOS)
  const res = [];
  let cur = '';
  for (let k = 0; k < l.length; k++) {
    if (l[k] === '\\' && l[k + 1] === '|') { cur += '|'; k++; } else if (l[k] === '|') { res.push(cur.trim()); cur = ''; } else cur += l[k];
  }
  res.push(cur.trim());
  return res;
}

function rendreTableau(lignes, opts) {
  const aSep = lignes.length > 1 && RE_SEPARATEUR.test(lignes[1]);
  const entete = aSep ? cellules(lignes[0]) : null;
  const alignements = aSep ? cellules(lignes[1]).map(c => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : '')) : [];
  const corps = (aSep ? lignes.slice(2) : lignes).map(cellules);
  const nbCol = Math.max(entete ? entete.length : 0, ...corps.map(r => r.length));
  const td = (tag, c, k) => {
    const al = alignements[k] ? ` style="text-align:${alignements[k]}"` : '';
    return `<${tag}${al}>${enLigne(c || '', opts)}</${tag}>`;
  };
  // un en-tête vide (| | |) ne sert qu'à poser le tableau : on l'omet
  const enteteVide = entete && entete.every(c => !c);
  let h = nbCol >= 4 ? '<table class="large">' : '<table>';
  if (entete && !enteteVide) {
    h += '<thead><tr>';
    for (let k = 0; k < nbCol; k++) h += td('th', entete[k], k);
    h += '</tr></thead>';
  }
  h += '<tbody>';
  for (const r of corps) {
    h += '<tr>';
    for (let k = 0; k < nbCol; k++) h += td('td', r[k], k);
    h += '</tr>';
  }
  h += '</tbody></table>';
  return opts.word ? h.replace(/^<table[^>]*>/, '<table class="t" border="1" cellspacing="0" cellpadding="5">') : `<div class="table-wrap">${h}</div>`;
}

function rendreItem(niveau, marque, contenu, opts) {
  const m = /^[-*+•]$/.test(marque) ? '•' : marque;
  if (opts.word) {
    const marge = 0.6 + niveau * 0.6;
    return `<p class="li" style="margin-left:${marge}cm;text-indent:-0.6cm">${escapeHtml(m)}&nbsp;&nbsp;${contenu}</p>`;
  }
  return `<div class="li" style="--n:${niveau}"><span class="li-m">${escapeHtml(m)}</span><div class="li-c">${contenu}</div></div>`;
}

function saut(opts) {
  return opts.word
    ? '<br clear="all" style="mso-special-character:line-break;page-break-before:always">'
    : '<div class="saut-page" role="separator" aria-label="Saut de page"></div>';
}

export function estSaut(ligne) {
  return ligne.trim().toUpperCase() === MARQUE_SAUT;
}

export function renderMarkdown(md, opts = {}) {
  const lignes = String(md || '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let liste = []; // [{niveau, marque, contenu[]}]

  const fermerPara = () => {
    if (para.length) { out.push(`<p>${para.map(l => enLigne(l, opts)).join('<br>')}</p>`); para = []; }
  };
  const fermerListe = () => {
    if (!liste.length) return;
    // niveaux relatifs à l'indentation
    const indents = [...new Set(liste.map(it => it.indent))].sort((a, b) => a - b);
    for (const it of liste) {
      const niveau = Math.min(indents.indexOf(it.indent), 3);
      out.push(rendreItem(niveau, it.marque, it.contenu.map(l => enLigne(l, opts)).join('<br>'), opts));
    }
    liste = [];
  };
  const fermerTout = () => { fermerPara(); fermerListe(); };

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    if (!ligne.trim()) { fermerTout(); continue; }

    if (estSaut(ligne)) { fermerTout(); out.push(saut(opts)); continue; }

    // blocs de code laissés par erreur : on garde le contenu comme texte
    if (/^\s*```/.test(ligne)) { fermerTout(); continue; }

    const t = RE_TITRE.exec(ligne);
    if (t) {
      fermerTout();
      const n = t[1].length;
      out.push(`<h${n}>${enLigne(t[2], opts)}</h${n}>`);
      continue;
    }

    if (RE_HR.test(ligne) && !liste.length) { fermerTout(); out.push('<hr>'); continue; }

    if (/^\s*\|/.test(ligne)) {
      fermerTout();
      const bloc = [];
      while (i < lignes.length && /^\s*\|/.test(lignes[i])) bloc.push(lignes[i++]);
      i--;
      out.push(rendreTableau(bloc, opts));
      continue;
    }

    if (/^\s*>/.test(ligne)) {
      fermerTout();
      const bloc = [];
      while (i < lignes.length && /^\s*>/.test(lignes[i])) bloc.push(lignes[i++].replace(/^\s*>\s?/, ''));
      i--;
      const inner = renderMarkdown(bloc.join('\n'), opts);
      out.push(opts.word
        ? `<table class="encadre" border="1" cellspacing="0" cellpadding="8" width="100%"><tr><td>${inner}</td></tr></table>`
        : `<blockquote>${inner}</blockquote>`);
      continue;
    }

    const it = RE_ITEM.exec(ligne);
    if (it) {
      fermerPara();
      liste.push({ indent: it[1].replace(/\t/g, '  ').length, marque: it[2], contenu: [it[3]] });
      continue;
    }

    // ligne de continuation d'un élément de liste (indentée)
    if (liste.length && /^\s{2,}\S/.test(ligne)) {
      liste[liste.length - 1].contenu.push(ligne.trim());
      continue;
    }

    fermerListe();
    para.push(ligne.trim());
  }
  fermerTout();
  return out.join('\n');
}

/** Découpe un document aux marques de saut de page. */
export function decouper(md) {
  const parties = [[]];
  for (const l of String(md || '').split('\n')) {
    if (estSaut(l)) parties.push([]);
    else parties[parties.length - 1].push(l);
  }
  return parties.map(p => p.join('\n').trim()).filter(Boolean);
}

/** Texte brut lisible (copier-coller dans WhatsApp, SMS…). */
export function texteBrut(md) {
  const div = document.createElement('div');
  div.innerHTML = renderMarkdown(md, { word: true });
  div.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
  div.querySelectorAll('sup').forEach(e => e.replaceWith(`^${e.textContent.length > 1 ? `(${e.textContent})` : e.textContent}`));
  div.querySelectorAll('sub').forEach(e => e.replaceWith(`_${e.textContent}`));
  div.querySelectorAll('p, h1, h2, h3, h4, h5, h6, tr, hr').forEach(e => e.append('\n'));
  div.querySelectorAll('td, th').forEach(e => e.append(' | '));
  return div.textContent.replace(/ \| \n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

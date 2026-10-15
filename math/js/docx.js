// Export Word (.docx) écrit à la main, sans dépendance : le document affiché
// est converti en OOXML (titres, paragraphes, listes, tableaux, encadrés,
// sauts de page) et les fractions, racines, vecteurs et barres deviennent de
// vraies équations Word (OMML). Lisible par Word, WPS, LibreOffice et
// Google Docs, sur ordinateur comme sur téléphone.

import { renderMarkdown } from './markdown.js';

const LARGEUR_UTILE = 11906 - 2 * 907; // A4 moins les marges (en vingtièmes de point)

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------- texte courant

function proprietes(f) {
  let p = '';
  if (f.b) p += '<w:b/><w:bCs/>';
  if (f.i) p += '<w:i/><w:iCs/>';
  if (f.u) p += '<w:u w:val="single"/>';
  if (f.sup) p += '<w:vertAlign w:val="superscript"/>';
  if (f.sub) p += '<w:vertAlign w:val="subscript"/>';
  return p ? `<w:rPr>${p}</w:rPr>` : '';
}

function run(texte, f) {
  if (!texte) return '';
  return `<w:r>${proprietes(f)}<w:t xml:space="preserve">${esc(texte)}</w:t></w:r>`;
}

/** Contenu en ligne (texte, gras, exposants, équations) d'un nœud HTML. */
function enLigne(noeud, f = {}) {
  let x = '';
  for (const n of noeud.childNodes) {
    if (n.nodeType === 3) { x += run(n.nodeValue, f); continue; }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName.toLowerCase();
    const c = n.classList;
    if (tag === 'br') x += '<w:r><w:br/></w:r>';
    else if (c.contains('frac') || c.contains('rad') || c.contains('vec') || c.contains('ovl')) x += `<m:oMath>${omml([n])}</m:oMath>`;
    else if (tag === 'strong' || tag === 'b') x += enLigne(n, { ...f, b: true });
    else if (tag === 'em' || tag === 'i') x += enLigne(n, { ...f, i: true });
    else if (tag === 'u') x += enLigne(n, { ...f, u: true });
    else if (tag === 'sup') x += enLigne(n, { ...f, sup: true });
    else if (tag === 'sub') x += enLigne(n, { ...f, sub: true });
    else x += enLigne(n, f);
  }
  return x;
}

// ---------------------------------------------------------------- équations (OMML)

const mr = t => (t ? `<m:r><m:t xml:space="preserve">${esc(t)}</m:t></m:r>` : '');

/** Convertit une liste de nœuds en OMML. Un exposant s'accroche au dernier caractère qui le précède. */
function omml(noeuds) {
  const morceaux = []; // chaînes OMML ; les textes restent { t } pour pouvoir en détacher la base
  for (const n of noeuds) {
    if (n.nodeType === 3) { if (n.nodeValue) morceaux.push({ t: n.nodeValue }); continue; }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName.toLowerCase();
    const c = n.classList;
    const enfants = [...n.childNodes];
    if (tag === 'sup' || tag === 'sub') {
      let base = '';
      const dernier = morceaux[morceaux.length - 1];
      if (dernier && typeof dernier === 'object' && dernier.t) {
        const car = [...dernier.t];
        base = mr(car.pop());
        dernier.t = car.join('');
      } else if (typeof dernier === 'string') {
        base = morceaux.pop();
      }
      const el = tag === 'sup' ? 'sSup' : 'sSub';
      morceaux.push(`<m:${el}><m:e>${base || mr('​')}</m:e><m:${tag}>${omml(enfants)}</m:${tag}></m:${el}>`);
    } else if (c.contains('frac')) {
      const num = n.querySelector(':scope > .fn');
      const den = n.querySelector(':scope > .fd');
      morceaux.push(`<m:f><m:num>${omml(num ? [...num.childNodes] : [])}</m:num><m:den>${omml(den ? [...den.childNodes] : [])}</m:den></m:f>`);
    } else if (c.contains('rad')) {
      const dedans = n.querySelector(':scope > .ovl');
      morceaux.push(`<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${omml(dedans ? [...dedans.childNodes] : enfants)}</m:e></m:rad>`);
    } else if (c.contains('vec')) {
      morceaux.push(`<m:acc><m:accPr><m:chr m:val="⃗"/></m:accPr><m:e>${omml(enfants)}</m:e></m:acc>`);
    } else if (c.contains('ovl')) {
      morceaux.push(`<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>${omml(enfants)}</m:e></m:bar>`);
    } else if (tag === 'br') {
      morceaux.push({ t: ' ' });
    } else {
      morceaux.push(omml(enfants));
    }
  }
  return morceaux.map(m => (typeof m === 'string' ? m : mr(m.t))).join('') || mr('​');
}

// ---------------------------------------------------------------- blocs

function paragraphe(contenu, { style = '', ind = '', bordure = false, centre = false } = {}) {
  let pPr = '';
  if (style) pPr += `<w:pStyle w:val="${style}"/>`;
  if (bordure) pPr += '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="999999"/></w:pBdr>';
  if (ind) pPr += ind;
  if (centre) pPr += '<w:jc w:val="center"/>';
  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}${contenu}</w:p>`;
}

function bordures(couleur = '333333') {
  return ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map(c => `<w:${c} w:val="single" w:sz="4" w:space="0" w:color="${couleur}"/>`).join('');
}

function tableau(table) {
  const lignes = [...table.querySelectorAll(':scope > thead > tr, :scope > tbody > tr')];
  const nb = Math.max(1, ...lignes.map(tr => tr.children.length));
  const larg = Math.floor(LARGEUR_UTILE / nb);
  let x = `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${bordures()}</w:tblBorders><w:tblLayout w:type="autofit"/><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr>`;
  x += `<w:tblGrid>${`<w:gridCol w:w="${larg}"/>`.repeat(nb)}</w:tblGrid>`;
  for (const tr of lignes) {
    const entete = tr.parentElement.tagName.toLowerCase() === 'thead';
    x += `<w:tr>${entete ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}`;
    const cellules = [...tr.children];
    for (let k = 0; k < nb; k++) {
      const td = cellules[k];
      const fond = entete ? '<w:shd w:val="clear" w:color="auto" w:fill="EDEDED"/>' : '';
      const contenu = td ? enLigne(td, entete ? { b: true } : {}) : '';
      x += `<w:tc><w:tcPr><w:tcW w:w="${larg}" w:type="dxa"/>${fond}</w:tcPr>${paragraphe(contenu, { style: 'Tableau' })}</w:tc>`;
    }
    x += '</w:tr>';
  }
  return `${x}</w:tbl>${paragraphe('', { style: 'Espace' })}`;
}

function encadre(bq) {
  const dedans = blocs(bq.childNodes) || paragraphe('');
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${bordures('111111')}</w:tblBorders><w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="${LARGEUR_UTILE}"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="${LARGEUR_UTILE}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F6F6F2"/></w:tcPr>${dedans}</w:tc></w:tr></w:tbl>${paragraphe('', { style: 'Espace' })}`;
}

function blocs(noeuds) {
  let x = '';
  for (const n of noeuds) {
    if (n.nodeType === 3) { if (n.nodeValue.trim()) x += paragraphe(run(n.nodeValue.trim(), {})); continue; }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName.toLowerCase();
    const c = n.classList;
    if (/^h[1-6]$/.test(tag)) {
      const niveau = Math.min(+tag[1], 4);
      x += paragraphe(enLigne(n), { style: `Heading${niveau}`, centre: niveau === 1 });
    } else if (tag === 'p') {
      x += paragraphe(enLigne(n));
    } else if (c.contains('li')) {
      const niveau = parseInt(n.style.getPropertyValue('--n'), 10) || 0;
      const marque = n.querySelector(':scope > .li-m');
      const contenu = n.querySelector(':scope > .li-c');
      const gauche = 425 + niveau * 425;
      x += paragraphe(`${run(marque ? marque.textContent : '•', {})}<w:r><w:tab/></w:r>${contenu ? enLigne(contenu) : ''}`,
        { style: 'Liste', ind: `<w:tabs><w:tab w:val="left" w:pos="${gauche}"/></w:tabs><w:ind w:left="${gauche}" w:hanging="425"/>` });
    } else if (c.contains('table-wrap')) {
      const t = n.querySelector('table');
      if (t) x += tableau(t);
    } else if (tag === 'table') {
      x += tableau(n);
    } else if (tag === 'blockquote') {
      x += encadre(n);
    } else if (c.contains('saut-page')) {
      x += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    } else if (tag === 'hr') {
      x += paragraphe('', { bordure: true });
    } else {
      x += blocs(n.childNodes);
    }
  }
  return x;
}

// ---------------------------------------------------------------- parties du paquet

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

function styles() {
  const titre = (id, nom, taille, avant, apres) => `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${nom}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="${avant}" w:after="${apres}"/><w:outlineLvl w:val="${+id.slice(-1) - 1}"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="${taille}"/><w:szCs w:val="${taille}"/></w:rPr></w:style>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
${titre('Heading1', 'heading 1', 32, 120, 200)}${titre('Heading2', 'heading 2', 27, 280, 120)}${titre('Heading3', 'heading 3', 25, 220, 80)}${titre('Heading4', 'heading 4', 24, 160, 60)}
<w:style w:type="paragraph" w:styleId="Liste"><w:name w:val="Liste APC"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Tableau"><w:name w:val="Texte de tableau"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Espace"><w:name w:val="Espace"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="120" w:lineRule="exact"/></w:pPr></w:style>
</w:styles>`;
}

function partiesDocx(titre, md) {
  const tmp = document.createElement('div');
  tmp.innerHTML = renderMarkdown(md);
  const corps = blocs(tmp.childNodes);
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${NS}><w:body>${corps}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="907" w:right="907" w:bottom="907" w:left="907" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  return {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
    'docProps/core.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(titre)}</dc:title><dc:creator>Maths APC</dc:creator><dc:language>fr-FR</dc:language></cp:coreProperties>`,
    'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'word/styles.xml': styles(),
    'word/document.xml': documentXml,
  };
}

// ---------------------------------------------------------------- archive ZIP (sans compression)

let TABLE_CRC;
function crc32(octets) {
  if (!TABLE_CRC) {
    TABLE_CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      TABLE_CRC[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < octets.length; i++) c = TABLE_CRC[(c ^ octets[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(fichiers) {
  const enc = new TextEncoder();
  const morceaux = [];
  const central = [];
  let decalage = 0;
  const DATE = (2026 - 1980) << 9 | 1 << 5 | 1; // date fixe : le contenu seul compte
  for (const [nom, contenu] of Object.entries(fichiers)) {
    const n = enc.encode(nom);
    const d = enc.encode(contenu);
    const crc = crc32(d);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // noms en UTF-8
    local.setUint16(8, 0, true); // stocké
    local.setUint16(10, 0, true);
    local.setUint16(12, DATE, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, d.length, true);
    local.setUint32(22, d.length, true);
    local.setUint16(26, n.length, true);
    local.setUint16(28, 0, true);
    morceaux.push(local.buffer, n, d);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, 0, true);
    c.setUint16(14, DATE, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, d.length, true);
    c.setUint32(24, d.length, true);
    c.setUint16(28, n.length, true);
    c.setUint32(42, decalage, true);
    central.push(c.buffer, n);
    decalage += 30 + n.length + d.length;
  }
  const tailleCentral = central.reduce((s, b) => s + b.byteLength, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  const nb = Object.keys(fichiers).length;
  fin.setUint16(8, nb, true);
  fin.setUint16(10, nb, true);
  fin.setUint32(12, tailleCentral, true);
  fin.setUint32(16, decalage, true);
  return new Blob([...morceaux, ...central, fin.buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

export function blobDocx(titre, md) {
  return zip(partiesDocx(titre, md));
}

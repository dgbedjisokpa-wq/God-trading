// Lecture des fichiers importés par l'enseignant, entièrement dans le navigateur :
//   - Word (.docx) : texte, tableaux et formules convertis en Markdown ;
//   - PDF : envoyé tel quel à l'IA (elle lit le texte et les figures) ;
//   - photos : réduites puis envoyées à l'IA, qui recopie la fiche ;
//   - texte (.txt, .md).

export const ACCEPTES = '.docx,.pdf,.txt,.md,image/*';
const MAX_PDF = 20 * 1024 * 1024;
const COTE_MAX_IMAGE = 1600;

export class ErreurFichier extends Error {}

/**
 * Renvoie { nom, genre: 'texte'|'pdf'|'image', texte?, base64?, type? }.
 */
export async function lireFichier(f) {
  const nom = f.name || 'fichier';
  const ext = (nom.split('.').pop() || '').toLowerCase();
  if (ext === 'docx') return { nom, genre: 'texte', texte: await lireDocx(f) };
  if (ext === 'doc') throw new ErreurFichier(`« ${nom} » est un ancien fichier Word (.doc). Ouvre-le dans Word ou WPS et enregistre-le en .docx ou en PDF, puis réessaie.`);
  if (ext === 'pdf' || f.type === 'application/pdf') {
    if (f.size > MAX_PDF) throw new ErreurFichier(`« ${nom} » dépasse 20 Mo.`);
    return { nom, genre: 'pdf', base64: await enBase64(f), type: 'application/pdf' };
  }
  if ((f.type || '').startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(ext)) {
    return { nom, genre: 'image', ...(await reduireImage(f)) };
  }
  if (['txt', 'md', 'markdown'].includes(ext) || (f.type || '').startsWith('text/')) {
    return { nom, genre: 'texte', texte: await f.text() };
  }
  throw new ErreurFichier(`Format non pris en charge pour « ${nom} ». Formats acceptés : Word (.docx), PDF, photo, texte.`);
}

function enBase64(blob) {
  return new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1] || '');
    r.onerror = () => ko(new ErreurFichier('Lecture du fichier impossible.'));
    r.readAsDataURL(blob);
  });
}

async function reduireImage(f) {
  let source;
  try {
    source = await createImageBitmap(f, { imageOrientation: 'from-image' });
  } catch {
    // createImageBitmap ne lit pas tous les formats (HEIC hors Safari) : on tente <img>
    source = await new Promise((ok, ko) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => ko(new ErreurFichier(`La photo « ${f.name} » n'a pas pu être lue. Essaie une photo au format JPEG ou PNG.`));
      img.src = URL.createObjectURL(f);
    });
  }
  const l = source.width || source.naturalWidth;
  const h = source.height || source.naturalHeight;
  const k = Math.min(1, COTE_MAX_IMAGE / Math.max(l, h));
  const c = document.createElement('canvas');
  c.width = Math.round(l * k);
  c.height = Math.round(h * k);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(source, 0, 0, c.width, c.height);
  const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.85));
  return { base64: await enBase64(blob), type: 'image/jpeg' };
}

// ---------------------------------------------------------------- .docx

/** Extrait un fichier d'une archive ZIP (méthodes « stocké » et « deflate »). */
async function extraireZip(buf, chemin) {
  const v = new DataView(buf);
  let fin = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) {
    if (v.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new ErreurFichier('Ce fichier Word semble abîmé (archive illisible).');
  const nb = v.getUint16(fin + 10, true);
  let p = v.getUint32(fin + 16, true);
  const dec = new TextDecoder();
  for (let n = 0; n < nb; n++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const methode = v.getUint16(p + 10, true);
    const taille = v.getUint32(p + 20, true);
    const lNom = v.getUint16(p + 28, true);
    const lExtra = v.getUint16(p + 30, true);
    const lCom = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const nom = dec.decode(new Uint8Array(buf, p + 46, lNom));
    if (nom === chemin) {
      const debut = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
      const donnees = new Uint8Array(buf, debut, taille);
      if (methode === 0) return dec.decode(donnees);
      if (methode === 8) {
        if (typeof DecompressionStream === 'undefined') {
          throw new ErreurFichier('Ce navigateur ne sait pas ouvrir les fichiers Word. Mets à jour Chrome, ou envoie le document en PDF ou en photo.');
        }
        const flux = new Blob([donnees]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return await new Response(flux).text();
      }
      throw new ErreurFichier('Compression du fichier Word non prise en charge.');
    }
    p += 46 + lNom + lExtra + lCom;
  }
  throw new ErreurFichier("Ce fichier n'est pas un document Word (.docx) valide.");
}

async function lireDocx(f) {
  const xml = await extraireZip(await f.arrayBuffer(), 'word/document.xml');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const corps = doc.getElementsByTagNameNS('*', 'body')[0];
  if (!corps) throw new ErreurFichier('Document Word vide ou illisible.');
  const lignes = [];
  for (const el of corps.children) {
    if (el.localName === 'p') lignes.push(paragraphe(el));
    else if (el.localName === 'tbl') lignes.push(tableau(el), '');
    else if (el.localName === 'sdt') {
      for (const p of el.getElementsByTagNameNS('*', 'p')) lignes.push(paragraphe(p));
    }
  }
  return lignes.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function paragraphe(p) {
  let t = texteDe(p).replace(/[ \t]+/g, ' ').trim();
  const style = p.getElementsByTagNameNS('*', 'pStyle')[0];
  const nomStyle = style ? (style.getAttribute('w:val') || '') : '';
  const titre = /^(?:Heading|Titre)(\d)/i.exec(nomStyle);
  if (titre && t) t = `${'#'.repeat(Math.min(+titre[1] + 1, 4))} ${t}`;
  else if (p.getElementsByTagNameNS('*', 'numPr').length && t) t = `- ${t}`;
  return t;
}

function tableau(tbl) {
  const lignes = [];
  for (const tr of tbl.children) {
    if (tr.localName !== 'tr') continue;
    const cel = [];
    for (const tc of tr.children) {
      if (tc.localName !== 'tc') continue;
      const ps = [...tc.children].filter(x => x.localName === 'p' || x.localName === 'tbl')
        .map(x => (x.localName === 'p' ? texteDe(x).trim() : texteDe(x).replace(/\s+/g, ' ').trim()))
        .filter(Boolean);
      cel.push(ps.join('<br>').replace(/\|/g, '/'));
    }
    lignes.push(`| ${cel.join(' | ')} |`);
    if (lignes.length === 1) lignes.push(`|${cel.map(() => ' --- ').join('|')}|`);
  }
  return lignes.join('\n');
}

/** Texte d'un nœud Word, formules (OMML) comprises. */
function texteDe(n) {
  let s = '';
  for (const c of n.childNodes) {
    if (c.nodeType !== 1) continue;
    const nom = c.localName;
    if (nom === 't') s += c.textContent;
    else if (nom === 'tab') s += ' ';
    else if (nom === 'br' || nom === 'cr') s += '<br>';
    else if (nom === 'sSup') s += `${texteDe(enfant(c, 'e'))}<sup>${texteDe(enfant(c, 'sup'))}</sup>`;
    else if (nom === 'sSub') s += `${texteDe(enfant(c, 'e'))}<sub>${texteDe(enfant(c, 'sub'))}</sub>`;
    else if (nom === 'sSubSup') s += `${texteDe(enfant(c, 'e'))}<sub>${texteDe(enfant(c, 'sub'))}</sub><sup>${texteDe(enfant(c, 'sup'))}</sup>`;
    else if (nom === 'f') s += `\\frac{${texteDe(enfant(c, 'num'))}}{${texteDe(enfant(c, 'den'))}}`;
    else if (nom === 'rad') s += `\\sqrt{${texteDe(enfant(c, 'e'))}}`;
    else if (nom === 'delInstrText' || nom === 'instrText' || nom === 'rPr' || nom === 'pPr' || nom === 'ctrlPr') continue;
    else s += texteDe(c);
  }
  return s;
}

function enfant(n, nom) {
  for (const c of n.children) if (c.localName === nom) return c;
  return n.ownerDocument.createElement('vide');
}

/** Blocs de contenu pour l'API à partir des fichiers lus. */
export function blocsPourIA(fichiers) {
  const blocs = [];
  for (const f of fichiers) {
    if (f.genre === 'pdf') {
      blocs.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.base64 }, title: f.nom });
    } else if (f.genre === 'image') {
      blocs.push({ type: 'image', source: { type: 'base64', media_type: f.type, data: f.base64 } });
    }
  }
  return blocs;
}

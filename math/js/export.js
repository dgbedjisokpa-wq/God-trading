// Export des documents : Word (.doc lisible par Word, WPS et LibreOffice),
// impression / PDF, copie et partage.

import { renderMarkdown, texteBrut, escapeHtml } from './markdown.js';

const STYLE_WORD = `
@page Section1 { size: 21cm 29.7cm; margin: 1.6cm 1.6cm 1.6cm 1.6cm; }
div.Section1 { page: Section1; }
body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.25; }
h1 { font-size: 16pt; text-align: center; margin: 6pt 0 8pt; }
h2 { font-size: 13.5pt; margin: 12pt 0 6pt; }
h3 { font-size: 12.5pt; margin: 10pt 0 4pt; }
h4, h5, h6 { font-size: 12pt; margin: 8pt 0 4pt; }
p { margin: 0 0 5pt; }
table.t { border-collapse: collapse; width: 100%; margin: 4pt 0 8pt; }
table.t td, table.t th { border: 1px solid #000; padding: 4pt; vertical-align: top; font-size: 11pt; }
table.t th { background: #EDEDED; }
table.encadre { border-collapse: collapse; margin: 4pt 0 8pt; }
table.encadre td { border: 1px solid #000; background: #F6F6F6; }
p.li { margin-top: 0; margin-bottom: 3pt; }
`;

export function nomFichier(titre, ext) {
  const base = (titre || 'document')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'document';
  return `${base}.${ext}`;
}

export function blobWord(titre, md) {
  const corps = renderMarkdown(md, { word: true });
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(titre)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>${STYLE_WORD}</style></head>
<body><div class="Section1">${corps}</div></body></html>`;
  // BOM : Word reconnaît ainsi l'UTF-8 (accents, symboles mathématiques)
  return new Blob(['﻿', html], { type: 'application/msword' });
}

export function telecharger(blob, nom) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nom;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

/** Partage du fichier Word (WhatsApp, e-mail…) quand l'appareil le permet. */
export async function partager(titre, md) {
  const fichier = new File([blobWord(titre, md)], nomFichier(titre, 'doc'), { type: 'application/msword' });
  if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
    await navigator.share({ files: [fichier], title: titre });
    return 'fichier';
  }
  if (navigator.share) {
    await navigator.share({ title: titre, text: texteBrut(md) });
    return 'texte';
  }
  return null;
}

export const partageDisponible = () => typeof navigator.share === 'function';

export async function copier(md) {
  const html = renderMarkdown(md, { word: true });
  const texte = texteBrut(md);
  try {
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([texte], { type: 'text/plain' }),
      })]);
      return true;
    }
  } catch { /* on tente le texte seul */ }
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    return false;
  }
}

/** Imprime (ou enregistre en PDF) le Markdown donné, seul sur la page. */
export function imprimer(md) {
  const zone = document.getElementById('zone-impression');
  zone.innerHTML = `<div class="feuille">${renderMarkdown(md)}</div>`;
  const nettoyer = () => { zone.innerHTML = ''; window.removeEventListener('afterprint', nettoyer); };
  window.addEventListener('afterprint', nettoyer);
  window.print();
}

// Export des documents : téléchargement, impression / PDF, copie et partage
// (le fichier Word lui-même est fabriqué par docx.js).

import { renderMarkdown, texteBrut } from './markdown.js';
import { blobDocx } from './docx.js';

export function nomFichier(titre, ext) {
  const base = (titre || 'document')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'document';
  return `${base}.${ext}`;
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
  const fichier = new File([blobDocx(titre, md)], nomFichier(titre, 'docx'), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
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

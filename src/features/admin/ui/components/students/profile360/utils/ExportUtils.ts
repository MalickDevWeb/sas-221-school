import { ouvrirDocumentImprimable, tableauHtml } from '@/shared/lib/documentImprimable';
// Texte inséré dans du HTML : toujours échappé par tableauHtml (sinon un nom d'élève « <img onerror=…> » serait exécuté).

/**
 * Cellule CSV sûre : une valeur commençant par = + - @ (ou tabulation / retour) est préfixée d'une apostrophe, pour
 * qu'un tableur ne l'exécute pas comme une formule (injection CSV).
 */
function celluleCsv(valeur: unknown): string {
  let texte = String(valeur ?? '');
  if (/^[=+\-@\t\r]/.test(texte)) texte = `'${texte}`;
  return `"${texte.replace(/"/g, '""')}"`;
}

export function exportToCSV<T extends object>(data: readonly T[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).map(celluleCsv).join(',');
  const rows = data.map(row =>
    Object.values(row).map(celluleCsv).join(',')
  );
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Tableau imprimable sur le modèle commun des documents de l'école. */
export function printTable(title: string, headers: string[], rows: unknown[][]) {
  ouvrirDocumentImprimable({
    titre: title,
    corps: tableauHtml(headers, rows.map((r) => r.map((c) => String(c ?? ''))), 'Aucune ligne à imprimer.'),
  });
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

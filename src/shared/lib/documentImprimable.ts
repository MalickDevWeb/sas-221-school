import { anneeScolaire, dateLongue, identiteEcole, initialesEcole, sansEspaceInsecable, type IdentiteEcole } from './documentOfficiel';

/**
 * Documents HTML imprimables (fenêtre d'impression du navigateur, « Enregistrer en PDF » possible) : même rendu que
 * les PDF de documentOfficiel.ts — en-tête (logo ou initiales, nom, coordonnées, filet à la couleur de l'école),
 * titre, « Édité le … — Année scolaire … », tableaux lisibles, pied « Page x/n — École — Document généré par My
 * School le … ». A4 par défaut, A5 pour les reçus. Lisible en noir et blanc.
 */

export const echapper = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));

/** Tableau libellé / valeur ; les valeurs sont échappées sauf si `html` est vrai pour la ligne. */
export function tableauCleValeurHtml(lignes: { cle: string; valeur: string; html?: boolean }[]): string {
  return `<table class="cle-valeur">${lignes.map((l) =>
    `<tr><th scope="row">${echapper(l.cle)}</th><td>${l.html ? l.valeur : echapper(sansEspaceInsecable(l.valeur))}</td></tr>`).join('')}</table>`;
}

/** Tableau à colonnes avec état vide. `droite` : indices des colonnes alignées à droite (montants). */
export function tableauHtml(colonnes: string[], lignes: string[][], messageVide: string, droite: number[] = []): string {
  const cls = (i: number) => (droite.includes(i) ? ' class="droite"' : '');
  const corps = lignes.length === 0
    ? `<tr><td class="vide" colspan="${colonnes.length}">${echapper(messageVide)}</td></tr>`
    : lignes.map((l) => `<tr>${l.map((v, i) => `<td${cls(i)}>${echapper(sansEspaceInsecable(v))}</td>`).join('')}</tr>`).join('');
  return `<table class="colonnes"><thead><tr>${colonnes.map((c, i) => `<th${cls(i)}>${echapper(c)}</th>`).join('')}</tr></thead><tbody>${corps}</tbody></table>`;
}

const rgb = (c: [number, number, number]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

export function feuilleDeStyle(ecole: IdentiteEcole, format: 'A4' | 'A5'): string {
  const date = dateLongue();
  return `
@font-face{font-family:"Noto Sans";src:url("/fonts/NotoSans-Regular-sousensemble.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Noto Sans";src:url("/fonts/NotoSans-Bold-sousensemble.ttf") format("truetype");font-weight:700}
@page{size:${format};margin:${format === 'A5' ? '11mm 11mm 16mm' : '14mm 14mm 18mm'};
  @bottom-center{content:"Page " counter(page) "/" counter(pages) " — ${echapper(ecole.nom).replace(/"/g, '')} — Document généré par My School le ${date}";font:8pt "Noto Sans",Arial,sans-serif;color:#64748b}}
*{box-sizing:border-box}
body{font-family:"Noto Sans",Arial,sans-serif;color:#1e293b;margin:0;font-size:${format === 'A5' ? '10.5pt' : '11pt'};line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
header.entete{display:flex;align-items:center;gap:12px;padding-bottom:8px;border-bottom:2.5px solid ${rgb(ecole.couleur)}}
header.entete img{max-height:15mm;max-width:34mm;object-fit:contain}
.pastille{width:15mm;height:15mm;border-radius:50%;background:${rgb(ecole.couleur)};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13pt;flex-shrink:0}
.ecole{font-weight:700;font-size:13pt}.contacts{color:#64748b;font-size:8.5pt}
h1{font-size:15pt;margin:14px 0 2px}.sous-titre{margin:0 0 2px;font-size:10.5pt}.edition{color:#64748b;font-size:8.5pt;margin:0 0 12px}
table{border-collapse:collapse;width:100%;margin:6px 0 12px}
table.cle-valeur th{text-align:left;width:42%;font-weight:700}table.cle-valeur th,table.cle-valeur td{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top}
table.cle-valeur tr:nth-child(odd){background:#f4f6f9}
table.colonnes thead th{background:${rgb(ecole.couleur)};color:#fff;text-align:left;padding:6px 8px;font-size:9.5pt}
table.colonnes td{padding:5px 8px;border-bottom:1px solid #cbd5e1;font-size:9.5pt}table.colonnes tbody tr:nth-child(even){background:#f4f6f9}
.droite{text-align:right!important;white-space:nowrap}.vide{text-align:center;color:#64748b;padding:12px}
.note{font-size:8.5pt;color:#475569}.signature{margin-top:26px;display:flex;justify-content:space-between;font-size:10pt}
footer.pied{display:none}
@media screen{body{max-width:${format === 'A5' ? '148mm' : '210mm'};margin:12mm auto;padding:0 6mm}footer.pied{display:block;margin-top:18px;border-top:1px solid #cbd5e1;padding-top:6px;color:#64748b;font-size:8pt;text-align:center}}`;
}

/** En-tête HTML commun. */
export function enTeteHtml(ecole: IdentiteEcole, titre: string, sousTitre?: string): string {
  const contacts = [ecole.ville, ecole.telephone, ecole.email].filter(Boolean).map((c) => echapper(String(c))).join(' • ');
  const logo = ecole.logoUrl
    ? `<img src="${echapper(ecole.logoUrl)}" alt="" onerror="this.outerHTML='<div class=&quot;pastille&quot;>${echapper(initialesEcole(ecole.nom))}</div>'">`
    : `<div class="pastille">${echapper(initialesEcole(ecole.nom))}</div>`;
  return `<header class="entete">${logo}<div><div class="ecole">${echapper(ecole.nom)}</div>${contacts ? `<div class="contacts">${contacts}</div>` : ''}</div></header>
<h1>${echapper(titre)}</h1>${sousTitre ? `<p class="sous-titre">${echapper(sousTitre)}</p>` : ''}
<p class="edition">Édité le ${echapper(dateLongue())} — Année scolaire ${anneeScolaire()}</p>`;
}

/**
 * Ouvre le document dans une nouvelle fenêtre et lance l'impression.
 * Renvoie false si la fenêtre a été bloquée par le navigateur (à signaler à l'utilisateur).
 */
export function ouvrirDocumentImprimable(options: {
  titre: string; sousTitre?: string; corps: string; format?: 'A4' | 'A5'; ecole?: IdentiteEcole; titreFenetre?: string;
}): boolean {
  const ecole = options.ecole ?? identiteEcole();
  const format = options.format ?? 'A4';
  const w = window.open('', '_blank', format === 'A5' ? 'width=640,height=860' : 'width=820,height=980');
  if (!w) return false;
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echapper(options.titreFenetre ?? options.titre)}</title>
<style>${feuilleDeStyle(ecole, format)}</style></head><body>
${enTeteHtml(ecole, options.titre, options.sousTitre)}
${options.corps}
<footer class="pied">${echapper(ecole.nom)} — Document généré par My School le ${echapper(dateLongue())}</footer>
<script>window.onload=function(){setTimeout(function(){window.print();},150);}</script></body></html>`);
  w.document.close();
  return true;
}

import * as XLSX from 'xlsx';
import type { AbsenceNote, Evaluation, MoyennesCours, NoteEleve } from '../../../domain/Evaluations';
import { libelleType } from '../../../domain/Evaluations';

/** Saisie d'une cellule : nombre (virgule acceptée), « ABS », « EXCUSE » / « EXC », ou vide. */
export type SaisieAnalysee =
  | { ok: true; valeur: number | null; absence: AbsenceNote | null }
  | { ok: false; message: string };

export function analyserSaisie(brut: unknown, noteSur: number): SaisieAnalysee {
  const texte = brut === null || brut === undefined ? '' : String(brut).trim();
  if (texte === '') return { ok: true, valeur: null, absence: null };
  const maj = texte.toUpperCase();
  if (maj === 'ABS' || maj === 'ABSENT') return { ok: true, valeur: null, absence: 'ABS' };
  if (maj === 'EXC' || maj === 'EXCUSE' || maj === 'EXCUSÉ' || maj === 'EXCUSEE' || maj === 'EXCUSÉE') return { ok: true, valeur: null, absence: 'EXCUSE' };
  const normalise = texte.replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalise)) {
    return { ok: false, message: `« ${texte} » n'est pas une note (nombre, ABS ou EXCUSE).` };
  }
  const v = Number(normalise);
  if (v < 0 || v > noteSur) return { ok: false, message: `La note doit être comprise entre 0 et ${noteSur}.` };
  if (Math.abs(v * 100 - Math.round(v * 100)) > 1e-6) return { ok: false, message: 'Deux décimales au maximum.' };
  return { ok: true, valeur: v, absence: null };
}

/** Texte affiché dans la cellule pour une note du serveur. */
export function texteNote(valeur: number | null, absence: AbsenceNote | null): string {
  if (absence) return absence;
  return valeur === null || valeur === undefined ? '' : String(valeur);
}

export const nomComplet = (n: { prenom: string | null; nom: string | null }) =>
  [n.prenom, n.nom].filter(Boolean).join(' ').trim() || '—';

/** Moyenne affichée : « — » quand le serveur n'en donne pas (jamais de valeur inventée). */
export const texteMoyenne = (m: number | null | undefined) =>
  m === null || m === undefined ? '—' : m.toFixed(2).replace('.', ',');

function nomFeuille(texte: string): string {
  return texte.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Feuille';
}

function nomFichier(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'export';
}

/** Export Excel : grille de l'évaluation (valeurs ENREGISTRÉES) + moyennes du cours si disponibles. */
export function exporterExcel(coursTitre: string, evaluation: Evaluation, notes: readonly NoteEleve[], moyennes: MoyennesCours | null) {
  const wb = XLSX.utils.book_new();
  const grille = notes.map((n) => ({
    Matricule: n.matricule ?? '',
    Nom: n.nom ?? '',
    'Prénom': n.prenom ?? '',
    [`Note (/${evaluation.noteSur})`]: n.valeur ?? '',
    Absence: n.absence ?? '',
    Commentaire: n.commentaire ?? '',
  }));
  const wsGrille = XLSX.utils.json_to_sheet(grille);
  XLSX.utils.sheet_add_aoa(wsGrille, [[]], { origin: -1 });
  XLSX.utils.sheet_add_aoa(wsGrille, [[`${evaluation.titre} — ${libelleType(evaluation.type)} du ${evaluation.date} — coefficient ${evaluation.coefficient}${evaluation.verrouillee ? ' — VERROUILLÉE' : ''}`]], { origin: -1 });
  XLSX.utils.book_append_sheet(wb, wsGrille, nomFeuille(`Notes ${evaluation.titre}`));

  if (moyennes) {
    const evals = moyennes.evaluations;
    const lignes = moyennes.eleves.map((e) => {
      const l: Record<string, string | number> = { Matricule: e.matricule ?? '', Nom: e.nom ?? '', 'Prénom': e.prenom ?? '' };
      evals.forEach((ev) => {
        const n = e.notes[ev.id];
        l[`${ev.titre} (coef ${ev.coefficient}, /${ev.noteSur})`] = n ? (n.absence ?? n.valeur ?? '') : '';
      });
      l['Moyenne /20'] = e.moyenne ?? '—';
      l.Mention = e.mention ?? '—';
      l.Rang = e.rang ? `${e.rang} / ${e.nombreElevesClasses}` : '—';
      return l;
    });
    const wsMoy = XLSX.utils.json_to_sheet(lignes);
    XLSX.utils.sheet_add_aoa(wsMoy, [[], [`Règle : ${moyennes.regle}`]], { origin: -1 });
    XLSX.utils.book_append_sheet(wb, wsMoy, 'Moyennes');
  }
  XLSX.writeFile(wb, `Notes_${nomFichier(coursTitre)}_${nomFichier(evaluation.titre)}.xlsx`);
}

/** Rapport d'import, ligne par ligne, établi AVANT tout envoi au serveur. */
export interface LigneImport {
  readonly ligne: number;            // numéro de ligne dans le fichier (1 = en-tête)
  readonly matricule: string;
  readonly eleve: string | null;
  readonly brut: string;
  readonly erreur: string | null;
  readonly studentId: string | null;
  readonly valeur: number | null;
  readonly absence: AbsenceNote | null;
  readonly commentaire: string | null;
}

export interface RapportImport {
  readonly lignes: LigneImport[];
  readonly erreurGlobale: string | null;
}

const normaliser = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Lit le fichier (colonnes Matricule / Note, Commentaire facultatif) et vérifie chaque ligne. */
export async function analyserImport(fichier: File, evaluation: Evaluation, notes: readonly NoteEleve[]): Promise<RapportImport> {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(new Uint8Array(await fichier.arrayBuffer()), { type: 'array' });
  } catch {
    return { lignes: [], erreurGlobale: 'Fichier illisible : choisissez un classeur Excel (.xlsx, .xls) ou un fichier CSV.' };
  }
  const feuille = wb.Sheets[wb.SheetNames[0]];
  if (!feuille) return { lignes: [], erreurGlobale: 'Le fichier ne contient aucune feuille.' };
  const tableau: unknown[][] = XLSX.utils.sheet_to_json(feuille, { header: 1, blankrows: false, defval: '' });
  if (tableau.length < 2) return { lignes: [], erreurGlobale: 'Le fichier doit contenir une ligne d\'en-tête puis au moins une ligne de notes.' };
  const entetes = (tableau[0] ?? []).map(normaliser);
  const colMatricule = entetes.findIndex((h) => h === 'matricule');
  const colNote = entetes.findIndex((h) => h === 'note' || h.startsWith('note '));
  const colCommentaire = entetes.findIndex((h) => h === 'commentaire');
  if (colMatricule < 0 || colNote < 0) {
    return { lignes: [], erreurGlobale: 'Colonnes attendues introuvables : la première ligne doit contenir « Matricule » et « Note ».' };
  }
  const parMatricule = new Map<string, NoteEleve>();
  notes.forEach((n) => { if (n.matricule) parMatricule.set(normaliser(n.matricule), n); });
  const vus = new Set<string>();
  const lignes: LigneImport[] = [];
  tableau.slice(1).forEach((row, i) => {
    const numero = i + 2;
    const matricule = String(row[colMatricule] ?? '').trim();
    const brut = String(row[colNote] ?? '').trim();
    const commentaire = colCommentaire >= 0 ? String(row[colCommentaire] ?? '').trim() || null : null;
    if (!matricule && !brut) return;   // ligne vide (ex. ligne de légende)
    const base = { ligne: numero, matricule, brut, commentaire };
    const eleve = parMatricule.get(normaliser(matricule));
    if (!matricule) { lignes.push({ ...base, eleve: null, erreur: 'Matricule manquant.', studentId: null, valeur: null, absence: null }); return; }
    if (!eleve) { lignes.push({ ...base, eleve: null, erreur: 'Aucun élève de la classe n\'a ce matricule.', studentId: null, valeur: null, absence: null }); return; }
    const qui = nomComplet(eleve);
    if (vus.has(eleve.studentId)) { lignes.push({ ...base, eleve: qui, erreur: 'Élève déjà présent plus haut dans le fichier.', studentId: null, valeur: null, absence: null }); return; }
    vus.add(eleve.studentId);
    const a = analyserSaisie(brut, evaluation.noteSur);
    if (!a.ok) { lignes.push({ ...base, eleve: qui, erreur: a.message, studentId: null, valeur: null, absence: null }); return; }
    if (commentaire && commentaire.length > 500) { lignes.push({ ...base, eleve: qui, erreur: 'Commentaire trop long (500 caractères au maximum).', studentId: null, valeur: null, absence: null }); return; }
    if (commentaire && a.valeur === null && a.absence === null) { lignes.push({ ...base, eleve: qui, erreur: 'Un commentaire doit accompagner une note ou une absence.', studentId: null, valeur: null, absence: null }); return; }
    lignes.push({ ...base, eleve: qui, erreur: null, studentId: eleve.studentId, valeur: a.valeur, absence: a.absence });
  });
  if (lignes.length === 0) return { lignes, erreurGlobale: 'Aucune ligne de note trouvée dans le fichier.' };
  return { lignes, erreurGlobale: null };
}

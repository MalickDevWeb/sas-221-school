import type { PlanningSlot } from './SchoolModels';

/*
 * Déplacement d'un cours par glisser-déposer dans « Planning & Affectations » (2026-11-16).
 * - Déposé sur une case libre : le cours change de jour et d'horaire. Il garde son identifiant, donc le serveur met à
 *   jour la même séance chez le professeur, les élèves et les parents (PUT /admin/planning/slots).
 * - Déposé sur un autre cours de la même classe : les deux cours échangent leurs horaires.
 * Refus calqué sur le contrôle du serveur (ConflitsPlanning.java, qui répond 409) : même jour et horaires qui se
 * chevauchent → classe, professeur ou salle déjà pris, sauf une même séance (même matière, même professeur, même salle,
 * même heure de début) donnée à plusieurs classes. Vérifié ici pour expliquer le refus dès le survol ; le serveur
 * reste seul juge à l'enregistrement.
 */

export type ApercuDeplacement =
  | { etat: 'inchange' }
  | { etat: 'impossible'; court: string; raison: string }
  | { etat: 'deplacer' | 'echanger'; creneaux: PlanningSlot[]; message: string };

/** Salles qui ne bloquent rien (mêmes valeurs que SALLES_NEUTRES côté serveur). */
const SALLES_NEUTRES = new Set(['', 'salle non assignée', 'non assignée', 'à définir']);

const cle = (s: string | undefined | null) => (s ?? '').trim().toLowerCase();

/** « 08h », « 8h30 », « 08:00 » → minutes depuis minuit ; null si illisible (même lecture que le serveur). */
function minutes(h: string): number | null {
  let t = h.trim().replace(/[hH]/g, ':');
  if (t.endsWith(':')) t += '00';
  if (t.length === 4 && t[1] === ':') t = `0${t}`;
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(t);
  if (!m) return null;
  const heures = Number(m[1]);
  const mins = Number(m[2]);
  return heures < 24 && mins < 60 ? heures * 60 + mins : null;
}

/** « 08h - 10h » → début et fin (le serveur découpe la plage de la même façon). */
function plage(s: PlanningSlot): { debut: string; fin: string } {
  const [debut = '', fin = ''] = (s.slot ?? '').split(/\s*-\s*/, 2);
  return { debut: debut.trim(), fin: fin.trim() };
}

function chevauchent(a: PlanningSlot, b: PlanningSlot): boolean {
  const pa = plage(a);
  const pb = plage(b);
  const da = minutes(pa.debut);
  const db = minutes(pb.debut);
  if (da === null || db === null) return cle(pa.debut) === cle(pb.debut);
  const fa = minutes(pa.fin);
  const fb = minutes(pb.fin);
  if (fa === null || fb === null || fa <= da || fb <= db) return da === db;
  return da < fb && db < fa;
}

const titre = (s: PlanningSlot) => `« ${(s.subject ?? '').trim() || 'Cours sans intitulé'} »`;

/** Ce qui bloque le cours `m` (déjà placé à son nouvel horaire) face au cours `s`, ou null. */
function blocage(m: PlanningSlot, s: PlanningSlot, nomClasse: (id: string) => string): { court: string; raison: string } | null {
  if (cle(m.day) !== cle(s.day) || !chevauchent(m, s)) return null;
  const autreHoraire = s.slot === m.slot ? '' : `, ${s.day} ${s.slot}`;
  if (cle(m.classeId) === cle(s.classeId)) {
    return { court: 'Classe déjà en cours', raison: `la classe ${nomClasse(s.classeId)} a déjà un cours à ce moment-là (${titre(s)}${autreHoraire})` };
  }
  const memeSeance = cle(m.subject) === cle(s.subject) && cle(m.prof) === cle(s.prof)
    && cle(m.roomName) === cle(s.roomName) && cle(plage(m).debut) === cle(plage(s).debut);
  if (memeSeance) return null;   // cours commun à plusieurs classes : accepté par le serveur
  const autre = `${titre(s)}, classe ${nomClasse(s.classeId)}${autreHoraire}`;
  const salle = cle(m.roomName);
  if (!SALLES_NEUTRES.has(salle) && salle === cle(s.roomName)) {
    return { court: 'Salle déjà prise', raison: `la salle ${s.roomName.trim()} est déjà prise à ce moment-là (${autre})` };
  }
  const prof = cle(m.prof);
  if (prof && prof === cle(s.prof)) {
    return { court: 'Professeur déjà pris', raison: `${s.prof.trim()} a déjà cours à ce moment-là (${autre})` };
  }
  return null;
}

/**
 * Résultat du dépôt du cours `id` sur la case (jour, horaire) de sa classe : liste complète à enregistrer et message
 * à afficher une fois le serveur d'accord, ou refus motivé. Rien ne change si le cours est déposé sur sa propre case.
 */
export function evaluerDeplacement(
  slots: PlanningSlot[],
  id: string,
  jour: string,
  horaire: string,
  nomClasse: (id: string) => string = (i) => i,
): ApercuDeplacement {
  const cours = slots.find((s) => s.id === id);
  if (!cours || (cours.day === jour && cours.slot === horaire)) return { etat: 'inchange' };
  if (cours.isLive) {
    return { etat: 'impossible', court: 'Cours en direct', raison: `Le cours ${titre(cours)} est en direct : il ne peut pas être déplacé.` };
  }
  const occupant = slots.find((s) => s.id !== id && s.classeId === cours.classeId && s.day === jour && s.slot === horaire);
  if (occupant?.isLive) {
    return { etat: 'impossible', court: 'Cours en direct', raison: `Le cours ${titre(occupant)} du ${jour} ${horaire} est en direct : il ne peut pas être échangé.` };
  }
  const deplaces = [{ ...cours, day: jour, slot: horaire }];
  if (occupant) deplaces.push({ ...occupant, day: cours.day, slot: cours.slot });
  const nouveaux = new Map(deplaces.map((s) => [s.id, s]));
  const creneaux = slots.map((s) => nouveaux.get(s.id) ?? s);

  for (const m of deplaces) {
    for (const s of creneaux) {
      if (s.id === m.id) continue;
      const b = blocage(m, s, nomClasse);
      if (b) {
        return {
          etat: 'impossible',
          court: b.court,
          raison: `${occupant ? 'Échange' : 'Déplacement'} impossible : ${titre(m)} ne peut pas aller le ${m.day} ${m.slot}, car ${b.raison}.`,
        };
      }
    }
  }
  return occupant
    ? { etat: 'echanger', creneaux, message: `Cours échangés : ${titre(cours)} le ${jour} ${horaire}, ${titre(occupant)} le ${cours.day} ${cours.slot}.` }
    : { etat: 'deplacer', creneaux, message: `Cours déplacé : ${titre(cours)} a lieu désormais le ${jour} ${horaire}.` };
}

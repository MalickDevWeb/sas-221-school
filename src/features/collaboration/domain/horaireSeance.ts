/*
 * Horaire d'une classe virtuelle ou d'une réunion (16/11, demande du Tech Lead) : le lien apparaît aux élèves et aux
 * parents à l'heure de DÉBUT et la séance disparaît de leur écran après l'heure de FIN. Le serveur applique la règle
 * (POST /collaboration/meets refuse un horaire incohérent ; GET ne donne le lien qu'entre le début et la fin) ; l'écran
 * l'explique et vérifie la saisie avant l'envoi. Heures au format des champs datetime-local : AAAA-MM-JJTHH:MM.
 */

export type StatutSeance = 'a_venir' | 'en_cours' | 'terminee' | 'sans_horaire';

const DUREE_MAX_MS = 12 * 60 * 60 * 1000;

/** Message d'erreur de l'horaire saisi, ou null s'il est valable (mêmes règles que le serveur). */
export function erreurHoraire(debut: string, fin: string, maintenant = new Date()): string | null {
  if (!debut) return "Indiquez l'heure de début : le lien apparaîtra aux élèves à ce moment-là.";
  if (!fin) return "Indiquez l'heure de fin : le lien disparaîtra après.";
  const d = new Date(debut), f = new Date(fin);
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime())) return 'Horaire invalide.';
  if (f <= d) return "L'heure de fin doit être après l'heure de début.";
  if (f <= maintenant) return "L'heure de fin est déjà passée : la séance ne serait jamais visible.";
  if (f.getTime() - d.getTime() > DUREE_MAX_MS) return 'Une séance dure 12 heures au plus.';
  return null;
}

const deuxChiffres = (n: number) => String(n).padStart(2, '0');

/** Valeur d'un champ datetime-local (heure locale), arrondie à la minute. */
export function valeurChamp(d: Date): string {
  return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}T${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
}

const heure = (d: Date) => `${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
const memeJour = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function jour(d: Date, maintenant: Date): string {
  if (memeJour(d, maintenant)) return "aujourd'hui";
  const demain = new Date(maintenant); demain.setDate(demain.getDate() + 1);
  if (memeJour(d, demain)) return 'demain';
  return `le ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`;
}

/** « aujourd'hui de 14:00 à 15:30 », « demain de … », « le lundi 17 novembre de … ». */
export function libelleHoraire(debut?: string | null, fin?: string | null, maintenant = new Date()): string {
  if (!debut || !fin) return '';
  const d = new Date(debut), f = new Date(fin);
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime())) return '';
  return memeJour(d, f)
    ? `${jour(d, maintenant)} de ${heure(d)} à ${heure(f)}`
    : `du ${jour(d, maintenant)} ${heure(d)} au ${jour(f, maintenant)} ${heure(f)}`;
}

/** Statut à l'heure de l'appareil (le serveur fait foi ; sert à l'affichage et à recharger au bon moment). */
export function statutSeance(debut?: string | null, fin?: string | null, maintenant = new Date()): StatutSeance {
  if (!debut || !fin) return 'sans_horaire';
  if (maintenant < new Date(debut)) return 'a_venir';
  return maintenant > new Date(fin) ? 'terminee' : 'en_cours';
}

export const LIBELLE_STATUT: Record<StatutSeance, string> = {
  a_venir: 'À venir',
  en_cours: 'En cours',
  terminee: 'Terminée',
  sans_horaire: 'Sans horaire',
};

import { CourseSession } from '../domain/Schedule';
import { dateCompacteDuJour } from '@/shared/lib/semaine';

/*
 * APP-TL-26 : aucune connexion à Google depuis l'application.
 * Restent : ce lien « ajouter à Google Agenda » (aucun compte ni clé côté École 221) et l'export .ics (icalExport).
 */

/**
 * Lien d'ajout d'une séance à Google Agenda : la personne vérifie l'événement prérempli puis l'enregistre
 * elle-même dans son agenda. Aucune authentification ni appel d'API depuis l'application.
 */
export function getGoogleCalendarTemplateUrl(s: CourseSession): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  // Semaine EN COURS
  const datePrefix = dateCompacteDuJour(s.jour);

  const startStr = `${datePrefix}T${s.heureDebut.replace(':', '')}00`;
  const endStr = `${datePrefix}T${s.heureFin.replace(':', '')}00`;

  const text = encodeURIComponent(`[${s.type}] ${s.nom}`);
  const dates = `${startStr}/${endStr}`;
  const details = encodeURIComponent(`Enseignant : ${s.professeur}\nType : ${s.type}\n\nSyllabus : ${s.description}`);
  const location = encodeURIComponent(s.salle);

  return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}&ctz=Africa/Dakar`;
}

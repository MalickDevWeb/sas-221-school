import { CourseSession } from '../domain/Schedule';
import { dateCompacteDuJour } from '@/shared/lib/semaine';

/*
 * APP-TL-26 (2026-11-14) : plus aucune connexion à Google depuis l'application. Retirés : l'identifiant client
 * OAuth d'un projet Google tiers (issu d'un modèle AI Studio) écrit en dur, le flux de connexion implicite, et la
 * synchronisation par l'API Google Agenda (jamais appelée, et datée de la semaine du 23 octobre 2023).
 * Restent : ce lien « ajouter à Google Agenda » (aucun compte ni clé côté École 221) et l'export .ics (icalExport).
 */

/**
 * Lien d'ajout d'une séance à Google Agenda : la personne vérifie l'événement prérempli puis l'enregistre
 * elle-même dans son agenda. Aucune authentification ni appel d'API depuis l'application.
 */
export function getGoogleCalendarTemplateUrl(s: CourseSession): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  // Semaine EN COURS (2026-11-14 : avant, semaine du 23 octobre 2023 écrite en dur)
  const datePrefix = dateCompacteDuJour(s.jour);

  const startStr = `${datePrefix}T${s.heureDebut.replace(':', '')}00`;
  const endStr = `${datePrefix}T${s.heureFin.replace(':', '')}00`;

  const text = encodeURIComponent(`[${s.type}] ${s.nom}`);
  const dates = `${startStr}/${endStr}`;
  const details = encodeURIComponent(`Enseignant : ${s.professeur}\nType : ${s.type}\n\nSyllabus : ${s.description}`);
  const location = encodeURIComponent(s.salle);

  return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}&ctz=Africa/Dakar`;
}

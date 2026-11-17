import { CourseSession } from '../domain/Schedule';
import { dateCompacteDuJour } from '@/shared/lib/semaine';

/**
 * Génère un fichier iCalendar (.ics) standard pour importer tout l'emploi du temps
 * dans Google Calendar, Apple Calendar, Outlook, etc.
 */
export function exportToICS(sessions: CourseSession[], className: string = 'L3-GL') {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ecole221//StudentPortal//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Emploi du Temps ' + className + ' - École 221',
    'X-WR-TIMEZONE:Africa/Dakar'
  ];

  // Dates de la semaine EN COURS
  const getFormattedDate = (jour: CourseSession['jour'], time: string): string => {
    const cleanTime = (time || '00:00').replace(':', '') + '00';   // "08:00" -> "080000"
    return `${dateCompacteDuJour(jour)}T${cleanTime}`;
  };
  const maintenant = new Date();
  const horodatage = `${maintenant.getUTCFullYear()}${String(maintenant.getUTCMonth() + 1).padStart(2, '0')}${String(maintenant.getUTCDate()).padStart(2, '0')}T${String(maintenant.getUTCHours()).padStart(2, '0')}${String(maintenant.getUTCMinutes()).padStart(2, '0')}00Z`;

  // séances sans horaire lisible ou annulées : non exportées (aucune heure inventée)
  sessions.filter((s) => s.heureDebut && s.heureFin && s.status !== 'annule').forEach((s) => {
    const startStr = getFormattedDate(s.jour, s.heureDebut);
    const endStr = getFormattedDate(s.jour, s.heureFin);

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:session_${s.id}@ecole221.sn`);
    icsContent.push(`DTSTAMP:${horodatage}`);
    icsContent.push(`DTSTART;TZID=Africa/Dakar:${startStr}`);
    icsContent.push(`DTEND;TZID=Africa/Dakar:${endStr}`);
    icsContent.push(`SUMMARY:[${s.type}] ${s.nom}`);
    icsContent.push(`DESCRIPTION:Enseignant : ${s.professeur}\\nType : ${s.type}\\n\\nSyllabus/Description :\\n${(s.description || '').replace(/\n/g, '\\n')}`);
    icsContent.push(`LOCATION:${s.salle}`);
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('SEQUENCE:0');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const fullContent = icsContent.join('\r\n');
  
  // Téléchargement du fichier
  const blob = new Blob([fullContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `ecole221_schedule_${className.toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

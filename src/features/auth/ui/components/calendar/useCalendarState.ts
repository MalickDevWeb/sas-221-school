import { useEffect, useState } from 'react';
import { CourseSession } from './CalendarData';
import { useAuthStore } from '@/core/store/authStore';
import { ROLE_UTILISATEUR } from '@/shared/constants';
import { apiClient } from '@/shared/lib/apiClient';
import { checkIn } from '@/features/student/api';

const DAY_KEYS: Record<string, CourseSession['jour']> = {
  LUN: 'LUN', LUNDI: 'LUN', MONDAY: 'LUN',
  MAR: 'MAR', MARDI: 'MAR', TUESDAY: 'MAR',
  MER: 'MER', MERCREDI: 'MER', WEDNESDAY: 'MER',
  JEU: 'JEU', JEUDI: 'JEU', THURSDAY: 'JEU',
  VEN: 'VEN', VENDREDI: 'VEN', FRIDAY: 'VEN',
};
const DAY_NAMES: Record<CourseSession['jour'], string> = { LUN: 'Lundi', MAR: 'Mardi', MER: 'Mercredi', JEU: 'Jeudi', VEN: 'Vendredi' };

const pick = (...values: unknown[]): string => {
  for (const v of values) if (typeof v === 'string' && v.trim()) return v;
  return '';
};

/** Convertit une séance renvoyée par le backend ; ignorée si le jour est inconnu (aucune valeur inventée). */
function toCalendarSession(raw: any): CourseSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const dayRaw = pick(raw.jour, raw.day, raw.jourComplet).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const jour = DAY_KEYS[dayRaw];
  if (!jour) return null;
  const debut = pick(raw.heureDebut);
  const fin = pick(raw.heureFin);
  const type = ['CM', 'TD', 'TP'].includes(raw.type) ? raw.type : 'CM';
  return {
    id: String(raw.id ?? `${jour}-${pick(raw.nom, raw.courseTitle, raw.titre)}-${debut}`),
    nom: pick(raw.nom, raw.courseTitle, raw.titre) || '—',
    jour,
    jourNom: DAY_NAMES[jour],
    heure: pick(raw.heureStr, raw.heure, raw.time) || (debut && fin ? `${debut} - ${fin}` : '—'),
    salle: pick(raw.salle, raw.room) || '—',
    professeur: pick(raw.professeur, raw.profName) || '—',
    type,
    enCours: raw.status === 'actuel',
    syllabus: pick(raw.description, raw.syllabus) || 'Non renseigné',
  };
}

export function useCalendarState() {
  const { utilisateur } = useAuthStore();
  const [level, setLevel] = useState<'L3GL' | 'L2SR' | 'M1IA'>('L3GL');
  const [weekType, setWeekType] = useState<'currentWeek' | 'nextWeek'>('currentWeek');
  const [viewType, setViewType] = useState<'weekly' | 'monthly'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [presenceSuccess, setPresenceSuccess] = useState(false);
  const [presenceLoading, setPresenceLoading] = useState(false);
  const downloadingId: string | null = null;
  const downloadProgress = 0;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMonthDayIdx, setSelectedMonthDayIdx] = useState<number>(23);
  const [realSessions, setRealSessions] = useState<CourseSession[]>([]);

  // Emploi du temps réel : GET /professor/schedule (professeur) ou GET /schedule (étudiant).
  // Sans session ou en cas d'erreur : liste vide (état vide honnête), aucune séance inventée.
  const role = utilisateur?.role;
  useEffect(() => {
    if (!role || (role !== ROLE_UTILISATEUR.PROFESSEUR && role !== ROLE_UTILISATEUR.ETUDIANT)) {
      setRealSessions([]);
      return;
    }
    let cancelled = false;
    const url = role === ROLE_UTILISATEUR.PROFESSEUR ? '/professor/schedule' : '/schedule';
    apiClient.get(url)
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setRealSessions(list.map(toCalendarSession).filter((x): x is CourseSession => x !== null));
      })
      .catch(() => { if (!cancelled) setRealSessions([]); });
    return () => { cancelled = true; };
  }, [role]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectCourse = (course: CourseSession) => {
    setSelectedCourse(course);
    setSessionNotes(localStorage.getItem(`note_${level}_${course.id}`) || '');
    setIsNotesSaved(false); setPresenceSuccess(false); setShowQRModal(false);
  };

  const handleSaveNotes = () => {
    if (!selectedCourse) return;
    localStorage.setItem(`note_${level}_${selectedCourse.id}`, sessionNotes);
    setIsNotesSaved(true); triggerToast("Notes enregistrées avec succès !");
  };

  // Aucun endpoint backend ne fournit les supports d'une séance : message honnête, pas de faux téléchargement.
  const handleDownloadMaterials = (_courseId: string) => {
    triggerToast("Aucun support de cours n'est disponible au téléchargement pour cette séance.");
  };

  // Émargement réel : POST /student/attendances ; succès affiché uniquement après réponse 2xx.
  const triggerAttendanceScan = async () => {
    if (presenceLoading || presenceSuccess) return;
    if (utilisateur?.role !== ROLE_UTILISATEUR.ETUDIANT) {
      triggerToast("L'émargement est réservé aux étudiants connectés.");
      return;
    }
    setPresenceLoading(true);
    try {
      await checkIn({ type: 'PRESENT', method: 'QR' });
      setPresenceSuccess(true);
      triggerToast("Présence enregistrée !");
    } catch {
      triggerToast("Échec de l'enregistrement de la présence. Réessayez.");
    } finally {
      setPresenceLoading(false);
    }
  };

  // Le backend ne fournit que la semaine en cours : la semaine suivante reste vide.
  const rawSessions = weekType === 'currentWeek' ? realSessions : [];

  const displayedSessions = rawSessions.filter(c => {
    const q = (searchQuery || "").toLowerCase();
    return (c.nom || "").toLowerCase().includes(q) || 
           (c.professeur || "").toLowerCase().includes(q) || 
           (c.salle || "").toLowerCase().includes(q);
  });

  return {
    level, setLevel, weekType, setWeekType, viewType, setViewType,
    searchQuery, setSearchQuery, selectedCourse, setSelectedCourse,
    sessionNotes, setSessionNotes, isNotesSaved, showQRModal, setShowQRModal,
    presenceSuccess, presenceLoading, downloadingId, downloadProgress,
    toastMessage, selectedMonthDayIdx, setSelectedMonthDayIdx,
    rawSessions, displayedSessions, handleSelectCourse, handleSaveNotes,
    handleDownloadMaterials, triggerAttendanceScan, triggerToast
  };
}

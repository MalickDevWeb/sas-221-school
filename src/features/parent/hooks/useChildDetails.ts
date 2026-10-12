import { useState, useEffect, useCallback } from 'react';
import { parentApi } from '../api';
import type { ChildAttendance, ChildGrade, ChildScheduleItem, ParentMessage } from '../types';

// ─── Mock data fallback ──────────────────────────────────────
const MOCK_ATTENDANCES: ChildAttendance[] = [
  { id: 'a1', date: '2026-08-12', statut: 'PRESENT', cours: 'Algorithmique', professeur: 'Dr. Sall', heure: '08h00' },
  { id: 'a2', date: '2026-08-11', statut: 'RETARD', cours: 'Base de Données', professeur: 'Prof. Ndiaye', heure: '10h30' },
  { id: 'a3', date: '2026-08-10', statut: 'ABSENT', cours: 'Réseaux', professeur: 'Dr. Mbaye', heure: '14h00' },
  { id: 'a4', date: '2026-08-09', statut: 'PRESENT', cours: 'Algorithmique', professeur: 'Dr. Sall', heure: '08h00' },
  { id: 'a5', date: '2026-08-08', statut: 'PRESENT', cours: 'Systèmes d\'Exploitation', professeur: 'Dr. Fall', heure: '16h00' },
  { id: 'a6', date: '2026-08-07', statut: 'PRESENT', cours: 'Base de Données', professeur: 'Prof. Ndiaye', heure: '10h30' },
];

const MOCK_GRADES: ChildGrade[] = [
  { id: 'g1', module: 'Algorithmique Avancée', professeur: 'Dr. Sall', cc: 15.5, examen: 14, moyenne: 14.6, mention: 'Bien', ects: 6 },
  { id: 'g2', module: 'Base de Données', professeur: 'Prof. Ndiaye', cc: 16, examen: 13.5, moyenne: 14.5, mention: 'Bien', ects: 5 },
  { id: 'g3', module: 'Réseaux Informatiques', professeur: 'Dr. Mbaye', cc: 12, examen: 11, moyenne: 11.4, mention: 'Passable', ects: 4 },
  { id: 'g4', module: 'Systèmes d\'Exploitation', professeur: 'Dr. Fall', cc: 17, examen: 16, moyenne: 16.4, mention: 'Excellent', ects: 5 },
  { id: 'g5', module: 'Programmation Web', professeur: 'M. Diop', cc: 18, examen: 17.5, moyenne: 17.7, mention: 'Excellent', ects: 4 },
];

const MOCK_SCHEDULE: ChildScheduleItem[] = [
  { id: 's1', jour: 'Lundi', heure: '08h00 - 10h00', cours: 'Algorithmique', professeur: 'Dr. Sall', salle: 'A101', type: 'CM' },
  { id: 's2', jour: 'Lundi', heure: '10h30 - 12h30', cours: 'Base de Données', professeur: 'Prof. Ndiaye', salle: 'B203', type: 'TD' },
  { id: 's3', jour: 'Mardi', heure: '08h00 - 10h00', cours: 'Algorithmique', professeur: 'Dr. Sall', salle: 'A101', type: 'CM', enCours: true },
  { id: 's4', jour: 'Mardi', heure: '14h00 - 16h00', cours: 'Réseaux', professeur: 'Dr. Mbaye', salle: 'Lab 3', type: 'TP' },
  { id: 's5', jour: 'Mercredi', heure: '10h30 - 12h30', cours: 'Systèmes', professeur: 'Dr. Fall', salle: 'A201', type: 'CM' },
  { id: 's6', jour: 'Jeudi', heure: '08h00 - 10h00', cours: 'Prog. Web', professeur: 'M. Diop', salle: 'Lab Web', type: 'TP' },
  { id: 's7', jour: 'Vendredi', heure: '14h00 - 16h00', cours: 'Base de Données', professeur: 'Prof. Ndiaye', salle: 'B203', type: 'TP' },
];

const MOCK_MESSAGES: ParentMessage[] = [
  { id: 'm1', de: 'Dr. Sall', role: 'Professeur - Algorithmique', sujet: 'Progrès de votre enfant', message: 'Bonjour, je souhaite vous informer qu\'Aminata montre d\'excellentes dispositions en algorithmique. Son investissement est notable.', date: '2026-08-10', lu: false },
  { id: 'm2', de: 'Prof. Ndiaye', role: 'Professeur - Base de Données', sujet: 'Absence non justifiée', message: 'Votre enfant était absent au TD du 10 août. Merci de régulariser la situation avec un justificatif.', date: '2026-08-10', lu: false },
  { id: 'm3', de: 'Administration', role: 'Secrétariat', sujet: 'Réunion parents-professeurs', message: 'Une réunion parents-professeurs est prévue le 30 août 2026 à 10h00 dans la salle des conférences.', date: '2026-08-05', lu: true },
];

export function useChildDetails(enfantId: string | null) {
  const [attendances, setAttendances] = useState<ChildAttendance[]>([]);
  const [grades, setGrades] = useState<ChildGrade[]>([]);
  const [schedule, setSchedule] = useState<ChildScheduleItem[]>([]);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!enfantId) return;
    setLoading(true);
    try {
      const [att, gr, sch] = await Promise.all([
        parentApi.getChildAttendances(enfantId),
        parentApi.getChildGrades(enfantId),
        parentApi.getChildSchedule(enfantId),
      ]);
      setAttendances(att);
      setGrades(gr);
      setSchedule(sch);
    } catch (err: any) {
      console.warn("Erreur lors de la récupération des détails de l'enfant depuis le backend:", err?.message);
      setAttendances([]);
      setGrades([]);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [enfantId]);

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await parentApi.getMessages();
      setMessages(msgs || []);
    } catch (err: any) {
      console.warn("Erreur lors de la récupération des messages parent depuis le backend:", err?.message);
      setMessages([]);
    }
  }, []);

  const markRead = useCallback(async (msgId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, lu: true } : m)));
    try {
      await parentApi.markMessageRead(msgId);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    attendances,
    grades,
    schedule,
    messages,
    loading,
    markRead,
    unreadCount: messages.filter((m) => !m.lu).length,
  };
}

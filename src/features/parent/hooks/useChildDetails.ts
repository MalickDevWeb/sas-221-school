import { useState, useEffect, useCallback } from 'react';
import { parentApi } from '../api';
import type { ChildAttendance, ChildGrade, ChildScheduleItem, ParentMessage } from '../types';

// APP-FE-06 : aucune donnée de repli. En cas d'échec API, la liste reste vide
// et une erreur explicite est exposée pour que l'écran affiche un état d'erreur.
const ERREUR_CHARGEMENT = 'Impossible de charger ces données. Veuillez réessayer.';

export interface ChildDetailsErrors {
  attendances: string | null;
  grades: string | null;
  schedule: string | null;
  messages: string | null;
}

const NO_ERRORS: ChildDetailsErrors = { attendances: null, grades: null, schedule: null, messages: null };

export function useChildDetails(enfantId: string | null) {
  const [attendances, setAttendances] = useState<ChildAttendance[]>([]);
  const [grades, setGrades] = useState<ChildGrade[]>([]);
  const [schedule, setSchedule] = useState<ChildScheduleItem[]>([]);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ChildDetailsErrors>(NO_ERRORS);

  const fetchAll = useCallback(async () => {
    if (!enfantId) return;
    setLoading(true);
    // Chaque ressource est chargée indépendamment : l'échec de l'une
    // n'efface pas les autres, et aucune n'est remplacée par du fictif.
    const [att, gr, sch] = await Promise.allSettled([
      parentApi.getChildAttendances(enfantId),
      parentApi.getChildGrades(enfantId),
      parentApi.getChildSchedule(enfantId),
    ]);
    setAttendances(att.status === 'fulfilled' ? att.value ?? [] : []);
    setGrades(gr.status === 'fulfilled' ? gr.value ?? [] : []);
    setSchedule(sch.status === 'fulfilled' ? sch.value ?? [] : []);
    setErrors((prev) => ({
      ...prev,
      attendances: att.status === 'rejected' ? ERREUR_CHARGEMENT : null,
      grades: gr.status === 'rejected' ? ERREUR_CHARGEMENT : null,
      schedule: sch.status === 'rejected' ? ERREUR_CHARGEMENT : null,
    }));
    setLoading(false);
  }, [enfantId]);

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await parentApi.getMessages();
      setMessages(msgs ?? []);
      setErrors((prev) => ({ ...prev, messages: null }));
    } catch {
      setMessages([]);
      setErrors((prev) => ({ ...prev, messages: ERREUR_CHARGEMENT }));
    }
  }, []);

  const markRead = useCallback(async (msgId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, lu: true } : m)));
    try {
      await parentApi.markMessageRead(msgId);
    } catch { /* silencieux */ }
  }, []);

  const retry = useCallback(() => {
    void fetchAll();
    void fetchMessages();
  }, [fetchAll, fetchMessages]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  return {
    attendances,
    grades,
    schedule,
    messages,
    loading,
    errors,
    retry,
    markRead,
    unreadCount: messages.filter((m) => !m.lu).length,
  };
}

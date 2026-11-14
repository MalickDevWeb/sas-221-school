import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Lien d'une réunion Google Meet : https://meet.google.com/abc-defg-hij (même règle que le serveur). */
export function erreurLienMeet(brut: string): string | null {
  const t = brut.trim();
  if (!t) return 'Collez le lien de la réunion : créez-la sur meet.google.com (« Nouvelle réunion »), puis copiez son lien ici.';
  const lien = /^https?:\/\//i.test(t) ? t : 'https://' + t;
  if (!/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?\S*)?$/i.test(lien)) {
    return `« ${t} » n'est pas un lien Google Meet (forme attendue : https://meet.google.com/abc-defg-hij).`;
  }
  return null;
}

export interface LiveSession {
  id: string;
  courseName: string;
  teacherName: string;
  title: string;
  status: string;
  hlsUrl: string;
}

export function useProfessorLiveSessions(courseName: string, triggerToast: (msg: string) => void) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiClient.get('/student/live-sessions');
      const items = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setSessions(items);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 12000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // 2026-11-14 : statut renvoyé « ACTIVE » (avant : comparé à « active » → le cours en direct n'était jamais reconnu)
  const active = sessions.find((s) => s.courseName === courseName && String(s.status).toLowerCase() === 'active');

  /**
   * Diffuse le cours aux élèves. 2026-11-14 : le lien Google Meet est collé par le professeur (avant : il fallait
   * d'abord se connecter à Google par Firebase, configuré avec des valeurs factices → cours impossible à lancer).
   * Renvoie null si le cours est diffusé, sinon le message à afficher sous le champ.
   */
  const startMeet = async (title: string, rawUrl: string, profName: string): Promise<string | null> => {
    const erreur = erreurLienMeet(rawUrl);
    if (erreur) return erreur;
    let finalUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;

    try {
      const finalTitle = title.trim() || `Cours de ${courseName}`;
      await apiClient.post('/student/live-sessions', {
        courseName, teacherName: profName, title: finalTitle, meetUrl: finalUrl
      });
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      triggerToast('Cours diffusé : vos élèves voient le lien de la réunion.');
      fetchSessions();
      return null;
    } catch (err) {
      return resolveErrorMessage(err);   // rien n'a été diffusé
    }
  };

  const stopMeet = async (id: string) => {
    try {
      await apiClient.delete(`/student/live-sessions/${id}`);
      triggerToast('Le cours en direct est terminé.');
      fetchSessions();
    } catch {
      triggerToast('Erreur lors de la fermeture.');
    }
  };

  return { active, startMeet, stopMeet };
}

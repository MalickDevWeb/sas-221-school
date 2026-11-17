import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { messageSuppression, RAPPEL_RESTAURATION } from '@/features/corbeille/navigationCorbeille';
// Règle du lien Google Meet partagée avec la classe virtuelle de l'espace collaboratif (APP-TL-26)
import { erreurLienMeet, normaliserLienMeet } from '@/shared/lib/lienMeet';

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

  // Statut renvoyé « ACTIVE »
  const active = sessions.find((s) => s.courseName === courseName && String(s.status).toLowerCase() === 'active');

  /**
   * Diffuse le cours aux élèves. Le lien Google Meet est collé par le professeur.
   * Renvoie null si le cours est diffusé, sinon le message à afficher sous le champ.
   */
  const startMeet = async (title: string, rawUrl: string, profName: string): Promise<string | null> => {
    const erreur = erreurLienMeet(rawUrl);
    if (erreur) return erreur;
    const finalUrl = normaliserLienMeet(rawUrl);

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
      // Réponse « corbeille: true » (V21) : la séance disparaît pour les élèves et reste restaurable
      const { data } = await apiClient.delete(`/student/live-sessions/${id}`);
      const { message, corbeille } = messageSuppression(data, 'Le cours en direct est terminé.');
      triggerToast(corbeille ? `Cours en direct terminé. ${message} ${RAPPEL_RESTAURATION}` : message);
      fetchSessions();
    } catch (err) {
      triggerToast(`Cours en direct non terminé : ${resolveErrorMessage(err)}`);
    }
  };

  return { active, startMeet, stopMeet };
}

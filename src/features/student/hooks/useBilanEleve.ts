import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';

export interface Grade { id: string; module: string; prof: string; cc: number; examen: number; moyPromo: number; }

/** Moyenne d'un module, calculée comme le relevé officiel (40 % contrôle continu, 60 % examen). */
export const moyenneModule = (g: Grade) => Number(((Number(g.cc) || 0) * 0.4 + (Number(g.examen) || 0) * 0.6).toFixed(2));
export interface Course { id: string; titre: string; coefficient: number; progress: number; unites?: string[]; }
export interface Homework { id: string; statut: string; titre: string; deadlineStr: string; prio: string; }

/**
 * « Mon bilan » (APP-TL-24, remplace le tuteur IA) : notes, cours et devoirs réellement enregistrés pour l'élève
 * connecté. Aucun appel à un service d'IA, aucune conversation gardée dans le navigateur.
 */
export function useBilanEleve() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let actif = true;
    const liste = <T,>(chemin: string) => apiClient.get(chemin).then(r => (Array.isArray(r.data) ? r.data as T[] : []));
    Promise.all([liste<Grade>('/student/grades'), liste<Course>('/student/courses'), liste<Homework>('/student/homeworks')])
      .then(([g, c, h]) => { if (actif) { setGrades(g); setCourses(c); setHomeworks(h); } })
      .catch(() => { if (actif) setErreur(true); })
      .finally(() => { if (actif) setChargement(false); });
    return () => { actif = false; };
  }, []);

  return { grades, courses, homeworks, chargement, erreur };
}

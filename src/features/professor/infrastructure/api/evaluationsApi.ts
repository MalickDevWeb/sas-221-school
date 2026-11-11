import { apiClient } from '@/shared/lib/apiClient';
import type {
  EntreeJournal, Evaluation, EvaluationSaisie, LigneLot, MoyennesCours, NotesEvaluation,
} from '../../domain/Evaluations';

const base = (courseId: string) => `/professor/courses/${encodeURIComponent(courseId)}`;
const evalUrl = (courseId: string, evaluationId: string) => `${base(courseId)}/evaluations/${encodeURIComponent(evaluationId)}`;

/** Appels du modèle « évaluations multiples » (lot C). Le succès n'est affiché qu'après la réponse du serveur. */
export const evaluationsApi = {
  async lister(courseId: string): Promise<Evaluation[]> {
    const r = await apiClient.get(`${base(courseId)}/evaluations`);
    return Array.isArray(r.data) ? r.data : [];
  },
  async creer(courseId: string, saisie: EvaluationSaisie): Promise<Evaluation> {
    return (await apiClient.post(`${base(courseId)}/evaluations`, saisie)).data;
  },
  async modifier(courseId: string, evaluationId: string, saisie: Partial<EvaluationSaisie>): Promise<Evaluation> {
    return (await apiClient.put(evalUrl(courseId, evaluationId), saisie)).data;
  },
  async supprimer(courseId: string, evaluationId: string): Promise<void> {
    await apiClient.delete(evalUrl(courseId, evaluationId));
  },
  async notes(courseId: string, evaluationId: string): Promise<NotesEvaluation> {
    return (await apiClient.get(`${evalUrl(courseId, evaluationId)}/notes`)).data;
  },
  async enregistrerNotes(courseId: string, evaluationId: string, lignes: LigneLot[]): Promise<NotesEvaluation> {
    return (await apiClient.put(`${evalUrl(courseId, evaluationId)}/notes`, lignes)).data;
  },
  async moyennes(courseId: string): Promise<MoyennesCours> {
    return (await apiClient.get(`${base(courseId)}/moyennes`)).data;
  },
  async journal(courseId: string, evaluationId: string): Promise<EntreeJournal[]> {
    const r = await apiClient.get(`${evalUrl(courseId, evaluationId)}/journal`);
    return Array.isArray(r.data) ? r.data : [];
  },
};

import { apiClient } from '@/shared/lib/apiClient';

/**
 * Lot D — modification / suppression des contenus d'un cours et résultats des quiz (serveur uniquement).
 * Chaque fonction renvoie la réponse du serveur : l'écran n'affiche un succès qu'après elle.
 */
type Corps = Record<string, unknown>;

export interface ResultatsQuiz {
  quiz: { id: string; title: string; moduleId?: string; courseId: string; maxTentatives: number; nombreQuestions: number };
  synthese: {
    effectifClasse: number; nombreFaits: number; nombreNonFaits: number;
    moyenneScore: number | null; moyennePourcentage: number | null; nombreQuestions: number;
  };
  eleves: {
    studentId: string; nomComplet: string; matricule?: string | null; horsClasse: boolean;
    statut: 'FAIT' | 'NON_FAIT'; libelleStatut: string; score: number | null; total: number | null;
    pourcentage: number | null; nombreTentatives: number; date: string | null;
  }[];
  questions: {
    questionId: string; questionText: string; options: string[]; bonneReponse: number;
    nombreReponses: number; nombreBonnesReponses: number; tauxReussite: number | null; repartition: number[];
  }[];
}

const enc = encodeURIComponent;

export const contenusApi = {
  modifierModule: async (id: string, corps: Corps) => (await apiClient.put(`/professor/modules/${enc(id)}`, corps)).data,
  supprimerModule: async (id: string) => (await apiClient.delete(`/professor/modules/${enc(id)}`)).data,
  modifierSupport: async (id: string, corps: Corps) => (await apiClient.put(`/professor/lessons/${enc(id)}`, corps)).data,
  supprimerSupport: async (id: string) => (await apiClient.delete(`/professor/lessons/${enc(id)}`)).data,
  modifierQuiz: async (id: string, corps: Corps) => (await apiClient.put(`/professor/quizzes/${enc(id)}`, corps)).data,
  supprimerQuiz: async (id: string, supprimerResultats = false) =>
    (await apiClient.delete(`/professor/quizzes/${enc(id)}`, { params: supprimerResultats ? { supprimerResultats: true } : {} })).data,
  resultatsQuiz: async (courseId: string, quizId: string): Promise<ResultatsQuiz> =>
    (await apiClient.get(`/professor/courses/${enc(courseId)}/quizzes/${enc(quizId)}/resultats`)).data,
  modifierDevoir: async (id: string, corps: Corps) => (await apiClient.put(`/professor/homeworks/${enc(id)}`, corps)).data,
  supprimerDevoir: async (id: string) => (await apiClient.delete(`/professor/homeworks/${enc(id)}`)).data,
  modifierRappel: async (id: string, corps: Corps) => (await apiClient.put(`/professor/reminders/${enc(id)}`, corps)).data,
  supprimerRappel: async (id: string) => (await apiClient.delete(`/professor/reminders/${enc(id)}`)).data,
};

/** Code HTTP d'une erreur axios (ou undefined). */
export function codeHttp(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

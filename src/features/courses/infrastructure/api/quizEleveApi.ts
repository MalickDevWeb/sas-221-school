import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { marquerErreurAffichee } from '@/shared/errors/errorDictionary';
import { estObjet, listeBrute, nombreOuNull, objetBrut, texte, texteOuNull, vrai, type ObjetBrut } from '@/shared/lib/lectureServeur';

/**
 * Quiz passés par l'élève (lot D) — contrat lu dans QuizEleveController / QuizTentativeService (16/11) :
 * - GET  /student/courses/{courseId}/quizzes   → quiz du cours, questions et choix SANS la bonne réponse,
 *                                                état de mes tentatives (maxTentatives, tentativesRestantes, peutPasser…)
 * - POST /student/quizzes/{quizId}/tentatives  → corps { reponses: [index du choix, dans l'ordre des questions] } ;
 *                                                201 : note calculée par le serveur ; correction seulement quand la
 *                                                dernière tentative est utilisée ; 409 tentatives épuisées ; 400 réponse manquante
 * - GET  /student/quizzes/{quizId}/tentatives/moi → mes tentatives (404 tant que je n'ai pas passé le quiz)
 *
 * Sécurité : le navigateur ne lit jamais de bonne réponse avant l'envoi. La lecture des questions ne retient que
 * l'énoncé et les choix ; seule une correction renvoyée par le serveur APRÈS une tentative est affichée.
 */

export interface QuestionQuiz {
  id: string;
  enonce: string;
  choix: string[];
}

export interface ResumeTentative {
  id: string;
  score: number | null;
  total: number | null;
  pourcentage: number | null;
  /** Date-heure du serveur, lue par dateHeurePhrase. */
  date: unknown;
}

export interface QuizEleve {
  id: string;
  titre: string;
  module: string | null;
  description: string | null;
  dureeMinutes: number | null;
  nombreQuestions: number;
  questions: QuestionQuiz[];
  maxTentatives: number;
  tentativesUtilisees: number;
  tentativesRestantes: number;
  dejaFait: boolean;
  peutPasser: boolean;
  dernierResultat: ResumeTentative | null;
}

export interface LigneCorrection {
  questionId: string;
  enonce: string;
  choix: string[];
  reponseDonnee: number | null;
  bonneReponse: number | null;
  correcte: boolean;
}

export interface ResultatTentative {
  tentativeId: string;
  score: number | null;
  total: number | null;
  pourcentage: number | null;
  date: unknown;
  numeroTentative: number | null;
  maxTentatives: number | null;
  tentativesRestantes: number | null;
  /** Renvoyée par le serveur uniquement quand la dernière tentative autorisée vient d'être utilisée. */
  correction: LigneCorrection[] | null;
  message: string | null;
}

export interface MesResultats {
  maxTentatives: number | null;
  tentativesUtilisees: number;
  tentativesRestantes: number | null;
  tentatives: (ResumeTentative & { numero: number | null })[];
  correction: LigneCorrection[] | null;
}

const choix = (v: unknown): string[] => (Array.isArray(v) ? v.map(texte) : []);

const resume = (v: ObjetBrut): ResumeTentative => ({
  id: texte(v.id),
  score: nombreOuNull(v.score),
  total: nombreOuNull(v.total),
  pourcentage: nombreOuNull(v.pourcentage),
  date: v.date ?? null,
});

const lireResume = (v: unknown): ResumeTentative | null => (estObjet(v) ? resume(v) : null);

/** Énoncé et choix uniquement : aucun autre champ de la question n'est conservé. */
function lireQuestion(q: ObjetBrut, i: number): QuestionQuiz {
  return { id: texteOuNull(q.id) ?? `q-${i + 1}`, enonce: texte(q.questionText), choix: choix(q.options) };
}

function lireQuiz(q: ObjetBrut): QuizEleve {
  const questions = listeBrute(q.questions).map(lireQuestion);
  const max = nombreOuNull(q.maxTentatives) ?? 1;
  const utilisees = nombreOuNull(q.tentativesUtilisees) ?? 0;
  return {
    id: texte(q.id),
    titre: texteOuNull(q.title) ?? 'Quiz sans titre',
    module: texteOuNull(q.moduleTitle),
    description: texteOuNull(q.description),
    dureeMinutes: nombreOuNull(q.duration),
    nombreQuestions: nombreOuNull(q.nombreQuestions) ?? questions.length,
    questions,
    maxTentatives: max,
    tentativesUtilisees: utilisees,
    tentativesRestantes: nombreOuNull(q.tentativesRestantes) ?? Math.max(0, max - utilisees),
    dejaFait: vrai(q.dejaFait),
    peutPasser: vrai(q.peutPasser),
    dernierResultat: lireResume(q.dernierResultat),
  };
}

function lireCorrection(v: unknown): LigneCorrection[] | null {
  if (!Array.isArray(v)) return null;
  return listeBrute(v).map((d, i) => ({
    questionId: texteOuNull(d.questionId) ?? `q-${i + 1}`,
    enonce: texte(d.questionText),
    choix: choix(d.options),
    reponseDonnee: nombreOuNull(d.reponseDonnee),
    bonneReponse: nombreOuNull(d.bonneReponse),
    correcte: vrai(d.correcte),
  }));
}

function lireResultat(v: unknown): ResultatTentative {
  const r = objetBrut(v);
  return {
    tentativeId: texte(r.tentativeId),
    score: nombreOuNull(r.score),
    total: nombreOuNull(r.total),
    pourcentage: nombreOuNull(r.pourcentage),
    date: r.date ?? null,
    numeroTentative: nombreOuNull(r.numeroTentative),
    maxTentatives: nombreOuNull(r.maxTentatives),
    tentativesRestantes: nombreOuNull(r.tentativesRestantes),
    correction: lireCorrection(r.correction),
    message: texteOuNull(r.message),
  };
}

function lireMesResultats(v: unknown): MesResultats {
  const r = objetBrut(v);
  const tentatives = listeBrute(r.tentatives).map((t) => ({
    ...resume(t),
    numero: nombreOuNull(t.numero),
  }));
  return {
    maxTentatives: nombreOuNull(r.maxTentatives),
    tentativesUtilisees: nombreOuNull(r.tentativesUtilisees) ?? tentatives.length,
    tentativesRestantes: nombreOuNull(r.tentativesRestantes),
    tentatives,
    correction: lireCorrection(r.correction),
  };
}

/** L'écran affiche lui-même l'erreur : le message global (apiErrorHandler) n'est pas répété. */
async function lire<T>(appel: () => Promise<{ data: unknown }>, normaliser: (d: unknown) => T): Promise<T> {
  try {
    return normaliser((await appel()).data);
  } catch (e) {
    marquerErreurAffichee(e);
    throw e;
  }
}

/** Code HTTP d'une erreur d'API (null pour une panne réseau ou une erreur de l'écran). */
export function statutErreur(e: unknown): number | null {
  const reponse = objetBrut(e).response;
  return estObjet(reponse) ? nombreOuNull(reponse.status) : null;
}

const id = (v: string) => encodeURIComponent(v);

export const quizEleveApi = {
  lister: (courseId: string) =>
    lire(() => apiClient.get(`/student/courses/${id(courseId)}/quizzes`), (d) => listeBrute(d).map(lireQuiz)),
  passer: (quizId: string, reponses: number[]) =>
    lire(() => apiClient.post(`/student/quizzes/${id(quizId)}/tentatives`, { reponses }), lireResultat),
  mesResultats: (quizId: string) =>
    lire(() => apiClient.get(`/student/quizzes/${id(quizId)}/tentatives/moi`), lireMesResultats),
};

const CLE = ['eleve', 'quiz'] as const;
const cleCours = (courseId: string | undefined) => [...CLE, 'cours', courseId ?? ''] as const;
const cleResultats = (quizId: string) => [...CLE, 'resultats', quizId] as const;

/** Quiz du cours (toujours relus à l'ouverture de l'onglet : l'état des tentatives change à chaque envoi). */
export function useQuizDuCours(courseId: string | undefined) {
  return useQuery({
    queryKey: cleCours(courseId),
    queryFn: () => quizEleveApi.lister(courseId ?? ''),
    enabled: !!courseId,
    staleTime: 0,
    retry: 1,
  });
}

/** Mes tentatives à un quiz déjà passé (le serveur répond 404 tant qu'aucune tentative n'existe). */
export function useMesResultats(quizId: string, actif: boolean) {
  return useQuery({
    queryKey: cleResultats(quizId),
    queryFn: () => quizEleveApi.mesResultats(quizId),
    enabled: actif,
    staleTime: 0,
    retry: (n, e) => statutErreur(e) !== 404 && n < 1,
  });
}

/** Envoi d'une tentative : la note vient du serveur ; la liste et mes résultats sont relus ensuite (succès ou refus). */
export function usePasserQuiz(courseId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, reponses }: { quizId: string; reponses: number[] }) => quizEleveApi.passer(quizId, reponses),
    onError: () => { /* affichée par l'écran (message du serveur sous le quiz) */ },
    onSettled: (_r, _e, { quizId }) => {
      void client.invalidateQueries({ queryKey: cleCours(courseId) });
      void client.invalidateQueries({ queryKey: cleResultats(quizId) });
    },
  });
}

import { useCallback, useEffect, useState } from 'react';
import { getCourseDetails, submitHomework } from '@/features/student/api';

export interface CourseLesson { titre: string; estDerniereEnseignee?: boolean; duree: string; complete: boolean }
export interface CourseChapter { titre: string; lecons: CourseLesson[] }
export interface CourseResource { titre: string; type: 'pdf' | 'video' | 'code' | 'link'; taille: string }
export interface CourseQuiz { question: string; options: string[]; reponseCorrecte: number }
export interface CourseHomework { id: string; titre: string; dateLimite: string; points: string; statut: 'A rendre' | 'Soumis' }

export interface CourseDetails {
  chapitres: CourseChapter[];
  ressources: CourseResource[];
  quizzes: CourseQuiz[];
  devoirs: CourseHomework[];
}

/** Détails vides : état honnête quand le backend ne renvoie rien pour ce cours. */
export const EMPTY_COURSE_DETAILS: CourseDetails = { chapitres: [], ressources: [], quizzes: [], devoirs: [] };

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown): string => (typeof v === 'string' && v.trim() ? v : '—');

function normalize(raw: unknown): CourseDetails {
  if (!raw || typeof raw !== 'object') return EMPTY_COURSE_DETAILS;
  const r = raw as Record<string, unknown>;
  return {
    chapitres: asArray<Record<string, unknown>>(r.chapitres).map((c) => ({
      titre: str(c.titre),
      lecons: asArray<Record<string, unknown>>(c.lecons).map((l) => ({
        titre: str(l.titre),
        estDerniereEnseignee: l.estDerniereEnseignee === true,
        duree: str(l.duree),
        complete: l.complete === true,
      })),
    })),
    ressources: asArray<Record<string, unknown>>(r.ressources).map((res) => ({
      titre: str(res.titre),
      type: (['pdf', 'video', 'code', 'link'].includes(res.type as string) ? res.type : 'link') as CourseResource['type'],
      taille: str(res.taille),
    })),
    quizzes: asArray<Record<string, unknown>>(r.quizzes)
      .filter((q) => Array.isArray(q.options) && typeof q.reponseCorrecte === 'number')
      .map((q) => ({
        question: str(q.question),
        options: (q.options as unknown[]).map((o) => String(o)),
        reponseCorrecte: q.reponseCorrecte as number,
      })),
    devoirs: asArray<Record<string, unknown>>(r.devoirs)
      .filter((d) => typeof d.id === 'string' || typeof d.id === 'number')
      .map((d) => ({
        id: String(d.id),
        titre: str(d.titre),
        dateLimite: str(d.dateLimite),
        points: str(d.points),
        statut: d.statut === 'Soumis' ? 'Soumis' : 'A rendre',
      })),
  };
}

/**
 * Charge les détails d'un cours exclusivement depuis GET /student/courses/{id}/details.
 * Aucun contenu de secours inventé : en cas d'absence/erreur, détails vides + message.
 */
export function useRealCourseDetails(courseId: string | undefined) {
  const [details, setDetails] = useState<CourseDetails>(EMPTY_COURSE_DETAILS);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(!!courseId);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setDetails(EMPTY_COURSE_DETAILS);
      setIsLoadingDetails(false);
      return;
    }
    let cancelled = false;
    setIsLoadingDetails(true);
    setDetailsError(null);
    getCourseDetails(courseId)
      .then((data) => { if (!cancelled) setDetails(normalize(data)); })
      .catch((err: { response?: { status?: number } }) => {
        if (cancelled) return;
        setDetails(EMPTY_COURSE_DETAILS);
        setDetailsError(
          err?.response?.status === 404
            ? "Aucun contenu publié pour ce cours pour le moment."
            : "Impossible de charger le contenu du cours. Réessayez plus tard."
        );
      })
      .finally(() => { if (!cancelled) setIsLoadingDetails(false); });
    return () => { cancelled = true; };
  }, [courseId]);

  return { details, isLoadingDetails, detailsError };
}

/** Taille lisible d'un fichier réel (pas de valeur inventée). */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${bytes} o`;
}

/**
 * Remise d'un devoir via POST /student/courses/{courseId}/homeworks/{homeworkId}/submit.
 * Le statut « Soumis » n'est appliqué qu'après une réponse 2xx du serveur.
 */
export function useHomeworkSubmission(
  courseId: string | undefined,
  triggerToast: (msg: string) => void,
  initialStatus: Record<string, 'A rendre' | 'Soumis'>
) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string }>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [homeworkStatus, setHomeworkStatus] = useState<Record<string, 'A rendre' | 'Soumis'>>(initialStatus);

  // Synchronise le statut initial quand les détails réels arrivent.
  const initialKey = JSON.stringify(initialStatus);
  useEffect(() => {
    setHomeworkStatus(JSON.parse(initialKey));
  }, [initialKey]);

  const submit = useCallback(async (homeworkId: string, file: File) => {
    if (uploadingId) return;
    if (!courseId) {
      triggerToast("Cours introuvable : impossible de remettre le devoir.");
      return;
    }
    setUploadingId(homeworkId);
    setUploadProgress(0);
    try {
      await submitHomework(courseId, homeworkId, file);
      setUploadProgress(100);
      setUploadedFiles((prev) => ({ ...prev, [homeworkId]: { name: file.name, size: formatFileSize(file.size) } }));
      setHomeworkStatus((prev) => ({ ...prev, [homeworkId]: 'Soumis' }));
      triggerToast("Devoir remis avec succès.");
    } catch {
      triggerToast("Échec de la remise du devoir. Vérifiez votre connexion et réessayez.");
    } finally {
      setUploadingId(null);
    }
  }, [courseId, triggerToast, uploadingId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, homeworkId: string) => {
    const file = e.target.files?.[0];
    if (file) void submit(homeworkId, file);
    e.target.value = '';
  };

  return { uploadedFiles, setUploadedFiles, uploadingId, uploadProgress, homeworkStatus, setHomeworkStatus, handleFileChange };
}

export function initialHomeworkStatus(details: CourseDetails): Record<string, 'A rendre' | 'Soumis'> {
  const initial: Record<string, 'A rendre' | 'Soumis'> = {};
  details.devoirs.forEach((d) => { initial[d.id] = d.statut; });
  return initial;
}

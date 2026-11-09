import { apiClient } from '@/shared/lib/apiClient';
import type { Course } from '../../domain/Course';
import type { CourseRepository } from '../../domain/CourseRepository';

export class ApiCourseRepository implements CourseRepository {
  private readonly baseUrl: string;

  // Correct backend path per README: GET /student/courses
  constructor(baseUrl: string = '/student/courses') {
    this.baseUrl = baseUrl;
  }

  async getStudentCourses(): Promise<Course[]> {
    const { data: rawData } = await apiClient.get<unknown>(this.baseUrl);

    // Réponse inattendue : aucune donnée inventée, liste vide (état vide côté UI).
    if (!Array.isArray(rawData)) return [];

    // Seuls les champs réellement renvoyés par le backend sont mappés ;
    // un champ texte absent est affiché « — », jamais complété par un catalogue fictif.
    const text = (...values: unknown[]): string => {
      for (const v of values) {
        if (typeof v === 'string' && v.trim()) return v;
      }
      return '—';
    };
    const optionalText = (...values: unknown[]): string | undefined => {
      const v = text(...values);
      return v === '—' ? undefined : v;
    };

    return rawData
      .filter((c): c is Record<string, any> => !!c && typeof c === 'object' && (typeof c.id === 'string' || typeof c.id === 'number'))
      .map((c) => {
        const progression = typeof c.progress === 'number' ? c.progress : typeof c.progression === 'number' ? c.progression : 0;
        return {
          id: String(c.id),
          nom: text(c.titre, c.nom),
          description: text(c.description),
          categorie: text(c.categorie) as Course['categorie'],
          statut: c.statut || (progression === 100 ? 'termine' : progression > 0 ? 'en_cours' : 'non_demarre'),
          image: typeof c.image === 'string' ? c.image : '',
          progression,
          noteFinale: optionalText(c.noteFinale),
          professeur: text(c.professeur),
          salle: text(c.salle),
          avis: optionalText(c.avis),
          volumeHoraire: text(c.volumeHoraire),
          prochainCours: optionalText(c.prochainCours, c.prochain_cours),
        };
      });
  }

  /** GET /student/courses/{courseId}/details */
  async getCourseDetails(courseId: string): Promise<Record<string, unknown>> {
    const { data } = await apiClient.get(`${this.baseUrl}/${courseId}/details`);
    return data;
  }
}

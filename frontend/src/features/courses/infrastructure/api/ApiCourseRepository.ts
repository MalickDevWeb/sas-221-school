import { apiClient } from '@/shared/lib/apiClient';
import type { Course } from '../../domain/Course';
import type { CourseRepository } from '../../domain/CourseRepository';
import { COURS_CATALOGUE } from '../../ui/components/types';

export class ApiCourseRepository implements CourseRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/courses') {
    this.baseUrl = baseUrl;
  }

  async getStudentCourses(): Promise<Course[]> {
    const { data: rawData } = await apiClient.get<Course[]>(this.baseUrl);

    if (!Array.isArray(rawData)) return COURS_CATALOGUE;

    return rawData.map((c: any, index: number) => {
      const localCourse = COURS_CATALOGUE.find(lc =>
        lc.id === c.id ||
        lc.id.replace('course-', 'c-') === c.id ||
        c.id?.replace('c-', 'course-') === lc.id ||
        lc.nom.toLowerCase().includes((c.titre || c.nom || '').toLowerCase())
      ) || COURS_CATALOGUE[index % COURS_CATALOGUE.length];

      return {
        id: c.id || localCourse.id,
        nom: c.titre || c.nom || localCourse.nom,
        description: c.description || localCourse.description,
        categorie: c.categorie || localCourse.categorie,
        statut: c.statut || (c.progress === 100 ? 'termine' : (c.progress && c.progress > 0) ? 'en_cours' : 'non_demarre'),
        image: c.image || localCourse.image,
        progression: typeof c.progress === 'number' ? c.progress : typeof c.progression === 'number' ? c.progression : localCourse.progression,
        noteFinale: c.noteFinale || localCourse.noteFinale,
        professeur: c.professeur || localCourse.professeur,
        salle: c.salle || localCourse.salle,
        avis: c.avis || localCourse.avis,
        volumeHoraire: c.volumeHoraire || localCourse.volumeHoraire,
        prochainCours: c.prochainCours || c.prochain_cours || localCourse.prochainCours
      };
    });
  }
}

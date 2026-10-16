import { apiClient } from '@/shared/lib/apiClient';
import type { Grade } from '../../domain/Grade';
import type { GradeRepository } from '../../domain/GradeRepository';

export class ApiGradeRepository implements GradeRepository {
  // Correct backend path per README: GET /student/grades
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/student/grades') {
    this.baseUrl = baseUrl;
  }

  async getStudentGrades(): Promise<Grade[]> {
    const { data } = await apiClient.get<Grade[]>(this.baseUrl);
    return data;
  }

  async requestGradeReview(gradeId: string, reason: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${gradeId}/review`, { reason });
  }

  /** GET /student/grades/download → returns PDF Blob */
  async downloadGradesPdf(): Promise<Blob> {
    const res = await apiClient.get(`${this.baseUrl}/download`, { responseType: 'blob' });
    return res.data;
  }
}

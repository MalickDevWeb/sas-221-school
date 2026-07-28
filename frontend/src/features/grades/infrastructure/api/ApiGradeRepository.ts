import { apiClient } from '@/shared/lib/apiClient';
import type { Grade } from '../../domain/Grade';
import type { GradeRepository } from '../../domain/GradeRepository';

export class ApiGradeRepository implements GradeRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/grades') {
    this.baseUrl = baseUrl;
  }

  async getStudentGrades(): Promise<Grade[]> {
    const { data } = await apiClient.get<Grade[]>(this.baseUrl);
    return data;
  }

  async requestGradeReview(gradeId: string, reason: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${gradeId}/review`, { reason });
  }
}

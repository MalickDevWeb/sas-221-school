import { apiClient } from '@/shared/lib/apiClient';
import type { Homework } from '../../domain/Homework';
import type { HomeworkRepository } from '../../domain/HomeworkRepository';

export class ApiHomeworkRepository implements HomeworkRepository {
  private readonly baseUrl: string;

  // Correct backend path per README: GET /student/homeworks
  constructor(baseUrl: string = '/student/homeworks') {
    this.baseUrl = baseUrl;
  }

  async getHomeworks(): Promise<Homework[]> {
    const { data } = await apiClient.get<Homework[]>(this.baseUrl);
    return data;
  }

  async saveHomework(homework: Homework): Promise<void> {
    await apiClient.post(this.baseUrl, homework);
  }

  async startHomework(homeworkId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${homeworkId}/start`);
  }

  async advanceHomeworkProgress(homeworkId: string, addedProgress: number): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${homeworkId}/progress`, { addedProgress });
  }

  /**
   * POST /student/courses/{courseId}/homeworks/{homeworkId}/submit
   * Uses multipart/form-data with field "file" as required by the backend README.
   */
  async submitHomework(homeworkId: string, fileData: File | Blob, courseId?: string): Promise<void> {
    const form = new FormData();
    form.append('file', fileData);
    const url = courseId
      ? `/student/courses/${courseId}/homeworks/${homeworkId}/submit`
      : `${this.baseUrl}/${homeworkId}/submit`;
    await apiClient.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

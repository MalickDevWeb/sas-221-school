import { apiClient } from '@/shared/lib/apiClient';
import type { Homework } from '../../domain/Homework';
import type { HomeworkRepository } from '../../domain/HomeworkRepository';

export class ApiHomeworkRepository implements HomeworkRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/homeworks') {
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

  async submitHomework(homeworkId: string, fileData: File | Blob): Promise<void> {
    const base64Str = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileData);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
    await apiClient.post(`${this.baseUrl}/${homeworkId}/submit`, { fileStr: base64Str });
  }
}

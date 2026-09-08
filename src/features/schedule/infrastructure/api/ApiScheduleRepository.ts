import { apiClient } from '@/shared/lib/apiClient';
import type { CourseSession } from '../../domain/Schedule';
import type { ScheduleRepository } from '../../domain/ScheduleRepository';

export class ApiScheduleRepository implements ScheduleRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/schedule') {
    this.baseUrl = baseUrl;
  }

  async getWeeklySchedule(): Promise<CourseSession[]> {
    const { data } = await apiClient.get<CourseSession[]>(this.baseUrl);
    return data;
  }
}

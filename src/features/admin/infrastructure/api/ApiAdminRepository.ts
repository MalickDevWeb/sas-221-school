import { apiClient } from '@/shared/lib/apiClient';
import { AdminRepository } from '../../domain/AdminRepository';
import { AdminStats, AdminStudent, AdminProfessor, AdminPromotion, AdminSession } from '../../domain/AdminModels';

export class ApiAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    const { data } = await apiClient.get<AdminStats>('/admin/stats');
    return data;
  }

  async getUsers(): Promise<{ students: AdminStudent[]; professors: AdminProfessor[]; promotions: AdminPromotion[] }> {
    const { data } = await apiClient.get('/admin/users');
    return data;
  }

  async addStudent(student: { name: string; matricule: string; promotion_id: string }): Promise<AdminStudent> {
    const { data } = await apiClient.post<AdminStudent>('/admin/students', student);
    return data;
  }

  async deleteStudent(id: string): Promise<boolean> {
    await apiClient.delete(`/admin/students/${id}`);
    return true;
  }

  async addProfessor(professor: { name: string; email: string }): Promise<AdminProfessor> {
    const { data } = await apiClient.post<AdminProfessor>('/admin/professors', professor);
    return data;
  }

  async deleteProfessor(id: string): Promise<boolean> {
    await apiClient.delete(`/admin/professors/${id}`);
    return true;
  }

  async updateStudentPayment(id: string, status: string): Promise<AdminStudent> {
    const { data } = await apiClient.patch<AdminStudent>(`/admin/students/${id}/status`, { statutFrais: status });
    return data;
  }

  async getSchedule(): Promise<AdminSession[]> {
    const { data } = await apiClient.get<AdminSession[]>('/admin/schedule');
    return data;
  }

  async rescheduleSession(id: string, update: { jourComplet: string; heureStr: string; salle: string }): Promise<AdminSession> {
    const { data } = await apiClient.post<AdminSession>(`/admin/schedule/${id}/reschedule`, update);
    return data;
  }
}

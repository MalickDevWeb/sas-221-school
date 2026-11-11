import { lazy } from 'react';

/** Pages chargées à la demande pour TenantAppRoutes.tsx (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export const AdminPage = lazy(() => import('@/features/admin').then(m => ({ default: m.AdminPage })));
export const BrandingSettingsPage = lazy(() => import('@/features/admin/ui/pages/BrandingSettingsPage').then(m => ({ default: m.BrandingSettingsPage })));
export const ProfessorDashboardPage = lazy(() => import('@/features/professor').then(m => ({ default: m.ProfessorDashboardPage })));
export const ParentLayout = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentLayout })));
export const ParentDashboardPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentDashboardPage })));
export const ParentSchedulePage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentSchedulePage })));
export const ParentAttendancePage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentAttendancePage })));
export const ParentGradesPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentGradesPage })));
export const ParentMessagesPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentMessagesPage })));
export const ParentEnrollChildPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentEnrollChildPage })));
export const ParentApplicationTrackingPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentApplicationTrackingPage })));
export const ParentPaymentsPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentPaymentsPage })));
export const ParentProfilePage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentProfilePage })));
export const VigilLayout = lazy(() => import('@/features/vigil').then(m => ({ default: m.VigilLayout })));
export const VigilPatrolPage = lazy(() => import('@/features/vigil').then(m => ({ default: m.VigilPatrolPage })));
export const StudentLayout = lazy(() => import('@/features/student/ui/components/layout/StudentLayout').then(m => ({ default: m.StudentLayout })));
export const StudentDashboardPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentDashboardPage })));
export const StudentCoursesPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentCoursesPage })));
export const CourseDetailPage = lazy(() => import('@/features/student').then(m => ({ default: m.CourseDetailPage })));
export const StudentHomeworksPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentHomeworksPage })));
export const StudentSchedulePage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentSchedulePage })));
export const StudentGradesPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentGradesPage })));
export const StudentAbsencesPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentAbsencesPage })));
export const StudentProfilePage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentProfilePage })));
export const StudentTutorPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentTutorPage })));
export const CollaborationPage = lazy(() => import('@/features/collaboration/ui/pages/CollaborationPage').then(m => ({ default: m.CollaborationPage })));

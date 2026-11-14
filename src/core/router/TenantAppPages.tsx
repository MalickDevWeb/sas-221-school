import { lazyAvecRelance } from '@/shared/lib/lazyAvecRelance';

/** Pages chargées à la demande pour TenantAppRoutes.tsx (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export const AdminPage = lazyAvecRelance(() => import('@/features/admin').then(m => ({ default: m.AdminPage })));
export const BrandingSettingsPage = lazyAvecRelance(() => import('@/features/admin/ui/pages/BrandingSettingsPage').then(m => ({ default: m.BrandingSettingsPage })));
export const ProfessorDashboardPage = lazyAvecRelance(() => import('@/features/professor').then(m => ({ default: m.ProfessorDashboardPage })));
export const ParentLayout = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentLayout })));
export const ParentDashboardPage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentDashboardPage })));
export const ParentSchedulePage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentSchedulePage })));
export const ParentAttendancePage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentAttendancePage })));
export const ParentGradesPage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentGradesPage })));
export const ParentMessagesPage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentMessagesPage })));
export const ParentEnrollChildPage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentEnrollChildPage })));
export const ParentApplicationTrackingPage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentApplicationTrackingPage })));
export const ParentPaymentsPage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentPaymentsPage })));
export const ParentProfilePage = lazyAvecRelance(() => import('@/features/parent').then(m => ({ default: m.ParentProfilePage })));
export const VigilLayout = lazyAvecRelance(() => import('@/features/vigil').then(m => ({ default: m.VigilLayout })));
export const VigilPatrolPage = lazyAvecRelance(() => import('@/features/vigil').then(m => ({ default: m.VigilPatrolPage })));
export const StudentLayout = lazyAvecRelance(() => import('@/features/student/ui/components/layout/StudentLayout').then(m => ({ default: m.StudentLayout })));
export const StudentDashboardPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentDashboardPage })));
export const StudentCoursesPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentCoursesPage })));
export const CourseDetailPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.CourseDetailPage })));
export const StudentHomeworksPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentHomeworksPage })));
export const StudentSchedulePage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentSchedulePage })));
export const StudentGradesPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentGradesPage })));
export const StudentAbsencesPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentAbsencesPage })));
export const StudentProfilePage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentProfilePage })));
export const StudentTutorPage = lazyAvecRelance(() => import('@/features/student').then(m => ({ default: m.StudentTutorPage })));
export const CollaborationPage = lazyAvecRelance(() => import('@/features/collaboration/ui/pages/CollaborationPage').then(m => ({ default: m.CollaborationPage })));

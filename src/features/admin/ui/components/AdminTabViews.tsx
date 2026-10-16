import React from 'react';
import { AdminCEODashboard } from './AdminCEODashboard';
import { AdminSchoolManager } from './AdminSchoolManager';
import { AdminGlobalScheduler } from './AdminGlobalScheduler';
import { AdminPersonnelRH } from './AdminPersonnelRH';
import { AdminStudentManager } from './AdminStudentManager';
import { AdminAdmissionsKanban } from './AdminAdmissionsKanban';
import { AdminFinanceDashboard } from './AdminFinanceDashboard';
import { AdminNotificationsHub } from './AdminNotificationsHub';
import { AdminPredictiveAIEngine } from './AdminPredictiveAIEngine';
import { AdminSecurityAuditTrail } from './AdminSecurityAuditTrail';
import { AdminSubscriptionManager } from './AdminSubscriptionManager';
import { AdminBrandingManager } from './branding/AdminBrandingManager';
import { CollaborationPage } from '@/features/collaboration/ui/pages/CollaborationPage';

interface AdminTabViewsProps {
  activeTab: string;
  currency?: string;
}

export const AdminTabViews: React.FC<AdminTabViewsProps> = ({ activeTab, currency = 'FCFA' }) => {
  const views: Record<string, React.ReactNode> = {
    dashboard: <AdminCEODashboard currency={currency} />,
    promotions: <AdminSchoolManager defaultTab="classes" />,
    school: <AdminSchoolManager defaultTab="classes" />,
    schedule: <AdminGlobalScheduler />,
    personnel: <AdminPersonnelRH />,
    students: <AdminStudentManager />,
    admissions: <AdminAdmissionsKanban />,
    finances: <AdminFinanceDashboard />,
    collaboration: <CollaborationPage />,
    billing: <AdminSubscriptionManager />,
    notifications: <AdminNotificationsHub />,
    branding: <AdminBrandingManager />,
    ai: <AdminPredictiveAIEngine />,
    security: <AdminSecurityAuditTrail />,
  };

  return <>{views[activeTab] || <AdminCEODashboard currency={currency} />}</>;
};

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
export type TenantPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface Tenant {
  id: string;
  name: string;
  contactEmail: string;
  status: TenantStatus;
  plan: TenantPlan;
  usersCount: number;
  createdAt: string;
}


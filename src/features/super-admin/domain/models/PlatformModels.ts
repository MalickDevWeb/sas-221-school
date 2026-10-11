/** TenantDto — correspond exactement à la réponse de GET /api/v1/super-admin/tenants */
export interface Tenant {
  id: string;
  name: string;
  type: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  createdAt: string;
  slug?: string | null;
  contactEmail?: string | null;
  // Champs locaux supplémentaires (UI uniquement)
  usersCount?: number;
}

/** CreateTenantCommand — POST /api/v1/super-admin/tenants */
export interface CreateTenantCommand {
  name: string;
  email: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  adminNom: string;
  adminPrenom: string;
  adminEmail: string;
  adminPhone?: string;
}

export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: string;
}

// ── Plans & Abonnements [BE-004] ────────────────────────────────────────────
export interface Entitlement {
  featureCode: string;
  maxLimit: number;
  isEnabled: boolean;
}

export interface PlanDto {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  entitlements: Entitlement[];
}

export interface CreatePlanCommand {
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  entitlements: Entitlement[];
}

export interface SubscriptionDto {
  id: string;
  organizationId: string;
  tenantName?: string;
  planId: string;
  planName?: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
}

export interface AssignPlanCommand {
  organizationId: string;
  planId: string;
  endDate: string | null;
}



import React from 'react';
import type { TenantStatus, TenantPlan } from '../../domain/model/Tenant';

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const config = {
    ACTIVE: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Actif' },
    SUSPENDED: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Suspendu' },
    TRIAL: { className: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Essai' },
  };

  const { className, label } = config[status];

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className}`}>
      {label}
    </span>
  );
}

export function TenantPlanBadge({ plan }: { plan: TenantPlan }) {
  const config = {
    BASIC: { className: 'bg-gray-100 text-gray-800 border-gray-200' },
    PRO: { className: 'bg-blue-100 text-blue-800 border-blue-200' },
    ENTERPRISE: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
  };

  const { className } = config[plan];

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${className}`}>
      {plan}
    </span>
  );
}


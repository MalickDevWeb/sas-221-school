import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, AlertTriangle, Sliders, ExternalLink, Archive } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import type { Tenant } from '../../../domain/models/PlatformModels';

interface Props {
  tenants: Tenant[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onArchive: (id: string, name: string) => void;
  onEdit: (tenant: Tenant) => void;
}

const statusConfig = {
  ACTIVE: { label: 'Actif', icon: CheckCircle2, cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  PENDING: { label: 'En attente', icon: Clock, cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  SUSPENDED: { label: 'Suspendu', icon: AlertTriangle, cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  REJECTED: { label: 'Rejeté', icon: AlertTriangle, cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export const TenantsCardGrid: React.FC<Props> = ({
  tenants, isLoading, onApprove, onSuspend, onActivate, onArchive, onEdit
}) => {
  const navigate = useNavigate();

  const enterSchool = (tenant: Tenant) => {
    const slug = tenant.slug || tenant.id;
    useTenantStore.getState().setTenantContext(tenant);
    useAuthStore.getState().impersonateSchoolAdmin();
    navigate(`/t/${slug}/admin/dashboard`);
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3" />
    </div>
  );

  if (tenants.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
      <Building2 className="w-10 h-10 text-slate-600 mb-2" />
      <p className="text-sm font-bold text-white">Aucun établissement trouvé</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-4 md:p-5 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((org) => {
          const st = statusConfig[org.status] || statusConfig.PENDING;
          const StatusIcon = st.icon;
          return (
            <div key={org.id}
              className="bg-[#0B0F1F]/80 border border-white/[0.08] rounded-2xl p-5 hover:border-indigo-500/30 transition-all group flex flex-col gap-3.5 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => onEdit(org)}>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                    {org.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition-colors">{org.name}</p>
                    <p className="text-[10px] text-indigo-400/70 font-mono truncate">ID: {org.id.substring(0, 8)}...</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${st.cls}`}>
                  <StatusIcon className="w-3 h-3" /> {st.label}
                </span>
              </div>
              {/* Info */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Contact</p>
                  <p className="text-slate-300 truncate">{org.email || 'N/A'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Ville</p>
                  <p className="text-slate-300 truncate">{org.city || 'Sénégal'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Élèves</p>
                  <p className="text-white font-bold">{org.usersCount?.toLocaleString() || '500+'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Inscrit le</p>
                  <p className="text-slate-300">{new Date(org.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                <button onClick={() => onEdit(org)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 transition-colors cursor-pointer">
                  <Sliders className="w-3 h-3" /> Personnaliser
                </button>
                <button onClick={() => enterSchool(org)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 transition-colors cursor-pointer">
                  <ExternalLink className="w-3 h-3" /> Entrer
                </button>
                {org.status === 'PENDING' && (
                  <button onClick={() => onApprove(org.id)} className="py-1.5 px-2.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg border border-emerald-500/25 cursor-pointer">Approuver</button>
                )}
                {org.status === 'ACTIVE' && (
                  <button onClick={() => onSuspend(org.id)} className="py-1.5 px-2.5 text-[11px] font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 rounded-lg border border-rose-500/25 cursor-pointer">Suspendre</button>
                )}
                {(org.status === 'SUSPENDED' || org.status === 'REJECTED') && (
                  <button onClick={() => onActivate(org.id)} className="py-1.5 px-2.5 text-[11px] font-bold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 rounded-lg border border-indigo-500/25 cursor-pointer">Réactiver</button>
                )}
                <button onClick={() => onArchive(org.id, org.name)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer" title="Archiver">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

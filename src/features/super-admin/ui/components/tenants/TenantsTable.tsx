import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, AlertTriangle, Archive, Sliders, ExternalLink } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import type { Tenant } from '../../../domain/models/PlatformModels';

interface TenantsTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onArchive: (id: string, name: string) => void;
  onEdit: (tenant: Tenant) => void;
}

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants, isLoading, onApprove, onSuspend, onActivate, onArchive, onEdit
}) => {
  const navigate = useNavigate();
  const enterSchool = (org: Tenant) => {
    const slug = org.slug || org.id;
    useTenantStore.getState().setTenantContext(org);
    useAuthStore.getState().impersonateSchoolAdmin();
    navigate(`/t/${slug}/admin/dashboard`);
  };
  return (
    <div className="flex-1 overflow-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-white/[0.02] sticky top-0 z-10 border-b border-white/[0.06] backdrop-blur-md">
          <tr>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Établissement</th>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Contact</th>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Localisation</th>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Élèves</th>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Statut</th>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Inscription</th>
            <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3" />
                <p className="text-slate-400 text-xs">Chargement depuis PostgreSQL...</p>
              </td>
            </tr>
          ) : tenants.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-bold text-white">Aucun établissement trouvé</p>
              </td>
            </tr>
          ) : (
            tenants.map((org) => (
              <tr key={org.id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onEdit(org)}>
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black text-xs mr-3 shadow-md group-hover:scale-105 transition-transform">
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs tracking-tight group-hover:text-indigo-300 transition-colors">{org.name}</div>
                      <div className="text-[10px] text-indigo-400 font-mono mt-0.5">/t/{org.slug || 'slug'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">{org.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">{org.city || 'Sénégal'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.04] text-slate-300 border border-white/10">
                    {org.usersCount ? org.usersCount.toLocaleString() : '500+'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    org.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 
                    org.status === 'PENDING' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 
                    org.status === 'REJECTED' ? 'bg-slate-500/15 text-slate-400 border-slate-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}>
                    {org.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : org.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {org.status === 'ACTIVE' ? 'Actif' : org.status === 'PENDING' ? 'En attente' : org.status === 'REJECTED' ? 'Rejeté' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                  {new Date(org.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => onEdit(org)} className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors cursor-pointer" title="Personnaliser l'école">
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => enterSchool(org)} className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-lg transition-colors cursor-pointer" title="Entrer dans l'école">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {org.status === 'PENDING' && (
                      <button onClick={() => onApprove(org.id)} className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 cursor-pointer">Approuver</button>
                    )}
                    {org.status === 'ACTIVE' && (
                      <button onClick={() => onSuspend(org.id)} className="text-[11px] font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-500/30 cursor-pointer">Suspendre</button>
                    )}
                    {(org.status === 'SUSPENDED' || org.status === 'REJECTED') && (
                      <button onClick={() => onActivate(org.id)} className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 px-2.5 py-1 rounded-lg border border-indigo-500/30 cursor-pointer">Réactiver</button>
                    )}
                    <button onClick={() => onArchive(org.id, org.name)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer ml-0.5" title="Archiver">
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

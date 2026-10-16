import React, { useState, useEffect } from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { AddTenantModal } from '../components/AddTenantModal';
import { usePlatformStore } from '../../store/usePlatformStore';
import { TenantsTable } from '../components/tenants/TenantsTable';
import { TenantsCardGrid } from '../components/tenants/TenantsCardGrid';
import { ArchiveTenantModal } from '../components/tenants/ArchiveTenantModal';
import { EditTenantModal } from '../components/tenants/EditTenantModal';
import type { Tenant } from '../../domain/models/PlatformModels';

export const SuperAdminTenantsPage = () => {
  const { tenants, isLoadingTenants, fetchTenants, approveTenant, suspendTenant, activateTenant, deleteTenant } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState<{ id: string; name: string } | null>(null);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  useEffect(() => {
    fetchTenants().catch(err => console.warn('Erreur chargement:', err.message));
  }, [fetchTenants]);

  const handleApprove = async (id: string) => {
    try { await approveTenant(id); toast.success('École approuvée avec succès.'); } 
    catch { toast.error("Erreur lors de l'approbation."); }
  };
  const handleSuspend = async (id: string) => {
    try { await suspendTenant(id); toast.success('École suspendue.'); } 
    catch { toast.error('Erreur lors de la suspension.'); }
  };
  const handleActivate = async (id: string) => {
    try { await activateTenant(id); toast.success('École réactivée.'); } 
    catch { toast.error('Erreur lors de la réactivation.'); }
  };
  const confirmArchive = async () => {
    if (!archiveConfirm) return;
    try { await deleteTenant(archiveConfirm.id); toast.success('École archivée.'); } 
    catch { toast.error("Erreur lors de l'archivage."); } 
    finally { setArchiveConfirm(null); }
  };

  const filteredOrgs = tenants.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          org.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sharedProps = {
    tenants: filteredOrgs, isLoading: isLoadingTenants,
    onApprove: handleApprove, onSuspend: handleSuspend, onActivate: handleActivate,
    onArchive: (id: string, name: string) => setArchiveConfirm({ id, name }),
    onEdit: (tenant: Tenant) => setTenantToEdit(tenant),
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Répertoire des Établissements</h1>
          <p className="text-xs text-slate-400 mt-1">Gérez l'ensemble des campus clients, personnalisez leurs identités et accédez à leurs portails.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Ajouter un Établissement
        </button>
      </div>

      <div className="bg-[#0E1326]/75 backdrop-blur-xl border border-white/[0.08] rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 md:p-5 border-b border-white/[0.07] flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text" placeholder="Rechercher par nom, ville..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'].map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === status ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}>
                  {status === 'ALL' ? 'Tous' : status === 'ACTIVE' ? 'Actifs' : status === 'PENDING' ? 'En attente' : status === 'SUSPENDED' ? 'Suspendus' : 'Rejetés'}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/10 p-0.5">
              <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`} title="Vue Cartes">
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`} title="Vue Tableau">
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'cards' ? <TenantsCardGrid {...sharedProps} /> : <TenantsTable {...sharedProps} />}

        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-slate-400">
          <span>Affichage de <span className="font-bold text-white">{filteredOrgs.length}</span> campus</span>
          <span className="text-[10px] text-slate-500">PostgreSQL Cloud Multi-Tenant</span>
        </div>
      </div>

      <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {tenantToEdit && <EditTenantModal tenant={tenantToEdit} onClose={() => setTenantToEdit(null)} onUpdated={fetchTenants} />}
      {archiveConfirm && <ArchiveTenantModal tenant={archiveConfirm} onClose={() => setArchiveConfirm(null)} onConfirm={confirmArchive} />}
    </div>
  );
};


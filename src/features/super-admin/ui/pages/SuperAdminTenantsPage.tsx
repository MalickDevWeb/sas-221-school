import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Building2, 
  CheckCircle2, 
  XCircle, Archive, 
  Clock, 
  Plus,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

import { AddTenantModal } from '../components/AddTenantModal';

// Types alignés sur le Tenant du backend (BE-003)

import { usePlatformStore } from '../../store/usePlatformStore';

export const SuperAdminTenantsPage = () => {
  const { tenants, isLoadingTenants, fetchTenants, approveTenant, suspendTenant, activateTenant, deleteTenant } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTenants().catch(err => console.warn('Erreur au chargement des écoles:', err.message));
  }, [fetchTenants]);

  const handleApprove = async (id: string) => {
    try {
      await approveTenant(id);
      toast.success('École approuvée avec succès.');
    } catch {
      toast.error('Erreur lors de l\'approbation.');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await suspendTenant(id);
      toast.success('École suspendue.');
    } catch {
      toast.error('Erreur lors de la suspension.');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateTenant(id);
      toast.success('École réactivée avec succès.');
    } catch {
      toast.error('Erreur lors de la réactivation.');
    }
  };

  const [archiveConfirm, setArchiveConfirm] = useState<{id: string, name: string} | null>(null);

  const handleArchive = async (id: string, name: string) => {
    setArchiveConfirm({ id, name });
  };

  const confirmArchive = async () => {
    if (!archiveConfirm) return;
    try {
      // Pour l'instant on appelle deleteTenant en attendant le vrai endpoint d'archivage
      await deleteTenant(archiveConfirm.id);
      toast.success('École archivée.');
    } catch {
      toast.error('Erreur lors de l\'archivage.');
    } finally {
      setArchiveConfirm(null);
    }
  };

  const filteredOrgs = tenants.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          org.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Écoles</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez toutes les écoles enregistrées sur la plateforme</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une École
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une école ou une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6BF9]/50 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED', 'ARCHIVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    statusFilter === status 
                      ? 'bg-slate-100 text-slate-800 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-slate-50'
                  }`}
                >
                  {status === 'ALL' ? 'Tous' : status === 'ACTIVE' ? 'Actifs' : status === 'PENDING' ? 'En attente' : status === 'SUSPENDED' ? 'Suspendus' : status === 'REJECTED' ? 'Rejetés' : 'Archivés'}
                </button>
              ))}
            </div>
            <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:text-gray-700 shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center cursor-pointer hover:text-gray-700">
                  Nom de l'École <ArrowUpDown className="ml-1 w-3 h-3" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Utilisateurs</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingTenants ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Chargement des locataires...</p>
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-base font-semibold text-gray-900">Aucune école trouvée</p>
                    <p className="text-sm">Essayez de modifier vos filtres de recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-primary border border-primary/20 flex items-center justify-center font-bold mr-4 shadow-sm">
                          {org.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{org.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{org.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{org.email || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {org.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {org.usersCount ? org.usersCount.toLocaleString() : '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        org.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        org.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        org.status === 'REJECTED' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {org.status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        {org.status === 'PENDING' && <Clock className="w-3.5 h-3.5 mr-1" />}
                        {org.status === 'SUSPENDED' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                        {org.status === 'REJECTED' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                        {org.status === 'ACTIVE' ? 'Actif' : org.status === 'PENDING' ? 'En attente' : org.status === 'REJECTED' ? 'Rejeté' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        {org.status === 'PENDING' && (
                          <button onClick={() => handleApprove(org.id)} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors">
                            Approuver
                          </button>
                        )}
                        {org.status === 'ACTIVE' && (
                          <button onClick={() => handleSuspend(org.id)} className="text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors">
                            Suspendre
                          </button>
                        )}
                        {(org.status === 'SUSPENDED' || org.status === 'REJECTED') && (
                          <button onClick={() => handleActivate(org.id)} className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
                            Réactiver
                          </button>
                        )}
                        <button onClick={() => handleArchive(org.id, org.name)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-1" title="Archiver">
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Affichage de <span className="font-medium text-gray-900">{filteredOrgs.length}</span> écoles
          </span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-white bg-transparent disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-white bg-transparent disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>

      <AddTenantModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Modal d'archivage */}
      {archiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-6 text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <Archive className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Archiver l'école ?
              </h3>
              <p className="text-slate-500 text-sm">
                Êtes-vous sûr de vouloir archiver l'école <span className="font-semibold text-slate-700">"{archiveConfirm.name}"</span> ? Cette action bloquera l'accès à l'école, et ses données seront préparées pour le stockage à froid.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50/50">
              <button
                onClick={() => setArchiveConfirm(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmArchive}
                className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm shadow-amber-200 transition-colors"
              >
                Archiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


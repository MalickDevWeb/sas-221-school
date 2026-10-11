import React, { useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { usePlatformStore } from '@/features/super-admin/store/usePlatformStore';

export const SuperAdminDashboardPage = () => {
  const { tenants, isLoadingTenants, fetchTenants } = usePlatformStore();

  useEffect(() => {
    fetchTenants().catch(err => {
      console.warn("Impossible de récupérer les données :", err.message);
    });
  }, [fetchTenants]);

  // Derived stats
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  // Sort descending by creation date, take top 5
  const recentTenants = [...tenants].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-8">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
            Vue d'ensemble de la Plateforme <span className="ml-2">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Bon retour, Super Admin. Voici ce qui se passe aujourd'hui.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total des Écoles</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalTenants}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              Dont {activeTenants} actives
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Utilisateurs Actifs</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
            <p className="text-xs text-gray-400 font-medium mt-1 flex items-center">
              (À venir)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Revenus</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">-- €</p>
            <p className="text-xs text-gray-400 font-medium mt-1 flex items-center">
              (À venir)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Santé du Système</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">99.9%</p>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center">
              Toutes les API sont fonctionnelles
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Écoles Récemment Ajoutées</h2>
            <button className="text-sm text-primary font-semibold hover:text-primary/90">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nom de l'École</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date d'inscription</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingTenants ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chargement depuis la base de données...</td>
                  </tr>
                ) : recentTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune école inscrite.</td>
                  </tr>
                ) : (
                  recentTenants.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{org.name}</div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 py-0.5 rounded inline-block mt-1">{org.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{org.contactEmail || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          org.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 
                          org.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {org.status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                          {org.status === 'PENDING' && <Clock className="w-3.5 h-3.5 mr-1" />}
                          {org.status === 'SUSPENDED' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                          {org.status === 'ACTIVE' ? 'Actif' : org.status === 'PENDING' ? 'En attente' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart / Quick Actions Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-base font-bold text-gray-900 mb-6">Analytiques Rapides</h2>
          <div className="flex-1 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <div className="text-center p-6">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">Graphiques en construction</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

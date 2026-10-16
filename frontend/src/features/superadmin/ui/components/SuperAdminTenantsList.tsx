import React, { useState } from 'react';
import { MOCK_TENANTS } from '../../infrastructure/local/SuperAdminMockData';
import { TenantStatusBadge, TenantPlanBadge } from './TenantBadges';

export function SuperAdminTenantsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTenants = MOCK_TENANTS.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-bold text-gray-800 text-lg">Gestion des Écoles (Locataires)</h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span translate="no" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Rechercher une école..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>
          <button className="shrink-0 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-violet-700 transition-colors flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-sm">add</span>
            Nouvelle
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">École</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-center">Plan SaaS</th>
              <th className="px-6 py-4 text-center">Statut</th>
              <th className="px-6 py-4 text-right">Utilisateurs</th>
              <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{tenant.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Créée le {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{tenant.contactEmail}</td>
                  <td className="px-6 py-4 text-center"><TenantPlanBadge plan={tenant.plan} /></td>
                  <td className="px-6 py-4 text-center"><TenantStatusBadge status={tenant.status} /></td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-700">
                    {tenant.usersCount.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-violet-600 rounded-md hover:bg-violet-50 transition-colors" title="Paramètres">
                      <span translate="no" className="material-symbols-outlined text-lg">settings</span>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors ml-1" title="Suspendre/Supprimer">
                      <span translate="no" className="material-symbols-outlined text-lg">block</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <span translate="no" className="material-symbols-outlined text-3xl mb-2 text-gray-300">search_off</span>
                  <p>Aucune école trouvée pour "{searchTerm}".</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


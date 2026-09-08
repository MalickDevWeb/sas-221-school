import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export const SuperAdminDashboardPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      const response = await apiClient.get('/api/v1/platform/organizations');
      setOrganizations(response.data);
    } catch (error) {
      toast.error('Erreur de chargement des écoles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'suspend' | 'activate') => {
    try {
      await apiClient.post(`/api/v1/platform/organizations/${id}/${action}`);
      toast.success(`Action ${action} effectuée avec succès`);
      fetchOrganizations();
    } catch (error) {
      toast.error(`Erreur lors de l'action ${action}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administration SaaS Globale</h1>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Total Écoles: {organizations.length}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement des données...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {organizations.map((org) => (
              <li key={org.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-blue-600 truncate">{org.name}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {org.id}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        org.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        org.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {org.status}
                      </span>
                      <span className="ml-2 text-xs">Créé le {new Date(org.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {org.status === 'PENDING' && (
                      <button onClick={() => handleAction(org.id, 'approve')} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                        Approuver
                      </button>
                    )}
                    {org.status === 'ACTIVE' && (
                      <button onClick={() => handleAction(org.id, 'suspend')} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                        Suspendre
                      </button>
                    )}
                    {org.status === 'SUSPENDED' && (
                      <button onClick={() => handleAction(org.id, 'activate')} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        Réactiver
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
            
            {organizations.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">Aucune école trouvée sur la plateforme.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};


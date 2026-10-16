import React from 'react';
import { useAuthStore } from '@/core/store/authStore';

interface SuperAdminHeaderProps {
  onLogout: () => void;
}

export function SuperAdminHeader({ onLogout }: SuperAdminHeaderProps) {
  const { utilisateur } = useAuthStore();

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span translate="no" className="material-symbols-outlined text-violet-700 text-3xl">admin_panel_settings</span>
        <h1 className="text-xl font-bold text-gray-800">Super Admin SaaS Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-500">Connecté en tant que:</span>
          <span className="font-bold ml-1 text-violet-700">{utilisateur?.prenom} {utilisateur?.nom}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <span translate="no" className="material-symbols-outlined text-sm">logout</span>
          Déconnexion
        </button>
      </div>
    </header>
  );
}


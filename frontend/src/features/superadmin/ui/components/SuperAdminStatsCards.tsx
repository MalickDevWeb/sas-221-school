import React from 'react';

export function SuperAdminStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
        <h2 className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Écoles Actives</h2>
        <div className="text-3xl font-black text-gray-800">12</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
        <h2 className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Utilisateurs Totaux</h2>
        <div className="text-3xl font-black text-gray-800">14,250</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
        <h2 className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Revenus MRR</h2>
        <div className="text-3xl font-black text-gray-800">2,400,000 FCFA</div>
      </div>
    </div>
  );
}


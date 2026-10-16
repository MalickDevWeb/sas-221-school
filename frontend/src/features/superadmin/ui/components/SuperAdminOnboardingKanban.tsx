import React, { useState } from 'react';

type KanbanStatus = 'NOUVEAU' | 'EN_TEST' | 'VALIDE';

interface KanbanItem {
  id: string;
  name: string;
  status: KanbanStatus;
}

export function SuperAdminOnboardingKanban() {
  const [items, setItems] = useState<KanbanItem[]>([
    { id: '1', name: 'Lycée Privé Les Geckos', status: 'NOUVEAU' },
    { id: '2', name: 'Institut Technique', status: 'EN_TEST' },
    { id: '3', name: 'Université de la Paix', status: 'VALIDE' },
  ]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('itemId', id);
  };

  const handleDrop = (e: React.DragEvent, status: KanbanStatus) => {
    const id = e.dataTransfer.getData('itemId');
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const columns: { status: KanbanStatus; title: string; color: string }[] = [
    { status: 'NOUVEAU', title: 'Nouvelles Demandes', color: 'bg-blue-50 border-blue-200' },
    { status: 'EN_TEST', title: 'En Période d\'Essai', color: 'bg-amber-50 border-amber-200' },
    { status: 'VALIDE', title: 'Déploiement Validé', color: 'bg-green-50 border-green-200' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
      <h2 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
        <span translate="no" className="material-symbols-outlined text-violet-600">view_kanban</span>
        Onboarding des Écoles (Glisser-Déposer)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`border-2 border-dashed rounded-xl p-4 min-h-[400px] flex flex-col gap-3 ${col.color}`}
          >
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">{col.title}</h3>
            {items.filter((item) => item.status === col.status).map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
              >
                <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                <div className="text-xs text-gray-400 mt-1">Glissez pour déplacer</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


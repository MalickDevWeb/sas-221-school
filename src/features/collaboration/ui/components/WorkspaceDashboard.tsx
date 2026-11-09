import React from 'react';
import { LayoutDashboard, Users, Sparkles, TrendingUp } from 'lucide-react';
import { Workgroup } from '../../domain/CollaborationModels';

interface Props {
  readonly group: Workgroup;
  readonly tasksCount: number;
  readonly completedTasksCount: number;
  readonly onAuditLog: (action: string) => void;
}

export function WorkspaceDashboard({ group, tasksCount, completedTasksCount, onAuditLog }: Props) {
  // Progression réelle uniquement (aucune tâche → « — », plus de 50 % par défaut)
  const progress: number | null = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-gray-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-red-light text-brand-red-deep rounded-xl"><LayoutDashboard className="w-4 h-4" /></div>
        <div>
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">Tableau de Bord de Groupe</h3>
          <p className="text-[10px] text-neutral-500 font-semibold">{group.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50">
          <span className="text-[10px] font-bold text-neutral-500 block">Progression Projet</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-black text-brand-red-deep">{progress != null ? `${progress}%` : '—'}</span>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-red-deep h-1.5 rounded-full transition-all" style={{ width: `${progress ?? 0}%` }} />
            </div>
          </div>
        </div>
        <div className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 block">Tâches Accomplies</span>
            <span className="text-base font-black text-gray-800 mt-1 block">{completedTasksCount} / {tasksCount}</span>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50">
          <span className="text-[10px] font-bold text-neutral-500 block">Chef de Groupe</span>
          <span className="text-xs font-black text-gray-800 mt-1 block">👑 {group.leaderName || '—'}</span>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-4 space-y-3">
        <span className="text-[10px] font-bold text-neutral-600 block uppercase tracking-wider">🤖 Assistant IA Académique</span>
        <div className="flex flex-wrap gap-1.5">
          {['Résumer le Chat', 'Générer CR Réunion', 'Détecter Inactifs', 'Suggérer Planning'].map((label) => (
            <button
              key={label}
              type="button"
              disabled
              aria-disabled="true"
              title="Fonctionnalité non disponible : aucune source de données"
              className="px-2.5 py-1.5 bg-neutral-300 text-white font-bold text-[9px] rounded-lg cursor-not-allowed flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-neutral-500 font-semibold">
          Fonctionnalité non disponible : aucune source de données. Aucun service d'IA n'est relié au serveur ; aucune analyse n'est affichée.
        </p>
      </div>
    </div>
  );
}
export default WorkspaceDashboard;

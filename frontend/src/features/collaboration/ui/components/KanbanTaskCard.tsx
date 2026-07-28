import React from 'react';
import { CollabTask } from '../../domain/CollaborationModels';
import { TaskStatus } from '../../hooks/useGroupTasksState';

interface Props {
  readonly task: CollabTask;
  readonly columns: readonly TaskStatus[];
  readonly onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  readonly onToggleCheck: (taskId: string, itemId: string) => void;
}

export function KanbanTaskCard({ task: t, columns, onUpdateStatus, onToggleCheck }: Props) {
  return (
    <div className="p-2 bg-white rounded-lg border border-neutral-200 shadow-3xs text-[10px] space-y-1">
      <span className="font-bold text-gray-800 leading-tight block">{t.title}</span>
      <span className="text-[8px] bg-neutral-100 text-neutral-600 px-1 py-0.5 rounded font-bold block w-fit">👤 {t.assignedTo}</span>

      <div className="pt-1 border-t border-neutral-100 mt-1 space-y-1">
        {t.checklist?.map((item) => (
          <div key={item.id} onClick={() => onToggleCheck(t.id, item.id)} className="flex items-center gap-1 cursor-pointer hover:opacity-80">
            <input type="checkbox" checked={item.done} readOnly className="h-2.5 w-2.5 rounded text-brand-red-deep focus:ring-0" />
            <span className={`text-[8px] truncate ${item.done ? 'line-through text-neutral-400' : 'text-neutral-600 font-bold'}`}>{item.text}</span>
          </div>
        ))}
      </div>

      <select
        value={t.status}
        onChange={(e) => onUpdateStatus(t.id, e.target.value as TaskStatus)}
        className="w-full text-[8px] border border-neutral-200 rounded p-0.5 mt-1 bg-white font-bold"
      >
        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}

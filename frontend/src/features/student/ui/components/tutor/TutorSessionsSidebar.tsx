import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TutorSession } from '../../../hooks/useTutor';
import { TutorSessionItem } from './TutorSessionItem';

interface TutorSessionsSidebarProps {
  sessions: TutorSession[];
  currentSessionId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export function TutorSessionsSidebar({
  sessions, currentSessionId, onSelect, onCreate, onDelete, onRename
}: TutorSessionsSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (s: TutorSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F7]/90 border-r border-neutral-gray-200/60 p-4" id="tutor-sessions-sidebar">
      <button
        onClick={onCreate}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3f1e1e] hover:bg-[#522727] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer mb-4 shrink-0"
      >
        <Plus className="h-4 w-4" />
        Nouvelle discussion
      </button>

      <div className="flex-grow overflow-y-auto space-y-2 no-scrollbar pr-1">
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2 block mb-2">
          Dossiers de discussion ({sessions.length})
        </span>

        {sessions.map((s) => {
          const isActive = s.id === currentSessionId;
          const isEditing = s.id === editingId;

          return (
            <TutorSessionItem
              key={s.id}
              session={s}
              isActive={isActive}
              isEditing={isEditing}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              onSelect={() => onSelect(s.id)}
              startRename={(e) => startRename(s, e)}
              saveRename={(e) => saveRename(s.id, e)}
              onRename={(newTitle) => onRename(s.id, newTitle)}
              setEditingId={setEditingId}
              onDelete={() => onDelete(s.id)}
              showDelete={sessions.length > 1}
            />
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { MessageSquare, Trash2, Edit2, Check } from 'lucide-react';
import { TutorSession } from '../../../hooks/useTutor';

interface TutorSessionItemProps {
  session: TutorSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (title: string) => void;
  onSelect: () => void;
  startRename: (e: React.MouseEvent) => void;
  saveRename: (e: React.MouseEvent) => void;
  onRename: (newTitle: string) => void;
  setEditingId: (id: string | null) => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function TutorSessionItem({
  session,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  startRename,
  saveRename,
  onRename,
  setEditingId,
  onDelete,
  showDelete
}: TutorSessionItemProps) {
  return (
    <div
      onClick={() => !isEditing && onSelect()}
      className={`group flex items-center justify-between gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-white border-[#3f1e1e]/30 shadow-3xs'
          : 'bg-transparent border-transparent hover:bg-neutral-100/70'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-grow">
        <MessageSquare className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-[#3f1e1e]' : 'text-neutral-400'}`} />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRename(editTitle.trim() || session.title);
                setEditingId(null);
              }
            }}
            className="w-full bg-neutral-100 border-none rounded px-2 py-0.5 text-xs font-bold text-[#291715] focus:outline-none"
            autoFocus
          />
        ) : (
          <span className={`text-xs font-bold truncate ${isActive ? 'text-[#3f1e1e]' : 'text-neutral-600'}`}>
            {session.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {isEditing ? (
          <button
            onClick={saveRename}
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        ) : (
          <>
            <button
              onClick={startRename}
              title="Renommer"
              className="p-1 text-neutral-400 hover:text-[#3f1e1e] hover:bg-neutral-100 rounded"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {showDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Supprimer"
                className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

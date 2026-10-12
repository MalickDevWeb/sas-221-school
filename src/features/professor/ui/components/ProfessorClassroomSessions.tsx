import React from 'react';

export function ProfessorClassroomSessions({ classSessions }: { classSessions: any[] }) {
  if (!classSessions.length) return null;

  return (
    <div className="border-t border-neutral-gray-200 pt-3">
      <span className="px-3 text-[10px] font-black uppercase text-[#64748B] tracking-wider block mb-2">Séances pour la classe</span>
      <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
        {classSessions.map((session) => (
          <div key={session.id} className="p-2.5 bg-white border border-neutral-200/60 rounded-xl flex flex-col justify-between shadow-3xs">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[8px] font-black text-brand-red-deep bg-primary-light px-1 rounded">{session.day}</span>
              <span className="text-[8px] font-black uppercase text-neutral-400">{session.type}</span>
            </div>
            <h4 className="text-[9.5px] font-black text-neutral-700 truncate">{session.courseTitle}</h4>
            <div className="flex items-center justify-between text-[8.5px] text-neutral-400 font-bold mt-1">
              <span>{session.time}</span>
              <span className="text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded text-[7.5px]">Confirmé</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

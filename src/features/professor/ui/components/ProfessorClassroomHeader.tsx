import React from 'react';

export function ProfessorClassroomHeader({ selectedCourse }: { selectedCourse: any }) {
  return (
    <div className="pt-5 shrink-0">
      <div 
        style={{ padding: '7px 1px 9px 11px', margin: '-13px 0 0 0' }}
        className="bg-gradient-to-br from-brand-red-deep to-[#8e1215] text-white rounded-2xl shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
          <span className="text-[8.5px] font-black uppercase tracking-wider text-white/95">Saisie active</span>
        </div>
        <h3 className="font-sans font-black text-xs leading-tight tracking-tight line-clamp-1">{selectedCourse.classe || 'L3-GL'}</h3>
        <p className="text-[10px] text-white/70 font-semibold truncate mt-0.5">{selectedCourse.titre}</p>
        <div className="mt-2 text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded inline-block">Salle: {selectedCourse.salle}</div>
      </div>
    </div>
  );
}

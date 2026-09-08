import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TabDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ProfessorClassroomMobileNavProps {
  selectedCourse: any;
  onSelectCourse: (id: string) => void;
  tabs: readonly TabDefinition[];
  subTab: string;
  setSubTab: (tabId: any) => void;
  tabStyles: Record<string, React.CSSProperties>;
}

export function ProfessorClassroomMobileNav({
  selectedCourse,
  onSelectCourse,
  tabs,
  subTab,
  setSubTab,
  tabStyles
}: ProfessorClassroomMobileNavProps) {
  return (
    <>
      <div 
        style={{
          paddingLeft: '9px',
          paddingRight: '5px',
          paddingTop: '1px',
          paddingBottom: '8px',
        }}
        className="md:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl border border-neutral-100 shadow-sm"
      >
        <button
          onClick={() => onSelectCourse('')}
          style={{
            height: '33px',
            width: '166.719px',
            paddingLeft: '6px',
            paddingRight: '14px',
            marginLeft: '0px',
            marginRight: '1px',
            zIndex: 1000,
            position: 'relative',
          }}
          className="relative flex items-center gap-2 text-xs font-black text-[#B3181C] hover:text-[#6B0E10] transition-all cursor-pointer bg-[#FFF5F5] px-4 py-2.5 rounded-xl border border-[#B3181C]/10 hover:border-[#B3181C]/30 hover:scale-102 active:scale-98"
        >
          <ArrowLeft className="h-4 w-4" /> Changer de classe
        </button>
        <div className="text-left flex items-center gap-3">
          <div>
            <h3 
              style={{ fontSize: '12px' }}
              className="font-black text-[#291715] flex items-center gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-brand-red-deep animate-pulse shrink-0" />
              {selectedCourse.titre} <span className="text-neutral-400 font-bold">({selectedCourse.salle})</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="md:hidden flex gap-1.5 overflow-x-auto no-scrollbar bg-neutral-100 p-1.5 rounded-2xl border border-neutral-150/50 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              style={tabStyles[tab.id]}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-black transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-brand-red-deep shadow-sm border border-neutral-200/40'
                  : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

import React, { useState } from 'react';
import { ArrowLeft, BookOpen, PenTool, Award, Users, Bell, GraduationCap } from 'lucide-react';
import { ProfessorClassroomCards } from './classroom/ProfessorClassroomCards';
import { ProfessorClassroomMobileNav } from './classroom/ProfessorClassroomMobileNav';
import { ProfessorClassroomContent } from './ProfessorClassroomContent';
import type { ClassroomProps } from './classroom/ClassroomProps';

const EMPTY_ATTENDANCE = {};

const CLASSROOM_TABS = [
  { id: 'modules', label: 'Chapitres', icon: BookOpen },
  { id: 'homework', label: 'Devoirs', icon: PenTool },
  { id: 'grades', label: 'Notes', icon: Award },
  { id: 'attendance', label: 'Appel', icon: Users },
  { id: 'announcements', label: 'Rappels', icon: Bell },
] as const;

export function ProfessorClassroomView(props: ClassroomProps) {
  const [localSubTab, setLocalSubTab] = useState<typeof CLASSROOM_TABS[number]['id']>('modules');
  const subTab = props.classroomSubTab ?? localSubTab;
  const setSubTab = props.setClassroomSubTab ?? setLocalSubTab;

  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    setSelectedModule(null);
  }, [props.selectedCourse?.id]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    setIsMobile(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const tabStyles: Record<string, React.CSSProperties> = {
    modules: {
      width: '88.1406px',
      height: '30px',
      paddingLeft: '3px',
    },
    homework: {
      width: '77.1641px',
      height: '27px',
      paddingLeft: '4px',
    },
    grades: {
      height: '25px',
      width: '66.2266px',
    },
    attendance: {
      width: '68.9453px',
      paddingLeft: '4px',
      height: '26px',
      marginLeft: '0px',
      marginBottom: '1px',
      marginTop: '1px',
    },
    announcements: {
      width: '75.4688px',
      height: '27px',
    },
  };

  if (!props.selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4 select-none">
          <div className="h-12 w-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary border border-primary/10 shrink-0">
            <GraduationCap className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#291715] tracking-tight">Veuillez entrer dans une Salle de Classe</h2>
            <p className="text-xs text-neutral-400 font-semibold mt-0.5">Sélectionnez l&apos;un de vos cours ci-dessous pour démarrer la session.</p>
          </div>
        </div>
        <ProfessorClassroomCards courses={props.courses} selectedCourseId="" onSelectCourse={props.onSelectCourse} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfessorClassroomMobileNav
        selectedCourse={props.selectedCourse}
        onSelectCourse={props.onSelectCourse}
        tabs={CLASSROOM_TABS}
        subTab={subTab}
        setSubTab={setSubTab}
        tabStyles={tabStyles}
      />

      <div className="animate-fade-in">
        <div style={isMobile ? { width: '343px', maxWidth: '100%' } : undefined}>
          <ProfessorClassroomContent 
            {...props} 
            subTab={subTab} 
            selectedModule={selectedModule} 
            setSelectedModule={setSelectedModule} 
          />
        </div>
      </div>
    </div>
  );
}

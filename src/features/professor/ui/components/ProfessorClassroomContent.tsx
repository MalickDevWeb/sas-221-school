import React from 'react';
import { ProfessorAttendanceSection } from './classroom/ProfessorAttendanceSection';
import { ProfessorClassroomHeader } from './classroom/ProfessorClassroomHeader';
import { ProfessorLessonReminderForms } from './classroom/ProfessorLessonReminderForms';
import { ProfessorModuleForm } from './classroom/ProfessorModuleForm';
import { ProfessorModuleList } from './classroom/ProfessorModuleList';
import { ProfessorPublishedLists } from './classroom/ProfessorPublishedLists';
import { ProfessorLiveMeetPanel } from './classroom/ProfessorLiveMeetPanel';
import { ProfessorHomeworkView } from './ProfessorHomeworkView';
import { ProfessorGradesView } from './ProfessorGradesView';
import { ModuleDetailModal } from './classroom/ModuleDetailModal';
import type { ClassroomProps } from './classroom/ClassroomProps';

const EMPTY_ATTENDANCE = {};

interface ProfessorClassroomContentProps extends ClassroomProps {
  subTab: string;
  selectedModule: any;
  setSelectedModule: (mod: any) => void;
}

export function ProfessorClassroomContent(props: ProfessorClassroomContentProps) {
  const { subTab, selectedModule, setSelectedModule, ...classroomProps } = props;

  if (subTab === 'modules') {
    if (selectedModule) {
      return (
        <ModuleDetailModal
          module={selectedModule}
          students={classroomProps.students}
          onClose={() => setSelectedModule(null)}
          onModulesUpdated={() => {}}
        />
      );
    }
    return (
      <div className="space-y-6">
        <ProfessorClassroomHeader {...classroomProps} />
        {classroomProps.selectedCourse && (
          <ProfessorLiveMeetPanel
            selectedCourse={classroomProps.selectedCourse}
            triggerToast={classroomProps.triggerToast || (() => {})}
            profName={classroomProps.profName || 'Enseignant'}
          />
        )}
        <ProfessorModuleForm {...classroomProps} />
        <ProfessorModuleList 
          modules={classroomProps.modules} 
          students={classroomProps.students} 
          onSelectModule={setSelectedModule}
        />
      </div>
    );
  }

  if (subTab === 'homework') return <ProfessorHomeworkView {...classroomProps} />;
  
  if (subTab === 'grades') return <ProfessorGradesView {...classroomProps} />;
  
  if (subTab === 'attendance') {
    return (
      <ProfessorAttendanceSection
        students={classroomProps.students}
        attendance={classroomProps.attendance ?? EMPTY_ATTENDANCE}
        onMarkAttendance={classroomProps.onMarkAttendance}
      />
    );
  }

  if (subTab === 'announcements') {
    return (
      <div className="space-y-6">
        <ProfessorLessonReminderForms {...classroomProps} />
        <ProfessorPublishedLists reminders={classroomProps.reminders} lessons={classroomProps.lessons} />
      </div>
    );
  }

  return null;
}

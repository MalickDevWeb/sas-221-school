import React from 'react';
import type { useProfessorDashboardPage } from '../../../hooks/useProfessorDashboardPage';
import { ProfessorDashboardView } from '../../components/ProfessorDashboardView';
import { ClassesVirtuellesAccueil } from '@/features/collaboration/ui/components/ClassesVirtuellesAccueil';

type ViewModel = ReturnType<typeof useProfessorDashboardPage>;

interface Props {
  readonly vm: ViewModel;
}

export function DashboardTab({ vm }: Props) {
  const notes = vm.grades.filter(g => g.finalGrade !== null);
  const classAvg = notes.length > 0
    ? Math.round((notes.reduce((sum, g) => sum + (g.finalGrade ?? 0), 0) / notes.length) * 10) / 10
    : null;   // aucune note saisie : « — »

  return (
    <>
    {/* Classes virtuelles de ses classes (publiées par l'administration ou par lui), comme chez l'élève */}
    <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-[1280px] mx-auto w-full">
      <ClassesVirtuellesAccueil id="classes-virtuelles-professeur" titre="Classes virtuelles de mes classes"
        description="Cours en visioconférence publiés pour les classes où vous enseignez." />
    </div>
    <ProfessorDashboardView
      profName={vm.profName}
      courses={vm.courses}
      homeworksCount={vm.homeworks.length}
      validatedGrades={vm.grades.filter((g) => g.status === 'Validé').length}
      classAvg={classAvg}
      schedule={vm.schedule}
      students={vm.students}
      onMarkAttendance={vm.handleMarkAttendance}
      onEnterCourse={vm.handleEnterCourse}
    />
    </>
  );
}

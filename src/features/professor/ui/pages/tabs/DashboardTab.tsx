import React from 'react';
import type { useProfessorDashboardPage } from '../../../hooks/useProfessorDashboardPage';
import { ProfessorDashboardView } from '../../components/ProfessorDashboardView';

type ViewModel = ReturnType<typeof useProfessorDashboardPage>;

interface Props {
  readonly vm: ViewModel;
}

export function DashboardTab({ vm }: Props) {
  const notes = vm.grades.filter(g => g.finalGrade !== null);
  const classAvg = notes.length > 0
    ? Math.round((notes.reduce((sum, g) => sum + (g.finalGrade ?? 0), 0) / notes.length) * 10) / 10
    : null;   // aucune note saisie : « — » (avant : « 0 / 20 », comme si la classe avait 0 de moyenne)

  return (
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
  );
}

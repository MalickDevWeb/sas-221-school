import { useState, useMemo } from 'react';
import type { StudentGrade } from '../../domain/ProfessorModels';

export function useProfessorGradesState(
  grades: readonly StudentGrade[],
  handleGradeEditStart: (studentId: string, currentCC: number, currentExam: number) => void
) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'retake'>('all');
  const [selectedStudentGrade, setSelectedStudentGrade] = useState<StudentGrade | null>(null);

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchSearch = (g.studentNom || "").toLowerCase().includes(search.toLowerCase()) ||
        (g.studentId || "").toLowerCase().includes(search.toLowerCase());
      const isPass = g.finalGrade >= 10;
      if (activeTab === 'valid') return matchSearch && isPass;
      if (activeTab === 'retake') return matchSearch && !isPass;
      return matchSearch;
    });
  }, [grades, search, activeTab]);

  const stats = useMemo(() => {
    const total = grades.length;
    const valid = grades.filter((g) => g.finalGrade >= 10).length;
    const retake = total - valid;
    return { total, valid, retake };
  }, [grades]);

  const handleOpenDetail = (g: StudentGrade) => {
    handleGradeEditStart(g.studentId, g.cc, g.examen);
    setSelectedStudentGrade(g);
  };

  const handleCloseDetail = () => setSelectedStudentGrade(null);

  const currentGradeForModal = selectedStudentGrade
    ? grades.find(g => g.studentId === selectedStudentGrade.studentId) || selectedStudentGrade
    : null;

  return {
    search, setSearch,
    activeTab, setActiveTab,
    filteredGrades, stats,
    currentGradeForModal,
    handleOpenDetail, handleCloseDetail
  };
}

import React, { useState } from 'react';
import { StudentSubSidebar } from './students/StudentSubSidebar';
import { StudentDataGridTab } from './students/StudentDataGridTab';
import { ExcelImportTab } from './students/ExcelImportTab';
import { StudentProfile360Tab } from './students/StudentProfile360Tab';
import { Student } from '../../domain/StudentModels';
import { useAdminStudents } from './students/useAdminStudents';
import { useRepliSousMenu } from '@/shared/components/SousMenuModule';

export function AdminStudentManager() {
  const [activeTab, setActiveTab] = useState('annuaire');
  const [isCollapsed, basculerRepli] = useRepliSousMenu('eleves');
  // Erreur de chargement affichée dans l'annuaire, avec « Réessayer »
  const { students, setStudents, loading, erreur, toggleQrStatus, refetch } = useAdminStudents({ erreurEnLigne: true });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);   // plus d'élève fictif sélectionné par défaut

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('profil360');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="student-manager-root">
      <div className="shrink-0 lg:sticky lg:top-4">
        <StudentSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={basculerRepli}
        />
      </div>
      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px]">
        {activeTab === 'annuaire' && (
          <StudentDataGridTab
            students={students}
            chargement={loading}
            erreur={erreur}
            onUpdateStudents={setStudents}
            onViewProfile={handleViewProfile}
            onToggleQrStatus={toggleQrStatus}
            onRefresh={refetch}
          />
        )}
        {activeTab === 'import' && (
          <ExcelImportTab
            students={students}
            onImported={refetch}
          />
        )}
        {activeTab === 'profil360' && !selectedStudent && (
          <p className="text-sm text-neutral-500 p-6 text-center">Sélectionnez un élève dans l'annuaire pour afficher son profil.</p>
        )}
        {activeTab === 'profil360' && selectedStudent && (
          <StudentProfile360Tab
            selectedStudent={selectedStudent}
            onUpdateStudent={(s) => {
              setSelectedStudent(s);
              setStudents(students.map((st) => (st.id === s.id ? s : st)));
            }}
          />
        )}
      </div>
    </div>
  );
}

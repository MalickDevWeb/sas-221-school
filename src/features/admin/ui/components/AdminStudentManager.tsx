import React, { useState } from 'react';
import { StudentSubSidebar } from './students/StudentSubSidebar';
import { StudentDataGridTab } from './students/StudentDataGridTab';
import { ExcelImportTab } from './students/ExcelImportTab';
import { StudentProfile360Tab } from './students/StudentProfile360Tab';
import { Student } from '../../domain/StudentModels';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';
import { useAdminStudents } from './students/useAdminStudents';

export function AdminStudentManager() {
  const [activeTab, setActiveTab] = useState('annuaire');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { students, setStudents, loading, updateFinancialStatus, toggleQrStatus, refetch } = useAdminStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);   // plus d'élève fictif sélectionné par défaut

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('profil360');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="student-manager-root">
      <TabletDrawerWrapper>
        <StudentSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </TabletDrawerWrapper>
      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px]">
        {activeTab === 'annuaire' && (
          <StudentDataGridTab
            students={students}
            onUpdateStudents={setStudents}
            onViewProfile={handleViewProfile}
            onToggleFinancialStatus={updateFinancialStatus}
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

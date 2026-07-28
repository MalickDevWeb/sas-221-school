import { useState } from 'react';

export function useExcelImport(onAddStudents: (newList: any[]) => void) {
  const [step, setStep] = useState<1 | 2>(1);
  const [previewList, setPreviewList] = useState<any[]>([]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return;
      
      const separator = lines[0].includes(';') ? ';' : lines[0].includes(',') ? ',' : '\t';
      const parsedHeaders = lines[0].split(separator).map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => line.split(separator).map(cell => cell.trim()));

      const list = rows.map((row, idx) => {
        const student: any = {
          id: `s-imported-${Date.now()}-${idx}`,
          financialStatus: 'En Règle',
          qrStatus: 'AUTORISÉ',
          gpa: '14.5/20',
          phoneParent: '+221 77 000 00 00'
        };
        parsedHeaders.forEach((h, i) => {
          if (h.includes('nom') || h.includes('name')) student.name = row[i];
          else if (h.includes('matr') || h.includes('id')) student.matricule = row[i];
          else if (h.includes('email')) student.email = row[i];
          else if (h.includes('class') || h.includes('promo')) student.classe = row[i];
        });
        if (!student.name) student.name = `Etudiant ${idx + 1}`;
        if (!student.matricule) student.matricule = `MAT-${Date.now()}-${idx}`;
        if (!student.email) student.email = `${student.name.toLowerCase().replace(/\\s+/g, '.')}@ecole221.sn`;
        if (!student.classe) student.classe = 'L1 Génie Civil';
        return student;
      });

      setPreviewList(list);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const executeImport = () => {
    onAddStudents(previewList);
    setStep(1);
    setPreviewList([]);
  };

  const downloadTemplate = () => {
    const csvContent = "Nom;Matricule;Email;Classe\nMamadou Diagne;2026-GC-005;mamadou.diagne@ecole221.sn;L1 Génie Civil\nAmina Fall;2026-TI-099;amina.fall@ecole221.sn;Master 1 Spécialité IA";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "modele_import_etudiants.csv";
    link.click();
  };

  return {
    step,
    setStep,
    previewList,
    handleFileUpload,
    executeImport,
    downloadTemplate
  };
}

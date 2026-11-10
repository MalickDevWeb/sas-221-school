import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { StudentGrade } from '../../../domain/ProfessorModels';

interface Props {
  readonly studentId: string;
  readonly studentNom: string;
  readonly courseId: string;
  readonly grade: StudentGrade;
  readonly editCC: number;
  readonly editExam: number;
  readonly setEditCC: (value: number) => void;
  readonly setEditExam: (value: number) => void;
  readonly onSave: (studentId: string) => Promise<void>;
  readonly onClose: () => void;
}

export function StudentDetailModal({
  studentId,
  studentNom,
  courseId,
  editCC,
  editExam,
  setEditCC,
  setEditExam,
  onSave,
  onClose,
}: Props) {
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  const [erreurNote, setErreurNote] = useState<string | null>(null);
  const handleSaveGrades = async () => {
    // contrôle AVANT envoi : champ vide ou hors 0–20 (avant : un champ effacé devenait 0/20 en silence)
    const invalide = (n: number) => Number.isNaN(n) || n < 0 || n > 20;
    if (invalide(editCC) || invalide(editExam)) {
      setErreurNote('Saisissez deux notes entre 0 et 20 (CC et Examen).');
      return;
    }
    setErreurNote(null);
    setIsSavingGrade(true);
    try {
      await onSave(studentId);
    } catch {
      // message réel déjà affiché par la saisie de note (raison donnée par le serveur)
    } finally {
      setIsSavingGrade(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs select-none" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col max-h-[90vh] animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-brand-red-deep to-[#291715] px-6 py-5 text-white flex justify-between items-center shrink-0">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Fiche de l'étudiant</span>
            <h3 className="text-lg font-black tracking-tight mt-0.5">{studentNom}</h3>
            <p className="text-xs text-white/70 font-semibold mt-0.5 font-mono">Matricule: {studentId.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full border-0 bg-transparent hover:bg-white/10 cursor-pointer transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100/80 space-y-4">
                <h4 className="text-xs font-black uppercase text-[#291715] tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-brand-red-deep">award</span> Notes d'Évaluation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400">CC</label>
                    <input type="number" min={0} max={20} step={0.5} value={Number.isNaN(editCC) ? '' : editCC} onChange={(e) => setEditCC(e.target.value === '' ? NaN : parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border border-neutral-200 focus:border-primary text-sm font-black rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400">Examen</label>
                    <input type="number" min={0} max={20} step={0.5} value={Number.isNaN(editExam) ? '' : editExam} onChange={(e) => setEditExam(e.target.value === '' ? NaN : parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border border-neutral-200 focus:border-primary text-sm font-black rounded-xl outline-none" />
                  </div>
                </div>
                {erreurNote && <p role="alert" className="erreur-champ">{erreurNote}</p>}
                <button onClick={handleSaveGrades} className="w-full py-2.5 bg-brand-red-deep text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 hover:bg-brand-red-deep/90 transition-all active:scale-98 cursor-pointer shadow-3xs">
                  {isSavingGrade ? 'Enregistrement...' : 'Enregistrer les notes'}
                </button>
              </div>
              {/* avant : « exercices » enregistrés seulement dans le navigateur (localStorage) — l'élève ne les
                  recevait jamais. Les travaux se donnent à toute la classe dans « Devoirs de classe ». */}
              <p className="text-[11px] text-neutral-500 font-semibold">
                Pour donner un travail, utilisez l'onglet « Devoirs de classe » : il est enregistré et visible des élèves.
              </p>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import type { AdminStudent } from '../../domain/AdminModels';
import { ObservationsEleve } from './students/profile360/ObservationsEleve';

export function AdminStudentTracker({ students }: { students: AdminStudent[]; onUpdate: () => void }) {
  const [selectedId, setSelectedId] = useState('');

  const student = students.find(s => s.id === selectedId);

  return (
    <div className="bg-white p-3.5 border border-[#E2DCDA] rounded-xl text-xs space-y-3" id="admin-student-tracker">
      <div className="flex justify-between items-center pb-1.5 border-b border-[#E2DCDA]/60">
        <h5 className="font-extrabold text-primary uppercase tracking-wider text-[10.5px]">Suivi Individuel des Élèves</h5>
        <span className="text-[9px] text-[#8E7977] font-bold">Dossier académique et observations</span>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase text-[#8E7977]">Sélectionner un étudiant :</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full h-9 bg-[#FAF8F6] border border-[#E2DCDA] rounded-lg px-2.5 outline-none font-semibold">
          <option value="">-- Choisir un étudiant --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.matricule})</option>)}
        </select>
      </div>

      {student ? (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 bg-[#FAF8F6] p-2.5 rounded-xl border border-[#E2DCDA]/60">
            <div>
              <p className="text-[9px] text-[#8E7977] font-bold uppercase">Moyenne Générale</p>
              <p className="text-sm font-black text-primary">{student.average != null ? `${student.average}/20` : '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#8E7977] font-bold uppercase">Statut</p>
              <p className="font-bold text-[#291715]">{student.status ?? '—'}</p>
            </div>
          </div>
          <ObservationsEleve eleveId={student.id} nomEleve={student.name} />
        </div>
      ) : (
        <div className="py-6 text-center text-[#8E7977] italic bg-[#FAF8F6] rounded-xl border border-[#E2DCDA]/40">Veuillez sélectionner un étudiant pour consulter et enrichir sa fiche de suivi individuel.</div>
      )}
    </div>
  );
}

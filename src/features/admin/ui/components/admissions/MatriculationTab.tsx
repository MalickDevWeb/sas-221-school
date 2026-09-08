import React, { useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { MatriculationTable } from './MatriculationTable';

interface Props {
  candidates: ExtendedCandidate[];
  onEnroll: (candidate: ExtendedCandidate, matricule: string) => void;
  onTogglePayment: (id: string) => void;
}

type CreatedStudent = { name: string; matricule: string; credits: number; level: string };

function getLevel(type: string): string {
  if (['BAC'].includes(type)) return 'Licence 1';
  if (['L2', 'TRANSFER'].includes(type)) return 'Licence 2';
  if (type === 'L3') return 'Licence 3';
  if (type === 'M1') return 'Master 1';
  if (type === 'M2') return 'Master 2';
  return 'Doctorat';
}

export function MatriculationTab({ candidates, onEnroll, onTogglePayment }: Props) {
  const admitted = candidates.filter((c) => c.step === 'admitted');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [createdStudent, setCreatedStudent] = useState<CreatedStudent | null>(null);

  const handleEnrollClick = (c: ExtendedCandidate) => {
    setEnrollingId(c.id);
    const matricule = `MAT-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const credits = c.equivalence?.validatedCredits || 0;
    const level = getLevel(c.type);
    setTimeout(() => {
      onEnroll(c, matricule);
      setEnrollingId(null);
      setCreatedStudent({ name: c.name, matricule, credits, level });
    }, 1200);
  };

  return (
    <div className="space-y-4" id="matriculation-tab-root">
      <div className="pb-2 border-b border-neutral-100 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Inscriptions Définitives & Transformation en Étudiant</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Générez le matricule universitaire et créez le profil d'accès sans aucune ressaisie pour les dossiers admis en règle.</p>
        </div>
      </div>

      {createdStudent && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-bold text-emerald-800 space-y-2 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="uppercase text-[10px] font-black tracking-wider flex items-center gap-1">
              <span translate="no" className="material-symbols-outlined text-sm">verified_user</span>
              Étudiant Activé Avec Succès !
            </span>
            <button onClick={() => setCreatedStudent(null)} className="text-emerald-600 hover:text-emerald-900">Masquer</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/70 p-3 rounded-lg border border-emerald-100 text-[11px]">
            <div>Nom complet : <span className="text-[#1E293B] block font-black">{createdStudent.name}</span></div>
            <div>Matricule Unique : <span className="text-emerald-700 block font-black font-mono">{createdStudent.matricule}</span></div>
            <div>Niveau Affecté : <span className="text-[#1E293B] block font-black">{createdStudent.level}</span></div>
            <div>Crédits Reconnus : <span className="text-[#1E293B] block font-black">{createdStudent.credits} ECTS</span></div>
          </div>
        </div>
      )}

      <MatriculationTable admitted={admitted} enrollingId={enrollingId} onEnrollClick={handleEnrollClick} onTogglePayment={onTogglePayment} />
    </div>
  );
}

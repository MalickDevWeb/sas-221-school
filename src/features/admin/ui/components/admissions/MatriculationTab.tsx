import React, { useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { MatriculationTable } from './MatriculationTable';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  candidates: ExtendedCandidate[];
  onEnroll: (candidate: ExtendedCandidate, matricule: string) => void;
  onError: (message: string) => void;
  onTogglePayment: (id: string) => void;
}

type CreatedStudent = { name: string; matricule: string; credits: number | null; level: string };

function getLevel(type: string): string {
  if (['BAC'].includes(type)) return 'Licence 1';
  if (['L2', 'TRANSFER'].includes(type)) return 'Licence 2';
  if (type === 'L3') return 'Licence 3';
  if (type === 'M1') return 'Master 1';
  if (type === 'M2') return 'Master 2';
  return 'Doctorat';
}

/** Cherche le matricule attribué par le serveur à ce candidat dans la réponse (aucune invention). */
function matriculeRenvoye(data: any, candidateId: string): string | null {
  const m = data?.matricules;
  if (Array.isArray(m)) {
    const trouve = m.find((x: any) => x && String(x.candidateId ?? x.id) === candidateId);
    return trouve?.matricule ? String(trouve.matricule) : null;
  }
  if (m && typeof m === 'object' && m[candidateId]) return String(m[candidateId]);
  return null;
}

export function MatriculationTab({ candidates, onEnroll, onError, onTogglePayment }: Props) {
  const admitted = candidates.filter((c) => c.step === 'admitted');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [createdStudent, setCreatedStudent] = useState<CreatedStudent | null>(null);

  const handleEnrollClick = async (c: ExtendedCandidate) => {
    setEnrollingId(c.id);
    try {
      const { data } = await apiClient.post('/admissions/automation/matricules');
      const matricule = matriculeRenvoye(data, c.id);
      if (!matricule) {
        onError("Le serveur n'a attribué aucun matricule à ce dossier : l'inscription définitive n'a pas été effectuée.");
        return;
      }
      const credits = typeof c.equivalence?.validatedCredits === 'number' ? c.equivalence.validatedCredits : null;
      onEnroll(c, matricule);
      setCreatedStudent({ name: c.name, matricule, credits, level: getLevel(c.type) });
    } catch (err) {
      onError(resolveErrorMessage(err));
    } finally {
      setEnrollingId(null);
    }
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
              Matricule attribué par le serveur
            </span>
            <button onClick={() => setCreatedStudent(null)} className="text-emerald-600 hover:text-emerald-900">Masquer</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/70 p-3 rounded-lg border border-emerald-100 text-[11px]">
            <div>Nom complet : <span className="text-[#1E293B] block font-black">{createdStudent.name}</span></div>
            <div>Matricule Unique : <span className="text-emerald-700 block font-black font-mono">{createdStudent.matricule}</span></div>
            <div>Niveau Affecté : <span className="text-[#1E293B] block font-black">{createdStudent.level}</span></div>
            <div>Crédits Reconnus : <span className="text-[#1E293B] block font-black">{createdStudent.credits != null ? `${createdStudent.credits} ECTS` : '—'}</span></div>
          </div>
        </div>
      )}

      <MatriculationTable admitted={admitted} enrollingId={enrollingId} onEnrollClick={(c) => { void handleEnrollClick(c); }} onTogglePayment={onTogglePayment} />
    </div>
  );
}

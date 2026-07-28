import React from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

export function CandidateDetailsSection({ candidate }: { candidate: ExtendedCandidate }) {
  const d = candidate.details;

  return (
    <div className="bg-neutral-50 p-3 rounded-xl space-y-1.5 border border-neutral-100">
      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Fiche de Candidature Spécifique</span>
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px]">
        <div>Filière Cible : <span className="text-[#1E293B] block font-extrabold">{candidate.course}</span></div>

        {d?.universityOfOrigin && (<>
          <div>Université d'Origine : <span className="text-[#1E293B] block">{d.universityOfOrigin}</span></div>
          <div>Faculté : <span className="text-[#1E293B] block">{d.facultyOfOrigin}</span></div>
          <div>Département : <span className="text-[#1E293B] block">{d.departmentOfOrigin}</span></div>
          <div>Crédits Validés : <span className="text-[#1E293B] block">{d.validatedCredits}</span></div>
          <div className="col-span-2">Motif Transfert : <span className="text-neutral-500 block italic">"{d.transferReason}"</span></div>
        </>)}

        {d?.oldFiliere && (<>
          <div>Ancienne Filière : <span className="text-[#1E293B] block">{d.oldFiliere}</span></div>
          <div>Nouvelle Filière : <span className="text-[#1E293B] block">{d.newFiliere}</span></div>
          <div className="col-span-2">Motif Réorientation : <span className="text-neutral-500 block italic">"{d.reorientationReason}"</span></div>
        </>)}

        {d?.passportNumber && (<>
          <div>N° Passeport : <span className="text-[#1E293B] block">{d.passportNumber}</span></div>
          <div>Visa État : <span className="text-[#1E293B] block">{d.visaStatus}</span></div>
        </>)}

        {d?.vaeExperienceYears !== undefined && (<>
          <div>Années d'Expérience : <span className="text-[#1E293B] block">{d.vaeExperienceYears} ans</span></div>
          <div>Diplôme Target : <span className="text-[#1E293B] block">{d.vaeTargetDegree}</span></div>
        </>)}

        {d?.exceptionalJustification && (<>
          <div>Autorisé par : <span className="text-[#1E293B] block">{d.exceptionalAuthority}</span></div>
          <div>Réf. Décision : <span className="text-[#1E293B] block">{d.officialDecisionRef}</span></div>
          <div className="col-span-2">Justification : <span className="text-neutral-500 block italic">"{d.exceptionalJustification}"</span></div>
        </>)}
      </div>
    </div>
  );
}

import React from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

interface Props {
  candidate: ExtendedCandidate;
}

/**
 * Situation scolaire d'un candidat.
 *
 * Seules les valeurs réellement reçues sont affichées, sinon « Non renseigné » ; un reste dû est une information pour
 * la comptabilité, jamais un motif de refus (décision APP-TL-22 : les frais ne pénalisent jamais l'élève).
 */
export function CandidateAlertsPanel({ candidate }: Props) {
  const isReinscription = candidate.type === 'REINSCRIPTION';
  const d = candidate.details;
  const unpaid = typeof d?.unpaidDues === 'number' ? d.unpaidDues : null;
  const sanctions = typeof d?.sanctionsCount === 'number' ? d.sanctionsCount : null;
  const passedPreviousYear = typeof d?.previousYearValidated === 'boolean' ? d.previousYearValidated : null;
  const nonRenseigne = <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-500">Non renseigné</span>;
  const aucuneDonnee = unpaid === null && sanctions === null && passedPreviousYear === null;

  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-[#FAF8F6] space-y-3 text-xs font-bold text-neutral-600" id="candidate-alerts-panel">
      <div className="border-b border-neutral-200 pb-1.5">
        <span className="font-extrabold text-[#1E293B] uppercase text-[10px] tracking-wide">Situation scolaire</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Année précédente validée (N-1)</span>
          {passedPreviousYear === null ? nonRenseigne : (
            <span className={`px-2 py-0.5 rounded text-[10px] ${passedPreviousYear ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              {passedPreviousYear ? 'Oui' : 'Non (ajourné)'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Reste dû (information comptable)</span>
          {unpaid === null ? nonRenseigne : (
            <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700">
              {unpaid === 0 ? 'Soldé' : `${unpaid.toLocaleString('fr-FR')} FCFA`}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Sanctions disciplinaires</span>
          {sanctions === null ? nonRenseigne : (
            <span className={`px-2 py-0.5 rounded text-[10px] ${sanctions === 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              {sanctions === 0 ? 'Aucune' : `${sanctions} active(s)`}
            </span>
          )}
        </div>

        {isReinscription && (
          <p className="pt-2 border-t border-neutral-200 text-[10px] font-semibold text-neutral-600">
            {aucuneDonnee
              ? 'Ces informations ne sont pas encore reliées au dossier de réinscription : vérifiez-les dans le dossier de l’élève.'
              : 'Un reste dû se règle avec la comptabilité : il n’empêche jamais la réinscription.'}
          </p>
        )}
      </div>
    </div>
  );
}

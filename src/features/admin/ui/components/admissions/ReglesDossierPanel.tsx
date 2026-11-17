import React, { useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { VisionneuseFichier } from '@/shared/components/VisionneuseFichier';
import { usePeutTelecharger } from '@/shared/hooks/usePeutTelecharger';
import { cheminPiece } from './piecesCandidat';

/**
 * Règles d'admission appliquées au dépôt de ce dossier (16/11) : avertissements pour l'administration et pièces exigées
 * en plus par une règle (ouvertes par le serveur, PDF compris). Rien n'est affiché si aucune règle ne s'est appliquée.
 */
export function ReglesDossierPanel({ candidate }: { candidate: ExtendedCandidate }) {
  const telechargeable = usePeutTelecharger('admissions');
  const [visionnee, setVisionnee] = useState<{ code: string; libelle: string } | null>(null);
  const alertes = candidate.details?.alertesRegles ?? [];
  const pieces = candidate.details?.piecesSupplementaires ?? [];
  if (alertes.length === 0 && pieces.length === 0) return null;

  return (
    <section id="regles-dossier" aria-labelledby="regles-dossier-titre" className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs space-y-3">
      <h4 id="regles-dossier-titre" className="text-xs font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2 m-0">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-lg">rule</span>
        Règles d'admission appliquées
      </h4>
      {alertes.length > 0 && (
        <ul className="space-y-1.5" aria-label="Avertissements des règles">
          {alertes.map((a) => (
            <li key={a} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex gap-2">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}
      {pieces.length > 0 && (
        <ul className="bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 text-xs space-y-1" aria-label="Pièces exigées par les règles">
          {pieces.map((p) => (
            <li key={p.code} className="flex items-center justify-between gap-2">
              <span className="text-neutral-600 font-bold">{p.libelle}</span>
              <button type="button" onClick={() => setVisionnee(p)} className="font-black text-primary hover:underline cursor-pointer bg-transparent border-0 p-0">Voir</button>
            </li>
          ))}
        </ul>
      )}
      {visionnee && (
        <VisionneuseFichier titre={`${visionnee.libelle} — ${candidate.name}`} chemin={cheminPiece(candidate.id, visionnee.code)}
          telechargeable={telechargeable} nomFichier={visionnee.code} onFermer={() => setVisionnee(null)} />
      )}
    </section>
  );
}

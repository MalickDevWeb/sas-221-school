import React from 'react';
import { LIBELLE_FRAIS, LIBELLE_STATUT, type DossierCandidat } from './suiviApi';

const ETAPES: Record<string, string> = {
  new: 'Dossier reçu', docs: 'Vérification des pièces', interview: 'Entretien', admitted: 'Admission', rejected: 'Décision rendue',
};

/** Statut réel du dossier (POST /candidatures/suivi) : aucune étape présumée validée. */
export function CandidateStatusTab({ dossier }: { dossier: DossierCandidat }) {
  const decide = dossier.statut === 'ACCEPTE' || dossier.statut === 'REFUSE';
  const couleur = dossier.statut === 'ACCEPTE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : dossier.statut === 'REFUSE' ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-blue-50 text-blue-800 border-blue-200';
  const lignes: { label: string; valeur: string; ok: boolean }[] = [
    { label: 'Pièce d\'identité', valeur: dossier.pieceIdentiteDeclaree ? 'Jointe au dépôt' : 'Non jointe', ok: dossier.pieceIdentiteDeclaree },
    { label: 'Dernier diplôme', valeur: dossier.diplomeDeclare ? 'Joint au dépôt' : 'Non joint', ok: dossier.diplomeDeclare },
    { label: 'Frais de dossier', valeur: LIBELLE_FRAIS[dossier.frais], ok: dossier.frais !== 'NON_DECLARES' },
  ];

  return (
    <div className="space-y-4 text-xs font-bold text-neutral-600" id="candidate-status-tab-content">
      <div className={`p-4 border rounded-2xl ${couleur}`} id="candidate-statut">
        <h4 className="font-extrabold text-sm leading-tight uppercase">{LIBELLE_STATUT[dossier.statut]}</h4>
        <p className="text-[11px] mt-1 font-semibold opacity-90">
          Dossier <strong className="font-mono">{dossier.id}</strong> · {dossier.formation ?? '—'}
          {dossier.dateDepot && <> · déposé le {new Date(dossier.dateDepot).toLocaleDateString('fr-FR')}</>}
        </p>
        {!decide && dossier.etape && ETAPES[dossier.etape] && (
          <p className="text-[11px] mt-1 font-semibold">Étape actuelle : {ETAPES[dossier.etape]}</p>
        )}
        {dossier.statut === 'REFUSE' && dossier.motifRefus && (
          <p className="text-[11px] mt-2 font-semibold">Motif communiqué par l'école : {dossier.motifRefus}</p>
        )}
        {dossier.statut === 'ACCEPTE' && (
          <p className="text-[11px] mt-2 font-semibold">L'école vous contactera pour finaliser votre inscription.</p>
        )}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-2">
        <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Votre dossier</span>
        {lignes.map((l) => (
          <div key={l.label} className="flex justify-between items-center border-b border-neutral-100 last:border-0 py-1.5">
            <span className="text-neutral-500 font-semibold">{l.label}</span>
            <span className={l.ok ? 'text-emerald-700' : 'text-neutral-400'}>{l.valeur}</span>
          </div>
        ))}
        <p className="text-[10px] text-neutral-400 font-semibold pt-1">
          Pour ajouter une pièce, régler les frais ou poser une question, contactez directement l'école.
        </p>
      </div>
    </div>
  );
}

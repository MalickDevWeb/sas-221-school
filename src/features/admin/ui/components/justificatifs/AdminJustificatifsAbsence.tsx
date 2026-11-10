import React, { useState } from 'react';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import {
  useDeciderJustificatif,
  useJustificatifsAdmin,
  type JustificatifAbsence,
  type StatutJustificatif,
} from '../../../infrastructure/api/justificatifsAdminApi';

const LONGUEUR_MAX = 500;

const ONGLETS: { id: StatutJustificatif | 'TOUS'; texte: string }[] = [
  { id: 'EN_ATTENTE', texte: 'À traiter' },
  { id: 'ACCEPTE', texte: 'Acceptés' },
  { id: 'REFUSE', texte: 'Refusés' },
  { id: 'TOUS', texte: 'Tous' },
];

const BADGES: Record<StatutJustificatif, { texte: string; classe: string }> = {
  EN_ATTENTE: { texte: 'En attente', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
  ACCEPTE: { texte: 'Accepté', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUSE: { texte: 'Refusé', classe: 'bg-red-50 text-red-700 border-red-200' },
};

function dateFr(iso: string | null, avecHeure = false): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return avecHeure
    ? d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

function Carte({ j }: { j: JustificatifAbsence }) {
  const decider = useDeciderJustificatif();
  const [refus, setRefus] = useState(false);
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const badge = BADGES[j.statut];

  const envoyer = (accepter: boolean) => {
    if (!accepter) {
      const m = motif.trim();
      if (!m) return setErreur('Indiquez le motif du refus : il sera communiqué au parent.');
      if (m.length > LONGUEUR_MAX) return setErreur(`Motif trop long (${LONGUEUR_MAX} caractères au plus).`);
    }
    setErreur(null);
    decider.mutate({ id: j.id, accepter, motif: motif.trim() }, {
      onSuccess: () => toast.success(accepter ? 'Justificatif accepté' : 'Justificatif refusé', {
        description: accepter ? "L'absence est désormais excusée dans l'appel." : 'Le parent verra le motif du refus.',
      }),
      onError: (e) => setErreur(resolveErrorMessage(e)),
    });
  };

  return (
    <li className="bg-white rounded-2xl border border-neutral-200 border-solid p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-neutral-900">{j.eleve ?? 'Élève inconnu'}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-solid ${badge.classe}`}>{badge.texte}</span>
            <span className="text-[10px] font-bold text-neutral-500">{j.statutPresence === 'RETARD' ? 'Retard' : 'Absence'}</span>
          </div>
          <p className="text-xs text-neutral-600 font-semibold mt-0.5">
            {j.cours ?? 'Cours inconnu'} · <span className="first-letter:uppercase">{dateFr(j.date)}</span>
          </p>
          <p className="text-sm text-neutral-800 mt-2 whitespace-pre-line break-words">« {j.motif} »</p>
          <p className="text-[11px] text-neutral-500 font-semibold mt-1">
            Déposé par {j.parent ?? 'le parent'} le {dateFr(j.deposeLe, true)}
            {j.traiteLe ? ` · traité le ${dateFr(j.traiteLe, true)}` : ''}
          </p>
          {j.fichierUrl && (
            <a href={j.fichierUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2">
              <span translate="no" className="material-symbols-outlined text-[16px]">attach_file</span>Voir le justificatif
            </a>
          )}
          {j.statut === 'REFUSE' && j.motifRefus && (
            <p className="text-xs text-red-700 font-semibold mt-2">Motif du refus : {j.motifRefus}</p>
          )}
        </div>

        {j.statut === 'EN_ATTENTE' && !refus && (
          <div className="flex gap-2 shrink-0">
            <button type="button" disabled={decider.isPending} onClick={() => envoyer(true)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black disabled:opacity-50 cursor-pointer">
              Accepter
            </button>
            <button type="button" disabled={decider.isPending} onClick={() => setRefus(true)}
              className="px-3 py-2 rounded-xl bg-white border border-red-300 border-solid text-red-700 hover:bg-red-50 text-xs font-black disabled:opacity-50 cursor-pointer">
              Refuser
            </button>
          </div>
        )}
      </div>

      {refus && j.statut === 'EN_ATTENTE' && (
        <div className="mt-3 border-t border-neutral-200 border-solid pt-3">
          <label htmlFor={`refus-${j.id}`} className="text-[11px] font-black text-neutral-600 uppercase tracking-wider block mb-1">
            Motif du refus <span className="text-red-500">*</span>
          </label>
          <textarea id={`refus-${j.id}`} value={motif} onChange={(e) => { setMotif(e.target.value); setErreur(null); }}
            className="w-full p-3 bg-neutral-50 border border-neutral-200 border-solid rounded-xl text-sm outline-none focus:border-primary resize-none h-20"
            placeholder="Ex. : certificat illisible, date ne correspondant pas…" />
          <div className="flex flex-wrap justify-end gap-2 mt-2">
            <button type="button" onClick={() => { setRefus(false); setMotif(''); setErreur(null); }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer">Annuler</button>
            <button type="button" disabled={decider.isPending} onClick={() => envoyer(false)}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black disabled:opacity-50 cursor-pointer">
              Confirmer le refus
            </button>
          </div>
        </div>
      )}
      {erreur && <p role="alert" className="text-xs text-red-600 font-semibold mt-2">{erreur}</p>}
    </li>
  );
}

/** Validation des justificatifs d'absence déposés par les parents. */
export function AdminJustificatifsAbsence() {
  const [onglet, setOnglet] = useState<StatutJustificatif | 'TOUS'>('EN_ATTENTE');
  const { data, isLoading, error } = useJustificatifsAdmin(onglet);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-black text-neutral-900">Justificatifs d'absence</h2>
        <p className="text-xs text-neutral-500 font-semibold mt-1">
          Déposés par les parents. Accepter un justificatif rend l'absence « excusée » dans l'appel du professeur.
        </p>
      </div>

      <div role="tablist" aria-label="Statut des justificatifs" className="flex flex-wrap gap-2 mb-4">
        {ONGLETS.map((o) => (
          <button key={o.id} type="button" role="tab" aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border border-solid cursor-pointer ${onglet === o.id ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary/40'}`}>
            {o.texte}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : error ? (
        <div role="alert" className="bg-red-50 border border-red-200 border-solid rounded-2xl p-4 text-sm text-red-700 font-semibold">
          {resolveErrorMessage(error)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 border-solid p-8 text-center text-sm text-neutral-500 font-semibold">
          {onglet === 'EN_ATTENTE' ? 'Aucun justificatif à traiter.' : 'Aucun justificatif dans cette catégorie.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((j) => <Carte key={j.id} j={j} />)}
        </ul>
      )}
    </div>
  );
}

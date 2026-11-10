import React, { useState } from 'react';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { ChildAttendance } from '../../types';
import { LONGUEUR_MAX_MOTIF, useJustifierAbsence } from '../../justificatifsApi';

const TYPES_ACCEPTES = ['application/pdf', 'image/jpeg', 'image/png'];
const TAILLE_MAX = 10 * 1024 * 1024;

interface Props {
  presence: ChildAttendance;
  onClose: () => void;
}

/** Le parent justifie une absence ou un retard ; l'administration valide ensuite. */
export function JustificationAbsenceModal({ presence, onClose }: Props) {
  const [motif, setMotif] = useState('');
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreurs, setErreurs] = useState<{ motif?: string; fichier?: string }>({});
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);
  const justifier = useJustifierAbsence();
  const libelle = presence.statut === 'RETARD' ? 'le retard' : "l'absence";

  const choisirFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!f) return;
    if (!TYPES_ACCEPTES.includes(f.type)) {
      setErreurs((er) => ({ ...er, fichier: 'Format non accepté : choisissez un PDF, un JPG ou un PNG.' }));
      return;
    }
    if (f.size > TAILLE_MAX) {
      setErreurs((er) => ({ ...er, fichier: 'Fichier trop lourd : 10 Mo au maximum.' }));
      return;
    }
    setErreurs((er) => ({ ...er, fichier: undefined }));
    setFichier(f);
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    const m = motif.trim();
    if (!m) return setErreurs((er) => ({ ...er, motif: `Indiquez le motif de ${libelle}.` }));
    if (m.length > LONGUEUR_MAX_MOTIF) return setErreurs((er) => ({ ...er, motif: `Motif trop long (${LONGUEUR_MAX_MOTIF} caractères au plus).` }));
    setErreurServeur(null);
    justifier.mutate({ presenceId: presence.id, motif: m, fichier }, {
      onSuccess: () => {
        toast.success('Justificatif envoyé', { description: "L'administration de l'établissement va l'examiner." });
        onClose();
      },
      onError: (err) => setErreurServeur(resolveErrorMessage(err)),
    });
  };

  const dateLisible = new Date(presence.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="titre-justif">
      <form noValidate onSubmit={soumettre} className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-7 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <span translate="no" className="material-symbols-outlined text-[24px]">assignment_late</span>
          </div>
          <div className="min-w-0">
            <p id="titre-justif" className="font-black text-neutral-900">Justifier {libelle}</p>
            <p className="text-[11px] text-neutral-500 font-semibold truncate first-letter:uppercase">{presence.cours} · {dateLisible}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
          </button>
        </div>

        {erreurServeur && (
          <div role="alert" className="mb-4 p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 border-solid font-semibold">{erreurServeur}</div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="justif-motif" className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">
              Motif <span className="text-red-500">*</span>
            </label>
            <textarea
              id="justif-motif"
              value={motif}
              onChange={(e) => { setMotif(e.target.value); setErreurs((er) => ({ ...er, motif: undefined })); }}
              maxLength={LONGUEUR_MAX_MOTIF + 50}
              aria-invalid={!!erreurs.motif}
              className={`w-full p-3 bg-neutral-50 border border-solid rounded-xl text-sm text-neutral-800 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none h-24 ${erreurs.motif ? 'border-red-400' : 'border-neutral-200'}`}
              placeholder="Ex. : maladie, rendez-vous médical…"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-red-600 font-semibold">{erreurs.motif ?? ''}</p>
              <p className="text-[10px] text-neutral-400 font-semibold tabular-nums">{motif.trim().length} / {LONGUEUR_MAX_MOTIF}</p>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Justificatif (facultatif)</span>
            <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${fichier ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-neutral-50 hover:border-primary'}`}>
              <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={choisirFichier} />
              {fichier ? (
                <span className="text-center px-3">
                  <span translate="no" className="material-symbols-outlined text-[24px] text-emerald-500">check_circle</span>
                  <span className="block text-[11px] font-black text-emerald-700 mt-1 break-all">{fichier.name}</span>
                </span>
              ) : (
                <span className="text-center">
                  <span translate="no" className="material-symbols-outlined text-[24px] text-neutral-400">upload_file</span>
                  <span className="block text-[11px] font-bold text-neutral-500 mt-1">Certificat, convocation… (PDF, JPG, PNG — 10 Mo max.)</span>
                </span>
              )}
            </label>
            {erreurs.fichier && <p className="text-xs text-red-600 font-semibold mt-1">{erreurs.fichier}</p>}
            {fichier && (
              <button type="button" onClick={() => setFichier(null)} className="text-[11px] font-bold text-neutral-500 hover:underline mt-1 cursor-pointer">Retirer le fichier</button>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer">
            Annuler
          </button>
          <button type="submit" disabled={justifier.isPending}
            className="px-5 py-2 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-black shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer">
            {justifier.isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Envoyer le justificatif
          </button>
        </div>
      </form>
    </div>
  );
}

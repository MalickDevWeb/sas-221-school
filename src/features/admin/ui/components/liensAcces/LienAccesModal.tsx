import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { CLE_LIENS_EN_ATTENTE, estEmailTechnique, LIBELLES_CANAL, liensAccesApi, type CanalLien, type ResultatLien } from './liensAccesApi';
import { ResultatLienVue } from './ResultatLien';

export interface CompteLien {
  id: string;
  /** Nom affiché (jamais l'identifiant technique). */
  nom: string;
  telephone?: string | null;
  email?: string | null;
}

interface Props {
  compte: CompteLien;
  /** Canal proposé d'emblée (ex. WhatsApp pour un parent créé sans e-mail). */
  canalInitial?: CanalLien;
  onClose: () => void;
}

const CANAUX: { code: CanalLien; icone: string; aide: string }[] = [
  { code: 'WHATSAPP', icone: 'chat', aide: 'Vous ouvrez WhatsApp avec le message déjà écrit.' },
  { code: 'SMS', icone: 'sms', aide: 'Vous ouvrez les SMS avec le message déjà écrit.' },
  { code: 'EMAIL', icone: 'mail', aide: "L'école envoie le lien par e-mail." },
];

/**
 * Émission d'un lien d'accès pour un compte de l'école (activation 72 h ou nouveau mot de passe 2 h) : aucun mot de
 * passe n'est écrit dans un message. Le serveur décide de tout (type de lien, accord d'un second administrateur, code
 * oral) ; la fenêtre affiche sa réponse telle quelle.
 */
export function LienAccesModal({ compte, canalInitial, onClose }: Props) {
  const client = useQueryClient();
  const sansTelephone = !compte.telephone?.trim();
  const sansEmail = estEmailTechnique(compte.email);
  const indisponible = (c: CanalLien): string | null =>
    c === 'EMAIL' ? (sansEmail ? "Ce compte n'a pas d'adresse e-mail." : null)
      : sansTelephone ? "Ce compte n'a pas de numéro de mobile : ajoutez-le dans sa fiche." : null;
  const premierPossible = CANAUX.map(c => c.code).find(c => !indisponible(c)) ?? null;
  const [canal, setCanal] = useState<CanalLien | null>(canalInitial && !indisponible(canalInitial) ? canalInitial : premierPossible);
  const [erreurCanal, setErreurCanal] = useState('');
  const [resultat, setResultat] = useState<ResultatLien | null>(null);
  const [erreurServeur, setErreurServeur] = useState('');

  const emission = useMutation({
    mutationFn: (c: CanalLien) => liensAccesApi.emettre(compte.id, c),
    onMutate: () => setErreurServeur(''),
    // Message lu dès l'échec (avant la notification globale différée, qui n'est alors pas répétée)
    onError: (err) => setErreurServeur(resolveErrorMessage(err)),
    onSuccess: (r) => {
      setResultat(r);
      if (r.accordRequis) void client.invalidateQueries({ queryKey: CLE_LIENS_EN_ATTENTE });
    },
  });

  useEffect(() => {
    const clavier = (e: KeyboardEvent) => { if (e.key === 'Escape' && !emission.isPending) onClose(); };
    document.addEventListener('keydown', clavier);
    return () => document.removeEventListener('keydown', clavier);
  }, [onClose, emission.isPending]);

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canal) { setErreurCanal("Choisissez comment envoyer le lien."); return; }
    setErreurCanal('');
    emission.mutate(canal);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true" aria-labelledby="lien-acces-titre" id="lien-acces-fenetre">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-neutral-200 w-full max-w-md space-y-4 max-h-[92vh] overflow-y-auto">
        <h3 id="lien-acces-titre" className="font-extrabold text-[#1E293B] text-sm flex items-center gap-2 border-b border-neutral-100 pb-2">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-lg">link</span>
          Lien d'accès : {compte.nom}
        </h3>

        {resultat ? (
          <ResultatLienVue r={resultat} />
        ) : (
          <form id="form-lien-acces" onSubmit={envoyer} noValidate data-validation-externe className="space-y-3">
            <p className="text-xs text-neutral-600 font-semibold">
              Le titulaire ouvre le lien et choisit lui-même son mot de passe : aucun mot de passe n'est écrit dans le message.
              Un nouveau lien annule les précédents.
            </p>
            <fieldset className="space-y-2" aria-describedby={erreurCanal ? 'lien-acces-canal-erreur' : undefined}>
              <legend className="text-[11px] font-bold text-neutral-600 mb-1">Envoyer par</legend>
              {CANAUX.map(c => {
                const refus = indisponible(c.code);
                return (
                  <label key={c.code} data-canal={c.code}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${canal === c.code ? 'border-primary bg-primary/5' : 'border-neutral-200'} ${refus ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input type="radio" name="canal" value={c.code} checked={canal === c.code} disabled={!!refus}
                      onChange={() => { setCanal(c.code); setErreurCanal(''); setErreurServeur(''); }} className="mt-0.5 accent-[var(--color-primary)]" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs font-black text-neutral-800">
                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">{c.icone}</span>
                        {LIBELLES_CANAL[c.code]}
                      </span>
                      <span className="block text-[11px] text-neutral-500 font-semibold">{refus ?? c.aide}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
            {erreurCanal && <p id="lien-acces-canal-erreur" role="alert" className="text-[11px] font-bold text-rose-700">{erreurCanal}</p>}
            {erreurServeur && (
              <p id="lien-acces-erreur" role="alert" className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                Lien non créé : {erreurServeur}
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={onClose} disabled={emission.isPending}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 text-xs font-black cursor-pointer">
                Annuler
              </button>
              <button type="submit" disabled={emission.isPending || !premierPossible}
                className="px-4 py-2.5 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer disabled:opacity-60">
                {emission.isPending ? 'Création du lien…' : 'Créer le lien'}
              </button>
            </div>
          </form>
        )}

        {resultat && (
          <div className="flex justify-end">
            <button type="button" onClick={onClose} id="lien-acces-fermer"
              className="px-5 py-2.5 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer">
              {resultat.codeOral ? "J'ai noté le code" : 'Fermer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

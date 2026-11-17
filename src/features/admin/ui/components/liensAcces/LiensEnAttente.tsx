import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { avecNombre } from '@/shared/lib/pluriel';
import { CLE_LIENS_EN_ATTENTE, libelleCanal, libelleTypeLien, liensAccesApi, useLiensEnAttente, type LienEnAttente, type ResultatLien } from './liensAccesApi';
import { dateHeurePhrase } from '@/shared/lib/dateHeurePhrase';
import { ResultatLienVue } from './ResultatLien';

interface Props {
  /** Noms connus des comptes de l'école (identifiant → « Prénom Nom ») : le serveur ne renvoie que les identifiants. */
  noms: Record<string, string>;
  /** Compte connecté : il ne peut pas accorder sa propre demande ni un lien pour son propre compte. */
  moi: string | null;
}

/**
 * « Liens en attente d'accord » (administration) : liens d'accès d'un compte à privilèges, ou d'un compte dont le
 * numéro a changé depuis moins de 24 h, qu'un second administrateur doit approuver avant tout envoi.
 * Rien n'est affiché tant qu'aucune demande n'attend (ni en cas de liste vide).
 */
export function LiensEnAttente({ noms, moi }: Props) {
  const client = useQueryClient();
  const [accorde, setAccorde] = useState<{ nom: string | null; r: ResultatLien } | null>(null);
  const [erreur, setErreur] = useState<{ lienId: string; texte: string } | null>(null);

  const liste = useLiensEnAttente();

  const nomDe = (id: string | null) => (id && id === moi ? 'vous' : (id && noms[id]) || null);

  const accord = useMutation({
    mutationFn: (l: LienEnAttente) => liensAccesApi.accorder(l.lienId),
    onMutate: () => setErreur(null),
    onError: (err, l) => setErreur({ lienId: l.lienId, texte: resolveErrorMessage(err) }),
    onSuccess: (r, l) => setAccorde({ nom: nomDe(l.userId), r }),
    onSettled: () => void client.invalidateQueries({ queryKey: CLE_LIENS_EN_ATTENTE }),
  });

  if (liste.isError) {
    return (
      <div id="liens-en-attente-erreur" role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Les liens en attente d'accord n'ont pas pu être chargés : {resolveErrorMessage(liste.error)}</span>
        <button type="button" onClick={() => void liste.refetch()} className="px-3 py-1.5 rounded-lg bg-primary text-text-on-primary text-xs font-black cursor-pointer shrink-0">
          Réessayer
        </button>
      </div>
    );
  }
  const demandes = liste.data ?? [];
  if (demandes.length === 0 && !accorde) return null;

  return (
    <section id="liens-en-attente" aria-labelledby="liens-en-attente-titre" className="p-3 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-3">
      {demandes.length > 0 && (
        <>
          <div>
            <h3 id="liens-en-attente-titre" className="text-sm font-black text-amber-900 flex items-center gap-1.5">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">verified_user</span>
              Liens en attente d'accord ({avecNombre(demandes.length, 'demande')})
            </h3>
            <p className="text-[11px] text-amber-900 font-semibold">
              Compte d'administration ou numéro changé récemment : un second administrateur vérifie la demande avant que le lien soit envoyé.
            </p>
          </div>
          <ul className="space-y-2">
            {demandes.map(l => {
              const titulaire = nomDe(l.userId) ?? "Compte d'un parent ou d'un élève";
              const demandeur = nomDe(l.demandePar);
              const quand = dateHeurePhrase(l.demandeLe);
              const refus = l.demandePar && l.demandePar === moi ? 'Vous avez fait cette demande : un autre administrateur doit donner son accord.'
                : l.userId === moi ? 'Ce lien concerne votre compte : un autre administrateur doit donner son accord.' : null;
              return (
                <li key={l.lienId} data-lien-id={l.lienId} className="p-3 rounded-xl bg-white border border-amber-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 text-xs">
                      <p className="font-black text-neutral-800 truncate">{titulaire}</p>
                      <p className="text-[11px] text-neutral-600 font-semibold">
                        {libelleTypeLien(l.type)} · {libelleCanal(l.canal)}{l.destinataire ? ` (${l.destinataire})` : ''}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-semibold">
                        Demandé{quand ? ` le ${quand}` : ''}{demandeur ? ` par ${demandeur}` : ''}
                      </p>
                    </div>
                    <button type="button" data-action="accorder" disabled={!!refus || accord.isPending}
                      onClick={() => accord.mutate(l)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                      {accord.isPending && accord.variables?.lienId === l.lienId ? 'Accord en cours…' : 'Donner mon accord'}
                    </button>
                  </div>
                  {refus && <p className="text-[11px] font-semibold text-neutral-500">{refus}</p>}
                  {erreur?.lienId === l.lienId && (
                    <p role="alert" className="text-[11px] font-bold text-rose-700">Accord non enregistré : {erreur.texte}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {accorde && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog" aria-modal="true" aria-labelledby="lien-accorde-titre" id="lien-accorde-fenetre">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-neutral-200 w-full max-w-md space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 id="lien-accorde-titre" className="font-extrabold text-[#1E293B] text-sm border-b border-neutral-100 pb-2">
              {accorde.nom ? `Accord donné : lien de ${accorde.nom}` : "Accord donné : lien d'accès"}
            </h3>
            <ResultatLienVue r={accorde.r} />
            <div className="flex justify-end">
              <button type="button" onClick={() => setAccorde(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer">
                {accorde.r.codeOral ? "J'ai noté le code" : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

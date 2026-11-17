import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/core/store/authStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { dateServeur } from '@/shared/lib/dateServeur';
import { dateFr } from '@/shared/lib/formatsFr';
import { dateHeurePhrase } from '@/shared/lib/dateHeurePhrase';
import { avecNombre } from '@/shared/lib/pluriel';
import {
  corbeilleApi, estFeminin, TYPES_CORBEILLE, TYPES_PROFESSEUR, useListeCorbeille, type ElementCorbeille,
} from './corbeilleApi';

/** Jours entiers restants avant la date (arrondi au jour supérieur), ou null si la date est illisible. */
function joursRestants(v: unknown): number | null {
  const d = dateServeur(v);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

interface Props {
  /** Espace qui affiche la corbeille : l'administration voit toute l'école, le professeur ses suppressions. */
  espace: 'administration' | 'professeur';
  /** En-tête (titre et explication) affiché par le composant ; false si la page l'affiche déjà. */
  avecEnTete?: boolean;
}

type Retour = { type: 'succes' | 'erreur'; texte: string } | null;

/**
 * Corbeille (V21) : éléments supprimés restaurables pendant la durée de conservation du serveur, puis supprimés
 * définitivement (purge automatique nocturne, ou manuelle par l'administration avec confirmation).
 * Aucune donnée inventée : la liste, les dates, les auteurs, les droits et les conflits viennent du serveur.
 */
export function Corbeille({ espace, avecEnTete = true }: Props) {
  const client = useQueryClient();
  const moi = useAuthStore((s) => s.utilisateur?.id ?? null);
  const [type, setType] = useState('');
  const [retour, setRetour] = useState<Retour>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const requete = useListeCorbeille(type);

  const cle = (e: ElementCorbeille) => `${e.type}/${e.id}`;
  const apresAction = async () => {
    // Un élément restauré réapparaît dans les autres écrans : toutes les listes en cache sont relues
    await client.invalidateQueries();
  };

  const restauration = useMutation({
    mutationFn: (e: ElementCorbeille) => corbeilleApi.restaurer(e),
    onMutate: (e) => { setRetour(null); setEnCours(cle(e)); },
    onSuccess: async (r, e) => {
      const f = estFeminin(e.type);
      setRetour({ type: 'succes', texte: `Restauration effectuée : ${r.libelle ?? e.libelle}. ${f ? 'Elle' : 'Il'} est de nouveau visible là où ${f ? 'elle avait été supprimée' : 'il avait été supprimé'}.` });
      await apresAction();
    },
    onError: async (err, e) => {
      setRetour({ type: 'erreur', texte: `${e.libelle} non ${estFeminin(e.type) ? 'restaurée' : 'restauré'} : ${resolveErrorMessage(err)}` });
      await requete.refetch();   // l'état réel (déjà restauré, purgé, conflit nouveau) est relu
    },
    onSettled: () => setEnCours(null),
  });

  const purge = useMutation({
    mutationFn: (e: ElementCorbeille) => corbeilleApi.purger(e),
    onMutate: (e) => { setRetour(null); setEnCours(cle(e)); },
    onSuccess: async (r, e) => {
      const lies = r.elementsLies > 0
        ? `, avec ${avecNombre(r.elementsLies, e.type === 'quiz' ? "tentative d'élève" : e.type === 'devoir' ? "rendu d'élève" : 'élément lié', e.type === 'quiz' ? "tentatives d'élèves" : e.type === 'devoir' ? "rendus d'élèves" : 'éléments liés')}`
        : '';
      setRetour({ type: 'succes', texte: `Suppression définitive effectuée : ${r.libelle ?? e.libelle}${lies}.` });
      await requete.refetch();
    },
    onError: async (err, e) => {
      setRetour({ type: 'erreur', texte: `${e.libelle} non ${estFeminin(e.type) ? 'supprimée' : 'supprimé'} : ${resolveErrorMessage(err)}` });
      await requete.refetch();
    },
    onSettled: () => setEnCours(null),
  });

  const confirmerPurge = async (e: ElementCorbeille) => {
    const f = estFeminin(e.type);
    const lies = e.type === 'quiz' ? ' Les tentatives des élèves seront supprimées avec lui.'
      : e.type === 'devoir' ? ' Les rendus des élèves seront supprimés avec lui.' : '';
    const ok = await demanderConfirmation(
      `« ${e.libelle} » sera ${f ? 'supprimée' : 'supprimé'} définitivement : ${f ? 'elle' : 'il'} ne pourra plus être ${f ? 'restaurée' : 'restauré'}.${lies}`,
      { titre: 'Supprimer définitivement ?', confirmer: 'Supprimer définitivement', annuler: 'Annuler', danger: true },
    );
    if (ok) purge.mutate(e);
  };

  const typesProposes = espace === 'professeur'
    ? TYPES_CORBEILLE.filter(t => TYPES_PROFESSEUR.includes(t.code))
    : TYPES_CORBEILLE;
  const donnees = requete.data;
  const jours = donnees?.conservationJours ?? null;

  return (
    <section id="corbeille" data-espace={espace} className="space-y-4" aria-labelledby={avecEnTete ? 'corbeille-titre' : undefined}>
      {avecEnTete && (
        <div className="border-b border-neutral-100 pb-3">
          <h2 id="corbeille-titre" className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-xl">delete</span>
            Corbeille
          </h2>
          <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
            {donnees?.vueAdministration
              ? "Toute la corbeille de l'école : les éléments supprimés par le personnel et les professeurs."
              : 'Les éléments que vous avez supprimés.'}
            {jours !== null && ` Ils restent restaurables ${avecNombre(jours, 'jour')}, puis sont supprimés définitivement.`}
          </p>
        </div>
      )}
      {!avecEnTete && jours !== null && (
        <p className="text-[11px] text-neutral-500 font-semibold">
          {donnees?.vueAdministration ? "Vous voyez toute la corbeille de l'école. " : 'Vous voyez les éléments que vous avez supprimés. '}
          Ils restent restaurables {avecNombre(jours, 'jour')}, puis sont supprimés définitivement.
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
        <div className="space-y-1 w-full sm:w-72">
          <label htmlFor="corbeille-filtre-type" className="block text-[11px] font-bold text-neutral-600">Type d'élément</label>
          <select id="corbeille-filtre-type" value={type} onChange={(ev) => { setType(ev.target.value); setRetour(null); }}
            className="w-full h-10 px-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary">
            <option value="">Tous les types</option>
            {typesProposes.map(t => <option key={t.code} value={t.code}>{t.libelle}</option>)}
          </select>
        </div>
        {donnees && !requete.isError && (
          <p id="corbeille-total" className="text-xs font-bold text-neutral-500 sm:pb-2.5">
            {avecNombre(donnees.total, 'élément')} dans la corbeille
          </p>
        )}
      </div>

      {retour && (
        <div id="corbeille-retour" role={retour.type === 'erreur' ? 'alert' : 'status'} data-retour={retour.type}
          className={`p-3 rounded-xl border text-xs font-bold ${retour.type === 'erreur'
            ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {retour.texte}
        </div>
      )}

      {requete.isPending ? (
        <div className="space-y-2" aria-busy="true" aria-label="Chargement de la corbeille…">
          {[0, 1, 2].map(i => (
            <div key={i} className="p-4 rounded-2xl border border-neutral-100 bg-white animate-pulse space-y-2">
              <div className="h-3 w-24 bg-neutral-200 rounded" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="h-3 w-1/2 bg-neutral-100 rounded" />
            </div>
          ))}
          <p className="sr-only">Chargement de la corbeille…</p>
        </div>
      ) : requete.isError ? (
        <div id="corbeille-erreur" role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-3">
          <p>La corbeille n'a pas pu être chargée : {resolveErrorMessage(requete.error)}</p>
          <button type="button" onClick={() => void requete.refetch()} disabled={requete.isFetching}
            className="px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer disabled:opacity-60">
            {requete.isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      ) : donnees && donnees.elements.length === 0 ? (
        <div id="corbeille-vide" className="p-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-center space-y-3">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-4xl text-neutral-300">delete</span>
          {type ? (
            <>
              <p className="text-xs font-bold text-neutral-600">Aucun élément de ce type dans la corbeille.</p>
              <button type="button" onClick={() => setType('')}
                className="px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer">
                Afficher tous les types
              </button>
            </>
          ) : (
            <p className="text-xs font-bold text-neutral-600">
              La corbeille est vide.
              {jours !== null && ` Les éléments supprimés y restent ${avecNombre(jours, 'jour')} : vous pourrez les restaurer pendant ce délai.`}
            </p>
          )}
        </div>
      ) : donnees ? (
        <ul className="space-y-2" id="corbeille-liste">
          {donnees.elements.map(e => {
            const f = estFeminin(e.type);
            const supprimeLe = dateHeurePhrase(e.supprimeLe);
            const purgeLe = dateFr(e.purgeLe);
            const reste = joursRestants(e.purgeLe);
            const auteur = e.supprimePar && e.supprimePar === moi ? 'vous' : e.supprimeParNom;
            const occupe = enCours === cle(e);
            const motifRefus = e.conflit
              ?? (!e.peutRestaurer ? "Restauration réservée à l'administration de l'école pour cet élément." : null);
            const idMotif = `corbeille-motif-${e.type}-${e.id}`;
            return (
              <li key={cle(e)} data-corbeille-type={e.type} data-corbeille-id={e.id}
                className="p-3 sm:p-4 rounded-2xl border border-neutral-200 bg-white space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-black">
                      {e.typeLibelle || 'Élément'}
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 break-words">{e.libelle}</p>
                    <p className="text-[11px] text-neutral-500 font-semibold">
                      {supprimeLe ? `${f ? 'Supprimée' : 'Supprimé'} le ${supprimeLe}` : `${f ? 'Supprimée' : 'Supprimé'} à une date inconnue`}
                      {auteur ? ` par ${auteur}` : ''}
                    </p>
                    {purgeLe !== '—' && (
                      <p className="text-[11px] font-bold text-amber-700" data-purge-le>
                        {reste !== null && reste <= 0
                          ? `${f ? 'Supprimée' : 'Supprimé'} définitivement lors de la prochaine purge automatique (délai écoulé).`
                          : `${f ? 'Supprimée' : 'Supprimé'} définitivement le ${purgeLe}${reste !== null ? ` (dans ${avecNombre(reste, 'jour')})` : ''}.`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                    <button type="button" data-action="restaurer" onClick={() => restauration.mutate(e)}
                      disabled={!!motifRefus || occupe}
                      aria-describedby={motifRefus ? idMotif : undefined}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                      <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">restore_from_trash</span>
                      {occupe && restauration.isPending ? 'Restauration…' : 'Restaurer'}
                    </button>
                    {e.peutPurger && (
                      <button type="button" data-action="purger" onClick={() => void confirmerPurge(e)} disabled={occupe}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-black cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1">
                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">delete_forever</span>
                        {occupe && purge.isPending ? 'Suppression…' : 'Supprimer définitivement'}
                      </button>
                    )}
                  </div>
                </div>
                {motifRefus && (
                  <p id={idMotif} data-motif-refus className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                    {motifRefus}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { referentielApi } from '../infrastructure/referentielApi';
import { referentielErrorMessage, useReferentiel } from '../hooks/useReferentiel';
import { ReferentielValueRow } from './ReferentielValueRow';
import { ReferentielAddForm } from './ReferentielAddForm';
import type { ReferentielInfo, ReferentielSlug } from '../domain/ReferentielModels';

/** Onglet admin « Référentiels » : modifier les listes de valeurs sans toucher au code. */
export function AdminReferentielsManager() {
  const [lists, setLists] = useState<ReferentielInfo[]>([]);
  const [listsError, setListsError] = useState<string | null>(null);
  const [slug, setSlug] = useState<ReferentielSlug>('expense-category');
  const { values, loading, error, reload } = useReferentiel(slug, true);
  const current = lists.find(l => l.slug === slug);

  useEffect(() => {
    referentielApi.lists()
      .then(setLists)
      .catch(err => setListsError(referentielErrorMessage(err, 'Impossible de charger les référentiels.')));
  }, []);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-black text-slate-900">Référentiels</h2>
        <p className="text-xs text-slate-500">
          Listes de valeurs utilisées dans l'application. Les valeurs « Plateforme » sont communes à toutes les
          écoles : les modifier ici ne change que votre école.
        </p>
      </div>

      {listsError && <p role="alert" className="text-xs text-red-600">{listsError}</p>}
      <div className="flex flex-wrap gap-2" role="tablist">
        {lists.map(l => (
          <button key={l.slug} role="tab" aria-selected={l.slug === slug} onClick={() => setSlug(l.slug)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${l.slug === slug
              ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-neutral-200'}`}>
            {l.label}{l.mode === 'LOCKED' ? ' 🔒' : ''}
          </button>
        ))}
      </div>

      {current?.mode === 'LOCKED' && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Liste verrouillée : ses valeurs pilotent le fonctionnement de l'application. Vous pouvez changer
          libellés, couleurs et ordre, mais pas ajouter ni supprimer de valeur.
        </p>
      )}
      {current?.mode === 'OPEN' && <ReferentielAddForm slug={slug} onCreated={reload} />}

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      <div className="overflow-x-auto bg-white border border-neutral-200 rounded-2xl">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase text-slate-400 font-black">
            <tr>
              <th className="px-3 py-2">Code</th><th className="px-3 py-2">Libellé</th>
              <th className="px-3 py-2">Teinte</th><th className="px-3 py-2">Ordre</th>
              <th className="px-3 py-2">Origine</th><th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-400">Chargement…</td></tr>}
            {!loading && !error && values.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-400">Aucune valeur.</td></tr>
            )}
            {!loading && values.map(v => (
              <ReferentielValueRow key={`${slug}-${v.code}-${v.scope}-${v.label}-${v.active}`} slug={slug} value={v} onChanged={reload} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

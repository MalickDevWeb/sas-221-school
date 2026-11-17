import { useEffect, useState } from 'react';
import { referentielApi } from '../infrastructure/referentielApi';
import { referentielErrorMessage, useReferentiel } from '../hooks/useReferentiel';
import { ReferentielValueRow } from './ReferentielValueRow';
import { ReferentielAddForm } from './ReferentielAddForm';
import { GRILLE_REFERENTIEL } from './grille';
import { DESCRIPTIONS_LISTES, DESCRIPTION_LISTE_DEFAUT, type ReferentielInfo, type ReferentielSlug } from '../domain/ReferentielModels';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

/** Icône de chaque liste dans le sous-menu (liste inconnue : icône générique). */
const ICONES: Record<string, string> = { 'expense-category': 'category', 'candidate-status': 'how_to_reg' };

/** Pourquoi une liste est verrouillée, en une phrase (liste inconnue : phrase générique). */
const RAISONS_VERROU: Record<string, string> = {
  'candidate-status': 'Chaque statut déclenche une étape du traitement des candidatures (étude, admission, inscription) : vous pouvez les renommer, changer leur couleur et leur ordre, mais pas en ajouter ni en supprimer.',
};
const RAISON_VERROU_DEFAUT = 'Ces valeurs pilotent le fonctionnement de l’application : vous pouvez les renommer, changer leur couleur et leur ordre, mais pas en ajouter ni en supprimer.';

/** Onglet admin « Référentiels » : modifier les listes de valeurs sans toucher au code. Un seul titre : le nom de la liste. */
export function AdminReferentielsManager() {
  const [lists, setLists] = useState<ReferentielInfo[]>([]);
  const [listsError, setListsError] = useState<string | null>(null);
  const [slug, setSlug] = useState<ReferentielSlug>('expense-category');
  const { values, loading, error, reload } = useReferentiel(slug, true);
  const current = lists.find(l => l.slug === slug);
  const [replie, basculerRepli] = useRepliSousMenu('referentiels');
  const entrees: EntreeSousMenu[] = lists.map(l => ({
    id: l.slug, libelle: l.label, icone: ICONES[l.slug] ?? 'list', sousLibelle: l.mode === 'LOCKED' ? 'Liste verrouillée' : undefined,
  }));
  const actives = values.filter(v => v.active).length;

  useEffect(() => {
    referentielApi.lists()
      .then(setLists)
      .catch(err => setListsError(referentielErrorMessage(err, 'Impossible de charger les listes.')));
  }, []);

  return (
    <ModuleAvecSousMenu
      id="admin-referentiels-root"
      titre={current?.label ?? 'Référentiels'}
      sousTitre={DESCRIPTIONS_LISTES[slug] ?? DESCRIPTION_LISTE_DEFAUT}
      sousMenu={lists.length > 0 && (
        <SousMenuModule id="referentiels-subsidebar" titre="Référentiels" entrees={entrees} actif={slug}
          onChoisir={(id) => { const l = lists.find(x => x.slug === id); if (l) setSlug(l.slug); }}
          replie={replie} onBasculerRepli={basculerRepli} />
      )}
    >
      <div className="space-y-4 text-xs">
        {listsError && <p role="alert" className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold">{listsError}</p>}

        {current?.mode === 'LOCKED' && (
          <p className="flex items-start gap-2 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-[11px] font-semibold">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">lock</span>
            <span><b>Liste verrouillée.</b> {RAISONS_VERROU[slug] ?? RAISON_VERROU_DEFAUT}</span>
          </p>
        )}
        {current?.mode === 'OPEN' && <ReferentielAddForm slug={slug} onCreated={reload} />}

        {error && <p role="alert" className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold">{error}</p>}

        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className={`hidden md:grid px-3 py-2 bg-neutral-50 border-b border-neutral-100 text-[10px] font-black uppercase tracking-wider text-neutral-400 ${GRILLE_REFERENTIEL}`}>
            <span className="px-2.5">Libellé</span><span>Couleur</span><span>Origine</span>
            <span className="text-center" title="La plus petite position s’affiche en premier">Position</span><span className="text-right">Actions</span>
          </div>
          {loading ? (
            <ul aria-busy="true">
              {[0, 1, 2, 3].map(i => (
                <li key={i} className="px-3 py-3 border-t border-neutral-100 first:border-t-0 flex items-center gap-3">
                  <div className="h-3 flex-1 max-w-[40%] rounded bg-neutral-100 animate-pulse" /><div className="h-6 w-28 rounded-lg bg-neutral-100 animate-pulse" />
                  <div className="h-4 w-32 rounded-full bg-neutral-100 animate-pulse hidden md:block" />
                </li>
              ))}
            </ul>
          ) : values.length === 0 ? (
            !error && <p className="px-3 py-8 text-center text-neutral-500 font-semibold">Aucune valeur dans cette liste.</p>
          ) : (
            <ul>
              {values.map(v => (
                <ReferentielValueRow key={`${slug}-${v.code}-${v.scope}-${v.label}-${v.active}`} slug={slug} value={v} onChanged={reload} />
              ))}
            </ul>
          )}
        </div>
        {!loading && values.length > 0 && (
          <p className="text-[10px] text-neutral-400 font-semibold">
            {values.length} valeur{values.length > 1 ? 's' : ''}, dont {actives} proposée{actives > 1 ? 's' : ''} dans les listes. Survolez un libellé pour voir son code interne.
          </p>
        )}
      </div>
    </ModuleAvecSousMenu>
  );
}

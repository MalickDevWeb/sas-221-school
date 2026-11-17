import { useMemo, useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useRbacStore } from '@/core/store/rbacStore';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu } from '@/shared/components/SousMenuModule';
import { CarteDemande } from './CarteDemande';
import { FormulaireDemande } from './FormulaireDemande';
import { entreesTransferts, useDemandesTransfert, type Demande, type SectionTransferts } from './transfertsApi';

/**
 * Transferts d'élèves entre écoles, comme dans la vraie vie : l'école d'origine fait la demande,
 * l'école d'accueil l'accepte ou la refuse ; à l'acceptation, l'élève change d'école et l'école d'accueil reçoit
 * une copie de son dossier. Toutes les règles sont vérifiées par le serveur (/admin/transferts).
 *
 * Mise en page commune de l'administration (modèle « Finances ») : sous-menu partagé à gauche, contenu à droite.
 */

const ETAPES = [
  'Vous demandez le transfert',
  'L’école d’accueil accepte ou refuse',
  'L’élève et son dossier sont transférés ; vous gardez les archives',
];

/** Demandes en attente d'abord, puis l'ordre du serveur (les plus récentes en premier). */
const enAttenteDabord = (l: Demande[]) =>
  [...l].sort((a, b) => Number(b.statut === 'EN_ATTENTE') - Number(a.statut === 'EN_ATTENTE'));

export function TransfertsTab() {
  const peutModifier = useRbacStore((s) => s.peut('transferts.ecrire'));
  const demandes = useDemandesTransfert();
  const [choix, setChoix] = useState<SectionTransferts | null>(null);
  const section: SectionTransferts = choix ?? (peutModifier ? 'demander' : 'recues');
  const entrees = entreesTransferts(peutModifier, demandes.data);
  const [replie, basculer] = useRepliSousMenu('transferts');

  const elevesEnAttente = useMemo(
    () => new Set((demandes.data?.sortants ?? []).filter((d) => d.statut === 'EN_ATTENTE').map((d) => d.eleve.id)),
    [demandes.data],
  );

  const sousTitre = (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {ETAPES.map((e, i) => (
        <span key={e} className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-full bg-primary text-white text-[9px] font-black inline-flex items-center justify-center shrink-0">{i + 1}</span>
          {e}
        </span>
      ))}
    </span>
  );

  return (
    <ModuleAvecSousMenu
      id="transferts-tab"
      idContenu="transferts-contenu"
      titre={(
        <span className="flex items-center gap-2">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">sync_alt</span>
          Transferts d’élèves
        </span>
      )}
      sousTitre={sousTitre}
      sousMenu={(
        <SousMenuModule id="transferts-subsidebar" titre="Transferts" entrees={entrees} actif={section}
          onChoisir={(id) => setChoix(entrees.find((e) => e.id === id)?.id ?? section)} replie={replie} onBasculerRepli={basculer} />
      )}
    >
      <div className="space-y-5">
        {!peutModifier && (
          <p className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-[11px] text-neutral-600 font-semibold">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px] text-neutral-400 shrink-0">visibility</span>
            Consultation seule : votre compte n’a pas le droit de demander, d’accepter ou de refuser un transfert.
          </p>
        )}

        {section === 'demander' && peutModifier && (
          <FormulaireDemande elevesEnAttente={elevesEnAttente} onVoirEnvoyees={() => setChoix('envoyees')} />
        )}
        {section === 'recues' && (
          <ListeDemandes id="transferts-entrants" titre="Demandes reçues" sens="entrant" requete={demandes} peutModifier={peutModifier}
            vide={{ icone: 'move_to_inbox', texte: 'Aucune demande reçue.', aide: 'Quand une autre école vous demandera d’accueillir un de ses élèves, la demande apparaîtra ici pour que vous l’acceptiez ou la refusiez.' }} />
        )}
        {section === 'envoyees' && (
          <ListeDemandes id="transferts-sortants" titre="Demandes envoyées" sens="sortant" requete={demandes} peutModifier={peutModifier}
            vide={{
              icone: 'outbox', texte: 'Aucune demande envoyée.',
              aide: peutModifier ? 'Pour transférer un élève, ouvrez « Demander un transfert » : la réponse de l’école d’accueil s’affichera ici.' : 'Les demandes faites par votre école apparaîtront ici avec la réponse de l’école d’accueil.',
            }}
            action={peutModifier ? { texte: 'Demander un transfert', onClick: () => setChoix('demander') } : undefined} />
        )}
      </div>
    </ModuleAvecSousMenu>
  );
}

function ListeDemandes({ id, titre, sens, requete, peutModifier, vide, action }: {
  id: string; titre: string; sens: 'entrant' | 'sortant';
  requete: ReturnType<typeof useDemandesTransfert>; peutModifier: boolean;
  vide: { icone: string; texte: string; aide: string };
  action?: { texte: string; onClick: () => void };
}) {
  const liste = requete.data ? (sens === 'entrant' ? requete.data.entrants : requete.data.sortants) : null;
  const enAttente = liste?.filter((d) => d.statut === 'EN_ATTENTE').length ?? 0;
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-100">
        <h3 id={`${id}-titre`} className="text-[11px] font-black uppercase tracking-wider text-[#1E293B]">
          {titre}{liste ? ` (${liste.length})` : ''}
        </h3>
        {enAttente > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-black">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[13px]">schedule</span>
            {enAttente} en attente{sens === 'entrant' ? ' de votre réponse' : ' de réponse'}
          </span>
        )}
      </div>

      {requete.isLoading ? (
        <ul aria-busy="true" aria-label="Chargement des demandes" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="p-4 rounded-2xl border border-neutral-100 flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-2/5 rounded bg-neutral-100 animate-pulse" />
                <div className="h-2.5 w-3/5 rounded bg-neutral-100 animate-pulse" />
                <div className="h-2.5 w-1/3 rounded bg-neutral-100 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : requete.isError ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl border border-red-200 bg-red-50 text-xs text-red-700 font-semibold">
          <span>Demandes indisponibles : {resolveErrorMessage(requete.error)}</span>
          <button type="button" onClick={() => void requete.refetch()}
            className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-[11px] font-black text-red-700 cursor-pointer">Réessayer</button>
        </div>
      ) : !liste || liste.length === 0 ? (
        <div className="py-10 px-4 text-center flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[28px]">{vide.icone}</span>
          </div>
          <p className="text-sm font-black text-neutral-800">{vide.texte}</p>
          <p className="text-[11px] text-neutral-500 font-semibold max-w-md">{vide.aide}</p>
          {action && (
            <button type="button" onClick={action.onClick}
              className="mt-1 px-3 py-2 bg-primary text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">send</span>{action.texte}
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {enAttenteDabord(liste).map((d) => <CarteDemande key={d.id} d={d} sens={sens} peutModifier={peutModifier} />)}
        </ul>
      )}
    </section>
  );
}

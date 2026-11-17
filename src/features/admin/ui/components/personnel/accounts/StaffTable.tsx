import React from 'react';
import { StaffMember, libelleRole } from '../../../../domain/PersonnelModels';
import { avecNombre } from '@/shared/lib/pluriel';
import { formatPhoneInput } from '@/shared/utils/phoneUtils';
import { MenuActions } from '@/shared/components/MenuActions';

interface Props {
  staff: StaffMember[];
  /** Nombre de membres avant filtres : « 2 membres du personnel sur 5 ». */
  total?: number;
  /** Premier chargement de la liste : lignes squelettes. */
  chargement?: boolean;
  onEdit: (m: StaffMember) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  /** Administration seulement : émettre un lien d'accès (activation ou nouveau mot de passe). */
  onLienAcces?: (m: StaffMember) => void;
  /** Compte connecté : pas de lien d'accès pour soi-même (« Mot de passe oublié » à la place). */
  moi?: string | null;
  /** Filtres actifs : l'état vide propose de les effacer. */
  onEffacerFiltres?: () => void;
}

const nomComplet = (m: StaffMember) => `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || libelleRole(m);
const initiales = (m: StaffMember) => `${(m.firstName || '').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();
const boutonLigne = 'h-8 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-slate-700 hover:bg-neutral-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

/**
 * Comptes du personnel (mise en page du 16/11). Avant : tableau plus large que sa carte (barre de défilement masquée,
 * première colonne coupée), boutons empilés, pied sur deux lignes. Désormais :
 * - largeurs fixes : la colonne « Membre » (nom, e-mail, matricule et téléphone en petit) prend la place restante,
 *   rien ne déborde ;
 * - actions sur une rangée alignée : « Modifier », lien d'accès (icône avec infobulle) et menu « ⋯ » (suspendre,
 *   supprimer) ;
 * - sous 40rem de large (téléphone, écran étroit), chaque ligne devient une carte. La largeur mesurée est celle du
 *   conteneur (@container), pas celle de l'écran : menus latéraux ouverts ou non, le tableau tient.
 * Repères des tests conservés : ligne `tr` contenant l'e-mail, bouton « Modifier », [data-action=lien-acces].
 */
export const StaffTable: React.FC<Props> = ({ staff, total, chargement, onEdit, onToggleStatus, onDelete, onLienAcces, moi, onEffacerFiltres }) => {
  const compteur = avecNombre(staff.length, 'membre du personnel', 'membres du personnel')
    + (total !== undefined && total !== staff.length ? ` sur ${total.toLocaleString('fr-FR')}` : '');

  return (
    <div className="@container">
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <table className="block @[40rem]:table w-full @[40rem]:table-fixed text-left text-xs border-collapse">
          <caption className="sr-only">Comptes du personnel</caption>
          <thead className="hidden @[40rem]:table-header-group">
            <tr className="bg-[#FAF8F6] border-b border-neutral-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              <th scope="col" className="px-4 py-2.5">Membre</th>
              <th scope="col" className="w-32 px-3 py-2.5">Rôle</th>
              <th scope="col" className="w-24 px-3 py-2.5">Statut</th>
              <th scope="col" className="w-48 px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="block @[40rem]:table-row-group" aria-busy={chargement || undefined}>
            {chargement && staff.length === 0 ? (
              [0, 1, 2].map((i) => (
                <tr key={i} className="block @[40rem]:table-row border-t border-neutral-100 first:border-t-0">
                  <td colSpan={4} className="block @[40rem]:table-cell px-4 py-3">
                    <div className="h-10 rounded-xl bg-neutral-100 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : staff.length === 0 ? (
              <tr className="block @[40rem]:table-row">
                <td colSpan={4} className="block @[40rem]:table-cell px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    {onEffacerFiltres ? 'Aucun membre du personnel ne correspond à ces critères.' : "Aucun membre du personnel pour l'instant."}
                  </p>
                  {onEffacerFiltres && (
                    <button type="button" onClick={onEffacerFiltres} className={`${boutonLigne} mt-3 px-3 text-xs font-semibold`}>
                      Effacer les filtres
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              staff.map((m) => {
                const nom = nomComplet(m);
                const actif = m.status === 'Actif';
                return (
                  <tr key={m.id}
                    className="flex flex-wrap items-center gap-x-2 gap-y-2.5 px-3 py-3 border-t border-neutral-100 first:border-t-0 hover:bg-neutral-50/70 @[40rem]:table-row @[40rem]:p-0">
                    <td className="basis-full min-w-0 @[40rem]:px-4 @[40rem]:py-3 align-middle">
                      <div className="flex items-center gap-3 min-w-0">
                        <span aria-hidden="true" className="w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black flex items-center justify-center">
                          {initiales(m)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-900 leading-snug break-words">{nom}</p>
                          <p className="text-[11px] font-medium text-slate-600 truncate" title={m.email}>{m.email}</p>
                          {(m.matricule || m.phone) && (
                            <p className="text-[11px] font-medium text-slate-500 truncate">
                              {m.matricule && <span className="font-mono" title="Matricule">{m.matricule}</span>}
                              {m.matricule && m.phone && <span aria-hidden="true"> · </span>}
                              {m.phone && <span>{formatPhoneInput(m.phone)}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="@[40rem]:px-3 @[40rem]:py-3 align-middle">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold leading-tight">
                        {libelleRole(m)}
                      </span>
                    </td>
                    <td className="@[40rem]:px-3 @[40rem]:py-3 align-middle">
                      <span className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold leading-tight ${
                        actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="ml-auto @[40rem]:ml-0 @[40rem]:px-4 @[40rem]:py-3 align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => onEdit(m)} aria-label={`Modifier ${nom}`}
                          className={`${boutonLigne} gap-1 px-2.5 text-xs font-semibold`}>
                          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">edit</span>
                          Modifier
                        </button>
                        {onLienAcces && (m.id !== moi ? (
                          <button type="button" data-action="lien-acces" onClick={() => onLienAcces(m)}
                            title="Lien d'accès : le membre choisit lui-même son mot de passe"
                            aria-label={`Envoyer un lien d'accès à ${nom}`} className={`${boutonLigne} w-8 shrink-0`}>
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">link</span>
                          </button>
                        ) : (
                          // Son propre compte : pas de lien d'accès ; emplacement gardé pour aligner les rangées
                          <span aria-hidden="true" className="w-8 shrink-0" />
                        ))}
                        <MenuActions pour={nom} actions={[
                          {
                            libelle: actif ? 'Suspendre le compte' : 'Réactiver le compte',
                            icone: actif ? 'block' : 'check_circle',
                            teinteIcone: actif ? 'text-amber-600' : 'text-emerald-600',
                            action: 'basculer-statut',
                            onClick: () => onToggleStatus(m.id),
                          },
                          { libelle: 'Supprimer le compte', icone: 'delete', danger: true, action: 'supprimer', onClick: () => onDelete(m.id) },
                        ]} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 border-t border-neutral-200 bg-[#FAF8F6]">
          <p className="text-xs font-semibold text-slate-600 whitespace-nowrap">{compteur}</p>
          {onLienAcces && (
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[14px]">link</span>
              {'Lien d\'accès\u00a0: le membre choisit lui-même son mot de passe.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

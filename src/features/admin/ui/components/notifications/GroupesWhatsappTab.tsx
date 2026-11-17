import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import type { DestinatairesAnnonce } from '../../../domain/NotificationsModels';
import { DESTINATAIRES, libelleDestinataires } from './useNotificationsHub';
import { erreurLienGroupe, quandPartage, useGererGroupes, useGroupesWhatsapp, usePartagesWhatsapp } from './groupesWhatsappApi';

/*
 * Groupes WhatsApp de l'école (FEAT-007, 16/11) : l'école crée ses groupes dans WhatsApp et les déclare ici avec leur lien
 * d'invitation ; les annonces y sont ensuite partagées gratuitement (sans API WhatsApp payante), et les élèves et parents
 * voient dans leur espace le lien pour rejoindre les groupes qui les concernent.
 */

const champ = 'w-full px-3.5 py-2.5 border rounded-xl bg-white text-[13px] font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-none outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/10';
const libelle = 'block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1';

interface Classe { id: string; nom: string }

function lireClasses(data: unknown): Classe[] {
  const liste = Array.isArray(data) ? data : [];
  return liste.map((c: Record<string, unknown>) => ({ id: String(c.id ?? ''), nom: String(c.name ?? c.nom ?? c.id ?? '') })).filter(c => c.id);
}

export function GroupesWhatsappTab() {
  const groupes = useGroupesWhatsapp();
  const partages = usePartagesWhatsapp();
  const { creer, modifier, supprimer } = useGererGroupes();
  const classes = useQuery({ queryKey: ['admin', 'planning', 'classes', 'whatsapp'], queryFn: async () => lireClasses((await apiClient.get<unknown>('/admin/planning/classes')).data) });
  const [nom, setNom] = useState('');
  const [pub, setPub] = useState<DestinatairesAnnonce>('PARENTS');
  const [classeId, setClasseId] = useState('');
  const [lien, setLien] = useState('');
  const [erreurs, setErreurs] = useState<{ nom?: string; lien?: string; serveur?: string }>({});
  const [ok, setOk] = useState('');
  const parClasse = pub === 'ELEVES' || pub === 'PARENTS';

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk('');
    const err: typeof erreurs = {};
    if (!nom.trim()) err.nom = 'Donnez un nom au groupe (ex. « Parents — L1 Informatique »).';
    const erreurLien = erreurLienGroupe(lien);
    if (erreurLien) err.lien = erreurLien;
    setErreurs(err);
    if (err.nom || err.lien) return;
    try {
      const g = await creer.mutateAsync({ nom: nom.trim(), public: pub, classeId: parClasse && classeId ? classeId : null, lien: lien.trim() });
      setNom(''); setLien(''); setClasseId('');
      setOk(`Groupe « ${g.nom} » enregistré.`);
    } catch (ex) {
      setErreurs({ serveur: resolveErrorMessage(ex) });
    }
  };

  const retirer = async (id: string, n: string) => {
    if (!(await demanderConfirmation(`Retirer « ${n} » de l’application ? Le groupe WhatsApp lui-même n’est pas touché.`, { titre: 'Retirer le groupe', confirmer: 'Retirer' }))) return;
    supprimer.mutate(id);
  };

  return (
    <div className="space-y-6 text-xs text-[#4A5568]" id="groupes-whatsapp-tab">
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-emerald-900">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[22px] text-emerald-600 shrink-0">forum</span>
        <div className="space-y-1">
          <p className="text-sm font-black">Vos groupes WhatsApp, sans frais</p>
          <ol className="list-decimal pl-4 space-y-0.5 font-semibold text-[12px]">
            <li>Créez le groupe dans WhatsApp, puis copiez son lien : infos du groupe › <i>Inviter via un lien</i>.</li>
            <li>Enregistrez-le ici avec son public : les élèves et les parents concernés le verront dans leur espace pour le rejoindre.</li>
            <li>À l’envoi d’une annonce, cochez « WhatsApp », puis « Ouvrir le groupe » : le message est copié et la discussion du groupe s’ouvre ; collez-le et envoyez.</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={enregistrer} noValidate className="space-y-4 p-5 rounded-2xl border border-neutral-200 bg-white" id="groupe-whatsapp-form">
          <h3 className="text-sm font-black text-[#1E293B]">Enregistrer un groupe</h3>
          <div>
            <label htmlFor="gw-nom" className={libelle}>Nom du groupe <span className="text-red-500">*</span></label>
            <input id="gw-nom" value={nom} maxLength={120} onChange={e => { setNom(e.target.value); setErreurs(x => ({ ...x, nom: undefined })); }}
              placeholder="Ex. : Parents — L1 Informatique" className={`${champ} ${erreurs.nom ? 'border-red-400' : 'border-neutral-200'}`} aria-invalid={!!erreurs.nom} />
            {erreurs.nom && <p className="mt-1 text-[10px] text-red-600 font-semibold">{erreurs.nom}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="gw-public" className={libelle}>Membres du groupe</label>
              <select id="gw-public" value={pub} onChange={e => { setPub(e.target.value as DestinatairesAnnonce); setClasseId(''); }} className={`${champ} border-neutral-200 pr-8`}>
                {DESTINATAIRES.map(d => <option key={d.code} value={d.code}>{d.libelle}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="gw-classe" className={libelle}>Classe (facultatif)</label>
              <select id="gw-classe" value={classeId} onChange={e => setClasseId(e.target.value)} disabled={!parClasse}
                className={`${champ} border-neutral-200 pr-8 disabled:bg-neutral-50 disabled:text-neutral-400`}>
                <option value="">{parClasse ? 'Toutes les classes' : 'Sans objet'}</option>
                {parClasse && (classes.data ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="gw-lien" className={libelle}>Lien d’invitation <span className="text-red-500">*</span></label>
            <input id="gw-lien" value={lien} onChange={e => { setLien(e.target.value); setErreurs(x => ({ ...x, lien: undefined })); }}
              placeholder="https://chat.whatsapp.com/…" className={`${champ} ${erreurs.lien ? 'border-red-400' : 'border-neutral-200'}`} aria-invalid={!!erreurs.lien} />
            {erreurs.lien && <p className="mt-1 text-[10px] text-red-600 font-semibold">{erreurs.lien}</p>}
          </div>
          {erreurs.serveur && <p role="alert" className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-[11px] font-bold text-red-700">Groupe non enregistré : {erreurs.serveur}</p>}
          {ok && <p role="status" className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-800">{ok}</p>}
          <button type="submit" disabled={creer.isPending} id="gw-enregistrer"
            className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">add_link</span>
            {creer.isPending ? 'Enregistrement…' : 'Enregistrer le groupe'}
          </button>
        </form>

        <section className="space-y-3" aria-labelledby="gw-liste-titre">
          <h3 id="gw-liste-titre" className="text-sm font-black text-[#1E293B]">Groupes de l’école {groupes.data ? `(${groupes.data.length})` : ''}</h3>
          {groupes.isLoading ? <p className="text-neutral-400 font-bold">Chargement…</p>
            : groupes.isError ? (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-red-200 bg-red-50">
                <p className="text-red-700 font-semibold">Liste indisponible : {resolveErrorMessage(groupes.error)}</p>
                <button type="button" onClick={() => void groupes.refetch()} className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-[11px] font-black text-red-700 cursor-pointer">Réessayer</button>
              </div>
            )
            : (groupes.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-[12px] font-semibold text-neutral-500 border border-dashed border-neutral-300 rounded-2xl bg-[#FAF8F6]">Aucun groupe enregistré pour le moment.</p>
            ) : (
              <ul className="space-y-2" id="gw-liste">
                {(groupes.data ?? []).map(g => (
                  <li key={g.id} className={`p-3 rounded-xl border flex flex-wrap items-center gap-3 ${g.actif ? 'border-neutral-200 bg-white' : 'border-dashed border-neutral-200 bg-neutral-50 opacity-70'}`}>
                    <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px] text-emerald-600">groups</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-[13px] text-neutral-900">{g.nom}{!g.actif && <span className="ml-2 text-[10px] font-bold text-neutral-500">(désactivé)</span>}</p>
                      <p className="text-[11px] font-semibold text-neutral-500">{libelleDestinataires(g.public)}{g.classe ? ` · ${g.classe}` : ''}</p>
                    </div>
                    <a href={g.lien} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50">Ouvrir</a>
                    <button type="button" onClick={() => modifier.mutate({ id: g.id, actif: !g.actif })} className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                      {g.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                    <button type="button" onClick={() => void retirer(g.id, g.nom)} aria-label={`Retirer ${g.nom}`} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                      <span translate="no" className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>

      <section className="space-y-2" aria-labelledby="gw-historique-titre">
        <h3 id="gw-historique-titre" className="text-sm font-black text-[#1E293B]">Annonces partagées dans les groupes</h3>
        <p className="text-[11px] font-semibold text-neutral-500">L’heure est celle où WhatsApp a été ouvert avec le message prêt ; l’application ne peut pas savoir s’il a été envoyé.</p>
        {(partages.data ?? []).length === 0 ? <p className="text-[12px] font-semibold text-neutral-400">Aucun partage pour le moment.</p> : (
          <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl bg-white" id="gw-historique">
            {(partages.data ?? []).map(p => (
              <li key={p.id} className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-neutral-800">« {p.titre} » <span className="font-semibold text-neutral-500">dans {p.groupe}</span></span>
                <span className="text-[11px] font-semibold text-neutral-500">{quandPartage(p.partageLe)}{p.auteur ? ` · ${p.auteur}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

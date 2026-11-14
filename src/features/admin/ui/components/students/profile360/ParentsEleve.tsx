import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Parent lié à l'élève (GET/POST /admin/students/{id}/parents). */
interface ParentLie {
  parentId: string; nom: string | null; email: string | null; telephone: string | null;
  relation: string; relationLibelle: string; compteCree?: boolean; motDePasseProvisoire?: string;
}

const RELATIONS = [['MERE', 'Mère'], ['PERE', 'Père'], ['TUTEUR', 'Tuteur'], ['AUTRE', 'Autre']] as const;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Parents de l'élève (APP-BE-27, 2026-11-14). Avant : aucun écran ne créait de compte parent ni ne liait un parent à
 * son enfant ; l'espace parent restait vide en usage réel. Le compte d'un nouveau parent est créé avec un mot de passe
 * provisoire, affiché une seule fois ici ; un compte parent existant (autre enfant, autre école) est simplement lié.
 */
export function ParentsEleve({ eleveId, nomEleve }: { eleveId: string; nomEleve?: string }) {
  const [parents, setParents] = useState<ParentLie[] | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [relation, setRelation] = useState('');
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [identifiants, setIdentifiants] = useState<{ email: string; mdp: string } | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [aRetirer, setARetirer] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    setParents(null); setErreurChargement(''); setIdentifiants(null); setConfirmation('');
    let actif = true;
    apiClient.get<ParentLie[]>(`/admin/students/${eleveId}/parents`)
      .then(r => { if (actif) setParents(Array.isArray(r.data) ? r.data : []); })
      .catch(e => { if (actif) { setParents([]); setErreurChargement(resolveErrorMessage(e)); } });
    return () => { actif = false; };
  }, [eleveId]);

  const lier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurServeur(''); setConfirmation(''); setIdentifiants(null);
    const err: Record<string, string> = {};
    const mail = email.trim();
    if (!mail) err.email = "L'adresse e-mail du parent est obligatoire : elle lui sert d'identifiant de connexion.";
    else if (!EMAIL.test(mail)) err.email = `« ${mail} » n'est pas une adresse e-mail valide.`;
    if (!relation) err.relation = 'Choisissez le lien de parenté.';
    if (telephone.trim() && !/^\+?[0-9][0-9 .-]{6,18}[0-9]$/.test(telephone.trim())) {
      err.telephone = 'Numéro invalide : chiffres uniquement, indicatif facultatif (ex. +221 77 123 45 67).';
    }
    setErreurs(err);
    if (Object.keys(err).length) return;
    setEnvoi(true);
    try {
      const corps: Record<string, string> = { email: mail, relation };
      if (nom.trim()) corps.nom = nom.trim();
      if (telephone.trim()) corps.telephone = telephone.trim();
      const { data } = await apiClient.post<ParentLie>(`/admin/students/${eleveId}/parents`, corps);
      setParents(prev => [...(prev ?? []), data]);
      setEmail(''); setNom(''); setTelephone(''); setRelation('');
      if (data.compteCree && data.motDePasseProvisoire) {
        setIdentifiants({ email: data.email ?? mail, mdp: data.motDePasseProvisoire });
      }
      setConfirmation(`${data.nom ?? mail} est maintenant lié${nomEleve ? ` à ${nomEleve}` : ''} (${data.relationLibelle.toLowerCase()}).`);
    } catch (er) {
      setErreurServeur(resolveErrorMessage(er));   // rien n'a été enregistré
    } finally {
      setEnvoi(false);
    }
  };

  const retirer = async (parentId: string) => {
    setErreurServeur(''); setConfirmation('');
    try {
      await apiClient.delete(`/admin/students/${eleveId}/parents/${parentId}`);
      setParents(prev => (prev ?? []).filter(p => p.parentId !== parentId));
      setConfirmation('Lien retiré. Le compte du parent n\'est pas supprimé.');
    } catch (er) {
      setErreurServeur(resolveErrorMessage(er));
    } finally {
      setARetirer(null);
    }
  };

  const champ = 'w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none focus:border-primary';
  return (
    <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white" id="parents-eleve">
      <div className="bg-neutral-50 border-b border-neutral-100 px-3 py-2 flex items-center gap-1">
        <span translate="no" className="material-symbols-outlined text-neutral-400 text-sm">family_restroom</span>
        <span className="text-neutral-800 font-extrabold text-[11px] uppercase tracking-wider">Parents de l'élève</span>
      </div>
      <div className="p-3 space-y-3 text-xs">
        <div className="space-y-1.5" aria-live="polite">
          {erreurChargement ? (
            <p role="alert" className="text-red-600 font-semibold text-[11px]">Parents indisponibles : {erreurChargement}</p>
          ) : parents === null ? (
            <p className="text-neutral-400 italic text-[11px]">Chargement…</p>
          ) : parents.length === 0 ? (
            <p className="text-neutral-500 font-semibold text-[11px]">Aucun parent lié : l'espace parent restera vide tant qu'un parent n'est pas lié à cet élève.</p>
          ) : parents.map(p => (
            <div key={p.parentId} data-parent-id={p.parentId} className="flex items-center justify-between gap-2 p-2 bg-neutral-50 border border-neutral-100 rounded-lg">
              <div className="min-w-0">
                <p className="font-extrabold text-neutral-800 truncate">{p.nom ?? '—'} <span className="text-[9px] font-black uppercase text-neutral-400">{p.relationLibelle}</span></p>
                <p className="text-[10px] text-neutral-500 truncate">{p.email ?? '—'}{p.telephone ? ` · ${p.telephone}` : ''}</p>
              </div>
              {aRetirer === p.parentId ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => retirer(p.parentId)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black">Confirmer</button>
                  <button type="button" onClick={() => setARetirer(null)} className="px-2 py-1 rounded-lg bg-neutral-200 text-neutral-700 text-[10px] font-black">Annuler</button>
                </div>
              ) : (
                <button type="button" onClick={() => setARetirer(p.parentId)} className="shrink-0 px-2 py-1 rounded-lg border border-neutral-200 text-neutral-600 text-[10px] font-black hover:bg-white">Retirer le lien</button>
              )}
            </div>
          ))}
        </div>

        {identifiants && (
          <div id="parent-identifiants" role="status" className="p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-[11px] font-semibold space-y-0.5">
            <p className="font-black">Compte parent créé : transmettez ces identifiants au parent.</p>
            <p>Identifiant : <span className="font-mono">{identifiants.email}</span></p>
            <p>Mot de passe provisoire : <span className="font-mono">{identifiants.mdp}</span></p>
            <p className="text-[10px]">Il devra le changer à sa première connexion. Ce mot de passe ne sera plus affiché.</p>
          </div>
        )}
        {confirmation && <p role="status" className="text-emerald-700 font-bold text-[11px]">{confirmation}</p>}
        {erreurServeur && <p role="alert" className="text-red-600 font-bold text-[11px]">{erreurServeur}</p>}

        <form id="parent-form" onSubmit={lier} noValidate className="space-y-2 pt-2 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-500 font-semibold">Lier un parent : si son adresse correspond déjà à un compte parent (autre enfant, autre école), il est simplement lié ; sinon son compte est créé.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="parent-email" className="text-[9px] font-bold text-neutral-500 uppercase">E-mail du parent *</label>
              <input id="parent-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${champ} ${erreurs.email ? 'border-red-400' : 'border-neutral-200'}`} />
              {erreurs.email && <p className="text-[10px] text-red-600 font-semibold">{erreurs.email}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="parent-relation" className="text-[9px] font-bold text-neutral-500 uppercase">Lien de parenté *</label>
              <select id="parent-relation" value={relation} onChange={e => setRelation(e.target.value)} className={`${champ} bg-white ${erreurs.relation ? 'border-red-400' : 'border-neutral-200'}`}>
                <option value="">Choisir…</option>
                {RELATIONS.map(([code, lib]) => <option key={code} value={code}>{lib}</option>)}
              </select>
              {erreurs.relation && <p className="text-[10px] text-red-600 font-semibold">{erreurs.relation}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="parent-nom" className="text-[9px] font-bold text-neutral-500 uppercase">Prénom et nom (nouveau compte)</label>
              <input id="parent-nom" value={nom} onChange={e => setNom(e.target.value)} className={`${champ} border-neutral-200`} />
            </div>
            <div className="space-y-1">
              <label htmlFor="parent-telephone" className="text-[9px] font-bold text-neutral-500 uppercase">Téléphone (facultatif)</label>
              <input id="parent-telephone" value={telephone} onChange={e => setTelephone(e.target.value)} className={`${champ} ${erreurs.telephone ? 'border-red-400' : 'border-neutral-200'}`} />
              {erreurs.telephone && <p className="text-[10px] text-red-600 font-semibold">{erreurs.telephone}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={envoi} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-60">
              {envoi ? 'Enregistrement…' : 'Lier ce parent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

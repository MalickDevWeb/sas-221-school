import React, { useEffect, useMemo, useState } from 'react';
import { useRbacStore } from '@/core/store/rbacStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  onShowToast: (msg: string, success: boolean) => void;
}

/**
 * Droits d'accès du personnel (2026-11-13) : matrice enregistrée sur le serveur et APPLIQUÉE par lui. Chaque
 * permission correspond à un module réel de l'espace administration (consulter ou modifier). L'administrateur a
 * toujours tous les droits ; enseignants, vigiles, élèves et parents gardent leur propre espace.
 */
export function RbacTab({ onShowToast }: Props) {
  const { catalogue, roles, brouillon, matrice, chargement, charger, basculer, tout, annulerBrouillon, enregistrer, reinitialiser } = useRbacStore();
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [categorie, setCategorie] = useState('Toutes');
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    charger().catch((e) => setErreur(resolveErrorMessage(e)));
  }, [charger]);

  const categories = useMemo(() => ['Toutes', ...Array.from(new Set(catalogue.map((p) => p.category)))], [catalogue]);
  const visibles = useMemo(() => catalogue.filter((p) => {
    const q = recherche.trim().toLowerCase();
    return (categorie === 'Toutes' || p.category === categorie)
      && (!q || p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.endpoint.toLowerCase().includes(q));
  }), [catalogue, categorie, recherche]);

  const modifie = roles.some((r) => [...(brouillon[r.code] ?? [])].sort().join('|') !== [...(matrice[r.code] ?? [])].sort().join('|'));

  const handleSave = async () => {
    setEnCours(true);
    try {
      const faits = await enregistrer();
      onShowToast(faits.length ? `Droits enregistrés et appliqués par le serveur (${faits.length} rôle${faits.length > 1 ? 's' : ''}).` : 'Aucune modification à enregistrer.', true);
    } catch (e) {
      onShowToast(`Droits non enregistrés : ${resolveErrorMessage(e)}`, false);
    } finally {
      setEnCours(false);
    }
  };

  const handleReset = async (code: string, libelle: string) => {
    try {
      await reinitialiser(code);
      onShowToast(`Droits par défaut rétablis pour ${libelle}.`, true);
    } catch (e) {
      onShowToast(`Réinitialisation impossible : ${resolveErrorMessage(e)}`, false);
    }
  };

  if (erreur) {
    return <p role="alert" id="rbac-erreur" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">Droits d'accès indisponibles : {erreur}</p>;
  }

  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="rbac-tab-root">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">security</span>
            <h3 className="font-black text-base text-[#1E293B] tracking-tight">Droits d'accès du personnel</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
              {catalogue.length} permissions
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium mt-0.5 max-w-2xl">
            Appliqués par le serveur à chaque requête : un membre du personnel n'accède qu'aux modules cochés pour son rôle.
            L'administrateur a toujours tous les droits ; enseignants, vigiles, élèves et parents gardent leur propre espace.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={annulerBrouillon} disabled={!modifie || enCours}
            className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-black rounded-xl cursor-pointer border border-neutral-200 disabled:opacity-50">
            Annuler les modifications
          </button>
          <button type="button" id="rbac-enregistrer" onClick={handleSave} disabled={!modifie || enCours}
            className="px-4 py-2 bg-primary hover:bg-[#921316] text-white text-xs font-black rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 border-0 disabled:opacity-50">
            <span translate="no" className="material-symbols-outlined text-sm font-black">save</span>
            <span>{enCours ? 'Enregistrement…' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#FAF8F6] p-3.5 rounded-2xl border border-neutral-200/80 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Rechercher un module…" value={recherche} onChange={(e) => setRecherche(e.target.value)}
          className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-primary" />
        <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {chargement && catalogue.length === 0 ? (
        <p className="text-neutral-500 font-medium">Chargement des droits…</p>
      ) : (
        <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse" id="rbac-matrice">
              <thead className="sticky top-0 bg-[#FAF8F6] z-10 border-b border-neutral-200">
                <tr className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5 min-w-[260px]">Permission</th>
                  {roles.map((r) => (
                    <th key={r.code} className="px-3 py-3.5 text-center min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[#1E293B] font-black">{r.libelle}</span>
                        <span className="text-[9px] text-neutral-400 font-semibold lowercase">({(brouillon[r.code] ?? []).length} accordées)</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <button type="button" onClick={() => tout(r.code, visibles.map((p) => p.key), true)} className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-emerald-50 text-neutral-600 rounded cursor-pointer border border-neutral-200">+ Tous</button>
                          <button type="button" onClick={() => tout(r.code, visibles.map((p) => p.key), false)} className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-rose-50 text-neutral-600 rounded cursor-pointer border border-neutral-200">- Aucun</button>
                          <button type="button" onClick={() => handleReset(r.code, r.libelle)} title="Revenir aux droits par défaut" className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-amber-50 text-neutral-600 rounded cursor-pointer border border-neutral-200">Défaut</button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600 text-xs">
                {visibles.length === 0 ? (
                  <tr><td colSpan={1 + roles.length} className="px-6 py-12 text-center text-neutral-400 font-medium">Aucune permission ne correspond aux filtres.</td></tr>
                ) : visibles.map((p) => (
                  <tr key={p.key} className="hover:bg-neutral-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border shrink-0 mt-0.5 ${p.method === 'LECTURE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{p.method}</span>
                        <div>
                          <div className="text-[#1E293B] font-extrabold text-xs">{p.label}</div>
                          <div className="text-[10px] text-neutral-500 font-medium mt-0.5">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    {roles.map((r) => (
                      <td key={r.code} className="px-3 py-3 text-center">
                        <input type="checkbox" aria-label={`${p.label} — ${r.libelle}`} data-role={r.code} data-permission={p.key}
                          checked={(brouillon[r.code] ?? []).includes(p.key)} onChange={() => basculer(r.code, p.key)}
                          className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

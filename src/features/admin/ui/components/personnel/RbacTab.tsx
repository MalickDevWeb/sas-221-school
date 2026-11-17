import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRbacStore, type PermissionCatalogue } from '@/core/store/rbacStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useEcranLarge } from '@/shared/components/SousMenuModule';

interface Props {
  onShowToast: (msg: string, success: boolean) => void;
}

/** Sections du menu de l'administration (menuAdmin.ts), par module du catalogue du serveur (CataloguePermissions). */
const SECTION_DU_MODULE: Record<string, string> = {
  eleves: 'Scolarité', admissions: 'Scolarité', transferts: 'Scolarité',
  planning: 'Pédagogie', collaboration: 'Pédagogie',
  personnel: 'Équipe',
  finances: 'Finances',
  communication: 'Communication',
  ecole: 'Paramètres', securite: 'Paramètres',
};
const ORDRE_SECTIONS = ['Scolarité', 'Pédagogie', 'Équipe', 'Finances', 'Communication', 'Paramètres', 'Autres'];
const sectionDe = (p: PermissionCatalogue) => SECTION_DU_MODULE[p.key.split('.')[0]] ?? 'Autres';
/** « Modifier — Élèves » → « Élèves » (le type d'accès est affiché à part). */
const nomModule = (p: PermissionCatalogue) => p.label.replace(/^(Consulter|Modifier)\s+—\s+/, '');
const ecriture = (p: PermissionCatalogue) => p.method !== 'LECTURE';

/**
 * Droits d'accès du personnel : matrice enregistrée sur le serveur et APPLIQUÉE par lui. Chaque droit
 * correspond à un module réel de l'espace administration (consulter ou modifier). Mise en page : colonne des
 * modules fixe à gauche, groupes par section du menu, actions de chaque rôle dans un petit menu « ⋯ ».
 */
export function RbacTab({ onShowToast }: Props) {
  const { catalogue, roles, brouillon, matrice, chargement, charger, basculer, tout, annulerBrouillon, enregistrer, reinitialiser } = useRbacStore();
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [section, setSection] = useState('Toutes');
  const [enCours, setEnCours] = useState(false);
  const [menuRole, setMenuRole] = useState<string | null>(null);
  const large = useEcranLarge();

  useEffect(() => {
    charger().catch((e) => setErreur(resolveErrorMessage(e)));
  }, [charger]);

  const sections = useMemo(() => ORDRE_SECTIONS.filter(s => catalogue.some(p => sectionDe(p) === s)), [catalogue]);
  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return catalogue.filter((p) => (section === 'Toutes' || sectionDe(p) === section)
      && (!q || p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
  }, [catalogue, section, recherche]);
  const groupes = useMemo(() => sections
    .map(s => ({ titre: s, droits: visibles.filter(p => sectionDe(p) === s) }))
    .filter(g => g.droits.length > 0), [sections, visibles]);

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
    setMenuRole(null);
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

  const nbAccordes = (code: string) => (brouillon[code] ?? []).length;
  const case_ = (p: PermissionCatalogue, code: string, libelle: string) => (
    <input type="checkbox" aria-label={`${p.label} — ${libelle}`} data-role={code} data-permission={p.key}
      checked={(brouillon[code] ?? []).includes(p.key)} onChange={() => basculer(code, p.key)}
      className="w-4 h-4 rounded border-neutral-300 accent-primary cursor-pointer" />
  );
  const badgeAcces = (p: PermissionCatalogue) => (
    <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-black rounded border ${ecriture(p) ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
      {ecriture(p) ? 'Modifier' : 'Consulter'}
    </span>
  );
  const menuActions = (code: string, libelle: string) => (
    <MenuRole ouvert={menuRole === code} onOuvrir={(o) => setMenuRole(o ? code : null)} libelle={libelle}
      onTout={() => { tout(code, visibles.map((p) => p.key), true); setMenuRole(null); }}
      onRien={() => { tout(code, visibles.map((p) => p.key), false); setMenuRole(null); }}
      onDefaut={() => void handleReset(code, libelle)} filtre={visibles.length !== catalogue.length} />
  );

  return (
    <div className="space-y-4 text-xs text-[#4A5568]" id="rbac-tab-root">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-neutral-200/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-xl">key</span>
            <h3 className="font-black text-base text-[#1E293B] tracking-tight">Droits d'accès du personnel</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">{catalogue.length} droits</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium mt-0.5 max-w-2xl">
            Le serveur applique ces droits à chaque action : chacun ne voit que les modules cochés pour son rôle. L'administrateur a toujours tous les droits.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {modifie && (
            <button type="button" onClick={annulerBrouillon} disabled={enCours}
              className="px-2.5 py-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50">
              Annuler les modifications
            </button>
          )}
          {!modifie && <span id="rbac-aucune-modif" className="text-[11px] text-neutral-400 font-semibold">Aucune modification à enregistrer</span>}
          <button type="button" id="rbac-enregistrer" onClick={handleSave} disabled={!modifie || enCours}
            aria-describedby={!modifie ? 'rbac-aucune-modif' : undefined}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-on-primary text-xs font-black rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5 border-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">save</span>
            <span>{enCours ? 'Enregistrement…' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input type="search" placeholder="Rechercher un module…" aria-label="Rechercher un module" value={recherche} onChange={(e) => setRecherche(e.target.value)}
          className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 outline-none focus:border-primary" />
        <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Section"
          className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold outline-none focus:border-primary">
          <option value="Toutes">Toutes les sections</option>
          {sections.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {chargement && catalogue.length === 0 ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2, 3, 4].map(i => <div key={i} className="h-10 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : visibles.length === 0 ? (
        <p className="py-10 text-center text-neutral-500 font-semibold">Aucun module ne correspond aux filtres.</p>
      ) : large ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden">
          <div className="overflow-auto max-h-[640px]">
            <table className="w-full text-left border-separate border-spacing-0" id="rbac-matrice">
              <thead>
                <tr className="text-[10px] font-black text-neutral-500">
                  <th className="sticky top-0 left-0 z-30 bg-[#FAF8F6] border-b border-r border-neutral-200 px-4 py-3 min-w-[300px] w-[300px] uppercase tracking-wider">Module</th>
                  {roles.map((r) => (
                    <th key={r.code} className="sticky top-0 z-20 bg-[#FAF8F6] border-b border-neutral-200 px-2 py-2.5 text-center min-w-[118px] align-top">
                      <div className="flex items-start justify-center gap-0.5">
                        <div className="min-w-0">
                          <span className="block text-[11px] text-[#1E293B] font-black leading-tight">{r.libelle}</span>
                          <span className="block text-[9px] text-neutral-400 font-semibold mt-0.5">{nbAccordes(r.code)} accordé{nbAccordes(r.code) > 1 ? 's' : ''}</span>
                        </div>
                        {menuActions(r.code, r.libelle)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs">
                {groupes.map((g) => (
                  <Fragment key={g.titre}>
                    <tr>
                      <th scope="colgroup" className="sticky left-0 z-10 bg-white px-4 pt-4 pb-1.5 text-left text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400 border-r border-neutral-200">{g.titre}</th>
                      <td colSpan={roles.length} className="bg-white" />
                    </tr>
                    {g.droits.map((p) => (
                      <tr key={p.key} className="group">
                        <th scope="row" className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50 border-t border-r border-neutral-100 border-r-neutral-200 px-4 py-2.5 text-left font-normal">
                          <div className="flex items-start gap-2">
                            {badgeAcces(p)}
                            <div className="min-w-0">
                              <div className="text-[#1E293B] font-extrabold text-xs">{nomModule(p)}</div>
                              <div className="text-[10px] text-neutral-500 font-medium mt-0.5 leading-snug">{p.description}</div>
                            </div>
                          </div>
                        </th>
                        {roles.map((r) => (
                          <td key={r.code} className="border-t border-neutral-100 group-hover:bg-neutral-50 px-2 py-2.5 text-center align-middle">
                            {case_(p, r.code, r.libelle)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Écran étroit : une carte par rôle (mêmes cases, mêmes identifiants : un seul affichage à la fois)
        <div className="space-y-3" id="rbac-matrice">
          {roles.map((r) => (
            <section key={r.code} className="bg-white border border-neutral-200 rounded-2xl">
              <div className="px-3.5 py-2.5 border-b border-neutral-100 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black text-[#1E293B]">{r.libelle}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold">{nbAccordes(r.code)} droit{nbAccordes(r.code) > 1 ? 's' : ''} accordé{nbAccordes(r.code) > 1 ? 's' : ''}</p>
                </div>
                {menuActions(r.code, r.libelle)}
              </div>
              {groupes.map((g) => (
                <div key={g.titre} className="px-3.5 py-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400 pb-1">{g.titre}</p>
                  {g.droits.map((p) => (
                    <label key={p.key} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                      {case_(p, r.code, r.libelle)}
                      <span className="flex-1 min-w-0 text-xs font-bold text-neutral-800">{nomModule(p)}</span>
                      {badgeAcces(p)}
                    </label>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Menu « ⋯ » d'un rôle : tout accorder, tout retirer, revenir aux droits par défaut. */
function MenuRole({ ouvert, onOuvrir, libelle, onTout, onRien, onDefaut, filtre }: {
  ouvert: boolean; onOuvrir: (o: boolean) => void; libelle: string; filtre: boolean;
  onTout: () => void; onRien: () => void; onDefaut: () => void;
}) {
  const racine = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: PointerEvent) => { if (racine.current && !racine.current.contains(e.target as Node)) onOuvrir(false); };
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') onOuvrir(false); };
    document.addEventListener('pointerdown', clic);
    document.addEventListener('keydown', touche);
    return () => { document.removeEventListener('pointerdown', clic); document.removeEventListener('keydown', touche); };
  }, [ouvert, onOuvrir]);
  const item = 'w-full text-left px-3 py-2 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center gap-2';
  return (
    <div className="relative shrink-0" ref={racine}>
      <button type="button" onClick={() => onOuvrir(!ouvert)} aria-expanded={ouvert} aria-haspopup="menu" aria-label={`Actions pour ${libelle}`}
        className="h-6 w-6 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 flex items-center justify-center cursor-pointer">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">more_horiz</span>
      </button>
      {ouvert && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-40 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 text-left normal-case tracking-normal">
          <button type="button" role="menuitem" onClick={onTout} className={item}>
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px] text-emerald-600">done_all</span>Tout accorder{filtre ? ' (modules affichés)' : ''}
          </button>
          <button type="button" role="menuitem" onClick={onRien} className={item}>
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px] text-red-500">remove_done</span>Tout retirer{filtre ? ' (modules affichés)' : ''}
          </button>
          <button type="button" role="menuitem" onClick={onDefaut} className={`${item} border-t border-neutral-100`}>
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px] text-amber-600">restart_alt</span>Revenir aux droits par défaut
          </button>
        </div>
      )}
    </div>
  );
}

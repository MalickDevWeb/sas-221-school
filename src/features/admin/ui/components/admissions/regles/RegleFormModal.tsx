import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChoixPays } from '@/shared/components/ChoixPays';
import {
  CHAMPS, EFFETS, LIBELLES_FORMATS, ORDRE_CHAMPS, conditionVide, libelleOperateur, resumeConditions, resumeEffet,
  type Champ, type Condition, type Formats, type Regle, type TypeEffet,
} from './reglesModele';

interface Props {
  /** Règle à modifier, ou nouvelle règle. */
  regle: Regle;
  sessions: { id: string; titre: string }[];
  onFermer: () => void;
  /** Renvoie le message d'erreur du serveur, ou null si la règle est enregistrée. */
  onEnregistrer: (r: Regle) => Promise<string | null>;
}

const champCls = 'w-full h-10 px-3 border border-neutral-200 rounded-xl bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 aria-[invalid=true]:border-rose-400';
const etiquette = 'block text-[11px] font-black uppercase tracking-wide text-neutral-500 mb-1';

/** Valeur par défaut d'une condition quand on change de champ. */
function valeurInitiale(champ: Champ): string {
  const def = CHAMPS[champ];
  if (def.type === 'pays') return 'SN';
  if (def.type === 'liste') return def.valeurs?.[0]?.[0] ?? '';
  return '';
}

/**
 * Création / modification d'une règle d'admission : SI condition(s) ALORS effet. Contrôles immédiats sous les
 * champs ; le serveur revalide tout et son refus (400) s'affiche en bas du formulaire, qui reste ouvert.
 */
export function RegleFormModal({ regle, sessions, onFermer, onEnregistrer }: Props) {
  const [r, setR] = useState<Regle>(regle);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const premierChamp = useRef<HTMLInputElement>(null);
  useEffect(() => { premierChamp.current?.focus(); }, []);

  const majCondition = (i: number, c: Partial<Condition>) =>
    setR((p) => ({ ...p, conditions: p.conditions.map((x, j) => (j === i ? { ...x, ...c } : x)) }));
  const changerChamp = (i: number, champ: Champ) =>
    majCondition(i, { champ, operateur: CHAMPS[champ].operateurs[0], valeur: valeurInitiale(champ) });
  const changerEffet = (type: TypeEffet) =>
    setR((p) => ({ ...p, effet: type === 'EXIGER_PIECE'
      ? { type, libelle: p.effet.libelle ?? '', formats: p.effet.formats ?? 'PDF_IMAGE' }
      : { type, message: p.effet.message ?? '' } }));

  const valider = (): boolean => {
    const e: Record<string, string> = {};
    if (!r.nom.trim()) e.nom = 'Donnez un nom à la règle (ex. : « Passeport pour les candidats étrangers »).';
    r.conditions.forEach((c, i) => {
      const def = CHAMPS[c.champ];
      if (!c.valeur.trim()) e[`valeur-${i}`] = 'Indiquez une valeur.';
      else if (def.type === 'nombre') {
        const n = Number(c.valeur);
        if (!Number.isInteger(n) || n < (def.min ?? 0) || n > (def.max ?? 9999)) e[`valeur-${i}`] = `Nombre entre ${def.min} et ${def.max}.`;
      }
    });
    if (r.effet.type === 'EXIGER_PIECE' && !r.effet.libelle?.trim()) e.effet = 'Indiquez la pièce à exiger (ex. : « Passeport »).';
    if (r.effet.type !== 'EXIGER_PIECE' && !r.effet.message?.trim()) {
      e.effet = r.effet.type === 'BLOQUER' ? 'Écrivez le message que lira le candidat.' : "Écrivez le message affiché à l'administration.";
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  // Après une première tentative, les messages suivent la saisie (un champ corrigé perd aussitôt son message)
  const [tente, setTente] = useState(false);
  useEffect(() => { if (tente) valider(); }, [r]);   // eslint-disable-line react-hooks/exhaustive-deps

  const enregistrer = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErreurServeur('');
    setTente(true);
    if (!valider()) return;
    setEnvoi(true);
    const message = await onEnregistrer({ ...r, nom: r.nom.trim() });
    setEnvoi(false);
    if (message) setErreurServeur(message);
  };

  const erreur = (cle: string) => erreurs[cle] && (
    <p id={`regle-${cle}-erreur`} role="alert" className="mt-1 text-[11px] font-semibold text-rose-700">{erreurs[cle]}</p>
  );
  const aria = (cle: string) => (erreurs[cle] ? { 'aria-invalid': true as const, 'aria-describedby': `regle-${cle}-erreur` } : {});

  return createPortal(
    <div id="regle-form" role="dialog" aria-modal="true" aria-labelledby="regle-form-titre"
      className="fixed inset-0 z-[1100] bg-[#0F172A]/40 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onKeyDown={(e) => { if (e.key === 'Escape' && !envoi) { e.stopPropagation(); onFermer(); } }}>
      <form onSubmit={enregistrer} noValidate className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl my-auto">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-3">
          <h3 id="regle-form-titre" className="text-sm font-black text-slate-900 flex items-center gap-2 m-0">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-xl">rule</span>
            {regle.id ? 'Modifier la règle' : 'Nouvelle règle'}
          </h3>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="h-8 w-8 rounded-lg text-slate-500 hover:bg-neutral-100 flex items-center justify-center border-0 bg-transparent cursor-pointer">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[calc(100vh-180px)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="regle-nom" className={etiquette}>Nom de la règle</label>
              <input ref={premierChamp} id="regle-nom" className={champCls} value={r.nom} maxLength={120}
                placeholder="ex. : Passeport pour les candidats étrangers" {...aria('nom')}
                onChange={(e) => setR({ ...r, nom: e.target.value })} />
              {erreur('nom')}
            </div>
            <div>
              <label htmlFor="regle-session" className={etiquette}>S'applique à</label>
              <select id="regle-session" className={champCls} value={r.session ?? ''} onChange={(e) => setR({ ...r, session: e.target.value || null })}>
                <option value="">Toutes les sessions</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>Session « {s.titre} »</option>)}
                {r.session && !sessions.some((s) => s.id === r.session) && <option value={r.session}>Session supprimée</option>}
              </select>
            </div>
          </div>

          {/* SI */}
          <fieldset className="border border-neutral-200 rounded-2xl p-4 space-y-3">
            <legend className="px-1.5 text-xs font-black text-primary">SI</legend>
            {r.conditions.length === 0 && (
              <p className="text-[11px] font-semibold text-neutral-500 m-0">Aucune condition : la règle s'applique à tous les dossiers de la session choisie.</p>
            )}
            {r.conditions.map((c, i) => {
              const def = CHAMPS[c.champ];
              return (
                <div key={i} className="space-y-1">
                  {i > 0 && <p className="text-[10px] font-black text-neutral-400 m-0">ET</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1.4fr_auto] gap-2 items-start">
                    <select aria-label={`Condition ${i + 1} : information`} className={champCls} value={c.champ} onChange={(e) => changerChamp(i, e.target.value as Champ)}>
                      {ORDRE_CHAMPS.map((ch) => <option key={ch} value={ch}>{CHAMPS[ch].libelle}</option>)}
                    </select>
                    <select aria-label={`Condition ${i + 1} : comparaison`} className={champCls} value={c.operateur}
                      onChange={(e) => majCondition(i, { operateur: e.target.value as Condition['operateur'] })}>
                      {def.operateurs.map((op) => <option key={op} value={op}>{libelleOperateur(c.champ, op)}</option>)}
                    </select>
                    <div>
                      {def.type === 'pays' ? (
                        <ChoixPays aria-label={`Condition ${i + 1} : pays`} className={champCls} value={c.valeur} {...aria(`valeur-${i}`)}
                          onChange={(e) => majCondition(i, { valeur: e.target.value })} />
                      ) : def.type === 'liste' ? (
                        <select aria-label={`Condition ${i + 1} : valeur`} className={champCls} value={c.valeur} onChange={(e) => majCondition(i, { valeur: e.target.value })}>
                          {def.valeurs?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input type="number" inputMode="numeric" aria-label={`Condition ${i + 1} : valeur`} className={champCls} value={c.valeur}
                            min={def.min} max={def.max} {...aria(`valeur-${i}`)} onChange={(e) => majCondition(i, { valeur: e.target.value })} />
                          {def.suffixe && <span className="text-xs font-bold text-neutral-500">{def.suffixe}</span>}
                        </div>
                      )}
                      {erreur(`valeur-${i}`)}
                    </div>
                    <button type="button" aria-label={`Retirer la condition ${i + 1}`} title="Retirer"
                      onClick={() => setR({ ...r, conditions: r.conditions.filter((_, j) => j !== i) })}
                      className="h-10 w-10 rounded-xl border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer bg-white">
                      <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {r.conditions.length < 10 && (
              <button type="button" id="regle-ajouter-condition" onClick={() => setR({ ...r, conditions: [...r.conditions, conditionVide()] })}
                className="text-xs font-black text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 flex items-center gap-1">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span>
                Ajouter une condition
              </button>
            )}
          </fieldset>

          {/* ALORS */}
          <fieldset className="border border-neutral-200 rounded-2xl p-4 space-y-3">
            <legend className="px-1.5 text-xs font-black text-primary">ALORS</legend>
            <div role="radiogroup" aria-label="Effet de la règle" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EFFETS.map((e) => {
                const actif = r.effet.type === e.type;
                return (
                  <button key={e.type} type="button" role="radio" aria-checked={actif} onClick={() => changerEffet(e.type)}
                    className={`text-left p-3 rounded-xl border cursor-pointer transition-colors ${actif ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[18px] ${actif ? 'text-primary' : 'text-neutral-400'}`}>{e.icone}</span>
                      {e.titre}
                    </span>
                    <span className="block text-[10.5px] font-semibold text-neutral-500 mt-1 leading-snug">{e.aide}</span>
                  </button>
                );
              })}
            </div>
            {r.effet.type === 'EXIGER_PIECE' ? (
              <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-2">
                <div>
                  <label htmlFor="regle-piece" className={etiquette}>Pièce exigée</label>
                  <input id="regle-piece" className={champCls} value={r.effet.libelle ?? ''} maxLength={80} placeholder="ex. : Passeport"
                    {...aria('effet')} onChange={(e) => setR({ ...r, effet: { ...r.effet, libelle: e.target.value } })} />
                </div>
                <div>
                  <label htmlFor="regle-formats" className={etiquette}>Format accepté</label>
                  <select id="regle-formats" className={champCls} value={r.effet.formats ?? 'PDF_IMAGE'}
                    onChange={(e) => setR({ ...r, effet: { ...r.effet, formats: e.target.value as Formats } })}>
                    {(Object.keys(LIBELLES_FORMATS) as Formats[]).map((f) => <option key={f} value={f}>{LIBELLES_FORMATS[f]}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="regle-message" className={etiquette}>
                  {r.effet.type === 'BLOQUER' ? 'Message lu par le candidat' : "Message affiché sur le dossier (administration)"}
                </label>
                <textarea id="regle-message" rows={2} maxLength={300} className={`${champCls} h-auto py-2`} value={r.effet.message ?? ''}
                  placeholder={r.effet.type === 'BLOQUER' ? 'ex. : Cette session est réservée aux bacheliers des séries S.' : 'ex. : Vérifier l’autorisation parentale.'}
                  {...aria('effet')} onChange={(e) => setR({ ...r, effet: { ...r.effet, message: e.target.value } })} />
              </div>
            )}
            {erreur('effet')}
          </fieldset>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={r.actif} onChange={(e) => setR({ ...r, actif: e.target.checked })} className="w-4 h-4 accent-[var(--color-primary,#8F1316)]" />
            Règle active (appliquée aux nouveaux dossiers)
          </label>

          <p className="text-[11px] font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3 m-0" aria-live="polite">
            <span className="font-black text-primary">SI</span> {resumeConditions(r)}{' '}
            <span className="font-black text-primary">ALORS</span> {resumeEffet(r.effet).replace('«  »', '« … »')}
          </p>
          {erreurServeur && <p role="alert" className="text-xs font-bold text-rose-700 m-0">{erreurServeur}</p>}
        </div>

        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
          <button type="button" onClick={onFermer} disabled={envoi} className="px-4 py-2 rounded-xl text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 bg-white cursor-pointer">
            Annuler
          </button>
          <button type="submit" disabled={envoi} className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-white border-0 hover:opacity-90 cursor-pointer disabled:opacity-50">
            {envoi ? 'Enregistrement…' : 'Enregistrer la règle'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

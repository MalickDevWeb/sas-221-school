import React, { useState } from 'react';
import { X } from 'lucide-react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { afficherErreur, effacerErreur } from '@/shared/lib/validationPersonnalisee';

export interface ChampEdition {
  readonly nom: string;
  readonly libelle: string;
  readonly type?: 'text' | 'textarea' | 'select' | 'date' | 'checkbox' | 'url' | 'number';
  readonly valeur: string | boolean;
  readonly obligatoire?: boolean;
  readonly options?: readonly { readonly valeur: string; readonly libelle: string }[];
  readonly min?: string;
  readonly aide?: string;
  /** message d'erreur personnalisé si la valeur est refusée, sinon null */
  readonly verifier?: (valeur: string) => string | null;
}

interface Props {
  readonly titre: string;
  readonly champs: readonly ChampEdition[];
  /** doit appeler le serveur ; la fenêtre ne se ferme qu'après sa réussite */
  readonly onEnregistrer: (valeurs: Record<string, string | boolean>) => Promise<void>;
  readonly onFermer: () => void;
}

/** Fenêtre de modification générique (validation personnalisée, erreur du serveur affichée telle quelle). */
export function FormulaireEdition({ titre, champs, onEnregistrer, onFermer }: Props) {
  const [valeurs, setValeurs] = useState<Record<string, string | boolean>>(
    () => Object.fromEntries(champs.map((c) => [c.nom, c.valeur])),
  );
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const soumettre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;
    for (const c of champs) {
      if (c.type === 'checkbox') continue;
      const v = String(valeurs[c.nom] ?? '').trim();
      const el = form.querySelector<HTMLInputElement>(`[name="${c.nom}"]`);
      const msg = c.obligatoire && !v ? `Ce champ est obligatoire : ${c.libelle.toLowerCase()}.` : (v && c.verifier ? c.verifier(v) : null);
      if (msg) {
        if (el) { afficherErreur(el, msg); el.focus(); }
        return;
      }
      if (el) effacerErreur(el);
    }
    setEnvoi(true);
    setErreur(null);
    try {
      await onEnregistrer(valeurs);
      onFermer();
    } catch (err) {
      setErreur(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  const classe = 'w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs';
  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4" onClick={onFermer}>
      <form noValidate onSubmit={soumettre} onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-black text-neutral-800">{titre}</h3>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="p-1 rounded-lg hover:bg-neutral-100"><X className="w-4 h-4" /></button>
        </div>
        {champs.map((c) => (
          <label key={c.nom} className="block space-y-1">
            {c.type === 'checkbox' ? (
              <span className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                <input type="checkbox" name={c.nom} checked={Boolean(valeurs[c.nom])}
                  onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.checked }))} />
                {c.libelle}
              </span>
            ) : (
              <>
                <span className="text-[10px] font-black uppercase text-neutral-500">{c.libelle}{c.obligatoire ? ' *' : ''}</span>
                {c.type === 'textarea' ? (
                  <textarea name={c.nom} value={String(valeurs[c.nom] ?? '')} rows={4} className={classe}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))} />
                ) : c.type === 'select' ? (
                  <select name={c.nom} value={String(valeurs[c.nom] ?? '')} className={classe}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))}>
                    {(c.options || []).map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
                  </select>
                ) : (
                  <input name={c.nom} type={c.type === 'date' ? 'date' : c.type === 'number' ? 'number' : 'text'} min={c.min}
                    value={String(valeurs[c.nom] ?? '')} className={classe}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))} />
                )}
              </>
            )}
            {c.aide && <span className="block text-[10px] text-neutral-400">{c.aide}</span>}
          </label>
        ))}
        {erreur && <p role="alert" className="erreur-champ text-xs">{erreur}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 rounded-xl text-xs font-black text-neutral-500 hover:bg-neutral-100">Annuler</button>
          <button type="submit" disabled={envoi} className="px-4 py-2 rounded-xl bg-brand-red-deep text-white text-xs font-black disabled:opacity-50">
            {envoi ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export const verifierLien = (v: string) => (/^https?:\/\/\S+$/i.test(v) ? null : 'Le lien doit commencer par http:// ou https://.');

import React, { useState } from 'react';
import { toast } from 'sonner';
import { referentielApi } from '../infrastructure/referentielApi';
import { referentielErrorMessage } from '../hooks/useReferentiel';
import { ChoixTeinte } from './ChoixTeinte';
import type { ReferentielSlug } from '../domain/ReferentielModels';

interface Props {
  slug: ReferentielSlug;
  onCreated: () => void;
}

/** Ajout d'une valeur propre à l'école (listes ouvertes uniquement). Le code interne est déduit du libellé par le serveur. */
export function ReferentielAddForm({ slug, onCreated }: Props) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('slate');
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const trimmed = label.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      setErreur(trimmed ? 'Le libellé doit compter entre 2 et 80 caractères.' : 'Écrivez le libellé de la nouvelle valeur.');
      return;
    }
    setBusy(true);
    setErreur('');
    try {
      await referentielApi.create(slug, { label: trimmed, color });
      toast.success(`« ${trimmed} » ajoutée à la liste.`);
      setLabel('');
      onCreated();
    } catch (err) {
      setErreur(referentielErrorMessage(err, 'Ajout refusé.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-1.5" id="referentiel-ajout">
      <label htmlFor="referentiel-nouveau" className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">Nouvelle valeur</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input id="referentiel-nouveau" value={label} onChange={e => { setLabel(e.target.value); setErreur(''); }} maxLength={80} disabled={busy}
          placeholder="Ex. : Transport scolaire" aria-invalid={erreur ? true : undefined} aria-describedby={erreur ? 'referentiel-nouveau-erreur' : undefined}
          className={`flex-1 min-w-0 px-3 py-1.5 border rounded-lg bg-white text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-medium outline-none focus:border-primary ${erreur ? 'border-red-400' : 'border-neutral-200'}`} />
        <ChoixTeinte valeur={color} onChange={setColor} disabled={busy} libelle="Couleur de la nouvelle valeur" />
        <button type="submit" disabled={busy}
          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-on-primary text-xs font-black flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span>
          {busy ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
      {erreur && <p id="referentiel-nouveau-erreur" className="text-[10px] text-red-600 font-semibold">{erreur}</p>}
    </form>
  );
}

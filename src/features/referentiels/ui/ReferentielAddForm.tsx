import React, { useState } from 'react';
import { toast } from 'sonner';
import { referentielApi } from '../infrastructure/referentielApi';
import { referentielErrorMessage } from '../hooks/useReferentiel';
import { REFERENTIEL_TONES } from '../domain/ReferentielModels';
import type { ReferentielSlug } from '../domain/ReferentielModels';

interface Props {
  slug: ReferentielSlug;
  onCreated: () => void;
}

/** Ajout d'une valeur propre à l'école (listes OPEN uniquement). Le code est déduit du libellé. */
export function ReferentielAddForm({ slug, onCreated }: Props) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('slate');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      toast.error('Libellé : entre 2 et 80 caractères.');
      return;
    }
    setBusy(true);
    try {
      const created = await referentielApi.create(slug, { label: trimmed, color });
      toast.success(`Valeur ajoutée (code ${created.code})`);
      setLabel('');
      onCreated();
    } catch (err) {
      toast.error(referentielErrorMessage(err, 'Ajout refusé.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 text-xs">
      <input value={label} onChange={e => setLabel(e.target.value)} maxLength={80} disabled={busy}
        placeholder="Nouvelle valeur (ex. Transport scolaire)" aria-label="Libellé de la nouvelle valeur"
        className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none" />
      <select value={color} onChange={e => setColor(e.target.value)} disabled={busy} aria-label="Teinte"
        className="px-3 py-2 border border-neutral-200 rounded-xl bg-white">
        {Object.keys(REFERENTIEL_TONES).map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button type="submit" disabled={busy}
        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-wider cursor-pointer">
        Ajouter
      </button>
    </form>
  );
}

import React, { useState } from 'react';
import { toast } from 'sonner';
import { referentielApi } from '../infrastructure/referentielApi';
import { referentielErrorMessage } from '../hooks/useReferentiel';
import { REFERENTIEL_TONES, SCOPE_LABELS, toneOf } from '../domain/ReferentielModels';
import type { ReferentielSlug, ReferentielValue } from '../domain/ReferentielModels';

interface Props {
  slug: ReferentielSlug;
  value: ReferentielValue;
  onChanged: () => void;
}

/** Une valeur du référentiel : libellé, teinte, ordre, activation, suppression / réinitialisation. */
export function ReferentielValueRow({ slug, value, onChanged }: Props) {
  const [label, setLabel] = useState(value.label);
  const [color, setColor] = useState(value.color ?? 'slate');
  const [order, setOrder] = useState(String(value.sortOrder));
  const [busy, setBusy] = useState(false);
  const dirty = label !== value.label || color !== (value.color ?? 'slate') || order !== String(value.sortOrder);
  const canToggle = !(value.locked && value.system);
  const canRemove = value.scope !== 'GLOBAL';

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      onChanged();
    } catch (err) {
      toast.error(referentielErrorMessage(err, 'Modification refusée.'));
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const sortOrder = Number(order);
    if (!label.trim() || label.length > 80) return toast.error('Libellé obligatoire (80 caractères max).');
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return toast.error('Ordre : entier positif.');
    void run(() => referentielApi.update(slug, value.code, { label: label.trim(), color, sortOrder }), 'Valeur enregistrée');
  };

  return (
    <tr className={`border-t border-neutral-100 text-xs ${value.active ? '' : 'opacity-50'}`}>
      <td className="px-3 py-2 font-mono text-[10px] text-slate-500">{value.code}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${toneOf(color).dot}`} />
          <input value={label} onChange={e => setLabel(e.target.value)} maxLength={80} disabled={busy}
            className="w-full px-2 py-1 border border-neutral-200 rounded-lg focus:outline-none" aria-label={`Libellé de ${value.code}`} />
        </div>
      </td>
      <td className="px-3 py-2">
        <select value={color} onChange={e => setColor(e.target.value)} disabled={busy}
          className="px-2 py-1 border border-neutral-200 rounded-lg bg-white" aria-label={`Teinte de ${value.code}`}>
          {Object.keys(REFERENTIEL_TONES).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input type="number" min={0} value={order} onChange={e => setOrder(e.target.value)} disabled={busy}
          className="w-16 px-2 py-1 border border-neutral-200 rounded-lg" aria-label={`Ordre de ${value.code}`} />
      </td>
      <td className="px-3 py-2 text-[10px] text-slate-500">{SCOPE_LABELS[value.scope]}</td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-end gap-1.5">
          {dirty && (
            <button onClick={save} disabled={busy} className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer">Enregistrer</button>
          )}
          <button
            onClick={() => run(() => referentielApi.update(slug, value.code, { active: !value.active }), value.active ? 'Valeur masquée' : 'Valeur réactivée')}
            disabled={busy || !canToggle}
            title={canToggle ? undefined : 'Utilisé par le code : ne peut pas être désactivé'}
            className="px-2 py-1 rounded-lg border border-neutral-200 font-bold disabled:opacity-40 cursor-pointer">
            {value.active ? 'Masquer' : 'Réactiver'}
          </button>
          {canRemove && (
            <button
              onClick={() => run(() => referentielApi.remove(slug, value.code), value.scope === 'SURCHARGE' ? 'Valeur plateforme rétablie' : 'Valeur supprimée')}
              disabled={busy}
              className="px-2 py-1 rounded-lg border border-red-200 text-red-600 font-bold cursor-pointer">
              {value.scope === 'SURCHARGE' ? 'Réinitialiser' : 'Supprimer'}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

import { useState } from 'react';
import { toast } from 'sonner';
import { referentielApi } from '../infrastructure/referentielApi';
import { referentielErrorMessage } from '../hooks/useReferentiel';
import { SCOPE_LABELS } from '../domain/ReferentielModels';
import { ChoixTeinte } from './ChoixTeinte';
import { GRILLE_REFERENTIEL } from './grille';
import { annoncerSuppression } from '@/features/corbeille/annonceCorbeille';
import type { ReferentielSlug, ReferentielValue } from '../domain/ReferentielModels';

interface Props {
  slug: ReferentielSlug;
  value: ReferentielValue;
  onChanged: () => void;
}

/**
 * Une valeur : libellé, couleur, origine, position, masquer / supprimer / rétablir.
 * Le code technique n'est plus une colonne : il reste lisible en infobulle du libellé.
 */
export function ReferentielValueRow({ slug, value, onChanged }: Props) {
  const [label, setLabel] = useState(value.label);
  const [color, setColor] = useState(value.color ?? 'slate');
  const [order, setOrder] = useState(String(value.sortOrder));
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState('');
  const dirty = label !== value.label || color !== (value.color ?? 'slate') || order !== String(value.sortOrder);
  const canToggle = !(value.locked && value.system);
  const canRemove = value.scope !== 'GLOBAL';
  const nom = value.label || value.code;

  /** `success` : message affiché, ou fonction qui annonce le résultat à partir de la réponse du serveur. */
  const run = async (action: () => Promise<unknown>, success: string | ((reponse: unknown) => void)) => {
    setBusy(true);
    setErreur('');
    try {
      const reponse = await action();
      if (typeof success === 'string') toast.success(success);
      else success(reponse);
      onChanged();
    } catch (err) {
      setErreur(referentielErrorMessage(err, 'Modification refusée.'));
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const sortOrder = Number(order);
    if (!label.trim() || label.trim().length > 80) { setErreur('Le libellé est obligatoire (80 caractères au plus).'); return; }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setErreur('La position doit être un nombre entier positif.'); return; }
    void run(() => referentielApi.update(slug, value.code, { label: label.trim(), color, sortOrder }), `« ${label.trim()} » enregistrée.`);
  };

  const annuler = () => { setLabel(value.label); setColor(value.color ?? 'slate'); setOrder(String(value.sortOrder)); setErreur(''); };

  const origine = value.scope === 'ECOLE'
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-neutral-50 text-neutral-600 border-neutral-200';
  const bouton = 'px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <li data-code={value.code} className={`px-3 py-2.5 border-t border-neutral-100 first:border-t-0 hover:bg-neutral-50/80 transition-colors ${value.active ? '' : 'opacity-60'}`}>
      <div className={`flex flex-col gap-2 ${GRILLE_REFERENTIEL}`}>
        <div className="min-w-0 flex items-center gap-2">
          <input value={label} onChange={e => { setLabel(e.target.value); setErreur(''); }} maxLength={80} disabled={busy}
            title={`Code interne : ${value.code}`} aria-label={`Libellé de « ${nom} »`}
            className="w-full min-w-0 px-2.5 py-1.5 border border-transparent hover:border-neutral-200 focus:border-primary rounded-lg bg-transparent focus:bg-white text-xs font-bold text-neutral-900 outline-none" />
          {!value.active && <span className="shrink-0 px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600 text-[9px] font-black uppercase">Masquée</span>}
        </div>
        <ChoixTeinte valeur={color} onChange={setColor} disabled={busy} libelle={`Couleur de « ${nom} »`} />
        <span className={`w-fit px-2 py-0.5 rounded-full border text-[10px] font-bold ${origine}`}>{SCOPE_LABELS[value.scope]}</span>
        <label className="flex items-center gap-1.5 md:block">
          <span className="text-[10px] font-bold text-neutral-400 md:sr-only">Position</span>
          <input type="number" min={0} value={order} onChange={e => { setOrder(e.target.value); setErreur(''); }} disabled={busy}
            title="Position dans les listes : la plus petite s’affiche en premier" aria-label={`Position de « ${nom} »`}
            className="w-14 px-2 py-1 border border-transparent hover:border-neutral-200 focus:border-primary rounded-lg bg-transparent focus:bg-white text-[11px] font-semibold text-neutral-500 text-center outline-none" />
        </label>
        <div className="flex flex-wrap items-center md:justify-end gap-1.5">
          {dirty && (
            <>
              <button type="button" onClick={annuler} disabled={busy} className={`${bouton} text-neutral-500 hover:bg-neutral-100`}>Annuler</button>
              <button type="button" onClick={save} disabled={busy} className={`${bouton} bg-primary hover:bg-primary-dark text-on-primary`}>Enregistrer</button>
            </>
          )}
          <button type="button"
            onClick={() => run(() => referentielApi.update(slug, value.code, { active: !value.active }), value.active ? `« ${nom} » masquée.` : `« ${nom} » de nouveau proposée.`)}
            disabled={busy || !canToggle}
            title={canToggle ? (value.active ? 'Ne plus proposer cette valeur dans les listes' : 'Proposer de nouveau cette valeur') : 'Valeur indispensable au fonctionnement : elle ne peut pas être masquée'}
            className={`${bouton} border border-neutral-200 text-neutral-700 hover:bg-white`}>
            {value.active ? 'Masquer' : 'Réactiver'}
          </button>
          {canRemove && (
            <button type="button"
              onClick={() => run(() => referentielApi.remove(slug, value.code), value.scope === 'SURCHARGE'
                ? `« ${nom} » : valeur d’origine rétablie.`
                // corbeille: true → message du serveur et « Ouvrir la corbeille » ; réponse vide → message de l'écran
                : (reponse) => { annoncerSuppression(reponse, `« ${nom} » placée dans la corbeille : restauration possible depuis Paramètres › Corbeille.`); })}
              disabled={busy}
              title={value.scope === 'SURCHARGE' ? 'Revenir au libellé et à la couleur proposés par My School' : undefined}
              className={`${bouton} border border-red-200 text-red-600 hover:bg-red-50`}>
              {value.scope === 'SURCHARGE' ? 'Rétablir l’original' : 'Supprimer'}
            </button>
          )}
        </div>
      </div>
      {erreur && <p role="alert" className="mt-1 px-2.5 text-[10px] text-red-600 font-semibold">{erreur}</p>}
    </li>
  );
}

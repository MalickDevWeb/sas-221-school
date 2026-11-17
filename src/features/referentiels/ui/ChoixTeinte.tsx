import { REFERENTIEL_TONES, libelleTeinte, toneOf } from '../domain/ReferentielModels';

interface Props {
  valeur: string;
  onChange: (teinte: string) => void;
  disabled?: boolean;
  /** Nom accessible du choix (ex. « Couleur de Transport »). */
  libelle: string;
  className?: string;
}

/**
 * Choix de la couleur : UNE pastille (dans le champ, à gauche) + le nom en français (Ardoise, Ciel, Ambre…).
 * Avant : une pastille devant le champ ET « ● » dans chaque option, et la flèche du champ chevauchait le texte.
 * La flèche est dessinée à droite avec une marge réservée.
 */
export function ChoixTeinte({ valeur, onChange, disabled, libelle, className = '' }: Props) {
  return (
    <span className={`relative inline-flex items-center w-32 shrink-0 ${className}`}>
      <span className={`pointer-events-none absolute left-2.5 w-2.5 h-2.5 rounded-full ${toneOf(valeur).dot}`} aria-hidden="true" />
      <select value={valeur} onChange={e => onChange(e.target.value)} disabled={disabled} aria-label={libelle}
        className="w-full appearance-none bg-none pl-7 pr-7 py-1.5 border border-neutral-200 rounded-lg bg-white text-xs font-semibold text-neutral-800 outline-none focus:border-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
        {!(valeur in REFERENTIEL_TONES) && <option value={valeur}>{libelleTeinte(valeur)}</option>}
        {Object.keys(REFERENTIEL_TONES).map(t => <option key={t} value={t}>{libelleTeinte(t)}</option>)}
      </select>
      <span translate="no" aria-hidden="true" className="pointer-events-none absolute right-1.5 material-symbols-outlined text-[16px] text-neutral-400">expand_more</span>
    </span>
  );
}

import React from 'react';

export interface FiltreListe {
  /** Nom accessible de la liste (« Filtrer par rôle »). */
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  options: { valeur: string; libelle: string }[];
}

interface Props {
  recherche: string;
  onRecherche: (valeur: string) => void;
  /** Nom accessible du champ de recherche (« Rechercher un élève »). */
  libelleRecherche: string;
  /** Texte indicatif du champ (« Rechercher par nom ou matricule… »). */
  indication: string;
  /** Deux listes de filtres (rôle, statut, classe…). */
  filtres: FiltreListe[];
}

const champ = 'w-full h-10 px-3 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-slate-800 '
  + 'placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

/**
 * Barre de recherche et de filtres commune des listes (16/11) : recherche sur la moitié de la largeur avec la loupe
 * dans le champ, deux listes d'un quart, même hauteur et mêmes bordures ; les uns sous les autres sur téléphone. La
 * largeur mesurée est celle du conteneur (@container). La flèche des listes garde sa place (shared/design/reset.css).
 */
export function BarreFiltres({ recherche, onRecherche, libelleRecherche, indication, filtres }: Props) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-4 gap-2">
        <div className="relative @md:col-span-2">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            search
          </span>
          <input type="search" aria-label={libelleRecherche} placeholder={indication} value={recherche}
            onChange={(e) => onRecherche(e.target.value)} className={`${champ} pl-9`} />
        </div>
        {filtres.map((f) => (
          <select key={f.libelle} aria-label={f.libelle} value={f.valeur} onChange={(e) => f.onChange(e.target.value)} className={champ}>
            {f.options.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
          </select>
        ))}
      </div>
    </div>
  );
}

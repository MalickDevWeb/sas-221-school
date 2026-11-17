import type { ReactNode } from 'react';

export interface EnTeteModuleProps {
  titre?: ReactNode;
  /** Une phrase courte sous le titre. */
  sousTitre?: ReactNode;
  /** Indication secondaire, en plus petit sous le sous-titre (ex. lien vers un autre écran) : jamais collée au bouton. */
  aide?: ReactNode;
  /** Icône Material Symbols devant le titre (ex. « badge »). */
  icone?: string;
  /** Action principale (et éventuelles actions secondaires), à droite et centrée verticalement. */
  actions?: ReactNode;
  /** Identifiant du titre (pour aria-labelledby). */
  idTitre?: string;
  /** « clair » (défaut, administration d'école) ou « sombre » (espace super-admin). */
  apparence?: 'clair' | 'sombre';
  className?: string;
}

/**
 * En-tête commun des écrans de module : titre et sous-titre à gauche, actions à droite, centrées verticalement ;
 * sur téléphone, les actions passent sous le titre. Utilisé aussi par ModuleAvecSousMenu (en-tête de sa carte de
 * contenu) : une seule mise en page.
 * Action principale : bouton du design system (`Button`, variante « primary » : couleur de l'école).
 */
export function EnTeteModule({ titre, sousTitre, aide, icone, actions, idTitre, apparence = 'clair', className = '' }: EnTeteModuleProps) {
  const sombre = apparence === 'sombre';
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${sombre ? 'border-white/10' : 'border-neutral-100'} ${className}`}>
      <div className="min-w-0">
        {titre && (
          <h2 id={idTitre} className={`text-base font-black tracking-tight flex items-center gap-2 ${sombre ? 'text-white' : 'text-slate-900'}`}>
            {icone && <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-xl">{icone}</span>}
            {titre}
          </h2>
        )}
        {sousTitre && <p className={`text-xs font-medium mt-0.5 ${sombre ? 'text-slate-400' : 'text-slate-500'}`}>{sousTitre}</p>}
        {aide && <p className={`text-[11px] font-medium mt-1 ${sombre ? 'text-slate-500' : 'text-slate-400'}`}>{aide}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

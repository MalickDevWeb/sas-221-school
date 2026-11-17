import React, { ReactNode, useCallback, useState, useSyncExternalStore } from 'react';
import { Icon } from '@iconify/react';
import { EnTeteModule } from './EnTeteModule';

/**
 * Modèle unique des modules de l'administration d'école (sur le modèle de
 * « Finances & Recouvrement ») : sous-menu à gauche dans une carte blanche arrondie (titre, bouton « « » pour
 * replier, entrées avec icône, entrée active sur fond clair de la couleur de l'école), contenu dans une carte à
 * droite. Sur écran étroit (< 1024 px), le sous-menu devient une rangée d'onglets défilants au-dessus du contenu.
 */

/** Entrée du sous-menu. `icone` : nom Material Symbols (« payments ») ou icône Iconify (« solar:… », avec « : »). */
export interface EntreeSousMenu {
  id: string;
  libelle: string;
  icone: string;
  /** Petite ligne sous le libellé (sous-menu déplié seulement). */
  sousLibelle?: string;
  /** Pastille à droite (ex. nombre de dossiers à traiter). */
  badge?: string;
  /** Suffixe accolé au libellé (ex. « 🔒 » pour une liste verrouillée). */
  suffixe?: string;
}

export interface SousMenuModuleProps {
  /** Identifiant DOM du sous-menu (ex. « finances-subsidebar » : repère des tests). */
  id: string;
  /** Titre en capitales du sous-menu (ex. « Comptabilité & Écolages »). */
  titre: string;
  entrees: EntreeSousMenu[];
  actif: string;
  onChoisir: (id: string) => void;
  /** Sous-menu replié (icônes seules). Fourni par useRepliSousMenu pour être mémorisé. */
  replie: boolean;
  onBasculerRepli: () => void;
  /** Bouton supplémentaire dans l'en-tête du sous-menu (ex. « Masquer le volet » du planning). */
  actionEnTete?: ReactNode;
  /** « clair » (défaut, administration d'école) ou « sombre » (espace super-admin, fond #070A14). */
  apparence?: Apparence;
}

export type Apparence = 'clair' | 'sombre';

/**
 * Classes par apparence. « clair » reprend à l'identique les classes d'origine (aucun changement pour les modules
 * existants) ; « sombre » suit l'espace super-admin : cartes #0E1326 translucides, bordures white/10, texte clair,
 * entrée active indigo lisible.
 */
const STYLES = {
  clair: {
    navEtroit: 'bg-white border border-[#E2DCDA] rounded-2xl p-2 shadow-sm w-full',
    titreEtroit: 'px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-[#1E293B]',
    ongletActif: 'bg-primary/10 text-primary',
    ongletInactif: 'bg-transparent text-[#4A5568] hover:bg-neutral-50',
    carte: 'bg-white border border-[#E2DCDA] rounded-2xl p-4 flex flex-col transition-all duration-300 gap-4 shrink-0 shadow-sm',
    enTete: 'flex items-center justify-between border-b border-neutral-100 pb-2',
    titre: 'text-xs font-black uppercase tracking-wider text-[#1E293B]',
    repli: 'p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent',
    entreeActive: 'bg-primary/10 text-primary',
    entreeInactive: 'bg-transparent text-[#4A5568] hover:bg-neutral-50 hover:text-neutral-900',
    sousLibelle: 'text-[9px] text-neutral-400 font-semibold block mt-0.5 truncate',
    contenu: 'flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px] relative',
  },
  sombre: {
    navEtroit: 'bg-[#0E1326]/80 border border-white/10 rounded-2xl p-2 shadow-xl backdrop-blur-xl w-full',
    titreEtroit: 'px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300',
    ongletActif: 'bg-indigo-500/20 text-white ring-1 ring-inset ring-indigo-400/40',
    ongletInactif: 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
    carte: 'bg-[#0E1326]/80 border border-white/10 rounded-2xl p-4 flex flex-col transition-all duration-300 gap-4 shrink-0 shadow-xl backdrop-blur-xl',
    enTete: 'flex items-center justify-between border-b border-white/10 pb-2',
    titre: 'text-xs font-black uppercase tracking-wider text-slate-200',
    repli: 'p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent',
    entreeActive: 'bg-indigo-500/20 text-white ring-1 ring-inset ring-indigo-400/40',
    entreeInactive: 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
    sousLibelle: 'text-[9px] text-slate-500 font-semibold block mt-0.5 truncate',
    contenu: 'flex-grow min-w-0 w-full bg-[#0E1326]/70 border border-white/10 rounded-2xl p-3 sm:p-6 shadow-xl backdrop-blur-xl min-h-[550px] relative text-slate-300',
  },
} satisfies Record<Apparence, Record<string, string>>;

const REQUETE_LARGE = '(min-width: 1024px)';

/** Vrai sur écran large (≥ 1024 px, même seuil que « lg » de Tailwind). */
// Crochet exporté avec le composant : interface déjà adoptée par les modules Transferts et Abonnement (seul le
// rechargement à chaud de ce fichier en développement est moins fin).
// eslint-disable-next-line react-refresh/only-export-components
export function useEcranLarge(): boolean {
  return useSyncExternalStore(
    (rappel) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mq = window.matchMedia(REQUETE_LARGE);
      mq.addEventListener('change', rappel);
      return () => mq.removeEventListener('change', rappel);
    },
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(REQUETE_LARGE).matches : true),
    () => true,
  );
}

/** État replié/déplié d'un sous-menu, mémorisé par module dans le navigateur (localStorage protégé). */
// Crochet exporté avec le composant : interface déjà adoptée par les modules Transferts et Abonnement (seul le
// rechargement à chaud de ce fichier en développement est moins fin).
// eslint-disable-next-line react-refresh/only-export-components
export function useRepliSousMenu(cle: string): [boolean, () => void] {
  const nom = `sous_menu_replie:${cle}`;
  const [replie, setReplie] = useState<boolean>(() => {
    try { return localStorage.getItem(nom) === '1'; } catch { return false; }
  });
  const basculer = useCallback(() => {
    setReplie(v => {
      const suivant = !v;
      try { localStorage.setItem(nom, suivant ? '1' : '0'); } catch { /* stockage indisponible : non mémorisé */ }
      return suivant;
    });
  }, [nom]);
  return [replie, basculer];
}

function IconeEntree({ icone, className }: { icone: string; className?: string }) {
  if (icone.includes(':')) return <Icon icon={icone} className={className} aria-hidden="true" />;
  return <span translate="no" aria-hidden="true" className={`material-symbols-outlined ${className ?? ''}`}>{icone}</span>;
}

/** Sous-menu d'un module : carte latérale (écran large) ou onglets défilants (écran étroit). */
export function SousMenuModule({ id, titre, entrees, actif, onChoisir, replie, onBasculerRepli, actionEnTete, apparence = 'clair' }: SousMenuModuleProps) {
  const large = useEcranLarge();
  const st = STYLES[apparence];

  if (!large) {
    return (
      <nav id={id} aria-label={titre} className={st.navEtroit}>
        <p className={st.titreEtroit}>{titre}</p>
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto" role="tablist">
          {entrees.map(e => {
            const estActif = e.id === actif;
            return (
              <button key={e.id} type="button" role="tab" aria-selected={estActif} onClick={() => onChoisir(e.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer border-0 ${
                  estActif ? st.ongletActif : st.ongletInactif
                }`}>
                <IconeEntree icone={e.icone} className="text-base shrink-0" />
                <span>{e.libelle}{e.suffixe ? ` ${e.suffixe}` : ''}</span>
                {e.badge && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white">{e.badge}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <div
      id={id}
      className={`${st.carte} ${replie ? 'w-16' : 'w-64'}`}
    >
      <div className={st.enTete}>
        {!replie && <span className={st.titre}>{titre}</span>}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={onBasculerRepli}
            className={st.repli}
            title={replie ? 'Ouvrir le sous-menu' : 'Réduire le sous-menu'}
            aria-label={replie ? 'Ouvrir le sous-menu' : 'Réduire le sous-menu'}
            aria-expanded={!replie}
          >
            <span translate="no" className="material-symbols-outlined text-lg font-bold">
              {replie ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
            </span>
          </button>
          {!replie && actionEnTete}
        </div>
      </div>

      <nav className="flex flex-col gap-1.5" aria-label={titre}>
        {entrees.map(e => {
          const estActif = e.id === actif;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onChoisir(e.id)}
              aria-current={estActif ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer border-0 ${
                estActif ? st.entreeActive : st.entreeInactive
              }`}
              title={e.libelle}
            >
              <IconeEntree icone={e.icone} className="text-lg shrink-0" />
              {!replie && (
                <span className="flex-1 min-w-0">
                  <span className="block truncate leading-none">{e.libelle}{e.suffixe ? ` ${e.suffixe}` : ''}</span>
                  {e.sousLibelle && <span className={st.sousLibelle}>{e.sousLibelle}</span>}
                </span>
              )}
              {!replie && e.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">{e.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export interface ModuleAvecSousMenuProps {
  /** Identifiant DOM de la racine du module (ex. « admin-finances-root »). */
  id?: string;
  /** Le sous-menu (SousMenuModule) ; absent pour une page simple. */
  sousMenu?: ReactNode;
  /** Titre et sous-titre de la carte de contenu (en-tête commun aux pages simples et aux modules). */
  titre?: ReactNode;
  sousTitre?: ReactNode;
  /** Actions à droite de l'en-tête (boutons). */
  actions?: ReactNode;
  /** Identifiant DOM de la carte de contenu. */
  idContenu?: string;
  /** « clair » (défaut) ou « sombre » (espace super-admin). */
  apparence?: Apparence;
  children: ReactNode;
}

/**
 * Mise en page commune : sous-menu à gauche (ou onglets au-dessus sur écran étroit) + carte de contenu.
 * Pas d'overflow-hidden sur la carte : il coupait les listes de suggestions ouvertes sous un champ (retour Transferts).
 */
export function ModuleAvecSousMenu({ id, sousMenu, titre, sousTitre, actions, idContenu, apparence = 'clair', children }: ModuleAvecSousMenuProps) {
  const st = STYLES[apparence];
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-start w-full" id={id}>
      {sousMenu && <div className="shrink-0 lg:sticky lg:top-4">{sousMenu}</div>}
      <div id={idContenu} className={st.contenu}>
        {/* En-tête commun des écrans de module (EnTeteModule) */}
        {(titre || sousTitre || actions) && (
          <EnTeteModule titre={titre} sousTitre={sousTitre} actions={actions} apparence={apparence} className="mb-5" />
        )}
        {children}
      </div>
    </div>
  );
}

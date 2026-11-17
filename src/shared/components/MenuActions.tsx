import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export interface ActionMenu {
  /** Verbe à l'infinitif suivi de son complément (« Suspendre le compte »). */
  libelle: string;
  /** Icône Material Symbols (« block », « delete »…). */
  icone?: string;
  /** Classe de couleur de l'icône (ex. « text-amber-600 »). */
  teinteIcone?: string;
  /** Action destructrice : texte rouge, séparée des autres par un trait. */
  danger?: boolean;
  /** Repère stable des tests (attribut data-action). */
  action?: string;
  onClick: () => void;
}

interface Props {
  /** Ce que concernent les actions, pour le nom accessible du bouton : « Autres actions pour Awa Diop ». */
  pour: string;
  actions: ActionMenu[];
}

/**
 * Menu « ⋯ » des actions moins fréquentes d'une ligne (sur le modèle du menu des rôles de « Droits d'accès »).
 * Le menu s'ouvre dans une couche au-dessus de la page (portail) : il n'est jamais coupé par un tableau ou une carte à
 * bords arrondis. Placé sous le bouton, ou au-dessus s'il manque de place en bas. Clavier : flèches haut et bas pour
 * passer d'une action à l'autre, Échap ou Tab pour fermer (le focus revient au bouton).
 */
export function MenuActions({ pour, actions }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  const fermer = useCallback((rendreFocus: boolean) => {
    setOuvert(false);
    setPosition(null);
    if (rendreFocus) bouton.current?.focus();
  }, []);

  // Placement avant l'affichage (aucun saut visible), puis à chaque défilement ou redimensionnement
  useLayoutEffect(() => {
    if (!ouvert) return;
    const placer = () => {
      const b = bouton.current?.getBoundingClientRect();
      const m = menu.current?.getBoundingClientRect();
      if (!b || !m) return;
      const enBas = b.bottom + 4 + m.height <= window.innerHeight - 8;
      setPosition({
        top: enBas ? b.bottom + 4 : Math.max(8, b.top - 4 - m.height),
        left: Math.min(Math.max(8, b.right - m.width), window.innerWidth - m.width - 8),
      });
    };
    placer();
    window.addEventListener('scroll', placer, true);
    window.addEventListener('resize', placer);
    return () => {
      window.removeEventListener('scroll', placer, true);
      window.removeEventListener('resize', placer);
    };
  }, [ouvert]);

  // Fermeture au clic en dehors ; focus sur la première action à l'ouverture
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: PointerEvent) => {
      const cible = e.target as Node;
      if (!menu.current?.contains(cible) && !bouton.current?.contains(cible)) fermer(false);
    };
    document.addEventListener('pointerdown', clic);
    return () => document.removeEventListener('pointerdown', clic);
  }, [ouvert, fermer]);

  const place = position !== null;
  useEffect(() => {
    if (ouvert && place) menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [ouvert, place]);

  const clavier = (e: KeyboardEvent<HTMLDivElement>) => {
    const elements = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    const i = elements.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      fermer(true);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const suivant = e.key === 'ArrowDown' ? (i + 1) % elements.length : (i - 1 + elements.length) % elements.length;
      elements[suivant]?.focus();
    }
  };

  return (
    <>
      <button ref={bouton} type="button" onClick={() => (ouvert ? fermer(false) : setOuvert(true))}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && ouvert) fermer(true);
          else if (e.key === 'ArrowDown' && !ouvert) { e.preventDefault(); setOuvert(true); }
        }}
        aria-haspopup="menu" aria-expanded={ouvert} aria-controls={ouvert ? idMenu : undefined}
        aria-label={`Autres actions pour ${pour}`} title="Autres actions"
        className="h-8 w-8 shrink-0 rounded-lg border border-neutral-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-neutral-100 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">more_horiz</span>
      </button>
      {ouvert && createPortal(
        <div ref={menu} id={idMenu} role="menu" aria-label={`Actions pour ${pour}`} onKeyDown={clavier}
          style={{ position: 'fixed', top: position?.top ?? -9999, left: position?.left ?? -9999, visibility: position ? 'visible' : 'hidden' }}
          className="z-[900] min-w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 text-left">
          {actions.map((a) => (
            <button key={a.libelle} type="button" role="menuitem" data-action={a.action}
              onClick={() => { fermer(true); a.onClick(); }}
              className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer outline-none hover:bg-neutral-50 focus:bg-neutral-100 ${
                a.danger ? 'text-rose-700 border-t border-neutral-100' : 'text-slate-700'}`}>
              {a.icone && (
                <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[16px] ${a.teinteIcone ?? (a.danger ? 'text-rose-600' : 'text-slate-500')}`}>{a.icone}</span>
              )}
              {a.libelle}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

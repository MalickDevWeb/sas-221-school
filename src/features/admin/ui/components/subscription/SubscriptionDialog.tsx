import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Contenu de l'en-tête au-dessus du titre (pastille, icône). */
  kicker?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Largeur maximale Tailwind (ex. « max-w-lg », « max-w-3xl »). */
  widthClass?: string;
  id?: string;
  children: React.ReactNode;
}

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fenêtre des écrans d'abonnement (2026-11-15). Avant : `fixed inset-0` rendu dans la page, donc confiné par un parent
 * animé (transform) : titre et bas de la fenêtre coupés, voile partiel. Désormais : portail vers document.body, hauteur
 * limitée à l'écran avec défilement interne, fermeture par Échap, clic sur le voile ou bouton, focus placé dans la
 * fenêtre, gardé à l'intérieur (Tab) et rendu à l'élément d'origine à la fermeture.
 */
export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen, onClose, title, kicker, subtitle, widthClass = 'max-w-lg', id, children,
}) => {
  const titreId = useId();
  const fenetre = useRef<HTMLDivElement>(null);
  const fermer = useRef(onClose);
  useEffect(() => { fermer.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const origine = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const defilement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const premier = fenetre.current?.querySelector<HTMLElement>(FOCUSABLES);
    (premier ?? fenetre.current)?.focus();

    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        fermer.current();
        return;
      }
      if (e.key !== 'Tab' || !fenetre.current) return;
      const elements = Array.from(fenetre.current.querySelectorAll<HTMLElement>(FOCUSABLES));
      if (elements.length === 0) { e.preventDefault(); return; }
      const debut = elements[0];
      const fin = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === debut) { e.preventDefault(); fin.focus(); }
      else if (!e.shiftKey && document.activeElement === fin) { e.preventDefault(); debut.focus(); }
    };
    document.addEventListener('keydown', auClavier);
    return () => {
      document.removeEventListener('keydown', auClavier);
      document.body.style.overflow = defilement;
      origine?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={fenetre}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        tabIndex={-1}
        className={`relative w-full ${widthClass} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden outline-none`}
      >
        <div className="shrink-0 px-6 pt-6 pb-5 sm:px-7 border-b border-gray-100 bg-gradient-to-b from-indigo-50/50 to-white pr-14">
          {kicker}
          <h3 id={titreId} className="text-lg sm:text-xl font-black text-gray-900">{title}</h3>
          {subtitle && <div className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</div>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body
  );
};

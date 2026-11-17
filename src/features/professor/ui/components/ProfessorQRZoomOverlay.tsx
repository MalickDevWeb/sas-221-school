import { QrLocal } from '@/shared/components/QrLocal';
import { useBadgePersonnel } from '@/shared/hooks/useBadgePersonnel';
import React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';

interface Props {
  readonly profName: string;
  readonly onClose: () => void;
}

export function ProfessorQRZoomOverlay({ onClose }: Props) {
  const qrUrl = useBadgePersonnel();

  return createPortal(
    <div 
      id="professor-qr-zoom-overlay"
      onClick={onClose}
      className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white p-5 rounded-3xl shadow-2xl w-full max-w-[320px] aspect-square flex items-center justify-center cursor-default border border-neutral-100 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button 
          id="close-qr-zoom-btn"
          onClick={onClose}
          className="absolute -top-12 right-0 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
          title="Fermer"
        >
          <Icon icon="lucide:x" className="h-5 w-5" />
        </button>

        {/* Minimalist QR code display */}
        <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
          <QrLocal valeur={qrUrl} titre="QR Code Enseignant" className="w-full h-full p-2" />
        </div>
      </div>
    </div>,
    document.body
  );
}

import { QrLocal } from '@/shared/components/QrLocal';
import { useQrEntree } from '@/shared/hooks/usePointage';
import React from 'react';

interface Props {
  readonly className?: string;
}

/**
 * QR d'entrée de l'école affiché par le vigile : signé par le serveur, propre à l'école et renouvelé chaque
 * minute ; l'élève ou le professeur le scanne pour pointer son arrivée ou son départ. Sans réponse du serveur, aucun
 * QR n'est inventé.
 */
export function RenderQRCode({ className = 'w-44 h-44 select-none' }: Props) {
  const { contenu, chargement, erreur } = useQrEntree();

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden p-2">
      {contenu ? (
        <QrLocal valeur={contenu} titre="QR code d'entrée" className={className} />
      ) : (
        <p id="qr-entree-indisponible" className="text-[11px] font-semibold text-neutral-500 text-center px-4">
          {chargement ? 'Chargement du QR code d’entrée…' : (erreur || 'QR code d’entrée indisponible.')}
        </p>
      )}
    </div>
  );
}

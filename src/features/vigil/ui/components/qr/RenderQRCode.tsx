import { QrLocal } from '@/shared/components/QrLocal';
import React from 'react';

interface Props {
  readonly className?: string;
  readonly data?: string;
}

export function RenderQRCode({ className = 'w-44 h-44 select-none', data = '221-VIGILE-PORTAL-MAIN' }: Props) {

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden p-2">
      <QrLocal valeur={data} titre="QR Code" className={className} />
      {/* Laser line overlay animation */}
      <div className="absolute left-0 right-0 h-[1.5px] bg-primary opacity-80 shadow-[0_0_8px_#ba0013] top-1/2 -translate-y-1/2" />
      <div className="absolute inset-x-0 h-0.5 bg-primary/20 top-1 animate-[bounce_3s_infinite] pointer-events-none" />
    </div>
  );
}


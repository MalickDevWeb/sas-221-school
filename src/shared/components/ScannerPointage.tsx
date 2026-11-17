import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { QRCameraScanner } from './QRCameraScanner';
import { usePointer, type SensPointage } from '@/shared/hooks/usePointage';

interface Props {
  /** Sens annoncé par le serveur avant le scan (le serveur décide de nouveau à l'enregistrement). */
  readonly sens: SensPointage;
}

/**
 * Scan du QR d'entrée du vigile par l'élève ou le professeur. Le résultat affiché est celui du serveur :
 * « Arrivée enregistrée à 08:12. » ou la raison du refus (QR expiré, d'une autre école, déjà pointé…).
 */
export function ScannerPointage({ sens }: Props) {
  const pointer = usePointer();
  const [etat, setEtat] = useState<'scan' | 'envoi' | 'valide' | 'echec'>('scan');
  const [message, setMessage] = useState('');
  const [cle, setCle] = useState(0);

  const surLecture = (texte: string) => {
    setEtat('envoi');
    void pointer(texte).then((r) => {
      setMessage(r.message);
      setEtat(r.ok ? 'valide' : 'echec');
    });
  };
  const recommencer = () => { setEtat('scan'); setMessage(''); setCle((k) => k + 1); };

  return (
    <div className="space-y-4 text-center" id="scanner-pointage">
      <p className="text-xs text-secondary leading-relaxed font-semibold">
        Scannez le QR code affiché par le vigile pour enregistrer votre {sens}.
      </p>

      {etat === 'scan' && <QRCameraScanner key={cle} onScanComplete={surLecture} />}

      {etat === 'envoi' && (
        <div id="pointage-envoi" className="rounded-2xl p-4 flex flex-col items-center gap-2 text-neutral-600">
          <Icon icon="lucide:loader" className="h-6 w-6 animate-spin text-primary" />
          <p className="text-[10px] font-bold">Enregistrement du pointage…</p>
        </div>
      )}

      {etat === 'valide' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          id="pointage-valide"
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex flex-col items-center gap-2"
        >
          <div className="h-10 w-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
            <Icon icon="lucide:check-circle" className="h-6 w-6" />
          </div>
          <p className="text-xs font-black text-emerald-900">{message}</p>
        </motion.div>
      )}

      {etat === 'echec' && (
        <div id="pointage-echec" className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex flex-col items-center gap-2">
          <Icon icon="lucide:alert-circle" className="h-6 w-6" />
          <p className="text-[11px] font-semibold max-w-[260px]">{message}</p>
          <button
            type="button"
            onClick={recommencer}
            className="mt-1 px-3 py-1 bg-white hover:bg-red-100/50 border border-red-200/50 text-red-800 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
          >
            Scanner à nouveau
          </button>
        </div>
      )}
    </div>
  );
}

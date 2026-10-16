import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedType: string;
  instructions: string;
  target: string;
}

export function EmergencyConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedType,
  instructions,
  target,
}: Props) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-red-500 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-600 border-b border-red-100 pb-3">
          <span translate="no" className="material-symbols-outlined text-3xl font-black animate-bounce">
            warning
          </span>
          <div>
            <h4 className="font-extrabold text-sm uppercase text-red-950 tracking-wide">
              Confirmation de Diffusion d'Urgence
            </h4>
            <p className="text-[10px] text-red-700 font-bold">
              Protocole de sécurité prioritaire et irréversible
            </p>
          </div>
        </div>

        <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 space-y-2 text-xs font-semibold text-red-900">
          <div><span className="font-bold text-red-950">Incident :</span> {selectedType}</div>
          <div><span className="font-bold text-red-950">Audience :</span> {target}</div>
          <div>
            <span className="font-bold text-red-950">Message diffusé :</span>
            <p className="mt-1 p-2 bg-white/80 rounded-lg border border-red-200 text-[11px] font-mono text-neutral-800 whitespace-pre-wrap">
              {instructions || "Protocole d'urgence activé. Veuillez suivre les consignes de sécurité immédiates."}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-neutral-500 leading-snug">
          Cette action contourne les filtres anti-spam, fait vibrer les appareils et alerte instantanément les correspondants.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 active:scale-95 transition-transform cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={countdown > 0}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            {countdown > 0 ? `Vérification (${countdown}s)` : 'Confirmer & Déclencher'}
          </button>
        </div>
      </div>
    </div>
  );
}


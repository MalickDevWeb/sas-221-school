import React, { useEffect, useRef } from 'react';
import { erreurHoraire } from '../../domain/horaireSeance';

interface Props {
  readonly prefixeId: string;
  readonly debut: string;
  readonly fin: string;
  readonly onDebut: (v: string) => void;
  readonly onFin: (v: string) => void;
  /** Formulaire validé à la main (noValidate) : message affiché sous les champs. */
  readonly erreur?: string | null;
}

/**
 * Heure de début et heure de fin d'une séance (16/11) : le lien apparaît aux élèves au début et disparaît après la fin.
 * Dans un formulaire validé par le navigateur, l'incohérence est signalée par setCustomValidity (message en français
 * sous le champ, validationPersonnalisee.ts).
 */
export function ChampsHoraire({ prefixeId, debut, fin, onDebut, onFin, erreur }: Props) {
  const champFin = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const e = debut && fin ? erreurHoraire(debut, fin) : null;
    champFin.current?.setCustomValidity(e ?? '');
  }, [debut, fin]);

  const classe = 'w-full text-xs px-3 py-2 border border-neutral-gray-200 rounded-xl focus:outline-none bg-white';
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefixeId}-debut`} className="block text-xs font-bold text-gray-700 mb-1">Début (le lien apparaît)</label>
          <input id={`${prefixeId}-debut`} type="datetime-local" value={debut} onChange={(e) => onDebut(e.target.value)}
            required data-msg-requis="Indiquez l'heure de début : le lien apparaîtra aux élèves à ce moment-là."
            className={classe} aria-invalid={!!erreur} />
        </div>
        <div>
          <label htmlFor={`${prefixeId}-fin`} className="block text-xs font-bold text-gray-700 mb-1">Fin (le lien disparaît)</label>
          <input id={`${prefixeId}-fin`} ref={champFin} type="datetime-local" value={fin} onChange={(e) => onFin(e.target.value)}
            required data-msg-requis="Indiquez l'heure de fin : le lien disparaîtra après."
            className={classe} aria-invalid={!!erreur} />
        </div>
      </div>
      {erreur && <p role="alert" className="text-[10px] font-bold text-rose-700">{erreur}</p>}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { ClasseEcole, classesEcole } from '../../infrastructure/groupService';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  readonly id: string;
  readonly value: string;
  readonly onChange: (classeId: string) => void;
  /** Libellé de l'option vide (absent = classe obligatoire). */
  readonly optionVide?: string;
  readonly invalide?: boolean;
}

/** Classes réelles de l'école (avant : texte libre pré-rempli « L3-INFO »). */
export function ClasseSelect({ id, value, onChange, optionVide, invalide }: Props) {
  const [classes, setClasses] = useState<ClasseEcole[]>([]);
  const [erreur, setErreur] = useState('');
  useEffect(() => {
    let actif = true;
    classesEcole().then((c) => { if (actif) setClasses(c); })
      .catch((e) => { if (actif) setErreur(resolveErrorMessage(e)); });
    return () => { actif = false; };
  }, []);
  return (
    <>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalide || undefined}
              className="w-full text-xs px-2.5 py-1.5 border border-neutral-gray-200 rounded-lg bg-white aria-[invalid=true]:border-rose-400">
        <option value="">{optionVide ?? '-- Choisir une classe --'}</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {erreur && <p role="alert" className="mt-0.5 text-[10px] font-bold text-rose-700">Classes indisponibles : {erreur}</p>}
    </>
  );
}

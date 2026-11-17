import React from 'react';
import { PAYS, PAYS_EN_TETE, nomPays } from '@/shared/constants/pays';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  /** Texte de l'option vide. */
  placeholder?: string;
};

/**
 * Liste des pays : la valeur est le code ISO (« SN »), le libellé le nom du pays (« Sénégal ») ; une saisie libre
 * serait impossible à comparer dans une règle d'admission. Liste native : fiable sur les téléphones d'entrée de
 * gamme, accessible au clavier et aux lecteurs d'écran.
 * Compatible react-hook-form ({...register('nationalite')}).
 */
export const ChoixPays = React.forwardRef<HTMLSelectElement, Props>(function ChoixPays(
  { placeholder = '— Choisir un pays —', ...props }, ref,
) {
  return (
    <select ref={ref} {...props}>
      <option value="">{placeholder}</option>
      <optgroup label="Sénégal et pays voisins">
        {PAYS_EN_TETE.map((code) => <option key={`tete-${code}`} value={code}>{nomPays(code)}</option>)}
      </optgroup>
      <optgroup label="Tous les pays">
        {PAYS.map((p) => <option key={p.code} value={p.code}>{p.nom}</option>)}
      </optgroup>
    </select>
  );
});

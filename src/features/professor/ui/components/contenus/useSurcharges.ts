import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Applique à une liste reçue en props les modifications CONFIRMÉES par le serveur (objet renvoyé par le PUT)
 * et retire les objets dont la suppression a été confirmée (DELETE réussi), sans attendre un rechargement.
 */
export function useSurcharges<T extends { readonly id: string }>(items: readonly T[]) {
  const [maj, setMaj] = useState<Record<string, Partial<T> | null>>({});
  useEffect(() => { setMaj({}); }, [items]);
  const visibles = useMemo(
    () => items.filter((x) => maj[x.id] !== null).map((x) => (maj[x.id] ? { ...x, ...maj[x.id] } as T : x)),
    [items, maj],
  );
  /** valeur null = supprimé sur le serveur */
  const appliquer = useCallback((id: string, valeur: Partial<T> | null) => {
    setMaj((m) => ({ ...m, [id]: valeur === null ? null : { ...(m[id] || {}), ...valeur } }));
  }, []);
  return [visibles, appliquer] as const;
}

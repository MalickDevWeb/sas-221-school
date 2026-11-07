import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { referentielApi } from '../infrastructure/referentielApi';
import type { ReferentielSlug, ReferentielValue } from '../domain/ReferentielModels';

/** Message d'erreur lisible renvoyé par le backend (ApiErrorResponse.message). */
export function referentielErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

interface UseReferentielResult {
  values: ReferentielValue[];
  loading: boolean;
  /** Erreur de chargement : affichée telle quelle, jamais remplacée par des données fictives. */
  error: string | null;
  reload: () => Promise<void>;
  /** Libellé d'un code ; renvoie le code lui-même s'il n'existe plus (valeur supprimée). */
  labelOf: (code: string | null | undefined) => string;
  find: (code: string | null | undefined) => ReferentielValue | undefined;
}

/**
 * Charge un référentiel pour l'école courante.
 * @param includeInactive true pour l'écran d'administration (affiche les valeurs masquées).
 */
export function useReferentiel(slug: ReferentielSlug, includeInactive = false): UseReferentielResult {
  const [values, setValues] = useState<ReferentielValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await referentielApi.values(slug, includeInactive));
    } catch (err) {
      setError(referentielErrorMessage(err, 'Impossible de charger le référentiel.'));
    } finally {
      setLoading(false);
    }
  }, [slug, includeInactive]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const byCode = useMemo(() => new Map(values.map(v => [v.code, v])), [values]);
  const find = useCallback((code: string | null | undefined) => (code ? byCode.get(code) : undefined), [byCode]);
  const labelOf = useCallback((code: string | null | undefined) => find(code)?.label ?? code ?? '', [find]);

  return { values, loading, error, reload, labelOf, find };
}

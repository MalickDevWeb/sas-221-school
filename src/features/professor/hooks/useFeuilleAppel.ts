import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { feuilleAppelApi } from '../infrastructure/api/feuilleAppelApi';
import type {
  AssiduiteEleve,
  FeuilleAppel,
  SeanceCours,
  StatutAppel,
} from '../domain/FeuilleAppel';

/** Date du jour au format AAAA-MM-JJ, dans le fuseau du navigateur. */
export function aujourdhuiIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** « HH:MM » d'un horodatage ISO renvoyé par le serveur ; null si absent ou illisible. */
export function heureMinute(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  return m ? `${m[1]}:${m[2]}` : null;
}

type Saisie = { status: StatutAppel | null; note: string };

function saisiesDe(feuille: FeuilleAppel | null): Record<string, Saisie> {
  const res: Record<string, Saisie> = {};
  feuille?.eleves.forEach((e) => {
    res[e.studentId] = { status: e.status ?? null, note: e.note ?? '' };
  });
  return res;
}

/**
 * État de la feuille d'appel d'un cours : séance + date choisies, statuts saisis (non notés par défaut),
 * relecture de l'appel existant, enregistrement en UN envoi et taux d'assiduité par élève.
 */
export function useFeuilleAppel(courseId: string | undefined, notifier?: (message: string) => void) {
  const [seances, setSeances] = useState<SeanceCours[]>([]);
  const [chargementSeances, setChargementSeances] = useState(false);
  const [erreurSeances, setErreurSeances] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [date, setDate] = useState<string>(aujourdhuiIso());

  const [feuille, setFeuille] = useState<FeuilleAppel | null>(null);
  const [chargementFeuille, setChargementFeuille] = useState(false);
  const [erreurFeuille, setErreurFeuille] = useState<string | null>(null);
  const [saisies, setSaisies] = useState<Record<string, Saisie>>({});

  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);

  const [assiduite, setAssiduite] = useState<Record<string, AssiduiteEleve>>({});
  const [erreurAssiduite, setErreurAssiduite] = useState<string | null>(null);
  const requete = useRef(0);

  // --- séances du cours ---
  useEffect(() => {
    setSeances([]);
    setSessionId('');
    setErreurSeances(null);
    if (!courseId) return;
    let actif = true;
    setChargementSeances(true);
    feuilleAppelApi
      .seances(courseId)
      .then((liste) => {
        if (!actif) return;
        setSeances(liste);
        if (liste.length > 0) setSessionId(liste[0].id);
      })
      .catch((e) => actif && setErreurSeances(resolveErrorMessage(e)))
      .finally(() => actif && setChargementSeances(false));
    return () => {
      actif = false;
    };
  }, [courseId]);

  // --- assiduité ---
  const chargerAssiduite = useCallback(async () => {
    if (!courseId) return;
    try {
      const s = await feuilleAppelApi.statistiques(courseId);
      const parEleve: Record<string, AssiduiteEleve> = {};
      s.eleves.forEach((e) => {
        parEleve[e.studentId] = e;
      });
      setAssiduite(parEleve);
      setErreurAssiduite(null);
    } catch (e) {
      setErreurAssiduite(resolveErrorMessage(e));
    }
  }, [courseId]);

  useEffect(() => {
    setAssiduite({});
    void chargerAssiduite();
  }, [chargerAssiduite]);

  // --- feuille d'appel (séance + date) ---
  const dateFuture = date > aujourdhuiIso();
  useEffect(() => {
    setFeuille(null);
    setSaisies({});
    setErreurFeuille(null);
    setErreurEnvoi(null);
    if (!courseId || !date || dateFuture || chargementSeances) return;
    const numero = ++requete.current;
    setChargementFeuille(true);
    feuilleAppelApi
      .feuille(courseId, date, sessionId || undefined)
      .then((f) => {
        if (numero !== requete.current) return;
        setFeuille(f);
        setSaisies(saisiesDe(f));
      })
      .catch((e) => numero === requete.current && setErreurFeuille(resolveErrorMessage(e)))
      .finally(() => numero === requete.current && setChargementFeuille(false));
  }, [courseId, sessionId, date, dateFuture, chargementSeances]);

  const initiales = useMemo(() => saisiesDe(feuille), [feuille]);
  const modifie = useMemo(
    () =>
      Object.keys(saisies).some(
        (id) => saisies[id].status !== initiales[id]?.status || saisies[id].note !== (initiales[id]?.note ?? '')
      ),
    [saisies, initiales]
  );

  const confirmerAbandon = useCallback(async () => {
    if (!modifie) return true;
    return demanderConfirmation("L'appel en cours n'est pas enregistré. Abandonner les modifications ?", {
      titre: 'Appel non enregistré',
      confirmer: 'Abandonner',
      annuler: 'Rester',
    });
  }, [modifie]);

  const choisirSeance = useCallback(
    async (id: string) => {
      if (id === sessionId) return;
      if (await confirmerAbandon()) setSessionId(id);
    },
    [sessionId, confirmerAbandon]
  );

  const choisirDate = useCallback(
    async (valeur: string) => {
      if (valeur === date) return;
      if (await confirmerAbandon()) setDate(valeur);
    },
    [date, confirmerAbandon]
  );

  const marquer = useCallback((studentId: string, status: StatutAppel) => {
    setSaisies((s) => ({ ...s, [studentId]: { note: s[studentId]?.note ?? '', status } }));
  }, []);

  const annoter = useCallback((studentId: string, note: string) => {
    setSaisies((s) => ({ ...s, [studentId]: { status: s[studentId]?.status ?? null, note } }));
  }, []);

  /** Appel rapide : tous présents, le professeur corrige ensuite les exceptions avant l'envoi unique. */
  const toutPresent = useCallback(() => {
    setSaisies((s) => {
      const res: Record<string, Saisie> = {};
      Object.keys(s).forEach((id) => {
        res[id] = { ...s[id], status: 'PRESENT' };
      });
      return res;
    });
  }, []);

  const nonNotes = useMemo(() => Object.values(saisies).filter((s) => !s.status).length, [saisies]);

  /** Envoie TOUTE la feuille en un seul POST ; l'indicateur « enregistré » ne vient que de la réponse du serveur. */
  const enregistrer = useCallback(async (): Promise<boolean> => {
    if (!courseId || !feuille) return false;
    setErreurEnvoi(null);
    const entries = Object.entries(saisies)
      .filter(([, s]) => s.status)
      .map(([studentId, s]) => ({
        studentId,
        status: s.status as StatutAppel,
        ...(s.note.trim() ? { note: s.note.trim() } : {}),
      }));
    if (entries.length === 0) {
      setErreurEnvoi('Aucun élève noté : choisissez un statut pour au moins un élève (ou « Tout présent »).');
      return false;
    }
    if (nonNotes > 0) {
      const ok = await demanderConfirmation(
        `${nonNotes} élève(s) ne sont pas notés et ne seront pas enregistrés. Enregistrer quand même l'appel des ${entries.length} autre(s) ?`,
        { titre: 'Appel incomplet', confirmer: 'Enregistrer', annuler: 'Compléter', danger: false }
      );
      if (!ok) return false;
    }
    setEnregistrement(true);
    try {
      const f = await feuilleAppelApi.enregistrer(courseId, {
        ...(sessionId ? { sessionId } : {}),
        date,
        entries,
      });
      setFeuille(f);
      setSaisies(saisiesDe(f));
      const heure = heureMinute(f.enregistreA);
      notifier?.(heure ? `Appel enregistré à ${heure}.` : 'Appel enregistré.');
      void chargerAssiduite();
      // la séance porte désormais un appel à cette date
      setSeances((liste) =>
        liste.map((s) =>
          s.id === sessionId && !s.appelsEnregistres.includes(date)
            ? { ...s, appelsEnregistres: [date, ...s.appelsEnregistres].sort().reverse() }
            : s
        )
      );
      return true;
    } catch (e) {
      setErreurEnvoi(resolveErrorMessage(e));
      return false;
    } finally {
      setEnregistrement(false);
    }
  }, [courseId, feuille, saisies, nonNotes, sessionId, date, notifier, chargerAssiduite]);

  return {
    seances,
    chargementSeances,
    erreurSeances,
    sessionId,
    choisirSeance,
    date,
    choisirDate,
    dateFuture,
    feuille,
    chargementFeuille,
    erreurFeuille,
    saisies,
    marquer,
    annoter,
    toutPresent,
    nonNotes,
    modifie,
    enregistrer,
    enregistrement,
    erreurEnvoi,
    assiduite,
    erreurAssiduite,
  };
}

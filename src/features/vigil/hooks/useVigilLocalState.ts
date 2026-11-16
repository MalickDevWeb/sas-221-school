import { useState, useEffect, useCallback, useRef } from 'react';
import { audioService } from '../infrastructure/config/dependencies';
import { securityService } from '@/shared/lib/apiService';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { applyVigilFilters, DateFilter } from './useVigilFilters';
import { chargerListeAcces, deciderHorsLigne, listeAcces, mettreEnAttente, nombreEnAttente, transmettreScansEnAttente } from '../infrastructure/local/accesHorsLigne';

/** Réseau ou serveur injoignable (et non refus du serveur) : le terminal décide hors ligne (EF-10). */
function estHorsLigne(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const e = err as { response?: { status?: number }; code?: string; message?: string };
  if (!e?.response) return e?.code === 'ERR_NETWORK' || e?.code === 'ECONNABORTED' || e?.message === 'Network Error';
  return [502, 503, 504].includes(Number(e.response.status));
}

export interface ScanLogItem {
  id: string;
  name: string;
  studentId: string;
  status: string;
  time: string;
  type?: string;
  date?: string;
  avatar?: string | null;
}

export interface CheckpointItem {
  id: string;
  name: string;
  status: string;
  lastCheck: string;
  guard: string;
}

export interface ActiveCheckpoint {
  id?: string;
  name?: string;
  status?: string;
  gate?: string;
  guard?: string;
}

const DELAI_RELECTURE_MS = 8000;

export function useVigilLocalState() {
  const [manualId, setManualId] = useState('');
  const [resetKey, setResetKey] = useState(0);
  // Dernier contenu lu par la caméra : un badge resté devant l'objectif n'est compté qu'une fois
  const dernierScanRef = useRef<{ texte: string; instant: number } | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  // Passages et points de contrôle RÉELS uniquement (avant : passages d'élèves et points inventés)
  const [scanLogs, setScanLogs] = useState<ScanLogItem[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem('v_scan_logs') || '[]');
      return Array.isArray(v) ? v.filter((l: ScanLogItem) => !['1','2','3','4','5'].includes(String(l?.id))) : [];
    } catch {
      return [];
    }
  });
  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem('v_checkpoints') || '[]');
      return Array.isArray(v) ? v.filter((c: CheckpointItem) => !/^cp[1-5]$/.test(String(c?.id))) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showBadge, setShowBadge] = useState(false);
  const [scanMode, setScanMode] = useState<'scan' | 'showQR'>('scan');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCheckpoint, setActiveCheckpoint] = useState<ActiveCheckpoint | null>(null);
  const itemsPerPage = 3;
  // Décision hors ligne (EF-10) : liste d'accès à jour, scans en attente d'envoi
  const [etatHorsLigne, setEtatHorsLigne] = useState<string>('');

  const decrireEtat = useCallback(() => {
    const l = listeAcces();
    const attente = nombreEnAttente();
    setEtatHorsLigne((l ? `Liste d'accès hors ligne à jour (${new Date(l.genereLe).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}, ${l.eleves.length} élèves).`
      : "Aucune liste d'accès hors ligne : sans réseau, aucun badge ne pourra être contrôlé.")
      + (attente ? ` ${attente} scan(s) hors ligne en attente d'envoi.` : ''));
  }, []);

  useEffect(() => {
    const synchroniser = async () => {
      try { await chargerListeAcces(); } catch { /* hors ligne : on garde la liste existante */ }
      try {
        const { envoyes, contestes } = await transmettreScansEnAttente();
        if (envoyes && contestes) setFeedback({ success: false, message: `${envoyes} scan(s) hors ligne transmis ; ${contestes} décision(s) contestée(s) par le serveur.` });
      } catch { /* toujours hors ligne : nouvel essai au retour du réseau */ }
      decrireEtat();
    };
    void synchroniser();
    window.addEventListener('online', synchroniser);
    return () => window.removeEventListener('online', synchroniser);
  }, [decrireEtat]);

  useEffect(() => {
    let isMounted = true;
    const loadCheckpoint = async () => {
      try {
        const res = await securityService.getCheckpointStatus();
        if (isMounted && res) setActiveCheckpoint(res);
      } catch {
        if (isMounted) {
          setActiveCheckpoint((prev) => prev || null);   // poste réel inconnu : rien d'inventé
        }
      }
    };
    loadCheckpoint();
    const interval = setInterval(loadCheckpoint, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, dateFilter]);
  useEffect(() => {
    localStorage.setItem('v_scan_logs', JSON.stringify(scanLogs));
    localStorage.setItem('v_checkpoints', JSON.stringify(checkpoints));
  }, [scanLogs, checkpoints]);

  const handleScanSuccess = useCallback(async (badgeId: string, isManual = false) => {
    const brut = badgeId.trim();
    /*
     * 16/11 (test caméra de bout en bout) : après chaque lecture, le scanner redémarre aussitôt et relisait le badge
     * encore présenté : un même passage était enregistré 4 fois en 1,5 s. Même contenu relu par la caméra dans les
     * 8 secondes : ignoré (pas de bip, pas de journal) ; le scanner reprend après une courte pause.
     */
    if (!isManual) {
      const precedent = dernierScanRef.current;
      if (precedent && precedent.texte === brut && Date.now() - precedent.instant < DELAI_RELECTURE_MS) {
        setTimeout(() => setResetKey(k => k + 1), 1500);
        return;
      }
      dernierScanRef.current = { texte: brut, instant: Date.now() };
    }
    // Contenu lu par la caméra gardé tel quel : signature du badge élève (STU_SECURE:…) et identifiant de compte du
    // badge du personnel sont sensibles à la casse. Seule la saisie à la main (matricule) passe en majuscules.
    const resolvedId = isManual && !brut.startsWith('STU_SECURE:') ? brut.toUpperCase() : brut;
    try {
      const apiResult = await securityService.submitScanLog(resolvedId);
      const isAuth = apiResult.statut === 'Autorisé';

      if (isAuth) {
        audioService.playSuccessBeep();
        setFeedback({ success: true, message: apiResult.message });
      } else {
        audioService.playFailureBeep();
        setFeedback({ success: false, message: apiResult.message });
      }

      const newLog: ScanLogItem = {
        id: String(apiResult?.id ?? Date.now()),
        name: String(apiResult?.badgeOwner ?? ''),
        studentId: String(apiResult?.studentId ?? resolvedId),
        status: String(apiResult?.statut ?? 'Inconnu'),
        time: String(apiResult?.time ?? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })),
        type: isManual ? 'Manuel' : 'Scanner',
        date: "Aujourd'hui",
        avatar: null
      };
      setScanLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      if (estHorsLigne(err)) {
        const d = await deciderHorsLigne(resolvedId);
        if (d) {
          mettreEnAttente(resolvedId, d.statut);
          if (d.statut === 'Autorisé') audioService.playSuccessBeep(); else audioService.playFailureBeep();
          setFeedback({ success: d.statut === 'Autorisé', message: d.message });
          setScanLogs((prev) => [{
            id: `hl-${Date.now()}`, name: d.badgeOwner, studentId: resolvedId.split(':')[1] ?? resolvedId, status: d.statut,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), type: isManual ? 'Manuel (hors ligne)' : 'Scanner (hors ligne)',
            date: "Aujourd'hui", avatar: null,
          }, ...prev]);
        } else {
          audioService.playFailureBeep();
          setFeedback({ success: false, message: "Hors ligne et aucune liste d'accès à jour : contrôle impossible. Prévenez l'administration." });
        }
        decrireEtat();
      } else {
        audioService.playFailureBeep();
        // Raison donnée par le serveur (ex. « Terminal … désactivé par l'administration : scan refusé. »)
        setFeedback({ success: false, message: resolveErrorMessage(err) });
      }
    }
    setTimeout(() => setFeedback(null), 4000);
    setResetKey(k => k + 1);
  }, [decrireEtat]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      void handleScanSuccess(manualId.trim(), true);
      setManualId('');
    }
  };

  const checkCheckpoint = (id: string) => {
    audioService.playSuccessBeep();
    const nowStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setCheckpoints((p) => p.map((cp) => cp.id === id ? { ...cp, status: 'Sécurisé', lastCheck: nowStr, guard: 'Vigile connecté' } : cp));
  };

  const resetCheckpoints = () => {
    audioService.playSuccessBeep();
    setCheckpoints((p) => p.map((cp) => ({ ...cp, status: 'En attente', lastCheck: '-', guard: '-' })));
  };
  const clearScanLogs = () => setScanLogs([]);
  const completedCheckpoints = checkpoints.filter((cp) => cp.status === 'Sécurisé').length;
  const progressPercent = checkpoints.length ? Math.round((completedCheckpoints / checkpoints.length) * 100) : 0;
  const { totalPages, paginatedLogs } = applyVigilFilters(scanLogs, searchQuery, dateFilter, currentPage, itemsPerPage);

  return {
    manualId, setManualId, resetKey, feedback, scanLogs, checkpoints, searchQuery, setSearchQuery, showBadge, setShowBadge,
    scanMode, setScanMode, dateFilter, setDateFilter, showDateDropdown, setShowDateDropdown, currentPage, setCurrentPage,
    etatHorsLigne,
    progressPercent, completedCheckpoints, paginatedLogs, totalPages, handleScanSuccess, handleManualSubmit,
    checkCheckpoint, resetCheckpoints, clearScanLogs, activeCheckpoint
  };
}

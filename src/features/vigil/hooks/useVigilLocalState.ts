import { useState, useEffect, useCallback } from 'react';
import { audioService } from '../infrastructure/config/dependencies';
import { securityService } from '@/shared/lib/apiService';
import { applyVigilFilters, DateFilter } from './useVigilFilters';

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

export function useVigilLocalState() {
  const [manualId, setManualId] = useState('');
  const [resetKey, setResetKey] = useState(0);
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
    const resolvedId = badgeId.trim().toUpperCase();
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
    } catch {
      audioService.playFailureBeep();
      setFeedback({ success: false, message: "Échec du scan de badge" });
    }
    setTimeout(() => setFeedback(null), 4000);
    setResetKey(k => k + 1);
  }, []);

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
    progressPercent, completedCheckpoints, paginatedLogs, totalPages, handleScanSuccess, handleManualSubmit,
    checkCheckpoint, resetCheckpoints, clearScanLogs, activeCheckpoint
  };
}

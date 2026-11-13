import React, { useState, useEffect } from 'react';
import { SecuritySubSidebar } from './security/SecuritySubSidebar';
import { AuditTrailTab } from './security/AuditTrailTab';
import { TerminalsTab } from './security/TerminalsTab';
import { CryptoKeysTab } from './security/CryptoKeysTab';
import { VigilRealtimeLogs } from './security/VigilRealtimeLogs';
import { AuditLog, AccessTerminal } from '../../domain/SecurityModels';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { terminauxApi } from './security/terminauxApi';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';

export function AdminSecurityAuditTrail() {
  const [activeTab, setActiveTab] = useState('audit');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Journal d'audit RÉEL (GET /audit/logs/recent) — avant : entrées inventées affichées en permanence
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsError, setLogsError] = useState('');
  // Terminaux d'accès réels (APP-BE-21) — avant : liste vide, Activer / Révoquer ne changeaient que l'affichage
  const [terminals, setTerminals] = useState<AccessTerminal[]>([]);
  const [terminalsLoading, setTerminalsLoading] = useState(true);
  const [terminalsError, setTerminalsError] = useState('');

  useEffect(() => {
    terminauxApi.lister()
      .then((liste) => { setTerminals(Array.isArray(liste) ? liste : []); setTerminalsError(''); })
      .catch((err) => setTerminalsError(`Terminaux indisponibles : ${resolveErrorMessage(err)}`))
      .finally(() => setTerminalsLoading(false));
  }, []);

  useEffect(() => {
    apiClient.get<any[]>('/audit/logs/recent', { params: { limit: 100 } })
      .then((res) => {
        setLogs((Array.isArray(res.data) ? res.data : []).map((l: any) => ({
          id: l.id,
          time: l.timestamp || '',
          user: l.userId || '',
          role: '',
          action: l.action || '',
          details: l.description || '',
          ip: l.ipAddress || '',
          agent: l.userAgent || '',
        })));
        setLogsError('');
      })
      .catch(() => setLogsError("Journal d'audit indisponible."));
  }, []);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const showToast = (message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 4000);
  };

  const remplacer = (t: AccessTerminal) => setTerminals((prev) => prev.map((x) => (x.id === t.id ? t : x)));

  const handleCreateTerminal = async (v: { name: string; location?: string }) => {
    const t = await terminauxApi.creer(v);   // l'erreur remonte au formulaire (affichée sous le champ)
    setTerminals((prev) => [...prev, t]);
    showToast(`Terminal « ${t.name} » enregistré.`, true);
  };

  // Succès annoncé seulement après la réponse du serveur ; sinon, sa raison est affichée
  const handleToggleTerminal = async (id: string) => {
    const t = terminals.find((x) => x.id === id);
    if (!t) return;
    try {
      const maj = await terminauxApi.changerStatut(id, t.status === 'Actif' ? 'Inactif' : 'Actif');
      remplacer(maj);
      showToast(`Terminal ${maj.name} : ${maj.status === 'Actif' ? 'activé' : 'désactivé (scans de son vigile refusés)'}.`, true);
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
    }
  };

  const handleRevokeTerminal = async (id: string) => {
    try {
      const maj = await terminauxApi.revoquer(id);
      remplacer(maj);
      showToast(`Terminal ${maj.name} révoqué : les scans de son vigile sont refusés.`, true);
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
    }
  };

  const handleAssign = async (terminalId: string, vigilId: string) => {
    const maj = await terminauxApi.affecterVigile(terminalId, vigilId);
    // un vigile n'a qu'un terminal : la liste est relue pour refléter le retrait éventuel d'un autre terminal
    terminauxApi.lister().then((liste) => setTerminals(Array.isArray(liste) ? liste : [])).catch(() => remplacer(maj));
    return maj;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="admin-security-root">
      <TabletDrawerWrapper>
        <SecuritySubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </TabletDrawerWrapper>

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px] relative">
        {toast && (
          <div
            className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-black shadow-md flex items-center gap-2 ${
              toast.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-sm">
              {toast.success ? 'check_circle' : 'security'}
            </span>
            <span>{toast.message}</span>
          </div>
        )}

        {activeTab === 'audit' && logsError && <p className="text-sm text-rose-600 p-4">{logsError}</p>}
        {activeTab === 'audit' && <AuditTrailTab logs={logs} />}

        {activeTab === 'realtime' && <VigilRealtimeLogs />}

        {activeTab === 'terminals' && (
          <TerminalsTab
            terminals={terminals}
            chargement={terminalsLoading}
            erreur={terminalsError}
            onCreate={handleCreateTerminal}
            onToggleTerminal={handleToggleTerminal}
            onRevokeTerminal={handleRevokeTerminal}
            onAssign={handleAssign}
          />
        )}

        {activeTab === 'keys' && <CryptoKeysTab />}
      </div>
    </div>
  );
}

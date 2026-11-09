import React, { useEffect, useState } from 'react';
import { getDashboardComplete, getActivities } from '../../../dashboard/infrastructure/api/dashboardService';

interface Props { currency: string; }

interface ActivityItem { key: string; text: string; time: string; type: string; }
interface KpiEntry { value?: string; trend?: string; trendValue?: string; currency?: string; name?: string; }
interface RegionStat { regionName?: string; percentage?: number; colorCode?: string; }

const EMPTY = '—';

/** Recherche un KPI réel (clé backend : recovery_rate, cash_flow, ebitda, qr_suspended, open_tickets…). */
function findKpi(data: any, keys: string[]): KpiEntry | undefined {
  if (!data) return undefined;
  const groups = [data.financialKpis, data.academicKpis, data.securityKpis];
  for (const group of groups) {
    if (!group || typeof group !== 'object') continue;
    for (const k of keys) {
      const entry = group[k] ?? group[k.toUpperCase()];
      if (entry && entry.value != null && String(entry.value).trim() !== '') return entry as KpiEntry;
    }
  }
  return undefined;
}

function mapActivityType(raw?: string): string {
  const t = (raw || '').toLowerCase();
  if (t.includes('inscri')) return 'inscription';
  if (t.includes('paie') || t.includes('payment')) return 'paiement';
  if (t.includes('secur') || t === 'auth') return 'securite';
  if (t.includes('plan')) return 'planning';
  return 'info';
}

export function AdminCEODashboard({ currency }: Props) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let failed = false;
      const [completeRes, activitiesRes] = await Promise.all([
        getDashboardComplete().catch(() => { failed = true; return null; }),
        getActivities(5).catch(() => { failed = true; return null; })
      ]);
      if (completeRes) setDashboardData(completeRes);
      if (Array.isArray(activitiesRes)) {
        setActivities(activitiesRes.map((act: any, i: number) => {
          const ts = act.activityTime || act.createdAt || act.timestamp;
          return {
            key: String(act.id ?? `activite-${i}`),
            text: act.description || (act.activityType ? `Action ${act.activityType}` : EMPTY),
            time: ts ? new Date(ts).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : EMPTY,
            type: mapActivityType(act.activityType),
          };
        }));
      }
      setLoadError(failed);
      setLoading(false);
    };
    fetchData();
  }, []);

  const recoveryKpi = findKpi(dashboardData, ['recovery_rate']);
  const cashFlowKpi = findKpi(dashboardData, ['cash_flow']);
  const ebitdaKpi = findKpi(dashboardData, ['ebitda']);
  const qrKpi = findKpi(dashboardData, ['qr_suspended']);
  const ticketsKpi = findKpi(dashboardData, ['open_tickets']);

  const recoveryRate = recoveryKpi?.value ?? EMPTY;
  const recoveryNum = Number(String(recoveryKpi?.value ?? '').replace(',', '.'));
  const hasRecoveryNum = recoveryKpi != null && Number.isFinite(recoveryNum);
  const cashFlow = cashFlowKpi?.value ?? EMPTY;
  const ebitda = ebitdaKpi?.value ?? EMPTY;
  const ebitdaNum = Number(String(ebitdaKpi?.value ?? '').replace(',', '.'));
  const hasEbitdaNum = ebitdaKpi != null && Number.isFinite(ebitdaNum);

  const activeAlerts: any[] = Array.isArray(dashboardData?.activeAlerts) ? dashboardData.activeAlerts : [];
  const urgentAlerts: any[] = Array.isArray(dashboardData?.urgentAlerts) ? dashboardData.urgentAlerts : [];
  const qrBlocked: string = qrKpi?.value ?? (dashboardData ? String(activeAlerts.filter(a => (a.alertType || '').toLowerCase() === 'security').length) : EMPTY);
  const urgentTickets: string = ticketsKpi?.value ?? (dashboardData ? String(urgentAlerts.length) : EMPTY);
  const bannerAlert = activeAlerts[0];
  const regionalStats: RegionStat[] = Array.isArray(dashboardData?.regionalStats) ? dashboardData.regionalStats : [];

  if (loading) {
    return <div className="p-8 text-center text-xs font-bold text-neutral-500 animate-pulse tracking-widest uppercase">Synchronisation API...</div>;
  }

  return (
    <div className="space-y-4" id="ceo-dashboard-root">
      {loadError && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-[10px] font-bold text-neutral-500">
          Certaines données du tableau de bord sont indisponibles (le serveur n'a pas répondu). Les valeurs manquantes sont affichées « — ».
        </div>
      )}

      {/* Alerte active réelle (aucune bannière si aucune alerte enregistrée) */}
      {bannerAlert && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span translate="no" className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
            <div>
              <h4 className="text-xs font-black text-amber-800">{bannerAlert.title || 'Alerte'}</h4>
              {bannerAlert.message && <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{bannerAlert.message}</p>}
            </div>
          </div>
          {bannerAlert.severity && (
            <span className="text-xs font-mono font-black bg-amber-200/50 text-amber-800 px-2.5 py-1 rounded-full">{bannerAlert.severity}</span>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recovery Rate Circular Progress */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Taux Recouvrement</span>
            <h3 className="text-lg font-extrabold text-[#1E293B]">{recoveryRate}{recoveryKpi ? '%' : ''}</h3>
            {recoveryKpi?.trendValue && (
              <span className={`text-[9px] font-bold ${recoveryKpi.trend === 'down' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {recoveryKpi.trend === 'down' ? '▼' : recoveryKpi.trend === 'up' ? '▲' : '•'} {recoveryKpi.trendValue}
              </span>
            )}
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#F1EFEF" strokeWidth="3" fill="transparent" />
              {hasRecoveryNum && (
                <circle cx="24" cy="24" r="20" stroke="#10B981" strokeWidth="3" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * Math.min(100, Math.max(0, recoveryNum))) / 100} />
              )}
            </svg>
            <span className="absolute text-[9px] font-black">{hasRecoveryNum ? `${Math.round(recoveryNum)}%` : EMPTY}</span>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm space-y-0.5">
          <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Cash Flow</span>
          <h3 className="text-lg font-extrabold text-[#1E293B]">{cashFlow}{cashFlowKpi ? ` ${cashFlowKpi.currency || currency}` : ''}</h3>
          <p className="text-[9px] text-neutral-400 font-semibold">{cashFlowKpi ? 'Valeur enregistrée côté serveur' : 'Aucune donnée'}</p>
        </div>

        {/* EBITDA */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm space-y-0.5">
          <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">EBITDA Opérationnel</span>
          <h3 className="text-lg font-extrabold text-[#1E293B]">{ebitda}{ebitdaKpi ? '%' : ''}</h3>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            {hasEbitdaNum && <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, ebitdaNum))}%` }}></div>}
          </div>
        </div>

        {/* QR Blocked & Support tickets */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-500 text-[10px]">QR Suspendus</span>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-black">{qrBlocked}{qrBlocked !== EMPTY ? ' actifs' : ''}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-500 text-[10px]">Alertes urgentes</span>
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-black">{urgentTickets}{urgentTickets !== EMPTY ? ' urgentes' : ''}</span>
          </div>
        </div>
      </div>

      {/* Real-time feed and map visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider">Activité récente</h4>
          </div>
          <div className="space-y-2">
            {activities.length === 0 && (
              <p className="text-[11px] font-semibold text-neutral-400 p-2">Aucune activité enregistrée.</p>
            )}
            {activities.map(act => (
              <div key={act.key} className="flex items-center gap-3 text-xs p-2 hover:bg-[#FAF8F6] rounded-xl transition-all border border-neutral-50">
                <span translate="no" className="material-symbols-outlined text-[16px] p-1 bg-neutral-100 rounded text-neutral-600">
                  {act.type === 'inscription' ? 'person_add' : act.type === 'paiement' ? 'payments' : act.type === 'securite' ? 'gpp_maybe' : 'schedule'}
                </span>
                <div className="flex-grow flex items-center justify-between">
                  <span className="font-bold text-[#1E293B] truncate max-w-xs">{act.text}</span>
                  <span className="text-[10px] text-neutral-400 font-semibold shrink-0">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
          <h4 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider">Origine Régionale</h4>
          <div className="space-y-2 pt-1">
            {regionalStats.length === 0 && (
              <p className="text-[11px] font-semibold text-neutral-400">Aucune donnée</p>
            )}
            {regionalStats.map((r, i) => {
              const pct = typeof r.percentage === 'number' ? Math.min(100, Math.max(0, r.percentage)) : null;
              return (
                <div key={`${r.regionName ?? 'region'}-${i}`}>
                  <div className="flex justify-between text-[10px] font-bold text-neutral-600 mb-0.5">
                    <span>{r.regionName || EMPTY}</span>
                    <span>{pct != null ? `${pct}%` : EMPTY}</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                    {pct != null && <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: r.colorCode || undefined }}></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

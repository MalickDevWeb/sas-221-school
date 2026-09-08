import React, { useEffect, useState } from 'react';
import { getDashboardComplete, getActivities } from '../../../dashboard/infrastructure/api/dashboardService';

interface Props { currency: string; }

const DEFAULT_ACTIVITIES = [
  { id: 1, text: 'Nouveau inscrit : Amadou Diallo (Master IA)', time: 'À l\'instant', type: 'inscription' },
  { id: 2, text: 'Paiement validé : Fatou Sow (221-MOBI)', time: 'Il y a 5 min', type: 'paiement' },
  { id: 3, text: 'Alerte : scan avec badge SUSPENDU', time: 'Il y a 14 min', type: 'securite' },
  { id: 4, text: 'Cours planifié en Salle 101 (Algo)', time: 'Il y a 1h', type: 'planning' },
];

export function AdminCEODashboard({ currency }: Props) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>(DEFAULT_ACTIVITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [completeRes, activitiesRes] = await Promise.all([
          getDashboardComplete().catch(() => null),
          getActivities(5).catch(() => null)
        ]);
        
        if (completeRes) setDashboardData(completeRes);
        if (activitiesRes && Array.isArray(activitiesRes) && activitiesRes.length > 0) {
           const mapped = activitiesRes.map((act: any) => ({
             id: act.id || Math.random(),
             text: act.description || `Action ${act.activityType}`,
             time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Récent',
             type: act.activityType?.toLowerCase() === 'auth' ? 'securite' : 'info'
           }));
           setActivities(mapped);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recoveryRate = dashboardData?.kpis?.find?.((k: any) => k.name === 'Taux Recouvrement' || k.kpiKey === 'RECOVERY_RATE')?.value || '94.2';
  const cashFlow = dashboardData?.kpis?.find?.((k: any) => k.name === 'Cash Flow' || k.kpiKey === 'CASH_FLOW')?.value || '14 850 000';
  const ebitda = dashboardData?.kpis?.find?.((k: any) => k.name === 'EBITDA' || k.kpiKey === 'EBITDA')?.value || '64.8';
  
  const qrBlocked = dashboardData?.alerts?.filter?.((a: any) => a.isActive && (a.title?.includes('QR') || a.alertType === 'SECURITY'))?.length ?? 12;
  const urgentTickets = dashboardData?.alerts?.filter?.((a: any) => a.isActive && (a.severity === 'HIGH' || a.severity === 'CRITICAL'))?.length ?? 3;

  if (loading) {
    return <div className="p-8 text-center text-xs font-bold text-neutral-500 animate-pulse tracking-widest uppercase">Synchronisation API...</div>;
  }

  return (
    <div className="space-y-4" id="ceo-dashboard-root">
      {/* Weather & Logistics Alert Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span translate="no" className="material-symbols-outlined text-amber-600 text-2xl animate-bounce">thunderstorm</span>
          <div>
            <h4 className="text-xs font-black text-amber-800">Alerte Météo & Logistique de Transport</h4>
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Forte pluie prévue. Bus scolaires pré-déployés. Retards estimés à +15%.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-black bg-amber-200/50 text-amber-800 px-2.5 py-1 rounded-full">28°C • Orageux</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recovery Rate Circular Progress */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Taux Recouvrement</span>
            <h3 className="text-lg font-extrabold text-[#1E293B]">{recoveryRate}%</h3>
            <span className="text-[9px] text-emerald-500 font-bold">▲ +2.4% vs mois dernier</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#F1EFEF" strokeWidth="3" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="#10B981" strokeWidth="3" fill="transparent" strokeDasharray={125} strokeDashoffset={10} />
            </svg>
            <span className="absolute text-[9px] font-black">{Math.round(Number(recoveryRate) || 94)}%</span>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm space-y-0.5">
          <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Cash Flow</span>
          <h3 className="text-lg font-extrabold text-[#1E293B]">{cashFlow} {currency}</h3>
          <p className="text-[9px] text-neutral-400 font-semibold">Solde disponible en temps réel</p>
        </div>

        {/* EBITDA */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm space-y-0.5">
          <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">EBITDA Opérationnel</span>
          <h3 className="text-lg font-extrabold text-[#1E293B]">{ebitda}%</h3>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#B3181C] h-full rounded-full" style={{ width: `${ebitda}%` }}></div>
          </div>
        </div>

        {/* QR Blocked & Support tickets */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-500 text-[10px]">QR Suspendus</span>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-black">{qrBlocked} actifs</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-500 text-[10px]">Tickets ouverts</span>
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-black">{urgentTickets} urgents</span>
          </div>
        </div>
      </div>

      {/* Real-time feed and map visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider">Activité en Direct (API)</h4>
          </div>
          <div className="space-y-2">
            {activities.map(act => (
              <div key={act.id} className="flex items-center gap-3 text-xs p-2 hover:bg-[#FAF8F6] rounded-xl transition-all border border-neutral-50">
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
            {[['Dakar Centre', '65%', 'bg-[#B3181C]'], ['Thiès & Mbour', '20%', 'bg-amber-500'], ['Saint-Louis / Nord', '15%', 'bg-red-300']].map(([label, val, col]) => (
              <div key={label}>
                <div className="flex justify-between text-[10px] font-bold text-neutral-600 mb-0.5">
                  <span>{label}</span>
                  <span>{val}</span>
                </div>
                <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                  <div className={`${col} h-full rounded-full`} style={{ width: val }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


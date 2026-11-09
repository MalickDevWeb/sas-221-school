import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Server, Database, Cpu, HardDrive, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

type EtatApi = { statut: 'UP' | 'DOWN' | 'INCONNU'; latenceMs: number | null; horodatage: string | null; erreur: string | null };

/**
 * Santé du système : seule la disponibilité de l'API est réellement mesurée (GET /common/health,
 * temps de réponse chronométré). Base de données, CPU et stockage n'ont aucune source : « — ».
 */
export const SuperAdminSystemPage = () => {
  const [api, setApi] = useState<EtatApi>({ statut: 'INCONNU', latenceMs: null, horodatage: null, erreur: null });
  const [loading, setLoading] = useState(true);

  const verifier = useCallback(async () => {
    setLoading(true);
    const debut = performance.now();
    try {
      const { data } = await apiClient.get<{ status?: string; timestamp?: string }>('/common/health');
      setApi({
        statut: data?.status === 'UP' ? 'UP' : 'DOWN',
        latenceMs: Math.round(performance.now() - debut),
        horodatage: data?.timestamp ?? null,
        erreur: null,
      });
    } catch (err) {
      setApi({ statut: 'DOWN', latenceMs: null, horodatage: null, erreur: resolveErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void verifier(); }, [verifier]);

  const libelleApi = loading ? 'Vérification…' : api.statut === 'UP' ? 'Opérationnel' : api.statut === 'DOWN' ? 'Injoignable' : '—';
  const monitors = [
    { title: 'Serveur API Spring Boot', status: libelleApi, icon: Server, mesure: api.latenceMs != null ? `${api.latenceMs} ms` : '—', libelleMesure: 'Temps de réponse', reel: true },
    { title: 'Base de données PostgreSQL', status: 'Indisponible', icon: Database, mesure: '—', libelleMesure: 'Charge', reel: false },
    { title: 'Charge CPU Conteneur', status: 'Indisponible', icon: Cpu, mesure: '—', libelleMesure: 'Charge', reel: false },
    { title: 'Stockage Multi-Tenant', status: 'Indisponible', icon: HardDrive, mesure: '—', libelleMesure: 'Occupation', reel: false },
  ];
  const ok = !loading && api.statut === 'UP';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            Infrastructure & Haute Disponibilité
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Système & Santé</h1>
          <p className="text-xs text-slate-400 mt-1">Supervision de l'infrastructure (seules les mesures réellement disponibles sont affichées).</p>
        </div>
        <button
          type="button"
          onClick={() => void verifier()}
          disabled={loading}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold w-fit border disabled:opacity-60 ${ok ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-300 bg-rose-500/10 border-rose-500/20'}`}
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{loading ? 'Vérification de l\'API…' : ok ? 'API joignable — disponibilité globale : —' : `API injoignable${api.erreur ? ` : ${api.erreur}` : ''}`}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {monitors.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                <item.icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                item.reel && ok ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                  : item.reel && !loading ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                  : 'text-slate-400 bg-white/5 border-white/10'
              }`}>{item.status}</span>
            </div>
            <h3 className="font-bold text-white text-xs">{item.title}</h3>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
                <span>{item.libelleMesure}</span>
                <span>{item.mesure}</span>
              </div>
              {!item.reel && <p className="text-[10px] text-slate-500">Aucune source de données</p>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">Événements & Journaux de Santé Récents</h2>
        </div>
        <div className="px-6 py-6 flex items-center gap-3 text-slate-400">
          <Activity className="w-4 h-4 shrink-0" />
          <p className="text-xs">
            {api.horodatage
              ? `Dernier contrôle de santé de l'API : ${new Date(api.horodatage).toLocaleString('fr-FR')}. Aucun autre journal disponible.`
              : 'Aucun journal disponible (aucune source de données).'}
          </p>
        </div>
      </div>
    </div>
  );
};

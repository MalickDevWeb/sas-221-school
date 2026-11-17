import { useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { dateHeureFr } from '@/shared/lib/dateServeur';
import { HistoryAnalyticsStats } from './HistoryAnalyticsStats';
import { libelleDestinataires, personnes, useHistoriqueAnnonces } from './useNotificationsHub';

type Filtre = 'all' | 'ANNONCE' | 'URGENCE';
const FILTRES: { id: Filtre; label: string }[] = [
  { id: 'all', label: 'Tous les envois' },
  { id: 'ANNONCE', label: 'Annonces' },
  { id: 'URGENCE', label: 'Alertes d’urgence' },
];

/** Historique des envois de l'école (GET /v1/notifications/annonces) : destinataires, reçues et lues réelles. */
export function HistoryAnalyticsTab({ onNouvelle }: { onNouvelle?: () => void }) {
  const historique = useHistoriqueAnnonces();
  const [filter, setFilter] = useState<Filtre>('all');
  const [search, setSearch] = useState('');

  if (historique.isLoading) {
    return (
      <div className="space-y-3" id="history-analytics-tab" aria-busy="true">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[0, 1, 2, 3].map(i => <div key={i} className="h-[68px] rounded-xl bg-neutral-100 animate-pulse" />)}</div>
        {[0, 1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />)}
      </div>
    );
  }
  if (historique.isError) {
    return (
      <div id="history-analytics-tab" role="alert" className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl border border-red-200 bg-red-50 text-xs text-red-700 font-semibold">
        <span>Historique indisponible : {resolveErrorMessage(historique.error)}</span>
        <button type="button" onClick={() => void historique.refetch()} className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-[11px] font-black cursor-pointer">Réessayer</button>
      </div>
    );
  }

  const annonces = historique.data ?? [];
  const q = search.trim().toLowerCase();
  const filtered = annonces.filter(a => (filter === 'all' || a.nature === filter) && (!q || a.titre.toLowerCase().includes(q)));

  return (
    <div className="space-y-5 text-xs text-[#4A5568]" id="history-analytics-tab">
      <HistoryAnalyticsStats annonces={annonces} />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer l’historique">
          {FILTRES.map(f => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${filter === f.id ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <input type="search" aria-label="Rechercher un titre" placeholder="Rechercher un titre…" value={search} onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 bg-white rounded-xl text-xs w-full sm:w-64 outline-none focus:border-primary" />
      </div>

      {annonces.length === 0 ? (
        <div className="py-10 px-4 text-center flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[28px]">history</span>
          </div>
          <p className="text-sm font-black text-neutral-800">Aucune annonce envoyée.</p>
          <p className="text-[11px] text-neutral-500 font-semibold max-w-md">Chaque annonce ou alerte envoyée apparaîtra ici, avec le nombre de personnes qui l’ont reçue et lue.</p>
          {onNouvelle && (
            <button type="button" onClick={onNouvelle} className="mt-1 px-3 py-2 bg-primary text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">campaign</span>Écrire une annonce
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-neutral-500 font-semibold">Aucun envoi ne correspond à ce filtre.</p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map(a => {
            const urgence = a.nature === 'URGENCE';
            const pct = a.destinatairesTouches ? Math.round((a.lues / a.destinatairesTouches) * 100) : 0;
            return (
              <li key={a.id} data-annonce={a.id} className="bg-white border border-neutral-200 rounded-2xl p-3.5 flex items-start gap-3 min-w-0">
                <div aria-hidden="true" className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${urgence ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                  <span translate="no" className="material-symbols-outlined text-[18px]">{urgence ? 'emergency' : 'campaign'}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {urgence && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-black uppercase">Urgence</span>}
                    <p className="font-extrabold text-neutral-900 text-xs break-words">{a.titre}</p>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-semibold">
                    {libelleDestinataires(a.destinataires)} · envoyée le {dateHeureFr(a.envoyeeLe)}{a.auteur ? ` par ${a.auteur}` : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[11px] font-bold text-neutral-700" data-recues={a.destinatairesTouches}>Reçue par {personnes(a.destinatairesTouches)}</span>
                    <span className="text-[11px] font-bold text-emerald-700" data-lues={a.lues}>Lue par {a.lues.toLocaleString('fr-FR')}</span>
                    <span className="flex-1 min-w-[80px] max-w-[160px] h-1.5 rounded-full bg-neutral-100 overflow-hidden" aria-hidden="true">
                      <span className="block h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

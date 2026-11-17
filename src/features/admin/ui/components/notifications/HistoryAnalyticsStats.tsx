import type { AnnonceHistorique } from '../../../domain/NotificationsModels';

/** Compteurs calculés sur l'historique renvoyé par le serveur (reçues et lues réelles). */
export function HistoryAnalyticsStats({ annonces }: { annonces: AnnonceHistorique[] }) {
  const urgences = annonces.filter(a => a.nature === 'URGENCE').length;
  const recues = annonces.reduce((s, a) => s + a.destinatairesTouches, 0);
  const lues = annonces.reduce((s, a) => s + a.lues, 0);
  const cartes = [
    { label: 'Envois', value: String(annonces.length), icon: 'send', color: 'text-primary' },
    { label: 'Dont alertes d’urgence', value: String(urgences), icon: 'emergency', color: 'text-red-600' },
    { label: 'Notifications reçues', value: recues.toLocaleString('fr-FR'), icon: 'inbox', color: 'text-sky-600' },
    { label: 'Lues', value: recues ? `${lues.toLocaleString('fr-FR')} (${Math.round((lues / recues) * 100)} %)` : '0', icon: 'mark_email_read', color: 'text-emerald-600' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cartes.map(stat => (
        <div key={stat.label} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-neutral-500 truncate">{stat.label}</span>
            <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-lg shrink-0 ${stat.color}`}>{stat.icon}</span>
          </div>
          <div className="text-lg font-black text-neutral-900 tracking-tight truncate">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

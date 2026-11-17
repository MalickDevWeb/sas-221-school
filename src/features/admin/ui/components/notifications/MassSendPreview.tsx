import { useTenantStore } from '@/core/store/tenantStore';

interface Props {
  title: string;
  content: string;
  urgence?: boolean;
}

/**
 * Aperçu de la notification telle qu'elle apparaîtra dans la cloche du destinataire (nom de l'école courante).
 * Aucun accusé « distribué » : le suivi réel (reçue / lue) est dans l'Historique.
 */
export function MassSendPreview({ title, content, urgence = false }: Props) {
  const ecole = useTenantStore(s => s.currentTenant?.name);
  return (
    <div className="min-w-0 space-y-2">
      <span className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">Aperçu dans la cloche du destinataire</span>
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 min-h-[200px]">
        <div className={`bg-white border rounded-xl p-3.5 space-y-1.5 shadow-xs ${urgence ? 'border-red-300' : 'border-neutral-200'}`}>
          <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-neutral-500">
            <span className="flex items-center gap-1.5 min-w-0">
              <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[16px] ${urgence ? 'text-red-600' : 'text-primary'}`}>{urgence ? 'emergency' : 'campaign'}</span>
              <span className="truncate">{ecole || 'Votre école'}</span>
            </span>
            {urgence && <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[9px] font-black uppercase">Urgence</span>}
          </div>
          <p className={`text-xs font-black break-words ${title ? 'text-neutral-900' : 'text-neutral-400'}`}>{title || (urgence ? 'Titre de l’alerte' : 'Titre de l’annonce')}</p>
          <p className={`text-[11px] whitespace-pre-wrap break-words ${content ? 'text-neutral-700' : 'text-neutral-400'}`}>{content || 'Le message s’affichera ici.'}</p>
        </div>
      </div>
    </div>
  );
}

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/**
 * Recouvrement : relances aux familles.
 * Avant : barre de progression simulée puis « 42 SMS/WhatsApp envoyés », alors qu'aucun appel au serveur n'était fait.
 * Maintenant : la vraie route est appelée et sa réponse est affichée telle quelle (aujourd'hui : non disponible, faute
 * d'échéancier enregistré). APP-TL-22 (2026-11-14) : la suspension de l'accès des élèves pour impayé est retirée ;
 * aucun élève n'est privé de campus, d'application ni de bulletin à cause des frais.
 */
export function AutomationTab() {
  const action = useMutation({
    mutationFn: async (route: '/finance/payment-reminders') => {
      const { data } = await apiClient.post(route);
      return typeof data?.message === 'string' ? data.message : 'Action effectuée par le serveur.';
    },
  });
  const resultat = action.isSuccess ? action.data : action.isError ? resolveErrorMessage(action.error) : null;

  return (
    <div className="space-y-6 text-xs font-bold text-[#4A5568]" id="automation-tab-root">
      <div className="pb-2 border-b border-neutral-100">
        <h3 className="font-extrabold text-sm text-[#1E293B]">Recouvrement</h3>
        <p className="text-[10px] text-neutral-400 font-semibold">
          Relances des familles. L'accès d'un élève au campus et à l'application ne dépend jamais des frais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <span translate="no" className="material-symbols-outlined text-xl">sms</span>
            <span className="text-[10px] font-black uppercase tracking-wider">Relances de paiement</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold leading-normal">
            Envoie un rappel aux familles dont le dossier n'est pas soldé.
          </p>
          <button
            type="button"
            onClick={() => action.mutate('/finance/payment-reminders')}
            disabled={action.isPending}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl uppercase tracking-wider text-[9px] font-black transition-all cursor-pointer"
          >
            Envoyer les relances
          </button>
        </div>
      </div>

      {action.isPending && <p role="status" className="text-[11px] text-neutral-500">Envoi de la demande au serveur…</p>}
      {resultat && (
        <p role={action.isError ? 'alert' : 'status'} id="recouvrement-resultat"
          className={`p-3 rounded-xl border text-[11px] ${action.isError ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {resultat}
        </p>
      )}
    </div>
  );
}

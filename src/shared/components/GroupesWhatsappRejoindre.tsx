import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

interface GroupeARejoindre { id: string; nom: string; classe: string | null; lien: string }

/**
 * Groupes WhatsApp de l'école à rejoindre (FEAT-007, US-04), sur l'accueil de l'élève et du parent : seulement ceux qui
 * le concernent (toute l'école, et sa classe ou celle de son enfant). Rien n'est affiché s'il n'y en a aucun.
 */
export function GroupesWhatsappRejoindre({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['groupes-whatsapp', 'mes'],
    queryFn: async () => (await apiClient.get<GroupeARejoindre[]>('/groupes-whatsapp/mes')).data,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const groupes = data ?? [];
  if (groupes.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined">forum</span>
        </span>
        <div>
          <h2 id={`${id}-titre`} className="font-black text-base leading-tight text-emerald-950">Groupes WhatsApp de l’école</h2>
          <p className="text-xs text-emerald-900/80 font-semibold">Les annonces de l’école y sont aussi partagées.</p>
        </div>
      </div>
      <ul className="space-y-2">
        {groupes.map((g) => (
          <li key={g.id} className="bg-white rounded-2xl p-3 flex flex-wrap items-center gap-3 text-neutral-900 border border-emerald-100">
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm">{g.nom}</p>
              {g.classe && <p className="text-xs text-neutral-500 font-semibold">{g.classe}</p>}
            </div>
            <a href={g.lien} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">group_add</span>
              Rejoindre
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

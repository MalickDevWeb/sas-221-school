import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useRbacStore } from '@/core/store/rbacStore';

/**
 * Trimestres de l'école et clôture des notes (BR-04). Une évaluation appartient à la période qui
 * contient sa date ; une période clôturée fige ses évaluations et leurs notes (règle appliquée par le serveur).
 */
interface Periode { id: string; libelle: string; dateDebut: string; dateFin: string; cloturee: boolean; clotureeLe?: string | null }

const jour = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export function PeriodesTab() {
  const qc = useQueryClient();
  const peutModifier = useRbacStore((s) => s.peut('ecole.ecrire'));
  const administration = useRbacStore((s) => s.mesDroits?.administration ?? false);
  const [libelle, setLibelle] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null);

  const periodes = useQuery({
    queryKey: ['admin', 'periodes'],
    queryFn: async () => (await apiClient.get('/admin/periodes')).data as Periode[],
  });
  const action = useMutation({ mutationFn: async (f: () => Promise<unknown>) => f(), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'periodes'] }) });
  const executer = async (f: () => Promise<unknown>, succes: string) => {
    setMessage(null);
    try { await action.mutateAsync(f); setMessage({ texte: succes, ok: true }); return true; } catch (e) { setMessage({ texte: resolveErrorMessage(e), ok: false }); return false; }
  };

  const creer = async () => {
    if (!libelle.trim()) { setMessage({ texte: 'Le libellé est obligatoire (ex. : Trimestre 1).', ok: false }); return; }
    if (!debut || !fin) { setMessage({ texte: 'Les dates de début et de fin sont obligatoires.', ok: false }); return; }
    const ok = await executer(() => apiClient.post('/admin/periodes', { libelle: libelle.trim(), dateDebut: debut, dateFin: fin }), `Période « ${libelle.trim()} » créée.`);
    if (ok) { setLibelle(''); setDebut(''); setFin(''); }
  };

  return (
    <div className="space-y-5 text-xs" id="periodes-tab">
      <div>
        <h3 className="font-black text-base text-[#1E293B]">Trimestres et clôture des notes</h3>
        <p className="text-[11px] text-neutral-500 font-medium max-w-3xl">
          Chaque évaluation appartient à la période qui contient sa date. Une fois la période clôturée, ses évaluations et
          leurs notes ne peuvent plus être créées, modifiées ni supprimées, même par l'enseignant (règle BR-04). Seule
          l'administration peut rouvrir une période ; la réouverture est inscrite au journal d'audit.
        </p>
      </div>

      {message && (
        <p role={message.ok ? 'status' : 'alert'} id="periodes-message"
          className={`p-3 rounded-xl border font-bold ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.texte}
        </p>
      )}

      {peutModifier && (
        <section className="p-4 rounded-2xl border border-neutral-200 bg-[#FAF8F6] grid grid-cols-1 md:grid-cols-4 gap-3 items-end" id="periode-nouvelle">
          <label className="flex flex-col gap-1 font-bold text-neutral-600">Libellé
            <input id="periode-libelle" value={libelle} onChange={(e) => setLibelle(e.target.value)} maxLength={60} placeholder="Trimestre 1"
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white font-medium" />
          </label>
          <label className="flex flex-col gap-1 font-bold text-neutral-600">Début
            <input id="periode-debut" type="date" value={debut} onChange={(e) => setDebut(e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-xl bg-white" />
          </label>
          <label className="flex flex-col gap-1 font-bold text-neutral-600">Fin
            <input id="periode-fin" type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-xl bg-white" />
          </label>
          <button type="button" id="periode-creer" onClick={() => void creer()} disabled={action.isPending}
            className="px-4 py-2 bg-primary text-white rounded-xl font-black border-0 cursor-pointer disabled:opacity-50">Ajouter la période</button>
        </section>
      )}

      {periodes.isError && <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">Périodes indisponibles : {resolveErrorMessage(periodes.error)}</p>}
      {periodes.data && periodes.data.length === 0 && <p className="text-neutral-500 font-medium">Aucune période définie : les notes restent modifiables à tout moment.</p>}

      <ul className="space-y-2" id="periodes-liste">
        {periodes.data?.map((p) => (
          <li key={p.id} data-periode={p.libelle} className="p-3 rounded-xl border border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-extrabold text-[#1E293B]">{p.libelle}</p>
              <p className="text-[11px] text-neutral-500 font-semibold">Du {jour(p.dateDebut)} au {jour(p.dateFin)}{p.clotureeLe ? ` · clôturée le ${new Date(p.clotureeLe).toLocaleDateString('fr-FR')}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${p.cloturee ? 'bg-neutral-100 text-neutral-700 border-neutral-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                {p.cloturee ? 'Clôturée' : 'Ouverte'}
              </span>
              {!p.cloturee && peutModifier && (
                <>
                  <button type="button" className="px-3 py-1.5 rounded-lg bg-[#1E293B] text-white text-[11px] font-black border-0 cursor-pointer"
                    onClick={() => { if (window.confirm(`Clôturer « ${p.libelle} » ? Ses notes ne pourront plus être modifiées.`)) void executer(() => apiClient.post(`/admin/periodes/${p.id}/cloturer`), `« ${p.libelle} » clôturée : ses notes sont figées.`); }}>
                    Clôturer
                  </button>
                  <button type="button" className="px-3 py-1.5 rounded-lg bg-white text-rose-700 border border-rose-200 text-[11px] font-black cursor-pointer"
                    onClick={() => void executer(() => apiClient.delete(`/admin/periodes/${p.id}`), `« ${p.libelle} » supprimée.`)}>
                    Supprimer
                  </button>
                </>
              )}
              {p.cloturee && administration && (
                <button type="button" className="px-3 py-1.5 rounded-lg bg-white text-amber-800 border border-amber-300 text-[11px] font-black cursor-pointer"
                  onClick={() => { if (window.confirm(`Rouvrir « ${p.libelle} » ? Les notes redeviendront modifiables (action tracée).`)) void executer(() => apiClient.post(`/admin/periodes/${p.id}/rouvrir`), `« ${p.libelle} » rouverte (inscrit au journal d'audit).`); }}>
                  Rouvrir
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

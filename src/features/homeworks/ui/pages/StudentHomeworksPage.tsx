import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { deposerDevoir, mesDevoirsClasse, verifierFichier, type DevoirClasse, type EtatDevoir } from '../../api/devoirsClasse';
import { DevoirClasseCarte } from '../components/DevoirClasseCarte';

const COLONNES: { etat: EtatDevoir; titre: string; vide: string; pastille: string }[] = [
  { etat: 'a_rendre', titre: 'À rendre', vide: 'Aucun devoir à rendre.', pastille: 'bg-neutral-400' },
  { etat: 'rendu', titre: 'Rendus — en attente de correction', vide: 'Aucun devoir en attente de correction.', pastille: 'bg-blue-500' },
  { etat: 'corrige', titre: 'Corrigés', vide: 'Aucun devoir corrigé pour le moment.', pastille: 'bg-emerald-500' },
];

/** Devoirs publiés par les professeurs pour la classe de l'élève : rendu, retard, note et commentaire réels. */
export function StudentHomeworksPage() {
  const client = useQueryClient();
  const devoirs = useQuery({ queryKey: ['eleve', 'devoirs-classe'], queryFn: mesDevoirsClasse });
  const [cours, setCours] = useState('');
  const [onglet, setOnglet] = useState<EtatDevoir>('a_rendre');
  const [messages, setMessages] = useState<Record<string, { texte: string; ok: boolean }>>({});
  const envois = useRef(new Set<string>());   // double clic / double choix : un seul envoi par devoir

  const depot = useMutation({
    mutationFn: ({ devoir, fichier }: { devoir: DevoirClasse; fichier: File }) => deposerDevoir(devoir, fichier),
    onSettled: () => client.invalidateQueries({ queryKey: ['eleve', 'devoirs-classe'] }),
  });

  const deposer = (devoir: DevoirClasse, fichier: File) => {
    const refus = verifierFichier(fichier);
    if (refus) {
      setMessages((m) => ({ ...m, [devoir.id]: { texte: refus, ok: false } }));
      return;
    }
    if (envois.current.has(devoir.id)) return;
    envois.current.add(devoir.id);
    setMessages((m) => ({ ...m, [devoir.id]: { texte: `Envoi de « ${fichier.name} »…`, ok: true } }));
    depot.mutate({ devoir, fichier }, {
      onSuccess: (texte) => setMessages((m) => ({ ...m, [devoir.id]: { texte, ok: true } })),
      onError: (e) => setMessages((m) => ({ ...m, [devoir.id]: { texte: resolveErrorMessage(e), ok: false } })),
      onSettled: () => envois.current.delete(devoir.id),
    });
  };

  const liste = useMemo(() => devoirs.data ?? [], [devoirs.data]);
  const coursDisponibles = useMemo(() => [...new Set(liste.map((d) => d.cours))].sort((a, b) => a.localeCompare(b, 'fr')), [liste]);
  const filtres = liste.filter((d) => !cours || d.cours === cours);
  const parEtat = (e: EtatDevoir) => filtres.filter((d) => d.etat === e);

  return (
    <section id="student-homeworks-section" className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8 animate-fade-in">
      <div className="mb-5 border-b border-neutral-gray-200/50 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl text-on-surface font-black tracking-tight">Mes devoirs</h2>
          <p className="text-neutral-gray-500 font-semibold text-[11px] md:text-xs mt-1">Devoirs publiés par vos professeurs : déposez votre travail, suivez la correction.</p>
        </div>
        {coursDisponibles.length > 1 && (
          <label className="text-[11px] font-bold text-neutral-600 flex items-center gap-2">
            Cours
            <select value={cours} onChange={(e) => setCours(e.target.value)} className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold">
              <option value="">Tous les cours</option>
              {coursDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
      </div>

      {devoirs.isLoading && <p className="text-xs font-bold text-neutral-400 animate-pulse">Chargement de vos devoirs…</p>}
      {devoirs.isError && (
        <p role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
          Vos devoirs n'ont pas pu être chargés : {resolveErrorMessage(devoirs.error)}
        </p>
      )}

      {!devoirs.isLoading && !devoirs.isError && (
        <>
          <div className="lg:hidden flex bg-[#FAF8F6] p-1.5 rounded-2xl border border-neutral-200/50 mb-5 gap-1.5">
            {COLONNES.map((c) => (
              <button key={c.etat} type="button" onClick={() => setOnglet(c.etat)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer ${onglet === c.etat ? 'bg-white shadow-3xs text-primary' : 'text-neutral-500'}`}>
                {c.titre.split(' —')[0]} ({parEtat(c.etat).length})
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COLONNES.map((c) => (
              <div key={c.etat} data-colonne={c.etat} className={`space-y-3 ${onglet === c.etat ? 'block' : 'hidden lg:block'}`}>
                <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.pastille}`} /> {c.titre}
                  <span className="text-neutral-400">({parEtat(c.etat).length})</span>
                </h3>
                {parEtat(c.etat).length === 0
                  ? <p className="text-[11px] font-semibold text-neutral-400 bg-white border border-dashed border-neutral-200 rounded-2xl p-4 text-center">{c.vide}</p>
                  : parEtat(c.etat).map((d) => (
                      <DevoirClasseCarte key={d.id} devoir={d} onDeposer={deposer} message={messages[d.id]}
                                         envoiEnCours={depot.isPending && depot.variables?.devoir.id === d.id} />
                    ))}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

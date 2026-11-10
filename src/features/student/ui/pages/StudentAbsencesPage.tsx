import React, { useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useMonAssiduite, type SeanceManquee, type StatutPresence } from '../../hooks/useMonAssiduite';

const LIBELLES: Record<Exclude<StatutPresence, 'PRESENT'>, { texte: string; classe: string; icone: string }> = {
  ABSENT: { texte: 'Absent', classe: 'bg-red-50 text-red-700 border-red-200', icone: 'event_busy' },
  RETARD: { texte: 'En retard', classe: 'bg-amber-50 text-amber-800 border-amber-200', icone: 'schedule' },
  EXCUSE: { texte: 'Excusé', classe: 'bg-sky-50 text-sky-800 border-sky-200', icone: 'verified' },
};

type Filtre = 'TOUS' | Exclude<StatutPresence, 'PRESENT'>;

function formatTaux(taux: number | null): string {
  return taux == null ? '—' : `${taux.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

function couleurTaux(taux: number | null): string {
  if (taux == null) return 'bg-neutral-300';
  if (taux >= 90) return 'bg-emerald-500';
  if (taux >= 75) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso
    : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function Tuile({ libelle, valeur, detail }: { libelle: string; valeur: string; detail?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-gray-200/70 p-4 md:p-5 border-solid">
      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-gray-500">{libelle}</p>
      <p className="text-2xl md:text-3xl font-black text-on-surface mt-1 tabular-nums">{valeur}</p>
      {detail && <p className="text-[11px] font-semibold text-neutral-gray-500 mt-1">{detail}</p>}
    </div>
  );
}

function LigneSeance({ s }: { s: SeanceManquee }) {
  const l = LIBELLES[s.statut];
  return (
    <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 border-b border-neutral-gray-200/60 last:border-b-0">
      <span className={`inline-flex items-center gap-1 w-fit px-2.5 py-1 rounded-full border text-[11px] font-black border-solid ${l.classe}`}>
        <span translate="no" className="material-symbols-outlined text-[14px]">{l.icone}</span>{l.texte}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface">{s.cours}</p>
        <p className="text-xs text-neutral-gray-500 font-semibold first-letter:uppercase">
          {formatDate(s.date)}{s.horaire ? ` · ${s.horaire}` : ''}{s.salle ? ` · ${s.salle}` : ''}
        </p>
        {s.justificatif && (
          <p className={`text-[11px] font-bold mt-1 ${s.justificatif.statut === 'REFUSE' ? 'text-red-700' : s.justificatif.statut === 'ACCEPTE' ? 'text-emerald-700' : 'text-amber-700'}`}>
            {s.justificatif.statut === 'EN_ATTENTE' ? 'Justificatif de vos parents en attente de validation'
              : s.justificatif.statut === 'ACCEPTE' ? 'Justificatif accepté par l\'établissement'
              : `Justificatif refusé${s.justificatif.motifRefus ? ` : ${s.justificatif.motifRefus}` : ''}`}
          </p>
        )}
        {s.observation && (
          <p className="text-xs text-on-surface mt-1.5 bg-surface-container-lowest rounded-lg px-2.5 py-1.5">
            <span className="font-bold">Observation du professeur : </span>{s.observation}
          </p>
        )}
      </div>
    </li>
  );
}

/** « Mes absences » : l'appel fait par les professeurs, vu par l'élève (lot A). */
export function StudentAbsencesPage() {
  const { data, isLoading, error } = useMonAssiduite();
  const [filtre, setFiltre] = useState<Filtre>('TOUS');

  if (isLoading || error || !data) {
    return (
      <main className="flex-1 p-4 md:p-8 bg-surface-container-lowest min-h-screen flex items-center justify-center font-sans">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-bold text-secondary">Chargement de votre assiduité...</p>
          </div>
        ) : (
          <div role="alert" className="bg-red-50 text-error p-6 rounded-2xl border border-red-100 text-center border-solid">
            <span translate="no" className="material-symbols-outlined text-[32px] mb-2">error</span>
            <h3 className="font-bold">Impossible de charger vos absences</h3>
            <p className="text-sm">{resolveErrorMessage(error)}</p>
          </div>
        )}
      </main>
    );
  }

  const { global, cours, seances } = data;
  const visibles = filtre === 'TOUS' ? seances : seances.filter((s) => s.statut === filtre);
  const filtres: { id: Filtre; texte: string; nb: number }[] = [
    { id: 'TOUS', texte: 'Toutes', nb: seances.length },
    { id: 'ABSENT', texte: 'Absences', nb: global.absent },
    { id: 'RETARD', texte: 'Retards', nb: global.retard },
    { id: 'EXCUSE', texte: 'Excusées', nb: global.excuse },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 bg-surface-container-lowest relative min-h-screen pb-24 md:pb-8 font-sans">
      <div className="mb-6 border-b border-neutral-gray-200/50 pb-4">
        <h2 className="text-xl md:text-2xl text-on-surface font-black tracking-tight leading-tight">Mes absences</h2>
        <p className="text-neutral-gray-500 font-semibold text-[11px] md:text-xs mt-1">
          L'appel fait par vos professeurs, séance par séance.
        </p>
      </div>

      <section aria-label="Résumé" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Tuile libelle="Taux d'assiduité" valeur={formatTaux(global.taux)}
          detail={global.seancesNotees ? `${global.seancesNotees} séance${global.seancesNotees > 1 ? 's' : ''} notée${global.seancesNotees > 1 ? 's' : ''}` : 'Aucun appel pour le moment'} />
        <Tuile libelle="Absences" valeur={String(global.absent)} />
        <Tuile libelle="Retards" valeur={String(global.retard)} />
        <Tuile libelle="Excusées" valeur={String(global.excuse)} />
      </section>
      <p className="text-[11px] text-neutral-gray-500 font-semibold mt-2">
        Taux = séances où vous étiez présent ou en retard ÷ séances où l'appel a été fait. Une absence excusée ne compte pas comme une présence.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <section aria-labelledby="titre-par-cours" className="lg:col-span-5 bg-white rounded-2xl border border-neutral-gray-200/70 border-solid">
          <h3 id="titre-par-cours" className="text-sm font-black text-on-surface px-4 pt-4 pb-2">Par cours</h3>
          {cours.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-neutral-gray-500 font-semibold">Vous n'êtes inscrit dans aucun cours pour le moment.</p>
          ) : (
            <ul>
              {cours.map((c) => (
                <li key={c.courseId} className="px-4 py-3 border-t border-neutral-gray-200/60">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{c.cours}</p>
                      {c.professeur && <p className="text-[11px] text-neutral-gray-500 font-semibold truncate">{c.professeur}</p>}
                    </div>
                    <p className="text-sm font-black tabular-nums text-on-surface shrink-0">{formatTaux(c.taux)}</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-gray-200/70 mt-2 overflow-hidden" aria-hidden="true">
                    <div className={`h-full rounded-full ${couleurTaux(c.taux)}`} style={{ width: `${c.taux ?? 0}%` }} />
                  </div>
                  <p className="text-[11px] text-neutral-gray-500 font-semibold mt-1.5">
                    {c.seancesNotees === 0 ? 'Aucun appel pour ce cours'
                      : `${c.absent} absence${c.absent > 1 ? 's' : ''} · ${c.retard} retard${c.retard > 1 ? 's' : ''} · ${c.excuse} excusée${c.excuse > 1 ? 's' : ''} sur ${c.seancesNotees} séance${c.seancesNotees > 1 ? 's' : ''}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titre-seances" className="lg:col-span-7 bg-white rounded-2xl border border-neutral-gray-200/70 border-solid">
          <div className="px-4 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 id="titre-seances" className="text-sm font-black text-on-surface">Séances manquées</h3>
            <div role="group" aria-label="Filtrer les séances" className="flex flex-wrap gap-1.5">
              {filtres.map((f) => (
                <button key={f.id} type="button" onClick={() => setFiltre(f.id)} aria-pressed={filtre === f.id}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black border border-solid transition-colors cursor-pointer ${filtre === f.id ? 'bg-primary text-text-on-primary border-primary' : 'bg-white text-secondary border-neutral-gray-200 hover:bg-secondary-container/40'}`}>
                  {f.texte} ({f.nb})
                </button>
              ))}
            </div>
          </div>
          {visibles.length === 0 ? (
            <p className="px-4 pb-5 text-xs text-neutral-gray-500 font-semibold border-t border-neutral-gray-200/60 pt-4">
              {seances.length === 0
                ? (global.seancesNotees ? 'Aucune absence ni retard : vous avez assisté à toutes les séances notées.' : 'Aucun appel n\'a encore été fait dans vos cours.')
                : 'Aucune séance dans cette catégorie.'}
            </p>
          ) : (
            <ul className="border-t border-neutral-gray-200/60">
              {visibles.map((s) => <LigneSeance key={s.id} s={s} />)}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default StudentAbsencesPage;

import React, { useState } from 'react';
import { useParentContext } from '../components/layout/ParentContext';
import { ParentErrorState } from '../components/ParentStatusBlocks';
import { JustificationAbsenceModal } from '../components/JustificationAbsenceModal';
import { parPresence, useMesJustificatifs } from '../../justificatifsApi';
import type { ChildAttendance } from '../../types';

/*
 * Présentation : bandeau aux couleurs de l'école, cartes de compteurs, taux avec anneau, filtres à icônes, lignes
 * claires. Couleurs des statuts fixes (vert, rouge, orange, bleu) : elles ont un sens. Rien d'inventé :
 * sans pointage, le taux reste « — » (jamais « 100 % »), pas de tendance « +0 % », pas de sélecteur d'année inopérant.
 */

const STATUT_CONFIG = {
  PRESENT: { label: 'Présent', ligne: 'border-emerald-100', pastille: 'bg-emerald-50 text-emerald-700 border-emerald-200', fond: 'bg-emerald-100', color: 'text-emerald-600', icon: 'check_circle' },
  ABSENT:  { label: 'Absent',  ligne: 'border-red-100',     pastille: 'bg-red-50 text-red-700 border-red-200',             fond: 'bg-red-100',     color: 'text-red-600',     icon: 'cancel' },
  RETARD:  { label: 'Retard',  ligne: 'border-amber-100',   pastille: 'bg-amber-50 text-amber-700 border-amber-200',       fond: 'bg-amber-100',   color: 'text-amber-600',   icon: 'schedule' },
  EXCUSE:  { label: 'Excusé',  ligne: 'border-sky-100',     pastille: 'bg-sky-50 text-sky-700 border-sky-200',             fond: 'bg-sky-100',     color: 'text-sky-600',     icon: 'verified' },
};

type Filtre = 'TOUT' | 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';

const FILTRES: { id: Filtre; label: string; icon: string; couleur: string }[] = [
  { id: 'TOUT', label: 'Tout', icon: 'event_note', couleur: '' },
  { id: 'PRESENT', label: 'Présences', icon: 'check_circle', couleur: 'text-emerald-600' },
  { id: 'ABSENT', label: 'Absences', icon: 'cancel', couleur: 'text-red-600' },
  { id: 'RETARD', label: 'Retards', icon: 'schedule', couleur: 'text-amber-500' },
  { id: 'EXCUSE', label: 'Excusées', icon: 'description', couleur: 'text-sky-600' },
];

const CARTES = [
  { statut: 'PRESENT' as Filtre, label: 'Présences', icon: 'check', fond: 'from-emerald-50', halo: 'bg-emerald-100', rond: 'bg-emerald-500', texte: 'text-emerald-600', anneau: 'ring-emerald-300' },
  { statut: 'ABSENT' as Filtre, label: 'Absences', icon: 'close', fond: 'from-rose-50', halo: 'bg-rose-100', rond: 'bg-rose-500', texte: 'text-rose-600', anneau: 'ring-rose-300' },
  { statut: 'RETARD' as Filtre, label: 'Retards', icon: 'schedule', fond: 'from-amber-50', halo: 'bg-amber-100', rond: 'bg-amber-500', texte: 'text-amber-600', anneau: 'ring-amber-300' },
];

/** Appréciation du taux réel ; null = aucun pointage. */
function appreciation(taux: number | null): string {
  if (taux === null) return 'Aucun pointage enregistré pour le moment.';
  if (taux >= 90) return 'Une excellente assiduité !';
  if (taux >= 75) return 'Une bonne assiduité.';
  if (taux >= 60) return 'Assiduité à surveiller.';
  return 'Assiduité insuffisante : parlez-en avec l\'établissement.';
}

/** Anneau du taux de présence (SVG) ; gris et « — » sans données. */
function Anneau({ taux }: { taux: number | null }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const couleur = taux === null ? '#E5E7EB' : taux >= 80 ? '#10B981' : taux >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative w-36 h-36 shrink-0" aria-label={taux === null ? 'Taux de présence indisponible' : `Taux de présence ${taux} %`}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="12" />
        {taux !== null && (
          <circle cx="60" cy="60" r={r} fill="none" stroke={couleur} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, taux)) / 100)} />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-neutral-900">{taux === null ? '—' : `${taux}%`}</span>
        <span className="text-xs font-semibold text-neutral-500">Présence</span>
      </div>
    </div>
  );
}

export function ParentAttendancePage() {
  const { attendances, selectedChild, stats, loading, errors, retry } = useParentContext();
  const [filtre, setFiltre] = useState<Filtre>('TOUT');
  const [aJustifier, setAJustifier] = useState<ChildAttendance | null>(null);
  const { data: justificatifs } = useMesJustificatifs();
  const justifParPresence = parPresence(justificatifs);

  const attendancesError = errors?.attendances ?? null;

  // les plus récentes d'abord
  const filtered = (filtre === 'TOUT' ? attendances : attendances.filter((a) => a.statut === filtre))
    .slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const present = attendances.filter((a) => a.statut === 'PRESENT').length;
  const absent  = attendances.filter((a) => a.statut === 'ABSENT').length;
  const retard  = attendances.filter((a) => a.statut === 'RETARD').length;
  const excuse  = attendances.filter((a) => a.statut === 'EXCUSE').length;
  const total   = attendances.length;
  const compte: Record<string, number> = { PRESENT: present, ABSENT: absent, RETARD: retard, EXCUSE: excuse };
  // Taux fourni par le serveur (stats) ; sans aucun pointage, il n'a pas de sens : « — » (jamais 100 %)
  const tauxPresence = total === 0 ? null : (stats?.tauxPresence ?? null);
  const prenom = selectedChild?.prenom ?? 'l\'élève';

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8 space-y-5">

      {aJustifier && <JustificationAbsenceModal presence={aJustifier} onClose={() => setAJustifier(null)} />}

      {/* Bandeau */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark text-text-on-primary px-5 md:px-8 py-5 md:py-6 flex items-center gap-4 md:gap-5 shadow-md">
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-[999px] bg-white/10" />
        <span aria-hidden translate="no" className="pointer-events-none absolute right-8 -bottom-6 material-symbols-outlined text-[120px] opacity-10">school</span>
        <span className="w-14 h-14 md:w-16 md:h-16 rounded-[999px] bg-white/20 flex items-center justify-center shrink-0">
          <span translate="no" className="material-symbols-outlined text-3xl md:text-4xl">event_available</span>
        </span>
        <div className="min-w-0 relative">
          <h2 className="text-xl md:text-2xl font-black leading-tight">Présences de {prenom}</h2>
          <p className="text-xs md:text-sm font-semibold opacity-90 mt-1">Suivez la présence de votre enfant à l'école, au fil des appels des professeurs.</p>
        </div>
      </header>

      {/* Compteurs (cliquables : filtrent la liste) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARTES.map((c) => (
          <button key={c.statut} type="button" onClick={() => setFiltre((f) => (f === c.statut ? 'TOUT' : c.statut))}
            aria-pressed={filtre === c.statut}
            className={`relative overflow-hidden text-left rounded-3xl bg-gradient-to-br ${c.fond} to-white border border-neutral-100 shadow-sm hover:shadow-md transition-all p-5 flex items-center gap-4 cursor-pointer ${filtre === c.statut ? `ring-2 ${c.anneau}` : ''}`}>
            {/* Pastille ronde à deux niveaux (arrondi forcé : un style global rendait les pastilles carrées) */}
            <span className={`w-14 h-14 ${c.halo} flex items-center justify-center shrink-0`} style={{ borderRadius: 9999 }}>
              <span className={`w-10 h-10 ${c.rond} text-white flex items-center justify-center shadow-sm`} style={{ borderRadius: 9999 }}>
                <span translate="no" className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'wght' 700" }}>{c.icon}</span>
              </span>
            </span>
            <span>
              <span className={`block text-3xl font-black ${c.texte}`}>{compte[c.statut]}</span>
              <span className="block text-sm font-semibold text-neutral-700">{c.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Taux de présence */}
      <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 md:p-6 flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-2 bg-primary-light text-primary rounded-[999px] px-3 py-1.5 text-sm font-black">
            <span translate="no" className="material-symbols-outlined text-lg">bar_chart</span>
            Taux de présence global
          </span>
          <p className={`mt-3 text-4xl md:text-5xl font-black ${tauxPresence === null ? 'text-neutral-300' : 'text-neutral-900'}`}>
            {tauxPresence === null ? '—' : `${tauxPresence}%`}
          </p>
          <p className="text-sm text-neutral-500 font-semibold mt-1">{appreciation(tauxPresence)}</p>
          <div className="mt-4 h-3 bg-neutral-100 rounded-[999px] overflow-hidden flex">
            {total > 0 && (
              <>
                <div className="h-full bg-emerald-500" style={{ width: `${(present / total) * 100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${(retard / total) * 100}%` }} />
                <div className="h-full bg-red-500" style={{ width: `${(absent / total) * 100}%` }} />
                <div className="h-full bg-sky-500" style={{ width: `${(excuse / total) * 100}%` }} />
              </>
            )}
          </div>
        </div>
        <div className="hidden lg:block w-px self-stretch bg-neutral-100" />
        <ul className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 text-sm font-semibold text-neutral-700">
          {[['Présent', 'bg-emerald-500', present], ['Retard', 'bg-amber-400', retard], ['Absent', 'bg-red-500', absent], ['Excusé', 'bg-sky-500', excuse]].map(([l, c, n]) => (
            <li key={String(l)} className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-[999px] ${c}`} />{l}
              <span className="text-neutral-400 font-bold">{n}</span>
            </li>
          ))}
        </ul>
        <Anneau taux={tauxPresence} />
      </section>

      {/* Alerte seuil */}
      {absent >= 3 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span translate="no" className="material-symbols-outlined text-red-500 text-[24px] shrink-0">warning</span>
          <div>
            <p className="text-sm font-black text-red-800">{absent} absences enregistrées</p>
            <p className="text-xs text-red-600 mt-0.5">Votre enfant dépasse le seuil autorisé. Contactez l'administration.</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {FILTRES.map((f) => (
          <button key={f.id} type="button" onClick={() => setFiltre(f.id)} aria-pressed={filtre === f.id}
            className={`px-4 py-2.5 rounded-[999px] text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              filtre === f.id ? 'bg-primary text-text-on-primary' : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-100'}`}>
            <span translate="no" className={`material-symbols-outlined text-lg ${filtre === f.id ? '' : f.couleur}`}>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-[999px] animate-spin" />
          </div>
        ) : attendancesError ? (
          <ParentErrorState message={attendancesError} onRetry={retry} />
        ) : total === 0 || filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="relative mx-auto w-28 h-28">
              <span className="absolute inset-0 rounded-[999px] bg-primary-light" />
              <span translate="no" className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-6xl text-primary">calendar_month</span>
              <span className="absolute -right-1 bottom-2 w-9 h-9 rounded-[999px] bg-primary text-text-on-primary flex items-center justify-center ring-4 ring-white">
                <span translate="no" className="material-symbols-outlined text-xl">{total === 0 ? 'check' : 'filter_alt_off'}</span>
              </span>
            </div>
            <p className="mt-4 text-base font-black text-neutral-900">
              {total === 0 ? 'Aucune présence enregistrée pour le moment.' : 'Aucune donnée pour ce filtre.'}
            </p>
            {total === 0 && <p className="mt-1 text-sm text-neutral-500">Les pointages apparaîtront ici dès que l'établissement les aura saisis.</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((att) => {
              const cfg = STATUT_CONFIG[att.statut] ?? STATUT_CONFIG.ABSENT;
              const justif = justifParPresence.get(att.id);
              return (
                <div key={att.id} className={`bg-white rounded-2xl border ${cfg.ligne} p-4 flex items-center gap-4 hover:shadow-sm transition-shadow`}>
                  <div className={`w-11 h-11 rounded-[999px] flex items-center justify-center shrink-0 ${cfg.fond}`} style={{ borderRadius: 9999 }}>
                    <span translate="no" className={`material-symbols-outlined text-[22px] ${cfg.color}`}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-neutral-900 truncate">{att.cours}</p>
                    <p className="text-xs text-neutral-500 font-semibold">{[att.professeur, att.heure].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-[999px] border ${cfg.pastille}`}>{cfg.label}</span>
                    <p className="text-xs text-neutral-400 font-semibold mt-1 mb-1">
                      {new Date(att.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </p>
                    {justif?.statut === 'EN_ATTENTE' ? (
                      <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 justify-end">
                        <span translate="no" className="material-symbols-outlined text-[14px]">hourglass_top</span>Justificatif en attente
                      </span>
                    ) : justif?.statut === 'ACCEPTE' ? (
                      <span className="text-[11px] font-bold text-sky-700 flex items-center gap-1 justify-end">
                        <span translate="no" className="material-symbols-outlined text-[14px]">verified</span>Justificatif accepté
                      </span>
                    ) : (att.statut === 'ABSENT' || att.statut === 'RETARD') ? (
                      <>
                        {justif?.statut === 'REFUSE' && (
                          <p className="text-[11px] font-bold text-red-700 max-w-[14rem] ml-auto">Refusé : {justif.motifRefus}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => setAJustifier(att)}
                          className="text-xs font-black text-primary hover:underline flex items-center gap-1 justify-end ml-auto cursor-pointer"
                        >
                          <span translate="no" className="material-symbols-outlined text-[14px]">upload_file</span>
                          {justif?.statut === 'REFUSE' ? 'Justifier à nouveau' : 'Justifier'}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

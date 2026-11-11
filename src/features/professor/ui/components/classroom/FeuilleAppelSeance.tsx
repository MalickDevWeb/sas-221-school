import React, { useMemo, useRef, useState } from 'react';
import { CheckSquare, Save, Search, CalendarDays, Clock } from 'lucide-react';
import { afficherErreur, effacerErreur } from '@/shared/lib/validationPersonnalisee';
import { useFeuilleAppel, aujourdhuiIso, heureMinute } from '../../../hooks/useFeuilleAppel';
import { LIBELLES_STATUT, STATUTS_APPEL, type SeanceCours, type StatutAppel } from '../../../domain/FeuilleAppel';

interface Props {
  readonly courseId?: string;
  readonly triggerToast?: (message: string) => void;
}

const JOURS: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

const COULEURS: Record<StatutAppel, string> = {
  PRESENT: 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]',
  RETARD: 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]',
  ABSENT: 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]',
  EXCUSE: 'bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC]',
};

function dateFr(iso: string): string {
  const [a, m, j] = iso.split('-');
  return a && m && j ? `${j}/${m}/${a}` : iso;
}

function libelleSeance(s: SeanceCours): string {
  const jour = s.day ? JOURS[s.day.toUpperCase()] ?? s.day : '—';
  const morceaux = [jour, s.time || '—', s.room ? `salle ${s.room}` : null, s.date ? `le ${dateFr(s.date)}` : null];
  return morceaux.filter(Boolean).join(' · ');
}

/** Sous-onglet « Présence & Appel » : appel rattaché à une séance, enregistré en un seul envoi. */
export function FeuilleAppelSeance({ courseId, triggerToast }: Props) {
  const fa = useFeuilleAppel(courseId, triggerToast);
  const [recherche, setRecherche] = useState('');
  const champDate = useRef<HTMLInputElement>(null);

  const compteurs = useMemo(() => {
    const c = { PRESENT: 0, RETARD: 0, ABSENT: 0, EXCUSE: 0, nonNotes: 0 };
    Object.values(fa.saisies).forEach((s) => {
      if (s.status) c[s.status]++;
      else c.nonNotes++;
    });
    return c;
  }, [fa.saisies]);

  const eleves = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const liste = fa.feuille?.eleves ?? [];
    return q ? liste.filter((e) => `${e.nom} ${e.matricule ?? ''}`.toLowerCase().includes(q)) : liste;
  }, [fa.feuille, recherche]);

  const seanceChoisie = fa.seances.find((s) => s.id === fa.sessionId) ?? null;
  const heureEnregistree = heureMinute(fa.feuille?.enregistreA);

  const changerDate = (valeur: string) => {
    const champ = champDate.current;
    if (champ) {
      if (valeur && valeur > aujourdhuiIso()) {
        afficherErreur(champ, "On ne peut pas faire l'appel pour une date future.");
      } else {
        effacerErreur(champ);
      }
    }
    void fa.choisirDate(valeur);
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fa.dateFuture && champDate.current) {
      afficherErreur(champDate.current, "On ne peut pas faire l'appel pour une date future.");
      champDate.current.focus();
      return;
    }
    await fa.enregistrer();
  };

  if (!courseId) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center">
        <p className="text-sm font-black text-neutral-500">Sélectionnez un cours pour faire l'appel.</p>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} noValidate={false} className="space-y-5 select-none">
      {/* Choix de la séance et de la date */}
      <section className="bg-white border border-neutral-200/90 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Séance
            </span>
            <select
              value={fa.sessionId}
              onChange={(e) => void fa.choisirSeance(e.target.value)}
              disabled={fa.chargementSeances}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-700"
            >
              {fa.seances.map((s) => (
                <option key={s.id} value={s.id}>{libelleSeance(s)}</option>
              ))}
              <option value="">Sans séance planifiée (appel du jour)</option>
            </select>
            {fa.chargementSeances && <span className="text-[11px] text-neutral-400 font-semibold">Chargement des séances…</span>}
            {!fa.chargementSeances && !fa.erreurSeances && fa.seances.length === 0 && (
              <span className="text-[11px] text-neutral-500 font-semibold">
                Aucune séance planifiée pour ce cours : l'appel sera rattaché au jour choisi.
              </span>
            )}
            {fa.erreurSeances && <span role="alert" className="text-[11px] text-[#C5221F] font-bold">{fa.erreurSeances}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Date de l'appel
            </span>
            <input
              ref={champDate}
              type="date"
              required
              data-msg-requis="Choisissez la date de l'appel."
              value={fa.date}
              max={aujourdhuiIso()}
              onChange={(e) => changerDate(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-700"
            />
          </label>
        </div>

        {seanceChoisie && seanceChoisie.appelsEnregistres.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mr-1">Appels enregistrés :</span>
            {seanceChoisie.appelsEnregistres.slice(0, 8).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => changerDate(d)}
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border cursor-pointer ${
                  d === fa.date ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {dateFr(d)}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs font-bold" aria-live="polite">
          {fa.chargementFeuille ? (
            <span className="text-neutral-400">Chargement de la feuille d'appel…</span>
          ) : fa.feuille && fa.feuille.elevesNotes > 0 ? (
            <span className="text-[#137333]">
              Appel enregistré{heureEnregistree ? ` à ${heureEnregistree}` : ''} — {fa.feuille.elevesNotes} / {fa.feuille.totalEleves} élève(s) noté(s)
              {fa.modifie && <span className="text-[#B06000]"> · modifications non enregistrées</span>}
            </span>
          ) : fa.feuille ? (
            <span className="text-neutral-500">
              Aucun appel enregistré pour cette séance à cette date.
              {fa.modifie && <span className="text-[#B06000]"> · modifications non enregistrées</span>}
            </span>
          ) : null}
        </p>
      </section>

      {/* Compteurs de la séance */}
      {fa.feuille && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {([
            ['Élèves', fa.feuille.totalEleves, 'bg-white text-neutral-800 border-neutral-200'],
            ['Présents', compteurs.PRESENT, COULEURS.PRESENT],
            ['Retards', compteurs.RETARD, COULEURS.RETARD],
            ['Absents', compteurs.ABSENT, COULEURS.ABSENT],
            ['Excusés', compteurs.EXCUSE, COULEURS.EXCUSE],
            ['Non notés', compteurs.nonNotes, 'bg-neutral-100 text-neutral-500 border-neutral-200'],
          ] as const).map(([libelle, n, couleur]) => (
            <div key={libelle} className={`border rounded-2xl px-3 py-2.5 ${couleur}`}>
              <span className="block text-[9px] font-black uppercase tracking-wider opacity-80">{libelle}</span>
              <span className="text-lg font-black font-mono">{n}</span>
            </div>
          ))}
        </div>
      )}

      {/* Liste des élèves */}
      <section className="bg-white border border-neutral-200/90 rounded-[28px] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 focus-within:bg-white rounded-xl w-full sm:w-[240px]">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un élève…"
              aria-label="Rechercher un élève"
              className="bg-transparent text-xs font-bold text-neutral-700 outline-none w-full border-0 p-0"
            />
          </div>
          <button
            type="button"
            onClick={fa.toutPresent}
            disabled={!fa.feuille || fa.feuille.totalEleves === 0 || fa.enregistrement}
            className="flex items-center justify-center gap-1.5 bg-primary-light text-primary font-black text-xs px-4 py-2.5 rounded-xl disabled:opacity-50 cursor-pointer whitespace-nowrap border-0"
          >
            <CheckSquare className="h-4 w-4 shrink-0" /> Tout présent
          </button>
        </div>

        {fa.erreurFeuille && (
          <p role="alert" className="mt-4 text-xs font-bold text-[#C5221F]">{fa.erreurFeuille}</p>
        )}
        {fa.dateFuture && (
          <p role="alert" className="mt-4 text-xs font-bold text-[#C5221F]">On ne peut pas faire l'appel pour une date future.</p>
        )}

        <div className="mt-4 space-y-2.5 max-h-[560px] overflow-y-auto no-scrollbar">
          {fa.feuille && fa.feuille.totalEleves === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center">
              <p className="text-sm font-black text-neutral-500">Aucun élève n'est affecté à la classe de ce cours.</p>
            </div>
          ) : fa.feuille && eleves.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center">
              <p className="text-sm font-black text-neutral-400">Aucun élève ne correspond à la recherche.</p>
            </div>
          ) : (
            eleves.map((e) => {
              const saisie = fa.saisies[e.studentId] ?? { status: null, note: '' };
              const stat = fa.assiduite[e.studentId];
              return (
                <div key={e.studentId} className="border border-neutral-200/95 rounded-2xl p-3 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13.5px] font-black text-neutral-800 flex flex-wrap items-center gap-2">
                      <span>{e.nom}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        saisie.status ? COULEURS[saisie.status] : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}>
                        {saisie.status ? LIBELLES_STATUT[saisie.status] : 'Non noté'}
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-neutral-400 font-bold mt-0.5 font-mono">Matricule : {e.matricule || '—'}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label={`Statut de ${e.nom}`}>
                    {STATUTS_APPEL.map((st) => (
                      <button
                        key={st}
                        type="button"
                        aria-pressed={saisie.status === st}
                        onClick={() => fa.marquer(e.studentId, st)}
                        disabled={fa.enregistrement}
                        className={`px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                          saisie.status === st ? COULEURS[st] : 'bg-neutral-50 text-neutral-400 border-neutral-200/70 hover:text-neutral-700'
                        }`}
                      >
                        {LIBELLES_STATUT[st]}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={saisie.note}
                    maxLength={500}
                    onChange={(ev) => fa.annoter(e.studentId, ev.target.value)}
                    placeholder="Observation (facultatif)"
                    aria-label={`Observation pour ${e.nom}`}
                    className="lg:w-[180px] bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-neutral-700"
                  />

                  <div
                    className="lg:w-[110px] text-right shrink-0"
                    title={stat ? `${stat.present} présent(s), ${stat.retard} retard(s), ${stat.absent} absence(s), ${stat.excuse} excusé(s)` : undefined}
                  >
                    <span className="block text-[9px] font-black uppercase tracking-wider text-neutral-400">Assiduité</span>
                    <span className="text-sm font-black font-mono text-neutral-700">
                      {stat && stat.taux !== null ? `${stat.taux.toLocaleString('fr-FR')} %` : '—'}
                    </span>
                    {stat && stat.seancesNotees > 0 && (
                      <span className="block text-[9.5px] text-neutral-400 font-semibold">sur {stat.seancesNotees} séance(s)</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {fa.erreurAssiduite && (
          <p className="mt-3 text-[11px] font-semibold text-neutral-500">Taux d'assiduité indisponible : {fa.erreurAssiduite}</p>
        )}

        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-neutral-500">
            {fa.nonNotes > 0 ? `${fa.nonNotes} élève(s) non noté(s).` : fa.feuille && fa.feuille.totalEleves > 0 ? 'Tous les élèves sont notés.' : null}
            {fa.erreurEnvoi && <p role="alert" className="mt-1 text-xs font-bold text-[#C5221F]">{fa.erreurEnvoi}</p>}
          </div>
          <button
            type="submit"
            disabled={!fa.feuille || fa.feuille.totalEleves === 0 || fa.enregistrement || fa.chargementFeuille || fa.dateFuture}
            className="flex items-center justify-center gap-1.5 bg-neutral-900 text-white font-black text-xs px-5 py-3 rounded-xl disabled:opacity-50 cursor-pointer border-0"
          >
            <Save className="h-4 w-4" /> {fa.enregistrement ? 'Enregistrement…' : "Enregistrer l'appel"}
          </button>
        </div>
      </section>
    </form>
  );
}

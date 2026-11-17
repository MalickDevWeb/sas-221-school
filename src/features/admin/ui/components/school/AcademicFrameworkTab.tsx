import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { Classe, Filiere } from '../../../domain/SchoolModels';

/** Période scolaire réelle (GET /admin/periodes) — même source et même cache que « Trimestres & bulletins ». */
interface Periode { id: string; libelle: string; dateDebut: string; dateFin: string; cloturee: boolean }

interface Props {
  /** Classes réelles de l'école (GET /admin/planning/classes, chargées par Gestion École). */
  classes: Classe[];
  filieres: Filiere[];
  /** Ouvre la section « Classes » (création par « Nouvelle classe »). */
  onOuvrirClasses: () => void;
}

const jour = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Cadre académique (2026-11-15). Avant : années 2023-2024 / 2024-2025 et deux semestres écrits en dur ; « Ajouter »
 * une année, une session, une promotion ou un module n'enregistrait rien (perdu au rechargement) ; modules avec crédits
 * ECTS et compétences inventés ; affectations et examens sans aucune donnée. Désormais : les vraies périodes de l'école
 * (même source que « Trimestres & bulletins », où elles se créent et se clôturent) et ses vraies classes ; les blocs
 * sans route serveur sont retirés et expliqués.
 */
export function AcademicFrameworkTab({ classes, filieres, onOuvrirClasses }: Props) {
  const periodes = useQuery({
    queryKey: ['admin', 'periodes'],
    queryFn: async () => (await apiClient.get('/admin/periodes')).data as Periode[],
  });
  const liste = periodes.data ?? [];
  const nomFiliere = (id: string) => filieres.find((f) => f.id === id)?.name ?? null;

  return (
    <div className="space-y-6 text-xs font-semibold" id="academic-framework-tab">
      <div className="border-b border-neutral-100 pb-3">
        <h3 className="text-sm font-black text-[#1E293B]">Cadre académique</h3>
        <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
          Les périodes de l'année et les classes de votre école, telles qu'elles sont enregistrées.
        </p>
      </div>

      {/* ── Périodes de l'année ── */}
      <section id="cadre-periodes" aria-labelledby="cadre-periodes-titre" className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-3">
        <div>
          <h4 id="cadre-periodes-titre" className="font-extrabold text-[#1E293B] flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-sm text-primary">calendar_today</span> Périodes de l'année
          </h4>
          <p className="text-[11px] text-neutral-500 m-0 mt-0.5">
            Trimestres ou semestres de l'école. Ils se créent, se modifient et se clôturent dans le menu « Trimestres & bulletins ».
          </p>
        </div>
        {periodes.isPending && <p className="text-neutral-400 m-0">Chargement des périodes…</p>}
        {periodes.isError && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
            <p className="m-0">Impossible de charger les périodes : {resolveErrorMessage(periodes.error)}</p>
            <button type="button" onClick={() => void periodes.refetch()} className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-bold cursor-pointer">Réessayer</button>
          </div>
        )}
        {periodes.isSuccess && liste.length === 0 && (
          <p className="p-4 text-center text-neutral-500 bg-white border border-dashed border-neutral-200 rounded-xl m-0">
            Aucune période enregistrée. Créez vos trimestres dans le menu « Trimestres & bulletins ».
          </p>
        )}
        {periodes.isSuccess && liste.length > 0 && (
          <>
            <p className="text-neutral-600 m-0">
              Année couverte : du {jour(liste[0].dateDebut)} au {jour(liste[liste.length - 1].dateFin)}.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 m-0 p-0 list-none">
              {liste.map((p) => (
                <li key={p.id} className="bg-white p-3 border border-neutral-200 rounded-xl flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-neutral-800 m-0">{p.libelle}</p>
                    <p className="text-[10px] text-neutral-500 m-0">Du {jour(p.dateDebut)} au {jour(p.dateFin)}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${p.cloturee ? 'bg-neutral-100 text-neutral-600' : 'bg-emerald-50 text-emerald-800'}`}>
                    {p.cloturee ? 'Notes clôturées' : 'Ouverte'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ── Classes ── */}
      <section id="cadre-classes" aria-labelledby="cadre-classes-titre" className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h4 id="cadre-classes-titre" className="font-extrabold text-[#1E293B] flex items-center gap-1.5">
              <span translate="no" className="material-symbols-outlined text-sm text-primary">groups</span> Classes
            </h4>
            <p className="text-[11px] text-neutral-500 m-0 mt-0.5">Classes enregistrées pour l'école ({classes.length}).</p>
          </div>
          <button type="button" onClick={onOuvrirClasses} className="px-3 py-2 bg-primary text-white font-black rounded-xl border-0 cursor-pointer shrink-0">
            {classes.length === 0 ? 'Créer une classe' : 'Gérer les classes'}
          </button>
        </div>
        {classes.length === 0 ? (
          <p className="p-4 text-center text-neutral-500 bg-white border border-dashed border-neutral-200 rounded-xl m-0">
            Aucune classe pour l'instant. Créez la première depuis la section « Classes » (« Nouvelle classe »).
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 m-0 p-0 list-none">
            {classes.map((c) => (
              <li key={c.id} className="bg-white p-3 border border-neutral-200 rounded-xl">
                <p className="font-bold text-neutral-800 m-0">{c.name}</p>
                <p className="text-[10px] text-neutral-500 m-0">
                  {[c.level, nomFiliere(c.filiereId), c.capacityMax != null ? `${c.capacityMax} places` : null].filter(Boolean).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Ce qui ne se gère pas ici ── */}
      <section id="cadre-non-gere" aria-label="Ce qui ne se gère pas ici" className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-1.5 text-neutral-600">
        <p className="font-extrabold text-[#1E293B] m-0">Ce qui ne se gère pas ici</p>
        <p className="m-0">
          L'application ne gère ni modules à crédits ni règles de validation par module : les matières sont les cours de
          chaque classe (enseignant et volume horaire).
        </p>
        <p className="m-0">
          Elle ne gère pas non plus d'affectation enseignant ↔ salle en dehors des séances, ni de calendrier d'examens :
          les séances se planifient dans « Planning & Affectations », et les évaluations sont créées par les enseignants
          dans leurs cours.
        </p>
      </section>
    </div>
  );
}

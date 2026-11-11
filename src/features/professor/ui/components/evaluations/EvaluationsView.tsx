import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import type { Evaluation, EvaluationSaisie } from '../../../domain/Evaluations';
import { libelleType } from '../../../domain/Evaluations';
import { evaluationsApi } from '../../../infrastructure/api/evaluationsApi';
import { EvaluationFormModal } from './EvaluationFormModal';
import { GrilleNotes } from './GrilleNotes';
import { nomComplet, texteMoyenne } from './saisieNotes';

interface Props {
  readonly courseId?: string;
  readonly coursTitre?: string;
}

/** Évaluations multiples d'un cours (lot C) : création, saisie des notes, moyennes calculées par le serveur. */
export function EvaluationsView({ courseId, coursTitre = 'Cours' }: Props) {
  const client = useQueryClient();
  const [vue, setVue] = useState<'saisie' | 'moyennes'>('saisie');
  const [choisie, setChoisie] = useState<string | null>(null);
  const [formulaire, setFormulaire] = useState<{ initiale: Evaluation | null } | null>(null);

  const evaluations = useQuery({
    queryKey: ['professeur', 'evaluations', courseId, 'liste'],
    queryFn: () => evaluationsApi.lister(courseId!),
    enabled: !!courseId,
  });
  const moyennes = useQuery({
    queryKey: ['professeur', 'evaluations', courseId, 'moyennes'],
    queryFn: () => evaluationsApi.moyennes(courseId!),
    enabled: !!courseId,
  });

  if (!courseId) return <p className="text-sm text-neutral-500 font-semibold">Choisissez un cours.</p>;

  const liste = [...(evaluations.data ?? [])].sort((a, b) => a.date.localeCompare(b.date) || a.titre.localeCompare(b.titre));
  const active = liste.find((e) => e.id === choisie) ?? liste[liste.length - 1] ?? null;
  const rafraichir = () => client.invalidateQueries({ queryKey: ['professeur', 'evaluations', courseId] });

  const enregistrer = async (saisie: EvaluationSaisie) => {
    const initiale = formulaire?.initiale;
    const e = initiale ? await evaluationsApi.modifier(courseId, initiale.id, saisie) : await evaluationsApi.creer(courseId, saisie);
    toast.success(initiale ? 'Évaluation modifiée' : 'Évaluation créée', { description: e.titre });
    setFormulaire(null);
    setChoisie(e.id);
    rafraichir();
  };

  const supprimer = async (e: Evaluation) => {
    const avecNotes = (e.nombreNotes ?? 0) > 0;
    const ok = await demanderConfirmation(
      avecNotes ? `« ${e.titre} » contient ${e.nombreNotes} note(s) : elles seront supprimées avec l'évaluation.` : `Supprimer « ${e.titre} » ?`,
      { titre: "Supprimer l'évaluation", confirmer: 'Supprimer', danger: true });
    if (!ok) return;
    try {
      await evaluationsApi.supprimer(courseId, e.id);
      toast.success('Évaluation supprimée', { description: e.titre });
      if (choisie === e.id) setChoisie(null);
      rafraichir();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-neutral-900">Évaluations</h3>
          <p className="text-xs font-semibold text-neutral-500">Devoirs surveillés, examens, TP… La moyenne est calculée par le serveur à partir des coefficients.</p>
        </div>
        <button type="button" onClick={() => setFormulaire({ initiale: null })} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white cursor-pointer">
          <Plus className="h-4 w-4" />Nouvelle évaluation
        </button>
      </div>

      <div role="tablist" aria-label="Affichage" className="flex gap-2">
        {([['saisie', 'Saisie des notes'], ['moyennes', 'Moyennes']] as const).map(([id, texte]) => (
          <button key={id} type="button" role="tab" aria-selected={vue === id} onClick={() => setVue(id)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-black cursor-pointer ${vue === id ? 'border-primary bg-primary text-white' : 'border-neutral-200 bg-white text-neutral-600'}`}>
            {texte}
          </button>
        ))}
      </div>

      {evaluations.isLoading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : evaluations.error ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{resolveErrorMessage(evaluations.error)}</p>
      ) : liste.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-sm font-black text-neutral-700">Aucune évaluation pour ce cours.</p>
          <p className="mt-1 text-xs font-semibold text-neutral-500">Créez la première pour saisir des notes.</p>
        </div>
      ) : vue === 'saisie' ? (
        <>
          <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Évaluations du cours">
            {liste.map((e) => (
              <li key={e.id} className="shrink-0">
                <div className={`rounded-2xl border p-3 w-56 ${active?.id === e.id ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'}`}>
                  <button type="button" onClick={() => setChoisie(e.id)} aria-pressed={active?.id === e.id} className="w-full text-left cursor-pointer">
                    <p className="flex items-center gap-1 text-xs font-black text-neutral-800 truncate">
                      {e.verrouillee && <Lock className="h-3 w-3 shrink-0" aria-label="Verrouillée" />}{e.titre}
                    </p>
                    <p className="text-[10px] font-semibold text-neutral-500">
                      {libelleType(e.type)}{e.session === 'RATTRAPAGE' ? ' · rattrapage' : ''} · {e.date}
                    </p>
                    <p className="text-[10px] font-semibold text-neutral-500">coef {e.coefficient} · /{e.noteSur} · {e.nombreNotes ?? 0} note(s)</p>
                  </button>
                  {!e.verrouillee && (
                    <div className="mt-2 flex gap-1">
                      <button type="button" onClick={() => setFormulaire({ initiale: e })} aria-label={`Modifier ${e.titre}`} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => supprimer(e)} aria-label={`Supprimer ${e.titre}`} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {active && <GrilleNotes key={active.id} courseId={courseId} coursTitre={coursTitre} evaluation={active} moyennes={moyennes.data ?? null} />}
        </>
      ) : (
        <TableMoyennes moyennes={moyennes.data ?? null} chargement={moyennes.isLoading} erreur={moyennes.error} />
      )}

      {formulaire && (
        <EvaluationFormModal initiale={formulaire.initiale} evaluations={liste} onEnregistrer={enregistrer} onFermer={() => setFormulaire(null)} />
      )}
    </div>
  );
}

function TableMoyennes({ moyennes, chargement, erreur }: { moyennes: import('../../../domain/Evaluations').MoyennesCours | null; chargement: boolean; erreur: unknown }) {
  if (chargement) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (erreur) return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{resolveErrorMessage(erreur)}</p>;
  if (!moyennes) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm font-black text-neutral-800">Moyenne de la classe : {texteMoyenne(moyennes.moyenneClasse)}{moyennes.moyenneClasse !== null ? ' / 20' : ''}</p>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-3 py-2.5">Élève</th>
              {moyennes.evaluations.map((e) => <th key={e.id} className="px-3 py-2.5 whitespace-nowrap">{e.titre}<span className="block font-semibold normal-case tracking-normal">coef {e.coefficient} · /{e.noteSur}</span></th>)}
              <th className="px-3 py-2.5">Moyenne /20</th>
              <th className="px-3 py-2.5">Mention</th>
              <th className="px-3 py-2.5">Rang</th>
            </tr>
          </thead>
          <tbody>
            {moyennes.eleves.map((el) => (
              <tr key={el.studentId} className="border-t border-neutral-100">
                <td className="px-3 py-2 font-bold text-neutral-800">{nomComplet(el)}</td>
                {moyennes.evaluations.map((e) => {
                  const n = el.notes[e.id];
                  return <td key={e.id} className="px-3 py-2 tabular-nums">{n ? (n.absence ?? (n.valeur ?? '—')) : '—'}</td>;
                })}
                <td className="px-3 py-2 font-black tabular-nums">{texteMoyenne(el.moyenne)}</td>
                <td className="px-3 py-2">{el.mention ?? '—'}</td>
                <td className="px-3 py-2 tabular-nums">{el.rang ? `${el.rang} / ${el.nombreElevesClasses}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] font-semibold text-neutral-500">Règle : {moyennes.regle}</p>
    </div>
  );
}

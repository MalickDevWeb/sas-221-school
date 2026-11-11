import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, History, Lock, Upload } from 'lucide-react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { Evaluation, LigneLot, MoyennesCours, NoteEleve } from '../../../domain/Evaluations';
import { evaluationsApi } from '../../../infrastructure/api/evaluationsApi';
import { analyserImport, analyserSaisie, exporterExcel, nomComplet, texteNote, type RapportImport } from './saisieNotes';

interface Props {
  readonly courseId: string;
  readonly coursTitre: string;
  readonly evaluation: Evaluation;
  readonly moyennes: MoyennesCours | null;
}

interface Brouillon { note: string; commentaire: string }

const cle = (courseId: string, evaluationId: string) => ['professeur', 'evaluations', courseId, 'notes', evaluationId];

/** Grille de saisie d'une évaluation : rien n'est affiché comme enregistré avant la réponse du serveur. */
export function GrilleNotes({ courseId, coursTitre, evaluation, moyennes }: Props) {
  const client = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: cle(courseId, evaluation.id),
    queryFn: () => evaluationsApi.notes(courseId, evaluation.id),
  });
  const notes = useMemo<NoteEleve[]>(() => data?.notes ?? [], [data]);
  const [brouillon, setBrouillon] = useState<Record<string, Brouillon>>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);
  const [rapport, setRapport] = useState<RapportImport | null>(null);
  const [journalOuvert, setJournalOuvert] = useState(false);
  const fichierRef = useRef<HTMLInputElement>(null);
  const future = evaluation.date > new Date().toISOString().slice(0, 10);
  const lectureSeule = evaluation.verrouillee || future;

  // Brouillon = valeurs du serveur à chaque (re)chargement
  useEffect(() => {
    const b: Record<string, Brouillon> = {};
    notes.forEach((n) => { b[n.studentId] = { note: texteNote(n.valeur, n.absence), commentaire: n.commentaire ?? '' }; });
    setBrouillon(b);
  }, [notes]);

  const analyses = useMemo(() => {
    const r: Record<string, ReturnType<typeof analyserSaisie>> = {};
    notes.forEach((n) => { r[n.studentId] = analyserSaisie(brouillon[n.studentId]?.note ?? '', evaluation.noteSur); });
    return r;
  }, [brouillon, notes, evaluation.noteSur]);

  const modifiees = notes.filter((n) => {
    const b = brouillon[n.studentId];
    return b && (b.note.trim() !== texteNote(n.valeur, n.absence) || b.commentaire.trim() !== (n.commentaire ?? ''));
  });
  const erreurs = notes.filter((n) => !analyses[n.studentId]?.ok);
  const commentaireSansNote = modifiees.filter((n) => {
    const a = analyses[n.studentId];
    return a?.ok && a.valeur === null && a.absence === null && (brouillon[n.studentId]?.commentaire.trim() ?? '') !== '';
  });

  const changer = (id: string, champ: keyof Brouillon, valeur: string) => {
    setBrouillon((b) => ({ ...b, [id]: { ...b[id], [champ]: valeur } }));
    setErreurServeur(null);
  };

  const enregistrer = async () => {
    if (erreurs.length || commentaireSansNote.length || modifiees.length === 0) return;
    const lignes: LigneLot[] = modifiees.map((n) => {
      const a = analyses[n.studentId] as { ok: true; valeur: number | null; absence: 'ABS' | 'EXCUSE' | null };
      const commentaire = brouillon[n.studentId].commentaire.trim();
      return { studentId: n.studentId, valeur: a.valeur, absence: a.absence, commentaire: commentaire || null };
    });
    setEnvoi(true);
    setErreurServeur(null);
    try {
      const r = await evaluationsApi.enregistrerNotes(courseId, evaluation.id, lignes);
      client.setQueryData(cle(courseId, evaluation.id), r);
      client.invalidateQueries({ queryKey: ['professeur', 'evaluations', courseId] });
      const parts = [r.creees ? `${r.creees} ajoutée(s)` : '', r.modifiees ? `${r.modifiees} modifiée(s)` : '', r.supprimees ? `${r.supprimees} effacée(s)` : ''].filter(Boolean);
      toast.success('Notes enregistrées', { description: parts.join(' · ') || undefined });
    } catch (e) {
      setErreurServeur(resolveErrorMessage(e));
    } finally {
      setEnvoi(false);
    }
  };

  const importer = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) setRapport(await analyserImport(f, evaluation, notes));
  };

  const appliquerImport = () => {
    if (!rapport) return;
    setBrouillon((b) => {
      const n = { ...b };
      rapport.lignes.filter((l) => !l.erreur && l.studentId).forEach((l) => {
        n[l.studentId!] = { note: l.absence ?? (l.valeur === null ? '' : String(l.valeur)), commentaire: l.commentaire ?? n[l.studentId!]?.commentaire ?? '' };
      });
      return n;
    });
    setRapport(null);
    toast.info('Notes importées dans la grille', { description: 'Vérifiez-les puis cliquez sur « Enregistrer les notes ».' });
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (error) return <p role="alert" className="text-sm text-red-700 font-semibold bg-red-50 border border-red-200 rounded-2xl p-4">{resolveErrorMessage(error)}</p>;

  const valides = rapport?.lignes.filter((l) => !l.erreur).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {evaluation.verrouillee && (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-black text-neutral-600">
            <Lock className="h-3.5 w-3.5" />Verrouillée par l'administration : consultation seule
          </span>
        )}
        {future && !evaluation.verrouillee && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-black text-amber-800">
            Évaluation prévue le {evaluation.date} : saisie possible à partir de cette date
          </span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {!lectureSeule && (
            <>
              <input ref={fichierRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={importer} aria-label="Importer un fichier de notes" />
              <button type="button" onClick={() => fichierRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:border-primary cursor-pointer">
                <Upload className="h-3.5 w-3.5" />Importer (Excel)
              </button>
            </>
          )}
          <button type="button" onClick={() => exporterExcel(coursTitre, evaluation, notes, moyennes)} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:border-primary cursor-pointer">
            <Download className="h-3.5 w-3.5" />Exporter
          </button>
          <button type="button" onClick={() => setJournalOuvert((o) => !o)} aria-expanded={journalOuvert} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:border-primary cursor-pointer">
            <History className="h-3.5 w-3.5" />Historique
          </button>
        </div>
      </div>

      {rapport && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3" aria-live="polite">
          {rapport.erreurGlobale ? (
            <p role="alert" className="text-sm font-semibold text-red-700">{rapport.erreurGlobale}</p>
          ) : (
            <>
              <p className="text-sm font-black text-neutral-800">
                Import : {valides} ligne(s) valide(s), {rapport.lignes.length - valides} en erreur
              </p>
              {rapport.lignes.some((l) => l.erreur) && (
                <ul className="max-h-40 overflow-auto text-xs space-y-1">
                  {rapport.lignes.filter((l) => l.erreur).map((l) => (
                    <li key={l.ligne} className="text-red-700 font-semibold">Ligne {l.ligne}{l.matricule ? ` (${l.matricule})` : ''} : {l.erreur}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRapport(null)} className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer">Annuler</button>
            {valides > 0 && (
              <button type="button" onClick={appliquerImport} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-black cursor-pointer">
                Reporter {valides} note(s) dans la grille
              </button>
            )}
          </div>
        </div>
      )}

      {journalOuvert && <Journal courseId={courseId} evaluationId={evaluation.id} />}

      {notes.length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm font-semibold text-neutral-500">Aucun élève inscrit dans la classe de ce cours.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-3 py-2.5">Élève</th>
                <th className="px-3 py-2.5 w-36">Note /{evaluation.noteSur}</th>
                <th className="px-3 py-2.5">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => {
                const b = brouillon[n.studentId] ?? { note: '', commentaire: '' };
                const a = analyses[n.studentId];
                const sansNote = commentaireSansNote.includes(n);
                const qui = nomComplet(n);
                return (
                  <tr key={n.studentId} className="border-t border-neutral-100 align-top">
                    <td className="px-3 py-2">
                      <p className="font-bold text-neutral-800">{qui}</p>
                      {n.matricule && <p className="text-[10px] font-semibold text-neutral-400">{n.matricule}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <input value={b.note} disabled={lectureSeule} onChange={(e) => changer(n.studentId, 'note', e.target.value)}
                        aria-label={`Note de ${qui}`} aria-invalid={!a?.ok} placeholder="—"
                        className={`w-full rounded-lg border px-2 py-1.5 text-xs font-bold tabular-nums disabled:bg-neutral-50 disabled:text-neutral-500 focus:outline-none focus:border-primary ${a && !a.ok ? 'border-red-400' : 'border-neutral-200'}`} />
                      {a && !a.ok && <p className="mt-1 text-[10px] font-semibold text-red-600">{a.message}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <input value={b.commentaire} disabled={lectureSeule} maxLength={550} onChange={(e) => changer(n.studentId, 'commentaire', e.target.value)}
                        aria-label={`Commentaire pour ${qui}`} aria-invalid={sansNote}
                        className={`w-full rounded-lg border px-2 py-1.5 text-xs disabled:bg-neutral-50 disabled:text-neutral-500 focus:outline-none focus:border-primary ${sansNote ? 'border-red-400' : 'border-neutral-200'}`} />
                      {sansNote && <p className="mt-1 text-[10px] font-semibold text-red-600">Un commentaire doit accompagner une note ou une absence.</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] font-semibold text-neutral-500">
        Saisissez un nombre (virgule acceptée), <strong>ABS</strong> (absence : compte 0) ou <strong>EXC</strong> (absence excusée : évaluation neutralisée). Vider une case efface la note.
      </p>

      {erreurServeur && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 whitespace-pre-line">{erreurServeur}</p>}

      {!lectureSeule && notes.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="text-xs font-semibold text-neutral-500">
            {erreurs.length ? `${erreurs.length} case(s) à corriger` : modifiees.length ? `${modifiees.length} modification(s) non enregistrée(s)` : 'Tout est enregistré'}
          </span>
          <button type="button" onClick={enregistrer} disabled={envoi || modifiees.length === 0 || erreurs.length > 0 || commentaireSansNote.length > 0}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 cursor-pointer">
            {envoi ? 'Enregistrement…' : 'Enregistrer les notes'}
          </button>
        </div>
      )}
    </div>
  );
}

const LIBELLES_ACTION: Record<string, string> = {
  CREATION: 'Saisie', MODIFICATION: 'Modification', SUPPRESSION: 'Effacement', VERROUILLAGE: 'Verrouillage', DEVERROUILLAGE: 'Déverrouillage',
};

function Journal({ courseId, evaluationId }: { courseId: string; evaluationId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['professeur', 'evaluations', courseId, 'journal', evaluationId],
    queryFn: () => evaluationsApi.journal(courseId, evaluationId),
  });
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-black text-neutral-800 mb-2">Historique des modifications</p>
      {isLoading ? <p className="text-xs text-neutral-500">Chargement…</p>
        : error ? <p role="alert" className="text-xs text-red-700">{resolveErrorMessage(error)}</p>
        : !data?.length ? <p className="text-xs text-neutral-500">Aucune modification enregistrée.</p>
        : (
          <ul className="max-h-56 overflow-auto space-y-1.5 text-xs">
            {data.map((j) => (
              <li key={j.id} className="text-neutral-700">
                <span className="font-bold">{LIBELLES_ACTION[j.action] ?? j.action}</span>
                {j.eleve ? ` — ${j.eleve}` : ''}
                {j.ancienneValeur || j.nouvelleValeur ? ` : ${j.ancienneValeur ?? '—'} → ${j.nouvelleValeur ?? '—'}` : ''}
                <span className="text-neutral-400"> · {j.auteur ?? '—'} · {j.horodatage ? new Date(j.horodatage).toLocaleString('fr-FR') : '—'}</span>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

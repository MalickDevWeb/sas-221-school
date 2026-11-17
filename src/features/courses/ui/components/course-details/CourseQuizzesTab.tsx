import React, { useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { avecNombre } from '@/shared/lib/pluriel';
import { pourcentFr } from '@/shared/lib/formatsFr';
import { dateHeurePhrase } from '@/shared/lib/dateHeurePhrase';
import {
  statutErreur, useMesResultats, usePasserQuiz, useQuizDuCours,
  type LigneCorrection, type QuizEleve, type ResultatTentative, type ResumeTentative,
} from '../../../infrastructure/api/quizEleveApi';

/**
 * Onglet « Quiz » de la fiche d'un cours (élève) — branché sur les routes du lot D.
 * Questions sans réponses, réponses envoyées au serveur, note et correction calculées par le serveur,
 * limite de tentatives appliquée par le serveur (409 au-delà).
 */
export function CourseQuizzesTab({ courseId }: { courseId: string | undefined }) {
  const requete = useQuizDuCours(courseId);

  if (!courseId) {
    return <p id="quiz-eleve-vide" className="text-xs font-semibold text-neutral-500">Cours introuvable : aucun quiz à afficher.</p>;
  }

  if (requete.isPending) {
    return (
      <div id="quiz-eleve" aria-busy="true" className="space-y-3">
        <p className="sr-only">Chargement des quiz…</p>
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-neutral-gray-200 rounded-3xl p-5 space-y-3 animate-pulse">
            <div className="h-4 w-1/2 bg-neutral-gray-150 rounded" />
            <div className="h-3 w-3/4 bg-neutral-gray-100 rounded" />
            <div className="h-9 w-40 bg-neutral-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (requete.isError) {
    return (
      <div id="quiz-eleve-erreur" role="alert" className="bg-white border border-red-200 rounded-3xl p-5 space-y-3">
        <p className="text-xs font-bold text-red-700">Quiz non chargés : {resolveErrorMessage(requete.error)}</p>
        <button type="button" data-action="reessayer" onClick={() => void requete.refetch()}
          disabled={requete.isFetching}
          className="px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer disabled:opacity-60">
          {requete.isFetching ? 'Chargement…' : 'Réessayer'}
        </button>
      </div>
    );
  }

  const quiz = requete.data;
  if (quiz.length === 0) {
    return (
      <div id="quiz-eleve-vide" className="bg-white border border-neutral-gray-200 rounded-3xl p-5 flex items-start gap-3">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-neutral-400">quiz</span>
        <p className="text-xs font-semibold text-neutral-600">
          Aucun quiz pour ce cours pour le moment. Ils apparaîtront ici dès que votre professeur en aura publié.
        </p>
      </div>
    );
  }

  return (
    <div id="quiz-eleve" className="space-y-4 font-sans">
      {quiz.map((q) => <CarteQuiz key={q.id} quiz={q} courseId={courseId} />)}
    </div>
  );
}

const phraseScore = (score: number | null, total: number | null): string =>
  score === null || total === null ? 'Note non disponible'
    : `${avecNombre(score, 'bonne réponse', 'bonnes réponses')} sur ${total.toLocaleString('fr-FR')}`;

function LigneResume({ r }: { r: ResumeTentative }) {
  const date = dateHeurePhrase(r.date);
  return (
    <>
      {phraseScore(r.score, r.total)}
      {r.pourcentage !== null && ` (${pourcentFr(r.pourcentage)})`}
      {date && ` · ${date}`}
    </>
  );
}

function CarteQuiz({ quiz, courseId }: { quiz: QuizEleve; courseId: string }) {
  const passer = usePasserQuiz(courseId);
  const [enCours, setEnCours] = useState(false);
  const [reponses, setReponses] = useState<Record<number, number>>({});
  const [manquantes, setManquantes] = useState<number[]>([]);
  const [resultat, setResultat] = useState<ResultatTentative | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [voirResultats, setVoirResultats] = useState(false);

  const epuise = quiz.tentativesRestantes <= 0;
  const sansQuestion = quiz.questions.length === 0;
  const prefixe = `quiz-${quiz.id}`;

  const commencer = () => {
    setEnCours(true);
    setReponses({});
    setManquantes([]);
    setResultat(null);
    setErreur(null);
  };

  const choisir = (question: number, choix: number) => {
    setReponses((prev) => ({ ...prev, [question]: choix }));
    setManquantes((prev) => prev.filter((i) => i !== question));
  };

  const envoyer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passer.isPending) return;
    const vides = quiz.questions.map((_, i) => i).filter((i) => reponses[i] === undefined);
    if (vides.length > 0) {
      setManquantes(vides);
      document.getElementById(`${prefixe}-q${vides[0]}`)?.focus();
      return;
    }
    setErreur(null);
    passer.mutate(
      { quizId: quiz.id, reponses: quiz.questions.map((_, i) => reponses[i]) },
      {
        onSuccess: (r) => {
          setResultat(r);
          setEnCours(false);
          setReponses({});
        },
        onError: (err) => {
          setErreur(resolveErrorMessage(err));
          // 409 : tentatives épuisées (le serveur a refusé) ; le formulaire n'a plus lieu d'être
          if (statutErreur(err) === 409) setEnCours(false);
        },
      },
    );
  };

  const libelleTentatives = quiz.maxTentatives === 1
    ? '1 seule tentative autorisée'
    : `${avecNombre(quiz.maxTentatives, 'tentative autorisée', 'tentatives autorisées')} · ${avecNombre(quiz.tentativesRestantes, 'restante')}`;

  return (
    <section data-quiz-id={quiz.id} aria-labelledby={`${prefixe}-titre`}
      className="bg-white border border-neutral-gray-250 p-4 sm:p-5 rounded-3xl space-y-4">
      <header className="space-y-1 border-b border-neutral-gray-150 pb-3">
        <h5 id={`${prefixe}-titre`} className="font-black text-sm text-neutral-900 flex items-center gap-1.5">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">quiz</span>
          {quiz.titre}
        </h5>
        <p className="text-[11px] text-neutral-500 font-semibold">
          {[quiz.module, avecNombre(quiz.nombreQuestions, 'question'),
            quiz.dureeMinutes ? `durée prévue : ${quiz.dureeMinutes.toLocaleString('fr-FR')}\u00a0min` : null]
            .filter(Boolean).join(' · ')}
        </p>
        {quiz.description && <p className="text-xs text-neutral-600">{quiz.description}</p>}
        <p data-quiz-tentatives className="text-[11px] font-bold text-neutral-700">{libelleTentatives}</p>
        {quiz.dernierResultat && !resultat && (
          <p className="text-[11px] font-semibold text-neutral-600">
            Dernier résultat : <LigneResume r={quiz.dernierResultat} />
          </p>
        )}
      </header>

      {resultat && <ResultatEnvoi resultat={resultat} />}

      {erreur && (
        <p data-quiz-erreur role="alert" className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
          {erreur}
        </p>
      )}

      {sansQuestion && !quiz.dejaFait && (
        <p className="text-xs font-semibold text-neutral-500">Ce quiz ne contient encore aucune question.</p>
      )}

      {epuise && !resultat && (
        <p data-quiz-epuise className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl p-3">
          Tentatives épuisées : vous avez utilisé {quiz.maxTentatives === 1 ? 'votre tentative' : `vos ${quiz.maxTentatives} tentatives`} pour ce quiz.
        </p>
      )}

      {enCours ? (
        <form data-quiz-form noValidate data-validation-externe onSubmit={envoyer} className="space-y-5">
          {quiz.questions.map((question, qi) => {
            const manque = manquantes.includes(qi);
            return (
              <fieldset key={question.id} id={`${prefixe}-q${qi}`} tabIndex={-1}
                aria-invalid={manque || undefined} aria-describedby={manque ? `${prefixe}-q${qi}-erreur` : undefined}
                className="space-y-2 outline-none">
                <legend className="text-xs font-black text-neutral-900 flex gap-2">
                  <span>{qi + 1}.</span><span>{question.enonce || 'Question sans énoncé'}</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.choix.map((option, ci) => {
                    const coche = reponses[qi] === ci;
                    return (
                      <label key={ci}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${coche ? 'border-primary bg-primary/10 text-neutral-900' : 'border-neutral-gray-200 bg-neutral-gray-50 text-neutral-700 hover:border-neutral-300'}`}>
                        <input type="radio" name={`${prefixe}-q${qi}`} value={ci} checked={coche}
                          data-question={qi} data-choix={ci}
                          onChange={() => choisir(qi, ci)} className="accent-primary" />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
                {manque && (
                  <p id={`${prefixe}-q${qi}-erreur`} className="erreur-champ text-[11px] font-bold text-red-700">
                    Choisissez une réponse à cette question.
                  </p>
                )}
              </fieldset>
            );
          })}
          {manquantes.length > 0 && (
            <p className="text-xs font-bold text-red-700">
              Réponses non envoyées : {avecNombre(manquantes.length, 'question est restée', 'questions sont restées')} sans réponse.
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-neutral-gray-150">
            <button type="button" onClick={() => { setEnCours(false); setManquantes([]); }} disabled={passer.isPending}
              className="px-4 py-2.5 rounded-xl border border-neutral-gray-300 text-xs font-bold text-neutral-600 hover:bg-neutral-gray-50 cursor-pointer disabled:opacity-60">
              Annuler
            </button>
            <button type="submit" data-action="envoyer" disabled={passer.isPending}
              className="px-5 py-2.5 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer disabled:opacity-60">
              {passer.isPending ? 'Envoi…' : 'Envoyer mes réponses'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          {quiz.peutPasser && !epuise && (
            <button type="button" data-action="commencer" onClick={commencer}
              className="px-5 py-2.5 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer">
              {quiz.dejaFait || resultat ? 'Faire une nouvelle tentative' : 'Commencer le quiz'}
            </button>
          )}
          {(quiz.dejaFait || resultat) && (
            <button type="button" data-action="voir-resultats" aria-expanded={voirResultats}
              onClick={() => setVoirResultats((v) => !v)}
              className="px-4 py-2.5 rounded-xl border border-neutral-gray-300 text-xs font-bold text-neutral-700 hover:bg-neutral-gray-50 cursor-pointer">
              {voirResultats ? 'Masquer mes résultats' : 'Voir mes résultats'}
            </button>
          )}
        </div>
      )}

      {voirResultats && <MesTentatives quizId={quiz.id} />}
    </section>
  );
}

function ResultatEnvoi({ resultat }: { resultat: ResultatTentative }) {
  const restantes = resultat.tentativesRestantes;
  return (
    <div data-quiz-resultat role="status" className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
      <p className="text-xs font-black text-emerald-800">
        Réponses enregistrées. Note : {phraseScore(resultat.score, resultat.total)}
        {resultat.pourcentage !== null && ` (${pourcentFr(resultat.pourcentage)})`}.
      </p>
      {restantes !== null && (
        <p className="text-[11px] font-semibold text-emerald-900">
          {restantes > 0
            ? `${avecNombre(restantes, 'tentative restante', 'tentatives restantes')}. La correction s'affichera quand vous aurez utilisé toutes vos tentatives.`
            : 'Vous avez utilisé toutes vos tentatives pour ce quiz.'}
        </p>
      )}
      {resultat.correction && <Correction lignes={resultat.correction} />}
    </div>
  );
}

function MesTentatives({ quizId }: { quizId: string }) {
  const requete = useMesResultats(quizId, true);
  if (requete.isPending) return <p className="text-xs font-semibold text-neutral-500">Chargement de vos résultats…</p>;
  if (requete.isError) {
    return (
      <div role="alert" className="space-y-2">
        <p className="text-xs font-bold text-red-700">{resolveErrorMessage(requete.error)}</p>
        {statutErreur(requete.error) !== 404 && (
          <button type="button" data-action="reessayer" onClick={() => void requete.refetch()}
            className="px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black cursor-pointer">
            Réessayer
          </button>
        )}
      </div>
    );
  }
  const r = requete.data;
  return (
    <div data-quiz-mes-resultats className="bg-neutral-gray-50 border border-neutral-gray-200 rounded-2xl p-4 space-y-3">
      <h6 className="text-xs font-black text-neutral-900">Mes tentatives</h6>
      <ol className="space-y-1 text-[11px] font-semibold text-neutral-700">
        {r.tentatives.map((t, i) => (
          <li key={t.id || i}>Tentative {t.numero ?? i + 1} : <LigneResume r={t} /></li>
        ))}
      </ol>
      {r.correction
        ? <Correction lignes={r.correction} />
        : <p className="text-[11px] text-neutral-500">La correction s'affichera quand vous aurez utilisé toutes vos tentatives.</p>}
    </div>
  );
}

/** Correction renvoyée par le serveur après la dernière tentative (jamais calculée dans le navigateur). */
function Correction({ lignes }: { lignes: LigneCorrection[] }) {
  return (
    <div data-quiz-correction className="space-y-3 pt-2">
      <h6 className="text-xs font-black text-neutral-900">Correction</h6>
      {lignes.map((l, qi) => (
        <div key={l.questionId} className="space-y-1.5">
          <p className="text-xs font-bold text-neutral-900">
            {qi + 1}. {l.enonce || 'Question sans énoncé'}{' '}
            <span className={l.correcte ? 'text-emerald-700' : 'text-red-700'}>{l.correcte ? '· juste' : '· fausse'}</span>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {l.choix.map((option, ci) => {
              const bonne = l.bonneReponse === ci;
              const donnee = l.reponseDonnee === ci;
              const style = bonne ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : donnee ? 'border-red-300 bg-red-50 text-red-900' : 'border-neutral-gray-200 bg-white text-neutral-500';
              return (
                <li key={ci} className={`px-3 py-2 rounded-xl border text-[11px] font-semibold flex justify-between gap-2 ${style}`}>
                  <span>{option}</span>
                  <span className="shrink-0">{bonne ? (donnee ? 'Votre réponse · bonne réponse' : 'Bonne réponse') : donnee ? 'Votre réponse' : ''}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

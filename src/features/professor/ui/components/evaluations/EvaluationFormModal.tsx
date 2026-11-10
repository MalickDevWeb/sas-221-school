import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { Evaluation, EvaluationSaisie, SessionEvaluation, TypeEvaluation } from '../../../domain/Evaluations';
import { TYPES_EVALUATION } from '../../../domain/Evaluations';

interface Props {
  readonly initiale: Evaluation | null;          // null = création
  readonly evaluations: readonly Evaluation[];   // pour choisir l'évaluation rattrapée
  readonly onEnregistrer: (saisie: EvaluationSaisie) => Promise<void>;
  readonly onFermer: () => void;
}

const champ = 'mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-800 focus:border-primary focus:outline-none';
const etiquette = 'text-[10px] font-black uppercase tracking-wider text-neutral-500';

export function EvaluationFormModal({ initiale, evaluations, onEnregistrer, onFermer }: Props) {
  const [titre, setTitre] = useState(initiale?.titre ?? '');
  const [type, setType] = useState<TypeEvaluation>(initiale?.type ?? 'DEVOIR_SURVEILLE');
  const [date, setDate] = useState(initiale?.date ?? '');
  const [coefficient, setCoefficient] = useState(initiale ? String(initiale.coefficient) : '');
  const [noteSur, setNoteSur] = useState(initiale ? String(initiale.noteSur) : '20');
  const [session, setSession] = useState<SessionEvaluation>(initiale?.session ?? 'NORMALE');
  const [rattrapee, setRattrapee] = useState(initiale?.evaluationRattrapeeId ?? '');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const normales = evaluations.filter((e) => e.session === 'NORMALE' && e.id !== initiale?.id);

  const soumettre = async (ev: FormEvent) => {
    ev.preventDefault();
    setErreur(null);
    const coef = Number(coefficient.replace(',', '.'));
    const sur = Number(noteSur.replace(',', '.'));
    if (!titre.trim()) return setErreur('Donnez un titre à l\'évaluation.');
    if (!date) return setErreur('Indiquez la date de l\'évaluation.');
    if (!Number.isFinite(coef) || coef <= 0 || coef > 10) return setErreur('Le coefficient doit être strictement positif et au plus 10.');
    if (!Number.isFinite(sur) || sur <= 0 || sur > 100) return setErreur('Le barème (note sur) doit être compris entre 1 et 100.');
    if (session === 'RATTRAPAGE' && !rattrapee) return setErreur('Choisissez l\'évaluation que ce rattrapage remplace.');
    setEnvoi(true);
    try {
      await onEnregistrer({
        titre: titre.trim(), type, date, coefficient: coef, noteSur: sur, session,
        evaluationRattrapeeId: session === 'RATTRAPAGE' ? rattrapee : null,
      });
    } catch (e) {
      setErreur(resolveErrorMessage(e));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="titre-form-evaluation">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 id="titre-form-evaluation" className="text-sm font-black text-neutral-800">
            {initiale ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'}
          </h2>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form noValidate onSubmit={soumettre} className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={etiquette} htmlFor="eval-titre">Titre</label>
            <input id="eval-titre" className={champ} value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={150}
              required data-msg-requis="Donnez un titre à l'évaluation." placeholder="Ex. : Devoir surveillé n° 1" />
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-type">Type</label>
            <select id="eval-type" className={champ} value={type} onChange={(e) => setType(e.target.value as TypeEvaluation)}>
              {TYPES_EVALUATION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-date">Date</label>
            <input id="eval-date" type="date" className={champ} value={date} onChange={(e) => setDate(e.target.value)}
              required data-msg-requis="Indiquez la date de l'évaluation." />
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-coef">Coefficient</label>
            <input id="eval-coef" type="number" inputMode="decimal" min={0.01} max={10} step={0.01} className={champ}
              value={coefficient} onChange={(e) => setCoefficient(e.target.value)} required data-msg-requis="Indiquez le coefficient (entre 0 et 10)." />
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-sur">Noté sur</label>
            <input id="eval-sur" type="number" inputMode="decimal" min={1} max={100} step={0.5} className={champ}
              value={noteSur} onChange={(e) => setNoteSur(e.target.value)} required data-msg-requis="Indiquez le barème (20 par défaut)." />
          </div>
          <div className={session === 'RATTRAPAGE' ? '' : 'col-span-2'}>
            <label className={etiquette} htmlFor="eval-session">Session</label>
            <select id="eval-session" className={champ} value={session} onChange={(e) => setSession(e.target.value as SessionEvaluation)}>
              <option value="NORMALE">Normale</option>
              <option value="RATTRAPAGE">Rattrapage</option>
            </select>
          </div>
          {session === 'RATTRAPAGE' && (
            <div>
              <label className={etiquette} htmlFor="eval-rattrapee">Rattrape</label>
              <select id="eval-rattrapee" className={champ} value={rattrapee} onChange={(e) => setRattrapee(e.target.value)}
                required data-msg-requis="Choisissez l'évaluation rattrapée.">
                <option value="">Choisir…</option>
                {normales.map((e) => <option key={e.id} value={e.id}>{e.titre} ({e.date})</option>)}
              </select>
            </div>
          )}
          {session === 'RATTRAPAGE' && (
            <p className="col-span-2 text-[11px] font-semibold text-neutral-500">
              La note de rattrapage remplace celle de l'évaluation rattrapée uniquement si elle est meilleure.
            </p>
          )}
          {erreur && <p role="alert" className="col-span-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{erreur}</p>}
          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" onClick={onFermer} className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-black text-neutral-600 hover:bg-neutral-50 cursor-pointer">Annuler</button>
            <button type="submit" disabled={envoi} className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 cursor-pointer">
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

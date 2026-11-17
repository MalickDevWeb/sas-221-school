import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import type { Evaluation, EvaluationSaisie, SessionEvaluation, TypeEvaluation } from '../../../domain/Evaluations';
import { TYPES_EVALUATION } from '../../../domain/Evaluations';

interface Props {
  readonly initiale: Evaluation | null;          // null = création
  readonly evaluations: readonly Evaluation[];   // pour choisir l'évaluation rattrapée
  /** Lève l'erreur du serveur en cas de refus : elle est affichée sous le champ concerné. */
  readonly onEnregistrer: (saisie: EvaluationSaisie) => Promise<void>;
  readonly onFermer: () => void;
}

const nombre = (v: string) => Number(v.replace(',', '.'));

/** Règles d'une évaluation (APP-FE-14 : react-hook-form + zod), alignées sur EvaluationService côté serveur. */
const schemaEvaluation = z.object({
  titre: z.string().trim().min(1, "Donnez un titre à l'évaluation.").max(150, '150 caractères au maximum.'),
  type: z.string().min(1, "Choisissez le type d'évaluation."),
  date: z.string().min(1, "Indiquez la date de l'évaluation."),
  coefficient: z.string().trim().min(1, 'Indiquez le coefficient (entre 0 et 10).')
    .refine(v => Number.isFinite(nombre(v)) && nombre(v) > 0 && nombre(v) <= 10, 'Le coefficient doit être strictement positif et au plus 10.'),
  noteSur: z.string().trim().min(1, 'Indiquez le barème (20 par défaut).')
    .refine(v => Number.isFinite(nombre(v)) && nombre(v) > 0 && nombre(v) <= 100, 'Le barème (note sur) doit être compris entre 1 et 100.'),
  session: z.string(),
  evaluationRattrapeeId: z.string(),
}).refine(v => v.session !== 'RATTRAPAGE' || v.evaluationRattrapeeId !== '',
  { path: ['evaluationRattrapeeId'], message: "Choisissez l'évaluation que ce rattrapage remplace." });
type SaisieFormulaire = z.infer<typeof schemaEvaluation>;

/** Message du serveur → champ (premier mot-clé reconnu). */
const MOTS_CLES = {
  noteSur: /barème/i,
  coefficient: /coefficient/i,
  titre: /titre/i,
  date: /\bdate\b/i,
  type: /\btype\b/i,
  evaluationRattrapeeId: /rattrap/i,
} as const;

const champ = 'mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-800 focus:border-primary focus:outline-none aria-[invalid=true]:border-red-400';
const etiquette = 'text-[10px] font-black uppercase tracking-wider text-neutral-500';

export function EvaluationFormModal({ initiale, evaluations, onEnregistrer, onFermer }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);
  const { register, handleSubmit, setError, control, formState: { errors, isSubmitting } } = useForm<SaisieFormulaire>({
    resolver: zodResolver(schemaEvaluation),
    mode: 'onTouched',
    defaultValues: {
      titre: initiale?.titre ?? '', type: initiale?.type ?? 'DEVOIR_SURVEILLE', date: initiale?.date ?? '',
      coefficient: initiale ? String(initiale.coefficient) : '', noteSur: initiale ? String(initiale.noteSur) : '20',
      session: initiale?.session ?? 'NORMALE', evaluationRattrapeeId: initiale?.evaluationRattrapeeId ?? '',
    },
  });
  const session = useWatch({ control, name: 'session' });
  const normales = evaluations.filter((e) => e.session === 'NORMALE' && e.id !== initiale?.id);
  const aria = (id: keyof SaisieFormulaire) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `eval-${id}-erreur` } : {};
  const message = (id: keyof SaisieFormulaire) => errors[id] && (
    <p id={`eval-${id}-erreur`} role="alert" className="mt-1 text-[11px] font-bold text-red-700">{errors[id]?.message}</p>
  );

  const soumettre = async (v: SaisieFormulaire) => {
    setErreur(null);
    try {
      await onEnregistrer({
        titre: v.titre.trim(), type: v.type as TypeEvaluation, date: v.date,
        coefficient: nombre(v.coefficient), noteSur: nombre(v.noteSur), session: v.session as SessionEvaluation,
        evaluationRattrapeeId: v.session === 'RATTRAPAGE' ? v.evaluationRattrapeeId : null,
      });
    } catch (e) {
      // Refus du serveur (barème inférieur à une note saisie, date du rattrapage…) : sous le champ concerné
      setErreur(reporterErreurServeur(e, setError, { motsCles: MOTS_CLES }));
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
        <form id="form-evaluation" noValidate data-validation-externe onSubmit={handleSubmit(soumettre)} className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={etiquette} htmlFor="eval-titre">Titre</label>
            <input id="eval-titre" className={champ} placeholder="Ex. : Devoir surveillé n° 1" {...register('titre')} {...aria('titre')} />
            {message('titre')}
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-type">Type</label>
            <select id="eval-type" className={champ} {...register('type')} {...aria('type')}>
              {TYPES_EVALUATION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {message('type')}
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-date">Date</label>
            <input id="eval-date" type="date" className={champ} {...register('date')} {...aria('date')} />
            {message('date')}
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-coef">Coefficient</label>
            <input id="eval-coef" inputMode="decimal" placeholder="Ex. : 2" className={champ} {...register('coefficient')} {...aria('coefficient')} />
            {message('coefficient')}
          </div>
          <div>
            <label className={etiquette} htmlFor="eval-sur">Noté sur</label>
            <input id="eval-sur" inputMode="decimal" className={champ} {...register('noteSur')} {...aria('noteSur')} />
            {message('noteSur')}
          </div>
          <div className={session === 'RATTRAPAGE' ? '' : 'col-span-2'}>
            <label className={etiquette} htmlFor="eval-session">Session</label>
            <select id="eval-session" className={champ} {...register('session')}>
              <option value="NORMALE">Normale</option>
              <option value="RATTRAPAGE">Rattrapage</option>
            </select>
          </div>
          {session === 'RATTRAPAGE' && (
            <div>
              <label className={etiquette} htmlFor="eval-rattrapee">Rattrape</label>
              <select id="eval-rattrapee" className={champ} {...register('evaluationRattrapeeId')} {...aria('evaluationRattrapeeId')}>
                <option value="">Choisir…</option>
                {normales.map((e) => <option key={e.id} value={e.id}>{e.titre} ({e.date})</option>)}
              </select>
              {message('evaluationRattrapeeId')}
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
            <button type="submit" disabled={isSubmitting} onMouseDown={(e) => e.preventDefault()} className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 cursor-pointer">
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

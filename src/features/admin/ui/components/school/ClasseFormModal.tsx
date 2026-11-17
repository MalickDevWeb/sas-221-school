import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Classe, Filiere } from '../../../domain/SchoolModels';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import { DeleteConfirmInput } from './DeleteConfirmInput';
import { FiliereRapide } from './FiliereRapide';

interface Props {
  classe?: Classe | null;
  filieres: Filiere[];
  onClose: () => void;
  /** Renvoie le message du serveur en cas d'échec (la fenêtre reste alors ouverte avec la saisie). */
  onSave: (classe: Classe) => Promise<string | null> | void;
  onDelete?: (id: string) => void;
  /** Crée une filière sans quitter la fenêtre (null si enregistrée, sinon le message du serveur). */
  onCreerFiliere?: (filiere: Filiere) => Promise<string | null>;
}

const entier = (v: string) => Number(v.trim());
/** Identifiant d'une nouvelle classe (hors rendu : appelé seulement à l'enregistrement). */
const nouvelIdClasse = () => `c-${Date.now()}`;

/** Règles d'une classe (APP-FE-14 : react-hook-form + zod). */
const schemaClasse = z.object({
  level: z.string().min(1, 'Choisissez le niveau.'),
  filiereId: z.string().min(1, 'Choisissez la filière de la classe.'),
  name: z.string().trim().max(100, '100 caractères au maximum.'),
  capacity: z.string().trim().min(1, "Indiquez la capacité maximale (nombre d'élèves).")
    .refine(v => Number.isInteger(entier(v)) && entier(v) >= 1 && entier(v) <= 1000, 'Capacité invalide : un nombre entier entre 1 et 1000.'),
  price: z.string().trim().min(1, 'Indiquez les frais annuels (0 si la formation est gratuite).')
    .refine(v => Number.isInteger(entier(v)) && entier(v) >= 0, 'Frais invalides : un montant entier en FCFA, positif ou nul.'),
});
type SaisieClasse = z.infer<typeof schemaClasse>;

/** Saisie numérique : seuls les chiffres sont gardés (« zzzzz » ou « 450 000 » collé → « » ou « 450000 »). */
const chiffresSeuls = (v: string) => v.replace(/\D/g, '');

const MOTS_CLES = { capacity: /capacité/i, price: /frais/i, filiereId: /filière/i, name: /\bnom\b/i } as const;
const champCls = 'w-full mt-1 px-3 py-2 border border-neutral-200 rounded-xl bg-white text-xs focus:outline-none focus:border-primary aria-[invalid=true]:border-rose-400';

export function ClasseFormModal({ classe, filieres, onClose, onSave, onDelete, onCreerFiliere }: Props) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [erreurGlobale, setErreurGlobale] = useState('');
  const [filiereRapideOuverte, setFiliereRapideOuverte] = useState(false);
  /** Filière créée ici, à sélectionner dès qu'elle apparaît dans la liste. */
  const [filiereASelectionner, setFiliereASelectionner] = useState<string | null>(null);
  const [caracteresRefuses, setCaracteresRefuses] = useState<Partial<Record<'capacity' | 'price', boolean>>>({});
  const { register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm<SaisieClasse>({
    resolver: zodResolver(schemaClasse),
    mode: 'onTouched',
    defaultValues: {
      level: classe?.level || 'L1', filiereId: classe?.filiereId || filieres[0]?.id || '', name: classe?.name || '',
      capacity: classe?.capacityMax?.toString() || '', price: classe?.price?.toString() || '',
    },
  });
  useEffect(() => {
    if (filiereASelectionner && filieres.some(f => f.id === filiereASelectionner)) {
      setValue('filiereId', filiereASelectionner, { shouldValidate: true, shouldDirty: true });
      setFiliereASelectionner(null);
    }
  }, [filieres, filiereASelectionner, setValue]);

  /** Champ numérique : les caractères autres que des chiffres sont retirés à la frappe, avec une explication. */
  const champNombre = (nom: 'capacity' | 'price') => {
    const r = register(nom);
    return {
      ...r,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const propre = chiffresSeuls(e.target.value);
        // Comparaison faite AVANT de remplacer la valeur : la fonction passée à setState peut s'exécuter plus tard,
        // quand e.target.value vaut déjà « propre » ; l'aide « Chiffres uniquement » ne s'afficherait jamais.
        const refuses = propre !== e.target.value;
        setCaracteresRefuses(prev => ({ ...prev, [nom]: refuses }));
        if (refuses) e.target.value = propre;
        return r.onChange(e);
      },
    };
  };
  const aideChiffres = (nom: 'capacity' | 'price') => caracteresRefuses[nom] && !errors[nom] && (
    <p id={`classe-${nom}-aide`} className="mt-1 text-[10px] font-bold text-amber-700">Chiffres uniquement : les autres caractères ont été retirés.</p>
  );

  const aria = (id: keyof SaisieClasse) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `classe-${id}-erreur` } : {};
  const message = (id: keyof SaisieClasse) => errors[id] && (
    <p id={`classe-${id}-erreur`} role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors[id]?.message}</p>
  );

  const enregistrer = async (v: SaisieClasse) => {
    setErreurGlobale('');
    const selFiliere = filieres.find(f => f.id === v.filiereId);
    if (!selFiliere) {
      setError('filiereId', { type: 'manual', message: 'Filière introuvable : rechargez la page.' });
      return;
    }
    const erreur = await onSave({
      id: classe?.id || nouvelIdClasse(),
      name: v.name.trim() || `${v.level} ${selFiliere.name}`,
      level: v.level,
      filiereId: v.filiereId,
      capacityMax: entier(v.capacity),
      price: entier(v.price),
    });
    if (erreur) {
      setErreurGlobale(reporterErreurServeur({ response: { data: { message: erreur } } }, setError, { motsCles: MOTS_CLES }) ?? '');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <form id="form-classe" onSubmit={handleSubmit(enregistrer)} noValidate data-validation-externe className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 w-full max-w-md space-y-4">
        <h3 className="font-extrabold text-[#1E293B] text-sm border-b border-neutral-100 pb-2">
          {classe ? 'Modifier la Classe' : 'Créer une Nouvelle Classe'}
        </h3>

        {!isConfirmingDelete && (
          <div className="space-y-3 text-left">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="classe-level" className="text-[10px] uppercase font-black text-neutral-400">Niveau</label>
                <select id="classe-level" className={`${champCls} font-bold`} {...register('level')} {...aria('level')}>
                  {['L1', 'L2', 'L3', 'M1', 'M2'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
                {message('level')}
              </div>
              <div>
                <label htmlFor="classe-filiereId" className="text-[10px] uppercase font-black text-neutral-400">Filière d'Étude</label>
                <select id="classe-filiereId" className={`${champCls} font-bold`} {...register('filiereId')} {...aria('filiereId')}>
                  {filieres.length === 0 && <option value="">{onCreerFiliere ? 'Aucune filière — créez-en une ci-dessous' : "Aucune filière — créez-en une d'abord"}</option>}
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                {errors.filiereId && filieres.length === 0
                  ? <p id="classe-filiereId-erreur" role="alert" className="mt-1 text-[10px] font-bold text-rose-700">
                      {onCreerFiliere ? 'Aucune filière : créez-en une avec « + Nouvelle filière ».' : 'Aucune filière : créez-en une dans « Filières & Spécialités ».'}
                    </p>
                  : message('filiereId')}
                {onCreerFiliere && !filiereRapideOuverte && (
                  <button id="classe-nouvelle-filiere" type="button" onClick={() => setFiliereRapideOuverte(true)}
                          className="mt-1 text-[11px] font-bold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0">
                    + Nouvelle filière
                  </button>
                )}
              </div>
            </div>
            {onCreerFiliere && filiereRapideOuverte && (
              <FiliereRapide
                filieres={filieres}
                onCreer={onCreerFiliere}
                onCreee={(f) => { setFiliereASelectionner(f.id); setFiliereRapideOuverte(false); }}
                onAnnuler={() => setFiliereRapideOuverte(false)}
              />
            )}
            <div>
              <label htmlFor="classe-name" className="text-[10px] uppercase font-black text-neutral-400">Libellé Personnalisé (Optionnel)</label>
              <input id="classe-name" type="text" className={`${champCls} font-semibold`} placeholder="Laisser vide pour calcul automatique" {...register('name')} {...aria('name')} />
              {message('name')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="classe-capacity" className="text-[10px] uppercase font-black text-neutral-400">Capacité Max</label>
                <input id="classe-capacity" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" placeholder="Ex. : 40" className={`${champCls} font-semibold`} {...champNombre('capacity')} {...aria('capacity')} />
                {message('capacity')}
                {aideChiffres('capacity')}
              </div>
              <div>
                <label htmlFor="classe-price" className="text-[10px] uppercase font-black text-neutral-400">Frais Annuels (FCFA)</label>
                <input id="classe-price" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" placeholder="Ex. : 450000" className={`${champCls} font-semibold`} {...champNombre('price')} {...aria('price')} />
                {message('price')}
                {aideChiffres('price')}
              </div>
            </div>
          </div>
        )}

        {isConfirmingDelete && onDelete && (
          <DeleteConfirmInput
            onConfirm={() => {
              onDelete(classe!.id);
              onClose();
            }}
            onCancel={() => setIsConfirmingDelete(false)}
          />
        )}

        {erreurGlobale && !isConfirmingDelete && <p role="alert" className="text-[11px] font-bold text-rose-700">{erreurGlobale}</p>}

        {!isConfirmingDelete && (
          <div className="flex justify-between items-center pt-2">
            {classe && onDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer border-0 bg-transparent"
              >
                <span translate="no" className="material-symbols-outlined text-xs">delete</span>
                <span>Supprimer</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 bg-white cursor-pointer">
                Annuler
              </button>
              <button type="submit" disabled={isSubmitting} onMouseDown={e => e.preventDefault()} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#921316] cursor-pointer border-0 disabled:opacity-60">
                {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

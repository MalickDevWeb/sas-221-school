import React, { useEffect, useState } from 'react';
import { useForm, useWatch, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary, UploadError } from '@/shared/utils/cloudinaryUpload';
import { ROUTES } from '@/shared/constants';
import { parentApi } from '@/features/parent/api';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useCandidatureSettings } from '@/features/auth/hooks/useCandidatureSettings';
import { usePiecesRegles } from '@/features/auth/ui/components/candidature/portal/usePiecesRegles';
import { PiecesRegles } from '@/features/auth/ui/components/candidature/portal/PiecesRegles';
import { ChoixPays } from '@/shared/components/ChoixPays';
import { nomPays } from '@/shared/constants/pays';

const dateFr = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR');
};

// ─── Étapes du processus ────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Informations personnelles',  icon: 'person'         },
  { id: 2, label: 'Scolarité & Formation',       icon: 'school'         },
  { id: 3, label: 'Documents justificatifs',     icon: 'upload_file'    },
  { id: 4, label: 'Confirmation',                icon: 'check_circle'   },
];

const FILIERES = [
  'Informatique & Réseaux',
  'Génie Logiciel',
  'Intelligence Artificielle',
  'Cybersécurité',
  'Systèmes Embarqués',
  'Gestion Informatique',
  'Commerce & Marketing Digital',
  'Finance & Comptabilité',
  'Droit des Affaires',
  'Communication',
];

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];

const ANNEE = new Date().getFullYear();
const TAILLE_MAX = 5 * 1024 * 1024;

/**
 * Règles du dossier (APP-FE-14 : react-hook-form + zod). Chaque étape ne laisse passer que si ses champs sont
 * valides, avec un message précis sous le champ.
 */
const schemaInscription = z.object({
  // Étape 1
  prenom: z.string().trim().min(1, "Saisissez le prénom de l'enfant."),
  nom: z.string().trim().min(1, "Saisissez le nom de famille de l'enfant."),
  dateNaissance: z.string().min(1, 'Indiquez la date de naissance.')
    .refine(v => !Number.isNaN(Date.parse(v)), 'Date de naissance invalide.')
    .refine(v => new Date(v) < new Date(), 'La date de naissance doit être passée.')
    .refine(v => new Date(v).getFullYear() >= 1950, 'Date de naissance invalide : vérifiez l’année.'),
  lieuNaissance: z.string().trim().min(1, 'Indiquez le lieu de naissance.'),
  // Code ISO du pays (liste), obligatoire : les règles d'admission de l'école peuvent en dépendre
  nationalite: z.string().trim().regex(/^[A-Z]{2}$/, 'Choisissez la nationalité dans la liste.'),
  sexe: z.string().refine((v): boolean => v === 'M' || v === 'F', "Indiquez le sexe de l'enfant."),
  email: z.string().trim()
    .min(1, "Saisissez l'adresse e-mail de l'enfant : elle sert au suivi du dossier.")
    .email('Adresse e-mail invalide : vérifiez le format (ex. prenom.nom@exemple.sn).'),
  telephone: z.string().trim()
    .refine(v => v === '' || /^\+?[\d\s.-]{7,20}$/.test(v), 'Numéro invalide : chiffres, espaces et « + » uniquement (ex. 77 123 45 67).'),
  adresse: z.string().trim(),
  // Étape 2
  filiere: z.string().min(1, 'Choisissez la filière souhaitée.'),
  niveau: z.string().min(1, "Choisissez le niveau d'entrée."),
  diplomePrecedent: z.string().trim().min(1, 'Indiquez le dernier diplôme obtenu.'),
  etablissementPrecedent: z.string().trim().min(1, "Indiquez l'établissement fréquenté."),
  anneeBac: z.string().trim()
    .refine(v => v === '' || (/^\d{4}$/.test(v) && Number(v) >= 1990 && Number(v) <= ANNEE),
      `Année invalide : entre 1990 et ${ANNEE}.`),
  mentionBac: z.string(),
  // Étape 3 : liens renvoyés par le serveur après un envoi réussi
  photoIdentiteUrl: z.string().min(1, "Joignez la photo d'identité de l'enfant."),
  relevesNotesUrl: z.string().min(1, 'Joignez les relevés de notes.'),
  diplomeUrl: z.string().min(1, 'Joignez le diplôme ou une attestation.'),
  // Étape 4
  accepteReglement: z.boolean().refine(v => v, 'Cochez la case pour attester de l’exactitude du dossier.'),
});
type FormData = z.infer<typeof schemaInscription>;
type Champ = keyof FormData;

const CHAMPS_ETAPE: Record<number, Champ[]> = {
  1: ['prenom', 'nom', 'dateNaissance', 'lieuNaissance', 'nationalite', 'sexe', 'email', 'telephone', 'adresse'],
  2: ['filiere', 'niveau', 'diplomePrecedent', 'etablissementPrecedent', 'anneeBac', 'mentionBac'],
  3: ['photoIdentiteUrl', 'relevesNotesUrl', 'diplomeUrl'],
  4: ['accepteReglement'],
};

const EMPTY_FORM: FormData = {
  prenom: '', nom: '', dateNaissance: '', lieuNaissance: '',
  nationalite: '', sexe: '', email: '', telephone: '', adresse: '',
  filiere: '', niveau: '', diplomePrecedent: '', etablissementPrecedent: '',
  anneeBac: '', mentionBac: '',
  photoIdentiteUrl: '', relevesNotesUrl: '', diplomeUrl: '',
  accepteReglement: false,
};

type Erreurs = FieldErrors<FormData>;
type Enregistrer = UseFormRegister<FormData>;

// ─── Composant champ de formulaire ──────────────────────────
function Field({
  id, label, required, erreur, children, className = '',
}: { id: Champ; label: string; required?: boolean; erreur?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {erreur && <p id={`${id}-erreur`} role="alert" className="text-[11px] font-bold text-red-600">{erreur}</p>}
    </div>
  );
}

const inputCls =
  'w-full h-10 px-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder-neutral-300 aria-[invalid=true]:border-red-400';

const selectCls =
  'w-full h-10 px-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all aria-[invalid=true]:border-red-400';

/** Attributs d'accessibilité communs : champ en erreur relié à son message. */
function aria(errors: Erreurs, id: Champ) {
  return errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-erreur` } : {};
}

// ─── Étape 1 : Infos personnelles ───────────────────────────
function Step1({ register, errors }: { register: Enregistrer; errors: Erreurs }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field id="prenom" label="Prénom" required erreur={errors.prenom?.message}>
        <input id="prenom" className={inputCls} {...register('prenom')} {...aria(errors, 'prenom')} placeholder="Ex: Aminata" />
      </Field>
      <Field id="nom" label="Nom de famille" required erreur={errors.nom?.message}>
        <input id="nom" className={inputCls} {...register('nom')} {...aria(errors, 'nom')} placeholder="Ex: Diallo" />
      </Field>
      <Field id="dateNaissance" label="Date de naissance" required erreur={errors.dateNaissance?.message}>
        <input id="dateNaissance" type="date" className={inputCls} {...register('dateNaissance')} {...aria(errors, 'dateNaissance')} />
      </Field>
      <Field id="lieuNaissance" label="Lieu de naissance" required erreur={errors.lieuNaissance?.message}>
        <input id="lieuNaissance" className={inputCls} {...register('lieuNaissance')} {...aria(errors, 'lieuNaissance')} placeholder="Ex: Dakar" />
      </Field>
      <Field id="nationalite" label="Nationalité" required erreur={errors.nationalite?.message}>
        <ChoixPays id="nationalite" className={selectCls} {...register('nationalite')} {...aria(errors, 'nationalite')} />
      </Field>
      <Field id="sexe" label="Sexe" required erreur={errors.sexe?.message}>
        <select id="sexe" className={selectCls} {...register('sexe')} {...aria(errors, 'sexe')}>
          <option value="">— Sélectionner —</option>
          <option value="F">Féminin</option>
          <option value="M">Masculin</option>
        </select>
      </Field>
      <Field id="email" label="Email de l'enfant" required erreur={errors.email?.message}>
        <input id="email" type="email" className={inputCls} {...register('email')} {...aria(errors, 'email')} placeholder="enfant@email.com" />
      </Field>
      <Field id="telephone" label="Téléphone de l'enfant" erreur={errors.telephone?.message}>
        <input id="telephone" type="tel" className={inputCls} {...register('telephone')} {...aria(errors, 'telephone')} placeholder="77 XXX XX XX" />
      </Field>
      <Field id="adresse" label="Adresse complète" className="sm:col-span-2">
        <input id="adresse" className={inputCls} {...register('adresse')} placeholder="Quartier, ville" />
      </Field>
    </div>
  );
}

// ─── Étape 2 : Scolarité ─────────────────────────────────────
function Step2({ register, errors }: { register: Enregistrer; errors: Erreurs }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field id="filiere" label="Filière souhaitée" required erreur={errors.filiere?.message}>
        <select id="filiere" className={selectCls} {...register('filiere')} {...aria(errors, 'filiere')}>
          <option value="">— Sélectionner —</option>
          {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field id="niveau" label="Niveau d'entrée" required erreur={errors.niveau?.message}>
        <select id="niveau" className={selectCls} {...register('niveau')} {...aria(errors, 'niveau')}>
          <option value="">— Sélectionner —</option>
          {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>
      <Field id="diplomePrecedent" label="Diplôme précédent obtenu" required erreur={errors.diplomePrecedent?.message}>
        <input id="diplomePrecedent" className={inputCls} {...register('diplomePrecedent')} {...aria(errors, 'diplomePrecedent')}
          placeholder="Ex: BAC S, BTS, Licence..." />
      </Field>
      <Field id="etablissementPrecedent" label="Établissement précédent" required erreur={errors.etablissementPrecedent?.message}>
        <input id="etablissementPrecedent" className={inputCls} {...register('etablissementPrecedent')} {...aria(errors, 'etablissementPrecedent')}
          placeholder="Nom du lycée / université" />
      </Field>
      <Field id="anneeBac" label="Année d'obtention du BAC" erreur={errors.anneeBac?.message}>
        <input id="anneeBac" inputMode="numeric" className={inputCls} {...register('anneeBac')} {...aria(errors, 'anneeBac')} placeholder={`Ex: ${ANNEE}`} />
      </Field>
      <Field id="mentionBac" label="Mention au BAC">
        <select id="mentionBac" className={selectCls} {...register('mentionBac')}>
          <option value="">— Sélectionner —</option>
          <option value="Passable">Passable</option>
          <option value="Assez Bien">Assez Bien</option>
          <option value="Bien">Bien</option>
          <option value="Très Bien">Très Bien</option>
        </select>
      </Field>
    </div>
  );
}

// ─── Étape 3 : Documents ─────────────────────────────────────
/**
 * Envoi RÉEL du fichier (POST /media/upload, mode strict : aucun repli local). La pièce n'est marquée reçue
 * qu'avec le lien renvoyé par le serveur ; en cas d'échec, le message du serveur s'affiche sous la zone.
 */
function UploadZone({ id, label, hint, accept, types, nomFichier, erreur, onEnvoi, onEnvoye, onEchec }: {
  id: Champ; label: string; hint: string; accept: string; types: string[];
  nomFichier?: string; erreur?: string;
  onEnvoi: (enCours: boolean) => void; onEnvoye: (url: string, nom: string) => void; onEchec: (message: string) => void;
}) {
  const [progression, setProgression] = useState<number | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!types.includes(file.type)) {
      onEchec(`« ${file.name} » n'est pas accepté : ${hint}.`);
      return;
    }
    if (file.size > TAILLE_MAX) {
      onEchec(`« ${file.name} » fait ${(file.size / 1048576).toFixed(1)} Mo : 5 Mo maximum.`);
      return;
    }
    setProgression(0);
    onEnvoi(true);
    try {
      const url = await uploadToCloudinary(file, setProgression, { strict: true, confidentiel: true });
      onEnvoye(url, file.name);
    } catch (err) {
      onEchec(err instanceof UploadError ? err.message : 'L’envoi du fichier a échoué. Veuillez réessayer.');
    } finally {
      setProgression(null);
      onEnvoi(false);
    }
  };

  const recu = Boolean(nomFichier) && !erreur;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">{label} <span className="text-red-500">*</span></label>
      <label className={`flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
        erreur ? 'border-red-300 bg-red-50' : recu ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-neutral-50 hover:border-primary hover:bg-blue-50/30'
      }`}>
        <input id={id} type="file" accept={accept} className="sr-only" onChange={handleFile} disabled={progression !== null}
          {...(erreur ? { 'aria-invalid': true, 'aria-describedby': `${id}-erreur` } : {})} />
        {progression !== null ? (
          <p className="text-[10px] font-black text-primary">Envoi… {progression} %</p>
        ) : recu ? (
          <>
            <span translate="no" className="material-symbols-outlined text-[28px] text-emerald-500">check_circle</span>
            <p className="text-[10px] font-black text-emerald-600 truncate max-w-[180px]">{nomFichier}</p>
          </>
        ) : (
          <>
            <span translate="no" className="material-symbols-outlined text-[28px] text-neutral-300">upload_file</span>
            <p className="text-[10px] font-bold text-neutral-400">{hint}</p>
          </>
        )}
      </label>
      {erreur && <p id={`${id}-erreur`} role="alert" className="text-[11px] font-bold text-red-600">{erreur}</p>}
    </div>
  );
}

const PIECES: { id: 'photoIdentiteUrl' | 'relevesNotesUrl' | 'diplomeUrl'; label: string; hint: string; accept: string; types: string[] }[] = [
  { id: 'photoIdentiteUrl', label: "Photo d'identité", hint: 'JPG ou PNG', accept: '.jpg,.jpeg,.png', types: ['image/jpeg', 'image/png'] },
  { id: 'relevesNotesUrl', label: 'Relevés de notes', hint: 'PDF, JPG ou PNG', accept: '.pdf,.jpg,.jpeg,.png', types: ['application/pdf', 'image/jpeg', 'image/png'] },
  { id: 'diplomeUrl', label: 'Diplôme / Attestation', hint: 'PDF, JPG ou PNG', accept: '.pdf,.jpg,.jpeg,.png', types: ['application/pdf', 'image/jpeg', 'image/png'] },
];

function Step3({ errors, noms, setEnvoi, recevoir, echec }: {
  errors: Erreurs; noms: Partial<Record<Champ, string>>;
  setEnvoi: (id: Champ, enCours: boolean) => void;
  recevoir: (id: Champ, url: string, nom: string) => void;
  echec: (id: Champ, message: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <span translate="no" className="material-symbols-outlined text-blue-500 text-[18px] shrink-0 mt-0.5">info</span>
        <p className="text-[11px] text-blue-700 font-semibold leading-relaxed">
          Les documents doivent être lisibles et en cours de validité.
          Formats acceptés : <strong>PDF, JPG, PNG</strong> — max 5 Mo par fichier.
          Chaque pièce est envoyée dès que vous la choisissez et jointe au dossier.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PIECES.map(p => (
          <UploadZone key={p.id} {...p} nomFichier={noms[p.id]} erreur={errors[p.id]?.message}
            onEnvoi={enCours => setEnvoi(p.id, enCours)}
            onEnvoye={(url, nom) => recevoir(p.id, url, nom)}
            onEchec={message => echec(p.id, message)} />
        ))}
      </div>
    </div>
  );
}

// ─── Étape 4 : Récapitulatif ─────────────────────────────────
function Step4({ form, register, errors, noms }: {
  form: FormData; register: Enregistrer; errors: Erreurs; noms: Partial<Record<Champ, string>>;
}) {
  const rows = [
    ['Prénom', form.prenom], ['Nom', form.nom],
    ['Date de naissance', form.dateNaissance], ['Lieu de naissance', form.lieuNaissance],
    ['Nationalité', nomPays(form.nationalite)], ['Sexe', form.sexe === 'F' ? 'Féminin' : form.sexe === 'M' ? 'Masculin' : '—'],
    ['Email', form.email], ['Téléphone', form.telephone || '—'],
    ['Filière', form.filiere], ['Niveau', form.niveau],
    ['Diplôme précédent', form.diplomePrecedent], ['Établissement', form.etablissementPrecedent],
    ['Année BAC', form.anneeBac || '—'], ['Mention BAC', form.mentionBac || '—'],
  ];

  return (
    <div className="space-y-5">
      {/* Recap tableau */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-100 bg-white">
          <p className="text-xs font-black text-neutral-700">Récapitulatif du dossier</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center gap-4 px-5 py-2.5">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider w-40 shrink-0">{k}</p>
              <p className="text-xs font-bold text-neutral-700 truncate">{v || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents réellement envoyés */}
      <div className="grid grid-cols-3 gap-3">
        {PIECES.map(({ id, label }) => {
          const recu = Boolean(form[id]);
          return (
            <div key={id} className={`p-3 rounded-xl border text-center ${recu ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <span translate="no" className={`material-symbols-outlined text-[20px] ${recu ? 'text-emerald-500' : 'text-red-400'}`}>
                {recu ? 'check_circle' : 'cancel'}
              </span>
              <p className="text-[9px] font-black mt-1 truncate text-neutral-600">{label}</p>
              {recu && noms[id] && <p className="text-[9px] text-neutral-500 truncate">{noms[id]}</p>}
            </div>
          );
        })}
      </div>

      {/* Acceptation règlement */}
      <div>
        <label htmlFor="accepteReglement" className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 cursor-pointer group">
          <input id="accepteReglement" type="checkbox" {...register('accepteReglement')} {...aria(errors, 'accepteReglement')}
            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer" />
          <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
            J'atteste que les informations fournies sont exactes et j'accepte le
            <strong className="text-amber-900"> règlement intérieur </strong>
            et la <strong className="text-amber-900">politique de confidentialité</strong> d'École 221.
          </p>
        </label>
        {errors.accepteReglement && (
          <p id="accepteReglement-erreur" role="alert" className="mt-1 text-[11px] font-bold text-red-600">{errors.accepteReglement.message}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────
export function ParentEnrollChildPage() {
  const navigate = useNavigate();
  // Le serveur refuse tout dossier quand l'école n'a pas ouvert les candidatures (403) : on prévient le parent dès
  // l'ouverture, avant les 4 étapes et l'envoi de ses fichiers.
  const { settings: reglages, chargee: reglagesCharges, isCampaignActive, isPeriodStarted, isPeriodEnded } = useCandidatureSettings();
  const candidaturesFermees = reglagesCharges && !isCampaignActive;
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState('');
  const [dossierId, setDossierId] = useState('');
  const [noms, setNoms] = useState<Partial<Record<Champ, string>>>({});
  const [envois, setEnvois] = useState<Partial<Record<Champ, boolean>>>({});

  const {
    register, handleSubmit, trigger, setValue, setError: setErreurChamp, clearErrors, control, reset, getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schemaInscription), defaultValues: EMPTY_FORM, mode: 'onTouched' });
  const form = useWatch({ control }) as FormData;
  // Pièces exigées par les règles d'admission de l'école, évaluées à l'étape des pièces (dépôt par un parent)
  const regles = usePiecesRegles();
  const { evaluer } = regles;
  useEffect(() => {
    if (step !== 3) return;
    const v = getValues();
    void evaluer({ nationalite: v.nationalite, sexe: v.sexe, dateNaissance: v.dateNaissance,
      mentionBac: v.mentionBac, anneeBac: v.anneeBac, depotParent: true });
  }, [step, getValues, evaluer]);
  const envoiEnCours = Object.values(envois).some(Boolean) || regles.envoiEnCours !== null;

  const recevoir = (id: Champ, url: string, nom: string) => {
    setValue(id, url, { shouldValidate: true });
    setNoms(n => ({ ...n, [id]: nom }));
  };
  const echec = (id: Champ, message: string) => {
    // La pièce n'est PAS jointe : on retire un éventuel envoi précédent pour ne jamais afficher un faux « reçu ».
    setValue(id, '');
    setNoms(n => ({ ...n, [id]: undefined }));
    setErreurChamp(id, { type: 'envoi', message });
  };

  const handleNext = async () => {
    setError('');
    if (envoiEnCours) {
      setError('Patientez : une pièce est encore en cours d’envoi.');
      return;
    }
    // Les champs de l'étape sont vérifiés : chaque erreur s'affiche sous son champ, le premier reçoit le focus.
    const champsOk = await trigger(CHAMPS_ETAPE[step], { shouldFocus: true });
    if (step === 3) {
      if (regles.blocages.length > 0) { setError(`Le dossier ne peut pas être déposé : ${regles.blocages[0]}`); return; }
      if (!regles.verifier() || !champsOk) return;
    }
    if (champsOk) setStep(s => s + 1);
  };
  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const deposer = async (valeurs: FormData) => {
    setLoading(true);
    setError('');
    try {
      const depot = await parentApi.enrollChild({
        prenom: valeurs.prenom,
        nom: valeurs.nom,
        dateNaissance: valeurs.dateNaissance,
        lieuNaissance: valeurs.lieuNaissance,
        nationalite: valeurs.nationalite,
        sexe: valeurs.sexe as 'M' | 'F',
        email: valeurs.email,
        telephone: valeurs.telephone,
        adresse: valeurs.adresse,
        filiere: valeurs.filiere,
        niveau: valeurs.niveau,
        diplomePrecedent: valeurs.diplomePrecedent,
        etablissementPrecedent: valeurs.etablissementPrecedent,
        anneeBac: valeurs.anneeBac,
        mentionBac: valeurs.mentionBac,
        photoIdentiteUrl: valeurs.photoIdentiteUrl,
        relevesNotesUrl: valeurs.relevesNotesUrl,
        diplomeUrl: valeurs.diplomeUrl,
        piecesSupplementaires: regles.corps(),
      });
      setDossierId(depot.dossierId);
      setSuccess(true);
    } catch (e) {
      // Plus de « succès » affiché en cas d'échec : le dossier n'est PAS enregistré, le parent doit le savoir.
      setError(`Le dossier n'a pas été enregistré : ${resolveErrorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length) {
      void handleNext();   // « Entrée » dans un champ = étape suivante, jamais un dépôt incomplet
      return;
    }
    void handleSubmit(deposer, (erreurs) => {
      // Une erreur d'une étape précédente (ex. pièce retirée) : on y retourne pour la montrer.
      const etape = [1, 2, 3, 4].find(n => CHAMPS_ETAPE[n].some(c => c in erreurs));
      if (etape && etape !== step) setStep(etape);
    })();
  };

  // ─── Succès ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto w-full animate-fade-in flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-200">
          <span translate="no" className="material-symbols-outlined text-white text-[44px]">check_circle</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">Dossier soumis !</h2>
          <p className="text-sm text-neutral-500 font-semibold leading-relaxed max-w-sm mx-auto">
            Le dossier d'inscription de <strong className="text-neutral-700">{getValues('prenom')} {getValues('nom')}</strong> a
            bien été enregistré, avec ses trois pièces, et transmis à l'administration de l'école. Vous pouvez suivre son
            avancement dans « Mes candidatures ».
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 w-full text-left space-y-2">
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">N° de dossier</span><span className="font-black text-neutral-800">{dossierId}</span></div>
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">Filière</span><span className="font-black text-neutral-800">{form.filiere}</span></div>
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">Niveau</span><span className="font-black text-neutral-800">{form.niveau}</span></div>
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">Statut</span><span className="font-black text-amber-600">En attente de validation</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => { setSuccess(false); reset(EMPTY_FORM); setNoms({}); clearErrors(); setStep(1); }}
            className="flex-1 h-11 border border-neutral-200 rounded-xl text-xs font-black text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            Inscrire un autre enfant
          </button>
          <button
            onClick={() => navigate(ROUTES.parent.dashboard)}
            className="flex-1 h-11 bg-primary hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[860px] mx-auto w-full animate-fade-in pb-28 md:pb-8">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(ROUTES.parent.dashboard)}
          className="flex items-center gap-1.5 text-[11px] font-black text-neutral-400 hover:text-primary transition-colors mb-4 group"
        >
          <span translate="no" className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">person_add</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Inscrire un enfant</h1>
            <p className="text-xs text-neutral-500 font-semibold">Déposez le dossier d'inscription de votre enfant en ligne</p>
          </div>
        </div>
      </div>

      {candidaturesFermees ? (
        <section id="inscription-fermee" role="status" className="bg-white border border-amber-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-amber-600 text-[28px]">event_busy</span>
            <div className="space-y-1">
              <h2 className="text-base font-black text-neutral-900">
                {!reglages.ouvert
                  ? "Les inscriptions en ligne ne sont pas ouvertes dans cette école pour le moment."
                  : !isPeriodStarted
                    ? `Les inscriptions en ligne ouvriront le ${dateFr(reglages.dateOuverture)}.`
                    : `Les inscriptions en ligne sont closes depuis le ${dateFr(reglages.dateFermeture)}.`}
              </h2>
              {reglages.messageAvis?.trim() && <p className="text-sm text-neutral-600 font-medium whitespace-pre-line">{reglages.messageAvis.trim()}</p>}
              <p className="text-sm text-neutral-500 font-medium">
                {isPeriodEnded || !reglages.ouvert
                  ? "Pour inscrire votre enfant, écrivez à l'école : elle vous indiquera la marche à suivre."
                  : "Revenez à cette date pour déposer le dossier, ou écrivez à l'école pour toute question."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button type="button" onClick={() => navigate(ROUTES.parent.dashboard)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-black text-neutral-600 hover:bg-neutral-50">
              Retour à l'accueil
            </button>
            <button type="button" onClick={() => navigate(ROUTES.parent.messages)}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90">
              Écrire à l'école
            </button>
          </div>
        </section>
      ) : (<>
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex flex-col items-center gap-1.5 min-w-[70px] shrink-0 cursor-pointer transition-all ${
              step === s.id ? 'opacity-100' : step > s.id ? 'opacity-80' : 'opacity-40'
            }`}
              onClick={() => step > s.id && setStep(s.id)}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                step > s.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : step === s.id
                  ? 'bg-primary text-white shadow-md shadow-blue-200'
                  : 'bg-neutral-100 text-neutral-400'
              }`}>
                {step > s.id
                  ? <span translate="no" className="material-symbols-outlined text-[16px]">check</span>
                  : <span translate="no" className="material-symbols-outlined text-[16px]">{s.icon}</span>
                }
              </div>
              <p className={`text-[8px] font-black text-center leading-tight max-w-[60px] ${
                step === s.id ? 'text-primary' : 'text-neutral-400'
              }`}>{s.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${step > s.id ? 'bg-emerald-400' : 'bg-neutral-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={soumettre} noValidate data-validation-externe>
      {/* Contenu de l'étape */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 md:p-8 mb-6">
        <h2 className="text-sm font-black text-neutral-800 mb-6 flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-[18px] text-primary">
            {STEPS[step - 1].icon}
          </span>
          {STEPS[step - 1].label}
        </h2>
        {step === 1 && <Step1 register={register} errors={errors} />}
        {step === 2 && <Step2 register={register} errors={errors} />}
        {step === 3 && (
          <Step3 errors={errors} noms={noms} recevoir={recevoir} echec={echec}
            setEnvoi={(id, enCours) => { setEnvois(v => ({ ...v, [id]: enCours })); if (enCours) clearErrors(id); }} />
        )}
        {step === 3 && <div className="mt-4"><PiecesRegles regles={regles} /></div>}
        {step === 4 && <Step4 form={form} register={register} errors={errors} noms={noms} />}
      </div>

      {/* Erreur */}
      {error && (
        <div role="alert" id="erreur-depot" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Navigation. Les boutons ne prennent pas le focus à l'appui (onMouseDown) : sinon le champ quitté est
          revalidé, son message disparaît, le bouton remonte sous le pointeur et le clic est perdu. */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={handleBack}
          disabled={step === 1}
          className="h-11 px-6 border border-neutral-200 rounded-xl text-xs font-black text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Précédent
        </button>
        <p className="text-[10px] font-bold text-neutral-400">Étape {step} / {STEPS.length}</p>
        {step < STEPS.length ? (
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => void handleNext()}
            disabled={envoiEnCours}
            className="h-11 px-8 bg-primary hover:bg-[#0D47A1] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="submit"
            onMouseDown={e => e.preventDefault()}
            disabled={loading || envoiEnCours}
            className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Envoi...' : 'Soumettre le dossier ✓'}
          </button>
        )}
      </div>
      </form>
      </>)}
    </div>
  );
}

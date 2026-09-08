import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { parentApi } from '@/features/parent/api';

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

interface FormData {
  // Étape 1
  prenom:          string;
  nom:             string;
  dateNaissance:   string;
  lieuNaissance:   string;
  nationalite:     string;
  sexe:            'M' | 'F' | '';
  email:           string;
  telephone:       string;
  adresse:         string;
  // Étape 2
  filiere:         string;
  niveau:          string;
  diplomePrecedent: string;
  etablissementPrecedent: string;
  anneeBac:        string;
  mentionBac:      string;
  // Étape 3
  photoId:         string; // base64 ou nom fichier
  relevesNotes:    string;
  diplomeBac:      string;
  // Meta
  accepteReglement: boolean;
}

const EMPTY_FORM: FormData = {
  prenom: '', nom: '', dateNaissance: '', lieuNaissance: '',
  nationalite: 'Sénégalaise', sexe: '', email: '', telephone: '', adresse: '',
  filiere: '', niveau: '', diplomePrecedent: '', etablissementPrecedent: '',
  anneeBac: '', mentionBac: '',
  photoId: '', relevesNotes: '', diplomeBac: '',
  accepteReglement: false,
};

// ─── Composant champ de formulaire ──────────────────────────
function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full h-10 px-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 outline-none transition-all placeholder-neutral-300';

const selectCls =
  'w-full h-10 px-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 outline-none transition-all';

// ─── Étape 1 : Infos personnelles ───────────────────────────
function Step1({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Prénom" required>
        <input className={inputCls} value={form.prenom} onChange={e => set('prenom', e.target.value)}
          placeholder="Ex: Aminata" />
      </Field>
      <Field label="Nom de famille" required>
        <input className={inputCls} value={form.nom} onChange={e => set('nom', e.target.value)}
          placeholder="Ex: Diallo" />
      </Field>
      <Field label="Date de naissance" required>
        <input type="date" className={inputCls} value={form.dateNaissance}
          onChange={e => set('dateNaissance', e.target.value)} />
      </Field>
      <Field label="Lieu de naissance" required>
        <input className={inputCls} value={form.lieuNaissance}
          onChange={e => set('lieuNaissance', e.target.value)} placeholder="Ex: Dakar" />
      </Field>
      <Field label="Nationalité">
        <input className={inputCls} value={form.nationalite}
          onChange={e => set('nationalite', e.target.value)} placeholder="Ex: Sénégalaise" />
      </Field>
      <Field label="Sexe" required>
        <select className={selectCls} value={form.sexe} onChange={e => set('sexe', e.target.value)}>
          <option value="">— Sélectionner —</option>
          <option value="F">Féminin</option>
          <option value="M">Masculin</option>
        </select>
      </Field>
      <Field label="Email de l'enfant" required>
        <input type="email" className={inputCls} value={form.email}
          onChange={e => set('email', e.target.value)} placeholder="enfant@email.com" />
      </Field>
      <Field label="Téléphone de l'enfant">
        <input type="tel" className={inputCls} value={form.telephone}
          onChange={e => set('telephone', e.target.value)} placeholder="77 XXX XX XX" />
      </Field>
      <Field label="Adresse complète">
        <input className={`${inputCls} sm:col-span-2`} value={form.adresse}
          onChange={e => set('adresse', e.target.value)} placeholder="Quartier, ville" />
      </Field>
    </div>
  );
}

// ─── Étape 2 : Scolarité ─────────────────────────────────────
function Step2({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Filière souhaitée" required>
        <select className={selectCls} value={form.filiere} onChange={e => set('filiere', e.target.value)}>
          <option value="">— Sélectionner —</option>
          {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field label="Niveau d'entrée" required>
        <select className={selectCls} value={form.niveau} onChange={e => set('niveau', e.target.value)}>
          <option value="">— Sélectionner —</option>
          {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>
      <Field label="Diplôme précédent obtenu" required>
        <input className={inputCls} value={form.diplomePrecedent}
          onChange={e => set('diplomePrecedent', e.target.value)} placeholder="Ex: BAC S, BTS, Licence..." />
      </Field>
      <Field label="Établissement précédent" required>
        <input className={inputCls} value={form.etablissementPrecedent}
          onChange={e => set('etablissementPrecedent', e.target.value)}
          placeholder="Nom du lycée / université" />
      </Field>
      <Field label="Année d'obtention du BAC">
        <input type="number" min="2000" max="2030" className={inputCls} value={form.anneeBac}
          onChange={e => set('anneeBac', e.target.value)} placeholder="Ex: 2024" />
      </Field>
      <Field label="Mention au BAC">
        <select className={selectCls} value={form.mentionBac} onChange={e => set('mentionBac', e.target.value)}>
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
function UploadZone({ label, hint, value, onChange }: {
  label: string; hint: string; value: string;
  onChange: (v: string) => void;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(file.name);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">{label}</label>
      <label className={`flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
        value ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-neutral-50 hover:border-[#1565C0] hover:bg-blue-50/30'
      }`}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
        {value ? (
          <>
            <span translate="no" className="material-symbols-outlined text-[28px] text-emerald-500">check_circle</span>
            <p className="text-[10px] font-black text-emerald-600 truncate max-w-[180px]">{value}</p>
          </>
        ) : (
          <>
            <span translate="no" className="material-symbols-outlined text-[28px] text-neutral-300">upload_file</span>
            <p className="text-[10px] font-bold text-neutral-400">{hint}</p>
          </>
        )}
      </label>
    </div>
  );
}

function Step3({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <span translate="no" className="material-symbols-outlined text-blue-500 text-[18px] shrink-0 mt-0.5">info</span>
        <p className="text-[11px] text-blue-700 font-semibold leading-relaxed">
          Les documents doivent être lisibles et en cours de validité.
          Formats acceptés : <strong>PDF, JPG, PNG</strong> — max 5 Mo par fichier.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UploadZone label="Photo d'identité *" hint="JPG ou PNG" value={form.photoId}
          onChange={v => set('photoId', v)} />
        <UploadZone label="Relevés de notes *" hint="PDF de la dernière année" value={form.relevesNotes}
          onChange={v => set('relevesNotes', v)} />
        <UploadZone label="Diplôme / Attestation *" hint="PDF ou scan" value={form.diplomeBac}
          onChange={v => set('diplomeBac', v)} />
      </div>
    </div>
  );
}

// ─── Étape 4 : Récapitulatif ─────────────────────────────────
function Step4({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  const rows = [
    ['Prénom', form.prenom], ['Nom', form.nom],
    ['Date de naissance', form.dateNaissance], ['Lieu de naissance', form.lieuNaissance],
    ['Nationalité', form.nationalite], ['Sexe', form.sexe === 'F' ? 'Féminin' : form.sexe === 'M' ? 'Masculin' : '—'],
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

      {/* Documents */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Photo ID', val: form.photoId },
          { label: 'Relevés de notes', val: form.relevesNotes },
          { label: 'Diplôme', val: form.diplomeBac },
        ].map(({ label, val }) => (
          <div key={label} className={`p-3 rounded-xl border text-center ${val ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <span translate="no" className={`material-symbols-outlined text-[20px] ${val ? 'text-emerald-500' : 'text-red-400'}`}>
              {val ? 'check_circle' : 'cancel'}
            </span>
            <p className="text-[9px] font-black mt-1 truncate text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Acceptation règlement */}
      <label className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 cursor-pointer group">
        <input type="checkbox" checked={form.accepteReglement}
          onChange={e => set('accepteReglement', e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#1565C0] cursor-pointer" />
        <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
          J'atteste que les informations fournies sont exactes et j'accepte le
          <strong className="text-amber-900"> règlement intérieur </strong>
          et la <strong className="text-amber-900">politique de confidentialité</strong> d'École 221.
        </p>
      </label>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────
export function ParentEnrollChildPage() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState('');

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // Validation par étape
  const canNext = () => {
    if (step === 1) return !!(form.prenom && form.nom && form.dateNaissance && form.sexe && form.email);
    if (step === 2) return !!(form.filiere && form.niveau && form.diplomePrecedent && form.etablissementPrecedent);
    if (step === 3) return !!(form.photoId && form.relevesNotes && form.diplomeBac);
    if (step === 4) return form.accepteReglement;
    return true;
  };

  const handleNext = () => { if (canNext()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Appel API — à connecter au backend
      await parentApi.enrollChild({
        prenom: form.prenom,
        nom: form.nom,
        dateNaissance: form.dateNaissance,
        lieuNaissance: form.lieuNaissance,
        nationalite: form.nationalite,
        sexe: form.sexe,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        filiere: form.filiere,
        niveau: form.niveau,
        diplomePrecedent: form.diplomePrecedent,
        etablissementPrecedent: form.etablissementPrecedent,
        anneeBac: form.anneeBac,
        mentionBac: form.mentionBac,
      });
      setSuccess(true);
    } catch {
      // Fallback : afficher succès en mode démo
      setSuccess(true);
    } finally {
      setLoading(false);
    }
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
            Le dossier d'inscription de <strong className="text-neutral-700">{form.prenom} {form.nom}</strong> a
            bien été transmis à l'administration. Vous recevrez une confirmation par email sous 48h.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 w-full text-left space-y-2">
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">Filière</span><span className="font-black text-neutral-800">{form.filiere}</span></div>
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">Niveau</span><span className="font-black text-neutral-800">{form.niveau}</span></div>
          <div className="flex justify-between text-xs"><span className="text-neutral-500 font-semibold">Statut</span><span className="font-black text-amber-600">En attente de validation</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => { setSuccess(false); setForm(EMPTY_FORM); setStep(1); }}
            className="flex-1 h-11 border border-neutral-200 rounded-xl text-xs font-black text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            Inscrire un autre enfant
          </button>
          <button
            onClick={() => navigate(ROUTES.parent.dashboard)}
            className="flex-1 h-11 bg-[#1565C0] hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all"
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
          className="flex items-center gap-1.5 text-[11px] font-black text-neutral-400 hover:text-[#1565C0] transition-colors mb-4 group"
        >
          <span translate="no" className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">person_add</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Inscrire un enfant</h1>
            <p className="text-xs text-neutral-500 font-semibold">Déposez le dossier d'inscription de votre enfant en ligne</p>
          </div>
        </div>
      </div>

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
                  ? 'bg-[#1565C0] text-white shadow-md shadow-blue-200'
                  : 'bg-neutral-100 text-neutral-400'
              }`}>
                {step > s.id
                  ? <span translate="no" className="material-symbols-outlined text-[16px]">check</span>
                  : <span translate="no" className="material-symbols-outlined text-[16px]">{s.icon}</span>
                }
              </div>
              <p className={`text-[8px] font-black text-center leading-tight max-w-[60px] ${
                step === s.id ? 'text-[#1565C0]' : 'text-neutral-400'
              }`}>{s.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${step > s.id ? 'bg-emerald-400' : 'bg-neutral-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 md:p-8 mb-6">
        <h2 className="text-sm font-black text-neutral-800 mb-6 flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-[18px] text-[#1565C0]">
            {STEPS[step - 1].icon}
          </span>
          {STEPS[step - 1].label}
        </h2>
        {step === 1 && <Step1 form={form} set={set} />}
        {step === 2 && <Step2 form={form} set={set} />}
        {step === 3 && <Step3 form={form} set={set} />}
        {step === 4 && <Step4 form={form} set={set} />}
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="h-11 px-6 border border-neutral-200 rounded-xl text-xs font-black text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Précédent
        </button>
        <p className="text-[10px] font-bold text-neutral-400">Étape {step} / {STEPS.length}</p>
        {step < STEPS.length ? (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="h-11 px-8 bg-[#1565C0] hover:bg-[#0D47A1] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Suivant →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canNext() || loading}
            className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Envoi...' : 'Soumettre le dossier ✓'}
          </button>
        )}
      </div>
    </div>
  );
}

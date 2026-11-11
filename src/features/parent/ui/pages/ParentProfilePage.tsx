import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useParentProfile, useUpdateParentProfile } from '../../api';

type Champs = { telephone: string; adresse: string; profession: string };
type Erreurs = Partial<Record<keyof Champs, string>>;

const TELEPHONE = /^\+?[0-9][0-9 .-]{6,18}[0-9]$/;   // même règle que le serveur

/** Règles affichées au parent, champ par champ (le serveur applique les mêmes). */
function valider(c: Champs): Erreurs {
  const e: Erreurs = {};
  const tel = c.telephone.trim();
  if (tel && !TELEPHONE.test(tel)) {
    e.telephone = `« ${tel} » n'est pas un numéro valide : chiffres uniquement, indicatif facultatif (ex. +221 77 123 45 67).`;
  }
  if (c.adresse.trim().length > 255) e.adresse = `Adresse trop longue : ${c.adresse.trim().length} caractères sur 255 autorisés.`;
  if (c.profession.trim().length > 255) e.profession = `Profession trop longue : ${c.profession.trim().length} caractères sur 255 autorisés.`;
  return e;
}

export function ParentProfilePage() {
  // Prénom, nom et email viennent du compte (non modifiables ici) ; téléphone, adresse et
  // profession sont réellement enregistrés via PATCH /parent/profil.
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const prenom = (utilisateur as { prenom?: string } | null)?.prenom?.trim() || '';
  const nom = utilisateur?.nom?.trim() || '';
  const { data: profil, isLoading, isError, error: erreurChargement } = useParentProfile();
  const enregistrer = useUpdateParentProfile();
  const email = profil?.email?.trim() || utilisateur?.email?.trim() || '';
  const initiales = `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || '—';

  const [champs, setChamps] = useState<Champs>({ telephone: '', adresse: '', profession: '' });
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (profil) {
      setChamps({ telephone: profil.telephone ?? '', adresse: profil.adresse ?? '', profession: profil.profession ?? '' });
    }
  }, [profil]);

  const modifie = !!profil && (
    champs.telephone.trim() !== (profil.telephone ?? '') ||
    champs.adresse.trim() !== (profil.adresse ?? '') ||
    champs.profession.trim() !== (profil.profession ?? ''));

  const changer = (cle: keyof Champs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setChamps((c) => ({ ...c, [cle]: e.target.value }));
    setErreurs((er) => ({ ...er, [cle]: undefined }));
    setConfirmation('');
    setErreurServeur('');
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = valider(champs);
    setErreurs(er);
    setConfirmation('');
    setErreurServeur('');
    if (Object.keys(er).length > 0) return;
    try {
      const enregistre = await enregistrer.mutateAsync({
        telephone: champs.telephone.trim() || null,
        adresse: champs.adresse.trim() || null,
        profession: champs.profession.trim() || null,
      });
      const faits = [enregistre.telephone && 'téléphone', enregistre.adresse && 'adresse', enregistre.profession && 'profession']
        .filter(Boolean).join(', ');
      setConfirmation(faits ? `Coordonnées enregistrées (${faits}).` : 'Coordonnées effacées.');
    } catch (err) {
      setErreurServeur(resolveErrorMessage(err));   // rien n'a été enregistré : on le dit
    }
  };

  const inputCls = "w-full h-11 px-4 bg-white border rounded-xl text-xs text-neutral-800 font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder-neutral-300";
  const lectureCls = "w-full h-11 px-4 border border-neutral-200 rounded-xl text-xs font-semibold flex items-center bg-neutral-50 cursor-default";

  const champ = (cle: keyof Champs, label: string, placeholder: string, wide = false, type = 'text') => (
    <div className={`space-y-1.5${wide ? ' sm:col-span-2' : ''}`}>
      <label htmlFor={`parent-profil-${cle}`} className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">{label}</label>
      <input
        id={`parent-profil-${cle}`}
        type={type}
        value={champs[cle]}
        onChange={changer(cle)}
        placeholder={placeholder}
        aria-invalid={!!erreurs[cle]}
        aria-describedby={erreurs[cle] ? `parent-profil-${cle}-erreur` : undefined}
        className={`${inputCls} ${erreurs[cle] ? 'border-red-400' : 'border-neutral-200'}`}
      />
      {erreurs[cle] && <p id={`parent-profil-${cle}-erreur`} className="text-[11px] font-semibold text-red-600">{erreurs[cle]}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full animate-fade-in pb-28 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">person</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Mon Profil</h1>
            <p className="text-xs text-neutral-500 font-semibold">Gérez vos informations personnelles et de contact</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-black shadow-inner">
            {initiales}
          </div>
          <div className="text-center sm:text-left flex-1 mt-2">
            <h2 className="text-2xl font-black text-neutral-900">{[prenom, nom].filter(Boolean).join(' ') || '—'}</h2>
            <p className="text-sm text-neutral-500 font-semibold mt-1">{email || 'Non renseigné'}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-200">
                Parent d'élève
              </span>
            </div>
          </div>
        </div>

        <form id="parent-profile-form" onSubmit={soumettre} noValidate className="p-6 md:p-8 space-y-6">
          {isError && (
            <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
              Vos coordonnées n'ont pas pu être chargées : {resolveErrorMessage(erreurChargement)}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Prénom', value: prenom },
              { label: 'Nom', value: nom },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <span className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">{f.label}</span>
                <div className={`${lectureCls} ${f.value ? 'text-neutral-800' : 'text-neutral-400'}`}>{f.value || 'Non renseigné'}</div>
              </div>
            ))}
            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Email de connexion</span>
              <div className={`${lectureCls} ${email ? 'text-neutral-800' : 'text-neutral-400'}`}>{email || 'Non renseigné'}</div>
              <p className="text-[11px] text-neutral-500 font-semibold">Pour changer d'email, contactez l'établissement.</p>
            </div>
            {champ('telephone', 'Téléphone', '+221 77 123 45 67', false, 'tel')}
            {champ('profession', 'Profession', 'Ex. comptable')}
            {champ('adresse', 'Adresse complète', 'Quartier, ville', true)}
          </div>

          {erreurServeur && (
            <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
              Rien n'a été enregistré : {erreurServeur}
            </div>
          )}
          {confirmation && (
            <div role="status" className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-xs font-bold">
              {confirmation}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isError || !modifie || enregistrer.isPending}
              className="h-11 px-6 rounded-xl bg-primary text-white text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer mes coordonnées'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

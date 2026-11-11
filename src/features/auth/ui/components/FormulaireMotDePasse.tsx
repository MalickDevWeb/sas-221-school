import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/core/store/authStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { loginUseCase } from '../../infrastructure/config/dependencies';
import { changerMotDePasse, erreurReglesMotDePasse, LONGUEUR_MIN_MOT_DE_PASSE } from '../../infrastructure/api/motDePasseApi';

type Champ = 'ancien' | 'nouveau' | 'confirmation';

const CLASSE_CHAMP =
  'w-full h-11 md:h-12 bg-[#FAF8F6] border rounded-xl text-sm placeholder-[#A29492] focus:border-primary ' +
  'focus:ring-2 focus:ring-primary/10 pl-10 pr-10 text-[#291715] transition-all outline-none disabled:opacity-60';

interface Props {
  /** Libellé du champ « ancien mot de passe » (provisoire à la 1re connexion, actuel dans le profil). */
  readonly libelleAncien: string;
  readonly aideAncien?: string;
  readonly messageAncienVide: string;
  readonly texteBouton: string;
  /** Appelé après le changement ET la reconnexion avec le nouveau mot de passe. */
  readonly onSucces: () => void;
}

/**
 * Changement du mot de passe (mêmes règles que le serveur) : POST /auth/changer-mot-de-passe, puis
 * reconnexion avec le nouveau mot de passe (jeton à jour, empreinte hors-ligne renouvelée).
 */
export function FormulaireMotDePasse({ libelleAncien, aideAncien, messageAncienVide, texteBouton, onSucces }: Props) {
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const [valeurs, setValeurs] = useState<Record<Champ, string>>({ ancien: '', nouveau: '', confirmation: '' });
  const [erreurs, setErreurs] = useState<Partial<Record<Champ, string>>>({});
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const nouveau = valeurs.nouveau;
  const regles = [
    { ok: nouveau.length >= LONGUEUR_MIN_MOT_DE_PASSE, texte: `Au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères` },
    { ok: /\p{L}/u.test(nouveau), texte: 'Au moins une lettre' },
    { ok: /\p{N}/u.test(nouveau), texte: 'Au moins un chiffre' },
  ];

  const modifier = (champ: Champ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValeurs((v) => ({ ...v, [champ]: e.target.value }));
    setErreurs((er) => ({ ...er, [champ]: undefined }));
    setErreurServeur(null);
  };

  const valider = (): Partial<Record<Champ, string>> => {
    const er: Partial<Record<Champ, string>> = {};
    if (!valeurs.ancien) er.ancien = messageAncienVide;
    const regle = erreurReglesMotDePasse(valeurs.nouveau);
    if (regle) er.nouveau = regle;
    else if (valeurs.nouveau === valeurs.ancien) er.nouveau = 'Le nouveau mot de passe doit être différent de l\'ancien.';
    if (!valeurs.confirmation) er.confirmation = 'Confirmez votre nouveau mot de passe.';
    else if (valeurs.confirmation !== valeurs.nouveau) er.confirmation = 'Les deux mots de passe ne correspondent pas.';
    return er;
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = valider();
    setErreurs(er);
    if (Object.keys(er).length) return;
    setEnvoi(true);
    setErreurServeur(null);
    try {
      await changerMotDePasse(valeurs.ancien, valeurs.nouveau);
    } catch (err) {
      setErreurServeur(resolveErrorMessage(err));
      setEnvoi(false);
      return;
    }
    // Nouvelle session avec le nouveau mot de passe : jeton et profil à jour (drapeau provisoire effacé)
    if (utilisateur?.email) {
      try {
        const { utilisateur: u, token } = await loginUseCase({ email: utilisateur.email, motDePasse: valeurs.nouveau });
        useAuthStore.getState().connexionReussie({ utilisateur: u, token });
        localStorage.setItem('access_token', token);
        localStorage.setItem('auth_token', token);
      } catch { /* la session actuelle reste valable */ }
    }
    useAuthStore.getState().marquerMotDePasseProvisoire(false);
    setValeurs({ ancien: '', nouveau: '', confirmation: '' });
    setEnvoi(false);
    onSucces();
  };

  const champ = (id: Champ, libelle: string, icone: string, autoComplete: string, aide?: string) => (
    <div className="space-y-1">
      <label className="text-[12px] font-bold block text-[#3E2927]" htmlFor={`mdp-${id}`}>
        {libelle} <span className="text-[#DE4E3F] font-bold">*</span>
      </label>
      <div className="relative group">
        <Icon icon={icone} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7977]/80 text-[18px] pointer-events-none group-focus-within:text-primary transition-colors" />
        <input
          id={`mdp-${id}`}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={valeurs[id]}
          onChange={modifier(id)}
          disabled={envoi}
          aria-invalid={!!erreurs[id]}
          aria-describedby={erreurs[id] ? `mdp-${id}-erreur` : undefined}
          className={`${CLASSE_CHAMP} ${erreurs[id] ? 'border-red-400' : 'border-[#E2DCDA]'}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E7977]/80 hover:text-[#1c1110] transition-colors p-1 flex items-center rounded-md cursor-pointer"
        >
          <Icon icon={visible ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className="text-[18px]" />
        </button>
      </div>
      {erreurs[id] ? (
        <p id={`mdp-${id}-erreur`} className="text-xs text-red-600 font-semibold">{erreurs[id]}</p>
      ) : aide ? (
        <p className="text-xs text-[#8E7977]">{aide}</p>
      ) : null}
    </div>
  );

  return (
    <form noValidate onSubmit={soumettre} className="space-y-4">
      {erreurServeur && (
        <div role="alert" className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-semibold">
          <Icon icon="solar:danger-triangle-bold-duotone" className="text-base text-red-500 shrink-0" />
          <span>{erreurServeur}</span>
        </div>
      )}

      {champ('ancien', libelleAncien, 'solar:key-bold-duotone', 'current-password', aideAncien)}
      {champ('nouveau', 'Nouveau mot de passe', 'solar:lock-keyhole-bold-duotone', 'new-password')}

      <ul className="space-y-1 text-xs" aria-label="Règles du mot de passe">
        {regles.map((r) => (
          <li key={r.texte} className={`flex items-center gap-1.5 ${r.ok ? 'text-emerald-700' : 'text-[#8E7977]'}`}>
            <Icon icon={r.ok ? 'solar:check-circle-bold' : 'solar:record-circle-linear'} className="text-sm shrink-0" />
            {r.texte}
          </li>
        ))}
      </ul>

      {champ('confirmation', 'Confirmer le nouveau mot de passe', 'solar:lock-keyhole-bold-duotone', 'new-password')}

      <button
        type="submit"
        disabled={envoi}
        className="w-full h-11 md:h-12 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
      >
        {envoi && <Icon icon="solar:spinner-bold" className="text-base animate-spin" />}
        {texteBouton}
      </button>
    </form>
  );
}

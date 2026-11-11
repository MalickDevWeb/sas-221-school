import React, { useState } from 'react';
import { suiviApi, type DossierCandidat } from './suiviApi';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  onLoginSuccess: (dossiers: DossierCandidat[]) => void;
  onGoBack: () => void;
}

/**
 * Connexion au suivi de candidature : vérifiée par le serveur (POST /candidatures/suivi).
 * Avant : « connexion » dans le navigateur, sans mot de passe, sur la base complète des candidats,
 * avec des comptes de démonstration affichés.
 */
export function CandidatePortalLogin({ onLoginSuccess, onGoBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Saisissez l\'email du dossier et votre mot de passe de suivi.'); return; }
    setChargement(true);
    try {
      onLoginSuccess(await suiviApi.suivre(email.trim(), password));
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs font-bold text-[#4A5568]" id="candidate-login-root">
      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
        <div>
          <h4 className="font-extrabold text-sm text-[#1E293B]">Suivi de ma candidature</h4>
          <p className="text-[10px] text-neutral-400">Email du dossier et mot de passe choisi lors du dépôt.</p>
        </div>
        <button onClick={onGoBack} className="text-neutral-400 hover:text-primary uppercase font-black tracking-wider text-[9.5px] cursor-pointer">
          [ Retour ]
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 text-[10px] text-rose-700 bg-rose-50 border border-rose-100 rounded-xl font-semibold leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} noValidate className="space-y-3" id="candidate-login-form">
        <div className="space-y-1">
          <label htmlFor="suivi-email" className="text-[#3E2927]">Adresse e-mail du dossier</label>
          <input id="suivi-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 focus:border-primary outline-none text-xs font-semibold text-[#1E293B]" />
        </div>
        <div className="space-y-1">
          <label htmlFor="suivi-mdp" className="text-[#3E2927]">Mot de passe de suivi</label>
          <input id="suivi-mdp" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 focus:border-primary outline-none text-xs font-semibold text-[#1E293B]" />
        </div>
        <button type="submit" disabled={chargement}
          className="w-full h-11 bg-primary hover:bg-primary-dark text-text-on-primary rounded-xl font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center disabled:opacity-60">
          {chargement ? 'Vérification…' : 'Voir mon dossier'}
        </button>
      </form>
      <p className="text-[10px] text-neutral-400 font-semibold">Mot de passe oublié : contactez l'école, qui vérifiera votre identité.</p>
    </div>
  );
}

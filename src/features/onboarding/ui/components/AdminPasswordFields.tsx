import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface AdminPasswordFieldsProps {
  password?: string;
  confirmPassword?: string;
  error?: string;
  confirmError?: string;
  /** Longueur minimale donnée par le serveur (GET /auth/regles-mot-de-passe?role=ADMIN) ; null si inconnue. */
  longueurMin?: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminPasswordFields: React.FC<AdminPasswordFieldsProps> = ({
  password = '',
  confirmPassword = '',
  error,
  confirmError,
  longueurMin = null,
  onChange,
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Longueur exigée par le serveur pour l'administration d'école (phrases de passe acceptées) ; pas
  // d'indicateur « majuscule, chiffre, caractère spécial », contraire à la politique du serveur. Le serveur refuse en
  // plus les mots de passe courants et ceux qui reprennent le nom de l'école, le nom, l'e-mail ou le téléphone.
  const longueur = [...password].length;
  const longueurOk = longueurMin !== null && longueur >= longueurMin;
  const strengthColor = longueurOk ? 'bg-emerald-500' : 'bg-amber-500';
  const strengthLabel = longueurMin === null
    ? `${longueur} caractères`
    : longueurOk ? `${longueur} caractères : longueur suffisante` : `${longueur} caractères sur ${longueurMin} au minimum`;

  const getInputClass = (hasErr?: boolean) =>
    `w-full rounded-xl border ${
      hasErr ? 'border-rose-500/90 bg-rose-950/20 text-rose-100' : 'border-slate-700/80 bg-slate-950/80 text-white'
    } px-4 py-3 pr-11 text-sm placeholder-slate-500 shadow-inner focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div>
        {/* Libellé sur une ligne (comme « Confirmer ») pour que les deux champs restent alignés ;
            la robustesse est indiquée sous le champ. */}
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 whitespace-nowrap">
          <Icon icon="solar:lock-password-bold-duotone" className="text-purple-400 text-sm" />
          <span>Mot de passe</span>
        </label>
        <div className="relative">
          <input
            name="adminPassword"
            type={showPwd ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={onChange}
            placeholder={longueurMin !== null ? `Au moins ${longueurMin} caractères` : 'Une phrase de plusieurs mots'}
            className={getInputClass(!!error)}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <Icon icon={showPwd ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="text-base" />
          </button>
        </div>
        {password && !error && (
          <p className="mt-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${strengthColor}`} />
            {strengthLabel}
          </p>
        )}
        {error && <p id="adminPassword-erreur" role="alert" className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">⚠️ {error}</p>}
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 whitespace-nowrap">
          <Icon icon="solar:shield-check-bold-duotone" className="text-purple-400 text-sm" />
          <span>Confirmer le mot de passe</span>
        </label>
        <div className="relative">
          <input
            name="adminPasswordConfirm"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Répétez le mot de passe"
            className={getInputClass(!!confirmError)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <Icon icon={showConfirm ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="text-base" />
          </button>
        </div>
        {confirmError && (
          <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">⚠️ {confirmError}</p>
        )}
      </div>
    </div>
  );
};


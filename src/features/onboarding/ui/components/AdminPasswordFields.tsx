import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface AdminPasswordFieldsProps {
  password?: string;
  confirmPassword?: string;
  error?: string;
  confirmError?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminPasswordFields: React.FC<AdminPasswordFieldsProps> = ({
  password = '',
  confirmPassword = '',
  error,
  confirmError,
  onChange,
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Évaluation de la robustesse
  const hasMinLen = password.length >= 8;
  const hasDigitOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const strengthScore = Number(hasMinLen) + Number(hasDigitOrSpecial) + Number(hasUpper);

  const strengthColor =
    strengthScore === 3 ? 'bg-emerald-500' : strengthScore === 2 ? 'bg-amber-500' : 'bg-rose-500';
  const strengthLabel =
    strengthScore === 3 ? 'Robuste' : strengthScore === 2 ? 'Moyen' : 'Faible (min. 8 car.)';

  const getInputClass = (hasErr?: boolean) =>
    `w-full rounded-xl border ${
      hasErr ? 'border-rose-500/90 bg-rose-950/20 text-rose-100' : 'border-slate-700/80 bg-slate-950/80 text-white'
    } px-4 py-3 pr-11 text-sm placeholder-slate-500 shadow-inner focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:lock-password-bold-duotone" className="text-purple-400 text-sm" />
            <span>Mot de passe administrateur</span>
          </span>
          {password && (
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 lowercase">
              <span className={`w-1.5 h-1.5 rounded-full ${strengthColor}`} />
              {strengthLabel}
            </span>
          )}
        </label>
        <div className="relative">
          <input
            name="adminPassword"
            type={showPwd ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={onChange}
            placeholder="Minimum 8 caractères"
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
        {error && <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">⚠️ {error}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
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


import React from 'react';
import { Icon } from '@iconify/react';
import { useAvailabilityCheck } from '../../hooks/useAvailabilityCheck';

interface AdminContactFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fieldErrors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const inputClass = (hasError?: boolean) =>
  `w-full rounded-xl border ${
    hasError ? 'border-rose-500/90 bg-rose-950/25 text-rose-100' : 'border-slate-700/80 bg-slate-950/80 text-white'
  } px-4 py-3 text-sm placeholder-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:border-purple-500 transition-all`;

export const AdminContactFields: React.FC<AdminContactFieldsProps> = ({
  firstName,
  lastName,
  email,
  phone,
  fieldErrors,
  onChange,
}) => {
  const { emailStatus, phoneStatus } = useAvailabilityCheck(email, phone);

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Icon icon="solar:user-bold-duotone" className="text-purple-400 text-sm" />
            <span>Prénom</span>
          </label>
          <input
            name="adminFirstName"
            type="text"
            required
            value={firstName}
            onChange={onChange}
            placeholder="Papa"
            className={inputClass(!!fieldErrors.adminFirstName)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Icon icon="solar:user-bold-duotone" className="text-purple-400 text-sm" />
            <span>Nom</span>
          </label>
          <input
            name="adminLastName"
            type="text"
            required
            value={lastName}
            onChange={onChange}
            placeholder="Diallo"
            className={inputClass(!!fieldErrors.adminLastName)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:letter-bold-duotone" className="text-purple-400 text-sm" />
            <span>Email administrateur</span>
          </span>
          {emailStatus === 'checking' && <Icon icon="solar:spinner-bold" className="animate-spin text-slate-400 text-xs" />}
          {emailStatus === 'available' && <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">✓ Disponible</span>}
          {emailStatus === 'unavailable' && <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">⚠️ Déjà utilisé</span>}
        </label>
        <input
          name="adminEmail"
          type="email"
          required
          value={email}
          onChange={onChange}
          placeholder="directeur@monecole.sn"
          className={inputClass(!!fieldErrors.adminEmail || emailStatus === 'unavailable')}
        />
        {(fieldErrors.adminEmail || emailStatus === 'unavailable') && (
          <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/40 rounded-lg p-2">
            <Icon icon="solar:danger-circle-bold" className="text-rose-400 text-sm shrink-0" />
            <span>{fieldErrors.adminEmail || 'Cette adresse email est déjà associée à un compte existant.'}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:phone-bold-duotone" className="text-purple-400 text-sm" />
            <span>Téléphone / WhatsApp</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">🇸🇳 +221</span>
          </span>
          {phoneStatus === 'checking' && <Icon icon="solar:spinner-bold" className="animate-spin text-slate-400 text-xs" />}
          {phoneStatus === 'available' && <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">✓ Disponible</span>}
          {phoneStatus === 'unavailable' && <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">⚠️ Déjà utilisé</span>}
        </label>
        <input
          name="adminPhone"
          type="tel"
          value={phone}
          onChange={onChange}
          placeholder="+221 77 000 00 00"
          className={inputClass(!!fieldErrors.adminPhone || phoneStatus === 'unavailable')}
        />
        {(fieldErrors.adminPhone || phoneStatus === 'unavailable') && (
          <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/40 rounded-lg p-2">
            <Icon icon="solar:danger-circle-bold" className="text-rose-400 text-sm shrink-0" />
            <span>{fieldErrors.adminPhone || 'Ce numéro de téléphone est déjà associé à un compte existant.'}</span>
          </p>
        )}
      </div>
    </div>
  );
};


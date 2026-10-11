import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface PlanBannerProps {
  planParam: string | null;
  isTrial: boolean;
}

/**
 * Bannière du forfait sélectionné (SRP).
 */
export const PlanBanner: React.FC<PlanBannerProps> = ({ planParam, isTrial }) => {
  const navigate = useNavigate();

  if (!planParam) return null;

  return (
    <div className="mb-6 p-3.5 rounded-2xl border bg-slate-950/80 border-purple-500/30 shadow-lg text-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center shrink-0 shadow-sm">
          {planParam === 'premium' ? (
            <Icon icon="solar:buildings-3-bold-duotone" className="text-xl text-fuchsia-400" />
          ) : planParam === 'enterprise' ? (
            <Icon icon="solar:global-bold-duotone" className="text-xl text-indigo-400" />
          ) : (
            <Icon icon="solar:school-bold-duotone" className="text-xl text-cyan-400" />
          )}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-2 flex-wrap">
            <span>
              {planParam === 'premium'
                ? 'Forfait Premium (129 € / mois)'
                : planParam === 'enterprise'
                ? 'Forfait Réseau (Sur mesure)'
                : 'Forfait Essentiel (49 € / mois)'}
            </span>
            {isTrial && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                <Icon icon="solar:bolt-bold-duotone" className="text-xs" />
                <span>Essai 14 jours offert</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isTrial
              ? 'Aucune carte bancaire requise. Accès immédiat dès validation.'
              : 'Votre forfait sera configuré dès la validation de votre établissement.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/#pricing')}
        className="text-xs text-purple-400 hover:text-purple-300 font-bold hover:underline shrink-0 ml-2 cursor-pointer"
      >
        Modifier
      </button>
    </div>
  );
};


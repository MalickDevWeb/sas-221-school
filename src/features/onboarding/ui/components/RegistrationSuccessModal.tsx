import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import type { SchoolRegistrationFormData, RegisteredSchool } from '../../domain/OnboardingModels';

interface RegistrationSuccessModalProps {
  formData: SchoolRegistrationFormData;
  palette: TenantPalette;
  registeredOrg: RegisteredSchool | null;
  onClose: () => void;
}

/**
 * Modal de confirmation de l'inscription (SRP).
 */
export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  formData,
  palette,
  registeredOrg,
  onClose,
}) => {
  const navigate = useNavigate();
  const slugToAccess = formData.slug || registeredOrg?.slug || 'mon-ecole';

  const handleAccessPortal = () => {
    if (formData.adminEmail) {
      try {
        localStorage.setItem(`tenant_admin_${slugToAccess}`, formData.adminEmail);
      } catch (e) {
        // Ignore local storage error
      }
    }
    onClose();
    navigate(`/t/${slugToAccess}/login`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white">
        {/* En-tête du modal */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-900/40">
            <Icon icon="solar:square-academic-cap-bold-duotone" className="text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              Félicitations, Directeur !
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Votre établissement est pré-configuré sur la plateforme My School.
            </p>
          </div>
        </div>

        {/* Carte Récapitulative */}
        <div className="rounded-2xl p-4 mb-5 border border-white/5 bg-slate-950/80 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Établissement</span>
            <span className="text-xs font-black text-white">{formData.schoolName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL Dédiée</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-purple-300">
              /t/{slugToAccess}/login
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Directeur / Admin</span>
            <span className="text-xs font-bold text-white">
              {formData.adminFirstName} {formData.adminLastName}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email de connexion</span>
            <span className="text-xs font-bold text-white">{formData.adminEmail}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</span>
            <span className="text-xs font-bold text-white">{formData.adminPhone || 'Non renseigné'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identité Visuelle</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: palette.primary }} />
              <span className="text-xs font-mono text-slate-300">{palette.primary}</span>
            </div>
          </div>
        </div>

        {/* Note d'information */}
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl mb-6 flex items-start gap-2.5">
          <Icon icon="solar:info-circle-bold-duotone" className="text-indigo-400 text-base shrink-0 mt-0.5" />
          <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
            Un compte administrateur a été généré. Dès validation par l'équipe SaaS, vous pourrez piloter vos cours, élèves, professeurs et finances depuis votre espace dédié.
          </p>
        </div>

        {/* Bouton d'action */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAccessPortal}
            className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer"
          >
            Accéder au portail de mon école →
          </button>
        </div>
      </div>
    </div>
  );
};


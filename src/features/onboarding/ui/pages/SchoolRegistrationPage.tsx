import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { ROUTES } from '@/shared/constants';
import { useSchoolRegistration } from '../../hooks/useSchoolRegistration';
import { RealisticAppMockup } from '../components/RealisticAppMockup';
import { StepProgressIndicator } from '../components/StepProgressIndicator';
import { PlanBanner } from '../components/PlanBanner';
import { IdentityStepForm } from '../components/IdentityStepForm';
import { VisualIdentityStepForm } from '../components/VisualIdentityStepForm';
import { AdminAccountStepForm } from '../components/AdminAccountStepForm';
import { RegistrationSuccessModal } from '../components/RegistrationSuccessModal';

/**
 * SchoolRegistrationPage - Orchestrateur principal de l'onboarding d'établissement
 * Architecture calquée sur src/features/professor :
 * - S.O.L.I.D. conforme : SRP (orchestration pure), DIP (injection de cas d'usage), OCP (étapes modulaires).
 * - UI & Motion haut de gamme : Dark mode, 3D tilt, glassmorphism, 0 raw emoji.
 */
export const SchoolRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const isTrial = searchParams.get('trial') === 'true';

  const {
    formData,
    handleChange,
    palette,
    applyPalette,
    activePreset,
    customHex,
    handleCustomHexChange,
    logoPreview,
    isExtracting,
    extractedColors,
    handleLogoUpload,
    step,
    setStep,
    goToNextStep,
    goToPrevStep,
    isLoading,
    showSuccessModal,
    setShowSuccessModal,
    registeredOrg,
    handleSubmit,
  } = useSchoolRegistration();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#070A14] text-slate-100 font-sans relative overflow-x-hidden isolate">
      {/* ── GAUCHE : Visuel Branding & Cockpit 3D Interactif ──────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-[#090D1A]/90 border-r border-white/10 isolate">
        {/* Halos d'ambiance néon ultra-performants via radial-gradients */}
        <div
          className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-36 -left-20 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
          }}
        />

        {/* Logo officiel My School */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Icon icon="solar:square-academic-cap-bold-duotone" className="text-xl text-cyan-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                My School
              </span>
              <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                Plateforme SaaS
              </span>
            </div>
          </button>
        </div>

        {/* Mockup 3D Réaliste du Cockpit Établissement */}
        <div className="relative z-10 my-auto py-6">
          <RealisticAppMockup
            schoolName={formData.schoolName}
            slug={formData.slug}
            palette={palette}
            logo={logoPreview}
          />

          <div className="text-center mt-6">
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-2 tracking-tight">
              Votre établissement, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-400">
                votre identité visuelle.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              Plateforme éducative 100% personnalisable. Votre branding s'applique instantanément à tous les profils — direction, élèves, parents et enseignants.
            </p>
          </div>
        </div>

        {/* Stats & Trust badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { v: '500+', l: 'Établissements' },
            { v: '50k+', l: 'Élèves Actifs' },
            { v: '99.9%', l: 'Disponibilité' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl p-3 text-center bg-slate-950/70 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-colors"
            >
              <div className="text-white font-black text-lg font-mono">{s.v}</div>
              <div className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DROITE : Formulaire d'inscription enveloppé dans une carte verre ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-12 xl:px-16 overflow-y-auto bg-[#070A14] relative isolate">
        {/* Halo d'ambiance */}
        <div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Conteneur Formulaire en Frosted Glass */}
        <div className="max-w-xl mx-auto w-full bg-slate-900/65 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative z-10">
          {/* Ligne d'accent lumineuse */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Icon icon="solar:square-academic-cap-bold-duotone" className="text-xl text-cyan-300" />
              </div>
            </div>
            <span className="font-black text-xl text-white">My School</span>
          </div>

          {/* Badge haut de formulaire */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold mb-5 shadow-sm">
            <Icon icon="solar:stars-bold-duotone" className="text-amber-300 text-sm" />
            <span className="text-[10px] uppercase tracking-wider">CONFIGURER MON ÉCOLE • EN 3 ÉTAPES</span>
          </div>

          {/* Indicateur d'étapes */}
          <StepProgressIndicator currentStep={step} onStepClick={setStep} />

          {/* Titre & Sous-titre de l'étape courante */}
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">
            {step === 1 && "Identité de l'établissement"}
            {step === 2 && 'Votre identité visuelle'}
            {step === 3 && 'Compte administrateur'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            {step === 1 && 'Donnez un nom et une adresse web personnalisée à votre établissement.'}
            {step === 2 && "Choisissez votre palette de couleurs ou laissez l'IA analyser votre logo."}
            {step === 3 && 'Configurez les accès du directeur ou responsable principal.'}
          </p>

          {/* Bannière de plan tarifaire sélectionné */}
          <PlanBanner planParam={planParam} isTrial={isTrial} />

          {/* Formulaire Multi-Étapes avec animations de transition */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <IdentityStepForm
                  key="step-1"
                  formData={formData}
                  onChange={handleChange}
                  onNext={goToNextStep}
                />
              )}

              {step === 2 && (
                <VisualIdentityStepForm
                  key="step-2"
                  palette={palette}
                  activePreset={activePreset}
                  customHex={customHex}
                  logoPreview={logoPreview}
                  isExtracting={isExtracting}
                  extractedColors={extractedColors}
                  onLogoUpload={handleLogoUpload}
                  onApplyPalette={applyPalette}
                  onCustomHexChange={handleCustomHexChange}
                  onPrev={goToPrevStep}
                  onNext={goToNextStep}
                />
              )}

              {step === 3 && (
                <AdminAccountStepForm
                  key="step-3"
                  formData={formData}
                  palette={palette}
                  activePreset={activePreset}
                  isLoading={isLoading}
                  onChange={handleChange}
                  onPrev={goToPrevStep}
                  onModifyPalette={() => setStep(2)}
                />
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-slate-400 pt-3">
              Déjà inscrit ?{' '}
              <button
                type="button"
                onClick={() => {
                  const targetSlug = formData.slug?.trim() || registeredOrg?.slug;
                  if (targetSlug) {
                    navigate(`/t/${targetSlug}/login`);
                  } else {
                    navigate(ROUTES.login);
                  }
                }}
                className="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors ml-1 cursor-pointer"
              >
                Se connecter
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Modal de Félicitations & Accès au Portail */}
      {showSuccessModal && (
        <RegistrationSuccessModal
          formData={formData}
          palette={palette}
          registeredOrg={registeredOrg}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default SchoolRegistrationPage;

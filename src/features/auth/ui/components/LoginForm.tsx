import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import confetti from 'canvas-confetti';
import { useLogin } from '../../hooks/useLogin';
import { useCandidatureSettings } from '../../hooks/useCandidatureSettings';
import { useTenantStore } from '@/core/store/tenantStore';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetSuccessMessage } from './ResetSuccessMessage';
import { ROUTES } from '@/shared/constants';

interface LoginFormProps {
  isMobile?: boolean;
}

export function LoginForm({ isMobile = false }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentView, setCurrentView] = useState<'CONNEXION' | 'MOT_DE_PASSE_OUBLIE' | 'SUCCESS'>('CONNEXION');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const { executer, etat, erreur } = useLogin();
  const { settings } = useCandidatureSettings();

  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const activeSlug = tenantSlug || currentTenant?.slug || 'ecole221';
  const isDefaultSchool = activeSlug === 'ecole221' || activeSlug === 'ecole-221';
  const schoolDisplayName = isDefaultSchool ? 'École 221' : (currentTenant?.name || activeSlug.toUpperCase());

  const localRegisteredAdmin = typeof window !== 'undefined'
    ? localStorage.getItem(`tenant_admin_${activeSlug}`)
    : null;

  const quickCredentials = {
    admin: {
      label: 'Admin',
      email: isDefaultSchool ? 'admin221@gmail.com' : (localRegisteredAdmin || `admin@${activeSlug}.sn`),
      password: 'ecole221',
      badgeClass: 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200',
    },
    etudiant: {
      label: 'Étudiant',
      email: isDefaultSchool ? 'etudiant221@gmail.com' : `etudiant@${activeSlug}.sn`,
      password: 'ecole221',
      badgeClass: 'bg-[#EAF7EE] hover:bg-[#D0EBD9] text-[#1E5E3A] border-[#1E5E3A]/20',
    },
    professeur: {
      label: 'Prof',
      email: isDefaultSchool ? 'professeur221@gmail.com' : `prof@${activeSlug}.sn`,
      password: 'ecole221',
      badgeClass: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200',
    },
    vigile: {
      label: 'Vigile',
      email: isDefaultSchool ? 'vigile221@gmail.com' : `vigile@${activeSlug}.sn`,
      password: 'ecole221',
      badgeClass: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200',
    },
    parent: {
      label: 'Parent',
      email: isDefaultSchool ? 'parent221@gmail.com' : `parent@${activeSlug}.sn`,
      password: 'ecole221',
      badgeClass: 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200',
    },
  };

  const loading = etat === 'CHARGEMENT';
  const success = etat === 'SUCCES';

  useEffect(() => {
    if (success) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#B3181C', '#38BDF8'],
        disableForReducedMotion: true,
      });
    }
  }, [success]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading || success) return;
    executer({ email, motDePasse: password });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetError('');
    setTimeout(() => {
      setResetLoading(false);
      setCurrentView('SUCCESS');
    }, 1200);
  };

  if (currentView === 'MOT_DE_PASSE_OUBLIE') {
    return (
      <ForgotPasswordForm
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        resetLoading={resetLoading}
        resetError={resetError}
        handleResetSubmit={handleResetSubmit}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'SUCCESS') {
    return (
      <ResetSuccessMessage
        resetEmail={resetEmail}
        setCurrentView={setCurrentView}
        setResetEmail={setResetEmail}
      />
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={etat === 'ERREUR' ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`space-y-3.5 ${isMobile ? 'pt-1 space-y-3' : 'md:space-y-4'}`}
    >
      <AnimatePresence>
        {erreur && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-semibold"
          >
            <Icon icon="solar:danger-triangle-bold-duotone" className="text-base text-red-500 shrink-0" />
            <span>{erreur}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        <label className={`text-[12px] font-bold block ${isMobile ? 'text-[#3E2927] mb-[2px]' : 'text-[#3E2927]'}`} htmlFor="email">
          Adresse e-mail <span className="text-[#DE4E3F] font-bold">*</span>
        </label>
        <div className="relative group">
          <Icon icon="solar:letter-bold-duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7977]/80 text-[18px] pointer-events-none group-focus-within:text-primary transition-colors" />
          <input
            className="w-full h-11 md:h-12 bg-[#FAF8F6] border border-[#E2DCDA] rounded-xl text-xs placeholder-[#A29492] focus:border-primary focus:ring-2 focus:ring-primary/10 pl-10 pr-4 text-[#291715] transition-all outline-none disabled:opacity-60"
            id="email"
            required
            type="email"
            value={email}
            disabled={loading || success}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={`text-[12px] font-bold block ${isMobile ? 'text-[#3E2927] mb-[2px]' : 'text-[#3E2927]'}`} htmlFor="password">
          Mot de passe <span className="text-[#DE4E3F] font-bold">*</span>
        </label>
        <div className="relative group">
          <Icon icon="solar:lock-keyhole-bold-duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7977]/80 text-[18px] pointer-events-none group-focus-within:text-primary transition-colors" />
          <input
            className="w-full h-11 md:h-12 bg-[#FAF8F6] border border-[#E2DCDA] rounded-xl text-xs placeholder-[#A29492] focus:border-primary focus:ring-2 focus:ring-primary/10 pl-10 pr-10 text-[#291715] transition-all outline-none disabled:opacity-60"
            id="password"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            disabled={loading || success}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E7977]/80 hover:text-[#1c1110] transition-colors p-1 flex items-center justify-center rounded-md cursor-pointer"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Bouton d'action principal avec State Machine */}
      <motion.button
        whileHover={!loading && !success ? { scale: 1.01 } : {}}
        whileTap={!loading && !success ? { scale: 0.98 } : {}}
        className={`w-full h-11 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-5 mb-1 ${
          success
            ? 'bg-emerald-600 shadow-emerald-500/20'
            : loading
            ? 'bg-primary/80 cursor-wait'
            : 'bg-primary hover:bg-primary/90 shadow-primary/15'
        }`}
        type="submit"
        disabled={loading || success}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Icon icon="solar:refresh-circle-bold-duotone" className="text-base animate-spin" />
            <span>Connexion en cours...</span>
          </div>
        ) : success ? (
          <div className="flex items-center gap-2">
            <Icon icon="solar:check-circle-bold-duotone" className="text-base animate-pulse" />
            <span>Connexion réussie !</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span>Se connecter</span>
            <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
          </div>
        )}
      </motion.button>

      {settings.showRegisterButton !== false && (
        <button
          type="button"
          onClick={() => navigate(ROUTES.candidature)}
          className="w-full h-10 border border-primary text-primary hover:bg-primary/5 active:scale-[0.98] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Icon icon="solar:user-plus-rounded-bold-duotone" className="text-base font-bold" />
          <span>S'inscrire / Déposer un Dossier</span>
        </button>
      )}

      <div className="flex justify-between items-center pt-3 text-[11px] font-bold">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#1E5E3A] border border-[#D0EBD9] text-[10px] font-black uppercase tracking-wider select-none">
          <Icon icon="solar:shield-check-bold-duotone" className="text-xs" />
          <span>Sécurisé</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setCurrentView('MOT_DE_PASSE_OUBLIE');
            setResetEmail(email);
          }}
          className="text-[#8E7977] hover:text-primary hover:underline transition-colors cursor-pointer"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2DCDA]/60 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-[#3E2927] uppercase tracking-wider">
            Identifiants Rapides ({schoolDisplayName}) :
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(quickCredentials).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setEmail(item.email);
                setPassword(item.password);
              }}
              title={`${item.label} : ${item.email}`}
              className={`px-2.5 py-1 text-[9.5px] font-black rounded-lg border transition-all cursor-pointer active:scale-95 ${item.badgeClass}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </motion.form>
  );
}

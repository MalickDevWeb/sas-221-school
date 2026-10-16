import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';
import confetti from 'canvas-confetti';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';

export const AdminPortalLoginPage: React.FC = () => {
  const { currentTenant, resolveTenant } = useTenantStore();
  const initialSlug = currentTenant?.slug || 'ecole221';
  const initialName = currentTenant?.name || 'École 221';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [schoolSlug, setSchoolSlug] = useState(initialSlug);
  const [customSchoolName, setCustomSchoolName] = useState(initialName);

  const { executer, etat, erreur } = useLogin();
  const loading = etat === 'CHARGEMENT';
  const success = etat === 'SUCCES';
  const { utilisateur } = useAuthStore();
  const navigate = useNavigate();

  // Motion values pour tilt 3D sur le mockup de gauche
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 140, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 140, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Établissements prédéfinis (avec intégration du tenant actif)
  const PRESET_SCHOOLS = [
    ...(currentTenant && currentTenant.slug !== 'ecole221' && currentTenant.slug !== 'ecole-221'
      ? [{ slug: currentTenant.slug, name: `${currentTenant.name} (Mon Établissement)`, color: currentTenant.branding?.primaryColor || '#10B981', badge: 'Actif' }]
      : []),
    { slug: 'ecole221', name: 'École 221 (Campus Dakar)', color: '#B3181C', badge: 'Standard' },
    { slug: 'lycee-excellence', name: 'Lycée d\'Excellence Moderne', color: '#1E5E3A', badge: 'Privé' },
    { slug: 'groupe-scolaire-avenir', name: 'Groupe Scolaire Avenir', color: '#06B6D4', badge: 'Bilingue' },
    { slug: 'custom', name: 'Autre Établissement (Saisir le nom)...', color: '#10B981', badge: 'Multi-Tenant' },
  ];

  useEffect(() => {
    if (schoolSlug && schoolSlug !== 'custom' && currentTenant?.slug !== schoolSlug) {
      resolveTenant(schoolSlug);
    }
  }, [schoolSlug, currentTenant, resolveTenant]);

  useEffect(() => {
    if (etat === 'IDLE' && (utilisateur?.role === 'ADMIN' || utilisateur?.role === 'ADMINISTRATOR')) {
      navigate('/admin/dashboard');
    }
  }, [utilisateur, navigate, etat]);

  useEffect(() => {
    if (success) {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#B3181C', '#38BDF8'],
        disableForReducedMotion: true,
      });
    }
  }, [success]);

  const handleSchoolChange = (newSlug: string) => {
    setSchoolSlug(newSlug);
    if (newSlug !== 'custom') {
      const selected = PRESET_SCHOOLS.find((s) => s.slug === newSlug);
      if (selected) setCustomSchoolName(selected.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading || success) return;

    const activeSlug =
      schoolSlug === 'custom'
        ? customSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : schoolSlug;

    await resolveTenant(activeSlug);
    executer({ email, motDePasse: password });
  };

  return (
    <div className="min-h-screen bg-[#070A14] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* 1. Halos d'ambiance néon doux et équilibrés */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-15 bg-purple-600" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-10 bg-indigo-600" />

      {/* 2. Header épuré */}
      <header className="relative z-20 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 active:scale-95 cursor-pointer"
        >
          <Icon icon="solar:arrow-left-line-duotone" className="text-base" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[1px] flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <Icon icon="solar:square-academic-cap-bold-duotone" className="text-purple-400 text-lg" />
            </div>
          </div>
          <span className="text-lg font-black tracking-tight text-white">My School</span>
        </div>
      </header>

      {/* 3. Layout Split-Screen 2 Colonnes */}
      <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8 gap-8 lg:gap-12 items-center">
        
        {/* ── COLONNE GAUCHE : Cockpit Visuel & Live Dashboard ── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge haut */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-widest w-fit mb-4 shadow-inner">
              <Icon icon="solar:stars-bold-duotone" className="text-amber-400 text-sm" />
              <span>Portail Décisionnel & Pilotage</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight mb-3">
              Gérez votre établissement avec <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300">
                excellence & sérénité.
              </span>
            </h1>

            <p className="text-sm text-slate-300 mb-8 max-w-md leading-relaxed font-normal">
              Centralisez les scolarités, suivez les présences en temps réel et pilotez vos flux financiers Wave & Orange Money sur un dashboard unique.
            </p>
          </motion.div>

          {/* Carte Glassmorphism Interactive avec Tilt 3D */}
          <motion.div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl p-6 bg-slate-900/70 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden hover:border-purple-500/30 transition-colors"
          >
            {/* Ligne d'accent supérieure douce */}
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

            {/* En-tête du mini dashboard */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Icon icon="solar:buildings-3-bold-duotone" className="text-xl" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {currentTenant?.name || customSchoolName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Campus Connecté en Direct</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Année Scolaire</span>
                <p className="text-xs font-black text-white font-mono">2026 - 2027</p>
              </div>
            </div>

            {/* Grille des statistiques clés */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl p-3.5 bg-slate-950/60 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Élèves Actifs</span>
                  <Icon icon="solar:users-group-rounded-bold-duotone" className="text-base text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">1 420</span>
                  <span className="text-[10px] font-bold text-emerald-400">+12%</span>
                </div>
              </div>

              <div className="rounded-2xl p-3.5 bg-slate-950/60 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Taux Présence</span>
                  <Icon icon="solar:chart-2-bold-duotone" className="text-base text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">96.8%</span>
                  <span className="text-[10px] font-bold text-emerald-400">Objectif atteint</span>
                </div>
              </div>
            </div>

            {/* Paiements Wave & OM */}
            <div className="rounded-2xl p-4 bg-slate-950/70 border border-white/5 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Icon icon="solar:wallet-money-bold-duotone" className="text-base text-cyan-400" />
                  <span>Scolarités Collectées</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#1dc3ff]/20 text-[#1dc3ff] text-[10px] font-black border border-[#1dc3ff]/30">Wave</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#ff7900]/20 text-[#ff7900] text-[10px] font-black border border-[#ff7900]/30">OM</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white font-mono tracking-tight">14 850 000 FCFA</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automatiquement synchronisé</p>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  92% soldé
                </span>
              </div>
            </div>

            {/* Contrôle Vigile */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Icon icon="solar:check-circle-bold-duotone" className="text-xs" />
                </div>
                <span className="text-slate-300 font-medium">Contrôle d'accès campus</span>
              </div>
              <span className="text-slate-400 font-semibold text-[11px] font-mono">894 scans QR ce matin</span>
            </div>
          </motion.div>
        </div>

        {/* ── COLONNE DROITE : Formulaire de Connexion Élégant ── */}
        <div className="col-span-1 lg:col-span-6 w-full max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              x: etat === 'ERREUR' ? [-8, 8, -6, 6, -3, 3, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              x: { duration: 0.4 },
            }}
            className="rounded-3xl p-7 sm:p-9 bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Ligne lumineuse supérieure sobre et élégante */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />

            <div className="text-left mb-6">
              <div className="inline-flex lg:hidden items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-black uppercase tracking-wider mb-3">
                <Icon icon="solar:stars-bold-duotone" className="text-amber-400 text-xs" />
                <span>Espace Direction</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
                Connexion Direction
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Accédez à votre espace administrateur avec votre compte établissement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Sélection de l'école */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Établissement Scolaire *
                </label>
                <div className="relative">
                  <Icon icon="solar:buildings-3-bold-duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <select
                    value={schoolSlug}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    disabled={loading || success}
                    style={{ colorScheme: 'dark' }}
                    className="w-full h-12 bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-8 text-white font-medium text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer appearance-none disabled:opacity-60"
                  >
                    {PRESET_SCHOOLS.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-slate-900 text-white">
                        {s.name} ({s.badge})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon icon="solar:alt-arrow-down-linear" className="text-sm" />
                  </div>
                </div>

                {schoolSlug === 'custom' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Nom officiel de votre école..."
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      disabled={loading || success}
                      style={{ colorScheme: 'dark' }}
                      className="w-full h-11 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                )}

                {/* Badge branding actif */}
                <div className="mt-2 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Icon icon="solar:verified-check-bold-duotone" className="text-emerald-400 text-sm" />
                    <span>Branding actif :</span>
                  </span>
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full inline-block bg-purple-500 shadow-sm" />
                    {currentTenant?.name || customSchoolName}
                  </span>
                </div>
              </div>

              {/* 2. Email de l'administrateur (Stylé en Dark Mode propre avec anti-autofill blanc) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Email de l'Administrateur *
                </label>
                <div className="relative group">
                  <Icon icon="solar:letter-bold-duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                    style={{ colorScheme: 'dark' }}
                    className="w-full h-12 bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-60"
                    placeholder="admin@mon-ecole.sn ou admin221@gmail.com"
                    required
                  />
                </div>
              </div>

              {/* 3. Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Mot de passe *
                  </label>
                  <a href="#contact" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative group">
                  <Icon icon="solar:lock-keyhole-bold-duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || success}
                    style={{ colorScheme: 'dark' }}
                    className="w-full h-12 bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-60"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Message d'erreur animé */}
              <AnimatePresence>
                {erreur && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 text-xs text-rose-200 bg-rose-500/15 border border-rose-500/30 rounded-xl font-medium flex items-center gap-2"
                  >
                    <Icon icon="solar:danger-triangle-bold-duotone" className="text-rose-400 text-base shrink-0" />
                    <span>{erreur}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton avec State Machine (sobre, beau, réactif) */}
              <motion.button
                type="submit"
                disabled={loading || success}
                whileHover={!loading && !success ? { scale: 1.01 } : {}}
                whileTap={!loading && !success ? { scale: 0.98 } : {}}
                className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-300 mt-4 cursor-pointer shadow-lg ${
                  success
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-600/40'
                    : loading
                    ? 'bg-primary-dark/60 text-white/80 border border-primary/40 cursor-wait'
                    : 'bg-primary hover:bg-primary-dark hover:brightness-110 text-white shadow-primary/40 hover:shadow-primary/60'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:refresh-circle-bold-duotone" className="text-lg animate-spin" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-lg animate-pulse" />
                    <span>Connexion réussie ! Redirection...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Accéder à mon espace Direction</span>
                    <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
                  </div>
                )}
              </motion.button>
            </form>

            {/* Raccourci Démo Directeur */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Compte test :</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@ecole221.sn');
                  setPassword('SuperAdmin@221!');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Icon icon="solar:user-bold-duotone" className="text-purple-400 text-xs" />
                <span>Remplir compte Direction</span>
              </button>
            </div>

            {/* Raccourci vers Inscription */}
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className="text-xs text-slate-400 mb-1">
                Votre établissement n'est pas encore enregistré ?
              </p>
              <Link
                to="/register-school"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Icon icon="solar:buildings-3-bold-duotone" className="text-sm" />
                <span>Inscrire mon établissement gratuitement →</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer minimaliste */}
      <footer className="relative z-20 py-4 text-center text-xs text-slate-400 border-t border-white/5">
        © {new Date().getFullYear()} My School SaaS — Plateforme Multi-Tenant pour l'Éducation
      </footer>
    </div>
  );
};

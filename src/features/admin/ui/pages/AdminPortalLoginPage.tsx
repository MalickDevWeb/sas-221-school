import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Building2, Mail, Lock, ChevronRight, Sparkles, ArrowLeft, School, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';

export const AdminPortalLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolSlug, setSchoolSlug] = useState('ecole221');
  const [customSchoolName, setCustomSchoolName] = useState('École 221');
  
  const { executer, etat, erreur } = useLogin();
  const loading = etat === 'CHARGEMENT';
  const { utilisateur } = useAuthStore();
  const { currentTenant, resolveTenant } = useTenantStore();
  const navigate = useNavigate();

  // Établissements prédéfinis + option personnalisée
  const PRESET_SCHOOLS = [
    { slug: 'ecole221', name: 'École 221 (Campus Dakar)', color: '#B3181C', badge: 'Standard' },
    { slug: 'lycee-excellence', name: 'Lycée d\'Excellence Moderne', color: '#7C3AED', badge: 'Privé' },
    { slug: 'groupe-scolaire-avenir', name: 'Groupe Scolaire Avenir', color: '#0284C7', badge: 'Bilingue' },
    { slug: 'custom', name: 'Autre Établissement (Saisir le nom)...', color: '#059669', badge: 'Multi-Tenant' },
  ];

  // Recharger le thème de l'école sélectionnée
  useEffect(() => {
    if (schoolSlug && schoolSlug !== 'custom') {
      resolveTenant(schoolSlug);
    }
  }, [schoolSlug, resolveTenant]);

  useEffect(() => {
    if (utilisateur?.role === 'ADMIN' || utilisateur?.role === 'ADMINISTRATOR') {
      navigate('/admin/dashboard');
    }
  }, [utilisateur, navigate]);

  const handleSchoolChange = (newSlug: string) => {
    setSchoolSlug(newSlug);
    if (newSlug !== 'custom') {
      const selected = PRESET_SCHOOLS.find(s => s.slug === newSlug);
      if (selected) setCustomSchoolName(selected.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // S'assurer que le thème de l'école choisie est actif
    const activeSlug = schoolSlug === 'custom' 
      ? customSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
      : schoolSlug;
    
    await resolveTenant(activeSlug);

    // Lancement de la connexion
    executer({ email, motDePasse: password });
  };

  const primaryColor = currentTenant?.branding?.primaryColor || '#7C3AED';

  return (
    <div className="min-h-screen bg-[#080B17] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Halos d'ambiance dynamiques aux couleurs de l'école */}
      <div 
        className="absolute top-1/4 left-1/4 w-[650px] h-[650px] rounded-full blur-[180px] pointer-events-none opacity-20 transition-colors duration-700"
        style={{ backgroundColor: primaryColor }}
      />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header avec retour à l'accueil */}
      <header className="relative z-20 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft size={16} />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[1px] flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400 text-lg">school</span>
            </div>
          </div>
          <span className="text-lg font-black tracking-tight text-white">My School</span>
        </div>
      </header>

      {/* Layout Split-Screen 2 Colonnes */}
      <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8 gap-8 lg:gap-12 items-center">
        
        {/* ── COLONNE GAUCHE : Visuel 3D Verre Dépoli & Dashboard en direct ── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center relative">
          {/* Badge haut */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-widest w-fit mb-4">
            <Sparkles size={14} className="text-amber-400" />
            <span>Portail Décisionnel & Pilotage</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight mb-3">
            Gérez votre établissement avec <br />
            <span 
              className="transition-colors duration-500"
              style={{ color: primaryColor }}
            >
              excellence & sérénité.
            </span>
          </h1>

          <p className="text-sm text-slate-300 mb-8 max-w-md leading-relaxed">
            Centralisez les scolarités, suivez les présences en temps réel et pilotez vos flux financiers Wave & Orange Money sur un dashboard unique.
          </p>

          {/* Carte 3D Glassmorphism - Dashboard Preview Réactif */}
          <div className="relative rounded-3xl p-6 bg-slate-900/60 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Halo lumineux d'angle */}
            <div 
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 transition-colors duration-500"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Header du mini dashboard */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg transition-colors duration-500"
                  style={{ backgroundColor: primaryColor }}
                >
                  {customSchoolName ? customSchoolName[0].toUpperCase() : '🎓'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {currentTenant?.name || customSchoolName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Campus Connecté en Direct</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Année Scolaire</span>
                <p className="text-xs font-black text-white">2026 - 2027</p>
              </div>
            </div>

            {/* Grille des statistiques clés */}
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              {/* Stat 1 : Élèves */}
              <div className="rounded-2xl p-3.5 bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Élèves Actifs</span>
                  <Icon icon="solar:users-group-rounded-bold-duotone" className="text-lg text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">1 420</span>
                  <span className="text-[10px] font-bold text-emerald-400">+12% ce mois</span>
                </div>
              </div>

              {/* Stat 2 : Présences */}
              <div className="rounded-2xl p-3.5 bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Taux Présence</span>
                  <Icon icon="solar:chart-2-bold-duotone" className="text-lg text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">96.8%</span>
                  <span className="text-[10px] font-bold text-emerald-400">Objectif atteint</span>
                </div>
              </div>
            </div>

            {/* Stat 3 : Paiements Scolarité Wave & OM */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Icon icon="solar:card-2-bold-duotone" className="text-base text-cyan-400" />
                  <span>Scolarités Collectées</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#1dc3ff]/20 text-[#1dc3ff] text-[10px] font-black border border-[#1dc3ff]/30">Wave</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#ff7900]/20 text-[#ff7900] text-[10px] font-black border border-[#ff7900]/30">OM</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white tracking-tight">14 850 000 FCFA</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automatiquement synchronisé avec la banque</p>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  92% soldé
                </span>
              </div>
            </div>

            {/* Barre de passage Vigile / Sécurité */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span className="text-slate-300 font-medium">Contrôle d'accès campus</span>
              </div>
              <span className="text-slate-400 font-semibold text-[11px]">894 scans QR ce matin</span>
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE : Formulaire de Connexion Direction ── */}
        <div className="col-span-1 lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="rounded-3xl p-7 sm:p-9 bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Accent bar réactive au sommet */}
            <div 
              className="absolute top-0 inset-x-0 h-1.5 transition-colors duration-500"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="text-left mb-6">
              <div className="inline-flex lg:hidden items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} className="text-amber-400" />
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
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <select
                    value={schoolSlug}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white font-medium text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer appearance-none"
                  >
                    {PRESET_SCHOOLS.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-slate-900 text-white">
                        {s.name} ({s.badge})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
                    ▼
                  </div>
                </div>

                {/* Si 'custom', champ de texte supplémentaire */}
                {schoolSlug === 'custom' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Nom officiel de votre école..."
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Badge indicatif de l'école active */}
                <div className="mt-2 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Branding actif :</span>
                  </span>
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block shadow-sm transition-colors duration-500"
                      style={{ backgroundColor: primaryColor }}
                    />
                    {currentTenant?.name || customSchoolName}
                  </span>
                </div>
              </div>

              {/* 2. Email Administratif */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Email de l'Administrateur *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Message d'erreur */}
              {erreur && (
                <div className="p-3 text-xs text-rose-200 bg-rose-500/15 border border-rose-500/30 rounded-xl font-medium">
                  {erreur}
                </div>
              )}

              {/* Bouton Néon Dégradé Violet / Magenta */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-13 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-[0_0_25px_rgba(217,70,239,0.35)] hover:shadow-[0_0_35px_rgba(217,70,239,0.55)] mt-4 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Accéder à mon espace Direction</span>
                    <ChevronRight size={16} />
                  </span>
                )}
              </button>
            </form>

            {/* Raccourci vers Inscription */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400 mb-2">
                Votre établissement n'est pas encore enregistré ?
              </p>
              <Link
                to="/register-school"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Building2 size={14} />
                <span>Inscrire mon établissement gratuitement →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimaliste */}
      <footer className="relative z-20 py-4 text-center text-xs text-slate-400 border-t border-white/5">
        © {new Date().getFullYear()} My School SaaS — Plateforme Multi-Tenant pour l'Éducation
      </footer>
    </div>
  );
};

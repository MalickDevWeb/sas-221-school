import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { publicApiClient } from '@/shared/lib/apiClient';
import { ROUTES } from '@/shared/constants';
import {
  extractPaletteFromLogo,
  generatePaletteFromHex,
  PREDEFINED_PALETTES,
  type TenantPalette,
} from '@/shared/utils/colorExtractor';
import { useTenantStore } from '@/core/store/tenantStore';

// Palette moderne par défaut pour My School (Violet Prestige / Indigo)
const DEFAULT_MY_SCHOOL_PALETTE: TenantPalette = generatePaletteFromHex('#7C3AED');

// ─── Mockup 3D Réaliste et Interactif du Dashboard Établissement ──────────────
const RealisticAppMockup: React.FC<{
  schoolName: string;
  slug: string;
  palette: TenantPalette;
  logo: string | null;
}> = ({ schoolName, slug, palette, logo }) => {
  // Motion values pour un tilt 3D ultra-fluide suivant le pointeur
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-6deg', '6deg']);

  // Reflet dynamique de lumière spéculaire
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const displayName = schoolName.trim() || 'Lycée d’Excellence Dakar';
  const displaySlug = slug.trim() || 'lycee-excellence';

  return (
    <div className="relative w-full max-w-[500px] mx-auto py-4 select-none">
      {/* Halo d'ambiance néon derrière le mockup */}
      <div
        className="absolute -inset-4 rounded-3xl pointer-events-none opacity-40 blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${palette.primary} 0%, transparent 70%)`,
        }}
      />

      {/* ── Fenêtre Principale de l'Application avec Tilt 3D ── */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-colors duration-500"
      >
        {/* Reflet spéculaire dynamique */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-30"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.22), transparent 70%)`,
          }}
        />

        {/* Ligne d'accent supérieure lumineuse */}
        <div
          className="absolute top-0 left-8 right-8 h-[1.5px] z-20 transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
          }}
        />

        {/* ── 1. Barre de navigation type macOS / Browser ── */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-3">
          {/* Pastilles macOS (Traffic lights) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-xs" />
          </div>

          {/* Barre d'URL dynamique avec le slug en direct */}
          <div className="flex-1 max-w-[280px] mx-auto bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Icon icon="solar:lock-keyhole-bold-duotone" className="text-emerald-400 text-xs shrink-0" />
            <span className="truncate text-slate-300">
              myschool.sn/t/<span style={{ color: palette.primary }} className="font-bold">{displaySlug}</span>
            </span>
          </div>

          {/* Badge statut Live */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* ── 2. Corps du Dashboard ── */}
        <div className="p-4 sm:p-5 flex gap-3.5 bg-gradient-to-b from-slate-900/50 to-slate-950/80 min-h-[290px]">
          {/* Mini Sidebar */}
          <div className="w-12 bg-slate-950/70 border border-white/5 rounded-2xl p-2 flex flex-col items-center justify-between shrink-0">
            <div className="space-y-3 flex flex-col items-center">
              {/* Logo / Monogramme avec la couleur choisie */}
              <div
                className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20 transition-all duration-300"
                style={{ backgroundColor: palette.primary }}
              >
                {logo ? (
                  <img src={logo} className="w-full h-full object-contain p-0.5" alt="Logo" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Icônes de navigation */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: `${palette.primary}35` }}>
                <Icon icon="solar:widget-bold-duotone" className="text-sm" style={{ color: palette.primary }} />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="text-sm" />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300">
                <Icon icon="solar:calendar-bold-duotone" className="text-sm" />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300">
                <Icon icon="solar:card-2-bold-duotone" className="text-sm" />
              </div>
            </div>

            <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 text-[10px]">
              <Icon icon="solar:settings-bold-duotone" />
            </div>
          </div>

          {/* Zone de contenu principale du Cockpit */}
          <div className="flex-1 flex flex-col justify-between gap-3">
            {/* Header du dashboard de l'école */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white tracking-tight truncate max-w-[200px]">
                  {displayName}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Cockpit Direction • Session 2026</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: palette.primary }}
                >
                  Admin
                </div>
              </div>
            </div>

            {/* Cartes KPIs clés */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-semibold">Effectif Total</span>
                  <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xs" style={{ color: palette.primary }} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-white font-mono">1 240</span>
                  <span className="text-[9px] font-bold text-emerald-400">+14%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-semibold">Taux Présence</span>
                  <Icon icon="solar:chart-2-bold-duotone" className="text-xs text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-white font-mono">98.4%</span>
                  <span className="text-[9px] font-bold text-emerald-400">Stable</span>
                </div>
              </div>
            </div>

            {/* Mini Graphique d'activité avec animation douce */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-2">
                <span>Fréquentation Hebdomadaire</span>
                <span className="font-mono text-emerald-400 font-bold">96.8% Moy.</span>
              </div>
              <div className="flex items-end justify-between h-10 gap-1.5 px-1">
                {[45, 80, 60, 95, 75, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="w-full rounded-t-sm"
                    style={{
                      backgroundColor: palette.primary,
                      opacity: 0.4 + (i / 6) * 0.6,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bouton d'action Rapide aux couleurs de l'école */}
            <div
              className="py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-center text-white shadow-md flex items-center justify-center gap-1.5 transition-colors duration-300"
              style={{ backgroundColor: palette.primary }}
            >
              <span>Accéder à l'espace scolarité</span>
              <Icon icon="solar:arrow-right-line-duotone" className="text-xs" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Chips Satellites Flottants (Micro-interactions 3D) ── */}
      {/* 1. Badge Élève avec QR Code (flottant en haut à droite) */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 -right-4 z-40 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-2"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: palette.primary }}
        >
          <Icon icon="solar:qr-code-bold-duotone" className="text-base" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-white leading-tight">Badge QR Dynamique</p>
          <p className="text-[8px] text-emerald-400 font-semibold">Contrôle Vigile Actif</p>
        </div>
      </motion.div>

      {/* 2. Paiement Wave & OM (flottant en bas à gauche) */}
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-3 -left-4 z-40 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
          <Icon icon="solar:wallet-bold-duotone" className="text-base" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-white leading-tight">Paiements Wave & OM</p>
          <p className="text-[8px] text-slate-400 font-semibold">Zéro Déplacement</p>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Pastille de Couleur (Swatch) ───────────────────────────────────────────
const Swatch: React.FC<{
  palette: TenantPalette;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ palette, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${
      active ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'
    }`}
  >
    <div
      className={`w-11 h-11 rounded-2xl overflow-hidden shadow-lg ring-2 ring-offset-2 ring-offset-[#070A14] transition-all ${
        active ? 'ring-purple-400 shadow-purple-500/30 scale-105' : 'ring-transparent hover:ring-white/20'
      }`}
      style={{
        background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`,
      }}
    >
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full" style={{ backgroundColor: palette.accent, opacity: 0.7 }} />
      </div>
    </div>
    <span
      className={`text-[10px] font-bold text-center leading-tight max-w-[48px] transition-colors ${
        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
      }`}
    >
      {label.split(' ')[0]}
    </span>
  </button>
);

// ─── Composant Principal SchoolRegistrationPage ──────────────────────────────
export const SchoolRegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    slug: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
  });
  const [palette, setPalette] = useState<TenantPalette>(DEFAULT_MY_SCHOOL_PALETTE);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('Violet Prestige');
  const [customHex, setCustomHex] = useState('#7C3AED');
  const [step, setStep] = useState(1); // 1 = Identité, 2 = Palette, 3 = Admin
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredOrg, setRegisteredOrg] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const isTrial = searchParams.get('trial') === 'true';

  const isEcole221 =
    formData.slug?.toLowerCase() === 'ecole221' || formData.schoolName?.toLowerCase().includes('ecole 221');

  useEffect(() => {
    useTenantStore.getState().applyTheme({ primaryColor: palette.primary, palette });
    return () => useTenantStore.getState().rehydrateTheme();
  }, [palette]);

  const applyPalette = useCallback(
    (p: TenantPalette, presetName?: string) => {
      if (isEcole221) {
        toast.info('Palette officielle École 221 maintenue.');
        return;
      }
      setPalette(p);
      setCustomHex(p.primary);
      setActivePreset(presetName ?? '');
    },
    [isEcole221]
  );

  // Restauration automatique des données sauvegardées en cas de tentative précédente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pending_school_registration');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schoolName || parsed.adminEmail) {
          setFormData((prev) => ({
            ...prev,
            schoolName: parsed.schoolName || prev.schoolName,
            slug: parsed.slug || prev.slug,
            adminEmail: parsed.adminEmail || prev.adminEmail,
            adminFirstName: parsed.adminFirstName || prev.adminFirstName,
            adminLastName: parsed.adminLastName || prev.adminLastName,
            adminPhone: parsed.adminPhone || prev.adminPhone,
          }));
          if (parsed.primaryColor) {
            applyPalette(generatePaletteFromHex(parsed.primaryColor));
          }
        }
      }
    } catch {
      // ignore
    }
  }, [applyPalette]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setIsExtracting(true);
    try {
      const { colors, palette: p } = await extractPaletteFromLogo(file);
      setExtractedColors(colors);
      applyPalette(p);
      toast.success(`${colors.length} couleurs détectées avec succès dans votre logo !`);
    } catch {
      toast.error("Impossible d'analyser le logo.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (
        name === 'schoolName' &&
        (!prev.slug || prev.slug === prev.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
      ) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const computedSlug =
      formData.slug?.trim() ||
      formData.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
      `ecole-${Date.now()}`;
    try {
      const response = await publicApiClient.post('/register-school', {
        schoolName: formData.schoolName,
        slug: computedSlug,
        adminEmail: formData.adminEmail,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminPhone: formData.adminPhone,
        primaryColor: palette.primary,
      });
      setRegisteredOrg(response.data || {});
      setShowSuccessModal(true);
      localStorage.removeItem('pending_school_registration');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#06b6d4', '#10b981'],
      });
      toast.success('🎉 Inscription réussie !', {
        description: 'Votre cockpit établissement est prêt.',
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data;

      if (status === 500) {
        const pending = { ...formData, primaryColor: palette.primary, savedAt: new Date().toISOString() };
        localStorage.setItem('pending_school_registration', JSON.stringify(pending));
        const detail =
          typeof serverMessage === 'string' ? serverMessage.slice(0, 200) : 'Erreur interne serveur (500)';
        toast.warning('Serveur indisponible — données sauvegardées localement', {
          description: detail || 'Réessayez quand le backend sera prêt.',
          duration: 8000,
        });
      } else {
        toast.error(`Erreur ${status || 'réseau'}`, {
          description: typeof serverMessage === 'string' ? serverMessage : 'Vérifiez votre connexion.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all duration-200';

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

        {/* ── Mockup 3D Réaliste du Cockpit Établissement ── */}
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

          {/* Étapes (Step Pills) */}
          <div className="flex items-center gap-2 mb-6">
            {['Identité', 'Palette', 'Administrateur'].map((label, i) => {
              const s = i + 1;
              const active = step === s;
              const done = step > s;
              return (
                <React.Fragment key={s}>
                  <button
                    type="button"
                    onClick={() => setStep(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/40'
                        : done
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                        active || done ? 'bg-white/20' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {done ? '✓' : s}
                    </span>
                    {label}
                  </button>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                        done ? 'bg-emerald-400/50' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

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

          {/* Bannière du forfait sélectionné (depuis les boutons Tarifs) */}
          {planParam && (
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
                className="text-xs text-purple-400 hover:text-purple-300 font-bold hover:underline shrink-0 ml-2"
              >
                Modifier
              </button>
            </div>
          )}

          {/* ── Formulaire Animé ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* STEP 1 : Identité */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Icon icon="solar:buildings-3-bold-duotone" className="text-purple-400 text-sm" />
                      <span>Nom de l'établissement</span>
                    </label>
                    <input
                      name="schoolName"
                      type="text"
                      required
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="ex: Lycée Technique de Thiès"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Icon icon="solar:link-bold-duotone" className="text-purple-400 text-sm" />
                      <span>Identifiant Web (Slug)</span>
                    </label>
                    <div className="flex rounded-xl shadow-inner overflow-hidden border border-slate-700/80 bg-slate-950/80 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40 transition-all">
                      <span className="flex items-center px-3.5 bg-slate-900 text-slate-400 text-sm font-mono border-r border-slate-800">
                        /t/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 text-sm text-white bg-transparent focus:outline-none placeholder-slate-500 font-mono"
                        placeholder="lycee-thies"
                      />
                    </div>
                    {formData.slug && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        URL directe :{' '}
                        <span className="font-mono text-purple-400 font-bold">
                          myschool.sn/t/{formData.slug}
                        </span>
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Continuer → Choisir ma palette</span>
                    <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 2 : Palette Visuelle */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Upload Logo avec extraction IA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Icon icon="solar:camera-add-bold-duotone" className="text-purple-400 text-sm" />
                      <span>Logo de votre établissement</span>
                    </label>
                    <label className="relative flex items-center gap-4 p-4 border-2 border-dashed border-slate-700/80 hover:border-purple-500/60 rounded-2xl cursor-pointer bg-slate-950/80 group transition-all">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-900 border border-white/10">
                        {isExtracting ? (
                          <Icon icon="solar:spinner-bold" className="text-2xl text-purple-400 animate-spin" />
                        ) : logoPreview ? (
                          <img src={logoPreview} className="w-full h-full object-contain p-1" alt="Logo preview" />
                        ) : (
                          <Icon icon="solar:camera-add-bold-duotone" className="text-2xl text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {isExtracting ? 'Analyse des couleurs...' : logoPreview ? 'Changer le logo' : 'Importer votre logo'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          PNG, JPG, SVG — Détection automatique de vos couleurs
                        </p>
                        {extractedColors.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {extractedColors.map((c, i) => (
                              <button
                                key={i}
                                type="button"
                                title={`Appliquer ${c}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  applyPalette(generatePaletteFromHex(c));
                                }}
                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${
                                  palette.primary === c ? 'border-purple-400 scale-110' : 'border-white/20'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                            <span className="text-[10px] text-slate-400 self-center ml-1">Appliquer</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Palettes Prédéfinies */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                      Palettes de référence prêtes à l'emploi
                    </label>
                    <div className="flex gap-2.5 flex-wrap p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      {PREDEFINED_PALETTES.map((p) => (
                        <Swatch
                          key={p.name}
                          palette={p.palette}
                          label={p.name}
                          active={activePreset === p.name}
                          onClick={() => applyPalette(p.palette, p.name)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Couleur personnalisée */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                      Code couleur sur-mesure (Hex)
                    </label>
                    <div className="flex gap-3 items-center p-3 bg-slate-950/80 rounded-2xl border border-slate-700/80 shadow-inner">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            applyPalette(generatePaletteFromHex(e.target.value));
                          }
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={customHex}
                        maxLength={7}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            applyPalette(generatePaletteFromHex(e.target.value));
                          }
                        }}
                        className="flex-1 text-sm font-mono border-0 focus:outline-none text-white bg-transparent"
                      />
                      <div className="flex gap-1.5">
                        {[palette.primary, palette.accent, palette.primaryDark].map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                    >
                      ← Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-[2] py-3.5 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer"
                    >
                      Valider → Compte Admin
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 : Compte Administrateur */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
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
                        value={formData.adminFirstName}
                        onChange={handleChange}
                        placeholder="Mamadou"
                        className={inputClass}
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
                        value={formData.adminLastName}
                        onChange={handleChange}
                        placeholder="Diallo"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Icon icon="solar:letter-bold-duotone" className="text-purple-400 text-sm" />
                      <span>Email administrateur</span>
                    </label>
                    <input
                      name="adminEmail"
                      type="email"
                      required
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="directeur@monecole.sn"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Icon icon="solar:phone-bold-duotone" className="text-purple-400 text-sm" />
                      <span>Téléphone / WhatsApp</span>
                    </label>
                    <input
                      name="adminPhone"
                      type="tel"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      placeholder="+221 77 000 00 00"
                      className={inputClass}
                    />
                  </div>

                  {/* Récapitulatif visuel rapide */}
                  <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Branding configuré
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[palette.primary, palette.accent, palette.primaryDark].map((c, i) => (
                          <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{activePreset || 'Personnalisée'}</p>
                        <p className="text-[10px] text-purple-400 font-mono">{palette.primary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all cursor-pointer"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                    >
                      ← Retour
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-4 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Icon icon="solar:spinner-bold" className="text-lg animate-spin" />
                          <span>Génération de votre école...</span>
                        </>
                      ) : (
                        <>
                          <span>Inscrire mon établissement</span>
                          <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-slate-400 pt-3">
              Déjà inscrit ?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.login)}
                className="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors ml-1 cursor-pointer"
              >
                Se connecter
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* ── MODAL RÉCAPITULATIF POUR LE DIRECTEUR ──────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white">
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

            <div className="rounded-2xl p-4 mb-5 border border-white/5 bg-slate-950/80 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Établissement</span>
                <span className="text-xs font-black text-white">{formData.schoolName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL Dédiée</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-purple-300">
                  /t/{formData.slug || registeredOrg?.slug || 'mon-ecole'}/login
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

            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl mb-6 flex items-start gap-2.5">
              <Icon icon="solar:info-circle-bold-duotone" className="text-indigo-400 text-base shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                Un compte administrateur a été généré. Dès validation par l'équipe SaaS, vous pourrez piloter vos cours, élèves, professeurs et finances depuis votre espace dédié.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/t/${formData.slug || 'ecole221'}/login`);
                }}
                className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer"
              >
                Accéder au portail de mon école →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolRegistrationPage;

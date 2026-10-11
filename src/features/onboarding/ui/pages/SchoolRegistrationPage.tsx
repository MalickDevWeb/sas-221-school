import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
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

// Palette moderne par défaut correspondant au thème My School (#070A14 & violet / indigo)
const DEFAULT_MY_SCHOOL_PALETTE: TenantPalette = generatePaletteFromHex('#6D28D9');

// ─── Mini App Preview (Cockpit Établissement en Dark Mode) ───────────────────
const MiniAppPreview: React.FC<{ name: string; palette: TenantPalette; logo: string | null }> = ({ name, palette, logo }) => (
  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md" style={{ fontFamily: 'Inter, sans-serif' }}>
    <div className="flex" style={{ height: 168 }}>
      {/* Sidebar miniature */}
      <div className="flex flex-col items-center py-3 gap-2.5 px-2 bg-slate-950/80 border-r border-white/5" style={{ width: 54 }}>
        <div
          className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shadow-md border border-white/10"
          style={{ backgroundColor: palette.primary }}
        >
          {logo ? (
            <img src={logo} className="w-full h-full object-contain p-0.5" alt="Logo" />
          ) : name ? (
            name[0].toUpperCase()
          ) : (
            <Icon icon="solar:buildings-3-bold-duotone" className="text-base text-white" />
          )}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-6 h-1.5 rounded-full transition-all"
            style={{
              backgroundColor: i === 1 ? palette.primary : 'rgba(255,255,255,0.1)',
              opacity: i === 1 ? 1 : 0.6,
            }}
          />
        ))}
      </div>

      {/* Zone principale miniature */}
      <div className="flex-1 p-3 flex flex-col gap-2 bg-[#080B17]/95">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <span className="text-[9px] font-bold tracking-tight text-white truncate max-w-[120px]">
            {name || 'Mon Établissement'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: palette.primary }} />
          </div>
        </div>

        {/* Cartes métriques */}
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          <div className="col-span-2 rounded-xl p-2 flex flex-col justify-between bg-slate-900/90 border border-white/5">
            <div className="w-12 h-1.5 rounded-full mb-1" style={{ backgroundColor: palette.primary, opacity: 0.8 }} />
            <div className="flex items-end gap-1">
              {[50, 75, 45, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: h * 0.3,
                    backgroundColor: palette.primary,
                    opacity: 0.4 + i * 0.12,
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-2 flex flex-col justify-center items-center text-center border border-white/10 shadow-sm"
            style={{ backgroundColor: `${palette.primary}25` }}
          >
            <div className="text-[11px] font-black text-white font-mono">98%</div>
            <div className="text-[7px] font-semibold text-slate-300 uppercase tracking-wider">Présence</div>
          </div>

          <div className="col-span-3 rounded-xl p-1.5 flex gap-2 items-center bg-slate-900/70 border border-white/5">
            <div
              className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] text-white"
              style={{ backgroundColor: palette.primary }}
            >
              <Icon icon="solar:bell-bold-duotone" className="text-xs" />
            </div>
            <div className="flex-1">
              <div className="h-1 rounded w-3/4 mb-1 bg-white/20" />
              <div className="h-1 rounded w-1/2 bg-white/10" />
            </div>
            <div
              className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{ backgroundColor: palette.primary, color: palette.textOnPrimary }}
            >
              Actif
            </div>
          </div>
        </div>

        {/* Bouton d'action CTA */}
        <button
          type="button"
          className="w-full py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-center transition-all shadow-md"
          style={{ backgroundColor: palette.primary, color: palette.textOnPrimary }}
        >
          Tableau de bord →
        </button>
      </div>
    </div>
  </div>
);

// ─── Color Swatch (Bouton de choix de palette) ──────────────────────────────
const Swatch: React.FC<{ palette: TenantPalette; label: string; active: boolean; onClick: () => void }> = ({
  palette,
  label,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${
      active ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'
    }`}
  >
    <div
      className={`w-11 h-11 rounded-2xl overflow-hidden shadow-lg ring-2 ring-offset-2 ring-offset-[#070A14] transition-all ${
        active ? 'ring-purple-400 shadow-purple-500/20' : 'ring-transparent hover:ring-white/20'
      }`}
      style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)` }}
    >
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full" style={{ backgroundColor: palette.accent, opacity: 0.7 }} />
      </div>
    </div>
    <span
      className={`text-[10px] font-semibold text-center leading-tight max-w-[48px] transition-colors ${
        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
      }`}
    >
      {label.split(' ')[0]}
    </span>
  </button>
);

// ─── Page principale d'inscription d'établissement ──────────────────────────
export const SchoolRegistrationPage = () => {
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
  const [customHex, setCustomHex] = useState('#6D28D9');
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setIsExtracting(true);
    try {
      const { colors, palette: p } = await extractPaletteFromLogo(file);
      setExtractedColors(colors);
      applyPalette(p);
      toast.success(`${colors.length} couleurs détectées dans votre logo !`);
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
      toast.success('Inscription réussie !', { description: 'Votre dossier complet a été généré.' });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data;

      if (status === 500) {
        const pending = { ...formData, primaryColor: palette.primary, savedAt: new Date().toISOString() };
        localStorage.setItem('pending_school_registration', JSON.stringify(pending));
        const detail = typeof serverMessage === 'string' ? serverMessage.slice(0, 200) : 'Erreur interne serveur (500)';
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
      {/* ── GAUCHE : Visuel Branding & Cockpit Preview ────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-[#090D1A]/90 border-r border-white/10 isolate">
        {/* Halos d'ambiance néon ultra-performants (radial gradients sans coût de filtre) */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.20) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, transparent 70%)',
          }}
        />

        {/* Logo plateforme My School (conforme à la Navbar du Landing Page) */}
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
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wider uppercase">
                Plateforme SaaS
              </span>
            </div>
          </button>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 space-y-8 my-auto">
          {/* App preview miniature dynamique */}
          <div className="max-w-xs mx-auto drop-shadow-2xl">
            <MiniAppPreview name={formData.schoolName} palette={palette} logo={logoPreview} />
          </div>

          <div>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3 tracking-tight">
              Votre établissement, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-400">
                votre identité visuelle.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Plateforme éducative 100% personnalisable. Votre branding s'applique instantanément à tous les profils — direction, élèves, parents et enseignants.
            </p>
          </div>

          {/* Stats de confiance */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: '500+', l: 'Établissements' },
              { v: '50k+', l: 'Élèves Actifs' },
              { v: '99.9%', l: 'Disponibilité' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl p-3.5 text-center bg-slate-950/70 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-colors"
              >
                <div className="text-white font-black text-lg font-mono">{s.v}</div>
                <div className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer gauche */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">© 2026 My School — Plateforme SaaS Éducative</p>
        </div>
      </div>

      {/* ── DROITE : Formulaire d'inscription ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-12 xl:px-16 overflow-y-auto bg-[#070A14] relative">
        {/* Halo d'ambiance discret */}
        <div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Steps indicator & header */}
        <div className="max-w-lg mx-auto w-full mb-8 relative z-10">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Icon icon="solar:square-academic-cap-bold-duotone" className="text-xl text-cyan-300" />
              </div>
            </div>
            <span className="font-black text-xl text-white">My School</span>
          </div>

          {/* Étapes (Steps pills) */}
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

          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            {step === 1 && "Identité de l'établissement"}
            {step === 2 && 'Votre identité visuelle'}
            {step === 3 && 'Compte administrateur'}
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            {step === 1 && 'Donnez un nom et une adresse web personnalisée à votre structure.'}
            {step === 2 && "Choisissez votre palette de couleurs ou laissez l'IA analyser votre logo."}
            {step === 3 && 'Configurez les accès du directeur ou responsable de compte.'}
          </p>

          {/* Bannière du forfait choisi depuis la Landing Page */}
          {planParam && (
            <div className="mb-6 p-4 rounded-2xl border bg-slate-900/80 border-purple-500/30 shadow-lg text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center shrink-0 shadow-sm">
                  {planParam === 'premium' ? (
                    <Icon icon="solar:buildings-3-bold-duotone" className="text-2xl text-fuchsia-400" />
                  ) : planParam === 'enterprise' ? (
                    <Icon icon="solar:global-bold-duotone" className="text-2xl text-indigo-400" />
                  ) : (
                    <Icon icon="solar:school-bold-duotone" className="text-2xl text-cyan-400" />
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                        <Icon icon="solar:bolt-bold-duotone" className="text-xs" />
                        <span>Essai 14 jours offert</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isTrial
                      ? 'Aucune carte bancaire requise. Accès immédiat dès validation.'
                      : 'Votre forfait sera configuré dès la validation de votre établissement.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/#pricing')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold hover:underline shrink-0 ml-3"
              >
                Modifier
              </button>
            </div>
          )}
        </div>

        {/* ── Formulaire d'inscription ── */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto w-full space-y-5 relative z-10">
          {/* STEP 1 : Identité */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Nom de l'établissement
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Identifiant Web (Slug)
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
                    className="flex-1 px-4 py-3 text-sm text-white bg-transparent focus:outline-none placeholder-slate-500"
                    placeholder="lycee-thies"
                  />
                </div>
                {formData.slug && (
                  <p className="mt-1.5 text-xs text-slate-400 font-sans">
                    URL d'accès :{' '}
                    <span className="font-mono text-purple-400 font-bold">
                      myschool.sn/t/{formData.slug}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continuer → Choisir ma palette</span>
                <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
              </button>
            </div>
          )}

          {/* STEP 2 : Palette Visuelle */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Import logo avec extraction IA */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Logo (Détection intelligente des couleurs)
                </label>
                <label className="relative flex items-center gap-4 p-4 border-2 border-dashed border-slate-700/80 hover:border-purple-500/60 rounded-2xl cursor-pointer bg-slate-950/80 group transition-all">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-900 border border-white/10"
                  >
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
                      {isExtracting ? 'Analyse en cours...' : logoPreview ? 'Changer le logo' : 'Importer votre logo'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PNG, JPG, SVG — L'algorithme détecte vos couleurs automatiquement
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
                        <span className="text-[10px] text-slate-400 self-center ml-1">Cliquez pour appliquer</span>
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

              {/* Palettes prédéfinies */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Palettes d'excellence prédéfinies
                </label>
                <div className="flex gap-3 flex-wrap p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
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
                  Couleur personnalisée (Code Hex)
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
                  {/* Pastilles de la palette calculée */}
                  <div className="flex gap-1.5">
                    {[palette.primary, palette.accent, palette.primaryLight].map((c, i) => (
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
                  className="flex-[2] py-3.5 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Valider → Compte Admin
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 : Compte Administrateur */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Prénom</label>
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nom</label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Email administrateur
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Téléphone / WhatsApp (optionnel)
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

              {/* Récapitulatif visuel */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Identité visuelle sélectionnée
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
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Icon icon="solar:spinner-bold" className="text-lg animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Inscrire mon établissement</span>
                      <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

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

      {/* ── MODAL RÉCAPITULATIF POUR LE DIRECTEUR ──────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white">
            {/* Header du modal */}
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

            {/* Note d'information */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl mb-6 flex items-start gap-2.5">
              <Icon icon="solar:info-circle-bold-duotone" className="text-indigo-400 text-base shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                Un compte administrateur a été généré. Dès validation par l'équipe SaaS, vous pourrez piloter vos cours, élèves, professeurs et finances depuis votre espace dédié.
              </p>
            </div>

            {/* Boutons d'action */}
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

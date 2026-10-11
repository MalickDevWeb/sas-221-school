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
  ECOLE_221_PALETTE,
  type TenantPalette,
} from '@/shared/utils/colorExtractor';
import { useTenantStore } from '@/core/store/tenantStore';

// ─── Mini App Preview ─────────────────────────────────────────────────────────
const MiniAppPreview: React.FC<{ name: string; palette: TenantPalette; logo: string | null }> = ({ name, palette, logo }) => (
  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
    <div className="flex" style={{ height: 160 }}>
      {/* Sidebar */}
      <div className="flex flex-col items-center py-3 gap-2 px-2" style={{ width: 52, backgroundColor: palette.surfaceWarm }}>
        <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shadow-md"
          style={{ backgroundColor: palette.primary }}>
          {logo ? <img src={logo} className="w-full h-full object-contain p-0.5" /> : (name ? name[0].toUpperCase() : <Icon icon="solar:buildings-3-bold-duotone" className="text-base" />)}
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className={`w-6 h-1.5 rounded-full transition-all`}
            style={{ backgroundColor: i === 1 ? palette.primary : palette.primaryLight, opacity: i === 1 ? 1 : 0.5 }} />
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 p-3 flex flex-col gap-2" style={{ backgroundColor: '#fafafa' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold" style={{ color: palette.primary }}>{name || 'Mon École'}</span>
          <div className="flex gap-1">
            {[palette.accent, palette.primary].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />
            ))}
          </div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          <div className="col-span-2 rounded-xl p-2 flex flex-col justify-between" style={{ backgroundColor: palette.primaryLight }}>
            <div className="w-10 h-1.5 rounded-full mb-1" style={{ backgroundColor: palette.primary, opacity: 0.7 }} />
            <div className="flex items-end gap-1">
              {[60, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: h * 0.3, backgroundColor: palette.primary, opacity: 0.4 + i * 0.1 }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl p-2 flex flex-col justify-center items-center" style={{ backgroundColor: palette.accent, opacity: 0.85 }}>
            <div className="text-white text-[10px] font-black">94%</div>
            <div className="text-white/70 text-[7px]">Présence</div>
          </div>
          <div className="col-span-3 rounded-xl p-1.5 flex gap-1.5 items-center" style={{ backgroundColor: '#fff', border: `1px solid ${palette.primaryLight}` }}>
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: palette.primary, opacity: 0.2 }} />
            <div className="flex-1">
              <div className="h-1 rounded w-3/4 mb-0.5" style={{ backgroundColor: palette.primary, opacity: 0.3 }} />
              <div className="h-1 rounded w-1/2" style={{ backgroundColor: palette.accent, opacity: 0.3 }} />
            </div>
            <div className="text-[7px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: palette.primary, color: palette.textOnPrimary }}>Live</div>
          </div>
        </div>
        {/* CTA */}
        <button className="w-full py-1 rounded-lg text-[8px] font-bold text-center transition-all"
          style={{ backgroundColor: palette.primary, color: palette.textOnPrimary }}>
          Tableau de bord →
        </button>
      </div>
    </div>
  </div>
);

// ─── Color Swatch ─────────────────────────────────────────────────────────────
const Swatch: React.FC<{ palette: TenantPalette; label: string; active: boolean; onClick: () => void }> = ({ palette, label, active, onClick }) => (
  <button type="button" onClick={onClick}
    className={`group relative flex flex-col items-center gap-1.5 transition-all duration-200 ${active ? 'scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}>
    <div className={`w-11 h-11 rounded-2xl overflow-hidden shadow-lg ring-2 ring-offset-2 transition-all ${active ? 'ring-gray-800' : 'ring-transparent'}`}
      style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)` }}>
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full" style={{ backgroundColor: palette.accent, opacity: 0.7 }} />
      </div>
    </div>
    <span className={`text-[9px] font-semibold text-center leading-tight max-w-[44px] transition-colors ${active ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}`}>
      {label.split(' ')[0]}
    </span>
  </button>
);

// ─── Page principale ──────────────────────────────────────────────────────────
export const SchoolRegistrationPage = () => {
  const [formData, setFormData] = useState({ schoolName: '', slug: '', adminEmail: '', adminFirstName: '', adminLastName: '', adminPhone: '' });
  const [palette, setPalette] = useState<TenantPalette>(ECOLE_221_PALETTE);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('Ecole 221 (Référence)');
  const [customHex, setCustomHex] = useState('#B3181C');
  const [step, setStep] = useState(1); // 1 = Identité, 2 = Palette, 3 = Admin
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredOrg, setRegisteredOrg] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const isTrial = searchParams.get('trial') === 'true';

  const isEcole221 = formData.slug?.toLowerCase() === 'ecole221' || formData.schoolName?.toLowerCase().includes('ecole 221');

  useEffect(() => {
    useTenantStore.getState().applyTheme({ primaryColor: palette.primary, palette });
    return () => useTenantStore.getState().rehydrateTheme();
  }, [palette]);

  const applyPalette = useCallback((p: TenantPalette, presetName?: string) => {
    if (isEcole221) { toast.info('Palette officielle Ecole 221 maintenue.'); return; }
    setPalette(p);
    setCustomHex(p.primary);
    setActivePreset(presetName ?? '');
  }, [isEcole221]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setIsExtracting(true);
    try {
      const { colors, palette: p } = await extractPaletteFromLogo(file);
      setExtractedColors(colors);
      applyPalette(p);
      toast.success(`✨ ${colors.length} couleurs détectées dans votre logo !`);
    } catch { toast.error("Impossible d'analyser le logo."); }
    finally { setIsExtracting(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'schoolName' && (!prev.slug || prev.slug === prev.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const computedSlug = formData.slug?.trim() || formData.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `ecole-${Date.now()}`;
    try {
      const response = await publicApiClient.post('/register-school', {
        schoolName:     formData.schoolName,
        slug:           computedSlug,
        adminEmail:     formData.adminEmail,
        adminFirstName: formData.adminFirstName,
        adminLastName:  formData.adminLastName,
        adminPhone:     formData.adminPhone,
        primaryColor:   palette.primary,
      });
      setRegisteredOrg(response.data || {});
      setShowSuccessModal(true);
      toast.success('🎉 Inscription réussie !', { description: 'Votre dossier complet a été généré.' });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data;

      if (status === 500) {
        const pending = { ...formData, primaryColor: palette.primary, savedAt: new Date().toISOString() };
        localStorage.setItem('pending_school_registration', JSON.stringify(pending));
        const detail = typeof serverMessage === 'string' ? serverMessage.slice(0, 200) : 'Erreur interne serveur (500)';
        toast.warning('⚠️ Serveur indisponible — données sauvegardées localement', {
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


  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 transition-all duration-200";

  return (
    <div className="min-h-screen flex" style={{ background: `linear-gradient(135deg, ${palette.surfaceWarm} 0%, #f8fafc 50%, ${palette.primaryLight} 100%)` }}>

      {/* ── GAUCHE : Visuel Branding ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${palette.primary} 0%, ${palette.primaryDark} 60%, #0a0a0a 100%)` }}>

        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: palette.accent }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: palette.primaryLight }} />
        <div className="absolute top-1/3 right-8 w-40 h-40 rounded-full opacity-5" style={{ backgroundColor: '#fff' }} />

        {/* Logo plateforme */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-lg">S</div>
            <span className="text-white font-bold text-lg tracking-tight">SaaS École</span>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 space-y-8">
          {/* App preview */}
          <div className="max-w-xs mx-auto">
            <MiniAppPreview name={formData.schoolName} palette={palette} logo={logoPreview} />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Votre école,<br />
              <span style={{ color: palette.accent }}>vos couleurs.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Plateforme éducative 100% personnalisable. Votre branding s'applique instantanément à tous les profils — élèves, parents, professeurs.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[{ v: '500+', l: 'Écoles' }, { v: '50k+', l: 'Élèves' }, { v: '99.9%', l: 'Uptime' }].map(s => (
              <div key={s.l} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                <div className="text-white font-black text-lg">{s.v}</div>
                <div className="text-white/50 text-[10px]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2026 SaaS École — Plateforme éducative</p>
        </div>
      </div>

      {/* ── DROITE : Formulaire ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-12 xl:px-16 overflow-y-auto">

        {/* Steps indicator */}
        <div className="max-w-lg mx-auto w-full mb-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shadow-lg transition-all duration-500"
              style={{ backgroundColor: palette.primary }}>
              {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain p-0.5 rounded-xl" /> : <Icon icon="solar:buildings-3-bold-duotone" className="text-lg" />}
            </div>
            <span className="font-bold text-gray-800">SaaS École</span>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-6">
            {['Identité', 'Palette', 'Administrateur'].map((label, i) => {
              const s = i + 1;
              const active = step === s;
              const done = step > s;
              return (
                <React.Fragment key={s}>
                  <button type="button" onClick={() => setStep(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${active ? 'text-white shadow-md' : done ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                    style={active ? { backgroundColor: palette.primary } : done ? { backgroundColor: palette.accent } : {}}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${active || done ? 'bg-white/30' : 'bg-gray-200'}`}>
                      {done ? '✓' : s}
                    </span>
                    {label}
                  </button>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${done ? '' : 'bg-gray-200'}`}
                    style={done ? { backgroundColor: palette.accent } : {}} />}
                </React.Fragment>
              );
            })}
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {step === 1 && "Identité de l'école"}
            {step === 2 && "Votre identité visuelle"}
            {step === 3 && "Compte administrateur"}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {step === 1 && "Donnez un nom et une URL à votre établissement."}
            {step === 2 && "Choisissez votre palette ou laissez l'IA détecter les couleurs de votre logo."}
            {step === 3 && "Créez le compte du directeur ou du responsable."}
          </p>

          {planParam && (
            <div className="mb-6 p-4 rounded-2xl border bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border-purple-300/40 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center shrink-0 shadow-sm">
                  {planParam === 'premium' ? (
                    <Icon icon="solar:buildings-3-bold-duotone" className="text-2xl text-fuchsia-600" />
                  ) : planParam === 'enterprise' ? (
                    <Icon icon="solar:global-bold-duotone" className="text-2xl text-indigo-600" />
                  ) : (
                    <Icon icon="solar:school-bold-duotone" className="text-2xl text-cyan-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2 flex-wrap">
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
                  <p className="text-xs text-gray-600 mt-0.5">
                    {isTrial
                      ? 'Aucune carte bancaire requise. Accès immédiat à toutes les fonctionnalités.'
                      : 'Votre forfait sera configuré dès la validation de votre établissement.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/#pricing')}
                className="text-xs text-purple-600 font-semibold hover:underline shrink-0 ml-3"
              >
                Modifier
              </button>
            </div>
          )}
        </div>

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto w-full space-y-5">

          {/* STEP 1 : Identité */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom de l'établissement</label>
                <input name="schoolName" type="text" required value={formData.schoolName} onChange={handleChange}
                  placeholder="ex: Lycée Technique de Thiès"
                  className={inputClass}
                  style={{ '--tw-ring-color': palette.primary } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Identifiant Web (Slug)</label>
                <div className="flex rounded-xl shadow-sm overflow-hidden border border-gray-200 bg-white focus-within:ring-2 transition-all"
                  style={{ '--tw-ring-color': palette.primary } as React.CSSProperties}>
                  <span className="flex items-center px-3 bg-gray-50 text-gray-400 text-sm font-mono border-r border-gray-200">/t/</span>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleChange}
                    className="flex-1 px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none placeholder-gray-400"
                    placeholder="lycee-thies" />
                </div>
                {formData.slug && (
                  <p className="mt-1 text-xs text-gray-400">
                    URL : <span className="font-mono" style={{ color: palette.primary }}>votreapp.com/t/{formData.slug}</span>
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`, color: palette.textOnPrimary }}>
                Continuer → Choisir ma palette
              </button>
            </div>
          )}

          {/* STEP 2 : Palette */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Upload logo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Logo (Détection IA des couleurs)</label>
                <label className="relative flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary transition-all duration-200 bg-white group"
                  style={{ '--tw-border-color': palette.primary } as React.CSSProperties}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: palette.primaryLight }}>
                    {isExtracting ? (
                      <div className="w-7 h-7 border-3 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: palette.primary, borderTopColor: 'transparent', borderWidth: 3 }} />
                    ) : logoPreview ? (
                      <img src={logoPreview} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-2xl">🖼️</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors" style={{ '--tw-text-color': palette.primary } as React.CSSProperties}>
                      {isExtracting ? 'Analyse en cours...' : logoPreview ? 'Changer le logo' : 'Importer votre logo'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — L'IA détecte vos couleurs automatiquement</p>
                    {extractedColors.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {extractedColors.map((c, i) => (
                          <button key={i} type="button" title={`Appliquer ${c}`}
                            onClick={(e) => { e.preventDefault(); applyPalette(generatePaletteFromHex(c)); }}
                            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${palette.primary === c ? 'border-gray-800 scale-110' : 'border-white'}`}
                            style={{ backgroundColor: c }} />
                        ))}
                        <span className="text-[9px] text-gray-400 self-center ml-1">Cliquez pour appliquer</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
              </div>

              {/* Palettes prédéfinies */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Palettes prédéfinies</label>
                <div className="flex gap-4 flex-wrap">
                  {PREDEFINED_PALETTES.map(p => (
                    <Swatch key={p.name} palette={p.palette} label={p.name} active={activePreset === p.name}
                      onClick={() => applyPalette(p.palette, p.name)} />
                  ))}
                </div>
              </div>

              {/* Couleur personnalisée */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Couleur personnalisée</label>
                <div className="flex gap-2 items-center p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <input type="color" value={customHex}
                    onChange={e => { setCustomHex(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) { applyPalette(generatePaletteFromHex(e.target.value)); }}}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5" />
                  <input type="text" value={customHex} maxLength={7}
                    onChange={e => { setCustomHex(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) { applyPalette(generatePaletteFromHex(e.target.value)); }}}
                    className="flex-1 text-sm font-mono border-0 focus:outline-none text-gray-700 bg-transparent" />
                  {/* Aperçu palette générée */}
                  <div className="flex gap-1">
                    {[palette.primary, palette.accent, palette.primaryLight].map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  ← Retour
                </button>
                <button type="button" onClick={() => setStep(3)}
                  className="flex-[2] py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`, color: palette.textOnPrimary }}>
                  Parfait → Compte admin
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 : Admin */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prénom</label>
                  <input name="adminFirstName" type="text" required value={formData.adminFirstName} onChange={handleChange}
                    placeholder="Mamadou" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom</label>
                  <input name="adminLastName" type="text" required value={formData.adminLastName} onChange={handleChange}
                    placeholder="Diallo" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email administrateur</label>
                <input name="adminEmail" type="email" required value={formData.adminEmail} onChange={handleChange}
                  placeholder="directeur@monecole.sn" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Téléphone (optionnel)</label>
                <input name="adminPhone" type="tel" value={formData.adminPhone} onChange={handleChange}
                  placeholder="+221 77 000 00 00" className={inputClass} />
              </div>

              {/* Récap palette */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Récapitulatif palette choisie</p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[palette.primary, palette.accent, palette.primaryLight, palette.secondary].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{activePreset || 'Personnalisée'}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{palette.primary}</p>
                  </div>
                  <button type="button" onClick={() => setStep(2)}
                    className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
                    style={{ color: palette.primary, backgroundColor: palette.primaryLight }}>
                    Modifier
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  ← Retour
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-xl text-sm font-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                  style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`, color: palette.textOnPrimary }}>
                  {isLoading ? '⏳ Envoi...' : '🚀 Inscrire mon établissement'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Déjà inscrit ?{' '}
            <button type="button" onClick={() => navigate(ROUTES.login)}
              className="font-semibold hover:underline transition-all" style={{ color: palette.primary }}>
              Se connecter
            </button>
          </p>
        </form>
      </div>

      {/* ── MODAL RÉCAPITULATIF POUR LE DIRECTEUR ──────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden relative">
            {/* Header du modal */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                style={{ backgroundColor: palette.primary }}>
                🎓
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">
                  Félicitations, Directeur !
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Votre établissement est pré-configuré sur la plateforme SaaS.
                </p>
              </div>
            </div>

            {/* Carte Récapitulative */}
            <div className="rounded-2xl p-4 mb-5 border border-gray-150 space-y-3" style={{ backgroundColor: palette.surfaceWarm }}>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Établissement</span>
                <span className="text-xs font-black text-gray-900">{formData.schoolName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug / URL Dédiée</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-800">
                  /t/{formData.slug || registeredOrg?.slug || 'mon-ecole'}/login
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Directeur / Admin</span>
                <span className="text-xs font-bold text-gray-900">
                  {formData.adminFirstName} {formData.adminLastName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email de connexion</span>
                <span className="text-xs font-bold text-gray-900">{formData.adminEmail}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</span>
                <span className="text-xs font-bold text-gray-900">{formData.adminPhone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Identité Visuelle</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: palette.primary }} />
                  <span className="text-xs font-mono text-gray-700">{palette.primary}</span>
                </div>
              </div>
            </div>

            {/* Note d'accès */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl mb-6 flex items-start gap-2.5">
              <span className="text-base text-blue-600 mt-0.5">ℹ️</span>
              <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                Un compte administrateur a été généré. Dès validation par l'équipe Super-Admin, vous pourrez gérer vos cours, élèves, professeurs et finances depuis votre espace dédié.
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
                className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:opacity-90 active:scale-98"
                style={{ backgroundColor: palette.primary }}
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

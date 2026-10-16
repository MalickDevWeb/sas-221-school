import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Image, Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import { ThemeEditor } from '@/features/school-settings/ThemeEditor';
import { BrandingLogoSection } from '../components/branding/BrandingLogoSection';
import { BrandingBackgroundSection } from '../components/branding/BrandingBackgroundSection';

type Tab = 'colors' | 'logo' | 'background';

export const BrandingSettingsPage = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { originalSuperAdminRole, leaveSchoolAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('colors');

  const schoolName = currentTenant?.name || 'Mon Établissement';

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 pb-16 font-sans">
      {/* Top Bar Navigation */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-30 px-6 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(currentTenant?.slug ? `/t/${currentTenant.slug}/admin/dashboard` : '/admin/dashboard')}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              title="Retour au Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-900 tracking-tight">Personnalisation de la Marque</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {schoolName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Campus: /t/{currentTenant?.slug || 'slug'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {originalSuperAdminRole && (
              <button
                type="button"
                onClick={() => { leaveSchoolAdmin(); navigate('/super-admin/tenants'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950 text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-500/30 transition-all cursor-pointer shadow-xs"
              >
                <Shield size={13} className="text-amber-400" /> Quitter l'école (Retour Super Admin)
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(currentTenant?.slug ? `/t/${currentTenant.slug}/admin/dashboard` : '/admin/dashboard')}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Aller au Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'colors' ? 'bg-primary text-text-on-primary shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-neutral-100'
            }`}
          >
            <Palette size={15} /> 1. Couleurs & Thème (50 Palettes)
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logo' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-neutral-100'
            }`}
          >
            <Image size={15} /> 2. Logo de l'École
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'background' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-neutral-100'
            }`}
          >
            <Sparkles size={15} /> 3. Photo Background (Login)
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-5xl mx-auto px-6 pt-4">
        {activeTab === 'colors' && <ThemeEditor />}
        {activeTab === 'logo' && <BrandingLogoSection />}
        {activeTab === 'background' && <BrandingBackgroundSection />}
      </div>
    </div>
  );
};

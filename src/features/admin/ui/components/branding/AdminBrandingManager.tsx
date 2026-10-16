import React, { useState } from 'react';
import { Palette, Image, Sparkles, Building2 } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { ThemeEditor } from '@/features/school-settings/ThemeEditor';
import { BrandingLogoSection } from './BrandingLogoSection';
import { BrandingBackgroundSection } from './BrandingBackgroundSection';
import { BrandingIdentitySection } from './BrandingIdentitySection';

type Tab = 'colors' | 'logo' | 'background' | 'identity';

export function AdminBrandingManager() {
  const { currentTenant } = useTenantStore();
  const [activeTab, setActiveTab] = useState<Tab>('colors');
  const schoolName = currentTenant?.name || 'École 221';

  const tabs = [
    { id: 'colors' as const, label: '1. Couleurs & Thème', icon: Palette },
    { id: 'logo' as const, label: '2. Logo de l’École', icon: Image },
    { id: 'background' as const, label: '3. Photo d’Arrière-Plan', icon: Sparkles },
    { id: 'identity' as const, label: '4. Identité & Campus', icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs font-bold text-[#4A5568]" id="admin-branding-manager">
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Personnalisation & Identité de Marque</h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {schoolName}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-semibold mt-0.5">
            Configurez la charte graphique, le logo officiel, le fond d'écran du login et les coordonnées de l'établissement.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                isActive
                  ? 'bg-primary text-text-on-primary border-primary shadow-xs'
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-1">
        {activeTab === 'colors' && <ThemeEditor />}
        {activeTab === 'logo' && <BrandingLogoSection />}
        {activeTab === 'background' && <BrandingBackgroundSection />}
        {activeTab === 'identity' && <BrandingIdentitySection />}
      </div>
    </div>
  );
}


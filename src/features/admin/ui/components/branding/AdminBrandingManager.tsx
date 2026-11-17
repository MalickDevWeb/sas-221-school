import React, { useState } from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { ThemeEditor } from '@/features/school-settings/ThemeEditor';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu, type EntreeSousMenu } from '@/shared/components/SousMenuModule';
import { BrandingLogoSection } from './BrandingLogoSection';
import { BrandingBackgroundSection } from './BrandingBackgroundSection';
import { BrandingIdentitySection } from './BrandingIdentitySection';
import { BrandingAdresseSection } from './BrandingAdresseSection';

type Tab = 'colors' | 'logo' | 'background' | 'identity' | 'adresse';

/** Personnalisation : modèle commun des modules (sous-menu à gauche). */
const ENTREES: EntreeSousMenu[] = [
  { id: 'colors', libelle: '1. Couleurs & Thème', icone: 'palette' },
  { id: 'logo', libelle: '2. Logo de l’École', icone: 'image' },
  { id: 'background', libelle: '3. Photo d’Arrière-Plan', icone: 'wallpaper' },
  { id: 'identity', libelle: '4. Identité & Campus', icone: 'apartment' },
  { id: 'adresse', libelle: '5. Adresse de l’école', icone: 'language' },
];

export function AdminBrandingManager() {
  const { currentTenant } = useTenantStore();
  const [activeTab, setActiveTab] = useState<Tab>('colors');
  const [replie, basculerRepli] = useRepliSousMenu('personnalisation');
  const schoolName = currentTenant?.name || 'votre établissement';

  return (
    <div className="animate-fade-in text-xs font-bold text-[#4A5568]" id="admin-branding-manager">
      {/* Un seul titre par page : celui de la section affichée (« Couleurs de l'école », « Adresse de l'école »…) */}
      <ModuleAvecSousMenu
        id="admin-branding-root"
        sousMenu={
          <SousMenuModule id="branding-subsidebar" titre={`Personnalisation — ${schoolName}`} entrees={ENTREES} actif={activeTab}
            onChoisir={(id) => setActiveTab(id as Tab)} replie={replie} onBasculerRepli={basculerRepli} />
        }
      >
        {activeTab === 'colors' && <ThemeEditor />}
        {activeTab === 'logo' && <BrandingLogoSection />}
        {activeTab === 'background' && <BrandingBackgroundSection />}
        {activeTab === 'identity' && <BrandingIdentitySection />}
        {activeTab === 'adresse' && <BrandingAdresseSection />}
      </ModuleAvecSousMenu>
    </div>
  );
}

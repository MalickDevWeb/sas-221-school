import React, { useState } from 'react';
import { SettingsGeneralTab } from '../components/settings/SettingsGeneralTab';
import { SettingsSecurityTab } from '../components/settings/SettingsSecurityTab';
import { SettingsSystemTab } from '../components/settings/SettingsSystemTab';
import { ConservationJournalAudit } from '../components/settings/ConservationJournalAudit';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

type Section = 'general' | 'security' | 'system';

const SECTIONS: Record<Section, { titre: string; sousTitre: string }> = {
  general: { titre: 'Général', sousTitre: 'Nom de la plateforme, e-mail du support, langue et fuseau horaire.' },
  security: { titre: 'Sécurité', sousTitre: 'Conservation du journal d’audit et règles de connexion.' },
  system: { titre: 'Système', sousTitre: 'Mise en maintenance de la plateforme.' },
};

const ENTREES: EntreeSousMenu[] = [
  { id: 'general', libelle: 'Général', icone: 'tune' },
  { id: 'security', libelle: 'Sécurité', icone: 'shield', sousLibelle: 'Journal d’audit' },
  { id: 'system', libelle: 'Système', icone: 'dns' },
];

/** Réglages non stockés par le serveur : affichés désactivés, sans valeur, avec la raison. */
function NonDisponible({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] font-semibold">
        Pas encore disponible : ces réglages ne sont pas enregistrés par le serveur. Ils restent désactivés.
      </p>
      <fieldset disabled className="opacity-60 border-0 p-0 m-0 min-w-0">{children}</fieldset>
    </div>
  );
}

export const SuperAdminSettingsPage = () => {
  const [section, setSection] = useState<Section>('general');
  const [replie, basculer] = useRepliSousMenu('super-admin-parametres');
  // Aucun service serveur ne stocke ces paramètres : aucune valeur inventée, champs désactivés
  // (plus de faux « sauvegardé avec succès »). Seule la conservation du journal d'audit est réelle.
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [require2fa, setRequire2fa] = useState(false);
  const choisir = (id: string) => { if (id === 'general' || id === 'security' || id === 'system') setSection(id); };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <ModuleAvecSousMenu
        apparence="sombre"
        id="super-admin-parametres"
        idContenu="super-admin-parametres-contenu"
        titre={SECTIONS[section].titre}
        sousTitre={SECTIONS[section].sousTitre}
        sousMenu={(
          <SousMenuModule apparence="sombre" id="parametres-subsidebar" titre="Paramètres" entrees={ENTREES} actif={section}
            onChoisir={choisir} replie={replie} onBasculerRepli={basculer} />
        )}
      >
        {section === 'general' && (
          <NonDisponible>
            <SettingsGeneralTab platformName={platformName} setPlatformName={setPlatformName} supportEmail={supportEmail} setSupportEmail={setSupportEmail} />
          </NonDisponible>
        )}
        {section === 'security' && (
          <div className="space-y-8">
            <ConservationJournalAudit />
            <div className="pt-6 border-t border-white/10">
              <NonDisponible>
                <SettingsSecurityTab require2fa={require2fa} setRequire2fa={setRequire2fa} />
              </NonDisponible>
            </div>
          </div>
        )}
        {section === 'system' && (
          <NonDisponible>
            <SettingsSystemTab maintenanceMode={maintenanceMode} setMaintenanceMode={setMaintenanceMode} />
          </NonDisponible>
        )}
      </ModuleAvecSousMenu>
    </div>
  );
};

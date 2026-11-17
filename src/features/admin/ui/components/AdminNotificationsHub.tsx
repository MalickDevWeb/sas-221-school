import { useState } from 'react';
import { MassSendTab } from './notifications/MassSendTab';
import { EmergencyTab } from './notifications/EmergencyTab';
import { HistoryAnalyticsTab } from './notifications/HistoryAnalyticsTab';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu, type EntreeSousMenu } from '@/shared/components/SousMenuModule';
import { GroupesWhatsappTab } from './notifications/GroupesWhatsappTab';

type Section = 'mass-send' | 'emergency' | 'history' | 'whatsapp';

const EN_TETES: Record<Section, { titre: string; sousTitre: string }> = {
  'mass-send': { titre: 'Annonces', sousTitre: 'Écrire à toute l’école ou à un groupe : l’annonce arrive dans la cloche de leur espace.' },
  emergency: { titre: 'Alertes d’urgence', sousTitre: 'Prévenir immédiatement : l’alerte est mise en évidence dans la cloche des destinataires.' },
  history: { titre: 'Historique', sousTitre: 'Annonces et alertes envoyées, avec le nombre de personnes qui les ont reçues et lues.' },
  whatsapp: { titre: 'Groupes WhatsApp', sousTitre: 'Les groupes WhatsApp de l’école, pour y partager les annonces sans frais.' },
};

const ENTREES: EntreeSousMenu[] = [
  { id: 'mass-send', libelle: 'Annonces', icone: 'campaign', sousLibelle: 'Écrire une annonce' },
  { id: 'emergency', libelle: 'Alertes d’urgence', icone: 'emergency_home', sousLibelle: 'Consignes en cas d’urgence' },
  { id: 'history', libelle: 'Historique', icone: 'history', sousLibelle: 'Reçues et lues' },
  { id: 'whatsapp', libelle: 'Groupes WhatsApp', icone: 'forum', sousLibelle: 'Liens et partages' },
];

/** Annonces & alertes de l'école (modèle commun : sous-menu à gauche, un seul titre dans la carte de contenu). */
export function AdminNotificationsHub() {
  const [section, setSection] = useState<Section>('mass-send');
  const [replie, basculerRepli] = useRepliSousMenu('notifications');
  const choisir = (id: string) => { if (id === 'mass-send' || id === 'emergency' || id === 'history' || id === 'whatsapp') setSection(id); };

  return (
    <ModuleAvecSousMenu
      id="admin-notifications-hub-root"
      idContenu="notifications-contenu"
      titre={EN_TETES[section].titre}
      sousTitre={EN_TETES[section].sousTitre}
      sousMenu={(
        <SousMenuModule id="notifications-subsidebar" titre="Annonces & Alertes" entrees={ENTREES} actif={section}
          onChoisir={choisir} replie={replie} onBasculerRepli={basculerRepli} />
      )}
    >
      {section === 'mass-send' && <MassSendTab />}
      {section === 'emergency' && <EmergencyTab />}
      {section === 'history' && <HistoryAnalyticsTab onNouvelle={() => setSection('mass-send')} />}
      {section === 'whatsapp' && <GroupesWhatsappTab />}
    </ModuleAvecSousMenu>
  );
}

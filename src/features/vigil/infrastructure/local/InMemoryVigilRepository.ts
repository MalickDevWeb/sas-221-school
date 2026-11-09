import type { VigilProfile } from '../../domain/VigilProfile';
import type { VigilRepository } from '../../domain/VigilRepository';
import type { VigilScanResult } from '../../domain/VigilScan';

/**
 * Dépôt de DÉVELOPPEMENT uniquement (VITE_USE_MOCK=true). Jamais utilisé en production :
 * les données ci-dessous sont des valeurs de test explicitement neutres (aucune personne réelle).
 */
const DEV_VIGIL = {
  id: 'dev-vigil',
  nom: 'Test',
  prenom: 'Vigile',
  badgeId: 'DEV-VIGIL',
  equipe: '—',
  derniereConnexion: '—',
};

const DEV_SCAN = {
  badgeOwner: 'Badge de test',
  studentId: 'DEV-BADGE',
  message: 'Scan simulé (mode développement)',
  assiduite: '—',
  statutFrais: '—',
  zone: '—',
  time: '—',
};

export class InMemoryVigilRepository implements VigilRepository {
  private lastScan: VigilScanResult | null = {
    ...DEV_SCAN,
    statut: 'Autorisé',
  };

  async getProfile(): Promise<VigilProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      ...DEV_VIGIL,
      statut: 'Opérationnel',
    };
  }

  async scanBadge(badgeId: string): Promise<VigilScanResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.lastScan = {
      ...DEV_SCAN,
      studentId: badgeId,
      statut: 'Autorisé',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    return this.lastScan;
  }

  async getLastScan(): Promise<VigilScanResult | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.lastScan;
  }
}

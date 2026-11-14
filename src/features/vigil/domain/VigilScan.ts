export interface VigilScanResult {
  badgeOwner: string;
  studentId: string;
  statut: 'Autorisé' | 'Refusé';
  message: string;
  assiduite: string;
  zone: string;
  time: string;
}

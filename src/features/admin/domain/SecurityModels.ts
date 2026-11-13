export interface AuditLog {
  id: string;
  time: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ip: string;
  agent: string;
}

export interface AccessTerminal {
  id: string;
  name: string;
  status: 'Actif' | 'Inactif' | 'Révoqué';
  location: string;
  /** Vigile affecté (ses scans sont refusés si le terminal est inactif ou révoqué). */
  vigilId?: string | null;
  vigilName?: string | null;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-001', time: '2026-07-10 09:12', user: 'Marie Sow', role: 'Secrétaire', action: 'Validation Inscription', details: 'A validé l\'inscription de l\'élève Nafissatou Diallo', ip: '196.207.240.12', agent: 'Chrome / Linux' },
  { id: 'log-002', time: '2026-07-10 08:45', user: 'Khadim Diallo', role: 'Enseignant', action: 'Modification Notes', details: 'A édité les notes d\'examen de L2 Génie Civil', ip: '196.207.240.15', agent: 'Safari / macOS' },
  { id: 'log-003', time: '2026-07-10 07:30', user: 'Ibrahima Faye', role: 'Comptable', action: 'Encaissement Dépense', details: 'A enregistré une dépense de 350,000 FCFA pour Senelec', ip: '196.207.240.18', agent: 'Chrome / Windows' },
];


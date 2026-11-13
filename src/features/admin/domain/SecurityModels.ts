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

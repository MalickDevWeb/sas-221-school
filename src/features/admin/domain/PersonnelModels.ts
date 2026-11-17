/** Collaborateur tel que renvoyé par GET /admin/staff. */
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Clé de rôle serveur (ex. SECRETAIRE) ; à l'envoi, le libellé français est aussi accepté. */
  role: string;
  /** Libellé français du rôle renvoyé par le serveur (à afficher). */
  roleLabel?: string;
  matricule?: string | null;
  status: 'Actif' | 'Suspendu';
}

/** Pointage du personnel (GET/POST/PUT /admin/attendance, persisté côté serveur). */
export interface AttendanceRecord {
  id: string;
  userId?: string | null;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  hours: number | null;
  status: 'À l\'heure' | 'En retard' | 'Absent' | string;
  note?: string | null;
  date?: string | null;
}

/** Libellés de rôles acceptés par POST/PUT /admin/staff. */
export const STAFF_ROLES = ['Administrateur', 'Directeur', 'Secrétaire', 'Comptable', 'Enseignant', 'Surveillant', 'Vigile', 'Ressources humaines'];

/** Libellé affichable d'un collaborateur (jamais la clé technique si le libellé est connu). */
export const libelleRole = (m: { role?: string | null; roleLabel?: string | null }) => m.roleLabel || m.role || '—';

// Catalogue des droits : fourni par le serveur (GET /admin/rbac), voir core/store/rbacStore.ts.


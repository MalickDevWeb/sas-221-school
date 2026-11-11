export interface Student {
  id: string;
  matricule: string;
  name: string;
  email: string;
  /** Classe réelle de l'élève (table inscriptions_classes) ; '' si non affecté. */
  classe: string;
  /** Identifiant de la classe (sert au filtrage par classe) ; '' si non affecté. */
  classeId?: string;
  financialStatus: 'En Règle' | 'En Retard' | 'Non renseigné';   // « Non renseigné » : aucune donnée (jamais supposé en règle)
  qrStatus: 'AUTORISÉ' | 'SUSPENDU';
  /** Statut d'appartenance à l'école renvoyé par le serveur. */
  status?: 'Actif' | 'Suspendu';
  avatar?: string;
  /** Moyenne : aucune source serveur pour l'instant → '—' (jamais inventée). */
  gpa: string;
  /** Téléphone de l'élève (champ « telephone » du serveur) ; '' si non renseigné. */
  phoneParent: string;
}

export interface StudentDoc {
  name: string;
  size: string;
}

/** Fiche élève renvoyée par GET/POST /admin/students : uniquement des champs réels. */
export function mapStudentFromApi(s: any, idx = 0): Student {
  const frais = s?.statutFrais ?? s?.financialStatus ?? null;
  return {
    id: String(s?.id ?? `s-${idx + 1}`),
    matricule: s?.matricule || '',
    name: s?.name || `${s?.prenom || ''} ${s?.nom || ''}`.trim() || s?.email || '',
    email: s?.email || '',
    classe: s?.classe || '',
    classeId: s?.classeId || '',
    financialStatus: frais === 'En Retard' ? 'En Retard' : frais === 'En Règle' ? 'En Règle' : 'Non renseigné',
    qrStatus: s?.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ',
    status: s?.status === 'Suspendu' ? 'Suspendu' : s?.status === 'Actif' ? 'Actif' : undefined,
    avatar: s?.avatar || s?.photoUrl || undefined,
    gpa: '—',
    phoneParent: s?.telephone || '',
  };
}

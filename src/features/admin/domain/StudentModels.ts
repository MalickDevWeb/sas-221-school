import { objetBrut, texte, texteOuNull } from '@/shared/lib/lectureServeur';
export interface Student {
  id: string;
  matricule: string;
  name: string;
  email: string;
  /** Classe réelle de l'élève (table inscriptions_classes) ; '' si non affecté. */
  classe: string;
  /** Identifiant de la classe (sert au filtrage par classe) ; '' si non affecté. */
  classeId?: string;
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

/** Fiche élève renvoyée par GET/POST /admin/students : uniquement des champs réels. APP-TL-22 (2026-11-14) : aucune
 *  donnée financière (l'état financier reste dans Finances › Écolages, sous la permission finances.lire). */
export function mapStudentFromApi(raw: unknown, idx = 0): Student {
  const s = objetBrut(raw);
  return {
    id: texte(s.id) || `s-${idx + 1}`,
    matricule: texte(s.matricule),
    name: texteOuNull(s.name) ?? (`${texte(s.prenom)} ${texte(s.nom)}`.trim() || texte(s.email)),
    email: texte(s.email),
    classe: texte(s.classe),
    classeId: texte(s.classeId),
    qrStatus: s.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ',
    status: s.status === 'Suspendu' ? 'Suspendu' : s.status === 'Actif' ? 'Actif' : undefined,
    avatar: texteOuNull(s.avatar ?? s.photoUrl) ?? undefined,
    gpa: '—',
    phoneParent: texte(s.telephone),
  };
}

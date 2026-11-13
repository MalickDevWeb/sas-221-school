export const ROLE_UTILISATEUR = {
  ETUDIANT:    'ETUDIANT',
  STUDENT:     'STUDENT',
  PROFESSEUR:  'PROFESSEUR',
  TEACHER:     'TEACHER',
  ADMIN:       'ADMIN',
  ADMINISTRATOR: 'ADMINISTRATOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
  PLATFORM_OWNER: 'PLATFORM_OWNER',
  SECRETAIRE:  'SECRETAIRE',
  COMPTABLE:   'COMPTABLE',
  VIGIL:       'VIGIL',
  VISITEUR:    'VISITEUR',
  PARENT:      'PARENT',
  // Personnel de l'école (2026-11-13) : espace administration filtré par la matrice des droits du serveur
  DIRECTEUR:   'DIRECTEUR',
  SURVEILLANT: 'SURVEILLANT',
  RH:          'RH',
} as const;

/** Rôles du personnel : espace administration, menus et routes selon les droits accordés par l'école. */
export const ROLES_PERSONNEL: readonly string[] = ['DIRECTEUR', 'SECRETAIRE', 'COMPTABLE', 'SURVEILLANT', 'RH'];

export type RoleUtilisateur = typeof ROLE_UTILISATEUR[keyof typeof ROLE_UTILISATEUR];


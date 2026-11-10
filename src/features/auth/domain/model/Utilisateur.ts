import type { RoleUtilisateur } from '@/shared/constants';

export interface Utilisateur {
  readonly id: string;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly role: RoleUtilisateur;
  readonly tenantSlug?: string;
  /** Compte créé avec un mot de passe provisoire : à remplacer avant tout accès (403 MOT_DE_PASSE_PROVISOIRE). */
  readonly doitChangerMotDePasse?: boolean;
}

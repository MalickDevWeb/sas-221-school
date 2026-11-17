import { apiClient } from '@/shared/lib/apiClient';
import type { StaffMember } from '../../../../domain/PersonnelModels';
import type { NouveauCollaborateur, ResultatCreation } from './AddStaffCard';

/**
 * POST /admin/staff : création réelle d'un compte du personnel (Gestion Personnel et planning, 16/11).
 * Une erreur du serveur est levée telle quelle (le formulaire l'affiche sous le champ concerné) ;
 * `null` si la réponse n'a pas d'identifiant. Le mot de passe provisoire n'est renvoyé qu'une fois.
 */
export async function creerCompteCollaborateur(membre: NouveauCollaborateur): Promise<ResultatCreation | null> {
  const res = await apiClient.post('/admin/staff', membre);
  const { motDePasseProvisoire, ...cree } = res.data ?? {};
  if (!cree?.id) return null;
  return { member: cree as StaffMember, motDePasseProvisoire: (motDePasseProvisoire as string | undefined) ?? null };
}

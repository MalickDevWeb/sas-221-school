import { ROLE_UTILISATEUR } from '@/shared/constants';
import type { Utilisateur } from '../../domain/model/Utilisateur';

export const UTILISATEURS_SIMULES: {
  email: string;
  motDePasse: string;
  utilisateur: Utilisateur;
  token: string;
}[] = [
  { email: 'admin@ecole221.sn', motDePasse: 'passer', utilisateur: { id: 'usr-admin-01', nom: 'Sylla', prenom: 'Admin', email: 'admin@ecole221.sn', role: ROLE_UTILISATEUR.ADMIN }, token: 'fake-jwt-token-admin-12345' },
  { email: 'etudiant221@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-etudiant-01', nom: 'Diop', prenom: 'Assane', email: 'etudiant221@gmail.com', role: ROLE_UTILISATEUR.ETUDIANT }, token: 'fake-jwt-token-etudiant-221' },
  { email: 'etudiant222@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-etudiant-02', nom: 'Sow', prenom: 'Fatou', email: 'etudiant222@gmail.com', role: ROLE_UTILISATEUR.ETUDIANT }, token: 'fake-jwt-token-etudiant-222' },
  { email: 'etudiant223@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-etudiant-03', nom: 'Ndiaye', prenom: 'Malick', email: 'etudiant223@gmail.com', role: ROLE_UTILISATEUR.ETUDIANT }, token: 'fake-jwt-token-etudiant-223' },
  { email: 'admin221@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-admin-02', nom: 'Ba', prenom: 'Mariama', email: 'admin221@gmail.com', role: ROLE_UTILISATEUR.ADMIN }, token: 'fake-jwt-token-admin-221' },
  { email: 'admin222@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-admin-03', nom: 'Diallo', prenom: 'Ibrahima', email: 'admin222@gmail.com', role: ROLE_UTILISATEUR.ADMIN }, token: 'fake-jwt-token-admin-222' },
  { email: 'professeur221@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-prof-01', nom: 'Cheikh Anta', prenom: 'Dr.', email: 'professeur221@gmail.com', role: ROLE_UTILISATEUR.PROFESSEUR }, token: 'fake-jwt-token-prof-221' },
  { email: 'professeur222@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-prof-02', nom: 'Seynabou', prenom: 'Mme.', email: 'professeur222@gmail.com', role: ROLE_UTILISATEUR.PROFESSEUR }, token: 'fake-jwt-token-prof-222' },
  { email: 'surv221@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-surv-01', nom: 'Sene', prenom: 'Ousmane', email: 'surv221@gmail.com', role: ROLE_UTILISATEUR.SECRETAIRE }, token: 'fake-jwt-token-surv-221' },
  { email: 'surv222@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-surv-02', nom: 'Ndiaye', prenom: 'Awa', email: 'surv222@gmail.com', role: ROLE_UTILISATEUR.SECRETAIRE }, token: 'fake-jwt-token-surv-222' },
  { email: 'vigile221@gmail.com', motDePasse: 'ecole221', utilisateur: { id: 'usr-vigil-01', nom: 'Diallo', prenom: 'Aboulaye', email: 'vigile221@gmail.com', role: ROLE_UTILISATEUR.VIGIL }, token: 'fake-jwt-token-vigil-221' },
  { email: 'superadmin@gmail.com', motDePasse: 'superadmin123', utilisateur: { id: 'usr-superadmin-01', nom: 'Admin', prenom: 'Super', email: 'superadmin@gmail.com', role: ROLE_UTILISATEUR.SUPER_ADMIN }, token: 'fake-jwt-token-superadmin-123' },
];

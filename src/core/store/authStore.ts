import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleUtilisateur } from '@/shared/constants';

export interface UtilisateurConnecte {
  id: string;
  nom: string;
  prenom?: string;
  role: RoleUtilisateur;
  email?: string;
  /** Mot de passe provisoire (donné par l'administration) à remplacer avant d'accéder à son espace. */
  doitChangerMotDePasse?: boolean;
}

interface AuthState {
  utilisateur: UtilisateurConnecte | null;
  token: string | null;
  estConnecte: boolean;
  originalSuperAdminRole: RoleUtilisateur | null;
  connexionReussie: (payload: { utilisateur: UtilisateurConnecte; token: string }) => void;
  /** Fixe l'obligation de changer le mot de passe provisoire (connexion, réponse 403 du serveur, changement réussi). */
  marquerMotDePasseProvisoire: (doitChanger: boolean) => void;
  impersonateSchoolAdmin: () => void;
  leaveSchoolAdmin: () => void;
  deconnexion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      utilisateur: null,
      token: null,
      estConnecte: false,
      originalSuperAdminRole: null,

      connexionReussie: (payload) => {
        const user = { ...payload.utilisateur };
        if (user && user.role && typeof user.role === 'object' && (user.role as any).value) {
          user.role = (user.role as any).value;
        }
        set({
          utilisateur: user,
          token: payload.token,
          estConnecte: true,
          originalSuperAdminRole: null,
        });
      },

      marquerMotDePasseProvisoire: (doitChanger) => {
        const current = get().utilisateur;
        if (!current || !!current.doitChangerMotDePasse === doitChanger) return;
        set({ utilisateur: { ...current, doitChangerMotDePasse: doitChanger } });
      },

      impersonateSchoolAdmin: () => {
        const current = get().utilisateur;
        if (!current) return;
        const savedOriginal = get().originalSuperAdminRole || current.role;
        set({
          originalSuperAdminRole: savedOriginal,
        });
      },

      leaveSchoolAdmin: () => {
        set({
          originalSuperAdminRole: null,
        });
      },

      deconnexion: () => {
        localStorage.removeItem('access_token');
        set({
          utilisateur: null,
          token: null,
          estConnecte: false,
          originalSuperAdminRole: null,
        });
      },
    }),
    {
      name: 'ecole-221-auth-storage',
    }
  )
);

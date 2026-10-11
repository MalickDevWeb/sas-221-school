import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleUtilisateur } from '@/shared/constants';

interface AuthState {
  utilisateur: { id: string; nom: string; role: RoleUtilisateur; email?: string } | null;
  token: string | null;
  estConnecte: boolean;
  connexionReussie: (payload: { utilisateur: { id: string; nom: string; role: RoleUtilisateur; email?: string }; token: string }) => void;
  deconnexion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      utilisateur: null,
      token: null,
      estConnecte: false,

      connexionReussie: (payload) => {
        const user = { ...payload.utilisateur };
        if (user && user.role && typeof user.role === 'object' && (user.role as any).value) {
          user.role = (user.role as any).value;
        }
        set({
          utilisateur: user,
          token: payload.token,
          estConnecte: true,
        });
      },
      deconnexion: () => {
        localStorage.removeItem('access_token');
        set({
          utilisateur: null,
          token: null,
          estConnecte: false,
        });
      },
    }),
    {
      name: 'ecole-221-auth-storage',
    }
  )
);

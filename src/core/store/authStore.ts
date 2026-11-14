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
        // rôle parfois reçu sous la forme { value: 'ADMIN' } (énumération sérialisée)
        const role: unknown = user.role;
        if (role && typeof role === 'object' && 'value' in role && typeof role.value === 'string') {
          user.role = role.value as RoleUtilisateur;
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
        // Déconnexion réelle (2026-11-13) : avant, aucun bouton n'appelait le serveur et le jeton restait dans le
        // navigateur (auth_token) comme dans le cookie HttpOnly → la session restait ouverte pour la personne suivante
        // sur un poste partagé. Le serveur révoque le jeton et efface le cookie ; le navigateur oublie le jeton.
        let jeton: string | null = null;
        try { jeton = localStorage.getItem('auth_token') || localStorage.getItem('access_token'); } catch { /* stockage indisponible */ }
        try {
          void fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            keepalive: true,
            headers: jeton ? { Authorization: `Bearer ${jeton}` } : {},
          }).catch(() => { /* hors ligne : le jeton expirera de lui-même */ });
        } catch { /* fetch indisponible */ }
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('auth_token');
          // Cache hors ligne des réponses (notes, profil, badge…) : commun à tous les comptes de ce navigateur, il
          // est vidé pour que la personne suivante sur un poste partagé ne lise pas les données de la précédente.
          Object.keys(localStorage)
            .filter((k) => k.startsWith('off_cache_') || k.startsWith('mon_ecole_ai_tutor_sessions_') || k === 'student_notifications' || k === 'v_scan_logs' || k === 'v_checkpoints')
            .forEach((k) => localStorage.removeItem(k));
        } catch { /* stockage indisponible */ }
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

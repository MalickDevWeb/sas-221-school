import { useState } from 'react';
import { loginUseCase } from '../infrastructure/config/dependencies';
import type { LoginCommand } from '../usecases/LoginCommand';
import { useAuthStore } from '@/core/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES, ROLE_UTILISATEUR } from '@/shared/constants';

type EtatRequete = 'IDLE' | 'CHARGEMENT' | 'SUCCES' | 'ERREUR';

export function useLogin() {
  const [etat, setEtat] = useState<EtatRequete>('IDLE');
  const [erreur, setErreur] = useState<string | null>(null);
  
  const { connexionReussie } = useAuthStore();
  const navigate = useNavigate();

  const executer = async (cmd: LoginCommand) => {
    setEtat('CHARGEMENT');
    setErreur(null);
    try {
      const { utilisateur, token } = await loginUseCase(cmd);
      
      // Mettre à jour l'état global
      connexionReussie({ utilisateur, token });
      
      // Stocker le token
      localStorage.setItem('access_token', token);
      
      setEtat('SUCCES');
      
      // Laisser l'animation de succès se jouer pour un feedback utilisateur optimal
      await new Promise((resolve) => setTimeout(resolve, 750));
      
      // Redirection sécurisée : si connecté depuis le portail /admin, aller directement sur l'espace école
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/admin/dashboard')) {
        navigate(ROUTES.admin.dashboard);
      } else if (utilisateur.role === ROLE_UTILISATEUR.SUPER_ADMIN || utilisateur.role === ROLE_UTILISATEUR.PLATFORM_OWNER) {
        navigate('/super-admin/dashboard');
      } else if (utilisateur.role === ROLE_UTILISATEUR.ADMIN || utilisateur.role === ROLE_UTILISATEUR.ADMINISTRATOR) {
        navigate(ROUTES.admin.dashboard);
      } else if (utilisateur.role === ROLE_UTILISATEUR.VIGIL) {
        navigate(ROUTES.vigil.dashboard);
      } else if (utilisateur.role === ROLE_UTILISATEUR.PROFESSEUR) {
        navigate(ROUTES.professor.dashboard);
      } else {
        navigate(ROUTES.dashboard);
      }
      
    } catch (e: any) {
      setEtat('ERREUR');

      // 1. Message direct du serveur via Axios (500 ou 4xx avec body JSON)
      const serverMsg =
        e?.response?.data?.message
        ?? e?.response?.data?.reason
        ?? null;

      if (serverMsg) {
        setErreur(serverMsg);
      } else if (e?.name === 'IdentifiantsInvalidesError' || e?.message?.includes('incorrect') || e?.message?.includes('mot de passe') || e?.message?.includes('Email')) {
        // 2. IdentifiantsInvalidesError — erreur 401 wrappée par ApiAuthRepository
        setErreur('Email ou mot de passe incorrect.');
      } else if (e?.response?.status === 401) {
        setErreur('Email ou mot de passe incorrect.');
      } else if (e?.response?.status === 403) {
        setErreur('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      } else if (!e?.response) {
        // 3. Erreur réseau (backend éteint)
        setErreur('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
      } else {
        setErreur('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  return { etat, erreur, executer };
}

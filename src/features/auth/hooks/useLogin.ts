import { useState } from 'react';
import { isAxiosError } from 'axios';
import { loginUseCase } from '../infrastructure/config/dependencies';
import type { LoginCommand } from '../usecases/LoginCommand';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';
import { useRbacStore } from '@/core/store/rbacStore';
import { slugDuChemin, slugEcoleCourante } from '@/shared/lib/hoteEcole';
import { useNavigate } from 'react-router-dom';
import { ROLE_UTILISATEUR } from '@/shared/constants';
import { estObjet, texteOuNull } from '@/shared/lib/lectureServeur';
import { cheminEspace, espaceDuRole, slugEcoleActive } from '@/core/router/destinationEspace';
import { prechargerEspace } from '@/core/router/prechargementEspaces';
import { prechargerEspacePresume } from './prechargementConnexion';

type EtatRequete = 'IDLE' | 'CHARGEMENT' | 'SUCCES' | 'ERREUR';

/** Message affiché quand la connexion échoue (sans `any`). */
function messageErreur(e: unknown): string {
  const reponse = isAxiosError(e) ? e.response : undefined;
  // 1. Message direct du serveur (500 ou 4xx avec corps JSON)
  const donnees: unknown = reponse?.data;
  const corps = estObjet(donnees) ? donnees : null;
  const messageServeur = texteOuNull(corps?.message) ?? texteOuNull(corps?.reason);
  if (messageServeur) return messageServeur;
  // 2. IdentifiantsInvalidesError — erreur 401 transformée par ApiAuthRepository
  const nom = e instanceof Error ? e.name : '';
  const message = e instanceof Error ? e.message : '';
  if (nom === 'IdentifiantsInvalidesError' || message.includes('incorrect') || message.includes('mot de passe') || message.includes('Email')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (reponse?.status === 401) return 'Email ou mot de passe incorrect.';
  if (reponse?.status === 403) return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
  // 3. Erreur réseau (backend éteint)
  if (!reponse) return 'Impossible de joindre le serveur. Vérifiez que le backend est démarré.';
  return 'Une erreur est survenue. Veuillez réessayer.';
}

export function useLogin() {
  const [etat, setEtat] = useState<EtatRequete>('IDLE');
  const [erreur, setErreur] = useState<string | null>(null);

  const { connexionReussie } = useAuthStore();
  const navigate = useNavigate();

  const executer = async (cmd: LoginCommand) => {
    setEtat('CHARGEMENT');
    setErreur(null);
    // Code de l'espace probable téléchargé PENDANT la vérification du mot de passe (matricule → élève,
    // compte déjà connecté sur cet appareil → son espace) ; rien n'est téléchargé à l'aveugle
    prechargerEspacePresume(cmd.email);
    try {
      const { utilisateur, token } = await loginUseCase(cmd);
      // Espace réel connu : son code est demandé tout de suite, pendant la suite de la connexion
      prechargerEspace(espaceDuRole(utilisateur.role));

      // Synchroniser le token d'authentification
      connexionReussie({ utilisateur, token });
      localStorage.setItem('access_token', token);
      localStorage.setItem('auth_token', token);

      // Synchronisation automatique de l'école et de sa palette selon le tenant ou l'identifiant
      const currentUrlMatch = window.location.pathname.match(/\/t\/([^/]+)/);
      const urlSlug = currentUrlMatch ? currentUrlMatch[1] : null;
      const emailParts = (utilisateur.email || cmd.email).toLowerCase().split('@');
      const emailSlug = (emailParts.length === 2 && emailParts[1].endsWith('.sn'))
        ? emailParts[1].replace(/\.sn$/, '').trim()
        : null;

      const targetSlug = utilisateur.tenantSlug
        || urlSlug
        || emailSlug
        || useTenantStore.getState().currentTenant?.slug
        || 'ecole221';

      if (targetSlug) {
        try {
          // Sans appel au serveur quand l'école de la page de connexion est déjà résolue (cas courant)
          await useTenantStore.getState().resolveTenant(targetSlug);
        } catch { /* école introuvable : l'écran de connexion affiche lui-même l'erreur de résolution */ }
      }

      setEtat('SUCCES');

      // Aucune attente « pour l'animation de succès » (la confirmation reste visible sans retarder l'ouverture), et
      // ouverture DIRECTE de l'espace : passer par /admin/dashboard puis rediriger vers /t/<école>/admin/dashboard
      // laisserait une page blanche pendant le téléchargement du code de l'espace.
      const pathname = window.location.pathname;
      const depuisPortailDirection = pathname.startsWith('/admin') && !pathname.startsWith('/admin/dashboard');
      const destination = cheminEspace(depuisPortailDirection ? ROLE_UTILISATEUR.ADMIN : utilisateur.role, slugEcoleActive());
      // Droits du compte (menu, indicateurs financiers) demandés pendant le téléchargement du code de l'espace, au lieu
      // d'attendre son affichage ; seulement si les appels visent déjà l'école de l'espace (repris ensuite par la
      // barre latérale, sans second appel)
      if (destination && espaceDuRole(utilisateur.role) === 'administration' && !utilisateur.doitChangerMotDePasse
          && slugEcoleCourante() === slugDuChemin(destination)) {
        void useRbacStore.getState().chargerMesDroits();
      }
      // Rôle sans espace (secrétaire sans droits, visiteur…) : page explicite, comme la redirection /dashboard
      navigate(destination ?? '/espace-indisponible');

    } catch (e: unknown) {
      setEtat('ERREUR');
      setErreur(messageErreur(e));
    }
  };

  return { etat, erreur, executer };
}

import React from 'react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';
import { FormulaireMotDePasse } from '../components/FormulaireMotDePasse';

/**
 * Première connexion d'un compte créé par l'administration : le serveur refuse toute route métier
 * (403 MOT_DE_PASSE_PROVISOIRE) tant que le mot de passe provisoire n'est pas remplacé. Cet écran
 * remplace l'espace de l'utilisateur jusqu'au changement.
 */
export function ChangementMotDePasseObligatoire() {
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const nomAffiche = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(' ');

  const seDeconnecter = () => {
    const slug = window.location.pathname.match(/^\/t\/([^/]+)/)?.[1];
    useAuthStore.getState().deconnexion();
    try { localStorage.removeItem('auth_token'); } catch { /* stockage indisponible */ }
    window.location.href = slug ? `/t/${slug}/login` : ROUTES.login;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2DCDA] shadow-sm p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon icon="solar:shield-keyhole-bold-duotone" className="text-2xl" />
          </div>
          <h1 className="text-xl font-black text-[#291715]">Choisissez votre mot de passe</h1>
          <p className="text-sm text-[#6B5856]">
            {nomAffiche ? <>Bienvenue {nomAffiche}. </> : null}
            Votre compte a été créé avec un mot de passe provisoire. Remplacez-le par un mot de passe
            personnel pour accéder à votre espace.
          </p>
        </div>

        <FormulaireMotDePasse
          libelleAncien="Mot de passe provisoire"
          aideAncien="Celui que votre établissement vous a communiqué."
          messageAncienVide="Saisissez le mot de passe provisoire reçu de votre établissement."
          texteBouton="Enregistrer mon mot de passe"
          // Rechargement : les écrans dont les requêtes ont été refusées (403) repartent de zéro
          onSucces={() => window.location.reload()}
        />

        <button type="button" onClick={seDeconnecter} className="w-full text-xs font-semibold text-[#6B5856] hover:text-[#291715] cursor-pointer">
          Se déconnecter
        </button>
      </div>
    </main>
  );
}

export default ChangementMotDePasseObligatoire;

import React from 'react';

/**
 * « Mot de passe oublié ».
 * Avant : un champ email puis, après 1,2 s d'attente simulée et sans aucun appel au serveur, l'écran
 * « Lien envoyé — instructions de réinitialisation envoyées à … ». Aucun email n'était jamais envoyé.
 * Tant qu'aucune réinitialisation en ligne n'existe côté serveur, on dit la vérité et la démarche à suivre.
 */
export function ForgotPasswordForm({ onRetour }: { onRetour: () => void }) {
  return (
    <div className="space-y-3.5 md:space-y-4 animate-fade-in" id="mot-de-passe-oublie">
      <div role="status" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1.5">
        <p className="font-black">La réinitialisation en ligne n'est pas encore disponible.</p>
        <p>
          Contactez l'administration de votre école : après vérification de votre identité, elle vous remettra un
          mot de passe provisoire, à changer dès votre prochaine connexion.
        </p>
      </div>
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onRetour}
          className="flex items-center gap-1 text-[11px] font-bold text-[#8E7977] hover:text-primary transition-colors cursor-pointer"
        >
          <span translate="no" className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Retour à la connexion</span>
        </button>
      </div>
    </div>
  );
}

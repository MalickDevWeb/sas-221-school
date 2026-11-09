import React from 'react';
import { toast } from 'sonner';

interface Props {
  /** Nom du compte créé (affiché pour savoir à qui transmettre le mot de passe). */
  nom: string;
  /** Identifiant de connexion (e-mail) du compte créé. */
  identifiant?: string | null;
  /** Mot de passe provisoire renvoyé UNE SEULE FOIS par le serveur (jamais journalisé). */
  motDePasse: string;
  onClose: () => void;
}

/**
 * Affichage unique du mot de passe provisoire généré par le serveur à la création d'un compte.
 * Le mot de passe n'est conservé nulle part : à la fermeture, il n'est plus récupérable.
 */
export function MotDePasseProvisoireModal({ nom, identifiant, motDePasse, onClose }: Props) {
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(motDePasse);
      toast.success('Mot de passe provisoire copié dans le presse-papiers.');
    } catch {
      toast.error('Copie impossible : sélectionnez le mot de passe et copiez-le manuellement.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="mdp-provisoire-titre">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 w-full max-w-md space-y-4">
        <h3 id="mdp-provisoire-titre" className="font-extrabold text-[#1E293B] text-sm flex items-center gap-2 border-b border-neutral-100 pb-2">
          <span translate="no" className="material-symbols-outlined text-amber-500 text-lg">key</span>
          Compte créé : {nom}
        </h3>
        {identifiant && (
          <p className="text-xs text-neutral-600 font-semibold m-0">
            Identifiant de connexion : <span className="font-mono text-[#1E293B]">{identifiant}</span>
          </p>
        )}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <p className="text-xs font-bold text-amber-900 m-0">Mot de passe provisoire à transmettre :</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg font-mono text-sm text-[#1E293B] select-all break-all">
              {motDePasse}
            </code>
            <button
              type="button"
              onClick={copier}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black border-0 cursor-pointer flex items-center gap-1"
            >
              <span translate="no" className="material-symbols-outlined text-sm">content_copy</span>
              Copier
            </button>
          </div>
          <p className="text-[11px] text-amber-800 font-semibold m-0">
            Il ne sera plus affiché après la fermeture de cette fenêtre.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white text-xs font-black rounded-xl shadow hover:bg-[#921316] transition-all border-0 cursor-pointer"
          >
            J'ai transmis le mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}

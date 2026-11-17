import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { cheminEspace, espaceDuRole, slugEcoleActive, type Espace } from '@/core/router/destinationEspace';
import { jetonSession } from '@/shared/lib/entetesApi';
import { queryClient } from '@/shared/lib/queryClient';

/*
 * 16/11 : un navigateur ne garde qu'UNE connexion (jeton « auth_token » commun à tous ses onglets). Avant : se
 * connecter avec un autre compte dans un onglet laissait les autres onglets sur l'espace précédent, mais avec le jeton
 * du nouveau compte → « Demande refusée : votre rôle ne permet pas d'accéder à cette fonctionnalité », « Impossible de
 * charger la liste de vos enfants », « Accès refusé » (reproduit : parent dans un onglet, administrateur dans l'autre).
 * Désormais l'onglet reprend la session du navigateur, oublie les données de l'ancien compte et l'explique, avec un
 * bouton vers l'espace du compte connecté ; une déconnexion dans un autre onglet mène à la page de connexion.
 */

const CLES_SESSION = new Set(['auth_token', 'access_token', 'ecole-221-auth-storage']);

const LIBELLE_ESPACE: Record<Espace, string> = {
  plateforme: 'plateforme', administration: 'administration', vigile: 'vigile',
  professeur: 'enseignant', parent: 'parent', eleve: 'élève',
};

type Changement = { type: 'autre_compte'; nom: string; espace: string; chemin: string } | { type: 'deconnexion'; chemin: string };

export function SessionAutreOnglet() {
  const [changement, setChangement] = useState<Changement | null>(null);

  useEffect(() => {
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    const verifier = (avantId: string | null) => {
      void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
        const apres = useAuthStore.getState().utilisateur;
        const slug = slugEcoleActive();
        if (!jetonSession() || !apres) {
          if (avantId) { queryClient.clear(); setChangement({ type: 'deconnexion', chemin: `/t/${slug}/login` }); }
          return;
        }
        if (apres.id === avantId) return;   // même compte (reconnexion, mot de passe changé…)
        queryClient.clear();                // plus aucune donnée de l'ancien compte à l'écran
        const espace = espaceDuRole(apres.role);
        setChangement({
          type: 'autre_compte',
          nom: [apres.prenom, apres.nom].filter(Boolean).join(' ') || apres.email || 'un autre compte',
          espace: espace ? LIBELLE_ESPACE[espace] : 'inconnu',
          chemin: cheminEspace(apres.role, slug) ?? `/t/${slug}/login`,
        });
      });
    };
    const surStockage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage || (e.key !== null && !CLES_SESSION.has(e.key)) || e.oldValue === e.newValue) return;
      const avantId = useAuthStore.getState().utilisateur?.id ?? null;
      // Le jeton et la fiche du compte sont écrits l'un après l'autre : on attend la fin de l'écriture
      clearTimeout(minuteur);
      minuteur = setTimeout(() => verifier(avantId), 150);
    };
    window.addEventListener('storage', surStockage);
    return () => { clearTimeout(minuteur); window.removeEventListener('storage', surStockage); };
  }, []);

  if (!changement) return null;
  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true"
      aria-labelledby="session-autre-onglet-titre" id="session-autre-onglet">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <span className="w-14 h-14 rounded-[999px] bg-primary-light text-primary flex items-center justify-center">
          <span translate="no" className="material-symbols-outlined text-3xl">{changement.type === 'deconnexion' ? 'logout' : 'switch_account'}</span>
        </span>
        {changement.type === 'deconnexion' ? (
          <>
            <h2 id="session-autre-onglet-titre" className="text-lg font-black text-slate-900">Vous avez été déconnecté</h2>
            <p className="text-sm text-slate-600">La session a été fermée dans un autre onglet de ce navigateur.</p>
          </>
        ) : (
          <>
            <h2 id="session-autre-onglet-titre" className="text-lg font-black text-slate-900">Un autre compte est connecté</h2>
            <p className="text-sm text-slate-600">
              Dans un autre onglet, <strong className="text-slate-900">{changement.nom}</strong> (espace {changement.espace}) s'est connecté.
              Ce navigateur ne garde qu'une connexion à la fois : cet onglet passe donc sur ce compte.
            </p>
            <p className="text-xs text-slate-500">
              Pour utiliser deux comptes en même temps, ouvrez le second dans une fenêtre de navigation privée ou un autre navigateur.
            </p>
          </>
        )}
        <button type="button" onClick={() => window.location.assign(changement.chemin)}
          className="w-full h-11 rounded-[999px] bg-primary hover:bg-primary-dark text-text-on-primary text-sm font-black cursor-pointer transition-colors">
          {changement.type === 'deconnexion' ? 'Se reconnecter' : `Ouvrir l'espace ${changement.espace}`}
        </button>
      </div>
    </div>
  );
}

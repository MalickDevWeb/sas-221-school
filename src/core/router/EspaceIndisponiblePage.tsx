import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';

const LIBELLES: Record<string, string> = {
  SECRETAIRE: 'Secrétaire', COMPTABLE: 'Comptable', VISITEUR: 'Visiteur', SURVEILLANT: 'Surveillant',
  DIRECTEUR: 'Directeur', RH: 'Ressources humaines',
};

/**
 * Compte dont le rôle n'a pas encore d'espace dans l'application (le serveur refuse ces rôles partout, par sécurité).
 */
export function EspaceIndisponiblePage() {
  const navigate = useNavigate();
  const { utilisateur, deconnexion } = useAuthStore();
  const role = utilisateur?.role ? (LIBELLES[utilisateur.role] ?? utilisateur.role) : null;
  return (
    <div className="min-h-screen bg-[#FAF8F6] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-black text-slate-900 mb-2">Aucun espace pour ce compte</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        {role ? <>Votre compte ({role}) </> : <>Votre compte </>}
        n'a pas encore d'espace dans École 221. Demandez à l'administration de votre établissement de vous attribuer
        un rôle disposant d'un espace (administration, enseignant, vigile).
      </p>
      <button
        type="button"
        onClick={() => { deconnexion(); navigate(ROUTES.login, { replace: true }); }}
        className="px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-0"
      >
        Se déconnecter
      </button>
    </div>
  );
}

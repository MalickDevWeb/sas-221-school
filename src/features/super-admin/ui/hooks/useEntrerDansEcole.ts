import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import type { Tenant } from '../../domain/models/PlatformModels';

/**
 * Entrée du super-administrateur dans l'espace d'une école : fixe le contexte de l'école, mémorise le rôle d'origine
 * (pour le bouton « Retour Super Admin ») puis ouvre la page demandée de l'école.
 * Un seul endroit pour le tableau de bord, le répertoire (cartes et tableau) et la fenêtre de personnalisation.
 */
export function useEntrerDansEcole() {
  const navigate = useNavigate();
  return useCallback((ecole: Tenant, chemin = '/admin/dashboard') => {
    const slug = ecole.slug || ecole.id;
    useTenantStore.getState().setTenantContext(ecole);
    useAuthStore.getState().impersonateSchoolAdmin();
    navigate(`/t/${slug}${chemin}`);
  }, [navigate]);
}

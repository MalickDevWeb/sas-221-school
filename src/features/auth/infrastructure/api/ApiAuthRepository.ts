import type { AuthRepository } from '../../domain/port/AuthRepository';
import type { Utilisateur } from '../../domain/model/Utilisateur';
import { IdentifiantsInvalidesError } from '../../domain/exception/AuthExceptions';
import type { AxiosInstance } from 'axios';
import { memoriserHorsLigne, verifierHorsLigne } from '../local/identifiantsHorsLigne';

export class ApiAuthRepository implements AuthRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async login(email: string, motDePasse: string): Promise<{ utilisateur: Utilisateur; token: string }> {
    // Si on sait qu'on est hors-ligne
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = await verifierHorsLigne(email, motDePasse);
      if (cached) return cached;
      throw new Error("Vous êtes hors-ligne et ces identifiants n'ont pas été enregistrés sur cet appareil.");
    }

    try {
      const { data } = await this.http.post('/auth/login-token', { email, password: motDePasse });
      
      const role = typeof data.role === 'object' && data.role !== null ? data.role.value : data.role;
      
      const result = {
        utilisateur: {
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          role: role,
          tenantSlug: data.tenantSlug,
          doitChangerMotDePasse: data.doitChangerMotDePasse === true,
        },
        token: data.token,
      };

      // Accès hors-ligne futur : empreinte PBKDF2 seulement. Attendue (quelques centaines de ms) : un
      // rechargement juste après la connexion (changement du mot de passe provisoire) l'interrompait.
      await memoriserHorsLigne(email, motDePasse, result.utilisateur, result.token);

      return result;
    } catch (error) {
      // Si la requête échoue à cause d'un problème réseau, tenter d'utiliser le cache hors-ligne
      const axiosError = error as { response?: { status?: number }; code?: string; message?: string };
      const isNetworkError = !axiosError.response || 
                             axiosError.code === 'ERR_NETWORK' || 
                             axiosError.message?.includes('Network Error');

      if (isNetworkError) {
        const cached = await verifierHorsLigne(email, motDePasse);
        if (cached) return cached;
      }

      if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
        throw new IdentifiantsInvalidesError();
      }
      throw error;
    }
  }
}

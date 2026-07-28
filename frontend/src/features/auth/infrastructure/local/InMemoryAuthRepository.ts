import type { AuthRepository } from '../../domain/port/AuthRepository';
import type { Utilisateur } from '../../domain/model/Utilisateur';
import { IdentifiantsInvalidesError } from '../../domain/exception/AuthExceptions';
import { UTILISATEURS_SIMULES } from './AuthMockData';

export class InMemoryAuthRepository implements AuthRepository {
  async login(email: string, motDePasse: string): Promise<{ utilisateur: Utilisateur; token: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simuler la latence réseau

    const trouve = UTILISATEURS_SIMULES.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.motDePasse === motDePasse
    );

    if (trouve) {
      return { utilisateur: trouve.utilisateur, token: trouve.token };
    }

    throw new IdentifiantsInvalidesError();
  }
}

import { useQuery } from '@tanstack/react-query';
import { publicApiClient } from '@/shared/lib/apiClient';
import { nombreOuNull, objetBrut, texte, textes } from '@/shared/lib/lectureServeur';

/**
 * Règles de mot de passe d'un rôle, données par le serveur (GET /auth/regles-mot-de-passe?role=, public :
 * politique unique PolitiqueMotDePasse). Aucune règle écrite en dur dans les formulaires : longueur minimale
 * selon le rôle (10 élèves et parents, 12 école, 14 plateforme), phrases de passe acceptées, pas de « une lettre
 * et un chiffre ». Le serveur reste juge : ses refus (nom, école, mot courant…) sont affichés sous le champ.
 */
export interface ReglesMotDePasse {
  role: string;
  longueurMin: number | null;
  longueurMax: number | null;
  conseils: string[];
}

export async function lireReglesMotDePasse(role?: string | null): Promise<ReglesMotDePasse> {
  const { data } = await publicApiClient.get('/auth/regles-mot-de-passe', { params: role ? { role } : {} });
  const c = objetBrut(data);
  return {
    role: texte(c.role),
    longueurMin: nombreOuNull(c.longueurMin),
    longueurMax: nombreOuNull(c.longueurMax),
    conseils: textes(c.conseils),
  };
}

/** Règles du rôle (sans rôle : celles de l'administration d'école). Mises en cache : elles changent rarement. */
export function useReglesMotDePasse(role?: string | null, actif = true) {
  return useQuery({
    queryKey: ['auth', 'regles-mot-de-passe', role ?? ''],
    queryFn: () => lireReglesMotDePasse(role),
    staleTime: 60 * 60 * 1000,
    retry: 1,
    enabled: actif,
  });
}

/** Conseils du serveur sans celui de la longueur (« Au moins N caractères… »), affiché à part. */
export const conseilsSansLongueur = (r: ReglesMotDePasse | undefined): string[] =>
  (r?.conseils ?? []).filter((c) => !/^Au moins \d+ caractères/i.test(c));

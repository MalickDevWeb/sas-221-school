import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { estObjet, listeBrute, texte, texteOuNull, type ObjetBrut } from '@/shared/lib/lectureServeur';
import { annoncerMisesALaCorbeille } from '@/features/corbeille/annonceCorbeille';
import type { Classe, Filiere } from '../../../domain/SchoolModels';

/*
 * Ajout d'UNE classe ou d'UNE filière depuis une autre fenêtre que l'écran Classes (16/11 : « Nouvel élève » →
 * « Créer une classe »).
 *
 * Même enregistrement que l'écran Classes (useAdminSchoolState) : PUT /admin/planning/classes (ou /filieres). Cette
 * route reçoit la LISTE COMPLÈTE de l'école et met à la corbeille toute ligne absente de la liste envoyée. La liste
 * envoyée n'est donc jamais celle d'un écran (ancienne, ou vide après un chargement en échec) : elle est relue sur
 * le serveur juste avant l'envoi et renvoyée telle quelle, avec la nouvelle ligne à la fin. Si la relecture échoue
 * ou ne renvoie pas une liste d'objets identifiés, rien n'est envoyé.
 * POST /planning/classes n'est pas utilisé : il perd les frais annuels (absents de son corps) et ne contrôle ni la
 * capacité ni le nom (contrôles de PUT /admin/planning/classes).
 */

type ListePlanning = 'classes' | 'filieres';

/** Liste COMPLÈTE renvoyée par le serveur ; null si la réponse n'en est pas une (rien ne doit alors être envoyé). */
function listeComplete(data: unknown): ObjetBrut[] | null {
  if (!Array.isArray(data)) return null;
  const lignes = data.filter(estObjet);
  return lignes.length === data.length && lignes.every((l) => texteOuNull(l.id) !== null) ? lignes : null;
}

/** Ajoute une ligne sans jamais en retirer : liste relue juste avant l'envoi, renvoyée sans rien réécrire. */
async function ajouterUneLigne(liste: ListePlanning, ligne: Classe | Filiere): Promise<void> {
  const quoi = liste === 'classes' ? 'des classes' : 'des filières';
  const actuelle = listeComplete((await apiClient.get<unknown>(`/admin/planning/${liste}`)).data);
  if (!actuelle) throw new Error(`Rien n'a été enregistré : la liste ${quoi} de l'école n'a pas pu être relue. Réessayez.`);
  if (actuelle.some((l) => texte(l.id) === ligne.id)) throw new Error("Rien n'a été enregistré. Réessayez.");
  const { data } = await apiClient.put<unknown>(`/admin/planning/${liste}`, [...actuelle, ligne]);
  // Jamais attendu (liste relue à l'instant) ; si le serveur signale tout de même une ligne mise à la corbeille,
  // son message s'affiche avec « Ouvrir la corbeille ».
  annoncerMisesALaCorbeille(data);
}

const CLE_FILIERES = ['admin', 'planning', 'filieres', 'ajout-rapide'] as const;

const lireFilieres = (data: unknown): Filiere[] => listeBrute(data).map((f) => ({
  id: texte(f.id), name: texte(f.name ?? f.nom), code: texte(f.code), description: texte(f.description),
}));

/** Filières de l'école (relues à chaque ouverture) et ajout d'une classe ou d'une filière. */
export function useAjoutPlanning() {
  const queryClient = useQueryClient();
  const filieres = useQuery({
    queryKey: CLE_FILIERES,
    queryFn: async () => lireFilieres((await apiClient.get<unknown>('/admin/planning/filieres')).data),
    staleTime: 0,
    gcTime: 0,
  });
  const ajouterClasse = useMutation({ mutationFn: (classe: Classe) => ajouterUneLigne('classes', classe) });
  const ajouterFiliere = useMutation({
    mutationFn: (filiere: Filiere) => ajouterUneLigne('filieres', filiere),
    // Nouvelle filière ajoutée tout de suite à la liste (ClasseFormModal la sélectionne), puis liste relue
    onSuccess: async (_reponse, filiere) => {
      queryClient.setQueryData<Filiere[]>(CLE_FILIERES, (avant) => [...(avant ?? []), filiere]);
      await queryClient.invalidateQueries({ queryKey: CLE_FILIERES });
    },
  });
  return { filieres, ajouterClasse, ajouterFiliere };
}

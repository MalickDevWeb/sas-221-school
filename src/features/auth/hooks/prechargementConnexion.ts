import { useEffect } from 'react';
import { espaceDuRole, type Espace } from '@/core/router/destinationEspace';
import { prechargerEspace, quandInactif } from '@/core/router/prechargementEspaces';
import { roleMemorise, rolesMemorises } from '../infrastructure/local/identifiantsHorsLigne';

/**
 * Espace où mène probablement cet identifiant, connu AVANT la réponse du serveur (2026-11-16) :
 * - matricule (sans « @ ») : seuls les élèves se connectent par matricule (APP-TL-23) → espace élève ;
 * - compte déjà connecté sur cet appareil → son espace ;
 * - sinon inconnu : rien n'est téléchargé à l'aveugle (le code de l'espace l'est dès la réponse du serveur).
 */
export function espacePresume(identifiant: string): Espace | null {
  const id = identifiant.trim();
  if (!id) return null;
  if (!id.includes('@')) return 'eleve';
  return espaceDuRole(roleMemorise(id));
}

/** Télécharge le code de l'espace présumé de cet identifiant (sans effet s'il est inconnu). */
export function prechargerEspacePresume(identifiant: string): void {
  prechargerEspace(espacePresume(identifiant));
}

/**
 * Page de connexion d'une école : sur un appareil dont tous les comptes déjà connectés mènent au même espace (téléphone
 * personnel), son code est téléchargé dès que le navigateur est inactif, pendant la saisie. Appareil partagé entre
 * plusieurs espaces : on attend l'identifiant saisi (prechargerEspacePresume).
 */
export function usePrechargementEspaceDeLAppareil(): void {
  useEffect(() => {
    const espaces = new Set(rolesMemorises().map(espaceDuRole).filter((e): e is Espace => e !== null));
    if (espaces.size !== 1) return undefined;
    const [espace] = espaces;
    return quandInactif(() => prechargerEspace(espace));
  }, []);
}

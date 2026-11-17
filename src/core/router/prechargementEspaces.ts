import { useEffect } from 'react';
import type { Espace } from './destinationEspace';
import {
  AdminPage,
  ParentDashboardPage,
  ParentLayout,
  ProfessorDashboardPage,
  StudentDashboardPage,
  StudentLayout,
  VigilLayout,
  VigilPatrolPage,
} from './TenantAppPages';
import { SuperAdminDashboardPage, SuperAdminLayout } from './SuperAdminPages';

/**
 * Préchargement du code d'un espace (2026-11-16, lenteur signalée par le Tech Lead : page blanche après la connexion).
 * Seules les pages affichées à l'OUVERTURE de l'espace visé sont téléchargées — jamais les autres espaces ni les autres
 * pages : précharger les cinq espaces d'école coûterait ~760 Ko compressés, quand un parent n'a besoin que de ~80 Ko.
 */
const PAGES_D_OUVERTURE: Record<Espace, ReadonlyArray<{ precharger: () => Promise<void> }>> = {
  plateforme: [SuperAdminLayout, SuperAdminDashboardPage],
  administration: [AdminPage],
  vigile: [VigilLayout, VigilPatrolPage],
  professeur: [ProfessorDashboardPage],
  parent: [ParentLayout, ParentDashboardPage],
  eleve: [StudentLayout, StudentDashboardPage],
};

/** Télécharge le code des pages d'ouverture de l'espace (sans effet si `espace` est null ou déjà téléchargé). */
export function prechargerEspace(espace: Espace | null): void {
  if (!espace) return;
  for (const page of PAGES_D_OUVERTURE[espace]) void page.precharger();
}

/** Lance `tache` quand le navigateur est inactif (après l'affichage de la page, sans gêner la saisie) ; renvoie l'annulation. */
export function quandInactif(tache: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(tache, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(tache, 1000); // Safari : pas de requestIdleCallback
  return () => window.clearTimeout(id);
}

/** Page de connexion qui ne mène qu'à un espace (super-admin) : son code est téléchargé pendant la saisie. */
export function usePrechargementEspace(espace: Espace | null): void {
  useEffect(() => (espace ? quandInactif(() => prechargerEspace(espace)) : undefined), [espace]);
}

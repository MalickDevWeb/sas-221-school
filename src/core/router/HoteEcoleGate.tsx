import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { publicApiClient } from '@/shared/lib/apiClient';
import {
  type EcoleDeLHote,
  ecoleMemoriseePourHote,
  genreHoteCourant,
  memoriserEcolePourHote,
} from '@/shared/lib/hoteEcole';
import { PageSkeleton } from './PageSkeleton';
import { Redirection } from './RouteRedirects';

/** Adresses génériques qui, sur l'adresse d'une école, mènent directement à sa page de connexion. */
const ENTREES_GENERIQUES = new Set(['/', '/login', '/ecole221', '/ecole-221']);

/**
 * Sur l'adresse d'une école, l'école est celle de l'adresse : entrée générique → sa connexion ; /t/<autre>/… → même
 * chemin sous /t/<école de l'adresse> (revue, critère 9 : avant, portail.a.sn/t/b demandait l'école b → 403).
 * Renvoie la destination, ou null si l'adresse demandée convient déjà.
 */
function redirectionPourEcole(slug: string, pathname: string, suite: string): string | null {
  if (ENTREES_GENERIQUES.has(pathname)) return `/t/${slug}/login${suite}`;
  const m = pathname.match(/^\/t\/([^/]+)(\/.*)?$/);
  if (m && m[1] !== slug) return `/t/${slug}${m[2] ?? ''}${suite}`;
  return null;
}

/** GET /public/tenants/par-hote : école ACTIVE rattachée à ce nom d'hôte, null si aucune (404). */
async function ecoleParHote(hote: string): Promise<EcoleDeLHote | null> {
  try {
    const { data } = await publicApiClient.get<{ slug?: string; nom?: string }>('/public/tenants/par-hote', { params: { host: hote } });
    const ecole = data?.slug ? { slug: data.slug, nom: data.nom || data.slug } : null;
    memoriserEcolePourHote(hote, ecole);
    return ecole;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      memoriserEcolePourHote(hote, null);
      return null;
    }
    throw err;
  }
}

function Ecran({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div role="alert" className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center space-y-3">
        <h1 className="text-lg font-black text-neutral-900">{titre}</h1>
        {children}
      </div>
    </div>
  );
}

/**
 * Résout l'école désignée par l'adresse du site avant d'afficher les pages (décision du Tech Lead, 2026-11-15).
 * - Hôte de la plateforme : aucune action.
 * - Sous-domaine <slug>.<domaine> : « / » et « /login » mènent à /t/<slug>/login, /t/<autre>/… à /t/<slug>/….
 * - Domaine propre d'une école : un seul appel à par-hote (résultat gardé pour la session), puis même redirection ;
 *   adresse rattachée à aucune école active → page explicite au lieu d'un écran blanc.
 */
export function HoteEcoleGate({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();
  const hote = genreHoteCourant();
  const hoteEcole = hote.genre === 'domaine-ecole' ? hote.hote : '';
  const enCache = hoteEcole ? ecoleMemoriseePourHote(hoteEcole) : null;

  const resolution = useQuery({
    queryKey: ['ecole-par-hote', hoteEcole],
    queryFn: () => ecoleParHote(hoteEcole),
    enabled: hoteEcole !== '' && enCache === null,
    initialData: enCache ?? undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  if (hote.genre === 'plateforme') return <>{children}</>;

  if (hote.genre === 'sous-domaine') {
    const destination = redirectionPourEcole(hote.slug, pathname, search + hash);
    // Écran de chargement pendant la redirection (16/11) : un <Navigate> seul laissait une page blanche
    return destination ? <Redirection to={destination} /> : <>{children}</>;
  }

  if (resolution.isPending) return <PageSkeleton />;

  if (resolution.isError) {
    return (
      <Ecran titre="Le serveur ne répond pas">
        <p className="text-sm text-neutral-600">
          Impossible de savoir quel établissement correspond à l'adresse « {hoteEcole} » : le serveur n'a pas répondu.
          Vérifiez votre connexion puis réessayez.
        </p>
        <button
          type="button"
          onClick={() => void resolution.refetch()}
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold cursor-pointer"
        >
          Réessayer
        </button>
      </Ecran>
    );
  }

  if (!resolution.data) {
    return (
      <Ecran titre="Aucun établissement n'est rattaché à cette adresse">
        <p className="text-sm text-neutral-600">
          L'adresse « {hoteEcole} » ne mène à aucun établissement actif sur My School. Vérifiez le lien reçu de votre
          école ; si vous gérez cet établissement, vérifiez que ce domaine est déclaré dans Personnalisation → Adresse
          de l'école et qu'il pointe (CNAME) vers l'adresse de l'école indiquée sur cet écran.
        </p>
      </Ecran>
    );
  }

  const destination = redirectionPourEcole(resolution.data.slug, pathname, search + hash);
  return destination ? <Redirection to={destination} /> : <>{children}</>;
}

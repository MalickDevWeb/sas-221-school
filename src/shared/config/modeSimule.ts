/**
 * Mode simulé (dépôts en mémoire, données de démonstration) — DÉVELOPPEMENT UNIQUEMENT.
 *
 * `import.meta.env.DEV` vaut `false` à la construction de production : le mode simulé y est donc impossible et Vite
 * retire les dépôts simulés du paquet livré.
 */
export const MODE_SIMULE: boolean = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

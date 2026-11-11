/**
 * Bandeau d'erreurs d'exécution, en DÉVELOPPEMENT uniquement.
 * Avant : script en ligne dans index.html, actif en production pour tous les utilisateurs, qui affichait
 * le message brut et la trace de pile (fuite d'informations internes) via innerHTML (HTML interprété),
 * et empêchait une politique de sécurité du contenu sans 'unsafe-inline' (APP-SEC-07).
 */
const ignorer = (texte: string) => texte.toLowerCase().includes('websocket');

function bandeau(titre: string, detail: string, fond: string, couleur: string, bordure: string) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', background: fond, color: couleur,
    padding: '16px', zIndex: '999999', borderBottom: `4px solid ${bordure}`, fontFamily: 'monospace',
    whiteSpace: 'pre-wrap', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  });
  const fort = document.createElement('strong');
  fort.textContent = titre;
  div.append(fort, ' ' + detail);   // texte brut : jamais interprété comme du HTML
  document.body.appendChild(div);
}

export function installerSurveillanceErreursDev(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  window.addEventListener('error', (e) => {
    const pile = e.error instanceof Error ? e.error.stack ?? '' : '';
    if (ignorer(e.message || '') || ignorer(pile)) return;
    bandeau('[Runtime Error]:', `${e.message}\n${pile}`, '#fee2e2', '#991b1b', '#ef4444');
  });
  window.addEventListener('unhandledrejection', (e) => {
    const raison = String(e.reason ?? '');
    const pile = e.reason instanceof Error ? e.reason.stack ?? '' : '';
    if (ignorer(raison) || ignorer(pile)) return;
    bandeau('[Unhandled Promise Rejection]:', `${raison}\n${pile}`, '#fffbeb', '#92400e', '#f59e0b');
  });
}

import { useMemo } from 'react';
import { encoderQr } from '@/shared/lib/qr/encodeurQr';

interface Props {
  /** Contenu encodé dans le QR. */
  readonly valeur: string;
  /** Classes de taille / mise en forme (le QR occupe toute la boîte). */
  readonly className?: string;
  /** Texte alternatif (lecteurs d'écran). */
  readonly titre?: string;
  readonly couleur?: string;
}

/**
 * QR code dessiné localement en SVG : aucun contenu (matricule, jeton d'accès, lien) envoyé à un
 * service externe, et QR disponibles hors ligne.
 */
export function QrLocal({ valeur, className, titre = 'QR code', couleur = '#1b1c1e' }: Props) {
  const { chemin, cote } = useMemo(() => {
    let m: boolean[][];
    try { m = encoderQr(valeur); } catch { m = []; }
    let d = '';
    m.forEach((ligne, y) => ligne.forEach((noir, x) => { if (noir) d += `M${x + 4},${y + 4}h1v1h-1z`; }));
    return { chemin: d, cote: m.length + 8 };
  }, [valeur]);
  return (
    <svg viewBox={`0 0 ${cote} ${cote}`} className={className} role="img" aria-label={titre} shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg">
      <rect width={cote} height={cote} fill="#ffffff" />
      <path d={chemin} fill={couleur} />
    </svg>
  );
}

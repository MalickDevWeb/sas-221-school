/**
 * Extraction intelligente d'une palette complète depuis un logo.
 * Génère automatiquement primary, secondary, accent, surface, textes.
 * Ecole 221 est protégée : son slug ne déclenchera jamais l'extraction automatique.
 */

export interface TenantPalette {
  primary: string;          // Couleur principale (boutons, sidebar active)
  primaryLight: string;     // Variante claire (+70% luminosité) — fonds légers
  primaryDark: string;      // Variante foncée (-20%) — hover boutons
  secondary: string;        // Couleur complémentaire (sous-menus, badges secondaires)
  accent: string;           // Couleur d'accentuation (highlights, KPIs, graphiques)
  surfaceWarm: string;      // Fond légèrement teinté (page admin background)
  textOnPrimary: string;    // Texte sur fond primaire (blanc ou noir selon contraste)
}

// ─── Palette de référence Ecole 221 (JAMAIS MODIFIÉE) ───────────────────────
export const ECOLE_221_PALETTE: TenantPalette = {
  primary:       '#B3181C',
  primaryLight:  '#FFF5F5',
  primaryDark:   '#8F1316',
  secondary:     '#FAF8F6',
  accent:        '#E3A857',
  surfaceWarm:   '#FAF8F6',
  textOnPrimary: '#FFFFFF',
};

// ─── Palettes prédéfinies ────────────────────────────────────────────────────
export const PREDEFINED_PALETTES: Array<{ name: string; palette: TenantPalette }> = [
  {
    name: 'Ecole 221 (Référence)',
    palette: ECOLE_221_PALETTE,
  },
  {
    name: 'Océan Royal',
    palette: generatePaletteFromHex('#1A56DB'),
  },
  {
    name: 'Émeraude Académique',
    palette: generatePaletteFromHex('#047857'),
  },
  {
    name: 'Violet Prestige',
    palette: generatePaletteFromHex('#6D28D9'),
  },
  {
    name: 'Orange Dynamique',
    palette: generatePaletteFromHex('#D97706'),
  },
  {
    name: 'Ardoise Moderne',
    palette: generatePaletteFromHex('#334155'),
  },
  {
    name: 'Rose Corail',
    palette: generatePaletteFromHex('#BE185D'),
  },
];

// ─── Utilitaires couleur ──────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function getContrastRatio(r: number, g: number, b: number): number {
  const luminance = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
}

/**
 * Génère une palette complète depuis une couleur primaire hex.
 * - primaryLight : version très claire (fond léger)
 * - primaryDark  : version foncée (hover)
 * - secondary    : fond neutre légèrement teinté (très faible saturation)
 * - accent       : couleur complémentaire (hue +60°) saturée
 * - surfaceWarm  : fond chaud léger basé sur la teinte primaire
 * - textOnPrimary: blanc ou noir selon contraste WCAG
 */
export function generatePaletteFromHex(primaryHex: string): TenantPalette {
  const [r, g, b] = hexToRgb(primaryHex);
  const [h, s, l] = rgbToHsl(r, g, b);

  // Variante claire : même teinte, saturation réduite, luminosité très haute
  const primaryLight = hslToHex(h, Math.max(s * 0.3, 10), 96);

  // Variante foncée : même teinte, luminosité -20%
  const primaryDark = hslToHex(h, s, Math.max(l - 20, 15));

  // Fond neutre légèrement teinté (saturation très faible)
  const secondary = hslToHex(h, Math.min(s * 0.08, 8), 97.5);

  // Accent : hue complémentaire (180°) ou analogique (+60°), bien saturé
  // On choisit analogique car plus harmonieux
  const accentHue = (h + 50) % 360;
  const accent = hslToHex(accentHue, Math.min(s * 0.9, 75), Math.min(l + 5, 62));

  // Surface warm : fond légèrement teinté (très doux)
  const surfaceWarm = hslToHex(h, Math.min(s * 0.06, 6), 98);

  // Texte sur fond primaire : blanc si luminance < 0.3, noir sinon
  const lum = getContrastRatio(r, g, b);
  const textOnPrimary = lum < 0.35 ? '#FFFFFF' : '#1E293B';

  return {
    primary: primaryHex,
    primaryLight,
    primaryDark,
    secondary,
    accent,
    surfaceWarm,
    textOnPrimary,
  };
}

/**
 * Analyse un fichier image et extrait les TOP 5 couleurs dominantes.
 * Retourne la palette complète générée depuis la couleur la plus représentative.
 */
export const extractPaletteFromLogo = (file: File): Promise<{ colors: string[]; palette: TenantPalette }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject('Canvas not supported'); return; }

      const MAX_SIZE = 150;
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const imageData = ctx.getImageData(0, 0, width, height).data;
      const buckets: Record<string, { count: number; r: number; g: number; b: number }> = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        // Filtrer les pixels non exploitables
        if (a < 100) continue; // transparent
        if (r > 235 && g > 235 && b > 235) continue; // blanc
        if (r < 20 && g < 20 && b < 20) continue; // noir

        // Calcul de la saturation pour ne garder que les couleurs vives
        const [, s] = rgbToHsl(r, g, b);
        if (s < 12) continue; // gris / neutre — on ignore

        // Quantiser en buckets de 20 pour grouper les couleurs similaires
        const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;

        if (!buckets[key]) {
          buckets[key] = { count: 0, r, g, b };
        }
        buckets[key].count++;
        // Mettre à jour avec la valeur exacte la plus fréquente
        if (Math.abs(r - Math.round(r / 20) * 20) < 5) {
          buckets[key].r = r;
          buckets[key].g = g;
          buckets[key].b = b;
        }
      }

      // Trier par fréquence et dé-dupliquer les teintes similaires
      const sorted = Object.values(buckets)
        .filter(v => v.count > 2)
        .sort((a, b) => b.count - a.count);

      const dominantColors: string[] = [];
      for (const bucket of sorted) {
        if (dominantColors.length >= 5) break;
        const hex = rgbToHex(bucket.r, bucket.g, bucket.b);

        // Éviter d'ajouter des couleurs trop similaires (ΔE simplifié)
        const isTooSimilar = dominantColors.some(existing => {
          const [er, eg, eb] = hexToRgb(existing);
          const dist = Math.sqrt(
            Math.pow(bucket.r - er, 2) +
            Math.pow(bucket.g - eg, 2) +
            Math.pow(bucket.b - eb, 2)
          );
          return dist < 60;
        });

        if (!isTooSimilar) {
          dominantColors.push(hex);
        }
      }

      if (dominantColors.length === 0) {
        // Fallback neutre
        dominantColors.push('#5B6BF9');
      }

      // Générer la palette depuis la couleur la plus dominante
      const palette = generatePaletteFromHex(dominantColors[0]);

      resolve({ colors: dominantColors, palette });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject('Erreur de chargement de l\'image');
    };

    img.src = url;
  });
};

/** Compatibilité : ancienne API pour les composants qui l'utilisaient encore */
export const extractDominantColor = (file: File): Promise<string> =>
  extractPaletteFromLogo(file).then(({ palette }) => palette.primary);

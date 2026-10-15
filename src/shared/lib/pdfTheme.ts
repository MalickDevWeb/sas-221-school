import { jsPDF } from 'jspdf';
import { useTenantStore } from '@/core/store/tenantStore';
import { generatePaletteFromHex } from '@/shared/utils/colorExtractor';

export const ECOLE_221_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuATOYzVUJC7e-ftTE3lXovvVvRsqHHNIhIP8N0bYAlcl5I9wc4wZieBeLSgkAtekpfHAYpMhxIa--gptb4_ZxpWd3ASeAdcpP_qpDrpO4nP2JkJIgosmzLuiGVXktceJxPhEtgMsZR-c_s5iruzviVbSlXDr6TrcW_gGdmUzWynAC6Zq-pdSXA1JAqg8IG_N4D4HAZoaQ82t3xETLWbA7hX9Gnd5mLdfidA4Ba6BeD-xvZSUi-OCy37myHKNc8Qo6GRQkUQgXCirQw';

export const ECOLE_221_PALETTE = {
  primary: [179, 24, 28] as [number, number, number],
  secondary: [41, 23, 21] as [number, number, number],
  neutral: [64, 64, 64] as [number, number, number],
  lightBg: [250, 248, 246] as [number, number, number],
  border: [226, 220, 218] as [number, number, number],
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  }
  return [179, 24, 28];
}

/**
 * Récupère dynamiquement la palette et les métadonnées de l'école active.
 * Possède un système de résilience multi-niveaux :
 * 1. Store Zustand en mémoire
 * 2. Cache localStorage ('tenant-storage')
 * 3. Cache localStorage spécifique au slug ('tenant_theme_{slug}')
 * 4. Détection depuis l'utilisateur connecté ('ecole-221-auth-storage') ou l'URL
 */
export function getActiveTenantPdfTheme() {
  let tenant = useTenantStore.getState().currentTenant;

  // 1. Fallback via le stockage persistant de Zustand si le store en mémoire n'est pas encore hydraté
  if (!tenant) {
    try {
      const stored = localStorage.getItem('tenant-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        tenant = parsed?.state?.currentTenant || null;
      }
    } catch {}
  }

  // 2. Fallback via le profil auth stocké si disponible
  if (!tenant) {
    try {
      const authStored = localStorage.getItem('ecole-221-auth-storage');
      if (authStored) {
        const authParsed = JSON.parse(authStored);
        const userSlug = authParsed?.state?.utilisateur?.tenantSlug;
        if (userSlug && userSlug !== 'ecole221' && userSlug !== 'ecole-221') {
          const cachedTheme = localStorage.getItem(`tenant_theme_${userSlug}`);
          if (cachedTheme) {
            tenant = {
              id: 'tenant-' + userSlug,
              name: userSlug.toUpperCase(),
              slug: userSlug,
              branding: JSON.parse(cachedTheme),
            };
          }
        }
      }
    } catch {}
  }

  const schoolName = tenant?.name || 'École 221';
  const slug = tenant?.slug || 'ecole221';
  const isEcole221 = slug === 'ecole221' || slug === 'ecole-221';

  // Le logo École 221 n'est utilisé QUE pour École 221 — les autres écoles ont un monogramme officiel si pas de logoUrl
  const logoUrl = tenant?.branding?.logoUrl || (isEcole221 ? ECOLE_221_LOGO_URL : null);

  const hexPrimary = tenant?.branding?.primaryColor || (isEcole221 ? '#B3181C' : '#102943');
  const palette = (tenant?.branding?.palette as any) || (isEcole221 ? null : generatePaletteFromHex(hexPrimary));

  const primary: [number, number, number] = isEcole221
    ? ECOLE_221_PALETTE.primary
    : (palette?.primary ? hexToRgb(palette.primary) : hexToRgb(hexPrimary));

  const primaryDark: [number, number, number] = isEcole221
    ? [143, 19, 22]
    : (palette?.primaryDark ? hexToRgb(palette.primaryDark) : hexToRgb(hexPrimary));

  // Pour le PDF, "secondary" doit être un texte très sombre et lisible :
  // - Pour Ecole 221 : [41, 23, 21] (#291715)
  // - Pour une autre école : un ton sombre élégant dérivé du primaryDark ou ardoise [30, 41, 59]
  const secondary: [number, number, number] = isEcole221
    ? ECOLE_221_PALETTE.secondary
    : [30, 41, 59];

  const accent: [number, number, number] = isEcole221
    ? [227, 168, 87]
    : (palette?.accent ? hexToRgb(palette.accent) : [37, 99, 235]);

  const lightBg: [number, number, number] = isEcole221
    ? ECOLE_221_PALETTE.lightBg
    : [248, 250, 252];

  const textOnPrimary: [number, number, number] = isEcole221
    ? [255, 255, 255]
    : (palette?.textOnPrimary ? hexToRgb(palette.textOnPrimary) : [255, 255, 255]);

  // Table header : Si la couleur primaire est trop claire (contraste avec blanc < 3.8),
  // utiliser primaryDark pour garantir un en-tête net et lisible.
  const [prR, prG, prB] = primary;
  const isPrimaryTooLight = (0.2126 * prR + 0.7152 * prG + 0.0722 * prB) / 255 > 0.42;
  const tableHeaderBg: [number, number, number] = isPrimaryTooLight ? primaryDark : primary;
  const tableHeaderText: [number, number, number] = [255, 255, 255];

  return {
    schoolName,
    slug,
    logoUrl,
    palette: {
      primary,
      primaryDark,
      secondary,
      accent,
      lightBg,
      textOnPrimary,
      tableHeaderBg,
      tableHeaderText,
      border: [226, 232, 240] as [number, number, number],
      neutral: [71, 85, 105] as [number, number, number],
    },
  };
}

export type Ecole221HeaderConfig = {
  title?: string;
  subtitle: string;
  meta: string;
  generatedAt?: Date | string;
};

export function formatFrenchDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const day = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${day} à ${time}`;
}

export function loadLogoImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function addEcole221Header(
  doc: jsPDF,
  config: Ecole221HeaderConfig,
  options?: { marginX?: number; currentY?: number; height?: number },
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = options?.marginX ?? 15;
  const currentY = options?.currentY ?? 15;
  const headerHeight = options?.height ?? 30;

  const tenantTheme = getActiveTenantPdfTheme();
  const { primary, secondary, neutral, lightBg, border, textOnPrimary } = tenantTheme.palette;
  const schoolTitle = config.title || `${tenantTheme.schoolName.toUpperCase()} — PORTAIL ACADÉMIQUE`;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, headerHeight, 'F');
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(marginX, currentY, 2.5, headerHeight, 'F');

  const textOffsetX = 23;
  const logoWidth = 16;
  const logoHeight = 16;
  const logoX = marginX + 4;
  const logoY = currentY + 6;

  let logoDrawn = false;
  if (tenantTheme.logoUrl) {
    try {
      const logoImg = await loadLogoImage(tenantTheme.logoUrl);
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight);
        logoDrawn = true;
      }
    } catch {}
  }

  if (!logoDrawn) {
    // Monogramme / Badge circulaire avec l'initiale de l'école et sa couleur primaire
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.ellipse(logoX + 8, logoY + 8, 8, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textOnPrimary[0], textOnPrimary[1], textOnPrimary[2]);
    const initial = tenantTheme.schoolName.substring(0, 3).toUpperCase();
    doc.text(initial, logoX + 8, logoY + 11, { align: 'center' });
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text(schoolTitle, marginX + textOffsetX, currentY + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(neutral[0], neutral[1], neutral[2]);
  doc.text(config.subtitle, marginX + textOffsetX, currentY + 13.5);
  doc.text(config.meta, marginX + textOffsetX, currentY + 18.5);

  const generatedAt = config.generatedAt instanceof Date || typeof config.generatedAt === 'string'
    ? formatFrenchDateTime(config.generatedAt)
    : formatFrenchDateTime(new Date());
  doc.setFontSize(7.2);
  doc.setTextColor(120, 120, 120);
  doc.text(`Généré le ${generatedAt}`, pageWidth - marginX - 5, currentY + 7, { align: 'right' });

  doc.setDrawColor(border[0], border[1], border[2]);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY + headerHeight + 0.6, pageWidth - marginX, currentY + headerHeight + 0.6);

  return {
    currentY: currentY + headerHeight + 6,
    marginX,
    pageWidth,
  };
}

export function addEcole221Footer(doc: jsPDF, lines?: string[]) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tenantTheme = getActiveTenantPdfTheme();
  const { neutral } = tenantTheme.palette;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(neutral[0], neutral[1], neutral[2]);

  const defaultLines = lines && lines.length > 0 ? lines : [
    `${tenantTheme.schoolName}  -  Établissement d'Enseignement Supérieur Agréé`,
    "Relevé de notes officiel de fin de semestre.",
    `© ${new Date().getFullYear()} ${tenantTheme.schoolName}. Tous droits réservés.`
  ];

  defaultLines.forEach((line, index) => {
    doc.text(line, pageWidth / 2, pageHeight - 12 + index * 3.6, { align: 'center' });
  });
}

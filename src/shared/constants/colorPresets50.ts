import type { TenantPalette } from '@/shared/utils/colorExtractor';
import { generatePaletteFromHex } from '@/shared/utils/colorExtractor';

export type PresetCategory = 'tous' | 'bleus' | 'verts' | 'violets' | 'chaudes' | 'neutres' | 'education';

export interface SaaSColorPreset {
  id: number;
  name: string;
  category: 'bleus' | 'verts' | 'violets' | 'chaudes' | 'neutres' | 'education';
  categoryLabel: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textOnPrimary: string;
  border: string;
}

export const SAAS_50_PALETTES: SaaSColorPreset[] = [
  // ─── 1. Bleus professionnels et SaaS ───────────────────────────────────────────
  { id: 1, name: 'Bleu Océan', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#2563EB', secondary: '#0F172A', accent: '#06B6D4', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 2, name: 'Bleu Royal', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#1D4ED8', secondary: '#334155', accent: '#F59E0B', background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 3, name: 'Indigo & Ardoise', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#4F46E5', secondary: '#334155', accent: '#22D3EE', background: '#F8FAFC', surface: '#FFFFFF', text: '#1E293B', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 4, name: 'Marine & Ciel', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#123B6D', secondary: '#426A8C', accent: '#38BDF8', background: '#F5F9FF', surface: '#FFFFFF', text: '#102033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 5, name: 'Azure Professionnel', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#0284C7', secondary: '#164E63', accent: '#F97316', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 6, name: 'Cobalt Tech', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#1E40AF', secondary: '#475569', accent: '#A3E635', background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 7, name: 'Bleu Acier', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#365F91', secondary: '#64748B', accent: '#EAB308', background: '#F7F9FC', surface: '#FFFFFF', text: '#1E293B', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 8, name: 'Bleu Nuit', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#172554', secondary: '#1E3A8A', accent: '#60A5FA', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 9, name: 'Saphir', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#1E3A8A', secondary: '#2563EB', accent: '#FBBF24', background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 10, name: 'SaaS Bleu Épuré', category: 'bleus', categoryLabel: 'Bleus Pros & SaaS', primary: '#3B82F6', secondary: '#64748B', accent: '#14B8A6', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },

  // ─── 2. Verts, nature et santé ─────────────────────────────────────────────────
  { id: 11, name: 'Émeraude', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#047857', secondary: '#065F46', accent: '#F59E0B', background: '#F7FCF9', surface: '#FFFFFF', text: '#10231B', textOnPrimary: '#FFFFFF', border: '#E5E7EB' },
  { id: 12, name: 'Forêt', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#166534', secondary: '#365314', accent: '#A3E635', background: '#F7FAF5', surface: '#FFFFFF', text: '#172416', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 13, name: 'Menthe & Pétrole', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#0F766E', secondary: '#134E4A', accent: '#2DD4BF', background: '#F5FBFA', surface: '#FFFFFF', text: '#102826', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 14, name: 'Sauge Naturelle', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#557C67', secondary: '#44534B', accent: '#D4A373', background: '#FAFAF7', surface: '#FFFFFF', text: '#252B27', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 15, name: 'Teal Santé', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#0F766E', secondary: '#155E75', accent: '#38BDF8', background: '#F6FAFB', surface: '#FFFFFF', text: '#13252B', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 16, name: 'Olive Moderne', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#4D7C0F', secondary: '#365314', accent: '#FDE047', background: '#FAFCF4', surface: '#FFFFFF', text: '#202713', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 17, name: 'Pin & Crème', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#14532D', secondary: '#3F6212', accent: '#EAB308', background: '#FFFCF5', surface: '#FFFFFF', text: '#1A2A20', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 18, name: 'Vert Frais', category: 'verts', categoryLabel: 'Verts & Nature', primary: '#15803D', secondary: '#166534', accent: '#FB923C', background: '#F7FCF8', surface: '#FFFFFF', text: '#14241A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },

  // ─── 3. Violets et indigo ──────────────────────────────────────────────────────
  { id: 19, name: 'Violet Professionnel', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#6D28D9', secondary: '#4C1D95', accent: '#F0ABFC', background: '#FAF8FF', surface: '#FFFFFF', text: '#211638', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 20, name: 'Lavande', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#7C3AED', secondary: '#6D28D9', accent: '#F9A8D4', background: '#FBF9FF', surface: '#FFFFFF', text: '#241A35', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 21, name: 'Indigo Nuit', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#4338CA', secondary: '#312E81', accent: '#818CF8', background: '#F8F8FF', surface: '#FFFFFF', text: '#1D1C38', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 22, name: 'Prune', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#7E22CE', secondary: '#581C87', accent: '#F0ABFC', background: '#FCF8FF', surface: '#FFFFFF', text: '#291534', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 23, name: 'Orchidée', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#A21CAF', secondary: '#701A75', accent: '#F472B6', background: '#FFF8FD', surface: '#FFFFFF', text: '#2B1730', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 24, name: 'Violet Royal', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#5B21B6', secondary: '#3730A3', accent: '#FBBF24', background: '#FAF8FF', surface: '#FFFFFF', text: '#241A36', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 25, name: 'Pervenche', category: 'violets', categoryLabel: 'Violets & Prestige', primary: '#4F46E5', secondary: '#475569', accent: '#C4B5FD', background: '#F8F8FF', surface: '#FFFFFF', text: '#1E2238', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },

  // ─── 4. Couleurs chaudes et énergiques ─────────────────────────────────────────
  { id: 26, name: 'Corail', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#E11D48', secondary: '#9F1239', accent: '#FB7185', background: '#FFF8F9', surface: '#FFFFFF', text: '#2B1720', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 27, name: 'Terre Cuite', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#C2410C', secondary: '#7C2D12', accent: '#FDBA74', background: '#FFFAF6', surface: '#FFFFFF', text: '#2C1B14', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 28, name: 'Coucher de Soleil', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#EA580C', secondary: '#9A3412', accent: '#FACC15', background: '#FFFAF5', surface: '#FFFFFF', text: '#2B1D12', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 29, name: 'Ambre', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#B45309', secondary: '#78350F', accent: '#FCD34D', background: '#FFFCF5', surface: '#FFFFFF', text: '#2B2114', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 30, name: 'Rouge Cramoisi', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#B91C1C', secondary: '#7F1D1D', accent: '#FCA5A5', background: '#FFF8F8', surface: '#FFFFFF', text: '#2A1717', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 31, name: 'Rose Élégant', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#BE185D', secondary: '#831843', accent: '#FDA4AF', background: '#FFF8FB', surface: '#FFFFFF', text: '#2B1721', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 32, name: 'Orange Moderne', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#C2410C', secondary: '#7C2D12', accent: '#0D9488', background: '#FFFAF6', surface: '#FFFFFF', text: '#2B1B13', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 33, name: 'Bordeaux Premium', category: 'chaudes', categoryLabel: 'Chaudes & Dynamiques', primary: '#881337', secondary: '#4C0519', accent: '#D4A373', background: '#FFFAFB', surface: '#FFFFFF', text: '#28151C', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },

  // ─── 5. Neutres, premium et minimalistes ───────────────────────────────────────
  { id: 34, name: 'Charbon & Bleu', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#334155', secondary: '#0F172A', accent: '#60A5FA', background: '#F8FAFC', surface: '#FFFFFF', text: '#111827', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 35, name: 'Ardoise Corporate', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#475569', secondary: '#1E293B', accent: '#38BDF8', background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 36, name: 'Noir & Or', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#27272A', secondary: '#3F3F46', accent: '#D4AF37', background: '#FAFAFA', surface: '#FFFFFF', text: '#18181B', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 37, name: 'Graphite & Turquoise', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#27272A', secondary: '#3F3F46', accent: '#2DD4BF', background: '#FAFAFA', surface: '#FFFFFF', text: '#18181B', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 38, name: 'Pierre & Cuivre', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#57534E', secondary: '#44403C', accent: '#C2410C', background: '#FAF9F6', surface: '#FFFFFF', text: '#292524', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 39, name: 'Sable Chaud', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#8B5E3C', secondary: '#5B4636', accent: '#D97706', background: '#FFFBF5', surface: '#FFFFFF', text: '#2E241C', textOnPrimary: '#FFFFFF', border: '#E5E7EB' },
  { id: 40, name: 'Minimal Monochrome', category: 'neutres', categoryLabel: 'Neutres & Minimalistes', primary: '#374151', secondary: '#6B7280', accent: '#14B8A6', background: '#F9FAFB', surface: '#FFFFFF', text: '#111827', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },

  // ─── 6. Éducation, écoles et palettes expressives ─────────────────────────────
  { id: 41, name: 'Bleu Scolaire & Jaune', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#1D4ED8', secondary: '#1E40AF', accent: '#FACC15', background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 42, name: 'Vert Éducatif & Orange', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#15803D', secondary: '#166534', accent: '#FB923C', background: '#F7FCF8', surface: '#FFFFFF', text: '#14241A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 43, name: 'Éducation Dynamique', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#6D28D9', secondary: '#2563EB', accent: '#F97316', background: '#FAF9FF', surface: '#FFFFFF', text: '#211A33', textOnPrimary: '#FFFFFF', border: '#E5E7EB' },
  { id: 44, name: 'Académique Marine & Or', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#1E3A5F', secondary: '#334155', accent: '#D4AF37', background: '#F8FAFC', surface: '#FFFFFF', text: '#142033', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 45, name: 'Ciel & Corail', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#0369A1', secondary: '#0F766E', accent: '#FB7185', background: '#F6FBFD', surface: '#FFFFFF', text: '#132630', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 46, name: 'Pastel Doux', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#645CBB', secondary: '#3D405B', accent: '#E9AFA3', background: '#FAF8F4', surface: '#FFFFFF', text: '#26263A', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 47, name: 'Calme Bleu-Vert', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#0369A1', secondary: '#0F766E', accent: '#A3E635', background: '#F6FBFC', surface: '#FFFFFF', text: '#132630', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 48, name: 'Magenta Moderne', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#A21CAF', secondary: '#4338CA', accent: '#FBBF24', background: '#FFF9FD', surface: '#FFFFFF', text: '#291630', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 49, name: 'Vert & Soleil', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#166534', secondary: '#0F3D2E', accent: '#FACC15', background: '#F8FCF7', surface: '#FFFFFF', text: '#17251B', textOnPrimary: '#FFFFFF', border: '#E2E8F0' },
  { id: 50, name: 'Atlantique Sénégal', category: 'education', categoryLabel: 'Éducation & Régional', primary: '#006B5A', secondary: '#0B3D4A', accent: '#E5B700', background: '#F6FBF9', surface: '#FFFFFF', text: '#132522', textOnPrimary: '#FFFFFF', border: '#E5E7EB' },
];

export const CATEGORY_FILTERS: Array<{ key: PresetCategory; label: string; icon: string }> = [
  { key: 'tous', label: 'Toutes les 50', icon: 'solar:palette-bold-duotone' },
  { key: 'education', label: 'Éducation & Sénégal', icon: 'solar:square-academic-cap-bold-duotone' },
  { key: 'bleus', label: 'Bleus Pros & SaaS', icon: 'solar:cloud-bold-duotone' },
  { key: 'verts', label: 'Verts & Nature', icon: 'solar:leaf-bold-duotone' },
  { key: 'violets', label: 'Violets & Prestige', icon: 'solar:crown-bold-duotone' },
  { key: 'chaudes', label: 'Chaudes & Énergie', icon: 'solar:fire-bold-duotone' },
  { key: 'neutres', label: 'Corporate & Neutres', icon: 'solar:buildings-bold-duotone' },
];

/**
 * Convertit un preset SaaS 50 en TenantPalette complet conforme au Design System
 */
export function convertPresetToTenantPalette(preset: SaaSColorPreset): TenantPalette {
  const dynamic = generatePaletteFromHex(preset.primary);
  return {
    primary: preset.primary,
    primaryLight: preset.background || dynamic.primaryLight,
    primaryDark: preset.secondary || dynamic.primaryDark,
    secondary: preset.secondary || dynamic.secondary,
    accent: preset.accent || dynamic.accent,
    surfaceWarm: preset.background || dynamic.surfaceWarm,
    textOnPrimary: preset.textOnPrimary || dynamic.textOnPrimary,
  };
}


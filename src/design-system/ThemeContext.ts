import { createContext } from 'react';
import type { SchoolTheme, ThemeColors } from './theme.types';

/** Contexte du thème de l'école (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export interface ThemeContextValue {
  theme: SchoolTheme;
  colors: ThemeColors;
  setPreviewPalette: (primaryHex: string) => void;
  clearPreview: () => void;
  isPreviewActive: boolean;
  saveTheme: (primaryHex: string) => Promise<void>;
  resetToDefault: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

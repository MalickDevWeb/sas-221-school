export interface ThemeColors {
  // Couleurs de marque (personnalisables par école)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  surfaceWarm: string;
  textOnPrimary: string;

  // Couleurs de surface et neutres (contrôlées par le Design System)
  surfacePage: string;
  surfaceCard: string;
  surfaceBorder: string;
  textBody: string;
  textMuted: string;

  // Couleurs fonctionnelles (protégées)
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
  statusInfo: string;
}

export interface SchoolTheme {
  schoolId?: string;
  slug: string;
  name: string;
  logoUrl?: string;
  colors: ThemeColors;
}


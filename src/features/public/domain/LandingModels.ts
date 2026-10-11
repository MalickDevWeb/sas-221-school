import { ROLE_UTILISATEUR, type RoleUtilisateur } from '@/shared/constants';

/**
 * Caractéristique ou pilier de la plateforme
 */
export interface FeatureItem {
  id: string;
  iconName: string;
  badge: string;
  badgeColor: string; // 'purple' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'teal'
  illustrationType: 'devices' | 'portals' | 'grades' | 'finance' | 'security' | 'attendance';
  title: string;
  description: string;
}

/**
 * Profil de démonstration interactive en 1 clic
 */
export interface ProfileDemoItem {
  role: string;
  icon: string;
  badge: string;
  badgeColor: string;
  illustrationType: 'admin' | 'pedagogy' | 'student' | 'family' | 'security' | 'saas';
  description: string;
  roleKey: RoleUtilisateur;
  demoUser: string;
  demoEmail: string;
  targetPath: string;
  btnText: string;
  btnColor: string;
  tags: string[];
}

/**
 * Forfait tarifaire de la plateforme
 */
export interface PricingPlan {
  id: string;
  name: string;
  target: string;
  price: string;
  period?: string;
  isPopular?: boolean;
  features: { text: string; icon?: string }[];
  ctaText: string;
  illustrationType: 'essential' | 'premium' | 'enterprise';
}

/**
 * Métriques clés de confiance de la plateforme
 */
export interface PlatformMetrics {
  schoolsCount: string;
  activeStudentsCount: string;
  uptimePercentage: string;
  averageResponseTime: string;
}

/**
 * Données saisies dans le formulaire de contact
 */
export interface ContactMessageFormData {
  nom: string;
  email: string;
  telephone: string;
  etablissement: string;
  message: string;
}

/**
 * Résultat de soumission du formulaire de contact
 */
export interface ContactSubmissionResult {
  success: boolean;
  referenceId?: string;
  message: string;
  receivedAt: string;
}

/**
 * Validateur pur du formulaire de contact (Domaine)
 */
export function validateContactForm(data: ContactMessageFormData): { isValid: boolean; errors: Partial<Record<keyof ContactMessageFormData, string>> } {
  const errors: Partial<Record<keyof ContactMessageFormData, string>> = {};

  if (!data.nom || !data.nom.trim()) {
    errors.nom = 'Le nom complet est obligatoire';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = "L'adresse email est obligatoire";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "L'adresse email n'est pas valide";
  }

  if (!data.telephone || !data.telephone.trim()) {
    errors.telephone = 'Le numéro de téléphone est obligatoire';
  }

  if (!data.etablissement || !data.etablissement.trim()) {
    errors.etablissement = "Le nom de l'établissement est obligatoire";
  }

  if (!data.message || !data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

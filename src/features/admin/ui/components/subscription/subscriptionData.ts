import { SubscriptionPlan, InvoiceItem, PaymentMethodInfo } from './subscriptionModels';

export const INITIAL_PLAN: SubscriptionPlan = {
  id: 'plan-advanced',
  name: 'Avancé',
  tagline: 'Idéal pour les établissements scolaires en forte expansion',
  priceMonthly: 50000,
  priceYearly: 500000,
  status: 'ACTIVE',
  billingCycle: 'monthly',
  endDate: '2026-01-01',
  features: [
    { code: 'MAX_STUDENTS', label: 'Élèves maximum', limit: 500, used: 420, iconName: 'users' },
    { code: 'MAX_TEACHERS', label: 'Enseignants & Staff', limit: 50, used: 38, iconName: 'teachers' },
    { code: 'MAX_CLASSES', label: 'Classes / Filières', limit: 25, used: 18, iconName: 'classes' },
  ]
};

export const INITIAL_INVOICES: InvoiceItem[] = [
  { id: 'INV-2025-001', date: '2025-01-01', amount: 500000, status: 'PAYÉ', desc: 'Abonnement Annuel Avancé', paymentMethod: 'Wave Business' },
  { id: 'INV-2024-012', date: '2024-12-01', amount: 50000, status: 'PAYÉ', desc: 'Abonnement Mensuel Avancé', paymentMethod: 'Orange Money' },
  { id: 'INV-2024-011', date: '2024-11-01', amount: 50000, status: 'PAYÉ', desc: 'Abonnement Mensuel Avancé', paymentMethod: 'Carte Visa' },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethodInfo[] = [
  { type: 'WAVE', label: 'Wave Business Pro', identifier: '+221 77 123 45 67', isDefault: true },
  { type: 'ORANGE_MONEY', label: 'Orange Money Marchand', identifier: '+221 78 987 65 43', isDefault: false },
  { type: 'CARD', label: 'Carte Visa Entreprise (BICI)', identifier: '•••• 4242 (Exp 08/28)', isDefault: false }
];

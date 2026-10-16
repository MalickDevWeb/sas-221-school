export interface QuotaFeature {
  code: string;
  label: string;
  limit: number;
  used: number;
  iconName: 'users' | 'teachers' | 'classes' | 'storage';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  billingCycle: 'monthly' | 'yearly';
  endDate: string;
  features: QuotaFeature[];
}

export interface InvoiceItem {
  id: string;
  date: string;
  amount: number;
  status: 'PAYÉ' | 'EN_ATTENTE' | 'ANNULÉ';
  desc: string;
  paymentMethod: string;
}

export interface PaymentMethodInfo {
  type: 'WAVE' | 'ORANGE_MONEY' | 'CARD';
  label: string;
  identifier: string;
  isDefault: boolean;
}

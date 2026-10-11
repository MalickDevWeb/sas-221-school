import { useState, useEffect } from 'react';
import type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
} from '../domain/LandingModels';
import {
  LANDING_FEATURES_DATA,
  PROFILE_DEMOS_DATA,
  PRICING_PLANS_DATA,
  DEFAULT_PLATFORM_METRICS,
} from '../infrastructure/local/LandingMockData';
import { getLandingContentUseCase } from '../infrastructure/config/dependencies';

export interface UseLandingContentReturn {
  features: FeatureItem[];
  profileDemos: ProfileDemoItem[];
  pricingPlans: PricingPlan[];
  metrics: PlatformMetrics;
  isLoading: boolean;
}

export function useLandingContent(): UseLandingContentReturn {
  const [features, setFeatures] = useState<FeatureItem[]>(LANDING_FEATURES_DATA);
  const [profileDemos, setProfileDemos] = useState<ProfileDemoItem[]>(PROFILE_DEMOS_DATA);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(PRICING_PLANS_DATA);
  const [metrics, setMetrics] = useState<PlatformMetrics>(DEFAULT_PLATFORM_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getLandingContentUseCase
      .execute()
      .then((data) => {
        if (!isMounted) return;
        setFeatures(data.features);
        setProfileDemos(data.profileDemos);
        setPricingPlans(data.pricingPlans);
        setMetrics(data.metrics);
      })
      .catch((err) => {
        console.warn('Chargement des contenus Landing en fallback local:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    features,
    profileDemos,
    pricingPlans,
    metrics,
    isLoading,
  };
}


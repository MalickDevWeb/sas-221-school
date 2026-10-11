import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  extractPaletteFromLogo,
  generatePaletteFromHex,
  type TenantPalette,
} from '@/shared/utils/colorExtractor';
import { useTenantStore } from '@/core/store/tenantStore';
import type { SchoolRegistrationFormData, RegisteredSchool } from '../domain/OnboardingModels';
import { sanitizeSchoolSlug } from '../domain/OnboardingModels';
import { registerSchoolUseCase, draftManagementUseCase } from '../infrastructure/config/dependencies';

export const DEFAULT_MY_SCHOOL_PALETTE: TenantPalette = generatePaletteFromHex('#7C3AED');

export interface UseSchoolRegistrationReturn {
  formData: SchoolRegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<SchoolRegistrationFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  palette: TenantPalette;
  applyPalette: (p: TenantPalette, presetName?: string) => void;
  activePreset: string;
  customHex: string;
  setCustomHex: (hex: string) => void;
  handleCustomHexChange: (hex: string) => void;
  logoPreview: string | null;
  isExtracting: boolean;
  extractedColors: string[];
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  step: number;
  setStep: (step: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  isLoading: boolean;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  registeredOrg: RegisteredSchool | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useSchoolRegistration(): UseSchoolRegistrationReturn {
  const [formData, setFormData] = useState<SchoolRegistrationFormData>({
    schoolName: '',
    slug: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
    primaryColor: DEFAULT_MY_SCHOOL_PALETTE.primary,
  });

  const [palette, setPalette] = useState<TenantPalette>(DEFAULT_MY_SCHOOL_PALETTE);
  const [activePreset, setActivePreset] = useState<string>('Violet Prestige');
  const [customHex, setCustomHex] = useState<string>('#7C3AED');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [registeredOrg, setRegisteredOrg] = useState<RegisteredSchool | null>(null);

  const isEcole221 =
    formData.slug?.toLowerCase() === 'ecole221' ||
    formData.schoolName?.toLowerCase().includes('ecole 221');

  // Synchronisation du thème dans le store global de l'application
  useEffect(() => {
    useTenantStore.getState().applyTheme({ primaryColor: palette.primary, palette });
    return () => useTenantStore.getState().rehydrateTheme();
  }, [palette]);

  const applyPalette = useCallback(
    (p: TenantPalette, presetName?: string) => {
      if (isEcole221) {
        toast.info('Palette officielle École 221 maintenue.');
        return;
      }
      setPalette(p);
      setCustomHex(p.primary);
      setActivePreset(presetName ?? 'Personnalisée');
      setFormData((prev) => ({ ...prev, primaryColor: p.primary }));
    },
    [isEcole221]
  );

  // Restauration automatique d'un brouillon sauvegardé en local
  useEffect(() => {
    const draft = draftManagementUseCase.loadDraft();
    if (draft && (draft.schoolName || draft.adminEmail)) {
      setFormData((prev) => ({
        ...prev,
        ...draft,
      }));
      if (draft.primaryColor) {
        applyPalette(generatePaletteFromHex(draft.primaryColor));
      }
    }
  }, [applyPalette]);

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      applyPalette(generatePaletteFromHex(hex));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setIsExtracting(true);
    try {
      const { colors, palette: extracted } = await extractPaletteFromLogo(file);
      setExtractedColors(colors);
      applyPalette(extracted);
      toast.success(`${colors.length} couleurs détectées avec succès dans votre logo !`);
    } catch {
      toast.error("Impossible d'analyser le logo.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'schoolName') {
        const prevAutoSlug = sanitizeSchoolSlug(prev.schoolName);
        if (!prev.slug || prev.slug === prevAutoSlug) {
          updated.slug = sanitizeSchoolSlug(value);
        }
      }
      return updated;
    });
  };

  const goToNextStep = () => setStep((s) => Math.min(s + 1, 3));
  const goToPrevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const submissionData: SchoolRegistrationFormData = {
      ...formData,
      slug: formData.slug?.trim() || sanitizeSchoolSlug(formData.schoolName) || `ecole-${Date.now()}`,
      primaryColor: palette.primary,
    };

    try {
      const result = await registerSchoolUseCase(submissionData);
      setRegisteredOrg(result);
      setShowSuccessModal(true);
      draftManagementUseCase.clearDraft();

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#06b6d4', '#10b981'],
      });

      toast.success('🎉 Inscription réussie !', {
        description: 'Votre cockpit établissement est prêt.',
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data;

      // Sauvegarde de secours en draft local en cas d'erreur serveur
      draftManagementUseCase.saveDraft(submissionData);

      if (status === 500) {
        const detail =
          typeof serverMessage === 'string'
            ? serverMessage.slice(0, 200)
            : 'Erreur interne serveur (500)';
        toast.warning('Serveur indisponible — données sauvegardées localement', {
          description: detail || 'Réessayez quand le backend sera prêt.',
          duration: 8000,
        });
      } else {
        toast.error(`Erreur ${status || 'réseau'}`, {
          description:
            typeof serverMessage === 'string'
              ? serverMessage
              : err?.message || 'Vérifiez votre connexion.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    palette,
    applyPalette,
    activePreset,
    customHex,
    setCustomHex,
    handleCustomHexChange,
    logoPreview,
    isExtracting,
    extractedColors,
    handleLogoUpload,
    step,
    setStep,
    goToNextStep,
    goToPrevStep,
    isLoading,
    showSuccessModal,
    setShowSuccessModal,
    registeredOrg,
    handleSubmit,
  };
}


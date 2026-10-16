import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { generatePaletteFromHex } from '@/shared/utils/colorExtractor';
import { useTenantStore } from '@/core/store/tenantStore';
import type { SchoolRegistrationFormData, RegisteredSchool } from '../domain/OnboardingModels';
import { sanitizeSchoolSlug } from '../domain/OnboardingModels';
import { registerSchoolUseCase, draftManagementUseCase } from '../infrastructure/config/dependencies';
import { safeApiCall } from '@/shared/lib/apiMiddleware';
import { isServerError } from '@/shared/errors/httpStatus';
import { normalizePhoneNumber } from '@/shared/utils/phoneUtils';
import { useSchoolBrandingPicker, DEFAULT_MY_SCHOOL_PALETTE } from './useSchoolBrandingPicker';
import { validateRegistrationStep3, mapRegistrationApiError } from './useSchoolRegistrationErrors';

export { DEFAULT_MY_SCHOOL_PALETTE };

const initialFormState: SchoolRegistrationFormData = {
  schoolName: '', slug: '', adminEmail: '', adminFirstName: '',
  adminLastName: '', adminPhone: '', adminPassword: '', adminPasswordConfirm: '',
  primaryColor: DEFAULT_MY_SCHOOL_PALETTE.primary,
};

export function useSchoolRegistration() {
  const [formData, setFormData] = useState<SchoolRegistrationFormData>(initialFormState);
  const branding = useSchoolBrandingPicker(formData.slug, formData.schoolName);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredOrg, setRegisteredOrg] = useState<RegisteredSchool | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; field?: string }>({
    isOpen: false, title: '', message: '',
  });

  useEffect(() => {
    const draft = draftManagementUseCase.loadDraft();
    if (draft?.schoolName || draft?.adminEmail) {
      setFormData((prev) => ({ ...prev, ...draft }));
      if (draft.primaryColor) branding.applyPalette(generatePaletteFromHex(draft.primaryColor));
    }
  }, [branding.applyPalette]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'schoolName' && (!prev.slug || prev.slug === sanitizeSchoolSlug(prev.schoolName))) {
        updated.slug = sanitizeSchoolSlug(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErrors = validateRegistrationStep3(formData);
    if (Object.keys(valErrors).length > 0) {
      setFieldErrors(valErrors);
      setErrorModal({ isOpen: true, title: 'Champs incomplets', message: 'Veuillez corriger les champs en rouge.' });
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    const subData: SchoolRegistrationFormData = {
      ...formData,
      adminPhone: normalizePhoneNumber(formData.adminPhone),
      slug: formData.slug?.trim() || sanitizeSchoolSlug(formData.schoolName) || `ecole-${Date.now()}`,
      primaryColor: branding.palette.primary,
    };

    const { data: res, isSuccess, error, errorCode, status } = await safeApiCall<RegisteredSchool>(
      registerSchoolUseCase(subData),
      { context: 'Inscription', successMessage: '🎉 Inscription réussie !', showToastOnError: false }
    );
    setIsLoading(false);

    if (!isSuccess || !res) {
      if (isServerError(status)) draftManagementUseCase.saveDraft(subData);
      const mapped = mapRegistrationApiError(errorCode, error);
      setFieldErrors(mapped.fieldErrors);
      setErrorModal({ isOpen: true, title: mapped.modalTitle, message: mapped.modalMessage, field: mapped.modalField });
      return;
    }

    setRegisteredOrg(res);
    setShowSuccessModal(true);
    draftManagementUseCase.clearDraft();
    const theme = { primaryColor: subData.primaryColor, palette: branding.palette };
    useTenantStore.setState({
      currentTenant: { id: res.id, name: res.name || subData.schoolName, slug: subData.slug, branding: theme },
    });
    useTenantStore.getState().applyTheme(theme);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  return {
    formData,
    setFormData,
    handleChange,
    ...branding,
    step,
    setStep,
    goToNextStep: () => setStep((s) => Math.min(s + 1, 3)),
    goToPrevStep: () => setStep((s) => Math.max(s - 1, 1)),
    isLoading,
    showSuccessModal,
    setShowSuccessModal,
    registeredOrg,
    fieldErrors,
    errorModal,
    closeErrorModal: () => setErrorModal((prev) => ({ ...prev, isOpen: false })),
    handleSubmit,
  };
}

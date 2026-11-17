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
import { validateRegistrationStep1, validateRegistrationStep3, mapRegistrationApiError } from './useSchoolRegistrationErrors';
import { useReglesMotDePasse } from '@/features/auth/infrastructure/api/reglesMotDePasseApi';
import { useAvailabilityCheck, verifierDisponibilite } from './useAvailabilityCheck';

export { DEFAULT_MY_SCHOOL_PALETTE };

/** Identifiant (slug) déjà pris par une autre école : message sous le champ de l'étape 1. */
export const MESSAGE_SLUG_PRIS =
  'Cet identifiant est déjà pris par un autre établissement. Choisissez-en un autre (par exemple en ajoutant votre ville : lycee-thies).';
const MESSAGE_EMAIL_PRIS =
  "Cette adresse e-mail a déjà un compte My School. Si c'est la vôtre, connectez-vous (lien en bas de page) ; sinon, utilisez une autre adresse.";
const MESSAGE_TELEPHONE_PRIS = 'Ce numéro est déjà associé à un compte My School : utilisez un autre numéro.';

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
  // Règles du mot de passe de l'administration d'école, données par le serveur
  const longueurMin = useReglesMotDePasse('ADMIN').data?.longueurMin ?? null;
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; field?: string }>({
    isOpen: false, title: '', message: '',
  });
  // Disponibilité de l'identifiant pendant la saisie (affichage à l'étape 1) et vérification immédiate au changement d'étape
  const { slugStatus } = useAvailabilityCheck(undefined, undefined, formData.slug);
  const [verificationEnCours, setVerificationEnCours] = useState(false);

  /** Messages sous les champs, curseur sur le premier champ en erreur (délai : l'étape visée peut être en train de s'afficher). */
  const signalerErreurs = (erreurs: Record<string, string>, delai = 0) => {
    setFieldErrors(erreurs);
    const premier = Object.keys(erreurs)[0];
    window.setTimeout(() => requestAnimationFrame(() => {
      const champ = document.querySelector<HTMLElement>(`[name="${premier}"]`);
      champ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      champ?.focus({ preventScroll: true });
    }), delai);
  };

  /**
   * Étape 1 valide = format correct ET identifiant libre (sinon un identifiant déjà pris n'est refusé qu'à l'envoi
   * final).
   */
  const validerEtape1 = async (): Promise<boolean> => {
    const erreurs = validateRegistrationStep1(formData);
    if (Object.keys(erreurs).length > 0) {
      signalerErreurs(erreurs);
      return false;
    }
    if (slugStatus === 'unavailable') {
      signalerErreurs({ slug: MESSAGE_SLUG_PRIS });
      return false;
    }
    setVerificationEnCours(true);
    const dispo = await verifierDisponibilite({ slug: formData.slug.trim() });
    setVerificationEnCours(false);
    if (dispo?.slugAvailable === false) {
      signalerErreurs({ slug: MESSAGE_SLUG_PRIS });
      return false;
    }
    return true;   // serveur injoignable (null) : on laisse continuer, l'envoi final revérifie
  };

  const goToNextStep = async () => {
    if (verificationEnCours) return;
    if (step === 1 && !(await validerEtape1())) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  /** Indicateur d'étapes : revenir en arrière est libre ; avancer passe par la même vérification que « Continuer ». */
  const allerAEtape = async (cible: number) => {
    if (cible <= step) {
      setStep(cible);
      return;
    }
    if (verificationEnCours) return;
    if (step === 1 && !(await validerEtape1())) return;
    setStep(cible);
  };

  useEffect(() => {
    const draft = draftManagementUseCase.loadDraft();
    if (draft?.schoolName || draft?.adminEmail) {
      setFormData((prev) => ({ ...prev, ...draft }));
      if (draft.primaryColor) branding.applyPalette(generatePaletteFromHex(draft.primaryColor));
    }
  }, [branding.applyPalette]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (e.target.type === 'checkbox') {   // case d'accord pour être contacté (consentementContact)
      const coche = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: coche }));
      return;
    }
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
    // Les trois étapes sont dans un seul formulaire : « Entrée » aux étapes 1 et 2 fait passer à l'étape suivante,
    // avec les mêmes vérifications que « Continuer ».
    if (step < 3) {
      await goToNextStep();
      return;
    }
    const valErrors = validateRegistrationStep3(formData, longueurMin);
    if (Object.keys(valErrors).length > 0) {
      // Champs vides ou invalides → on reste sur le formulaire, sans fenêtre ni appel au serveur ; les
      // messages sont sous les champs et le curseur va au premier champ en erreur.
      signalerErreurs(valErrors);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    // Dernière vérification juste avant l'envoi (une autre école a pu prendre l'identifiant, l'e-mail ou le
    // numéro entre-temps) : message sous le champ concerné, sans fenêtre ; identifiant pris → retour à l'étape 1.
    const dispo = await verifierDisponibilite({
      slug: formData.slug?.trim(),
      email: formData.adminEmail?.trim(),
      phone: normalizePhoneNumber(formData.adminPhone),
    });
    if (dispo?.slugAvailable === false) {
      setIsLoading(false);
      setStep(1);
      signalerErreurs({ slug: MESSAGE_SLUG_PRIS }, 400);
      return;
    }
    const pris: Record<string, string> = {};
    if (dispo?.emailAvailable === false) pris.adminEmail = MESSAGE_EMAIL_PRIS;
    if (dispo?.phoneAvailable === false) pris.adminPhone = MESSAGE_TELEPHONE_PRIS;
    if (Object.keys(pris).length > 0) {
      setIsLoading(false);
      signalerErreurs(pris);
      return;
    }
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
      if (mapped.fieldErrors.slug) {
        // Identifiant refusé par le serveur (cas rare : pris entre la vérification et l'envoi) : retour à l'étape 1, où se
        // trouve le champ, au lieu d'une fenêtre qui laissait l'utilisateur à l'étape 3.
        setStep(1);
        signalerErreurs({ slug: MESSAGE_SLUG_PRIS }, 400);
        return;
      }
      setFieldErrors(mapped.fieldErrors);
      if (mapped.sousLeChampSeulement) {
        // refus du mot de passe : message sous le champ, curseur sur le champ (pas de fenêtre)
        const champ = Object.keys(mapped.fieldErrors)[0];
        requestAnimationFrame(() => document.querySelector<HTMLElement>(`[name="${champ}"]`)?.focus());
        return;
      }
      setErrorModal({ isOpen: true, title: mapped.modalTitle, message: mapped.modalMessage, field: mapped.modalField });
      return;
    }

    setRegisteredOrg(res);
    setShowSuccessModal(true);
    draftManagementUseCase.clearDraft();
    const theme = { primaryColor: subData.primaryColor, palette: branding.palette };
    useTenantStore.setState({
      // Une école qui vient de s'inscrire est en attente : sans statut, « Accéder au portail » réutiliserait cette
      // copie (resolveTenant) et montrerait le formulaire de connexion au lieu de l'écran « en attente de validation ».
      currentTenant: { id: res.id, name: res.name || subData.schoolName, slug: subData.slug, branding: theme,
        statut: (res.status?.value ?? 'PENDING').toUpperCase() },
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
    allerAEtape,
    // Étape 1 : format ET disponibilité de l'identifiant vérifiés avant de continuer
    goToNextStep,
    goToPrevStep: () => setStep((s) => Math.max(s - 1, 1)),
    slugStatus,
    verificationEnCours,
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

import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { ContactMessageFormData } from '../domain/LandingModels';
import { submitContactFormUseCase } from '../infrastructure/config/dependencies';

export interface UseContactFormReturn {
  formData: ContactMessageFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactMessageFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  resetForm: () => void;
  referenceId: string | null;
}

const INITIAL_FORM: ContactMessageFormData = {
  nom: '',
  email: '',
  telephone: '',
  etablissement: '',
  message: '',
};

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactMessageFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setIsSubmitted(false);
    setReferenceId(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContactFormUseCase.execute(formData);
      setIsSubmitted(true);
      setReferenceId(result.referenceId || null);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#10b981'],
      });

      toast.success('Demande envoyée avec succès !', {
        description: 'Un conseiller My School vous contactera sous 24h.',
      });
    } catch (err: any) {
      toast.error('Erreur de validation', {
        description: err.message || 'Veuillez vérifier les informations renseignées.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isSubmitting,
    isSubmitted,
    resetForm,
    referenceId,
  };
}


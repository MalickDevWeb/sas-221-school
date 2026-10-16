import React from 'react';
import { motion } from 'motion/react';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import type { SchoolRegistrationFormData } from '../../domain/OnboardingModels';
import { AdminContactFields } from './AdminContactFields';
import { AdminPasswordFields } from './AdminPasswordFields';
import { AdminAccountSummary } from './AdminAccountSummary';

interface AdminAccountStepFormProps {
  formData: SchoolRegistrationFormData;
  palette: TenantPalette;
  activePreset: string;
  isLoading: boolean;
  fieldErrors?: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onModifyPalette: () => void;
}

export const AdminAccountStepForm: React.FC<AdminAccountStepFormProps> = ({
  formData,
  palette,
  activePreset,
  isLoading,
  fieldErrors = {},
  onChange,
  onPrev,
  onModifyPalette,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <AdminContactFields
        firstName={formData.adminFirstName}
        lastName={formData.adminLastName}
        email={formData.adminEmail}
        phone={formData.adminPhone}
        fieldErrors={fieldErrors}
        onChange={onChange}
      />

      <AdminPasswordFields
        password={formData.adminPassword}
        confirmPassword={formData.adminPasswordConfirm}
        error={fieldErrors.adminPassword}
        confirmError={fieldErrors.adminPasswordConfirm}
        onChange={onChange}
      />

      <AdminAccountSummary
        formData={formData}
        palette={palette}
        activePreset={activePreset}
        isLoading={isLoading}
        onPrev={onPrev}
        onModifyPalette={onModifyPalette}
      />
    </motion.div>
  );
};

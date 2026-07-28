import { useState } from 'react';
import { AdmissionType } from '../../../domain/AdmissionsExtendedModels';

export interface Rule {
  type: AdmissionType;
  label: string;
  minCredits?: number;
  minExperienceYears?: number;
  requiresTranscripts: boolean;
  requiresPassportAndVisa: boolean;
  autoCheckPastEnrollment: boolean;
  requiresOfficialDecision: boolean;
}

export const INITIAL_RULES: Rule[] = [
  { type: 'BAC', label: 'Nouveau Bachelier', requiresTranscripts: false, requiresPassportAndVisa: false, autoCheckPastEnrollment: false, requiresOfficialDecision: false },
  { type: 'L2', label: 'Admission L2', minCredits: 60, requiresTranscripts: true, requiresPassportAndVisa: false, autoCheckPastEnrollment: false, requiresOfficialDecision: false },
  { type: 'L3', label: 'Admission L3', minCredits: 120, requiresTranscripts: true, requiresPassportAndVisa: false, autoCheckPastEnrollment: false, requiresOfficialDecision: false },
  { type: 'TRANSFER', label: 'Transfert Universitaire', minCredits: 60, requiresTranscripts: true, requiresPassportAndVisa: false, autoCheckPastEnrollment: false, requiresOfficialDecision: false },
  { type: 'REINSCRIPTION', label: 'Réinscription Interne', requiresTranscripts: false, requiresPassportAndVisa: false, autoCheckPastEnrollment: true, requiresOfficialDecision: false },
  { type: 'INT', label: 'Étudiant International', requiresTranscripts: true, requiresPassportAndVisa: true, autoCheckPastEnrollment: false, requiresOfficialDecision: false },
  { type: 'VAE', label: 'Validation des Acquis (VAE)', minExperienceYears: 3, requiresTranscripts: true, requiresPassportAndVisa: false, autoCheckPastEnrollment: false, requiresOfficialDecision: false },
  { type: 'EXCEPT', label: 'Admission Exceptionnelle', requiresTranscripts: false, requiresPassportAndVisa: false, autoCheckPastEnrollment: false, requiresOfficialDecision: true }
];

export function useAdmissionsRules() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number>(0);

  const updateRule = (index: number, fields: Partial<Rule>) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, ...fields } : r));
  };

  const active = rules[selectedRuleIndex];

  return { rules, selectedRuleIndex, setSelectedRuleIndex, updateRule, active };
}

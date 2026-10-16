import { useState } from 'react';
import { EquivalenceDetails } from '../../../domain/AdmissionsExtendedModels';

export function useEquivalencePanel(initialEquivalence: EquivalenceDetails | undefined, onSave: (eq: EquivalenceDetails) => void) {
  const [comparedProgram, setComparedProgram] = useState(initialEquivalence?.comparedProgram || '');
  const [validatedCredits, setValidatedCredits] = useState(initialEquivalence?.validatedCredits || 0);
  const [dispense, setDispense] = useState('');
  const [dispenses, setDispenses] = useState<string[]>(initialEquivalence?.dispenses || []);
  const [complement, setComplement] = useState('');
  const [complements, setComplements] = useState<string[]>(initialEquivalence?.complements || []);

  const handleAddDispense = () => {
    if (dispense.trim()) {
      setDispenses([...dispenses, dispense.trim()]);
      setDispense('');
    }
  };

  const handleAddComplement = () => {
    if (complement.trim()) {
      setComplements([...complements, complement.trim()]);
      setComplement('');
    }
  };

  const handleSave = () => {
    onSave({
      status: 'approved',
      comparedProgram,
      validatedCredits,
      dispenses,
      complements,
      decisionBy: 'Commission des Équivalences',
      decisionDate: new Date().toISOString()
    });
  };

  return {
    comparedProgram, setComparedProgram,
    validatedCredits, setValidatedCredits,
    dispense, setDispense,
    dispenses, handleAddDispense,
    complement, setComplement,
    complements, handleAddComplement,
    handleSave
  };
}

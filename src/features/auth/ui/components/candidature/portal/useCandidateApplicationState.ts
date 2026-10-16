import { useState } from 'react';
import {
  Campaign, getAdmissionsDb, saveAdmissionsDb, addAuditLog,
  PersonalDetails, GuardianDetails, AcademicDetails, DocumentsState, PaymentDetails
} from './admissionsDb';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';

export function useCandidateApplicationState(campaign: Campaign, onSuccess: (c: ExtendedCandidate) => void) {
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<PersonalDetails>({
    firstName: '', lastName: '', gender: 'M', birthDate: '2005-09-15',
    birthPlace: 'Dakar', nationality: 'Sénégalaise', cniNumber: '',
    phone: '', email: '', address: 'Sacré-Cœur 3', city: 'Dakar'
  });
  const [guardian, setGuardian] = useState<GuardianDetails>({
    fullName: '', relationship: 'Père', phone: '', email: '', profession: 'Cadre d’entreprise'
  });
  const [academic, setAcademic] = useState<AcademicDetails>({
    previousSchool: 'Lycée Seydina Limamoulaye', bacSeries: 'S2', bacYear: '2026',
    bacMention: 'Bien', targetLevel: campaign.level || 'Licence 1',
    targetFiliere: campaign.title, intakeSession: campaign.intake || 'Octobre 2026'
  });
  const [docs, setDocs] = useState<DocumentsState>({ idCard: null, diploma: null, transcripts: null, photo: null });
  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'WAVE', isPaid: false, transactionRef: '', amount: campaign.fees || 25000
  });
  const [credentials, setCredentials] = useState({ password: '', confirm: '', accept: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const simulateDocUpload = (key: keyof DocumentsState, label: string) => {
    setDocs((prev: DocumentsState) => ({
      ...prev,
      [key]: { name: `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2026.pdf`, size: '1.4 Mo', uploadedAt: new Date().toLocaleTimeString('fr-FR'), status: 'uploaded' }
    }));
  };

  const removeDoc = (key: keyof DocumentsState) => {
    setDocs((prev: DocumentsState) => ({ ...prev, [key]: null }));
  };

  const simulatePayment = (method: 'WAVE' | 'ORANGE_MONEY' | 'CARD') => {
    const prefix = method === 'WAVE' ? 'WAVE-SN' : method === 'ORANGE_MONEY' ? 'OM-SN' : 'CARD-VISA';
    const ref = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    setPayment({ method, isPaid: true, transactionRef: ref, amount: campaign.fees || 25000, paidAt: new Date().toISOString() });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (credentials.password.length < 6) return setError('Le mot de passe doit comporter au moins 6 caractères.');
    if (credentials.password !== credentials.confirm) return setError('Les mots de passe ne correspondent pas.');
    if (!credentials.accept) return setError('Veuillez accepter la charte et le règlement des admissions.');
    setIsSubmitting(true);

    const db = getAdmissionsDb();
    const candId = `CAND-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const newCandidate: ExtendedCandidate = {
      id: candId,
      name: `${personal.firstName} ${personal.lastName}`.trim(),
      email: personal.email.trim(),
      type: campaign.code,
      course: academic.targetFiliere,
      step: 'new',
      docs: { idCard: Boolean(docs.idCard), diploma: Boolean(docs.diploma), transcripts: Boolean(docs.transcripts) },
      registrationFeePaid: payment.isPaid,
      notifications: [
        { id: `not-${Date.now()}`, type: 'creation_compte', message: `Dossier #${candId} déposé pour ${academic.targetFiliere}.`, sentAt: new Date().toISOString() }
      ]
    };

    saveAdmissionsDb({ candidates: [...db.candidates, newCandidate] });
    addAuditLog(candId, `Dépôt officiel candidature (${academic.targetFiliere})`, newCandidate.name);

    try {
      await fetch('/api/candidatures/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candId,
          nom: personal.lastName,
          prenom: personal.firstName,
          email: personal.email,
          telephone: personal.phone,
          filiere: academic.targetFiliere,
          niveau: academic.targetLevel,
          fraisPayes: payment.isPaid,
          modePaiement: payment.method,
          referencePaiement: payment.transactionRef,
        }),
      });
    } catch {
      // Synchronisation locale assurée
    }

    setIsSubmitting(false);
    onSuccess(newCandidate);
  };

  return {
    step, setStep, personal, setPersonal, guardian, setGuardian,
    academic, setAcademic, docs, simulateDocUpload, removeDoc,
    payment, simulatePayment, credentials, setCredentials,
    error, setError, isSubmitting, handleFinalSubmit
  };
}

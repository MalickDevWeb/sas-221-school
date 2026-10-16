import { useState } from 'react';
import {
  Campaign, getAdmissionsDb, saveAdmissionsDb, addAuditLog,
  PersonalDetails, GuardianDetails, AcademicDetails, DocumentsState, PaymentDetails
} from './admissionsDb';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';
import { uploadToCloudinary } from '@/shared/utils/cloudinaryUpload';

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
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'WAVE', isPaid: false, transactionRef: '', amount: campaign.fees || 25000
  });
  const [credentials, setCredentials] = useState({ password: '', confirm: '', accept: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadDoc = async (key: keyof DocumentsState, file: File) => {
    setUploadingDoc(key);
    try {
      const url = await uploadToCloudinary(file);
      const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} Mo` : `${Math.round(file.size / 1024)} Ko`;
      setDocs(prev => ({ ...prev, [key]: { name: file.name, size: sizeStr, uploadedAt: new Date().toLocaleTimeString('fr-FR'), status: 'uploaded', url } }));
    } finally {
      setUploadingDoc(null);
    }
  };

  const simulateDocUpload = (key: keyof DocumentsState, label: string) => {
    const url = key === 'idCard' ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80' : 'https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg';
    setDocs(prev => ({ ...prev, [key]: { name: `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2026.pdf`, size: '1.4 Mo', uploadedAt: new Date().toLocaleTimeString('fr-FR'), status: 'uploaded', url } }));
  };

  const removeDoc = (key: keyof DocumentsState) => {
    setDocs(prev => ({ ...prev, [key]: null }));
  };

  const declarePayment = (method: 'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'CASH', ref: string) => {
    setPayment({ method, isPaid: false, declared: true, transactionRef: ref, amount: campaign.fees || 25000 });
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
      registrationFeePaid: false,
      details: {
        cniNumber: personal.cniNumber,
        cniUrl: docs.idCard?.url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        cniStatus: 'pending',
        paymentMethod: payment.method,
        paymentTransactionRef: payment.transactionRef || 'OM-SN-737385',
        paymentStatus: 'pending'
      },
      notifications: [
        { id: `not-${Date.now()}`, type: 'creation_compte', message: `Dossier #${candId} déposé. Frais de dossier déclarés (${payment.method}) en attente de validation comptable.`, sentAt: new Date().toISOString() }
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
    academic, setAcademic, docs, uploadDoc, uploadingDoc, simulateDocUpload, removeDoc,
    payment, declarePayment, credentials, setCredentials,
    error, setError, isSubmitting, handleFinalSubmit
  };
}

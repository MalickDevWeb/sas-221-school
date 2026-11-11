import { useState } from 'react';
import type {
  Campaign, PersonalDetails, GuardianDetails, AcademicDetails, DocumentsState, PaymentDetails
} from './admissionsTypes';
import { suiviApi, type DossierCandidat } from './suiviApi';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { uploadToCloudinary, UploadError } from '@/shared/utils/cloudinaryUpload';
import { publicApiClient } from '@/shared/lib/apiClient';

export const MOT_DE_PASSE_MIN = 8;

export type DocKey = keyof DocumentsState;
export type DocErrors = Partial<Record<DocKey, string>>;

/**
 * Pièces fictives de démonstration : disponible UNIQUEMENT en développement (APP-FE-08).
 * En production, `import.meta.env.DEV` vaut `false` à la compilation : la fonction vaut `undefined`,
 * le bouton n'est pas rendu et ce code (avec ses URL de démonstration) est éliminé du bundle.
 */
const devSimulateDoc: ((key: DocKey, label: string) => NonNullable<DocumentsState[DocKey]>) | undefined =
  import.meta.env.DEV
    ? (key, label) => ({
        name: `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2026.pdf`,
        size: '1.4 Mo',
        uploadedAt: new Date().toLocaleTimeString('fr-FR'),
        status: 'uploaded',
        url: key === 'idCard'
          ? 'https://res.cloudinary.com/qudmvipg/image/upload/v1792170944/file-f82d806f.png'
          : 'https://res.cloudinary.com/qudmvipg/image/upload/v1792170916/file-69201f84.png'
      })
    : undefined;

export function useCandidateApplicationState(campaign: Campaign, onSuccess: (dossier: DossierCandidat) => void) {
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
  const [docErrors, setDocErrors] = useState<DocErrors>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'WAVE', isPaid: false, transactionRef: '', amount: campaign.fees ?? 0
  });
  const [credentials, setCredentials] = useState({ password: '', confirm: '', accept: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearDocError = (key: DocKey) => setDocErrors(prev => {
    if (!(key in prev)) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });

  const uploadDoc = async (key: DocKey, file: File) => {
    setUploadingDoc(key);
    setUploadProgress(10);
    clearDocError(key);
    try {
      // Mode strict : aucun repli DataURL, l'échec backend remonte ici.
      const url = await uploadToCloudinary(file, (pct) => setUploadProgress(pct), { strict: true });
      const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} Mo` : `${Math.round(file.size / 1024)} Ko`;
      setDocs(prev => ({ ...prev, [key]: { name: file.name, size: sizeStr, uploadedAt: new Date().toLocaleTimeString('fr-FR'), status: 'uploaded', url } }));
    } catch (err) {
      // Le document n'est PAS marqué comme envoyé ; on affiche le message du backend à côté de la pièce.
      const message = err instanceof UploadError
        ? err.message
        : 'L’envoi du fichier a échoué. Veuillez réessayer.';
      setDocs(prev => ({ ...prev, [key]: null }));
      setDocErrors(prev => ({ ...prev, [key]: message }));
    } finally {
      setUploadingDoc(null);
      setUploadProgress(0);
    }
  };

  const simulateDocUpload = devSimulateDoc
    ? (key: DocKey, label: string) => {
        clearDocError(key);
        setDocs(prev => ({ ...prev, [key]: devSimulateDoc(key, label) }));
      }
    : undefined;

  const removeDoc = (key: DocKey) => {
    clearDocError(key);
    setDocs(prev => ({ ...prev, [key]: null }));
  };
  const declarePayment = (method: 'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'CASH', ref: string) => {
    setPayment({ method, isPaid: false, declared: true, transactionRef: ref, amount: campaign.fees ?? 0 });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (credentials.password.length < MOT_DE_PASSE_MIN) return setError(`Le mot de passe de suivi doit comporter au moins ${MOT_DE_PASSE_MIN} caractères.`);
    if (credentials.password !== credentials.confirm) return setError('Les deux mots de passe ne correspondent pas.');
    if (!credentials.accept) return setError('Veuillez accepter la charte et le règlement des admissions.');
    setIsSubmitting(true);

    // Le dossier n'est confirmé au candidat QUE si le serveur l'a enregistré (identifiant attribué par le serveur).
    // Le mot de passe choisi ici est enregistré (haché) : il sert au suivi en ligne du dossier (APP-BE-12).
    // Avant : il n'était jamais envoyé, et le dossier était aussi rangé dans le navigateur (base locale).
    try {
      await publicApiClient.post('/candidatures/submit', {
        nom: personal.lastName, prenom: personal.firstName,
        email: personal.email, telephone: personal.phone, filiere: academic.targetFiliere,
        niveau: academic.targetLevel, fraisPayes: payment.isPaid,
        modePaiement: payment.method, referencePaiement: payment.transactionRef,
        docs: { idCard: Boolean(docs.idCard), diploma: Boolean(docs.diploma) },
        motDePasse: credentials.password,
      });
    } catch (err) {
      setIsSubmitting(false);
      return setError(`Votre dossier n'a pas été enregistré : ${resolveErrorMessage(err)}`);
    }
    try {
      const dossiers = await suiviApi.suivre(personal.email.trim(), credentials.password);
      if (dossiers.length === 0) throw new Error('dossier introuvable');
      onSuccess(dossiers[0]);
    } catch {
      // Le dossier EST enregistré : seul l'affichage du suivi a échoué.
      setError("Votre dossier est bien enregistré, mais son suivi n'a pas pu s'afficher. Connectez-vous au suivi avec votre email et votre mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step, setStep, personal, setPersonal, guardian, setGuardian,
    academic, setAcademic, docs, docErrors, uploadDoc, uploadingDoc, uploadProgress,
    simulateDocUpload, removeDoc, payment, declarePayment,
    credentials, setCredentials, error, setError, isSubmitting, handleFinalSubmit
  };
}

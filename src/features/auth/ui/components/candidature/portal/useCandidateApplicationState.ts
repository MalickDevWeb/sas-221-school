import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Campaign, DocumentsState, PaymentDetails } from './admissionsTypes';
import { schemaCandidature, valeursInitiales, CHAMPS_ETAPE, type Candidature } from './schemaCandidature';
import { suiviApi, type DossierCandidat } from './suiviApi';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { uploadToCloudinary, UploadError } from '@/shared/utils/cloudinaryUpload';
import { publicApiClient } from '@/shared/lib/apiClient';
import { usePiecesRegles } from './usePiecesRegles';

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
  const form = useForm<Candidature>({
    resolver: zodResolver(schemaCandidature),
    defaultValues: valeursInitiales(campaign),
    mode: 'onTouched',
  });
  const [docs, setDocs] = useState<DocumentsState>({ idCard: null, diploma: null, transcripts: null, photo: null });
  const [docErrors, setDocErrors] = useState<DocErrors>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'WAVE', isPaid: false, transactionRef: '', amount: campaign.fees ?? 0
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 16/11 : pièces exigées par les règles d'admission de l'école, d'après les réponses (étapes 1 à 3)
  const regles = usePiecesRegles();
  const { evaluer } = regles;
  useEffect(() => {
    if (step !== 4) return;
    const v = form.getValues();
    void evaluer({
      campagneId: campaign.id, nationalite: v.nationality, sexe: v.gender, dateNaissance: v.birthDate,
      serieBac: v.bacSeries, mentionBac: v.bacMention, anneeBac: v.bacYear,
    });
  }, [step, form, campaign.id, evaluer]);

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
      const url = await uploadToCloudinary(file, (pct) => setUploadProgress(pct), { strict: true, confidentiel: true });
      const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} Mo` : `${Math.round(file.size / 1024)} Ko`;
      setDocs(prev => {
        const avant = prev[key]?.apercu?.url;
        if (avant) URL.revokeObjectURL(avant);
        return { ...prev, [key]: { name: file.name, size: sizeStr, uploadedAt: new Date().toLocaleTimeString('fr-FR'), status: 'uploaded', url,
          apercu: { url: URL.createObjectURL(file), type: file.type } } };
      });
    } catch (err) {
      // Le document n'est PAS marqué comme envoyé ; on affiche le message du backend à côté de la pièce.
      const message = err instanceof UploadError
        ? err.message
        : 'L’envoi du fichier a échoué. Veuillez réessayer.';
      setDocs(prev => ({ ...prev, [key]: null }));
      setDocErrors(prev => ({ ...prev, [key]: `Non envoyé : ${message}` }));
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

  /** Pièces obligatoires manquantes → message sous chaque pièce (avant : bouton grisé sans explication). */
  const verifierPieces = (): boolean => {
    const manquantes: DocErrors = {};
    for (const [cle, libelle] of PIECES_OBLIGATOIRES) {
      if (!docs[cle]?.url) manquantes[cle] = `Pièce manquante : joignez ${libelle}.`;
    }
    setDocErrors(prev => ({ ...prev, ...manquantes }));
    const reglesOk = regles.verifier();
    return Object.keys(manquantes).length === 0 && reglesOk;
  };

  /** Étape suivante seulement si l'étape courante est valide ; les erreurs s'affichent sous les champs. */
  const suivant = async () => {
    setError('');
    if (step === 4) {
      if (uploadingDoc || regles.envoiEnCours) return setError('Patientez : une pièce est encore en cours d’envoi.');
      if (regles.blocages.length > 0) return setError(`Votre dossier ne peut pas être déposé : ${regles.blocages[0]}`);
      if (verifierPieces()) setStep(5);
      return;
    }
    const champs = CHAMPS_ETAPE[step];
    if (!champs || await form.trigger(champs, { shouldFocus: true })) setStep(s => s + 1);
  };
  const precedent = () => { setError(''); setStep(s => Math.max(1, s - 1)); };

  const envoyer = async (v: Candidature) => {
    if (!verifierPieces()) {
      setStep(4);
      return;
    }
    setIsSubmitting(true);
    // Le dossier n'est confirmé au candidat QUE si le serveur l'a enregistré (identifiant attribué par le serveur).
    // Le mot de passe choisi ici est enregistré (haché) : il sert au suivi en ligne du dossier (APP-BE-12).
    // Toutes les informations saisies sont transmises (avant : seuls nom, email, téléphone et filière partaient ;
    // le garant, le cursus et les fichiers des pièces étaient perdus).
    try {
      await publicApiClient.post('/candidatures/submit', {
        nom: v.lastName, prenom: v.firstName,
        email: v.email, telephone: v.phone, filiere: campaign.title,
        niveau: v.targetLevel, sessionRentree: campaign.intake || undefined,
        dateNaissance: v.birthDate, lieuNaissance: v.birthPlace, sexe: v.gender, nationalite: v.nationality,
        numeroPiece: v.cniNumber, adresse: v.address,
        etablissementPrecedent: v.previousSchool, serieBac: v.bacSeries, anneeBac: v.bacYear, mentionBac: v.bacMention,
        garant: {
          nom: v.guardianName, lien: v.guardianRelationship, telephone: v.guardianPhone,
          email: v.guardianEmail, profession: v.guardianProfession,
        },
        pieces: {
          pieceIdentite: docs.idCard?.url, diplome: docs.diploma?.url,
          releves: docs.transcripts?.url, photo: docs.photo?.url,
        },
        fraisPayes: payment.isPaid,
        modePaiement: payment.declared ? payment.method : undefined,
        referencePaiement: payment.transactionRef,
        motDePasse: v.password,
        // 16/11 : session choisie et pièces exigées par les règles de l'école (vérifiées aussi par le serveur)
        campagneId: campaign.id,
        piecesSupplementaires: regles.corps(),
      });
    } catch (err) {
      setIsSubmitting(false);
      return setError(`Votre dossier n'a pas été enregistré : ${resolveErrorMessage(err)}`);
    }
    try {
      const dossiers = await suiviApi.suivre(v.email.trim(), v.password);
      if (dossiers.length === 0) throw new Error('dossier introuvable');
      onSuccess(dossiers[0]);
    } catch {
      // Le dossier EST enregistré : seul l'affichage du suivi a échoué.
      setError("Votre dossier est bien enregistré, mais son suivi n'a pas pu s'afficher. Connectez-vous au suivi avec votre email et votre mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    void form.handleSubmit(envoyer, (erreurs) => {
      // Erreur sur une étape précédente : on y retourne pour la montrer.
      const etape = [1, 2, 3, 6].find(n => CHAMPS_ETAPE[n].some(c => c in erreurs));
      if (etape && etape !== step) setStep(etape);
    })();
  };

  return {
    form, step, setStep, suivant, precedent, docs, docErrors, uploadDoc, uploadingDoc, uploadProgress,
    simulateDocUpload, removeDoc, payment, declarePayment, error, setError, isSubmitting, handleFinalSubmit, regles
  };
}

/** Pièces exigées (le serveur les exige aussi) ; la photo reste facultative. */
const PIECES_OBLIGATOIRES: [DocKey, string][] = [
  ['idCard', "votre pièce d'identité (CNI ou passeport)"],
  ['diploma', 'votre diplôme ou attestation de réussite'],
  ['transcripts', 'vos relevés de notes'],
];

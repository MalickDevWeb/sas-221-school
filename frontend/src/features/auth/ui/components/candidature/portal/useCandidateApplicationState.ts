import { useState } from 'react';
import { Campaign, getAdmissionsDb, saveAdmissionsDb, addAuditLog } from './admissionsDb';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';

export function useCandidateApplicationState(
  campaign: Campaign,
  onSuccess: (candidate: ExtendedCandidate) => void
) {
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', cni: '' });
  const [academic, setAcademic] = useState({ school: '', diploma: 'Baccalauréat', target: campaign.title });
  const [docs, setDocs] = useState({ diploma: false, idCard: false, transcripts: false });
  const [feePaid, setFeePaid] = useState(false);
  const [credentials, setCredentials] = useState({ password: '', confirm: '', accept: false });
  const [error, setError] = useState('');

  const calculateDocProgress = () => {
    let uploaded = 0;
    if (docs.diploma) uploaded++;
    if (docs.idCard) uploaded++;
    if (docs.transcripts) uploaded++;
    return Math.round((uploaded / 3) * 100);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (credentials.password !== credentials.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!credentials.accept) {
      setError("Vous devez accepter les conditions d'inscription.");
      return;
    }

    const db = getAdmissionsDb();
    if (db.candidates.some(c => c.email.toLowerCase() === personal.email.trim().toLowerCase())) {
      setError('Cette adresse e-mail est déjà associée à un compte candidat.');
      return;
    }

    const newCandidate: ExtendedCandidate = {
      id: `cand-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      name: personal.name,
      email: personal.email,
      type: campaign.code,
      course: academic.target,
      step: 'new',
      docs: { diploma: docs.diploma, idCard: docs.idCard, transcripts: docs.transcripts },
      registrationFeePaid: feePaid,
      notifications: [
        { id: `not-${Date.now()}`, type: 'creation_compte', message: "Bienvenue sur l'Espace Candidat École 221 ! Votre compte est activé.", sentAt: new Date().toISOString() }
      ]
    };

    const updatedCandidates = [...db.candidates, newCandidate];
    saveAdmissionsDb({ candidates: updatedCandidates });
    addAuditLog(newCandidate.id, 'Création progressive de dossier & compte candidat', personal.name);

    onSuccess(newCandidate);
  };

  return {
    step, setStep,
    personal, setPersonal,
    academic, setAcademic,
    docs, setDocs,
    feePaid, setFeePaid,
    credentials, setCredentials,
    error, setError,
    calculateDocProgress,
    handleFinalSubmit
  };
}

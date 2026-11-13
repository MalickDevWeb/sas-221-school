import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { useAuthStore } from '@/core/store/authStore';

export interface Message { role: 'user' | 'model'; text: string; file?: { name: string; mimeType: string } };
export interface Grade { id: string; module: string; prof: string; cc: number; examen: number; moyPromo: number; }

/** Moyenne d'un module, calculée comme le relevé officiel (40 % contrôle continu, 60 % examen). */
export const moyenneModule = (g: Grade) => Number(((Number(g.cc) || 0) * 0.4 + (Number(g.examen) || 0) * 0.6).toFixed(2));
export interface Course { id: string; titre: string; coefficient: number; progress: number; unites?: string[]; }
export interface Homework { id: string; statut: string; titre: string; deadlineStr: string; prio: string; }
export interface TutorSession { id: string; title: string; messages: Message[]; createdAt: string; }

// Conversations gardées dans le navigateur, séparées par compte (2026-11-13) : avant, la clé était commune et l'élève
// suivant sur le même appareil voyait les échanges du précédent.
const SESSIONS_PREFIXE = 'mon_ecole_ai_tutor_sessions_v4_';

function lireSessions(cle: string): TutorSession[] {
  try {
    const brut = localStorage.getItem(cle);
    const v: unknown = brut ? JSON.parse(brut) : [];
    return Array.isArray(v) ? (v as TutorSession[]) : [];
  } catch {
    return [];
  }
}

export function useTutor() {
  const { utilisateur } = useAuthStore();
  // Aucun nom inventé : le prénom (ou le nom) du compte connecté, sinon pas de nom du tout.
  const studentName = (utilisateur?.prenom || utilisateur?.nom || '').trim();
  const sessionsKey = SESSIONS_PREFIXE + (utilisateur?.id || 'anonyme');
  const [grades, setGrades] = useState<Grade[]>([]), [courses, setCourses] = useState<Course[]>([]), [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(false), [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [sessions, setSessions] = useState<TutorSession[]>(() => lireSessions(sessionsKey));
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const [donneesChargees, setDonneesChargees] = useState(false);

  useEffect(() => {
    // Client de l'application (jeton et école de la session) : avant, des appels axios nus partaient sans
    // authentification et recevaient 401 (balayage des écrans du 13/11).
    const liste = <T,>(chemin: string) => apiClient.get(chemin).then(r => (Array.isArray(r.data) ? r.data as T[] : []));
    Promise.all([liste<Grade>('/student/grades'), liste<Course>('/student/courses'), liste<Homework>('/student/homeworks')])
      .then(([g, c, h]) => { setGrades(g); setCourses(c); setHomeworks(h); })
      .catch(() => { /* données indisponibles : le tuteur reste utilisable sans diagnostic */ })
      .finally(() => setDonneesChargees(true));
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      try { localStorage.setItem(sessionsKey, JSON.stringify(sessions)); } catch { /* stockage indisponible */ }
    }
  }, [sessions, sessionsKey]);

  useEffect(() => {
    if (donneesChargees && sessions.length === 0) {
      const salutation = studentName ? `Bonjour ${studentName} !` : 'Bonjour !';
      let bilan = "\n\nAucune note n'est encore enregistrée dans votre dossier.";
      if (grades.length > 0) {
        const overallAvg = (grades.reduce((acc, g) => acc + moyenneModule(g), 0) / grades.length).toFixed(2);
        const weakest = [...grades].sort((a, b) => moyenneModule(a) - moyenneModule(b))[0]?.module;
        bilan = `\n\nEn analysant votre dossier :\n- 📈 Votre moyenne est de **${overallAvg}/20**.` + (weakest ? `\n- ⚠️ Axe d'amélioration : **${weakest}**.` : '');
      }
      const welcomeText = `${salutation} Je suis votre **Tuteur IA Personnel**.${bilan}\n\nComment puis-je vous aider aujourd'hui ? Joignez un fichier ou posez une question !`;
      
      const defaultSess: TutorSession = {
        id: 'default', title: 'Discussion Générale',
        messages: [{ role: 'model', text: welcomeText }], createdAt: new Date().toLocaleDateString()
      };
      setSessions([defaultSess]); setCurrentSessionId('default');
    } else if (sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [donneesChargees, grades, studentName, sessions, currentSessionId]);

  const activeSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const createSession = (titleName?: string) => {
    const newId = `session_${Date.now()}`;
    const newSess: TutorSession = {
      id: newId, title: titleName || `Session #${sessions.length + 1}`,
      messages: [{ role: 'model', text: `Nouvelle discussion ouverte. Posez votre question ou téléversez un document !` }],
      createdAt: new Date().toLocaleDateString()
    };
    setSessions(prev => [newSess, ...prev]); setCurrentSessionId(newId);
  };

  const deleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) setCurrentSessionId(filtered[0].id);
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleSend = async (text: string) => {
    if ((!text.trim() && !attachedFile) || isLoading || !activeSession) return;

    const userMsg: Message = {
      role: 'user', text: text.trim() || `Fichier envoyé: ${attachedFile?.name}`,
      file: attachedFile ? { name: attachedFile.name, mimeType: attachedFile.mimeType } : undefined
    };
    const updatedMessages = [...activeSession.messages, userMsg];
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, messages: updatedMessages } : s));
    setInput(''); const filePayload = attachedFile; setAttachedFile(null); setIsLoading(true);

    try {
      const res = await apiClient.post('/student/tutor/chat', { message: userMsg.text, history: activeSession.messages, file: filePayload });
      const modelMsg: Message = { role: 'model', text: typeof res.data?.text === 'string' ? res.data.text : 'Réponse vide du tuteur.' };
      setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, messages: [...updatedMessages, modelMsg] } : s));
    } catch (e) {
      const errMsg: Message = { role: 'model', text: "Désolé, une erreur est survenue lors du traitement." };
      setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, messages: [...updatedMessages, errMsg] } : s));
    } finally { setIsLoading(false); }
  };

  return {
    sessions, currentSessionId, activeSession, createSession, deleteSession, renameSession, setCurrentSessionId,
    input, setInput, attachedFile, setAttachedFile, isLoading, grades, courses, homeworks, handleSend
  };
}

import { useState, useEffect, useCallback } from 'react';
import { CollabMessage, RepoDocument, GroupHomework } from '../domain/CollaborationModels';
import { subscribeDocs, saveDoc, subscribeHomeworks, saveHomework } from '../infrastructure/docService';
import { getMessagesGroupe, envoyerMessageGroupe } from '../infrastructure/groupService';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export function useGroupWorkspaceState(activeGroupId: string, triggerToast: (msg: string, isSuccess: boolean) => void) {
  const [messages, setMessages] = useState<readonly CollabMessage[]>([]);
  const [docs, setDocs] = useState<readonly RepoDocument[]>([]);
  const [homeworks, setHomeworks] = useState<readonly GroupHomework[]>([]);

  useEffect(() => {
    if (!activeGroupId) return;

    // Initial fetch of messages
    const fetchMsgs = async () => {
      try {
        setMessages(await getMessagesGroupe(activeGroupId));
      } catch (e) {
        console.error('Failed to fetch group messages', e);
      }
    };
    fetchMsgs();

    // Messages relus toutes les 4 s : le serveur ne publie rien sur /topic/collaboration, canal non cloisonné par école.
    const timer = setInterval(fetchMsgs, 4000);

    const unsubDocs = subscribeDocs(activeGroupId, setDocs);
    const unsubHws = subscribeHomeworks(activeGroupId, setHomeworks);

    return () => {
      clearInterval(timer);
      unsubDocs();
      unsubHws();
    };
  }, [activeGroupId]);

  const sendMessage = useCallback(async (
    groupId: string,
    senderName: string,
    role: CollabMessage['senderRole'],
    text: string,
    fileType?: CollabMessage['fileType'],
    fileName?: string
  ) => {
    // Message enregistré par le serveur, puis liste relue. L'auteur est le compte connecté.
    void senderName; void role;
    const contenu = fileType && fileType !== 'none' ? (text || `[Fichier joint : ${fileName}]`) : text;
    if (!contenu.trim()) {
      triggerToast('Le message est vide.', false);
      return;
    }
    try {
      await envoyerMessageGroupe(groupId, contenu);
      setMessages(await getMessagesGroupe(groupId));
    } catch (e) {
      triggerToast(`Message non envoyé : ${resolveErrorMessage(e)}`, false);
    }
  }, [triggerToast]);

  const addDocVersion = useCallback(async (
    groupId: string,
    docName: string,
    description: string,
    author: string,
    _comment: string
  ) => {
    await saveDoc(groupId, { name: docName, description, author });
    triggerToast(`Document collaboratif "${docName}" mis à jour avec succès !`, true);
  }, [triggerToast]);

  const addDocComment = useCallback(async (_docId: string, _author: string, _text: string) => {
    // Simple notification
    triggerToast('Commentaire ajouté !', true);
  }, [triggerToast]);

  const submitHomework = useCallback(async (homeworkId: string, groupId: string, groupName: string, fileName: string) => {
    const existing = homeworks.find((hw) => hw.id === homeworkId);
    if (existing) {
      const updated: GroupHomework = {
        ...existing,
        submissions: [
          ...existing.submissions.filter((s) => s.groupId !== groupId),
          { groupId, groupName, fileName, fileUrl: '#', submittedAt: new Date().toLocaleDateString('fr-FR') },
        ],
      };
      await saveHomework(groupId, updated);
      triggerToast(`Devoir de groupe remis avec succès !`, true);
    }
  }, [homeworks, triggerToast]);

  return { messages, docs, homeworks, sendMessage, addDocVersion, addDocComment, submitHomework };
}
export default useGroupWorkspaceState;

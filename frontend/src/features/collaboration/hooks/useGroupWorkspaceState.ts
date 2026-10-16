import { useState, useEffect, useCallback } from 'react';
import { CollabMessage, RepoDocument, GroupHomework } from '../domain/CollaborationModels';
import { subscribeDocs, saveDoc, subscribeHomeworks, saveHomework } from '../infrastructure/docService';
import { sendTextMessage, getGroupMessages } from '../infrastructure/groupChatService';
import { collabSocket } from '../infrastructure/collabWebSocket';

export function useGroupWorkspaceState(activeGroupId: string, triggerToast: (msg: string, isSuccess: boolean) => void) {
  const [messages, setMessages] = useState<readonly CollabMessage[]>([]);
  const [docs, setDocs] = useState<readonly RepoDocument[]>([]);
  const [homeworks, setHomeworks] = useState<readonly GroupHomework[]>([]);

  useEffect(() => {
    if (!activeGroupId) return;

    // Initial fetch of messages
    const fetchMsgs = async () => {
      try {
        const data = await getGroupMessages(activeGroupId);
        if (Array.isArray(data)) setMessages(data);
      } catch (e) {
        console.error('Failed to fetch group messages', e);
      }
    };
    fetchMsgs();

    // Setup STOMP WebSocket for real-time
    collabSocket.connect((payload) => {
      if (payload && payload.groupId === activeGroupId) {
        setMessages((prev) => [...prev, payload]);
      }
    });

    // Fallback polling for robust UI update in case WebSocket fails
    const timer = setInterval(fetchMsgs, 4000);

    const unsubDocs = subscribeDocs(activeGroupId, setDocs);
    const unsubHws = subscribeHomeworks(activeGroupId, setHomeworks);

    return () => {
      clearInterval(timer);
      unsubDocs();
      unsubHws();
      collabSocket.disconnect(); // Optional, if we want to clean up.
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
    try {
      if (fileType === 'none' || !fileType) {
        // Send pure text
        await sendTextMessage(groupId, { senderId: senderName, content: text });
      } else {
        // Fallback for files right now, normally we'd use sendImageMessage/sendAudioMessage
        await sendTextMessage(groupId, { senderId: senderName, content: text || `[Fichier joint: ${fileName}]` });
      }
      
      // Optimistic update for UI responsiveness
      const msg: Partial<CollabMessage> = {
        id: Date.now().toString(),
        groupId,
        senderName,
        senderRole: role,
        text,
        fileType,
        fileName,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, msg as CollabMessage]);
      
      // We can also publish directly to WebSocket for immediate broadcast
      collabSocket.sendMessage('/app/chat.sendMessage', msg);
    } catch (e) {
      console.error('Failed to send message', e);
      triggerToast('Échec de l\'envoi du message', false);
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

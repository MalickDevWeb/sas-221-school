import { useState, useCallback } from 'react';
import { useVirtualClassState } from './useVirtualClassState';
import { useWorkgroupState } from './useWorkgroupState';
import { useGroupWorkspaceState } from './useGroupWorkspaceState';
import { useGroupTasksState } from './useGroupTasksState';
import { useGroupWikiState } from './useGroupWikiState';
import { useGroupAuditState } from './useGroupAuditState';

export function useCollaborationState() {
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);
  // Aucun groupe sélectionné tant que l'utilisateur n'en a pas choisi un
  const [activeGroupId, setActiveGroupId] = useState<string>('');

  const triggerToast = useCallback((message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const virtualClassState = useVirtualClassState(triggerToast);
  const workgroupState = useWorkgroupState(triggerToast);
  // Groupe affiché : celui choisi, sinon le premier groupe réel (même règle que la page)
  const groupeEffectif = activeGroupId || workgroupState.workgroups[0]?.id || '';
  const workspaceState = useGroupWorkspaceState(groupeEffectif, triggerToast);
  const tasksState = useGroupTasksState(groupeEffectif, triggerToast);
  const wikiState = useGroupWikiState(triggerToast);
  const auditState = useGroupAuditState(triggerToast);

  return {
    toast,
    triggerToast,
    activeGroupId,
    setActiveGroupId,
    ...virtualClassState,
    ...workgroupState,
    ...workspaceState,
    ...tasksState,
    ...wikiState,
    ...auditState,
  };
}
export default useCollaborationState;

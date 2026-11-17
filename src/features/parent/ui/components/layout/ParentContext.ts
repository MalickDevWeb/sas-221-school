import type { ChildDetailsErrors } from '@/features/parent/hooks/useChildDetails';
// Contexte partagé dans le layout parent (fichier séparé : règle react-refresh/only-export-components)
import { createContext, useContext } from 'react';
import type { ChildProfile, ChildDashboardStats, ChildAttendance, ChildGrade, ChildScheduleItem, ParentMessage } from '@/features/parent/types';

export interface ParentContextType {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  selectedChildId: string | null;
  /** null tant que le backend n'a pas fourni les statistiques (chargement, erreur ou aucun enfant). */
  stats: ChildDashboardStats | null;
  loading: boolean;
  childrenError: string | null;
  statsError: string | null;
  reloadDashboard: () => void;
  switchChild: (id: string) => void;
  attendances: ChildAttendance[];
  grades: ChildGrade[];
  schedule: ChildScheduleItem[];
  messages: ParentMessage[];
  errors: ChildDetailsErrors;
  retry: () => void;
  unreadCount: number;
  markRead: (id: string) => void;
  /** Recharge les échanges (après un envoi). */
  refreshMessages: () => Promise<void>;
}

export const ParentContext = createContext<ParentContextType>({} as ParentContextType);
export const useParentContext = () => useContext(ParentContext);

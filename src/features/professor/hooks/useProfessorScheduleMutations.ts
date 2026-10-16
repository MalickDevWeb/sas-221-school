import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  cancelCourseUseCase,
  rescheduleCourseUseCase,
  getScheduleUseCase
} from '../infrastructure/config/dependencies';

export function useProfessorScheduleMutations(
  profId: string,
  setSchedule: React.Dispatch<React.SetStateAction<any[]>>
) {
  const handleCancelCourse = useCallback(async (sessionId: string, reason: string) => {
    try {
      await cancelCourseUseCase(sessionId, reason);
      const updatedSchedule = await getScheduleUseCase(profId);
      setSchedule(updatedSchedule);
      toast.success('Séance annulée avec succès');
    } catch (err) {
      const errorMsg = (err as Error).message || "Impossible d'annuler le cours";
      toast.error(errorMsg);
      throw err;
    }
  }, [profId, setSchedule]);

  const handleRescheduleCourse = useCallback(async (sessionId: string, day: string, time: string, room: string) => {
    try {
      await rescheduleCourseUseCase(sessionId, day, time, room);
      const updatedSchedule = await getScheduleUseCase(profId);
      setSchedule(updatedSchedule);
      toast.success('Séance reprogrammée avec succès');
    } catch (err) {
      const errorMsg = (err as Error).message || "Impossible de reprogrammer le cours";
      toast.error(errorMsg);
      throw err;
    }
  }, [profId, setSchedule]);

  return {
    handleCancelCourse,
    handleRescheduleCourse
  };
}

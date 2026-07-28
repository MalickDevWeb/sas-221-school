import { useState, useEffect, useCallback, useMemo } from 'react';
import { DbProfile, Attendance, LiveSession } from '../domain/Dashboard';
import { CoursItem } from '@/features/student/types';
import { getDashboardDataUseCase } from '../infrastructure/config/dependencies';
import { getWeeklyScheduleUseCase } from '@/features/schedule/infrastructure/config/dependencies';
import { useDashboardClockIn } from './useDashboardClockIn';
import { useDashboardLive } from './useDashboardLive';
import { getHighlightState } from '@/shared/utils/calendarHighlight';

export function useDashboard() {
  const [courses, setCourses] = useState<CoursItem[]>([]);
  const { enCoursId, prochainId, initialDay } = useMemo(() => {
    if (courses.length === 0) return { enCoursId: null, prochainId: null, initialDay: 'LUN' as const };
    const mapped = courses.map(c => {
      const [s, e] = (c.heure || '').split('-').map(str => str.trim());
      return { id: c.id, day: c.jour, startTime: s || '', endTime: e || '' };
    });
    const state = getHighlightState(mapped);
    const target = courses.find(c => c.id === (state.enCoursId || state.prochainId));
    return { ...state, initialDay: (target?.jour || 'LUN') as 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM' };
  }, [courses]);

  const [selectedDay, setSelectedDay] = useState<'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM'>('LUN');
  const [activeDetailCourse, setActiveDetailCourse] = useState<CoursItem | null>(null);
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [lastActiveId, setLastActiveId] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setShowToast(msg); setTimeout(() => setShowToast(null), 3500);
  }, []);

  useEffect(() => { if (initialDay) setSelectedDay(initialDay); }, [initialDay]);

  useEffect(() => {
    const activeSes = liveSessions.find(s => s && s.status === 'active');
    if (activeSes && activeSes.id !== lastActiveId) {
      setLastActiveId(activeSes.id);
      triggerToast(`🔴 COURS EN LIVE : "${activeSes.courseName}" par ${activeSes.teacherName} a commencé !`);
    } else if (!activeSes && lastActiveId !== null) {
      setLastActiveId(null);
    }
  }, [liveSessions, lastActiveId, triggerToast]);

  const loadData = useCallback(async () => {
    try {
      const [data, scheduleData] = await Promise.all([getDashboardDataUseCase(), getWeeklyScheduleUseCase()]);
      setDbProfile(data.profile);
      setAttendances(Array.isArray(data.attendances) ? data.attendances : []);
      setLiveSessions(Array.isArray(data.liveSessions) ? data.liveSessions : []);
      setCourses(scheduleData.map(s => ({ id: s.id, jour: s.jour, nom: s.nom, heure: s.heureStr, salle: s.salle, professeur: s.professeur, description: s.description, type: s.type })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const clockInState = useDashboardClockIn({ triggerToast, loadData });
  const liveState = useDashboardLive(liveSessions, setLiveSessions, dbProfile, triggerToast);

  return {
    selectedDay, setSelectedDay, activeDetailCourse, setActiveDetailCourse, dbProfile, attendances,
    liveSessions, showToast, triggerToast, enCoursId, prochainId, courses,
    ...clockInState, ...liveState
  };
}
export default useDashboard;

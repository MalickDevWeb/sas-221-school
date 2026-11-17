import { useState, useRef, useEffect, useMemo } from 'react';
import { useSchedule } from '@/features/schedule/hooks/useSchedule';
import { CourseSession, CourseDay } from '@/features/schedule/domain/Schedule';
import { apiClient } from '@/shared/lib/apiClient';
import { getHighlightState } from '@/shared/utils/calendarHighlight';

export function useSchedulePageState() {
  const { schedule } = useSchedule();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  
  const { enCoursId, prochainId, initialDay } = useMemo(() => {
    const mapped = schedule.map(c => ({ id: c.id, day: c.jour, startTime: c.heureDebut, endTime: c.heureFin }));
    const s = getHighlightState(mapped);
    const target = schedule.find(c => c.id === (s.enCoursId || s.prochainId));
    return { ...s, initialDay: (target?.jour || 'MER') as CourseDay };
  }, [schedule]);

  const [selectedDayMobile, setSelectedDayMobile] = useState<CourseDay>(initialDay);
  const [activePlanCourse, setActivePlanCourse] = useState<CourseSession | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [filterType, setFilterType] = useState<'TOUS' | 'CM' | 'TD' | 'TP'>('TOUS');
  const [filterStatus, setFilterStatus] = useState<'TOUS' | 'termine' | 'actuel' | 'a_venir'>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSelectedDayMobile(initialDay); }, [initialDay]);

  useEffect(() => {
    const fetchLive = async () => {
      try { const res = await apiClient.get('/student/live-sessions'); setLiveSessions(Array.isArray(res.data) ? res.data : []); } catch (e) { console.error(e); }
    };
    fetchLive();
    const timer = setInterval(fetchLive, 12000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => { setShowToast(msg); setTimeout(() => setShowToast(null), 3500); };

  const handleJoinLive = (s: any) => {
    if (!s) return;
    const isStream = !!s.hlsUrl && (s.hlsUrl.includes('.m3u8') || s.hlsUrl.includes('test-streams.mux.dev') || s.hlsUrl.includes('.mp4'));
    if (isStream) { window.location.href = `/etudiant?joinLive=${s.id}`; }
    else if (s.hlsUrl) { window.open(s.hlsUrl, '_blank', 'noopener,noreferrer'); triggerToast("Ouverture de Google Meet..."); }
  };


  const scrollGrid = (dir: 'left' | 'right') => {
    if (gridContainerRef.current) gridContainerRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  const fitsFilters = (c: CourseSession) => {
    const mType = filterType === 'TOUS' || c.type === filterType;
    const mStatus = filterStatus === 'TOUS' || c.status === filterStatus;
    const mSearch = !searchQuery.trim() || [c.nom, c.professeur, c.salle].some(v => (v || "").toLowerCase().includes(searchQuery.toLowerCase()));
    return mType && mStatus && mSearch;
  };

  const resetAllFilters = () => { setFilterType('TOUS'); setFilterStatus('TOUS'); setSearchQuery(''); triggerToast('Filtres réinitialisés !'); };

  useEffect(() => {
    document.body.style.overflow = activePlanCourse ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activePlanCourse]);

  // L'adresse n'est pas lue pour un « #access_token » (n'importe quel jeton serait rangé dans le navigateur) ;
  // l'agenda s'exporte en .ics, sans compte Google.

  return {
    schedule, isSyncModalOpen, setIsSyncModalOpen, selectedDayMobile, setSelectedDayMobile, activePlanCourse, setActivePlanCourse,
    showToast, setShowToast, viewMode, setViewMode, filterType, setFilterType,
    filterStatus, setFilterStatus, searchQuery, setSearchQuery, gridContainerRef,
    triggerToast, scrollGrid, fitsFilters, resetAllFilters,
    liveSessions, handleJoinLive, enCoursId, prochainId
  };
}

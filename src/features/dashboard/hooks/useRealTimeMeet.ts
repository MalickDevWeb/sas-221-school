import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { LiveSession } from '@/features/student/types';

export function useRealTimeMeet() {
  const [activeMeet, setActiveMeet] = useState<LiveSession | null>(null);

  useEffect(() => {
    const fetchMeetStatus = async () => {
      try {
        const res = await apiClient.get('/meet/active');
        setActiveMeet(res.data ?? null);
      } catch {
        // Silently fail — endpoint optionnel (meet non actif = null)
      }
    };

    fetchMeetStatus();
    // Polling toutes les 15 s pour limiter la charge réseau
    const timer = setInterval(fetchMeetStatus, 15000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return activeMeet;
}

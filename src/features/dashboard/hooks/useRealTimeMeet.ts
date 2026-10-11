import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { LiveSession } from '@/features/student/types';

export function useRealTimeMeet() {
  const [activeMeet, setActiveMeet] = useState<LiveSession | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const fetchMeetStatus = async () => {
      try {
        const res = await apiClient.get('/meet/active');
        setActiveMeet(res.data);
      } catch (err) {
        // Silently fail if meet is inactive or network issues
      }
    };
    
    fetchMeetStatus();
    // Simulation of real-time by polling the backend (which uses Redis for speed)
    timer = setInterval(fetchMeetStatus, 3000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return activeMeet;
}

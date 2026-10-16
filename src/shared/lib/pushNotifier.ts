import { toast } from 'sonner';

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

export function playPushChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };
    const now = ctx.currentTime;
    playTone(587.33, now, 0.25);
    playTone(880.0, now + 0.1, 0.35);
  } catch {
    // Audio non disponible
  }
}

export function vibrateDevice(pattern: number[] = [150, 75, 150]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibreur non supporté
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    toast.error('Notifications non supportées sur ce navigateur');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
      playPushChime();
      vibrateDevice();
      toast.success('🔔 Notifications push activées !', {
        description: 'Vous recevrez les alertes scolaires et messages en temps réel sur cet appareil.'
      });
    } else if (permission === 'denied') {
      toast.error('Notifications bloquées', {
        description: 'Veuillez autoriser les notifications dans les paramètres de votre navigateur.'
      });
    }
    return permission;
  } catch (err) {
    console.warn('Erreur lors de la demande de permission push:', err);
    return 'denied';
  }
}

export function sendPushNotification(title: string, body: string, options?: { url?: string; icon?: string; tag?: string }): void {
  playPushChime();
  vibrateDevice();

  if (isPushSupported() && Notification.permission === 'granted') {
    const icon = options?.icon || '/myschool-icon.png';
    const tag = options?.tag || 'ecole-221-alert';

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, { body, icon, badge: icon, tag, data: { url: options?.url || '/' } });
      }).catch(() => {
        new Notification(title, { body, icon, tag });
      });
    } else {
      try {
        new Notification(title, { body, icon, tag });
      } catch {
        // Fallback silencieux
      }
    }
  }

  // Toast in-app universel toujours visible
  toast.info(title, {
    description: body,
    action: options?.url ? {
      label: 'Voir',
      onClick: () => { window.location.href = options.url!; }
    } : undefined,
    duration: 5000,
  });
}

export function testPushNotification(): void {
  sendPushNotification(
    '🔔 Test Push - École 221',
    'Le système de notifications push en direct est actif et synchronisé !',
    { url: window.location.pathname }
  );
}

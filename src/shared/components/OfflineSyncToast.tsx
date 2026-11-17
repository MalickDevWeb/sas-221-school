import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { syncOfflineMutations, type BilanSynchronisation } from '../lib/offlineSyncManager';
import { sendPushNotification } from '../lib/pushNotifier';
import { publicApiClient } from '../lib/apiClient';

/**
 * Bilan du rejeu affiché à l'utilisateur (revue DevSecOps) : jamais de refus silencieux, et une session
 * expirée est signalée au lieu de compter l'action comme envoyée.
 */
function annoncerBilan(b: BilanSynchronisation): void {
  if (b.aReconnecter > 0) {
    toast.warning(`Reconnectez-vous pour envoyer ${b.aReconnecter} action(s) en attente : elles restent conservées sur cet appareil.`,
      { duration: Infinity, id: 'hors-ligne-reconnexion' });
  }
  if (b.refusees.length > 0) {
    const details = b.refusees.slice(0, 3).map(r => `${r.methode} ${r.url.replace(/^.*?\/api\//, '/')} : ${r.motif}`).join(' ; ');
    toast.error(`${b.refusees.length} action(s) faite(s) hors ligne refusée(s) par le serveur et retirée(s) de la file — ${details}${b.refusees.length > 3 ? ' ; …' : ''}. Refaites-les si nécessaire.`,
      { duration: Infinity, id: 'hors-ligne-refus' });
  }
  if (b.enAttente > 0) {
    toast.info(`${b.enAttente} action(s) toujours en attente : nouvel envoi au prochain retour de la connexion.`, { id: 'hors-ligne-attente' });
  }
}

export function OfflineSyncToast() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showSyncing, setShowSyncing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handleOnline = async () => {
      setIsOnline(true);
      setShowSyncing(true);
      setSyncMessage("Connexion rétablie ! Synchronisation...");
      sendPushNotification("Connexion rétablie", "Synchronisation des données en cours...");
      
      try {
        const bilan = await syncOfflineMutations();
        const syncedCount = bilan.envoyees;
        annoncerBilan(bilan);
        const { data: info } = await publicApiClient.get('/sync/check');
        const prevVersion = localStorage.getItem('cached_db_version');
          
          if (prevVersion && prevVersion !== info.version) {
            setSyncMessage(`Changements détectés ! Actualisation.`);
            sendPushNotification("Mise à jour disponible", "Actualisation automatique de vos cours...");
            localStorage.setItem('cached_db_version', info.version);
            setTimeout(() => window.location.reload(), 1500);
            return;
          }
          localStorage.setItem('cached_db_version', info.version || 'fresh');
        
        setSyncMessage(syncedCount > 0 ? `${syncedCount} action(s) synchronisée(s) !` : "Données synchronisées !");
        sendPushNotification("Données synchronisées", "Vos données locales de cours et devoirs sont à jour.");
      } catch (err) {
        console.error('Online sync error', err);
      } finally {
        setTimeout(() => { setSyncMessage(null); setShowSyncing(false); }, 3500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage("Vous êtes hors-ligne. Mode local activé.");
      sendPushNotification("Mode Hors-ligne", "100% de vos cours restent accessibles sans connexion !");
      setTimeout(() => setSyncMessage(null), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.onLine) {
      publicApiClient.get('/sync/check')
        .then(r => {
          const info = r.data;
          const prev = localStorage.getItem('cached_db_version');
          if (prev && prev !== info.version) {
            setSyncMessage("Mise à jour disponible !");
            sendPushNotification("Mise à jour disponible", "Actualisation automatique de l'école...");
            localStorage.setItem('cached_db_version', info.version);
            setTimeout(() => window.location.reload(), 1500);
          } else {
            localStorage.setItem('cached_db_version', info.version || 'fresh');
          }
        }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div id="offline-badge" className="fixed bottom-6 right-6 z-[150] bg-amber-600/95 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce border border-amber-500">
        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        <span>Mode Hors-ligne (Données locales)</span>
      </div>
    );
  }

  if (syncMessage || showSyncing) {
    return (
      <div id="sync-toast" className="fixed bottom-6 right-6 z-[150] bg-emerald-600/95 backdrop-blur text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-emerald-500">
        <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
        <span>{syncMessage || "Vérification..."}</span>
      </div>
    );
  }

  return null;
}
export default OfflineSyncToast;

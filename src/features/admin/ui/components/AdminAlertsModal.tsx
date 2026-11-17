import { MassSendTab } from './notifications/MassSendTab';

interface AdminAlertsModalProps {
  onClose: () => void;
}

/**
 * Annonce rapide (bouton « Annonce » des actions rapides). Elle reprend EXACTEMENT le formulaire de l'onglet
 * « Annonces & alertes › Annonces » (destinataires avec nombre réel, envoi POST /v1/notifications/annonces) au lieu
 * d'un second formulaire : une seule façon d'envoyer, une seule vérification.
 */
export function AdminAlertsModal({ onClose }: AdminAlertsModalProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="annonce-rapide-titre" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-[#E2DCDA]">
        <div className="sticky top-0 z-10 p-4 bg-white border-b border-[#E2DCDA] flex justify-between items-center">
          <h3 id="annonce-rapide-titre" className="font-black text-base text-[#291715]">Annonce</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-[#8E7977] hover:text-primary cursor-pointer">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-4"><MassSendTab compact /></div>
      </div>
    </div>
  );
}

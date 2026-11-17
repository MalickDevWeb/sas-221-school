import React from 'react';
import { Info } from 'lucide-react';
import { SubscriptionDialog } from './SubscriptionDialog';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Règlement de l'abonnement. Aucun prélèvement ni moyen de paiement n'existe dans l'application : la fenêtre explique
 * comment l'abonnement se règle réellement.
 * Rendue par portail (SubscriptionDialog) pour ne pas être confinée par la page.
 */
export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({ isOpen, onClose }) => (
  <SubscriptionDialog
    isOpen={isOpen}
    onClose={onClose}
    id="reglement-abonnement"
    title="Règlement de l'abonnement"
    kicker={<div className="w-10 h-10 mb-3 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Info size={20} /></div>}
  >
    <div className="p-6 space-y-3 text-sm text-gray-700">
      <p>L'application n'enregistre aucun moyen de paiement et n'effectue aucun prélèvement.</p>
      <p>L'abonnement de l'école se règle directement auprès de l'équipe de la plateforme, qui l'active ou le renouvelle depuis son espace d'administration. Pour régler, changer d'offre ou obtenir une facture, contactez-la.</p>
      <button type="button" onClick={onClose} className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold">J'ai compris</button>
    </div>
  </SubscriptionDialog>
);

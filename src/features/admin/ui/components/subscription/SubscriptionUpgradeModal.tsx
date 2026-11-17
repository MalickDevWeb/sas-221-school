import React from 'react';
import { Layers } from 'lucide-react';
import { SubscriptionDialog } from './SubscriptionDialog';
import { SubscriptionFormulesList } from './SubscriptionFormulesList';

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Identifiant de la formule de l'abonnement réel (GET /admin/abonnement) ; null sans abonnement. */
  currentPlanId: string | null;
}

/**
 * Fenêtre « Formules proposées par la plateforme » : rendue par portail (SubscriptionDialog), elle n'est
 * pas coupée par la page. Contenu : vraies formules et parcours honnête (SubscriptionFormulesList).
 */
export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({ isOpen, onClose, currentPlanId }) => (
  <SubscriptionDialog
    isOpen={isOpen}
    onClose={onClose}
    id="formules-abonnement"
    widthClass="max-w-4xl"
    title="Formules proposées par la plateforme"
    kicker={
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
        <Layers size={13} /> Formules My School
      </div>
    }
    subtitle="Le changement de formule se fait avec l'équipe My School : rien n'est enregistré ni payé depuis cette page."
  >
    <div className="p-5 sm:p-6">
      <SubscriptionFormulesList currentPlanId={currentPlanId} onFermer={onClose} enabled={isOpen} />
    </div>
  </SubscriptionDialog>
);

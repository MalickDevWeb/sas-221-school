import React from 'react';
import { X, Info } from 'lucide-react';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Règlement de l'abonnement (2026-11-14). Avant : « Moyens de paiement enregistrés — Prélèvements automatiques
 * sécurisés », un choix « par défaut » annoncé comme utilisé pour les prochains prélèvements, et un bouton « Ajouter un
 * nouveau moyen de paiement » qui n'affichait qu'un message. Aucun prélèvement ni moyen de paiement n'existe dans
 * l'application : la fenêtre explique comment l'abonnement se règle réellement.
 */
export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div
        id="reglement-abonnement"
        role="dialog"
        aria-label="Règlement de l'abonnement"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Info size={20} /></div>
            <h3 className="text-base font-bold text-gray-900">Règlement de l'abonnement</h3>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3 text-sm text-gray-700">
          <p>L'application n'enregistre aucun moyen de paiement et n'effectue aucun prélèvement.</p>
          <p>L'abonnement de l'école se règle directement auprès de l'équipe de la plateforme, qui l'active ou le renouvelle depuis son espace d'administration. Pour régler, changer d'offre ou obtenir une facture, contactez-la.</p>
          <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold">J'ai compris</button>
        </div>
      </div>
    </div>
  );
};

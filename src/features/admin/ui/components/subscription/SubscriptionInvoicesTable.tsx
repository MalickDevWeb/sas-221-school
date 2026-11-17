import React from 'react';
import { Receipt } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Factures de l'abonnement.
 * Aucune facture d'abonnement n'est enregistrée par le serveur : la section le dit et oriente vers l'équipe My School.
 */
export const SubscriptionInvoicesTable: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
    className="rounded-3xl bg-white p-6 sm:p-7 border border-gray-100 shadow-sm"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
        <Receipt size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Factures de l'abonnement</h3>
    </div>
    <p className="text-sm text-gray-600">
      L'application ne conserve pas encore les factures de l'abonnement. Elles sont délivrées par l'équipe My School,
      auprès de qui l'abonnement se règle : demandez-les-lui.
    </p>
  </motion.div>
);

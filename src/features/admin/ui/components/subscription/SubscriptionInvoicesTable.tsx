import React, { useState } from 'react';
import { Receipt, Download, CheckCircle2, ChevronRight, FileText, ArrowDownToLine } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { InvoiceItem } from './subscriptionModels';

interface SubscriptionInvoicesTableProps {
  invoices: InvoiceItem[];
}

export const SubscriptionInvoicesTable: React.FC<SubscriptionInvoicesTableProps> = ({ invoices }) => {
  const [showAll, setShowAll] = useState(false);

  const handleDownloadInvoice = (inv: InvoiceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Téléchargement de la facture ${inv.id}`, {
      description: `Reçu certifié de ${inv.amount.toLocaleString('fr-FR')} FCFA (${inv.desc}).`,
      icon: <FileText className="text-emerald-500" size={16} />
    });
  };

  const displayedInvoices = showAll ? invoices : invoices.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-3xl bg-white p-6 sm:p-7 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
            <Receipt size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Historique des factures</h3>
            <p className="text-xs text-gray-400">Accédez à l'ensemble de vos quittances et justificatifs fiscaux</p>
          </div>
        </div>
        <button
          onClick={() => toast.info('Exportation de l’historique comptable complet en cours...')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <ArrowDownToLine size={14} /> Exporter relevé
        </button>
      </div>

      <div className="space-y-3">
        {displayedInvoices.map((inv) => (
          <div
            key={inv.id}
            onClick={(e) => handleDownloadInvoice(inv, e)}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <Receipt size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{inv.desc}</p>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{new Date(inv.date).toLocaleDateString('fr-FR')}</span>
                  <span>•</span>
                  <span className="font-mono text-gray-600">{inv.id}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-indigo-600 font-medium">{inv.paymentMethod}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">{inv.amount.toLocaleString('fr-FR')} FCFA</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                  <CheckCircle2 size={11} /> {inv.status}
                </div>
              </div>
              <button
                title="Télécharger la quittance"
                className="w-8 h-8 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 flex items-center justify-center transition-all"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {invoices.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors py-2"
        >
          {showAll ? 'Réduire la liste' : `Voir tout l'historique (${invoices.length} factures) →`}
        </button>
      )}
    </motion.div>
  );
};

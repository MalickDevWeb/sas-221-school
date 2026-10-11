import React, { useState, useEffect } from 'react';
import { 
  Crown, CheckCircle2, AlertCircle, TrendingUp, Users, BookOpen, 
  Zap, CreditCard, Receipt, Building2, ArrowRight, Star
} from 'lucide-react';
import { toast } from 'sonner';

// Mocks localisés (le temps d'avoir l'API côté Tenant)
const MOCK_CURRENT_PLAN = {
  id: '2',
  name: 'Avancé',
  priceMonthly: 50000,
  status: 'ACTIVE',
  endDate: '2026-01-01',
  features: [
    { code: 'MAX_STUDENTS', label: 'Élèves maximum', limit: 500, used: 420 },
    { code: 'MAX_TEACHERS', label: 'Enseignants', limit: 50, used: 38 },
    { code: 'MAX_CLASSES', label: 'Classes/Filières', limit: 25, used: 18 },
  ]
};

const MOCK_INVOICES = [
  { id: 'INV-2025-001', date: '2025-01-01', amount: 500000, status: 'PAYÉ', desc: 'Abonnement Annuel Avancé' },
  { id: 'INV-2024-012', date: '2024-12-01', amount: 50000, status: 'PAYÉ', desc: 'Abonnement Mensuel Avancé' },
];

export const AdminSubscriptionManager = () => {
  const [loading, setLoading] = useState(false);

  const usagePercent = (used: number, limit: number) => Math.round((used / limit) * 100);

  const getProgressColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Mon Abonnement</h2>
          <p className="text-sm text-gray-500">Gérez votre formule, vos quotas et vos factures</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <Star size={18} />
          Mettre à niveau (Premium)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── COLONNE GAUCHE : Statut actuel ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Crown size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-4">
                <CheckCircle2 size={14} /> Actif
              </div>
              
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Formule Actuelle</h3>
              <div className="flex items-end gap-2 mt-1 mb-6">
                <span className="text-4xl font-black text-gray-900">{MOCK_CURRENT_PLAN.name}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Montant</p>
                  <p className="text-sm font-semibold text-gray-800">{MOCK_CURRENT_PLAN.priceMonthly.toLocaleString()} FCFA / mois</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Prochain renouvellement</p>
                  <p className="text-sm font-semibold text-gray-800">{new Date(MOCK_CURRENT_PLAN.endDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="w-full py-2.5 rounded-xl border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
                  Gérer le moyen de paiement
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE : Quotas & Factures ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quotas */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" /> Utilisation des ressources
            </h3>
            
            <div className="space-y-6">
              {MOCK_CURRENT_PLAN.features.map(feat => {
                const percent = usagePercent(feat.used, feat.limit);
                return (
                  <div key={feat.code}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold text-gray-700">{feat.label}</span>
                      <span className="text-sm text-gray-500">
                        <strong className="text-gray-900">{feat.used}</strong> / {feat.limit}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(percent)}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    {percent > 90 && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} /> Vous approchez de la limite.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Factures */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-indigo-500" /> Historique des factures
            </h3>
            
            <div className="space-y-3">
              {MOCK_INVOICES.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{inv.desc}</p>
                      <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString('fr-FR')} • {inv.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{inv.amount.toLocaleString()} FCFA</p>
                      <p className="text-xs text-emerald-600 font-semibold">{inv.status}</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-indigo-500 transition-colors">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Voir tout l'historique →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};


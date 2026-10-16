import React from 'react';
import { TrendingUp, Users, GraduationCap, BookOpen, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { QuotaFeature } from './subscriptionModels';

interface SubscriptionQuotaSectionProps {
  features: QuotaFeature[];
  onUpgradeClick: () => void;
}

export const SubscriptionQuotaSection: React.FC<SubscriptionQuotaSectionProps> = ({
  features,
  onUpgradeClick,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <Users size={16} className="text-indigo-600" />;
      case 'teachers':
        return <GraduationCap size={16} className="text-purple-600" />;
      case 'classes':
      default:
        return <BookOpen size={16} className="text-emerald-600" />;
    }
  };

  const getStatusStyles = (percent: number) => {
    if (percent >= 90) return { bar: 'bg-gradient-to-r from-red-500 to-rose-600', text: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (percent >= 75) return { bar: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { bar: 'bg-gradient-to-r from-emerald-500 to-teal-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-3xl bg-white p-6 sm:p-7 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Utilisation des ressources</h3>
            <p className="text-xs text-gray-400">Suivez la consommation de vos quotas en temps réel</p>
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/70 transition-colors"
        >
          Ajuster les quotas <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="space-y-5">
        {features.map((feat, index) => {
          const percent = Math.min(100, Math.round((feat.used / feat.limit) * 100));
          const { bar, text } = getStatusStyles(percent);

          return (
            <div key={feat.code} className="p-3.5 rounded-2xl bg-gray-50/60 border border-gray-100/80 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center">
                    {getIcon(feat.iconName)}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{feat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    <strong className="text-gray-900 font-bold">{feat.used}</strong> / {feat.limit}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${text}`}>
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="h-2.5 bg-gray-200/70 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, delay: 0.15 * index, ease: 'easeOut' }}
                  className={`h-full rounded-full shadow-xs ${bar}`}
                />
              </div>

              {percent >= 80 && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 font-medium">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  <span>Seuil de sécurité atteint ({percent}%). Pensez à augmenter la capacité.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

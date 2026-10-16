import React, { useState } from 'react';
import { Building2, X, Crown, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import type { PlanDto, Tenant, AssignPlanCommand } from '@/features/super-admin/domain/models/PlatformModels';
import { planBg } from './billingConstants';

interface AssignPlanModalProps {
  plans: PlanDto[];
  tenants: Tenant[];
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignPlanModal: React.FC<AssignPlanModalProps> = ({ plans, tenants, onClose, onAssigned }) => {
  const [form, setForm] = useState<AssignPlanCommand>({ organizationId: '', planId: '', endDate: null });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/v1/super-admin/subscriptions', form);
      const tenant = tenants.find(t => t.id === form.organizationId);
      const plan = plans.find(p => p.id === form.planId);
      toast.success(`✅ "${tenant?.name}" abonné au plan "${plan?.name}" !`);
      onAssigned();
      onClose();
    } catch {
      toast.error("Erreur lors de l'assignation du plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-[#0B0F1F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Building2 size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Assigner une formule</h3>
              <p className="text-xs text-slate-400">Activer l'abonnement d'un campus</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="text-xs font-medium text-slate-400">Campus Sélectionné</label>
            <select required value={form.organizationId} onChange={e => setForm((prev: AssignPlanCommand) => ({ ...prev, organizationId: e.target.value }))}
              className="mt-1 w-full rounded-xl bg-[#070A14] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-emerald-500">
              <option value="">Sélectionner un campus...</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Choisir la Formule</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {plans.map((p, i) => (
                <label key={p.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    form.planId === p.id ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                  }`}>
                  <input type="radio" name="planId" value={p.id} checked={form.planId === p.id}
                    onChange={() => setForm((prev: AssignPlanCommand) => ({ ...prev, planId: p.id }))} className="hidden" />
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${planBg(i)} flex items-center justify-center`}>
                    <Crown size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(p.priceMonthly).toLocaleString()} FCFA/mois</p>
                  </div>
                  {form.planId === p.id && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400">Date de fin (Optionnel)</label>
            <input type="date" value={form.endDate ?? ''} onChange={e => setForm((prev: AssignPlanCommand) => ({ ...prev, endDate: e.target.value || null }))}
              className="mt-1 w-full rounded-xl bg-[#070A14] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
            <p className="text-[10px] text-slate-500 mt-1">Laissez vide pour un abonnement illimité.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:bg-white/5">Annuler</button>
            <button type="submit" disabled={loading || !form.organizationId || !form.planId}
              className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              {loading ? 'Assignation...' : '🚀 Confirmer l\'activation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


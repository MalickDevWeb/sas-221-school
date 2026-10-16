import React, { useState } from 'react';
import { Crown, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import type { PlanDto, CreatePlanCommand, Entitlement } from '@/features/super-admin/domain/models/PlatformModels';
import { FEATURE_LABELS } from './billingConstants';

export const CreatePlanModal: React.FC<{ onClose: () => void; onCreated: (p: PlanDto) => void }> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<CreatePlanCommand>({
    name: '', description: '', priceMonthly: 0, priceYearly: 0,
    entitlements: [
      { featureCode: 'MAX_STUDENTS', maxLimit: 100, isEnabled: true },
      { featureCode: 'MAX_TEACHERS', maxLimit: 20, isEnabled: true },
      { featureCode: 'MAX_CLASSES', maxLimit: 10, isEnabled: true },
      { featureCode: 'AI_TUTOR', maxLimit: 0, isEnabled: false },
      { featureCode: 'LIVE_MEET', maxLimit: 0, isEnabled: false },
      { featureCode: 'ADVANCED_REPORTS', maxLimit: 0, isEnabled: false },
      { featureCode: 'MULTI_CAMPUS', maxLimit: 0, isEnabled: false },
    ],
  });
  const [loading, setLoading] = useState(false);

  const toggleFeature = (code: string) => {
    setForm((f: CreatePlanCommand) => ({
      ...f,
      entitlements: f.entitlements.map((e: Entitlement) => e.featureCode === code ? { ...e, isEnabled: !e.isEnabled } : e)
    }));
  };
  const setLimit = (code: string, v: number) => {
    setForm((f: CreatePlanCommand) => ({
      ...f,
      entitlements: f.entitlements.map((e: Entitlement) => e.featureCode === code ? { ...e, maxLimit: v } : e)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post<PlanDto>('/v1/super-admin/plans', form);
      toast.success(`✅ Plan "${data.name}" créé avec succès !`);
      onCreated(data);
      onClose();
    } catch {
      toast.error('Erreur lors de la création du plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-[#0B0F1F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Crown size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Créer un nouveau plan</h3>
              <p className="text-xs text-slate-400">Définissez les quotas et tarification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400">Nom du plan</label>
              <input required value={form.name} onChange={e => setForm((f: CreatePlanCommand) => ({ ...f, name: e.target.value }))}
                placeholder="ex: Campus Excellence" className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400">Description</label>
              <input value={form.description} onChange={e => setForm((f: CreatePlanCommand) => ({ ...f, description: e.target.value }))}
                placeholder="Pour les grandes académies..." className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Prix mensuel (FCFA)</label>
              <input type="number" min={0} required value={form.priceMonthly} onChange={e => setForm((f: CreatePlanCommand) => ({ ...f, priceMonthly: +e.target.value }))}
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Prix annuel (FCFA)</label>
              <input type="number" min={0} required value={form.priceYearly} onChange={e => setForm((f: CreatePlanCommand) => ({ ...f, priceYearly: +e.target.value }))}
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 block">Fonctionnalités & Quotas</label>
            {form.entitlements.map((e: Entitlement) => {
              const meta = FEATURE_LABELS[e.featureCode] || { label: e.featureCode, icon: null, desc: '' };
              return (
                <div key={e.featureCode} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${e.isEnabled ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02]'}`}>
                  <button type="button" onClick={() => toggleFeature(e.featureCode)} className="flex-shrink-0">
                    {e.isEnabled ? <ToggleRight size={22} className="text-indigo-400" /> : <ToggleLeft size={22} className="text-slate-600" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${e.isEnabled ? 'text-white' : 'text-slate-500'}`}>{meta.label}</p>
                    <p className="text-[10px] text-slate-400">{meta.desc}</p>
                  </div>
                  {e.isEnabled && ['MAX_STUDENTS', 'MAX_TEACHERS', 'MAX_CLASSES'].includes(e.featureCode) && (
                    <input type="number" min={0} value={e.maxLimit} onChange={ev => setLimit(e.featureCode, +ev.target.value)}
                      className="w-20 text-xs text-center bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:border-indigo-400" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:bg-white/5">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50">
              {loading ? 'Création...' : '✨ Créer ce plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

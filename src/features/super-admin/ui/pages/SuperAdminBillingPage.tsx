import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Check, X, Edit3, Zap, Users, BookOpen,
  Calendar, ChevronDown, ToggleLeft, ToggleRight, Crown,
  Building2, AlertCircle, Clock, CheckCircle2, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import type { PlanDto, CreatePlanCommand, SubscriptionDto, AssignPlanCommand, Tenant } from '../../domain/models/PlatformModels';

// ── Feature codes lisibles ────────────────────────────────────────────────────
const FEATURE_LABELS: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  MAX_STUDENTS:    { label: 'Élèves max',        icon: <Users size={14} />,    desc: 'Nombre maximal d\'élèves inscrits' },
  MAX_TEACHERS:    { label: 'Professeurs max',   icon: <Users size={14} />,    desc: 'Nombre maximal d\'enseignants' },
  MAX_CLASSES:     { label: 'Classes max',        icon: <BookOpen size={14} />, desc: 'Nombre maximal de classes/filières' },
  AI_TUTOR:        { label: 'Tuteur IA',          icon: <Sparkles size={14} />, desc: 'Accès au tuteur IA pour les élèves' },
  LIVE_MEET:       { label: 'Cours en direct',   icon: <Zap size={14} />,      desc: 'Visioconférence Live intégrée' },
  ADVANCED_REPORTS:{ label: 'Rapports avancés',  icon: <TrendingUp size={14}/>, desc: 'Analytics et exports PDF/Excel' },
  MULTI_CAMPUS:    { label: 'Multi-campus',      icon: <Building2 size={14}/>, desc: 'Gestion de plusieurs sites' },
};

const PLAN_COLORS = ['indigo', 'emerald', 'violet', 'amber', 'rose', 'cyan'];
const planBg = (i: number) => {
  const map: Record<number, string> = {
    0: 'from-indigo-500 to-indigo-700',
    1: 'from-emerald-500 to-emerald-700',
    2: 'from-violet-500 to-violet-700',
    3: 'from-amber-500 to-amber-700',
    4: 'from-rose-500 to-rose-700',
    5: 'from-cyan-500 to-cyan-700',
  };
  return map[i % 6] || 'from-gray-500 to-gray-700';
};

// ─── Modale Créer un Plan ─────────────────────────────────────────────────────
const CreatePlanModal: React.FC<{ onClose: () => void; onCreated: (p: PlanDto) => void }> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<CreatePlanCommand>({
    name: '', description: '', priceMonthly: 0, priceYearly: 0,
    entitlements: [
      { featureCode: 'MAX_STUDENTS', maxLimit: 100, isEnabled: true },
      { featureCode: 'MAX_TEACHERS', maxLimit: 20, isEnabled: true },
      { featureCode: 'MAX_CLASSES',  maxLimit: 10, isEnabled: true },
      { featureCode: 'AI_TUTOR',     maxLimit: 0,  isEnabled: false },
      { featureCode: 'LIVE_MEET',    maxLimit: 0,  isEnabled: false },
      { featureCode: 'ADVANCED_REPORTS', maxLimit: 0, isEnabled: false },
      { featureCode: 'MULTI_CAMPUS', maxLimit: 0,  isEnabled: false },
    ],
  });
  const [loading, setLoading] = useState(false);

  const toggleFeature = (code: string) => {
    setForm((f: any) => ({ ...f, entitlements: f.entitlements.map((e: any) => e.featureCode === code ? { ...e, isEnabled: !e.isEnabled } : e) }));
  };
  const setLimit = (code: string, v: number) => {
    setForm((f: any) => ({ ...f, entitlements: f.entitlements.map((e: any) => e.featureCode === code ? { ...e, maxLimit: v } : e) }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Crown size={20} className="text-indigo-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Créer un nouveau plan</h3>
              <p className="text-sm text-gray-400">Définissez le nom, les prix et les autorisations</p>
            </div>
            <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom du plan</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: Premium École" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Pour les grandes écoles..." className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix mensuel (FCFA)</label>
              <input type="number" min={0} required value={form.priceMonthly} onChange={e => setForm(f => ({ ...f, priceMonthly: +e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix annuel (FCFA)</label>
              <input type="number" min={0} required value={form.priceYearly} onChange={e => setForm(f => ({ ...f, priceYearly: +e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Autorisations & Limites</label>
            <div className="space-y-2">
              {form.entitlements.map(e => {
                const meta = FEATURE_LABELS[e.featureCode] || { label: e.featureCode, icon: null, desc: '' };
                return (
                  <div key={e.featureCode}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${e.isEnabled ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                    <button type="button" onClick={() => toggleFeature(e.featureCode)} className="flex-shrink-0">
                      {e.isEnabled
                        ? <ToggleRight size={22} className="text-indigo-600" />
                        : <ToggleLeft size={22} className="text-gray-300" />}
                    </button>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className={e.isEnabled ? 'text-indigo-500' : 'text-gray-400'}>{meta.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${e.isEnabled ? 'text-gray-800' : 'text-gray-400'}`}>{meta.label}</p>
                        <p className="text-[10px] text-gray-400">{meta.desc}</p>
                      </div>
                    </div>
                    {e.isEnabled && ['MAX_STUDENTS', 'MAX_TEACHERS', 'MAX_CLASSES'].includes(e.featureCode) && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-gray-400">Max</span>
                        <input type="number" min={0} value={e.maxLimit}
                          onChange={ev => setLimit(e.featureCode, +ev.target.value)}
                          className="w-20 text-sm text-center border border-indigo-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-[2] py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
              {loading ? 'Création...' : '✨ Créer ce plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modale Assigner un Plan à une école ─────────────────────────────────────
const AssignPlanModal: React.FC<{ plans: PlanDto[]; tenants: Tenant[]; onClose: () => void; onAssigned: () => void }> = ({
  plans, tenants, onClose, onAssigned,
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-emerald-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assigner un plan</h3>
              <p className="text-sm text-gray-400">Abonner une école à une formule</p>
            </div>
            <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">École</label>
            <select required value={form.organizationId} onChange={e => setForm(f => ({ ...f, organizationId: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Sélectionner une école...</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formule</label>
            <div className="mt-1 grid grid-cols-1 gap-2">
              {plans.map((p, i) => (
                <label key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.planId === p.id ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="planId" value={p.id} checked={form.planId === p.id}
                    onChange={() => setForm(f => ({ ...f, planId: p.id }))} className="hidden" />
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${planBg(i)} flex items-center justify-center`}>
                    <Crown size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{(p.priceMonthly).toLocaleString()} FCFA/mois</p>
                  </div>
                  {form.planId === p.id && <CheckCircle2 size={18} className="text-emerald-500" />}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date de fin (optionnel)</label>
            <input type="date" value={form.endDate ?? ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value || null }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <p className="text-xs text-gray-400 mt-1">Laisser vide = abonnement illimité</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Annuler</button>
            <button type="submit" disabled={loading || !form.organizationId || !form.planId}
              className="flex-[2] py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
              {loading ? 'Assignation...' : '🚀 Assigner ce plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Carte Plan ───────────────────────────────────────────────────────────────
const PlanCard: React.FC<{ plan: PlanDto; index: number; subscriptionsCount: number }> = ({ plan, index, subscriptionsCount }) => {
  const enabledFeatures = plan.entitlements.filter(e => e.isEnabled);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className={`h-2 bg-gradient-to-r ${planBg(index)} w-full`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${planBg(index)} flex items-center justify-center shadow-sm`}>
              <Crown size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-400">{plan.description || 'Aucune description'}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {plan.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-black text-gray-900">{(plan.priceMonthly).toLocaleString()}</span>
          <span className="text-sm text-gray-400">FCFA/mois</span>
          <span className="ml-auto text-xs text-gray-400">{(plan.priceYearly).toLocaleString()} FCFA/an</span>
        </div>

        <div className="space-y-1.5 mb-4">
          {enabledFeatures.slice(0, 4).map(e => {
            const meta = FEATURE_LABELS[e.featureCode] || { label: e.featureCode, icon: null };
            return (
              <div key={e.featureCode} className="flex items-center gap-2 text-xs text-gray-600">
                <Check size={12} className="text-green-500 flex-shrink-0" />
                <span className="flex items-center gap-1">{meta.icon} {meta.label}
                  {e.maxLimit > 0 && <span className="font-semibold text-gray-800 ml-1">({e.maxLimit} max)</span>}
                </span>
              </div>
            );
          })}
          {plan.entitlements.filter(e => !e.isEnabled).slice(0, 2).map(e => {
            const meta = FEATURE_LABELS[e.featureCode] || { label: e.featureCode, icon: null };
            return (
              <div key={e.featureCode} className="flex items-center gap-2 text-xs text-gray-300">
                <X size={12} className="flex-shrink-0" />
                <span>{meta.label}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Building2 size={12} /> {subscriptionsCount} école{subscriptionsCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export const SuperAdminBillingPage = () => {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [plansRes, subsRes, tenantsRes] = await Promise.all([
        apiClient.get<PlanDto[]>('/v1/super-admin/plans').catch(() => ({ data: MOCK_PLANS })),
        apiClient.get<SubscriptionDto[]>('/v1/super-admin/subscriptions').catch(() => ({ data: MOCK_SUBS })),
        apiClient.get<Tenant[]>('/v1/super-admin/tenants').catch(() => ({ data: [] })),
      ]);
      setPlans(plansRes.data || MOCK_PLANS);
      setSubscriptions(subsRes.data || MOCK_SUBS);
      setTenants(tenantsRes.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const MOCK_PLANS: PlanDto[] = [
    { id: '1', name: 'Essentiel', description: 'Parfait pour débuter', priceMonthly: 25000, priceYearly: 250000, isActive: true,
      entitlements: [
        { featureCode: 'MAX_STUDENTS', maxLimit: 150, isEnabled: true },
        { featureCode: 'MAX_TEACHERS', maxLimit: 15, isEnabled: true },
        { featureCode: 'MAX_CLASSES', maxLimit: 8, isEnabled: true },
        { featureCode: 'AI_TUTOR', maxLimit: 0, isEnabled: false },
        { featureCode: 'LIVE_MEET', maxLimit: 0, isEnabled: false },
        { featureCode: 'ADVANCED_REPORTS', maxLimit: 0, isEnabled: false },
        { featureCode: 'MULTI_CAMPUS', maxLimit: 0, isEnabled: false },
      ] },
    { id: '2', name: 'Avancé', description: 'Pour les écoles en croissance', priceMonthly: 50000, priceYearly: 500000, isActive: true,
      entitlements: [
        { featureCode: 'MAX_STUDENTS', maxLimit: 500, isEnabled: true },
        { featureCode: 'MAX_TEACHERS', maxLimit: 50, isEnabled: true },
        { featureCode: 'MAX_CLASSES', maxLimit: 25, isEnabled: true },
        { featureCode: 'AI_TUTOR', maxLimit: 0, isEnabled: true },
        { featureCode: 'LIVE_MEET', maxLimit: 0, isEnabled: true },
        { featureCode: 'ADVANCED_REPORTS', maxLimit: 0, isEnabled: false },
        { featureCode: 'MULTI_CAMPUS', maxLimit: 0, isEnabled: false },
      ] },
    { id: '3', name: 'Premium', description: 'Toutes les fonctionnalités', priceMonthly: 100000, priceYearly: 999000, isActive: true,
      entitlements: [
        { featureCode: 'MAX_STUDENTS', maxLimit: 9999, isEnabled: true },
        { featureCode: 'MAX_TEACHERS', maxLimit: 9999, isEnabled: true },
        { featureCode: 'MAX_CLASSES', maxLimit: 9999, isEnabled: true },
        { featureCode: 'AI_TUTOR', maxLimit: 0, isEnabled: true },
        { featureCode: 'LIVE_MEET', maxLimit: 0, isEnabled: true },
        { featureCode: 'ADVANCED_REPORTS', maxLimit: 0, isEnabled: true },
        { featureCode: 'MULTI_CAMPUS', maxLimit: 0, isEnabled: true },
      ] },
  ];

  const MOCK_SUBS: SubscriptionDto[] = [
    { id: 's1', organizationId: 't1', tenantName: 'Ecole 221', planId: '3', planName: 'Premium', startDate: '2024-01-01', endDate: null, status: 'ACTIVE' },
    { id: 's2', organizationId: 't2', tenantName: 'Lycée Thiès', planId: '2', planName: 'Avancé', startDate: '2025-01-01', endDate: '2026-01-01', status: 'ACTIVE' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      EXPIRED: 'bg-red-100 text-red-600',
      CANCELLED: 'bg-gray-100 text-gray-500',
      PENDING: 'bg-yellow-100 text-yellow-700',
    };
    const icon: Record<string, React.ReactNode> = {
      ACTIVE: <CheckCircle2 size={11} />, EXPIRED: <AlertCircle size={11} />,
      CANCELLED: <X size={11} />, PENDING: <Clock size={11} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || 'bg-gray-100 text-gray-500'}`}>
        {icon[status]} {status}
      </span>
    );
  };

  const totalRevenueMensuel = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (plans.find(p => p.id === s.planId)?.priceMonthly || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Plans & Abonnements</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gérez les formules et les souscriptions des écoles</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAssignPlan(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all">
            <Building2 size={16} /> Assigner un plan
          </button>
          <button onClick={() => setShowCreatePlan(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> Nouveau plan
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Plans actifs', value: plans.filter(p => p.isActive).length, icon: <Crown size={18} />, color: 'indigo' },
          { label: 'Abonnements actifs', value: subscriptions.filter(s => s.status === 'ACTIVE').length, icon: <CheckCircle2 size={18} />, color: 'emerald' },
          { label: 'Revenus/mois (FCFA)', value: (totalRevenueMensuel).toLocaleString(), icon: <TrendingUp size={18} />, color: 'violet' },
          { label: 'Expirent bientôt', value: subscriptions.filter(s => s.endDate && new Date(s.endDate) < new Date(Date.now() + 30 * 86400000)).length, icon: <AlertCircle size={18} />, color: 'amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center text-${kpi.color}-600 bg-${kpi.color}-50`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['plans', 'subscriptions'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'plans' ? `📋 Formules (${plans.length})` : `🏫 Abonnements (${subscriptions.length})`}
          </button>
        ))}
      </div>

      {/* Plans */}
      {activeTab === 'plans' && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i}
                subscriptionsCount={subscriptions.filter(s => s.planId === plan.id && s.status === 'ACTIVE').length} />
            ))}
            {/* Carte ajouter */}
            <button onClick={() => setShowCreatePlan(true)}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group min-h-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <Plus size={22} className="text-gray-400 group-hover:text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-gray-400 group-hover:text-indigo-600">Créer un plan</p>
            </button>
          </div>
        )
      )}

      {/* Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">École</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Début</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Fin</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.map((sub, i) => {
                const plan = plans.find(p => p.id === sub.planId);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${planBg(i)} flex items-center justify-center text-white text-xs font-black`}>
                          {(sub.tenantName || '?')[0]}
                        </div>
                        <span className="font-semibold text-gray-800">{sub.tenantName || sub.organizationId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-700">{plan?.name || sub.planName || sub.planId}</span>
                      {plan && <span className="ml-2 text-xs text-gray-400">{plan.priceMonthly.toLocaleString()} FCFA/mois</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{new Date(sub.startDate).toLocaleDateString('fr')}</td>
                    <td className="px-4 py-3.5 text-gray-500">{sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr') : <span className="text-green-600 font-semibold">Illimité</span>}</td>
                    <td className="px-4 py-3.5">{statusBadge(sub.status)}</td>
                  </tr>
                );
              })}
              {subscriptions.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Aucun abonnement encore assigné</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {showCreatePlan && (
        <CreatePlanModal onClose={() => setShowCreatePlan(false)}
          onCreated={p => setPlans(prev => [...prev, p])} />
      )}
      {showAssignPlan && (
        <AssignPlanModal plans={plans} tenants={tenants}
          onClose={() => setShowAssignPlan(false)} onAssigned={fetchAll} />
      )}
    </div>
  );
};

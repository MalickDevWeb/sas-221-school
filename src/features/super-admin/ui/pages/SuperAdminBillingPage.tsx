import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import type { PlanDto, SubscriptionDto, Tenant } from '../../domain/models/PlatformModels';
import { BillingPlanCard } from '../components/billing/BillingPlanCard';
import { BillingStatsGrid } from '../components/billing/BillingStatsGrid';
import { BillingSubscriptionsTable } from '../components/billing/BillingSubscriptionsTable';
import { CreatePlanModal } from '../components/billing/CreatePlanModal';
import { AssignPlanModal } from '../components/billing/AssignPlanModal';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu } from '@/shared/components/SousMenuModule';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export const SuperAdminBillingPage = () => {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');
  const [replie, basculer] = useRepliSousMenu('super-admin-facturation');
  // Instant figé au premier affichage (react-hooks/purity : pas de Date.now() à chaque rendu)
  const [maintenant] = useState(() => Date.now());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['superadmin', 'billing', 'all'],
    queryFn: async () => {
      // Une liste illisible n'est plus remplacée par une liste vide (affichée comme « aucun ») : l'écran le dit.
      const echecs: string[] = [];
      const lire = async <T,>(url: string, quoi: string): Promise<T[]> => {
        try { const { data: d } = await apiClient.get<T[]>(url); return Array.isArray(d) ? d : []; }
        catch (e) { echecs.push(`${quoi} : ${resolveErrorMessage(e)}`); return []; }
      };
      const [plansL, subsL, tenantsL] = await Promise.all([
        lire<PlanDto>('/v1/super-admin/plans', 'formules'),
        lire<SubscriptionDto>('/v1/super-admin/subscriptions', 'abonnements'),
        lire<Tenant>('/v1/super-admin/tenants', 'établissements'),
      ]);
      return { plans: plansL, subscriptions: subsL, tenants: tenantsL, echecs };
    },
  });

  const plans = data?.plans || [];
  const subscriptions = data?.subscriptions || [];
  const tenants = data?.tenants || [];
  const fetchAll = () => { refetch(); };

  const totalMonthlyRevenue = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (plans.find(p => p.id === s.planId)?.priceMonthly || 0), 0);

  const expiringCount = subscriptions.filter(s => s.endDate && new Date(s.endDate) < new Date(maintenant + 30 * 86400000)).length;

  const actions = (
    <>
      <button type="button" onClick={() => setShowAssignPlan(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer">
        <Building2 size={15} /> Assigner un plan
      </button>
      <button type="button" onClick={() => setShowCreatePlan(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer">
        <Plus size={15} /> Nouvelle formule
      </button>
    </>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <ModuleAvecSousMenu
        apparence="sombre"
        id="super-admin-facturation"
        idContenu="super-admin-facturation-contenu"
        titre={activeTab === 'plans' ? 'Formules' : 'Abonnements'}
        sousTitre={activeTab === 'plans' ? 'Formules proposées aux écoles, avec leur prix et leurs limites.' : 'Abonnements des écoles : formule, statut et date de fin.'}
        actions={actions}
        sousMenu={(
          <SousMenuModule apparence="sombre" id="facturation-subsidebar" titre="Facturation" actif={activeTab}
            onChoisir={(id) => { if (id === 'plans' || id === 'subscriptions') setActiveTab(id); }}
            replie={replie} onBasculerRepli={basculer}
            entrees={[
              { id: 'plans', libelle: `Formules${isLoading ? '' : ` (${plans.length})`}`, icone: 'sell' },
              { id: 'subscriptions', libelle: `Abonnements${isLoading ? '' : ` (${subscriptions.length})`}`, icone: 'apartment',
                sousLibelle: expiringCount ? `${expiringCount} fin${expiringCount > 1 ? 's' : ''} sous 30 jours` : undefined },
            ]} />
        )}
      >
        <div className="space-y-6">
          {data && data.echecs.length > 0 && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-semibold">
              <span>Données incomplètes — {data.echecs.join(' ; ')}</span>
              <button type="button" onClick={fetchAll} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold cursor-pointer">Réessayer</button>
            </div>
          )}

          <BillingStatsGrid
            activePlansCount={plans.filter(p => p.isActive).length}
            activeSubsCount={subscriptions.filter(s => s.status === 'ACTIVE').length}
            totalMonthlyRevenue={totalMonthlyRevenue}
            expiringCount={expiringCount}
          />

          {activeTab === 'plans' ? (
            isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {plans.map((plan, i) => (
                  <BillingPlanCard key={plan.id} plan={plan} index={i}
                    subscriptionsCount={subscriptions.filter(s => s.planId === plan.id && s.status === 'ACTIVE').length} />
                ))}
                <button type="button" onClick={() => setShowCreatePlan(true)}
                  className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-500/40 hover:bg-white/[0.02] transition-all group min-h-[220px] cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                    <Plus size={22} className="text-slate-400 group-hover:text-indigo-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-300">Créer une nouvelle formule</p>
                </button>
              </div>
            )
          ) : (
            isLoading
              ? <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
              : <BillingSubscriptionsTable subscriptions={subscriptions} plans={plans} />
          )}
        </div>
      </ModuleAvecSousMenu>

      {showCreatePlan && <CreatePlanModal onClose={() => setShowCreatePlan(false)} onCreated={() => { refetch(); setShowCreatePlan(false); }} />}
      {showAssignPlan && <AssignPlanModal plans={plans} tenants={tenants} onClose={() => setShowAssignPlan(false)} onAssigned={fetchAll} />}
    </div>
  );
};

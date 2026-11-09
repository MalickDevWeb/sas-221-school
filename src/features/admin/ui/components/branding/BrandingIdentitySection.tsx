import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { superAdminService } from '@/services/superAdminService';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { Tenant } from '@/features/super-admin/domain/models/PlatformModels';

type Coordonnees = { name: string; email: string; phone: string; address: string };

const LIBELLES: Record<keyof Coordonnees, string> = {
  name: 'nom',
  email: 'email',
  phone: 'téléphone',
  address: 'adresse',
};

const depuisTenant = (t: Partial<Tenant> | null | undefined): Coordonnees => ({
  name: t?.name ?? '',
  email: t?.email ?? '',
  phone: t?.phone ?? '',
  address: t?.address ?? '',
});

/**
 * Identité de l'établissement : chargée depuis la fiche réelle de l'école (organisation) et enregistrée
 * via PATCH /v1/super-admin/tenants/{id}. Seuls nom, email, téléphone et adresse existent côté serveur ;
 * la devise/slogan n'a aucune source et reste désactivée.
 */
export const BrandingIdentitySection: React.FC = () => {
  const { currentTenant, resolveTenant } = useTenantStore();
  const tenantId = currentTenant?.id && !currentTenant.id.startsWith('mock-') && !currentTenant.id.startsWith('default-')
    ? currentTenant.id
    : null;
  const [form, setForm] = useState<Coordonnees>({ name: currentTenant?.name ?? '', email: '', phone: '', address: '' });
  const [initial, setInitial] = useState<Coordonnees | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let actif = true;
    if (!tenantId) {
      setLoadError("Aucune école identifiée : les coordonnées ne peuvent pas être chargées.");
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient.get<Tenant>(`/v1/super-admin/tenants/${encodeURIComponent(tenantId)}`)
      .then(({ data }) => {
        if (!actif) return;
        const c = depuisTenant(data);
        setForm(c);
        setInitial(c);
        setLoadError(null);
      })
      .catch(err => { if (actif) setLoadError(resolveErrorMessage(err)); })
      .finally(() => { if (actif) setLoading(false); });
    return () => { actif = false; };
  }, [tenantId]);

  const editable = !loading && !loadError && initial !== null;
  const set = (k: keyof Coordonnees) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editable || !tenantId || !initial) return;
    const modifies = (Object.keys(form) as Array<keyof Coordonnees>).filter(k => form[k].trim() !== initial[k].trim());
    if (modifies.length === 0) {
      toast.info('Aucune modification à enregistrer.');
      return;
    }
    const payload: Partial<Coordonnees> = {};
    modifies.forEach(k => { payload[k] = form[k].trim(); });
    setIsSaving(true);
    try {
      const saved = await superAdminService.updateTenant(tenantId, payload);
      const c = depuisTenant(saved);
      setForm(c);
      setInitial(c);
      if (currentTenant?.slug) void resolveTenant(currentTenant.slug);
      toast.success(`Enregistré : ${modifies.map(k => LIBELLES[k]).join(', ')}.`);
    } catch (err) {
      toast.error("Les informations n'ont pas été enregistrées.", { description: resolveErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const champ = 'w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Identité & Coordonnées Officielles
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ces coordonnées figurent sur les attestations officielles, les convocations, les emails et le pied de page des portails.
        </p>
      </div>

      {loading && <p className="text-[11px] font-bold text-neutral-400 animate-pulse">Chargement des coordonnées…</p>}
      {loadError && (
        <p className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
          Coordonnées indisponibles : {loadError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nom de l'établissement *</label>
          <input required disabled={!editable} type="text" value={form.name} onChange={set('name')} className={`${champ} font-bold`} />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Devise / Slogan</label>
          <input
            type="text"
            disabled
            aria-disabled="true"
            value=""
            placeholder="Fonctionnalité non disponible : aucune source de données"
            className={champ}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Email officiel de contact</label>
          <input type="email" disabled={!editable} value={form.email} onChange={set('email')} placeholder={editable ? 'Non renseigné' : '—'} className={champ} />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Téléphone / WhatsApp officiel</label>
          <input type="tel" disabled={!editable} value={form.phone} onChange={set('phone')} placeholder={editable ? 'Non renseigné' : '—'} className={champ} />
        </div>
      </div>

      <div className="text-xs">
        <label className="block font-bold text-slate-700 mb-1">Adresse & Siège du Campus</label>
        <input type="text" disabled={!editable} value={form.address} onChange={set('address')} placeholder={editable ? 'Non renseignée' : '—'} className={champ} />
      </div>

      <div className="pt-2 border-t border-neutral-100 flex justify-end">
        <button disabled={isSaving || !editable} type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Save size={14} />
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
        </button>
      </div>
    </form>
  );
};

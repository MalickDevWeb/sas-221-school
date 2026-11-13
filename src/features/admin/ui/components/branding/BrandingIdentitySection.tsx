import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';

/** Fiche renvoyée par GET/PUT /admin/coordonnees (null = non renseigné). */
type FicheServeur = { name: string; email: string | null; phone: string | null; address: string | null; city: string | null; website: string | null };

const schema = z.object({
  name: z.string().trim().min(1, "Le nom de l'établissement est obligatoire.").max(150, '150 caractères au maximum.')
    .refine(v => /\p{L}/u.test(v), "Le nom de l'établissement doit contenir des lettres."),
  email: z.string().trim().max(150, '150 caractères au maximum.')
    .refine(v => v === '' || /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(v), "Email invalide (exemple : contact@ecole.sn)."),
  phone: z.string().trim()
    .refine(v => v === '' || /^\+?[0-9 .-]{6,20}$/.test(v), 'Téléphone invalide : chiffres, espaces, points ou tirets, 6 à 20 caractères (ex. +221 33 800 00 00).'),
  address: z.string().trim().max(300, '300 caractères au maximum.'),
  city: z.string().trim().max(100, '100 caractères au maximum.')
    .refine(v => v === '' || /\p{L}/u.test(v), 'La ville doit contenir des lettres.'),
  website: z.string().trim().max(250, '250 caractères au maximum.')
    .refine(v => v === '' || /^https?:\/\/[^\s/$.?#][^\s]+$/i.test(v), 'Lien complet attendu, commençant par https:// (ex. https://ecole221.sn).'),
});
type Saisie = z.infer<typeof schema>;
type Champ = keyof Saisie;

const CHAMPS: readonly Champ[] = ['name', 'email', 'phone', 'address', 'city', 'website'];
const LIBELLES: Record<Champ, string> = {
  name: 'nom', email: 'email', phone: 'téléphone', address: 'adresse', city: 'ville', website: 'site web',
};
const VIDE: Saisie = { name: '', email: '', phone: '', address: '', city: '', website: '' };

const versSaisie = (f: FicheServeur): Saisie => ({
  name: f.name ?? '', email: f.email ?? '', phone: f.phone ?? '', address: f.address ?? '', city: f.city ?? '', website: f.website ?? '',
});

/**
 * Identité de l'établissement : fiche réelle de l'école courante, lue et enregistrée via /admin/coordonnees.
 * Avant (2026-11-13) : l'écran appelait /v1/super-admin/tenants/{id}, route réservée au super-administrateur :
 * l'administrateur de l'école voyait « Coordonnées indisponibles » et ne pouvait rien modifier.
 * La devise / slogan n'a aucune source et reste désactivée.
 */
export const BrandingIdentitySection: React.FC = () => {
  const { currentTenant, resolveTenant } = useTenantStore();
  const [initial, setInitial] = useState<Saisie | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [erreurGlobale, setErreurGlobale] = useState('');
  const enCours = useRef(false);   // double clic : un seul envoi
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Saisie>({
    resolver: zodResolver(schema), defaultValues: VIDE, mode: 'onTouched',
  });

  useEffect(() => {
    let actif = true;
    apiClient.get<FicheServeur>('/admin/coordonnees')
      .then(({ data }) => {
        if (!actif) return;
        const s = versSaisie(data);
        reset(s);
        setInitial(s);
        setLoadError(null);
      })
      .catch(err => { if (actif) setLoadError(resolveErrorMessage(err)); })
      .finally(() => { if (actif) setLoading(false); });
    return () => { actif = false; };
  }, [reset]);

  const editable = !loading && !loadError && initial !== null;

  const enregistrer = async (v: Saisie) => {
    if (!initial || enCours.current) return;
    const modifies = CHAMPS.filter(k => v[k] !== initial[k]);
    if (modifies.length === 0) {
      toast.info('Aucune modification à enregistrer.');
      return;
    }
    enCours.current = true;
    setErreurGlobale('');
    try {
      const corps: Partial<Saisie> = {};
      modifies.forEach(k => { corps[k] = v[k]; });
      const { data } = await apiClient.put<FicheServeur>('/admin/coordonnees', corps);
      const s = versSaisie(data);
      reset(s);
      setInitial(s);
      if (currentTenant?.slug) void resolveTenant(currentTenant.slug);
      toast.success(`Enregistré : ${modifies.map(k => LIBELLES[k]).join(', ')}.`);
    } catch (err) {
      setErreurGlobale(reporterErreurServeur(err, setError, {
        champs: CHAMPS,
        motsCles: { name: /nom de l'établissement/i, email: /e-?mail/i, phone: /téléphone/i, address: /adresse/i, city: /ville/i, website: /site web/i },
      }) ?? '');
    } finally {
      enCours.current = false;
    }
  };

  const champ = 'w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed aria-[invalid=true]:border-rose-400';
  const aria = (id: Champ) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `coord-${id}-erreur` } : {};
  const message = (id: Champ) => errors[id] && (
    <p id={`coord-${id}-erreur`} role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors[id]?.message}</p>
  );
  const vide = (texte: string) => (editable ? texte : '—');

  return (
    <form onSubmit={(e) => void handleSubmit(enregistrer)(e)} noValidate data-validation-externe
          className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
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
        <p role="alert" className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
          Coordonnées indisponibles : {loadError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label htmlFor="coord-name" className="block font-bold text-slate-700 mb-1">Nom de l'établissement *</label>
          <input id="coord-name" disabled={!editable} type="text" className={`${champ} font-bold`} {...register('name')} {...aria('name')} />
          {message('name')}
        </div>
        <div>
          <label htmlFor="coord-devise" className="block font-bold text-slate-700 mb-1">Devise / Slogan</label>
          <input id="coord-devise" type="text" disabled aria-disabled="true" value=""
                 placeholder="Fonctionnalité non disponible : aucune source de données" className={champ} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label htmlFor="coord-email" className="block font-bold text-slate-700 mb-1">Email officiel de contact</label>
          <input id="coord-email" type="email" disabled={!editable} placeholder={vide('Non renseigné')} className={champ} {...register('email')} {...aria('email')} />
          {message('email')}
        </div>
        <div>
          <label htmlFor="coord-phone" className="block font-bold text-slate-700 mb-1">Téléphone / WhatsApp officiel</label>
          <input id="coord-phone" type="tel" disabled={!editable} placeholder={vide('Non renseigné')} className={champ} {...register('phone')} {...aria('phone')} />
          {message('phone')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label htmlFor="coord-address" className="block font-bold text-slate-700 mb-1">Adresse & Siège du Campus</label>
          <input id="coord-address" type="text" disabled={!editable} placeholder={vide('Non renseignée')} className={champ} {...register('address')} {...aria('address')} />
          {message('address')}
        </div>
        <div>
          <label htmlFor="coord-city" className="block font-bold text-slate-700 mb-1">Ville</label>
          <input id="coord-city" type="text" disabled={!editable} placeholder={vide('Non renseignée')} className={champ} {...register('city')} {...aria('city')} />
          {message('city')}
        </div>
      </div>

      <div className="text-xs">
        <label htmlFor="coord-website" className="block font-bold text-slate-700 mb-1">Site web</label>
        <input id="coord-website" type="url" disabled={!editable} placeholder={vide('Non renseigné')} className={champ} {...register('website')} {...aria('website')} />
        {message('website')}
      </div>

      {erreurGlobale && <p role="alert" className="text-[11px] font-bold text-rose-700 m-0">{erreurGlobale}</p>}

      <div className="pt-2 border-t border-neutral-100 flex justify-end">
        <button disabled={isSubmitting || !editable} type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Save size={14} />
          <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
        </button>
      </div>
    </form>
  );
};

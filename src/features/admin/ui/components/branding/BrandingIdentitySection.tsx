import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTenantStore } from '@/core/store/tenantStore';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import { formatPhoneInput } from '@/shared/utils/phoneUtils';
import { EnTeteModule } from '@/shared/components/EnTeteModule';
import { Button } from '@/design-system/components/Button';

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
  name: 'nom', email: 'e-mail', phone: 'téléphone', address: 'adresse', city: 'ville', website: 'site web',
};
const VIDE: Saisie = { name: '', email: '', phone: '', address: '', city: '', website: '' };

/**
 * Téléphone affiché groupé (« +221 77 800 80 80 ») : affichage seulement. Un champ non modifié n'est jamais envoyé
 * (seuls les champs changés partent au serveur) ; un numéro saisi part tel que la personne l'a tapé.
 */
const versSaisie = (f: FicheServeur): Saisie => ({
  name: f.name ?? '', email: f.email ?? '', phone: f.phone ? formatPhoneInput(f.phone) : '', address: f.address ?? '', city: f.city ?? '', website: f.website ?? '',
});

/** « nom », « nom et ville », « téléphone, ville et adresse ». */
const enumeration = (mots: string[]) => (mots.length < 2 ? mots.join('') : `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`);

/**
 * Identité de l'école : fiche réelle de l'école courante, lue et enregistrée via /admin/coordonnees.
 * Lisibilité : champs blancs, valeur en texte foncé, exemples en gris clair (un champ vide ne ressemble plus à
 * un champ rempli), libellés en style phrase, téléphone groupé, bouton désactivé tant que rien n'a changé, message de
 * réussite court à côté du bouton. Champ « Devise / slogan » retiré : aucune donnée côté serveur, aucun autre écran ne
 * s'en sert (règle « aucune fonction fictive »).
 */
export const BrandingIdentitySection: React.FC = () => {
  const { currentTenant, resolveTenant } = useTenantStore();
  const [initial, setInitial] = useState<Saisie | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [erreurGlobale, setErreurGlobale] = useState('');
  /** Champs du dernier enregistrement, rappelés à côté du bouton tant que la fiche affichée est celle enregistrée. */
  const [enregistres, setEnregistres] = useState<string[] | null>(null);
  const enCours = useRef(false);   // double clic : un seul envoi
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm<Saisie>({
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
      // ex. espaces ajoutés autour d'une valeur : rien de réellement changé (« Aucune modification à enregistrer »)
      reset(initial);
      setEnregistres(null);
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
      setEnregistres(modifies.map(k => LIBELLES[k]));
      if (currentTenant?.slug) void resolveTenant(currentTenant.slug);
    } catch (err) {
      setErreurGlobale(reporterErreurServeur(err, setError, {
        champs: CHAMPS,
        motsCles: { name: /nom de l'établissement/i, email: /e-?mail/i, phone: /téléphone/i, address: /adresse/i, city: /ville/i, website: /site web/i },
      }) ?? '');
    } finally {
      enCours.current = false;
    }
  };

  // Champ blanc, valeur foncée, exemple en gris clair, anneau de focus net ; 16 px sur téléphone (pas de zoom iOS)
  const champ = 'w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 '
    + 'placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 '
    + 'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-200';
  const libelle = 'block text-xs font-semibold text-slate-700 mb-1.5';
  const aria = (id: Champ) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `coord-${id}-erreur` } : {};
  const message = (id: Champ) => errors[id] && (
    <p id={`coord-${id}-erreur`} role="alert" className="mt-1.5 text-xs font-semibold text-rose-700">{errors[id]?.message}</p>
  );
  // Exemple affiché dans un champ vide (charte : « ex. : Lycée de Thiès ») ; rien tant que la fiche n'est pas chargée
  const exemple = (texte: string) => (editable ? `ex.\u00a0: ${texte}` : '');

  return (
    <form onSubmit={(e) => void handleSubmit(enregistrer)(e)} noValidate data-validation-externe id="coordonnees-ecole"
          className="p-4 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5">
      <EnTeteModule
        icone="apartment"
        titre="Identité et coordonnées officielles"
        sousTitre="Affichées sur les attestations, les convocations, les e-mails et le pied de page des portails."
      />

      {loading && <p className="text-xs font-semibold text-slate-400 animate-pulse">Chargement des coordonnées…</p>}
      {loadError && (
        <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
          Coordonnées indisponibles : {loadError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="sm:col-span-2">
          <label htmlFor="coord-name" className={libelle}>Nom de l'école <span aria-hidden="true" className="text-rose-600">*</span></label>
          <input id="coord-name" disabled={!editable} type="text" aria-required="true" placeholder={exemple('Lycée de Thiès')}
                 className={`${champ} font-semibold`} {...register('name')} {...aria('name')} />
          {message('name')}
        </div>
        <div>
          <label htmlFor="coord-email" className={libelle}>E-mail de contact</label>
          <input id="coord-email" type="email" disabled={!editable} placeholder={exemple('contact@monecole.sn')} className={champ} {...register('email')} {...aria('email')} />
          {message('email')}
        </div>
        <div>
          <label htmlFor="coord-phone" className={libelle}>Téléphone (WhatsApp)</label>
          <input id="coord-phone" type="tel" disabled={!editable} placeholder={exemple('+221 77 123 45 67')} className={champ} {...register('phone')} {...aria('phone')} />
          {message('phone')}
        </div>
        <div>
          <label htmlFor="coord-address" className={libelle}>Adresse du siège</label>
          <input id="coord-address" type="text" disabled={!editable} placeholder={exemple('12 avenue Cheikh Anta Diop')} className={champ} {...register('address')} {...aria('address')} />
          {message('address')}
        </div>
        <div>
          <label htmlFor="coord-city" className={libelle}>Ville</label>
          <input id="coord-city" type="text" disabled={!editable} placeholder={exemple('Thiès')} className={champ} {...register('city')} {...aria('city')} />
          {message('city')}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="coord-website" className={libelle}>Site web</label>
          <input id="coord-website" type="url" disabled={!editable} placeholder={exemple('https://monecole.sn')} className={champ} {...register('website')} {...aria('website')} />
          {message('website')}
        </div>
      </div>

      {erreurGlobale && <p role="alert" className="text-xs font-semibold text-rose-700 m-0">{erreurGlobale}</p>}

      <div className="pt-4 border-t border-neutral-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
        <p id="coord-etat" role="status" className="text-xs font-medium sm:text-right">
          {editable && !isDirty && (enregistres ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">check_circle</span>
              {`Enregistré\u00a0: ${enumeration(enregistres)}.`}
            </span>
          ) : (
            <span className="text-slate-400">Aucune modification à enregistrer</span>
          ))}
        </p>
        <Button type="submit" disabled={isSubmitting || !editable || !isDirty}
          aria-describedby={!isDirty ? 'coord-etat' : undefined} className="w-full sm:w-auto">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">save</span>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  );
};

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { apiClient } from '@/shared/lib/apiClient';
import { DOMAINE_PLATEFORME } from '@/shared/lib/hoteEcole';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';

/** Statuts d'un domaine déclaré (contrat « pointage + déclaration », 15/11). */
type StatutDomaine = 'EN_ATTENTE_POINTAGE' | 'ACTIF' | 'DESACTIVE';

/** Domaine tel que renvoyé par POST /admin/domaines, POST …/verifier et dans la liste. */
type DomaineDeclare = {
  domaine: string;
  statut: StatutDomaine | string;
  pointeVersCetteEcole: boolean;
  verifieLe?: string | null;
  message?: string | null;
};

/** Réponse de GET /admin/domaines. */
type ListeDomaines = { adresseEcole: string; cible: string; domaines: DomaineDeclare[] };

const CLE_DOMAINES = ['admin-domaines'] as const;

const STATUTS: Record<StatutDomaine, { libelle: string; classe: string }> = {
  ACTIF: { libelle: 'Actif', classe: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  EN_ATTENTE_POINTAGE: { libelle: 'En attente du pointage DNS', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
  DESACTIVE: { libelle: 'Désactivé : le pointage a disparu', classe: 'bg-rose-50 text-rose-800 border-rose-200' },
};
const estStatutConnu = (s: string): s is StatutDomaine => s in STATUTS;

/** « https://Portail.Lycee-Thies.sn/accueil » → « portail.lycee-thies.sn » (le nom d'hôte seul). */
const normaliserDomaine = (v: string): string =>
  v.trim().toLowerCase().replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.+$/, '');

const NOM_DE_DOMAINE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const estAdresseIp = (d: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(d) || d.includes(':') || d.startsWith('[');
const EXEMPLE = '(ex. portail.lycee-thies.sn)';

const estDeLaPlateforme = (d: string) => d === DOMAINE_PLATEFORME || d.endsWith(`.${DOMAINE_PLATEFORME}`);

function schemaPour(dejaDeclares: readonly string[]) {
  return z.object({
    domaine: z.string()
      .refine(v => normaliserDomaine(v) !== '', `Saisissez votre domaine ${EXEMPLE}.`)
      .refine(v => !/\s/.test(v.trim()), `Le domaine ne doit pas contenir d’espace ${EXEMPLE}.`)
      .refine(v => !estAdresseIp(normaliserDomaine(v)),
        `Une adresse IP ne peut pas servir d’adresse d’école : saisissez un nom de domaine ${EXEMPLE}.`)
      .refine(v => normaliserDomaine(v) === '' || NOM_DE_DOMAINE.test(normaliserDomaine(v)),
        `Domaine invalide : lettres sans accent, chiffres, tirets et points, avec une extension ${EXEMPLE}.`)
      .refine(v => !estDeLaPlateforme(normaliserDomaine(v)),
        `Les adresses en ${DOMAINE_PLATEFORME} appartiennent à My School : saisissez le domaine de votre établissement ${EXEMPLE}.`)
      .refine(v => !dejaDeclares.includes(normaliserDomaine(v)), 'Ce domaine est déjà déclaré pour votre école (voir la liste ci-dessous).'),
  });
}
type Saisie = { domaine: string };

/** Nom d'hôte seul, quelle que soit la forme renvoyée (« https://x/ » ou « x »). */
const hoteSeul = (v: string | null | undefined) => (v ? normaliserDomaine(v) : '');

const dateVerification = (v: string | null | undefined): string | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

/**
 * Adresse de l'école (décision du Tech Lead, 2026-11-15 : « pointage + déclaration »). L'école est servie sur
 * <slug>.<domaine de la plateforme>. Pour utiliser son propre domaine, l'école le fait pointer (CNAME) vers cette
 * adresse ET le déclare ici : sans déclaration, un domaine piège pointé vers une école ne serait jamais servi.
 */
export const BrandingAdresseSection: React.FC = () => {
  const { currentTenant } = useTenantStore();
  const queryClient = useQueryClient();
  const slug = currentTenant?.slug || null;

  const liste = useQuery({
    queryKey: CLE_DOMAINES,
    queryFn: async () => (await apiClient.get<ListeDomaines>('/admin/domaines')).data,
    retry: 1,
  });

  const adresse = hoteSeul(liste.data?.adresseEcole) || (slug ? `${slug}.${DOMAINE_PLATEFORME}` : '');
  const cible = hoteSeul(liste.data?.cible) || adresse;
  const domaines = useMemo(() => liste.data?.domaines ?? [], [liste.data]);
  const dejaDeclares = useMemo(() => domaines.map(d => hoteSeul(d.domaine)), [domaines]);

  const resolver = useMemo(() => zodResolver(schemaPour(dejaDeclares)), [dejaDeclares]);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<Saisie>({
    resolver, defaultValues: { domaine: '' }, mode: 'onSubmit', reValidateMode: 'onChange',
  });

  const rafraichir = () => queryClient.invalidateQueries({ queryKey: CLE_DOMAINES });

  const ajout = useMutation({
    mutationFn: async (domaine: string) => (await apiClient.post<DomaineDeclare>('/admin/domaines', { domaine })).data,
    onSuccess: (d) => {
      reset({ domaine: '' });
      toast.success(d.message || `Domaine ${d.domaine} ajouté.`);
      void rafraichir();
    },
    // 400 (domaine invalide, de la plateforme, IP) ou 409 (déjà déclaré ailleurs, quota) : message du serveur sous le champ
    onError: (err) => setError('domaine', { type: 'server', message: resolveErrorMessage(err) }),
  });

  const verification = useMutation({
    mutationFn: async (domaine: string) =>
      (await apiClient.post<DomaineDeclare>(`/admin/domaines/${encodeURIComponent(domaine)}/verifier`)).data,
    onSuccess: (d) => {
      if (d.pointeVersCetteEcole) toast.success(d.message || `${d.domaine} pointe bien vers l'école.`);
      else toast.warning(d.message || `${d.domaine} ne pointe pas encore vers ${cible}.`);
      void rafraichir();
    },
    onError: (err) => { toast.error(`Vérification impossible : ${resolveErrorMessage(err)}`); },
  });

  const retrait = useMutation({
    mutationFn: async (domaine: string) => { await apiClient.delete(`/admin/domaines/${encodeURIComponent(domaine)}`); return domaine; },
    onSuccess: (domaine) => { toast.success(`Domaine ${domaine} retiré : il ne mène plus à l'école.`); void rafraichir(); },
    onError: (err) => { toast.error(`Retrait impossible : ${resolveErrorMessage(err)}`); },
  });

  const ajouter = (v: Saisie) => {
    if (ajout.isPending) return;   // double clic : un seul envoi
    ajout.mutate(normaliserDomaine(v.domaine));
  };

  const retirer = async (domaine: string) => {
    if (retrait.isPending) return;
    const oui = await demanderConfirmation(
      `Retirer ${domaine} ? Cette adresse ne mènera plus à l'école ; l'adresse ${adresse || 'My School'} reste active.`,
      { titre: 'Retirer un domaine', confirmer: 'Retirer' });
    if (oui) retrait.mutate(domaine);
  };

  const indisponible = !liste.data;   // liste non chargée : l'ajout attend d'avoir la liste (doublons, cible)
  const raisonIndisponible = liste.isPending ? 'Chargement des domaines déclarés…' : 'Indisponible : la liste des domaines n’a pas pu être chargée.';

  return (
    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5" id="adresse-ecole-section">
      <div>
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Adresse de l'école
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Adresse à laquelle élèves, parents et personnel ouvrent l'espace de l'établissement.
        </p>
      </div>

      {adresse ? (
        <p className="text-sm text-slate-700">
          Adresse de l'école :{' '}
          <a id="adresse-ecole" href={`https://${adresse}`} target="_blank" rel="noreferrer"
             className="font-mono font-black text-primary underline break-all">
            https://{adresse}
          </a>
        </p>
      ) : (
        <p role="alert" className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
          Adresse indisponible : l'établissement courant n'est pas identifié. Rechargez la page depuis l'espace de l'école.
        </p>
      )}

      <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-xs text-slate-600 space-y-1.5">
        <p className="font-black text-slate-800">Pour utiliser votre propre domaine (3 au maximum) :</p>
        <p>
          1. Chez votre registraire, ajoutez un enregistrement <strong>CNAME</strong> <code className="font-mono">portail</code>{' '}
          (ou <code className="font-mono">www</code>) vers <code className="font-mono">{cible || `<identifiant>.${DOMAINE_PLATEFORME}`}</code>.
        </p>
        <p>2. Ajoutez ici votre domaine.</p>
        <p>Pour l'adresse nue (sans www), activez chez votre registraire la redirection vers www.</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(ajouter)(e)} noValidate data-validation-externe className="space-y-1">
        <label htmlFor="domaine-ecole" className="block text-xs font-bold text-slate-700 mb-1">Votre domaine</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="domaine-ecole"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="ex. portail.lycee-thies.sn"
            disabled={indisponible}
            className="flex-1 h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono focus:bg-white focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed aria-[invalid=true]:border-rose-400"
            {...register('domaine')}
            {...(errors.domaine ? { 'aria-invalid': true as const, 'aria-describedby': 'domaine-ecole-erreur' } : {})}
          />
          <button
            id="ajouter-domaine"
            type="submit"
            disabled={indisponible || ajout.isPending}
            title={indisponible ? raisonIndisponible : undefined}
            className="px-5 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            <span>{ajout.isPending ? 'Ajout…' : 'Ajouter ce domaine'}</span>
          </button>
        </div>
        {errors.domaine && (
          <p id="domaine-ecole-erreur" role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors.domaine.message}</p>
        )}
        {indisponible && !liste.isError && <p className="text-[10px] font-bold text-neutral-400">{raisonIndisponible}</p>}
      </form>

      <div className="space-y-2" id="domaines-declares">
        <h3 className="text-xs font-black text-slate-800">Domaines déclarés</h3>
        {liste.isPending && (
          <div className="space-y-2" aria-hidden="true">
            <div className="h-14 rounded-xl bg-neutral-100 animate-pulse" />
            <div className="h-14 rounded-xl bg-neutral-100 animate-pulse" />
          </div>
        )}
        {liste.isError && (
          <div role="alert" className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center justify-between gap-3">
            <span>Domaines déclarés indisponibles : {resolveErrorMessage(liste.error)}</span>
            <button type="button" onClick={() => void liste.refetch()}
                    className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 font-black cursor-pointer">
              Réessayer
            </button>
          </div>
        )}
        {liste.data && domaines.length === 0 && (
          <p className="text-[11px] text-neutral-500 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-3">
            Aucun domaine déclaré : l'école reste accessible à son adresse ci-dessus. Ajoutez votre domaine une fois le
            CNAME créé chez votre registraire.
          </p>
        )}
        {domaines.length > 0 && (
          <ul className="space-y-2">
            {domaines.map(d => {
              const statut = estStatutConnu(d.statut) ? STATUTS[d.statut] : { libelle: `Statut inconnu (${d.statut})`, classe: 'bg-neutral-100 text-neutral-700 border-neutral-200' };
              const verifieLe = dateVerification(d.verifieLe);
              const enVerification = verification.isPending && verification.variables === d.domaine;
              const enRetrait = retrait.isPending && retrait.variables === d.domaine;
              return (
                <li key={d.domaine} data-domaine={d.domaine} data-statut={d.statut}
                    className="rounded-xl border border-neutral-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-800 break-all">{d.domaine}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statut.classe}`}>{statut.libelle}</span>
                    </div>
                    {d.message && <p className="text-slate-600">{d.message}</p>}
                    {d.statut !== 'ACTIF' && (
                      <p className="text-slate-500">Il doit pointer (CNAME) vers <span className="font-mono">{cible}</span>.</p>
                    )}
                    {verifieLe && <p className="text-[10px] text-neutral-400">Dernière vérification : {verifieLe}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => verification.mutate(d.domaine)}
                            disabled={verification.isPending || enRetrait}
                            title={verification.isPending && !enVerification ? 'Une autre vérification est en cours.' : undefined}
                            className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-slate-700 font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <RefreshCw size={12} className={enVerification ? 'animate-spin' : ''} />
                      <span>{enVerification ? 'Vérification…' : 'Vérifier maintenant'}</span>
                    </button>
                    <button type="button" onClick={() => void retirer(d.domaine)}
                            disabled={retrait.isPending || enVerification}
                            title={retrait.isPending && !enRetrait ? 'Un autre retrait est en cours.' : undefined}
                            className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <Trash2 size={12} />
                      <span>{enRetrait ? 'Retrait…' : 'Retirer'}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

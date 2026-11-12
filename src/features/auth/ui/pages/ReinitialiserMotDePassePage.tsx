import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { publicApiClient } from '@/shared/lib/apiClient';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';

const LONGUEUR_MIN = 10;

/** Mêmes règles que le serveur (ChangementMotDePasseService.erreurRegles). */
const schemaNouveau = z.object({
  motDePasse: z.string()
    .min(1, 'Saisissez votre nouveau mot de passe.')
    .min(LONGUEUR_MIN, `Au moins ${LONGUEUR_MIN} caractères.`)
    .refine(v => /\p{L}/u.test(v) && /\d/.test(v), 'Au moins une lettre et un chiffre.'),
  confirmation: z.string().min(1, 'Retapez le mot de passe.'),
}).refine(v => v.confirmation === '' || v.motDePasse === v.confirmation,
  { path: ['confirmation'], message: 'Les deux mots de passe ne correspondent pas.' });
type Nouveau = z.infer<typeof schemaNouveau>;

const champCls = 'w-full h-11 px-3.5 rounded-xl border border-[#E2DCDA] bg-white text-sm focus:outline-none focus:border-primary aria-[invalid=true]:border-rose-400';

/**
 * Choix d'un nouveau mot de passe depuis le lien reçu par e-mail (APP-FEAT-02).
 * Le jeton est à usage unique et expire après 30 minutes ; en cas de lien invalide, la page le dit
 * et propose d'en redemander un.
 */
export function ReinitialiserMotDePassePage() {
  const { tenantSlug } = useParams();
  const [params] = useSearchParams();
  const jeton = params.get('jeton') ?? '';
  const connexion = tenantSlug ? `/t/${tenantSlug}/login` : '/login';
  const [reussi, setReussi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Nouveau>({
    resolver: zodResolver(schemaNouveau), defaultValues: { motDePasse: '', confirmation: '' }, mode: 'onTouched',
  });

  const enregistrer = async ({ motDePasse }: Nouveau) => {
    setErreur(null);
    try {
      await publicApiClient.post('/auth/reinitialiser-mot-de-passe', { jeton, motDePasse });
      setReussi(true);
    } catch (err) {
      setErreur(reporterErreurServeur(err, setError, { motsCles: { motDePasse: /caractères|lettre et un chiffre/i } }));
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F6] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl border border-[#E2DCDA] shadow-sm p-6 sm:p-8 space-y-5" aria-labelledby="titre-reinit">
        <div>
          <h1 id="titre-reinit" className="text-lg font-black text-[#1E293B]">Nouveau mot de passe</h1>
          <p className="text-xs text-[#5E4B49] mt-1">Choisissez le mot de passe de votre compte École 221.</p>
        </div>

        {!jeton ? (
          <div role="alert" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            Ce lien est incomplet. Ouvrez le lien reçu par e-mail tel quel, ou demandez-en un nouveau depuis « Mot de passe oublié ».
          </div>
        ) : reussi ? (
          <div role="status" id="reinit-reussie" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
            Mot de passe modifié : vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
        ) : (
          <form id="form-reinit" onSubmit={handleSubmit(enregistrer)} noValidate data-validation-externe className="space-y-3">
            <div>
              <label htmlFor="reinit-motDePasse" className="block text-[11px] font-bold text-[#5E4B49] mb-1">Nouveau mot de passe</label>
              <input id="reinit-motDePasse" type="password" autoComplete="new-password" className={champCls}
                placeholder={`Au moins ${LONGUEUR_MIN} caractères, une lettre et un chiffre`}
                {...register('motDePasse')}
                {...(errors.motDePasse ? { 'aria-invalid': true, 'aria-describedby': 'reinit-motDePasse-erreur' } : {})} />
              {errors.motDePasse && <p id="reinit-motDePasse-erreur" role="alert" className="mt-1 text-[11px] font-bold text-rose-700">{errors.motDePasse.message}</p>}
            </div>
            <div>
              <label htmlFor="reinit-confirmation" className="block text-[11px] font-bold text-[#5E4B49] mb-1">Confirmer le mot de passe</label>
              <input id="reinit-confirmation" type="password" autoComplete="new-password" className={champCls}
                {...register('confirmation')}
                {...(errors.confirmation ? { 'aria-invalid': true, 'aria-describedby': 'reinit-confirmation-erreur' } : {})} />
              {errors.confirmation && <p id="reinit-confirmation-erreur" role="alert" className="mt-1 text-[11px] font-bold text-rose-700">{errors.confirmation.message}</p>}
            </div>
            {erreur && <p role="alert" id="reinit-erreur" className="text-[11px] font-bold text-rose-700">{erreur}</p>}
            <button type="submit" disabled={isSubmitting} onMouseDown={e => e.preventDefault()}
              className="w-full h-11 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider disabled:opacity-60 cursor-pointer">
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}

        <Link to={connexion} className="block text-center text-[11px] font-bold text-[#8E7977] hover:text-primary">
          Aller à la page de connexion
        </Link>
      </section>
    </main>
  );
}

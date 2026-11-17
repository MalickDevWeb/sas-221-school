import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { publicApiClient } from '@/shared/lib/apiClient';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';

const schemaDemande = z.object({
  email: z.string().trim()
    .min(1, "Saisissez l'adresse e-mail de votre compte.")
    .email('Adresse e-mail invalide : vérifiez le format (ex. prenom.nom@ecole.sn).'),
});
type Demande = z.infer<typeof schemaDemande>;

/**
 * « Mot de passe oublié » (APP-FEAT-02) : demande RÉELLE d'un lien de réinitialisation par e-mail.
 * La réponse est la même que l'adresse corresponde à un compte ou non (le serveur ne révèle rien).
 */
export function ForgotPasswordForm({ onRetour }: { onRetour: () => void }) {
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Demande>({
    resolver: zodResolver(schemaDemande), defaultValues: { email: '' }, mode: 'onTouched',
  });

  const demander = async ({ email }: Demande) => {
    setErreur(null);
    try {
      const { data } = await publicApiClient.post('/auth/mot-de-passe-oublie', { email: email.trim() });
      setConfirmation(typeof data?.message === 'string' ? data.message : 'Demande enregistrée.');
    } catch (err) {
      setErreur(reporterErreurServeur(err, setError, { motsCles: { email: /e-mail invalide|adresse e-mail de votre compte/i } }));
    }
  };

  return (
    <div className="space-y-3.5 md:space-y-4 animate-fade-in" id="mot-de-passe-oublie">
      {confirmation ? (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed space-y-1.5">
          <p className="font-black">Demande enregistrée.</p>
          <p>{confirmation}</p>
          <p>Pensez à vérifier vos courriers indésirables. Sans e-mail, contactez l'administration de votre école.</p>
        </div>
      ) : (
        <form id="form-mot-de-passe-oublie" onSubmit={handleSubmit(demander)} noValidate data-validation-externe className="space-y-3">
          <p className="text-xs text-[#5E4B49] leading-relaxed">
            Saisissez l'adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.
          </p>
          <div>
            <label htmlFor="oubli-email" className="block text-[11px] font-bold text-[#5E4B49] mb-1">Adresse e-mail</label>
            <input id="oubli-email" type="email" autoComplete="email" placeholder="prenom.nom@ecole.sn"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2DCDA] bg-white text-sm focus:outline-none focus:border-primary aria-[invalid=true]:border-rose-400"
              {...register('email')}
              {...(errors.email ? { 'aria-invalid': true, 'aria-describedby': 'oubli-email-erreur' } : {})} />
            {errors.email && <p id="oubli-email-erreur" role="alert" className="mt-1 text-[11px] font-bold text-rose-700">{errors.email.message}</p>}
          </div>
          {erreur && <p role="alert" className="text-[11px] font-bold text-rose-700">{erreur}</p>}
          <button type="submit" disabled={isSubmitting} onMouseDown={e => e.preventDefault()}
            className="w-full h-11 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider disabled:opacity-60 cursor-pointer">
            {isSubmitting ? 'Envoi…' : 'Recevoir le lien'}
          </button>
        </form>
      )}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onRetour}
          className="flex items-center gap-1 text-[11px] font-bold text-[#8E7977] hover:text-primary transition-colors cursor-pointer"
        >
          <span translate="no" className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Retour à la connexion</span>
        </button>
      </div>
    </div>
  );
}

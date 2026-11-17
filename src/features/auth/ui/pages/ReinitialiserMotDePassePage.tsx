import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { publicApiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import { conseilsSansLongueur, useReglesMotDePasse } from '../../infrastructure/api/reglesMotDePasseApi';

/** Réponses du serveur (ReinitialisationMotDePasseService) qui concernent le code oral de 6 chiffres. */
const CODE_DEMANDE = /code de 6 chiffres|code incorrect/i;
const LIEN_ANNULE = /trop de codes erron/i;

/** Contrôles avant envoi ; min : plus petite longueur du serveur (élève, parent), null si pas encore connue. */
function fabriquerSchema(min: number | null, avecCode: boolean) {
  return z.object({
    motDePasse: z.string(),
    confirmation: z.string(),
    code: z.string(),
  }).superRefine((v, ctx) => {
    if (!v.motDePasse) ctx.addIssue({ code: 'custom', path: ['motDePasse'], message: 'Saisissez votre nouveau mot de passe.' });
    else if (min !== null && [...v.motDePasse].length < min) ctx.addIssue({ code: 'custom', path: ['motDePasse'], message: `Au moins ${min} caractères.` });
    if (!v.confirmation) ctx.addIssue({ code: 'custom', path: ['confirmation'], message: 'Retapez le mot de passe.' });
    else if (v.motDePasse !== v.confirmation) ctx.addIssue({ code: 'custom', path: ['confirmation'], message: 'Les deux mots de passe ne correspondent pas.' });
    if (avecCode && !/^\d{6}$/.test(v.code.replace(/\s/g, ''))) {
      ctx.addIssue({ code: 'custom', path: ['code'], message: 'Saisissez les 6 chiffres du code (ex. : 123 456).' });
    }
  });
}
type Nouveau = z.infer<ReturnType<typeof fabriquerSchema>>;

const champCls = 'w-full h-11 px-3.5 rounded-xl border border-[#E2DCDA] bg-white text-sm focus:outline-none focus:border-primary aria-[invalid=true]:border-rose-400';

/**
 * Choix d'un nouveau mot de passe depuis un lien à usage unique (APP-FEAT-02) : lien demandé par « Mot de passe
 * oublié » (e-mail, 30 min) ou lien d'accès envoyé par l'école (WhatsApp, SMS ou e-mail ; activation 72 h,
 * nouveau mot de passe 2 h). Compte à privilèges : le serveur demande en plus le code de 6 chiffres communiqué de
 * vive voix ; le champ apparaît alors. Après 5 codes faux, le lien est annulé.
 * Règles du mot de passe lues sur le serveur (GET /auth/regles-mot-de-passe) : le rôle du compte n'est pas connu
 * ici, la plus petite longueur (élève, parent) est contrôlée avant l'envoi et le serveur applique celle du compte.
 */
export function ReinitialiserMotDePassePage() {
  const { tenantSlug } = useParams();
  const [params] = useSearchParams();
  const jeton = params.get('jeton') ?? '';
  const connexion = tenantSlug ? `/t/${tenantSlug}/login` : '/login';
  const [reussi, setReussi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [codeRequis, setCodeRequis] = useState(false);
  const [lienAnnule, setLienAnnule] = useState<string | null>(null);

  const reglesEleve = useReglesMotDePasse('ETUDIANT');
  const reglesEcole = useReglesMotDePasse('ADMIN');
  const minEleve = reglesEleve.data?.longueurMin ?? null;
  const minEcole = reglesEcole.data?.longueurMin ?? null;
  const conseils = conseilsSansLongueur(reglesEleve.data);

  // Schéma refait quand les règles du serveur arrivent ou que le code devient nécessaire (react-hook-form relit
  // le resolver à chaque rendu)
  const schema = useMemo(() => fabriquerSchema(minEleve, codeRequis), [minEleve, codeRequis]);

  const { register, handleSubmit, setError, setFocus, formState: { errors, isSubmitting } } = useForm<Nouveau>({
    resolver: zodResolver(schema), defaultValues: { motDePasse: '', confirmation: '', code: '' }, mode: 'onTouched',
  });

  const enregistrer = async ({ motDePasse, code }: Nouveau) => {
    setErreur(null);
    try {
      const corps: Record<string, string> = { jeton, motDePasse };
      const saisi = code.replace(/\s/g, '');
      if (saisi) corps.code = saisi;
      await publicApiClient.post('/auth/reinitialiser-mot-de-passe', corps);
      setReussi(true);
    } catch (err) {
      const message = resolveErrorMessage(err);
      if (LIEN_ANNULE.test(message)) { setLienAnnule(message); return; }
      if (CODE_DEMANDE.test(message)) {
        setCodeRequis(true);
        // le champ apparaît au rendu suivant : message et curseur posés ensuite
        window.setTimeout(() => { setError('code', { type: 'serveur', message }); setFocus('code'); }, 0);
        return;
      }
      setErreur(reporterErreurServeur(err, setError, {
        motsCles: { motDePasse: /mot de passe|caractères|courant|répétition|suite|prénom|ancien/i },
      }));
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F6] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl border border-[#E2DCDA] shadow-sm p-6 sm:p-8 space-y-5" aria-labelledby="titre-reinit">
        <div>
          <h1 id="titre-reinit" className="text-lg font-black text-[#1E293B]">Nouveau mot de passe</h1>
          <p className="text-xs text-[#5E4B49] mt-1">Choisissez le mot de passe de votre compte. Personne d'autre ne le connaîtra.</p>
        </div>

        {!jeton ? (
          <div role="alert" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            Ce lien est incomplet. Ouvrez le lien reçu (e-mail, WhatsApp ou SMS) tel quel, ou demandez-en un nouveau depuis « Mot de passe oublié ».
          </div>
        ) : reussi ? (
          <div role="status" id="reinit-reussie" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
            Mot de passe modifié : vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
        ) : lienAnnule ? (
          <div role="alert" id="reinit-lien-annule" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed space-y-1">
            <p className="font-black">Lien annulé par sécurité.</p>
            <p>{lienAnnule}</p>
            <p>Votre mot de passe n'a pas changé. Contactez l'administration de votre école pour recevoir un nouveau lien et un nouveau code.</p>
          </div>
        ) : (
          <form id="form-reinit" onSubmit={handleSubmit(enregistrer)} noValidate data-validation-externe className="space-y-3">
            {codeRequis && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <p className="text-[11px] font-semibold text-amber-900">
                  Ce compte est protégé : saisissez le code de 6 chiffres que l'école vous a communiqué de vive voix
                  (jamais par message). Après 5 codes faux, le lien est annulé.
                </p>
                <label htmlFor="reinit-code" className="block text-[11px] font-bold text-[#5E4B49]">Code de vérification</label>
                <input id="reinit-code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} className={`${champCls} font-mono tracking-[0.3em]`}
                  placeholder="ex. : 123 456"
                  {...register('code')}
                  {...(errors.code ? { 'aria-invalid': true, 'aria-describedby': 'reinit-code-erreur' } : {})} />
                {errors.code && <p id="reinit-code-erreur" role="alert" className="text-[11px] font-bold text-rose-700">{errors.code.message}</p>}
              </div>
            )}
            <div>
              <label htmlFor="reinit-motDePasse" className="block text-[11px] font-bold text-[#5E4B49] mb-1">Nouveau mot de passe</label>
              <input id="reinit-motDePasse" type="password" autoComplete="new-password" className={champCls}
                placeholder={minEleve !== null ? `Au moins ${minEleve} caractères ; une phrase est acceptée` : undefined}
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
            {(minEleve !== null || conseils.length > 0) && (
              <ul id="reinit-regles" className="space-y-1 text-[11px] text-[#5E4B49] list-disc pl-4" aria-label="Règles du mot de passe">
                {minEleve !== null && (
                  <li>
                    Au moins {minEleve} caractères pour un élève ou un parent
                    {minEcole !== null && minEcole !== minEleve ? `, ${minEcole} pour le personnel de l'école` : ''} ; les espaces et les accents sont acceptés.
                  </li>
                )}
                {conseils.map(c => <li key={c}>{c}</li>)}
              </ul>
            )}
            {erreur && <p role="alert" id="reinit-erreur" className="text-[11px] font-bold text-rose-700">{erreur}</p>}
            <button type="submit" disabled={isSubmitting} onMouseDown={e => e.preventDefault()}
              className="w-full h-11 rounded-xl bg-primary text-text-on-primary text-xs font-black uppercase tracking-wider disabled:opacity-60 cursor-pointer">
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

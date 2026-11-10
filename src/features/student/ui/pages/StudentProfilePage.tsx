import React, { useState } from 'react';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { FormulaireMotDePasse } from '@/features/auth/ui/components/FormulaireMotDePasse';
import { useStudentProfile } from '../../api';

function Info({ libelle, valeur }: { libelle: string; valeur?: string | null }) {
  return (
    <div className="py-3 border-b border-neutral-gray-200/60 last:border-b-0">
      <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-gray-500">{libelle}</dt>
      <dd className={`text-sm font-bold mt-0.5 break-words ${valeur ? 'text-on-surface' : 'text-neutral-gray-400 italic font-semibold'}`}>
        {valeur || 'Non renseigné'}
      </dd>
    </div>
  );
}

/** « Mon profil » : informations de l'élève (lecture seule) et changement de son mot de passe. */
export function StudentProfilePage() {
  const { data: p, isLoading, error } = useStudentProfile();
  const [cleFormulaire, setCleFormulaire] = useState(0);

  return (
    <main className="flex-1 p-4 md:p-8 bg-surface-container-lowest min-h-screen pb-24 md:pb-8 font-sans">
      <div className="mb-6 border-b border-neutral-gray-200/50 pb-4">
        <h2 className="text-xl md:text-2xl text-on-surface font-black tracking-tight leading-tight">Mon profil</h2>
        <p className="text-neutral-gray-500 font-semibold text-[11px] md:text-xs mt-1">Vos informations scolaires et la sécurité de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        <section aria-labelledby="titre-infos" className="bg-white rounded-2xl border border-neutral-gray-200/70 border-solid p-5">
          <h3 id="titre-infos" className="text-sm font-black text-on-surface mb-1">Mes informations</h3>
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
          ) : error || !p ? (
            <p role="alert" className="text-sm text-red-700 font-semibold py-4">{error ? resolveErrorMessage(error) : 'Profil introuvable.'}</p>
          ) : (
            <>
              <dl>
                <Info libelle="Nom complet" valeur={[p.prenom, p.nom].filter(Boolean).join(' ')} />
                <Info libelle="Matricule" valeur={p.matricule} />
                <Info libelle="Classe" valeur={p.classe} />
                <Info libelle="Filière" valeur={p.filiere} />
                <Info libelle="Niveau" valeur={p.niveau} />
                <Info libelle="Adresse e-mail" valeur={p.email} />
                <Info libelle="Téléphone" valeur={p.telephone} />
              </dl>
              <p className="text-[11px] text-neutral-gray-500 font-semibold mt-3">
                Une information est inexacte ? Adressez-vous à l'administration de votre établissement.
              </p>
            </>
          )}
        </section>

        <section aria-labelledby="titre-mdp" className="bg-white rounded-2xl border border-neutral-gray-200/70 border-solid p-5">
          <h3 id="titre-mdp" className="text-sm font-black text-on-surface">Changer mon mot de passe</h3>
          <p className="text-[11px] text-neutral-gray-500 font-semibold mt-1 mb-4">Au moins 10 caractères, avec au moins une lettre et un chiffre.</p>
          <FormulaireMotDePasse
            key={cleFormulaire}
            libelleAncien="Mot de passe actuel"
            messageAncienVide="Saisissez votre mot de passe actuel."
            texteBouton="Changer mon mot de passe"
            onSucces={() => {
              toast.success('Mot de passe modifié', { description: 'Utilisez-le dès votre prochaine connexion.' });
              setCleFormulaire((k) => k + 1);
            }}
          />
        </section>
      </div>
    </main>
  );
}

export default StudentProfilePage;

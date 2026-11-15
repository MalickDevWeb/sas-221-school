import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Réponse de POST /admin/students/{id}/mot-de-passe-provisoire. */
interface NouveauMotDePasse {
  eleveId: string; nom: string; identifiant: string; sansEmail: boolean; motDePasseProvisoire: string;
}

/**
 * Accès de l'élève (APP-TL-23, 2026-11-14). Un élève inscrit sans e-mail se connecte avec son matricule et ne peut pas
 * recevoir de lien « Mot de passe oublié » : s'il oublie son mot de passe, l'école lui en remet un provisoire ici.
 * Le mot de passe est affiché une seule fois (jamais envoyé) ; l'élève doit le changer à sa prochaine connexion et ses
 * sessions ouvertes sont fermées. L'action est inscrite au journal d'audit.
 */
export function MotDePasseEleve({ eleveId, nomEleve }: { eleveId: string; nomEleve?: string }) {
  const [confirmer, setConfirmer] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<NouveauMotDePasse | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => { setConfirmer(false); setResultat(null); setErreur(''); }, [eleveId]);

  const remettre = async () => {
    setEnvoi(true); setErreur(''); setResultat(null);
    try {
      const { data } = await apiClient.post<NouveauMotDePasse>(`/admin/students/${eleveId}/mot-de-passe-provisoire`);
      setResultat(data);
    } catch (e) {
      setErreur(resolveErrorMessage(e));   // rien n'a été modifié
    } finally {
      setEnvoi(false); setConfirmer(false);
    }
  };

  return (
    <div className="border border-neutral-100 rounded-2xl bg-white p-3 space-y-2" id="mot-de-passe-eleve">
      <p className="text-neutral-800 font-extrabold text-[11px] uppercase tracking-wider">Accès de l'élève</p>
      <p className="text-[10px] text-neutral-500 font-semibold">
        Mot de passe oublié par l'élève (en particulier sans e-mail, connecté avec son matricule) : remettez-lui un mot de
        passe provisoire. Il devra le changer à sa prochaine connexion.
      </p>

      {!confirmer && !resultat && (
        <button type="button" onClick={() => { setConfirmer(true); setErreur(''); }}
          className="px-3 py-1.5 border border-primary text-primary rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-primary/5">
          Remettre un mot de passe provisoire
        </button>
      )}

      {confirmer && (
        <div role="alertdialog" aria-labelledby="mdp-eleve-question" className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2">
          <p id="mdp-eleve-question" className="text-[11px] font-bold text-neutral-700">
            L'ancien mot de passe{nomEleve ? ` de ${nomEleve}` : ''} ne fonctionnera plus et ses sessions ouvertes seront fermées. Continuer ?
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={remettre} disabled={envoi}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-60">
              {envoi ? 'Génération…' : 'Oui, générer'}
            </button>
            <button type="button" onClick={() => setConfirmer(false)} disabled={envoi}
              className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Annuler
            </button>
          </div>
        </div>
      )}

      {resultat && (
        <div id="mdp-eleve-identifiants" role="status" className="p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-[11px] font-semibold space-y-0.5">
          <p className="font-black">Remettez ces identifiants à {resultat.nom || 'l’élève'}.</p>
          <p>Identifiant : <span className="font-mono">{resultat.identifiant}</span>{resultat.sansEmail ? ' (matricule)' : ''}</p>
          <p>Mot de passe provisoire : <span className="font-mono">{resultat.motDePasseProvisoire}</span></p>
          <p className="text-[10px]">Il devra le changer à sa prochaine connexion. Ce mot de passe ne sera plus affiché.</p>
        </div>
      )}
      {erreur && <p role="alert" className="text-red-600 font-bold text-[11px]">{erreur}</p>}
    </div>
  );
}

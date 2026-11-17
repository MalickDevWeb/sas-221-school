import React from 'react';
import { toast } from 'sonner';
import { dateHeurePhrase } from '@/shared/lib/dateHeurePhrase';
import { libelleCanal, type ResultatLien } from './liensAccesApi';

async function copier(texte: string, quoi: string) {
  try {
    await navigator.clipboard.writeText(texte);
    toast.success(`${quoi} copié dans le presse-papiers.`);
  } catch {
    toast.error('Copie impossible : sélectionnez le texte et copiez-le manuellement.');
  }
}

/**
 * Ce que le serveur a délivré pour un lien d'accès (à l'émission, ou à l'accord du second administrateur) :
 * attente d'accord, message à envoyer par WhatsApp / SMS, e-mail envoyé ou non, code oral affiché une seule fois.
 */
export function ResultatLienVue({ r }: { r: ResultatLien }) {
  const fin = dateHeurePhrase(r.expireLe);

  if (r.accordRequis) {
    return (
      <div id="lien-acces-attente" role="status" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold space-y-1.5">
        <p className="font-black">Demande enregistrée : en attente d'accord.</p>
        {r.motif && <p>{r.motif}</p>}
        <p>
          Aucun lien n'est utilisable pour l'instant. Un autre administrateur de l'école (ni vous, ni le titulaire du compte)
          doit donner son accord depuis « Personnel › Comptes du personnel › Liens en attente d'accord ».
          Le message à envoyer lui sera alors remis.
        </p>
        {fin && <p className="text-[11px]">Demande valable jusqu'au {fin}.</p>}
      </div>
    );
  }

  const telephone = r.canal === 'WHATSAPP' || r.canal === 'SMS';
  return (
    <div id="lien-acces-resultat" data-canal={r.canal} className="space-y-3 text-xs">
      <p className="font-semibold text-neutral-700">
        {r.type === 'ACTIVATION' ? "Lien d'activation du compte" : 'Lien pour choisir un nouveau mot de passe'}
        {fin ? `, valable une seule fois jusqu'au ${fin}.` : ', valable une seule fois.'}
      </p>

      {telephone && (
        <div className="space-y-2">
          <p className="font-semibold text-neutral-700">
            Envoyez ce message {r.destinataire ? `au ${r.destinataire}` : 'au titulaire du compte'} par {libelleCanal(r.canal)}, depuis votre téléphone :
          </p>
          {r.message ? (
            <textarea id="lien-acces-message" readOnly value={r.message} rows={5}
              className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-800 resize-none" />
          ) : (
            <p role="alert" className="text-rose-700 font-bold">Le serveur n'a pas renvoyé de message : émettez un nouveau lien.</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            {r.adresseEnvoi && (
              <a id="lien-acces-ouvrir" href={r.adresseEnvoi} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-primary text-text-on-primary text-xs font-black text-center no-underline flex items-center justify-center gap-1">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">send</span>
                {r.canal === 'WHATSAPP' ? 'Ouvrir WhatsApp' : 'Ouvrir les SMS'}
              </a>
            )}
            {r.message && (
              <button type="button" onClick={() => void copier(r.message ?? '', 'Message')}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-xs font-black cursor-pointer flex items-center justify-center gap-1">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">content_copy</span>
                Copier le message
              </button>
            )}
          </div>
          {r.canal === 'SMS' && (
            <p className="text-[11px] text-neutral-500">Sur un ordinateur, « Ouvrir les SMS » peut ne rien faire : copiez le message et envoyez-le depuis votre téléphone.</p>
          )}
        </div>
      )}

      {r.canal === 'EMAIL' && (
        r.envoye ? (
          <p id="lien-acces-email-envoye" role="status" className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            E-mail envoyé{r.destinataire ? ` à ${r.destinataire}` : ''}.
          </p>
        ) : (
          <p id="lien-acces-email-echec" role="alert" className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
            E-mail non envoyé : l'envoi d'e-mails est indisponible pour le moment. Émettez un nouveau lien par WhatsApp ou SMS.
          </p>
        )
      )}

      {r.codeOral && (
        <div id="lien-acces-code" className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
          <p className="font-black text-amber-900">Code de vérification à dire de vive voix</p>
          <p className="font-mono text-2xl font-black tracking-[0.25em] text-[#1E293B] select-all" aria-label={`Code : ${r.codeOral.split('').join(' ')}`}>
            {r.codeOral.length === 6 ? `${r.codeOral.slice(0, 3)} ${r.codeOral.slice(3)}` : r.codeOral}
          </p>
          <p className="text-[11px] font-semibold text-amber-900">
            {r.consigne ?? 'Communiquez ce code de vive voix (appel, en personne), jamais dans le même message que le lien.'}
          </p>
          <p className="text-[11px] font-bold text-amber-900">Ce code ne sera plus affiché après la fermeture de cette fenêtre.</p>
        </div>
      )}
    </div>
  );
}

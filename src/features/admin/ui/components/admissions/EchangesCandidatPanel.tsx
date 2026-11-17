import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useTenantStore } from '@/core/store/tenantStore';
import { lienWhatsappVers } from '@/shared/lib/whatsapp';
import type { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

interface MessageEchange {
  id: string;
  auteur: 'CANDIDAT' | 'ECOLE';
  auteurNom: string;
  texte: string;
  envoyeLe: string;
  lu: boolean;
}

const heure = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/**
 * Échanges avec le candidat (17/11). Remplace le panneau « Notifications automatiques (Email / SMS) » qui n'envoyait
 * rien (messages types gardés dans le navigateur, date d'entretien inventée). Ici : vrais messages, enregistrés ;
 * le candidat les lit dans son suivi et reçoit un e-mail à chaque message de l'école. « Prévenir par WhatsApp » ouvre
 * la conversation du candidat avec un message prêt (lien vers son suivi) ; l'école l'envoie elle-même.
 */
export function EchangesCandidatPanel({ candidate }: { candidate: ExtendedCandidate }) {
  const client = useQueryClient();
  const ecole = useTenantStore((s) => s.currentTenant);
  const [texte, setTexte] = useState('');
  const [erreur, setErreur] = useState('');
  const fin = useRef<HTMLDivElement>(null);
  const cle = ['admissions', 'echanges', candidate.id];

  const fil = useQuery({
    queryKey: cle,
    queryFn: async () => (await apiClient.get<MessageEchange[]>(`/admissions/candidats/${encodeURIComponent(candidate.id)}/messages`)).data ?? [],
    refetchInterval: 30_000,
  });
  const envoi = useMutation({
    mutationFn: async (t: string) =>
      (await apiClient.post<MessageEchange>(`/admissions/candidats/${encodeURIComponent(candidate.id)}/messages`, { texte: t })).data,
    onSuccess: (m) => {
      // Affiché aussitôt dans le fil (sans attendre la relecture de la liste)
      client.setQueryData<MessageEchange[]>(cle, (l = []) => (l.some((x) => x.id === m.id) ? l : [...l, m]));
      setTexte('');
      toast.success(`Message envoyé à ${candidate.name} : prévenu(e) par e-mail.`);
      void client.invalidateQueries({ queryKey: cle });
      void client.invalidateQueries({ queryKey: ['admissions', 'db'] });
    },
    onError: (e) => setErreur(resolveErrorMessage(e)),
  });
  useEffect(() => { fin.current?.scrollIntoView({ block: 'nearest' }); }, [fil.data?.length]);

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (!texte.trim()) { setErreur('Écrivez votre message.'); return; }
    envoi.mutate(texte.trim());
  };

  const lienSuivi = `${window.location.origin}${ecole?.slug ? `/t/${ecole.slug}` : ''}/candidature`;
  const prenom = candidate.name.split(' ')[0] ?? '';
  const messageWhatsapp = `Bonjour ${prenom}, ${ecole?.name ?? 'votre école'} : du nouveau sur votre dossier de candidature ${candidate.id}. `
    + `Consultez votre suivi (email du dossier et mot de passe choisi au dépôt) : ${lienSuivi}`;
  const whatsapp = lienWhatsappVers(candidate.phone, messageWhatsapp);

  return (
    <section id="echanges-candidat" aria-labelledby="echanges-candidat-titre" className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-1.5">
        <h4 id="echanges-candidat-titre" className="font-extrabold text-[#1E293B] uppercase text-[10px] tracking-wide m-0">Échanges avec le candidat</h4>
        <button type="button" disabled={!whatsapp} onClick={() => { if (whatsapp) window.open(whatsapp, '_blank', 'noopener'); }}
          title={whatsapp ? 'Ouvre WhatsApp avec un message prêt à envoyer' : 'Aucun numéro de téléphone dans le dossier'}
          className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5A] text-white text-[10px] font-black border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[14px]">chat</span>
          Prévenir par WhatsApp
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1" aria-live="polite">
        {fil.isPending && <p className="text-neutral-400 font-semibold">Chargement des messages…</p>}
        {fil.isError && <p role="alert" className="text-rose-700 font-semibold">{resolveErrorMessage(fil.error)}</p>}
        {fil.isSuccess && fil.data.length === 0 && (
          <p className="text-neutral-400 font-semibold text-[11px]">Aucun échange. Le candidat lit vos messages dans son suivi et reçoit un e-mail.</p>
        )}
        {fil.data?.map((m) => (
          <div key={m.id} data-message={m.auteur} className={`flex ${m.auteur === 'ECOLE' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${m.auteur === 'ECOLE' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-800'}`}>
              <p className="text-[10px] font-black opacity-80 m-0">{m.auteur === 'ECOLE' ? m.auteurNom : `Candidat — ${m.auteurNom}`} · {heure(m.envoyeLe)}</p>
              <p className="text-xs font-semibold whitespace-pre-line break-words m-0 mt-0.5">{m.texte}</p>
            </div>
          </div>
        ))}
        <div ref={fin} />
      </div>

      <form onSubmit={envoyer} noValidate className="space-y-2">
        <label htmlFor="message-ecole" className="sr-only">Message au candidat</label>
        <textarea id="message-ecole" rows={2} maxLength={2000} value={texte} onChange={(e) => setTexte(e.target.value)}
          placeholder="ex. : Merci d'ajouter votre relevé de notes du bac."
          className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-primary" />
        {erreur && <p role="alert" className="text-[11px] text-rose-700 font-semibold m-0">{erreur}</p>}
        <div className="flex justify-between items-center gap-2">
          <span className="text-[10px] text-neutral-400 font-semibold">Le candidat est prévenu par e-mail.</span>
          <button type="submit" disabled={envoi.isPending} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase border-0 cursor-pointer disabled:opacity-50">
            {envoi.isPending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </form>
    </section>
  );
}

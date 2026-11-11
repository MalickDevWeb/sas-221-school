import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { messagerieParentsApi, type BoiteParents, type MessageParentEcole } from './api';

const MESSAGE_MAX = 5000;

const dateCourte = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Un fil = un parent + le premier message (sujet) ; on regroupe par message d'origine. */
function racine(m: MessageParentEcole, parId: Map<string, MessageParentEcole>): string {
  let courant = m;
  const vus = new Set<string>();
  while (courant.repondA && parId.has(courant.repondA) && !vus.has(courant.id)) {
    vus.add(courant.id);
    courant = parId.get(courant.repondA)!;
  }
  return courant.id;
}

/**
 * Messages écrits par les parents, avec réponse. Utilisé par le professeur (ses échanges)
 * et par l'administration (boîte partagée par les administrateurs de l'école).
 */
export function BoiteMessagesParents({ boite, titre, description }: { boite: BoiteParents; titre: string; description: string }) {
  const [messages, setMessages] = useState<MessageParentEcole[] | null>(null);
  const [erreur, setErreur] = useState('');
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [reponse, setReponse] = useState('');
  const [erreurReponse, setErreurReponse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      setMessages(await messagerieParentsApi.lister(boite));
      setErreur('');
    } catch (e) {
      setMessages([]);
      setErreur(resolveErrorMessage(e));
    }
  }, [boite]);

  useEffect(() => { void charger(); }, [charger]);

  const fils = useMemo(() => {
    const liste = messages ?? [];
    const parId = new Map(liste.map((m) => [m.id, m]));
    const groupes = new Map<string, MessageParentEcole[]>();
    for (const m of liste) {
      const r = racine(m, parId);
      groupes.set(r, [...(groupes.get(r) ?? []), m]);
    }
    return [...groupes.entries()]
      .map(([id, ms]) => ({ id, messages: [...ms].sort((a, b) => a.envoyeLe.localeCompare(b.envoyeLe)) }))
      .sort((a, b) => b.messages[b.messages.length - 1].envoyeLe.localeCompare(a.messages[a.messages.length - 1].envoyeLe));
  }, [messages]);

  const nonLus = (messages ?? []).filter((m) => !m.lu).length;
  const filOuvert = fils.find((f) => f.id === ouvert) ?? null;

  const ouvrir = async (filId: string) => {
    setOuvert(filId); setReponse(''); setErreurReponse(''); setConfirmation('');
    const fil = fils.find((f) => f.id === filId);
    for (const m of fil?.messages ?? []) {
      if (!m.lu) {
        try {
          const maj = await messagerieParentsApi.marquerLu(boite, m.id);
          setMessages((prev) => (prev ?? []).map((x) => (x.id === maj.id ? maj : x)));
        } catch (e) {
          setErreur(resolveErrorMessage(e));
        }
      }
    }
  };

  const repondre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filOuvert) return;
    const texte = reponse.trim();
    if (!texte) { setErreurReponse('La réponse est vide : écrivez votre message au parent.'); return; }
    if (texte.length > MESSAGE_MAX) { setErreurReponse(`Réponse trop longue : ${texte.length} caractères sur ${MESSAGE_MAX} autorisés.`); return; }
    const dernierDuParent = [...filOuvert.messages].reverse().find((m) => !m.envoye) ?? filOuvert.messages[0];
    setEnvoi(true);
    try {
      const r = await messagerieParentsApi.repondre(boite, dernierDuParent.id, texte);
      setReponse('');
      setConfirmation(`Réponse envoyée à ${r.parent ?? 'au parent'}.`);
      await charger();
    } catch (err) {
      setErreurReponse(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section id="boite-messages-parents" className="p-4 md:p-6 max-w-[1100px] mx-auto w-full">
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-neutral-900">{titre}</h2>
          <p className="text-xs text-neutral-500 font-semibold mt-1">{description}</p>
        </div>
        {nonLus > 0 && (
          <span className="ml-auto bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
            {nonLus} non lu{nonLus > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {erreur && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">{erreur}</div>}

      {messages === null ? (
        <p className="text-sm text-neutral-500">Chargement des messages…</p>
      ) : fils.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-neutral-100">
          <p className="text-sm font-black text-neutral-700">Aucun message de parent pour le moment.</p>
          <p className="text-xs text-neutral-500 mt-1">Les messages que les parents vous adressent apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4">
          <ul className="flex flex-col gap-2" aria-label="Échanges avec les parents">
            {fils.map((f) => {
              const premier = f.messages[0];
              const dernier = f.messages[f.messages.length - 1];
              const aLire = f.messages.some((m) => !m.lu);
              return (
                <li key={f.id}>
                  <button onClick={() => void ouvrir(f.id)} data-fil-id={f.id}
                    className={`w-full text-left p-4 rounded-2xl border bg-white transition-all ${ouvert === f.id ? 'border-primary ring-2 ring-primary/10' : aLire ? 'border-blue-200' : 'border-neutral-100'}`}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-neutral-900 truncate">{premier.parent ?? 'Parent'}</p>
                      {aLire && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" aria-label="non lu" />}
                      <span className="ml-auto text-[10px] text-neutral-400 font-semibold shrink-0">{dateCourte(dernier.envoyeLe)}</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-700 truncate mt-0.5">{premier.sujet}</p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{dernier.envoye ? 'Vous : ' : ''}{dernier.message}</p>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="bg-white rounded-2xl border border-neutral-100 p-4 min-h-[240px]">
            {!filOuvert ? (
              <p className="text-sm text-neutral-500">Choisissez un échange pour le lire et répondre.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-black text-neutral-900">{filOuvert.messages[0].sujet}</p>
                  <p className="text-[11px] text-neutral-500 font-semibold">Avec {filOuvert.messages[0].parent ?? 'le parent'}</p>
                </div>
                <ol className="flex flex-col gap-2" aria-label="Messages de l'échange">
                  {filOuvert.messages.map((m) => (
                    <li key={m.id} className={`p-3 rounded-xl text-sm ${m.envoye ? 'bg-primary/5 ml-8' : 'bg-neutral-50 mr-8'}`}>
                      <p className="text-[10px] font-black text-neutral-500 mb-1">
                        {m.envoye ? (m.de ?? 'École') : (m.parent ?? 'Parent')} · {dateCourte(m.envoyeLe)}
                        {m.envoye && (m.luParDestinataire ? ' · lu par le parent' : ' · pas encore lu')}
                      </p>
                      <p className="text-neutral-800 whitespace-pre-wrap break-words">{m.message}</p>
                    </li>
                  ))}
                </ol>
                <form id="reponse-parent-form" onSubmit={repondre} noValidate className="flex flex-col gap-2">
                  <label htmlFor="reponse-parent" className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Votre réponse</label>
                  <textarea id="reponse-parent" rows={4} value={reponse}
                    onChange={(e) => { setReponse(e.target.value); setErreurReponse(''); setConfirmation(''); }}
                    aria-invalid={!!erreurReponse}
                    className={`w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-primary ${erreurReponse ? 'border-red-400' : 'border-neutral-200'}`} />
                  {erreurReponse && <p role="alert" className="text-[11px] font-semibold text-red-600">{erreurReponse}</p>}
                  {confirmation && <p role="status" className="text-[11px] font-semibold text-green-700">{confirmation}</p>}
                  <div className="flex justify-end">
                    <button type="submit" disabled={envoi} className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-black disabled:opacity-50">
                      {envoi ? 'Envoi…' : 'Répondre'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

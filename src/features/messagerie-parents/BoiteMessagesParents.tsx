import React, { useEffect, useMemo, useRef, useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { messagerieParentsApi, useMessagesParents, type BoiteParents, type MessageParentEcole } from './api';

/*
 * Présentation d'une vraie messagerie (bandeau, conversations, bulles, zone d'envoi), entièrement aux couleurs
 * de l'école (primary / primary-light / primary-dark / text-on-primary : tenantStore les rend lisibles même pour une
 * couleur claire). Rien d'inventé : pas d'« En ligne », d'appel, de vidéo, d'émoji ni de pièce jointe tant que le
 * serveur ne les fournit pas ; avatars = initiales réelles (aucune photo de parent n'est enregistrée).
 */

const MESSAGE_MAX = 5000;

const heure = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const memeJour = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const hier = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; };

/** « 12:46 » aujourd'hui, « Hier », sinon « Ven. 14/11 » (liste des conversations). */
function dateListe(iso: string): string {
  const d = new Date(iso);
  if (memeJour(d, new Date())) return heure(iso);
  if (memeJour(d, hier())) return 'Hier';
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
}

/** Séparateur de jour : « Aujourd'hui, 16 novembre 2026 ». */
function jourConversation(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  if (memeJour(d, new Date())) return `Aujourd'hui, ${date}`;
  if (memeJour(d, hier())) return `Hier, ${date}`;
  const j = d.toLocaleDateString('fr-FR', { weekday: 'long' });
  return `${j.charAt(0).toUpperCase()}${j.slice(1)} ${date}`;
}

const initiales = (nom: string | null, defaut = 'P') =>
  (nom ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]?.toUpperCase()).join('') || defaut;

function Avatar({ nom, ecole = false, taille = 'w-12 h-12 text-sm' }: { nom: string | null; ecole?: boolean; taille?: string }) {
  return (
    <span aria-hidden className={`${taille} rounded-[999px] flex items-center justify-center font-black shrink-0 ring-2 ring-white shadow-sm ${
      ecole ? 'bg-primary text-text-on-primary' : 'bg-primary-light text-primary'}`}>
      {initiales(nom, ecole ? 'É' : 'P')}
    </span>
  );
}

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

/** Fond discret de la conversation, teinté par la couleur de l'école. */
const FOND_CONVERSATION: React.CSSProperties = {
  backgroundImage: 'radial-gradient(rgb(var(--color-primary-rgb, 179 24 28) / 0.08) 1.2px, transparent 1.2px)',
  backgroundSize: '22px 22px',
};

/**
 * Messages écrits par les parents, avec réponse. Utilisé par le professeur (ses échanges)
 * et par l'administration (boîte partagée par les administrateurs de l'école).
 */
export function BoiteMessagesParents({ boite, titre, description }: { boite: BoiteParents; titre: string; description: string }) {
  const boiteQ = useMessagesParents(boite);
  const messages = boiteQ.data ?? null;
  const [erreurAction, setErreur] = useState('');
  const erreur = boiteQ.error ? resolveErrorMessage(boiteQ.error) : erreurAction;
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [reponse, setReponse] = useState('');
  const [erreurReponse, setErreurReponse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<'tous' | 'non_lus'>('tous');
  const finConversation = useRef<HTMLDivElement>(null);
  const formulaire = useRef<HTMLFormElement>(null);

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
  const filsAffiches = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return fils.filter((f) => (filtre === 'tous' || f.messages.some((m) => !m.lu))
      && (!q || f.messages.some((m) => [m.parent, m.sujet, m.message].some((t) => (t ?? '').toLowerCase().includes(q)))));
  }, [fils, recherche, filtre]);

  // Comme une messagerie : la conversation s'ouvre sur le dernier message, et y revient à chaque nouveau message
  const nbMessagesOuverts = filOuvert?.messages.length ?? 0;
  useEffect(() => {
    finConversation.current?.scrollIntoView({ block: 'end' });
  }, [ouvert, nbMessagesOuverts]);

  const ouvrir = async (filId: string) => {
    setOuvert(filId); setReponse(''); setErreurReponse(''); setConfirmation('');
    const fil = fils.find((f) => f.id === filId);
    for (const m of fil?.messages ?? []) {
      if (!m.lu) {
        try {
          const maj = await messagerieParentsApi.marquerLu(boite, m.id);
          boiteQ.remplacer(maj);
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
      await boiteQ.recharger();
    } catch (err) {
      setErreurReponse(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section id="boite-messages-parents" className="p-3 md:p-6 max-w-[1280px] mx-auto w-full space-y-4">
      {/* Bandeau */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark text-text-on-primary px-5 md:px-8 py-5 md:py-6 flex items-center gap-4 md:gap-5 shadow-md">
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-[999px] bg-white/10" />
        <span aria-hidden className="pointer-events-none absolute right-40 -bottom-20 w-40 h-40 rounded-[999px] bg-white/5" />
        <span className="w-14 h-14 md:w-16 md:h-16 rounded-[999px] bg-white/20 flex items-center justify-center shrink-0">
          <span translate="no" className="material-symbols-outlined text-3xl md:text-4xl">forum</span>
        </span>
        <div className="min-w-0 relative">
          <h2 className="text-xl md:text-2xl font-black leading-tight">{titre}</h2>
          <p className="text-xs md:text-sm font-semibold opacity-90 mt-1">{description}</p>
        </div>
        <div className="ml-auto flex items-center gap-3 relative">
          {nonLus > 0 && (
            <span className="hidden sm:inline-flex bg-white/20 text-xs font-black px-3 py-1.5 rounded-[999px]">
              {nonLus} non lu{nonLus > 1 ? 's' : ''}
            </span>
          )}
          <span className="relative w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center" aria-hidden>
            <span translate="no" className="material-symbols-outlined text-4xl">mail</span>
            {nonLus > 0 && (
              <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-[999px] bg-white text-primary text-xs font-black flex items-center justify-center shadow">{nonLus}</span>
            )}
          </span>
        </div>
        {/* sur mobile, le nombre reste lisible en toutes lettres */}
        {nonLus > 0 && <span className="sr-only sm:hidden">{nonLus} non lu{nonLus > 1 ? 's' : ''}</span>}
      </header>

      {erreur && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">{erreur}</div>}

      {messages === null ? (
        // Échec de chargement : seul le message d'erreur s'affiche (« Aucun message » serait trompeur)
        boiteQ.error ? null : <p className="text-sm text-neutral-500">Chargement des messages…</p>
      ) : fils.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
          <span className="mx-auto w-16 h-16 rounded-[999px] bg-primary-light text-primary flex items-center justify-center">
            <span translate="no" className="material-symbols-outlined text-3xl">forum</span>
          </span>
          <p className="text-sm font-black text-neutral-700 mt-3">Aucun message de parent pour le moment.</p>
          <p className="text-xs text-neutral-500 mt-1">Les messages que les parents vous adressent apparaîtront ici.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-300px)] min-h-[520px]">
          {/* Conversations */}
          <aside className={`${filOuvert ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] shrink-0 flex-col bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden`}>
            <div className="px-4 pt-4 pb-3 space-y-3">
              <div className="flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-primary">groups</span>
                <h3 className="text-base font-black text-neutral-900">Conversations</h3>
                <label className="ml-auto relative">
                  <span className="sr-only">Filtrer les conversations</span>
                  <select value={filtre} onChange={(e) => setFiltre(e.target.value as 'tous' | 'non_lus')}
                    className="appearance-none pl-8 pr-7 py-1.5 rounded-[999px] border border-primary/30 bg-white text-xs font-black text-primary outline-none cursor-pointer">
                    <option value="tous">Tous</option>
                    <option value="non_lus">Non lus</option>
                  </select>
                  <span translate="no" className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-base text-primary">filter_alt</span>
                  <span translate="no" className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-base text-primary">expand_more</span>
                </label>
              </div>
              <label className="flex items-center gap-2 rounded-[999px] border border-neutral-200 px-3 py-2 focus-within:border-primary">
                <span translate="no" className="material-symbols-outlined text-lg text-neutral-400">search</span>
                <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un parent ou un message…"
                  aria-label="Rechercher une conversation"
                  className="bg-transparent outline-none border-0 shadow-none p-0 focus:ring-0 text-sm w-full placeholder:text-neutral-400" />
              </label>
            </div>
            <ul className="flex-1 overflow-y-auto" aria-label="Échanges avec les parents">
              {filsAffiches.length === 0 && <li className="p-6 text-center text-xs text-neutral-500">Aucune conversation ne correspond.</li>}
              {filsAffiches.map((f) => {
                const premier = f.messages[0];
                const dernier = f.messages[f.messages.length - 1];
                const aLire = f.messages.filter((m) => !m.lu).length;
                const actif = ouvert === f.id;
                return (
                  <li key={f.id} className="border-t border-neutral-100 first:border-t-0">
                    <button onClick={() => void ouvrir(f.id)} data-fil-id={f.id}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-l-4 transition-colors cursor-pointer ${actif ? 'bg-primary-light border-primary' : 'border-transparent hover:bg-neutral-50'}`}>
                      <Avatar nom={premier.parent} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className={`text-sm truncate ${aLire ? 'font-black text-neutral-900' : 'font-bold text-neutral-800'}`}>{premier.parent ?? 'Parent'}</span>
                          <span className={`ml-auto text-[11px] shrink-0 ${aLire ? 'text-primary font-black' : 'text-neutral-400 font-semibold'}`}>{dateListe(dernier.envoyeLe)}</span>
                        </span>
                        <span className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs truncate ${aLire ? 'text-neutral-800 font-semibold' : 'text-neutral-500'}`}>
                            {dernier.envoye ? 'Vous : ' : ''}{dernier.message}
                          </span>
                          {aLire > 0 ? (
                            <span aria-label="non lu" className="ml-auto min-w-5 h-5 px-1.5 rounded-[999px] bg-primary text-text-on-primary text-[10px] font-black flex items-center justify-center shrink-0">{aLire}</span>
                          ) : (
                            <span className="ml-auto min-w-5 h-5 px-1.5 rounded-[999px] bg-neutral-100 text-neutral-400 text-[10px] font-black flex items-center justify-center shrink-0">0</span>
                          )}
                        </span>
                        <span className="block text-[11px] text-neutral-400 truncate mt-0.5">{premier.sujet}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="p-3">
              <p className="rounded-2xl bg-primary-light text-primary text-xs font-black py-2.5 flex items-center justify-center gap-2">
                <span translate="no" className="material-symbols-outlined text-lg">groups</span>
                {fils.length} conversation{fils.length > 1 ? 's' : ''} au total
              </p>
            </div>
          </aside>

          {/* Conversation ouverte */}
          <div className={`${filOuvert ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden`}>
            {!filOuvert ? (
              <div className="m-auto text-center px-6">
                <span className="mx-auto w-16 h-16 rounded-[999px] bg-primary-light text-primary flex items-center justify-center">
                  <span translate="no" className="material-symbols-outlined text-3xl">chat</span>
                </span>
                <p className="text-sm font-bold text-neutral-500 mt-3">Choisissez un échange pour le lire et répondre.</p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-neutral-100">
                  <button type="button" onClick={() => setOuvert(null)} aria-label="Retour aux conversations"
                    className="md:hidden w-9 h-9 rounded-[999px] hover:bg-neutral-100 flex items-center justify-center cursor-pointer">
                    <span translate="no" className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <Avatar nom={filOuvert.messages[0].parent} taille="w-12 h-12 md:w-14 md:h-14 text-base" />
                  <div className="min-w-0">
                    <p className="text-base md:text-lg font-black text-neutral-900 truncate">{filOuvert.messages[0].parent ?? 'Parent'}</p>
                    <p className="text-xs text-neutral-500 font-semibold truncate">Parent d'élève · {filOuvert.messages[0].sujet}</p>
                  </div>
                </header>

                <ol className="flex-1 overflow-y-auto px-3 md:px-6 py-4 flex flex-col gap-2 bg-primary-light/30" style={FOND_CONVERSATION}
                  aria-label="Messages de l'échange">
                  {filOuvert.messages.map((m, i) => {
                    const precedent = filOuvert.messages[i - 1];
                    const nouveauJour = !precedent || !memeJour(new Date(precedent.envoyeLe), new Date(m.envoyeLe));
                    return (
                      <React.Fragment key={m.id}>
                        {nouveauJour && (
                          <li className="self-center my-2 px-4 py-1.5 rounded-[999px] bg-white/90 border border-neutral-100 shadow-sm text-xs font-semibold text-neutral-600">
                            {jourConversation(m.envoyeLe)}
                          </li>
                        )}
                        <li className={`flex items-end gap-2 max-w-[85%] md:max-w-[72%] ${m.envoye ? 'self-end flex-row-reverse' : 'self-start'}`}>
                          <Avatar nom={m.envoye ? m.de : m.parent} ecole={m.envoye} taille="w-9 h-9 text-xs" />
                          <div className={`px-4 py-2.5 shadow-sm text-sm ${m.envoye
                            ? 'bg-primary-light text-neutral-900 border border-primary/15 rounded-2xl rounded-br-md'
                            : 'bg-white text-neutral-900 border border-neutral-100 rounded-2xl rounded-bl-md'}`}>
                            {m.envoye && m.de && <p className="text-[11px] font-black text-primary mb-0.5">{m.de}</p>}
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>
                            <p className="flex items-center justify-end gap-1 text-[10px] mt-1 text-neutral-400">
                              <span>{heure(m.envoyeLe)}</span>
                              {m.envoye && (
                                <span translate="no" className={`material-symbols-outlined text-[15px] ${m.luParDestinataire ? 'text-primary' : ''}`}
                                  title={m.luParDestinataire ? 'Lu par le parent' : 'Pas encore lu'} aria-label={m.luParDestinataire ? 'lu par le parent' : 'pas encore lu'}>
                                  {m.luParDestinataire ? 'done_all' : 'done'}
                                </span>
                              )}
                            </p>
                          </div>
                        </li>
                      </React.Fragment>
                    );
                  })}
                  <div ref={finConversation} />
                </ol>

                <form ref={formulaire} id="reponse-parent-form" onSubmit={repondre} noValidate className="px-3 md:px-5 py-3 border-t border-neutral-100">
                  {erreurReponse && <p role="alert" className="text-[11px] font-semibold text-red-600 mb-1.5 px-2">{erreurReponse}</p>}
                  {confirmation && <p role="status" className="text-[11px] font-semibold text-green-700 mb-1.5 px-2">{confirmation}</p>}
                  <div className="flex items-end gap-2 md:gap-3">
                    <label htmlFor="reponse-parent" className="sr-only">Votre réponse</label>
                    <textarea id="reponse-parent" rows={1} value={reponse} placeholder="Écrire un message…"
                      onChange={(e) => { setReponse(e.target.value); setErreurReponse(''); setConfirmation(''); }}
                      onKeyDown={(e) => {
                        // Entrée envoie, Maj + Entrée passe à la ligne (comme une messagerie)
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); formulaire.current?.requestSubmit(); }
                      }}
                      aria-invalid={!!erreurReponse}
                      className={`flex-1 resize-none max-h-40 min-h-[52px] px-5 py-3.5 rounded-[26px] bg-white text-sm outline-none border focus:border-primary ${erreurReponse ? 'border-red-400' : 'border-neutral-200'}`}
                      style={{ height: `${Math.min(160, 52 + 20 * Math.max(0, reponse.split('\n').length - 1))}px` }} />
                    <button type="submit" disabled={envoi} title="Envoyer (Entrée)"
                      className="h-[52px] px-5 md:px-7 rounded-[999px] bg-primary hover:bg-primary-dark text-text-on-primary text-sm font-black flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0 shadow-md transition-colors">
                      <span translate="no" className="material-symbols-outlined text-xl">send</span>
                      <span className="hidden sm:inline">{envoi ? 'Envoi…' : 'Envoyer'}</span>
                    </button>
                  </div>
                  <p className="hidden md:block text-[10px] text-neutral-400 mt-1.5 px-4">Entrée pour envoyer · Maj + Entrée pour aller à la ligne</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParentContext } from '../components/layout/ParentContext';
import type { ParentMessage, ParentAppointment, ParentProfesseur, ParentDestinataire } from '@/features/parent/types';
import { apiClient } from '@/shared/lib/apiClient';
import { parentApi } from '@/features/parent/api';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { ParentEmptyState, ParentErrorState } from '../components/ParentStatusBlocks';

const SUJET_MAX = 200;
const MESSAGE_MAX = 5000;

const initiales = (nom: string | null | undefined) =>
  (nom ?? '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '—';

const quand = (m: ParentMessage) => m.envoyeLe ?? m.date;
const heure = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const memeJour = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const hier = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; };

function dateListe(iso: string): string {
  const d = new Date(iso);
  if (memeJour(d, new Date())) return heure(iso);
  if (memeJour(d, hier())) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function jourConversation(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  if (memeJour(d, new Date())) return `Aujourd'hui, ${date}`;
  if (memeJour(d, hier())) return `Hier, ${date}`;
  return date;
}

/** Objet sans « Re : » : un échange = un correspondant + un objet (les réponses gardent l'objet d'origine). */
const objet = (sujet: string) => sujet.replace(/^(\s*re\s*:\s*)+/i, '').trim().toLowerCase();

/** Correspondant de l'échange : le professeur ou l'administration. */
const nomCorrespondant = (m: ParentMessage) =>
  m.envoye ? (m.interlocuteur ?? 'Destinataire') : (m.interlocuteur ?? m.de ?? 'École');

const roleCorrespondant = (m: ParentMessage) =>
  (m.interlocuteurId === 'ADMINISTRATION' || m.role === 'ADMINISTRATION') ? 'Administration' : 'Professeur';

interface Echange {
  id: string;
  messages: ParentMessage[];
  correspondant: string;
  correspondantId: string | undefined;
  role: string;
  sujet: string;
}

function regrouper(messages: ParentMessage[]): Echange[] {
  const groupes = new Map<string, ParentMessage[]>();
  for (const m of messages) {
    const cle = `${m.interlocuteurId ?? m.interlocuteur ?? m.de ?? ''}|${objet(m.sujet)}`;
    groupes.set(cle, [...(groupes.get(cle) ?? []), m]);
  }
  return [...groupes.entries()].map(([id, ms]) => {
    const tries = [...ms].sort((a, b) => quand(a).localeCompare(quand(b)));
    const premier = tries[0];
    return {
      id, messages: tries,
      correspondant: nomCorrespondant(tries.find((m) => !m.envoye) ?? premier),
      correspondantId: tries.find((m) => m.interlocuteurId)?.interlocuteurId,
      role: roleCorrespondant(premier),
      sujet: premier.sujet.replace(/^(\s*re\s*:\s*)+/i, '').trim() || premier.sujet,
    };
  }).sort((a, b) => quand(b.messages[b.messages.length - 1]).localeCompare(quand(a.messages[a.messages.length - 1])));
}

function Avatar({ nom, ecole = true, taille = 'w-12 h-12 text-sm' }: { nom: string | null | undefined; ecole?: boolean; taille?: string }) {
  return (
    <span aria-hidden className={`${taille} rounded-[999px] flex items-center justify-center font-black shrink-0 ring-2 ring-white shadow-sm ${
      ecole ? 'bg-primary-light text-primary' : 'bg-primary text-text-on-primary'}`}>
      {initiales(nom)}
    </span>
  );
}

const FOND_CONVERSATION: React.CSSProperties = {
  backgroundImage: 'radial-gradient(rgb(var(--color-primary-rgb, 179 24 28) / 0.08) 1.2px, transparent 1.2px)',
  backgroundSize: '22px 22px',
};

type Brouillon = { destinataireId: string; sujet: string; message: string };
type ErreursBrouillon = Partial<Record<keyof Brouillon, string>>;

function validerBrouillon(b: Brouillon): ErreursBrouillon {
  const e: ErreursBrouillon = {};
  if (!b.destinataireId) e.destinataireId = 'Choisissez à qui écrire : un professeur ou l\'administration.';
  const sujet = b.sujet.trim();
  if (!sujet) e.sujet = 'Indiquez l\'objet du message (ex. « Absence de lundi »).';
  else if (sujet.length > SUJET_MAX) e.sujet = `Objet trop long : ${sujet.length} caractères sur ${SUJET_MAX} autorisés.`;
  const message = b.message.trim();
  if (!message) e.message = 'Le message est vide : écrivez ce que vous souhaitez dire à l\'école.';
  else if (message.length > MESSAGE_MAX) e.message = `Message trop long : ${message.length} caractères sur ${MESSAGE_MAX} autorisés.`;
  return e;
}

function ComposeModal({ initial, onClose, onSent }: { initial: Brouillon; onClose: () => void; onSent: (m: ParentMessage) => void }) {
  const [destinataires, setDestinataires] = useState<ParentDestinataire[] | null>(null);
  const [erreurListe, setErreurListe] = useState('');
  const [b, setB] = useState<Brouillon>(initial);
  const [erreurs, setErreurs] = useState<ErreursBrouillon>({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    parentApi.getDestinataires()
      .then(setDestinataires)
      .catch((e) => { setDestinataires([]); setErreurListe(resolveErrorMessage(e)); });
  }, []);

  const changer = (cle: keyof Brouillon) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setB((x) => ({ ...x, [cle]: e.target.value }));
    setErreurs((x) => ({ ...x, [cle]: undefined }));
    setErreurServeur('');
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validerBrouillon(b);
    setErreurs(er);
    if (Object.keys(er).length > 0) return;
    setEnvoi(true);
    try {
      onSent(await parentApi.sendMessage(b.destinataireId, b.sujet.trim(), b.message.trim()));
    } catch (err) {
      setErreurServeur(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  const champCls = (k: keyof Brouillon) =>
    `w-full px-4 bg-white border rounded-xl text-sm text-neutral-800 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none ${erreurs[k] ? 'border-red-400' : 'border-neutral-200'}`;
  const erreur = (k: keyof Brouillon) => erreurs[k] && (
    <p id={`message-${k}-erreur`} className="text-[11px] font-semibold text-red-600 mt-1">{erreurs[k]}</p>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Écrire à l'école" className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form id="parent-message-form" onSubmit={envoyer} noValidate className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-neutral-900">Écrire à l'école</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center">
            <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-600">close</span>
          </button>
        </div>

        <div>
          <label htmlFor="message-destinataireId" className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Destinataire</label>
          <select id="message-destinataireId" value={b.destinataireId} onChange={changer('destinataireId')}
            aria-invalid={!!erreurs.destinataireId} className={`${champCls('destinataireId')} h-11 mt-1`} disabled={destinataires === null}>
            <option value="">{destinataires === null ? 'Chargement…' : 'Choisir…'}</option>
            {(destinataires ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.role === 'ADMINISTRATION' ? d.nom : `${d.nom} (professeur)`}</option>
            ))}
          </select>
          {erreur('destinataireId')}
          {erreurListe && <p className="text-[11px] font-semibold text-red-600 mt-1">Liste des destinataires indisponible : {erreurListe}</p>}
        </div>

        <div>
          <label htmlFor="message-sujet" className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Objet</label>
          <input id="message-sujet" value={b.sujet} onChange={changer('sujet')} maxLength={SUJET_MAX + 50}
            aria-invalid={!!erreurs.sujet} placeholder="Ex. Absence de lundi" className={`${champCls('sujet')} h-11 mt-1`} />
          {erreur('sujet')}
        </div>

        <div>
          <label htmlFor="message-message" className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Message</label>
          <textarea id="message-message" value={b.message} onChange={changer('message')} rows={6}
            aria-invalid={!!erreurs.message} className={`${champCls('message')} py-3 mt-1 resize-y`} />
          <div className="flex justify-between">
            {erreur('message') || <span />}
            <span className={`text-[10px] font-semibold mt-1 ${b.message.trim().length > MESSAGE_MAX ? 'text-red-600' : 'text-neutral-400'}`}>
              {b.message.trim().length} / {MESSAGE_MAX}
            </span>
          </div>
        </div>

        {erreurServeur && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
            Message non envoyé : {erreurServeur}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-black">Annuler</button>
          <button type="submit" disabled={envoi} className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-black disabled:opacity-50">
            {envoi ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ParentMessagesPage() {
  const { messages, unreadCount, markRead, errors, retry, refreshMessages } = useParentContext();
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const messagesError = errors?.messages ?? null;
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [reponse, setReponse] = useState('');
  const [erreurReponse, setErreurReponse] = useState('');
  const [envoiReponse, setEnvoiReponse] = useState(false);
  const finConversation = useRef<HTMLDivElement>(null);
  const formulaire = useRef<HTMLFormElement>(null);
  const [showRdv, setShowRdv] = useState(false);
  const [appointments, setAppointments] = useState<ParentAppointment[]>([]);
  const [professeurs, setProfesseurs] = useState<ParentProfesseur[]>([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [rdvMotif, setRdvMotif] = useState('');
  const [submittingRdv, setSubmittingRdv] = useState(false);
  const [rdvErreurs, setRdvErreurs] = useState<Record<string, string>>({});

  useEffect(() => {
    apiClient.get<ParentAppointment[]>('/parent/rdv')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Erreur chargement RDV:', err));

    apiClient.get<ParentProfesseur[]>('/parent/professeurs')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setProfesseurs(list);
        if (list.length > 0) {
          setSelectedProf(list[0].id);   // L'identifiant (pas le nom)
        }
      })
      .catch(err => console.error('Erreur chargement profs:', err));
  }, []);

  const handleSendRdv = async () => {
    // APP-FE-07 : aucun professeur de repli inventé ; un professeur réel doit être choisi.
    const err: Record<string, string> = {};
    if (!selectedProf) err.prof = 'Choisissez le professeur à rencontrer.';
    if (!selectedDate) err.date = 'Indiquez la date souhaitée.';
    else if (selectedDate < new Date().toISOString().slice(0, 10)) err.date = 'Cette date est déjà passée.';
    if (!rdvMotif.trim()) err.motif = 'Précisez le motif : le professeur saura de quoi vous voulez parler.';
    setRdvErreurs(err);
    if (Object.keys(err).length) return;
    setSubmittingRdv(true);
    try {
      await apiClient.post('/parent/rdv', {
        professeurId: selectedProf,
        dateSouhaitee: selectedDate,
        motif: rdvMotif.trim()
      });
      const res = await apiClient.get<ParentAppointment[]>('/parent/rdv');
      setAppointments(Array.isArray(res.data) ? res.data : []);
      const prof = professeurs.find(p => p.id === selectedProf);
      setShowRdv(false);
      setRdvMotif('');
      setSelectedDate('');
      setConfirmation(`Demande de rendez-vous envoyée à ${prof?.displayName || prof?.nom || 'ce professeur'} : sa réponse arrivera dans vos messages.`);
      refreshMessages?.();
    } catch (e) {
      setRdvErreurs({ serveur: resolveErrorMessage(e) });   // rien n'a été envoyé
    } finally {
      setSubmittingRdv(false);
    }
  };

  /*
   * Présentation d'une vraie messagerie, comme côté école. Un échange = un correspondant (professeur ou
   * administration) + un objet ; la réponse s'écrit en bas.
   */
  const echanges = useMemo(() => regrouper(messages), [messages]);
  const echangesAffiches = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return q ? echanges.filter((e) => [e.correspondant, e.sujet, ...e.messages.map((m) => m.message)].some((t) => t.toLowerCase().includes(q))) : echanges;
  }, [echanges, recherche]);
  const echangeOuvert = echanges.find((e) => e.id === ouvert) ?? null;
  const nbOuverts = echangeOuvert?.messages.length ?? 0;
  useEffect(() => { finConversation.current?.scrollIntoView({ block: 'end' }); }, [ouvert, nbOuverts]);

  const ouvrir = (e: Echange) => {
    setOuvert(e.id); setReponse(''); setErreurReponse(''); setConfirmation('');
    e.messages.filter((m) => !m.lu).forEach((m) => markRead(m.id));
  };

  const repondre = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!echangeOuvert) return;
    const texte = reponse.trim();
    if (!texte) { setErreurReponse('Le message est vide : écrivez votre réponse.'); return; }
    if (texte.length > MESSAGE_MAX) { setErreurReponse(`Message trop long : ${texte.length} caractères sur ${MESSAGE_MAX} autorisés.`); return; }
    if (!echangeOuvert.correspondantId) { setErreurReponse('Destinataire inconnu : utilisez « Écrire ».'); return; }
    setEnvoiReponse(true);
    try {
      const m = await parentApi.sendMessage(echangeOuvert.correspondantId, `Re : ${echangeOuvert.sujet}`.slice(0, SUJET_MAX), texte);
      setReponse('');
      setConfirmation(`Message envoyé à ${m.interlocuteur ?? echangeOuvert.correspondant}.`);
      await refreshMessages();
    } catch (err) {
      setErreurReponse(resolveErrorMessage(err));
    } finally {
      setEnvoiReponse(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">

      {brouillon && (
        <ComposeModal
          initial={brouillon}
          onClose={() => setBrouillon(null)}
          onSent={(m) => {
            setBrouillon(null);
            setConfirmation(`Message envoyé à ${m.interlocuteur ?? 'l\'école'} : « ${m.sujet} ».`);
            void refreshMessages();
          }}
        />
      )}

      {/* Modal Demande RDV */}
      {showRdv && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <span translate="no" className="material-symbols-outlined text-[24px]">event_available</span>
              </div>
              <div>
                <p className="font-black text-neutral-900">Nouveau Rendez-vous</p>
                <p className="text-[10px] text-neutral-400 font-semibold">Demander une rencontre parent-prof</p>
              </div>
              <button onClick={() => setShowRdv(false)} className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Professeur concerné</label>
                <select 
                  value={selectedProf} 
                  onChange={e => setSelectedProf(e.target.value)}
                  disabled={professeurs.length === 0}
                  className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-primary outline-none"
                >
                  {professeurs.length > 0 ? (
                    professeurs.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.displayName || p.nom}
                      </option>
                    ))
                  ) : (
                    <option value="">Aucun professeur disponible</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Disponibilité souhaitée</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-primary outline-none" 
                />
                {rdvErreurs.date && <p className="text-[10px] font-bold text-red-600 mt-1">{rdvErreurs.date}</p>}
              </div>
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Motif du rendez-vous</label>
                <textarea 
                  value={rdvMotif}
                  onChange={e => setRdvMotif(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:border-primary outline-none resize-none h-20"
                  placeholder="Ex: Suivi des résultats, orientation..."
                />
                {rdvErreurs.motif && <p className="text-[10px] font-bold text-red-600 mt-1">{rdvErreurs.motif}</p>}
              </div>
              {rdvErreurs.prof && <p className="text-[10px] font-bold text-red-600">{rdvErreurs.prof}</p>}
              {rdvErreurs.serveur && <p role="alert" className="text-[11px] font-bold text-red-600">{rdvErreurs.serveur}</p>}
              <p className="text-[10px] font-semibold text-neutral-400">La demande est envoyée au professeur dans votre messagerie ; il vous répondra pour fixer le rendez-vous.</p>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={handleSendRdv} 
                disabled={submittingRdv}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span translate="no" className="material-symbols-outlined text-[16px]">send</span>
                {submittingRdv ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bandeau */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark text-text-on-primary px-5 md:px-8 py-5 md:py-6 mb-5 flex flex-wrap items-center gap-4 md:gap-5 shadow-md">
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-[999px] bg-white/10" />
        <span className="w-14 h-14 md:w-16 md:h-16 rounded-[999px] bg-white/20 flex items-center justify-center shrink-0">
          <span translate="no" className="material-symbols-outlined text-3xl md:text-4xl">forum</span>
        </span>
        <div className="min-w-0 relative">
          <h2 className="text-xl md:text-2xl font-black leading-tight">Messages</h2>
          <p className="text-xs md:text-sm font-semibold opacity-90 mt-1">Vos échanges avec les professeurs et l'administration</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 relative">
          {unreadCount > 0 && (
            <span className="bg-white/20 text-xs font-black px-3 py-1.5 rounded-[999px]">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            id="parent-ecrire"
            onClick={() => { setConfirmation(''); setBrouillon({ destinataireId: '', sujet: '', message: '' }); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-primary rounded-[999px] text-xs font-black shadow-sm hover:bg-white/90 transition-colors cursor-pointer"
          >
            <span translate="no" className="material-symbols-outlined text-[16px]">edit</span>
            Écrire
          </button>
          <button
            id="parent-demander-rdv"
            onClick={() => { setRdvErreurs({}); setShowRdv(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-[999px] text-xs font-black transition-colors cursor-pointer"
          >
            <span translate="no" className="material-symbols-outlined text-[16px]">event_available</span>
            Demander RDV
          </button>
        </div>
      </header>

      {/* Visioconférences & Rendez-vous planifiés */}
      {appointments.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span translate="no" className="material-symbols-outlined text-emerald-600 text-[22px]">videocam</span>
              <p className="text-[12px] font-black uppercase tracking-wider text-neutral-800">
                Mes demandes de rendez-vous ({appointments.length})
              </p>
            </div>
            <button
              onClick={() => setShowRdv(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span translate="no" className="material-symbols-outlined text-[16px]">add_circle</span>
              Demander un autre rendez-vous
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <div 
                key={apt.id} 
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[999px] text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-[999px] bg-emerald-500 animate-pulse" />
                      {apt.status === 'CONFIRMED' || apt.status === 'CONFIRME' ? 'Confirmé' : 'Demande envoyée'}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-500 flex items-center gap-1">
                      <span translate="no" className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {apt.dateSouhaitee ? new Date(apt.dateSouhaitee).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date à convenir'}
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-neutral-900 mb-1 flex items-center gap-2">
                    <span translate="no" className="material-symbols-outlined text-[18px] text-blue-600">person</span>
                    {apt.professeurNom || apt.professeurId || '—'}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-4 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    {apt.motif ? `"${apt.motif}"` : '—'}
                  </p>
                </div>

                {apt.meetUrl && /^https:\/\/meet\.google\.com\//i.test(apt.meetUrl) ? (
                  <a
                    href={apt.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span translate="no" className="material-symbols-outlined text-[18px]">video_call</span>
                    Rejoindre la visio Google Meet
                  </a>
                ) : (
                  <div className="text-center py-2 text-xs font-semibold text-neutral-500">
                    Le professeur vous répondra dans vos messages pour fixer le rendez-vous.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmation && (
        <div role="status" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-bold">
          {confirmation}
        </div>
      )}

      {messagesError ? (
        <ParentErrorState message={messagesError} onRetry={retry} />
      ) : messages.length === 0 ? (
        <ParentEmptyState
          icon="mark_email_read"
          title="Aucun échange pour le moment."
          description="Écrivez à un professeur ou à l'administration avec le bouton « Écrire » ; leurs réponses apparaîtront ici."
        />
      ) : (
        <div id="parent-messagerie" className="flex gap-4 h-[calc(100vh-260px)] min-h-[520px]">
          {/* Conversations */}
          <aside className={`${echangeOuvert ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] shrink-0 flex-col bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden`}>
            <div className="px-4 pt-4 pb-3 space-y-3">
              <div className="flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-primary">groups</span>
                <h3 className="text-base font-black text-neutral-900">Conversations</h3>
              </div>
              <label className="flex items-center gap-2 rounded-[999px] border border-neutral-200 px-3 py-2 focus-within:border-primary">
                <span translate="no" className="material-symbols-outlined text-lg text-neutral-400">search</span>
                <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un professeur ou un message…"
                  aria-label="Rechercher une conversation"
                  className="bg-transparent outline-none border-0 shadow-none p-0 focus:ring-0 text-sm w-full placeholder:text-neutral-400" />
              </label>
            </div>
            <ul className="flex-1 overflow-y-auto" aria-label="Vos échanges">
              {echangesAffiches.length === 0 && <li className="p-6 text-center text-xs text-neutral-500">Aucune conversation ne correspond.</li>}
              {echangesAffiches.map((e) => {
                const dernier = e.messages[e.messages.length - 1];
                const aLire = e.messages.filter((m) => !m.lu).length;
                const actif = ouvert === e.id;
                return (
                  <li key={e.id} className="border-t border-neutral-100 first:border-t-0">
                    <button onClick={() => ouvrir(e)} data-message-id={dernier.id} data-echange-id={e.id}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-l-4 transition-colors cursor-pointer ${actif ? 'bg-primary-light border-primary' : 'border-transparent hover:bg-neutral-50'}`}>
                      <Avatar nom={e.correspondant} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className={`text-sm truncate ${aLire ? 'font-black text-neutral-900' : 'font-bold text-neutral-800'}`}>{e.correspondant}</span>
                          <span className={`ml-auto text-[11px] shrink-0 ${aLire ? 'text-primary font-black' : 'text-neutral-400 font-semibold'}`}>{dateListe(quand(dernier))}</span>
                        </span>
                        <span className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs truncate ${aLire ? 'text-neutral-800 font-semibold' : 'text-neutral-500'}`}>
                            {dernier.envoye ? 'Vous : ' : ''}{dernier.message}
                          </span>
                          {aLire > 0 ? (
                            <span aria-label="non lu" className="ml-auto min-w-5 h-5 px-1.5 rounded-[999px] bg-primary text-text-on-primary text-[10px] font-black flex items-center justify-center shrink-0">{aLire}</span>
                          ) : dernier.envoye ? (
                            <span translate="no" className={`ml-auto material-symbols-outlined text-[15px] shrink-0 ${dernier.luParDestinataire ? 'text-primary' : 'text-neutral-400'}`}
                              aria-label={dernier.luParDestinataire ? 'lu par le destinataire' : 'pas encore lu'} title={dernier.luParDestinataire ? 'Lu par le destinataire' : 'Pas encore lu'}>
                              {dernier.luParDestinataire ? 'done_all' : 'done'}
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-[11px] text-neutral-400 truncate mt-0.5">{e.role} · {e.sujet}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="p-3">
              <p className="rounded-2xl bg-primary-light text-primary text-xs font-black py-2.5 flex items-center justify-center gap-2">
                <span translate="no" className="material-symbols-outlined text-lg">forum</span>
                {echanges.length} conversation{echanges.length > 1 ? 's' : ''} au total
              </p>
            </div>
          </aside>

          {/* Conversation ouverte */}
          <div className={`${echangeOuvert ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden`}>
            {!echangeOuvert ? (
              <div className="m-auto text-center px-6">
                <span className="mx-auto w-16 h-16 rounded-[999px] bg-primary-light text-primary flex items-center justify-center">
                  <span translate="no" className="material-symbols-outlined text-3xl">chat</span>
                </span>
                <p className="text-sm font-bold text-neutral-500 mt-3">Choisissez une conversation pour la lire et répondre.</p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-neutral-100">
                  <button type="button" onClick={() => setOuvert(null)} aria-label="Retour aux conversations"
                    className="md:hidden w-9 h-9 rounded-[999px] hover:bg-neutral-100 flex items-center justify-center cursor-pointer">
                    <span translate="no" className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <Avatar nom={echangeOuvert.correspondant} taille="w-12 h-12 md:w-14 md:h-14 text-base" />
                  <div className="min-w-0">
                    <p className="text-base md:text-lg font-black text-neutral-900 truncate">{echangeOuvert.correspondant}</p>
                    <p className="text-xs text-neutral-500 font-semibold truncate">{echangeOuvert.role} · {echangeOuvert.sujet}</p>
                  </div>
                </header>

                <ol className="flex-1 overflow-y-auto px-3 md:px-6 py-4 flex flex-col gap-2 bg-primary-light/30" style={FOND_CONVERSATION}
                  aria-label="Messages de la conversation">
                  {echangeOuvert.messages.map((m, i) => {
                    const precedent = echangeOuvert.messages[i - 1];
                    const nouveauJour = !precedent || !memeJour(new Date(quand(precedent)), new Date(quand(m)));
                    return (
                      <React.Fragment key={m.id}>
                        {nouveauJour && (
                          <li className="self-center my-2 px-4 py-1.5 rounded-[999px] bg-white/90 border border-neutral-100 shadow-sm text-xs font-semibold text-neutral-600">
                            {jourConversation(quand(m))}
                          </li>
                        )}
                        <li className={`flex items-end gap-2 max-w-[85%] md:max-w-[72%] ${m.envoye ? 'self-end flex-row-reverse' : 'self-start'}`}>
                          <Avatar nom={m.envoye ? 'Vous' : (m.de ?? echangeOuvert.correspondant)} ecole={!m.envoye} taille="w-9 h-9 text-xs" />
                          <div className={`px-4 py-2.5 shadow-sm text-sm ${m.envoye
                            ? 'bg-primary-light text-neutral-900 border border-primary/15 rounded-2xl rounded-br-md'
                            : 'bg-white text-neutral-900 border border-neutral-100 rounded-2xl rounded-bl-md'}`}>
                            {!m.envoye && m.de && <p className="text-[11px] font-black text-primary mb-0.5">{m.de}</p>}
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>
                            <p className="flex items-center justify-end gap-1 text-[10px] mt-1 text-neutral-400">
                              <span>{heure(quand(m))}</span>
                              {m.envoye && (
                                <span translate="no" className={`material-symbols-outlined text-[15px] ${m.luParDestinataire ? 'text-primary' : ''}`}
                                  title={m.luParDestinataire ? 'Lu par le destinataire' : 'Pas encore lu'} aria-label={m.luParDestinataire ? 'lu par le destinataire' : 'pas encore lu'}>
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

                <form ref={formulaire} id="parent-reponse-form" onSubmit={repondre} noValidate className="px-3 md:px-5 py-3 border-t border-neutral-100">
                  {erreurReponse && <p role="alert" className="text-[11px] font-semibold text-red-600 mb-1.5 px-2">{erreurReponse}</p>}
                  <div className="flex items-end gap-2 md:gap-3">
                    <label htmlFor="parent-reponse" className="sr-only">Votre réponse</label>
                    <textarea id="parent-reponse" rows={1} value={reponse} placeholder="Écrire un message…"
                      onChange={(e) => { setReponse(e.target.value); setErreurReponse(''); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); formulaire.current?.requestSubmit(); }
                      }}
                      aria-invalid={!!erreurReponse}
                      className={`flex-1 resize-none max-h-40 min-h-[52px] px-5 py-3.5 rounded-[26px] bg-white text-sm outline-none border focus:border-primary ${erreurReponse ? 'border-red-400' : 'border-neutral-200'}`}
                      style={{ height: `${Math.min(160, 52 + 20 * Math.max(0, reponse.split('\n').length - 1))}px` }} />
                    <button type="submit" disabled={envoiReponse} title="Envoyer (Entrée)"
                      className="h-[52px] px-5 md:px-7 rounded-[999px] bg-primary hover:bg-primary-dark text-text-on-primary text-sm font-black flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0 shadow-md transition-colors">
                      <span translate="no" className="material-symbols-outlined text-xl">send</span>
                      <span className="hidden sm:inline">{envoiReponse ? 'Envoi…' : 'Répondre'}</span>
                    </button>
                  </div>
                  <p className="hidden md:block text-[10px] text-neutral-400 mt-1.5 px-4">Entrée pour envoyer · Maj + Entrée pour aller à la ligne</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { uploadToCloudinary, UploadError } from '@/shared/utils/cloudinaryUpload';
import { VisionneuseFichier } from '@/shared/components/VisionneuseFichier';
import {
  LIBELLE_FRAIS, LIBELLE_STATUT, sessionExpiree, suiviApi,
  type DossierCandidat, type MessageEchange, type PieceDossier,
} from './suiviApi';

const ETAPES: Record<string, string> = {
  new: 'Dossier reçu', docs: 'Vérification des pièces', interview: 'Entretien', admitted: 'Admission', rejected: 'Décision rendue',
};
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp';
const ACTUALISATION_MS = 30_000;

const heure = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/**
 * Espace du candidat (17/11) : statut réel du dossier, SES pièces (consultées dans l'application, ajoutées ou
 * remplacées tant que la décision n'est pas rendue) et ses échanges avec l'école. Avant : lecture seule et
 * « contactez directement l'école ». Session de suivi de 2 h : à l'expiration, retour à la connexion.
 */
export function CandidateStatusTab({ dossier: initial, onSessionExpiree }: { dossier: DossierCandidat; onSessionExpiree?: () => void }) {
  const [dossier, setDossier] = useState(initial);
  const [messages, setMessages] = useState<MessageEchange[]>([]);
  const [chargementMessages, setChargementMessages] = useState(true);
  const [texte, setTexte] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreurMessage, setErreurMessage] = useState('');
  const [depot, setDepot] = useState<string | null>(null);
  const [erreursPieces, setErreursPieces] = useState<Record<string, string>>({});
  const [vue, setVue] = useState<PieceDossier | null>(null);
  const entree = useRef<HTMLInputElement>(null);
  const cible = useRef<PieceDossier | null>(null);
  const finFil = useRef<HTMLDivElement>(null);
  const jeton = dossier.jeton ?? '';

  const echec = useCallback((err: unknown): string => {
    if (sessionExpiree(err)) {
      toast.error('Votre session de suivi a expiré : reconnectez-vous.');
      onSessionExpiree?.();
    }
    return resolveErrorMessage(err);
  }, [onSessionExpiree]);

  const relireMessages = useCallback(async () => {
    if (!jeton) return;
    try {
      setMessages(await suiviApi.messages(jeton));
    } catch (err) {
      setErreurMessage(echec(err));
    } finally {
      setChargementMessages(false);
    }
  }, [jeton, echec]);

  useEffect(() => {
    void relireMessages();
    const id = window.setInterval(() => { void relireMessages(); }, ACTUALISATION_MS);
    return () => window.clearInterval(id);
  }, [relireMessages]);
  useEffect(() => { finFil.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = texte.trim();
    if (!t) { setErreurMessage('Écrivez votre message.'); return; }
    setEnvoi(true); setErreurMessage('');
    try {
      const m = await suiviApi.ecrire(jeton, t);
      setMessages((l) => [...l, m]);
      setTexte('');
    } catch (err) {
      setErreurMessage(echec(err));
    } finally {
      setEnvoi(false);
    }
  };

  const choisirFichier = (p: PieceDossier) => { cible.current = p; entree.current?.click(); };
  const deposer = async (fichier: File) => {
    const p = cible.current;
    if (!p) return;
    setErreursPieces((x) => ({ ...x, [p.code]: '' }));
    if (fichier.size > 10 * 1024 * 1024) { setErreursPieces((x) => ({ ...x, [p.code]: 'Fichier trop lourd : 10 Mo au maximum.' })); return; }
    setDepot(p.code);
    try {
      const lien = await uploadToCloudinary(fichier, undefined, { strict: true, confidentiel: true });
      const pieces = await suiviApi.deposerPiece(jeton, p.code, lien);
      setDossier((d) => ({ ...d, pieces }));
      toast.success(`« ${p.libelle} » ${p.jointe ? 'remplacée' : 'ajoutée'} : l'école est prévenue.`);
      void relireMessages();
    } catch (err) {
      setErreursPieces((x) => ({ ...x, [p.code]: err instanceof UploadError ? `Non envoyé : ${err.message}` : echec(err) }));
    } finally {
      setDepot(null);
    }
  };

  const decide = dossier.statut === 'ACCEPTE' || dossier.statut === 'REFUSE';
  const couleur = dossier.statut === 'ACCEPTE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : dossier.statut === 'REFUSE' ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-blue-50 text-blue-800 border-blue-200';
  const pieces = dossier.pieces ?? [
    { code: 'pieceIdentite', libelle: "Pièce d'identité", jointe: dossier.pieceIdentiteDeclaree },
    { code: 'diplome', libelle: 'Diplôme ou attestation', jointe: dossier.diplomeDeclare },
  ];
  const modifiable = dossier.modifiable ?? !decide;

  return (
    <div className="space-y-4 text-xs font-bold text-neutral-600" id="candidate-status-tab-content">
      <div className={`p-4 border rounded-2xl ${couleur}`} id="candidate-statut">
        <h4 className="font-extrabold text-sm leading-tight uppercase">{LIBELLE_STATUT[dossier.statut]}</h4>
        <p className="text-[11px] mt-1 font-semibold opacity-90">
          Dossier <strong className="font-mono">{dossier.id}</strong> · {dossier.formation ?? '—'}
          {dossier.dateDepot && <> · déposé le {new Date(dossier.dateDepot).toLocaleDateString('fr-FR')}</>}
        </p>
        {!decide && dossier.etape && ETAPES[dossier.etape] && (
          <p className="text-[11px] mt-1 font-semibold">Étape actuelle : {ETAPES[dossier.etape]}</p>
        )}
        {dossier.statut === 'REFUSE' && dossier.motifRefus && (
          <p className="text-[11px] mt-2 font-semibold">Motif communiqué par l'école : {dossier.motifRefus}</p>
        )}
        {dossier.statut === 'ACCEPTE' && (
          <p className="text-[11px] mt-2 font-semibold">L'école vous contactera pour finaliser votre inscription.</p>
        )}
      </div>

      <section aria-labelledby="mes-pieces-titre" className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-2" id="mes-pieces">
        <h5 id="mes-pieces-titre" className="text-[10px] font-black uppercase text-neutral-500 tracking-wider m-0">Vos pièces</h5>
        {pieces.map((p) => (
          <div key={p.code} className="border-b border-neutral-100 last:border-0 py-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-neutral-700 font-semibold">{p.libelle}</span>
              <div className="flex items-center gap-1.5">
                <span className={p.jointe ? 'text-emerald-700' : 'text-amber-700'}>{p.jointe ? 'Jointe' : 'Manquante'}</span>
                {p.jointe && jeton && (
                  <button type="button" onClick={() => setVue(p)} className="px-2 py-1 rounded-lg text-[11px] font-black text-primary hover:bg-primary/5 bg-transparent border-0 cursor-pointer">Voir</button>
                )}
                {modifiable && jeton && (
                  <button type="button" onClick={() => choisirFichier(p)} disabled={depot !== null}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-primary text-white border-0 cursor-pointer disabled:opacity-50">
                    {depot === p.code ? 'Envoi…' : p.jointe ? 'Remplacer' : 'Ajouter'}
                  </button>
                )}
              </div>
            </div>
            {erreursPieces[p.code] && <p role="alert" className="text-[11px] text-rose-700 font-semibold mt-1 m-0">{erreursPieces[p.code]}</p>}
          </div>
        ))}
        <div className="flex justify-between items-center pt-1">
          <span className="text-neutral-500 font-semibold">Frais de dossier</span>
          <span className={dossier.frais !== 'NON_DECLARES' ? 'text-emerald-700' : 'text-neutral-400'}>{LIBELLE_FRAIS[dossier.frais]}</span>
        </div>
        {!modifiable && <p className="text-[10px] text-neutral-400 font-semibold m-0">La décision est rendue : les pièces ne se modifient plus.</p>}
        <input ref={entree} type="file" className="hidden" accept={ACCEPT} aria-label="Fichier de la pièce"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void deposer(f); }} />
      </section>

      <section aria-labelledby="echanges-titre" className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3" id="echanges-ecole">
        <h5 id="echanges-titre" className="text-[10px] font-black uppercase text-neutral-500 tracking-wider m-0">Messages avec l'école</h5>
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1" aria-live="polite">
          {chargementMessages && <p className="text-[11px] text-neutral-400 font-semibold">Chargement des messages…</p>}
          {!chargementMessages && messages.length === 0 && (
            <p className="text-[11px] text-neutral-400 font-semibold">Aucun message pour l'instant. Posez votre question à l'école ci-dessous.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.auteur === 'CANDIDAT' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.auteur === 'CANDIDAT' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-800'}`}>
                <p className="text-[10px] font-black opacity-80 m-0">{m.auteur === 'CANDIDAT' ? 'Vous' : m.auteurNom} · {heure(m.envoyeLe)}</p>
                <p className="text-xs font-semibold whitespace-pre-line break-words m-0 mt-0.5">{m.texte}</p>
              </div>
            </div>
          ))}
          <div ref={finFil} />
        </div>
        {jeton ? (
          <form onSubmit={envoyer} noValidate className="space-y-2">
            <label htmlFor="message-candidat" className="sr-only">Votre message à l'école</label>
            <textarea id="message-candidat" rows={3} maxLength={2000} value={texte} onChange={(e) => setTexte(e.target.value)}
              placeholder="Votre question ou votre réponse à l'école…"
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-primary" />
            {erreurMessage && <p role="alert" className="text-[11px] text-rose-700 font-semibold m-0">{erreurMessage}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={envoi} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black border-0 cursor-pointer disabled:opacity-50">
                {envoi ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-[11px] text-neutral-400 font-semibold m-0">Reconnectez-vous pour écrire à l'école.</p>
        )}
      </section>

      {vue && (
        <VisionneuseFichier titre={vue.libelle} charger={() => suiviApi.piece(jeton, vue.code)} onFermer={() => setVue(null)} />
      )}
    </div>
  );
}

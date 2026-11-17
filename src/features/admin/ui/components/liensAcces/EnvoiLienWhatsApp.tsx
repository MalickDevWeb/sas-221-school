import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRbacStore } from '@/core/store/rbacStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { estEmailTechnique, liensAccesApi, type CanalLien, type ResultatLien } from './liensAccesApi';
import { ResultatLienVue } from './ResultatLien';

const ROLES = {
  eleve: { aQui: "à l'élève", pourQui: "pour l'élève" },
  parent: { aQui: 'au parent', pourQui: 'pour le parent' },
} as const;

export type RoleDestinataire = keyof typeof ROLES;

/** Compte qui reçoit son lien d'accès (élève ou parent). */
export interface DestinataireLien {
  role: RoleDestinataire;
  /** Compte du destinataire (POST /admin/comptes/{id}/lien-acces). */
  id: string;
  /** Nom affiché : « Message préparé pour <nom>. » */
  nom: string;
  telephone?: string | null;
  email?: string | null;
}

type Etat =
  | { etape: 'envoi' }
  | { etape: 'erreur'; message: string }
  | { etape: 'pret'; r: ResultatLien }        // lien délivré, WhatsApp pas encore ouvert
  | { etape: 'prepare'; r: ResultatLien }     // WhatsApp ouvert avec le message
  | { etape: 'resultat'; r: ResultatLien };   // attente d'accord ou e-mail (détail : ResultatLienVue)

const aUnNumero = (d: DestinataireLien) => !!d.telephone?.trim();

/** Ouvre WhatsApp dans un nouvel onglet ; false si le navigateur a bloqué l'ouverture. */
function ouvrirWhatsApp(adresse: string): boolean {
  const fenetre = window.open(adresse, '_blank');
  if (!fenetre) return false;
  try { fenetre.opener = null; } catch { /* rien à faire */ }
  return true;
}

const bouton = 'px-3 py-2 rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed';
const lienTexte = 'p-0 border-0 bg-transparent text-[11px] font-bold text-primary hover:underline cursor-pointer disabled:opacity-60';

/**
 * Envoi par WhatsApp du LIEN D'ACCÈS d'un ou plusieurs comptes (16/11, décision du Tech Lead) : lien personnel
 * (choix du mot de passe, une seule fois) émis par le serveur — POST /admin/comptes/{id}/lien-acces {canal: WHATSAPP}
 * via liensAccesApi — et message prérempli ouvert dans WhatsApp. Jamais le mot de passe provisoire (règle du 15/11).
 * Deux ouvertures à la suite étant bloquées par les navigateurs, « Envoyer aux deux » ouvre le premier lien puis
 * propose « Ouvrir WhatsApp pour … » pour le suivant. Compte sans numéro : bouton désactivé avec la raison, et envoi
 * par e-mail proposé si le compte a une vraie adresse. Réservé à l'administration (comme la route).
 * Réutilisable (fiche du parent, fiche de la classe) ; une seule instance par écran (ResultatLienVue a des id fixes).
 */
export function EnvoiLienWhatsApp({ destinataires }: { destinataires: DestinataireLien[] }) {
  const administration = useRbacStore((s) => s.mesDroits?.administration ?? false);
  const [etats, setEtats] = useState<Record<string, Etat>>({});
  /** Destinataire dont le dernier lien est détaillé sous les boutons (message, copie, attente d'accord, e-mail). */
  const [courant, setCourant] = useState<string | null>(null);
  const [bloque, setBloque] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const emission = useMutation({
    mutationFn: ({ id, canal }: { id: string; canal: CanalLien }) => liensAccesApi.emettre(id, canal),
  });

  const changer = (d: DestinataireLien, e: Etat) => setEtats((avant) => ({ ...avant, [d.id]: e }));

  const emettre = async (d: DestinataireLien, canal: CanalLien): Promise<ResultatLien | null> => {
    changer(d, { etape: 'envoi' });
    try {
      return await emission.mutateAsync({ id: d.id, canal });
    } catch (err) {
      changer(d, { etape: 'erreur', message: resolveErrorMessage(err) });
      return null;
    }
  };

  /** Lien délivré : ouvert tout de suite (ouvrir = true) ou en attente d'un clic sur « Ouvrir WhatsApp pour … ». */
  const recevoir = (d: DestinataireLien, r: ResultatLien, ouvrir: boolean) => {
    if (r.accordRequis || !r.adresseEnvoi) {
      changer(d, { etape: 'resultat', r });
      setCourant(d.id);
      return;
    }
    if (!ouvrir) {
      changer(d, { etape: 'pret', r });
      return;
    }
    const ouvert = ouvrirWhatsApp(r.adresseEnvoi);
    changer(d, { etape: ouvert ? 'prepare' : 'pret', r });
    setCourant(d.id);
    setBloque(!ouvert);
  };

  const action = async (travail: () => Promise<void>) => {
    setEnCours(true);
    setBloque(false);
    try { await travail(); } finally { setEnCours(false); }
  };

  const envoyer = (d: DestinataireLien) => action(async () => {
    const r = await emettre(d, 'WHATSAPP');
    if (r) recevoir(d, r, true);
  });

  const envoyerATous = () => action(async () => {
    const recus: [DestinataireLien, ResultatLien][] = [];
    for (const d of destinataires.filter(aUnNumero)) {
      const r = await emettre(d, 'WHATSAPP');
      if (r) recus.push([d, r]);
    }
    let premier = true;
    for (const [d, r] of recus) {
      const ouvrable = !r.accordRequis && !!r.adresseEnvoi;
      recevoir(d, r, premier && ouvrable);
      if (ouvrable) premier = false;
    }
  });

  const envoyerEmail = (d: DestinataireLien) => action(async () => {
    const r = await emettre(d, 'EMAIL');
    if (r) {
      changer(d, { etape: 'resultat', r });
      setCourant(d.id);
    }
  });

  /** « Ouvrir WhatsApp » cliqué (lien du navigateur : jamais bloqué) : message préparé. */
  const ouvertParClic = (d: DestinataireLien, r: ResultatLien) => {
    changer(d, { etape: 'prepare', r });
    setCourant(d.id);
    setBloque(false);
  };

  if (destinataires.length === 0) return null;
  if (!administration) {
    return <p className="text-[11px] text-neutral-500 font-semibold m-0">Envoi d'un lien d'accès par WhatsApp : réservé à l'administration de l'école.</p>;
  }

  const dCourant = destinataires.find((d) => d.id === courant) ?? null;
  const eCourant = dCourant ? etats[dCourant.id] : undefined;
  const rCourant = eCourant && 'r' in eCourant ? eCourant.r : null;

  return (
    <section data-envoi-lien aria-label="Envoi du lien d'accès par WhatsApp" className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5 text-xs">
      <div>
        <p className="font-black text-neutral-800 m-0 flex items-center gap-1.5">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base text-emerald-600">chat</span>
          Envoyer le lien d'accès par WhatsApp
        </p>
        <p className="text-[11px] text-neutral-500 font-semibold m-0 mt-0.5">
          Lien personnel pour choisir son mot de passe, valable une seule fois. Le mot de passe provisoire n'est jamais envoyé.
        </p>
      </div>

      <ul className="space-y-2 m-0 p-0 list-none">
        {destinataires.map((d) => {
          const e = etats[d.id];
          const sansNumero = !aUnNumero(d);
          const raison = `envoi-lien-raison-${d.id}`;
          return (
            <li key={d.id} data-destinataire={d.role} className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <button type="button" data-action="envoyer-whatsapp" data-destinataire={d.role} disabled={sansNumero || enCours}
                aria-describedby={sansNumero ? raison : undefined} onClick={() => void envoyer(d)}
                className={`${bouton} bg-white border border-emerald-600/40 text-emerald-800 hover:bg-emerald-50`}>
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">send</span>
                {e?.etape === 'envoi' ? 'Préparation…' : `Envoyer ${ROLES[d.role].aQui} par WhatsApp`}
              </button>
              {sansNumero && <span id={raison} className="text-[11px] font-semibold text-neutral-500">Pas de numéro de mobile enregistré</span>}
              {sansNumero && !estEmailTechnique(d.email) && (
                <button type="button" data-action="envoyer-email" data-destinataire={d.role} disabled={enCours}
                  onClick={() => void envoyerEmail(d)} className={lienTexte}>
                  Envoyer {ROLES[d.role].aQui} par e-mail
                </button>
              )}
              {e?.etape === 'pret' && e.r.adresseEnvoi && (
                <a href={e.r.adresseEnvoi} target="_blank" rel="noopener noreferrer" data-action="ouvrir-whatsapp" data-destinataire={d.role}
                  onClick={() => ouvertParClic(d, e.r)} className={`${bouton} bg-emerald-600 text-white no-underline`}>
                  <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>
                  Ouvrir WhatsApp {ROLES[d.role].pourQui}
                </a>
              )}
              {e?.etape === 'prepare' && (
                <span data-prepare={d.role} role="status" className="text-emerald-700 font-bold inline-flex items-center gap-1">
                  <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">check_circle</span>
                  Message préparé pour {d.nom}.
                </span>
              )}
              {e?.etape === 'resultat' && e.r.accordRequis && (
                <span role="status" className="text-amber-800 font-bold">En attente de l'accord d'un second administrateur.</span>
              )}
              {e?.etape === 'erreur' && <span role="alert" data-erreur={d.role} className="text-rose-700 font-bold">Lien non créé : {e.message}</span>}
            </li>
          );
        })}
      </ul>

      {destinataires.filter(aUnNumero).length === 2 && (
        <button type="button" data-action="envoyer-tous" disabled={enCours} onClick={() => void envoyerATous()}
          className={`${bouton} bg-emerald-600 text-white border-0 hover:bg-emerald-700`}>
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">forward_to_inbox</span>
          Envoyer aux deux
        </button>
      )}
      {bloque && (
        <p role="status" className="text-[11px] font-semibold text-amber-800 m-0">
          Le navigateur a bloqué l'ouverture de WhatsApp : utilisez le bouton « Ouvrir WhatsApp ».
        </p>
      )}
      {rCourant && (
        // Détail du dernier lien : composant existant (message, « Ouvrir WhatsApp », « Copier le message », e-mail, accord)
        <div onClickCapture={(ev) => {
          if (dCourant && eCourant?.etape === 'pret' && ev.target instanceof Element && ev.target.closest('#lien-acces-ouvrir')) {
            ouvertParClic(dCourant, rCourant);
          }
        }}>
          <ResultatLienVue r={rCourant} />
        </div>
      )}
    </section>
  );
}

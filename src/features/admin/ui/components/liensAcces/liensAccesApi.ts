import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { listeBrute, objetBrut, texte, texteOuNull, vrai } from '@/shared/lib/lectureServeur';

/**
 * Liens d'accès émis par l'école — contrat lu dans LienAccesController / LienAccesService :
 * - POST /admin/comptes/{id}/lien-acces  {canal: WHATSAPP | SMS | EMAIL}
 * - POST /admin/liens-acces/{lienId}/accord   (second administrateur, ni demandeur ni titulaire)
 * - GET  /admin/liens-acces/en-attente
 * Routes réservées à l'administration de l'école. Le serveur n'envoie rien par WhatsApp ni SMS : il renvoie le
 * message prérempli et l'adresse wa.me / sms: que l'administrateur ouvre lui-même.
 */

export type CanalLien = 'WHATSAPP' | 'SMS' | 'EMAIL';

export const LIBELLES_CANAL: Record<CanalLien, string> = { WHATSAPP: 'WhatsApp', SMS: 'SMS', EMAIL: 'E-mail' };

export const libelleCanal = (c: string): string => LIBELLES_CANAL[c as CanalLien] ?? c;

/** « Activation du compte » (compte jamais utilisé, 72 h) ou « Nouveau mot de passe » (2 h). */
export const libelleTypeLien = (t: string): string =>
  t === 'ACTIVATION' ? 'Activation du compte' : t === 'REINITIALISATION' ? 'Nouveau mot de passe' : 'Lien d\'accès';

export interface ResultatLien {
  lienId: string;
  type: string;
  canal: string;
  /** Numéro ou e-mail masqué par le serveur (« +221 77 ••• •• 67 », « a•••@ecole.sn »). */
  destinataire: string | null;
  accordRequis: boolean;
  /** Raison de l'accord requis (compte à privilèges, numéro modifié depuis moins de 24 h). */
  motif: string | null;
  expireLe: unknown;
  /** WhatsApp / SMS : message prérempli à envoyer depuis le téléphone de l'administrateur. */
  message: string | null;
  /** WhatsApp / SMS : adresse https://wa.me/… ou sms:… (vérifiée avant d'être utilisée comme lien). */
  adresseEnvoi: string | null;
  /** E-mail : envoi effectué (true) ou impossible (false) ; null pour WhatsApp / SMS. */
  envoye: boolean | null;
  /** Compte à privilèges : code de 6 chiffres, affiché UNE seule fois, à dire de vive voix. */
  codeOral: string | null;
  consigne: string | null;
}

export interface LienEnAttente {
  lienId: string;
  userId: string;
  type: string;
  canal: string;
  destinataire: string | null;
  demandePar: string | null;
  demandeLe: string | null;
}

/** Seules les adresses d'envoi attendues sont utilisées comme lien (jamais une adresse javascript: ou autre). */
function adresseSure(v: unknown): string | null {
  const a = texteOuNull(v);
  return a && (a.startsWith('https://wa.me/') || a.startsWith('sms:')) ? a : null;
}

function lireResultat(data: unknown): ResultatLien {
  const c = objetBrut(data);
  return {
    lienId: texte(c.lienId),
    type: texte(c.type),
    canal: texte(c.canal),
    destinataire: texteOuNull(c.destinataire),
    accordRequis: vrai(c.accordRequis),
    motif: texteOuNull(c.motif),
    expireLe: c.expireLe ?? null,
    message: texteOuNull(c.message),
    adresseEnvoi: adresseSure(c.adresseEnvoi),
    envoye: typeof c.envoye === 'boolean' ? c.envoye : null,
    codeOral: texteOuNull(c.codeOral),
    consigne: texteOuNull(c.consigne),
  };
}

export const CLE_LIENS_EN_ATTENTE = ['admin', 'liens-acces', 'en-attente'] as const;

export const liensAccesApi = {
  async emettre(userId: string, canal: CanalLien): Promise<ResultatLien> {
    const { data } = await apiClient.post(`/admin/comptes/${encodeURIComponent(userId)}/lien-acces`, { canal });
    return lireResultat(data);
  },
  async accorder(lienId: string): Promise<ResultatLien> {
    const { data } = await apiClient.post(`/admin/liens-acces/${encodeURIComponent(lienId)}/accord`);
    return lireResultat(data);
  },
  async enAttente(): Promise<LienEnAttente[]> {
    const { data } = await apiClient.get('/admin/liens-acces/en-attente');
    return listeBrute(data).map(l => ({
      lienId: texte(l.lienId),
      userId: texte(l.userId),
      type: texte(l.type),
      canal: texte(l.canal),
      destinataire: texteOuNull(l.destinataire),
      demandePar: texteOuNull(l.demandePar),
      demandeLe: texteOuNull(l.demandeLe),
    }));
  },
};

/** Identifiant technique d'un compte sans e-mail (parent-…@sans-email.invalid) : jamais affiché ni utilisé. */
export const estEmailTechnique = (email: string | null | undefined): boolean =>
  !email || /\.invalid$/i.test(email.trim());

/** Demandes en attente d'accord (React Query) ; actif = false pour un compte qui n'est pas de l'administration. */
export function useLiensEnAttente(actif = true) {
  return useQuery({ queryKey: CLE_LIENS_EN_ATTENTE, queryFn: liensAccesApi.enAttente, staleTime: 30_000, retry: 1, enabled: actif });
}

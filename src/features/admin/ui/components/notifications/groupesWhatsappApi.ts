import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import type { DestinatairesAnnonce } from '../../../domain/NotificationsModels';

/** Groupe WhatsApp déclaré par l'école (FEAT-007). */
export interface GroupeWhatsapp {
  id: string;
  nom: string;
  public: DestinatairesAnnonce;
  classeId: string | null;
  classe: string | null;
  lien: string;
  actif: boolean;
}

export interface PartageWhatsapp { id: string; groupeId: string; groupe: string; titre: string; auteur: string | null; partageLe: string }

export interface SaisieGroupe { nom: string; public: DestinatairesAnnonce; classeId?: string | null; lien: string }

const CLE = ['admin', 'groupes-whatsapp'] as const;
const CLE_PARTAGES = ['admin', 'groupes-whatsapp', 'partages'] as const;

export function useGroupesWhatsapp() {
  // relue à chaque ouverture : un groupe ajouté entre-temps (autre administrateur) est proposé tout de suite
  return useQuery({ queryKey: CLE, queryFn: async () => (await apiClient.get<GroupeWhatsapp[]>('/admin/groupes-whatsapp')).data, staleTime: 0, refetchOnWindowFocus: true });
}

export function usePartagesWhatsapp() {
  return useQuery({ queryKey: CLE_PARTAGES, queryFn: async () => (await apiClient.get<PartageWhatsapp[]>('/admin/groupes-whatsapp/partages')).data });
}

export function useGererGroupes() {
  const client = useQueryClient();
  const rafraichir = () => client.invalidateQueries({ queryKey: CLE });
  return {
    creer: useMutation({ mutationFn: async (g: SaisieGroupe) => (await apiClient.post<GroupeWhatsapp>('/admin/groupes-whatsapp', g)).data, onSuccess: rafraichir }),
    modifier: useMutation({
      mutationFn: async ({ id, ...champs }: Partial<SaisieGroupe> & { id: string; actif?: boolean }) =>
        (await apiClient.put<GroupeWhatsapp>(`/admin/groupes-whatsapp/${encodeURIComponent(id)}`, champs)).data,
      onSuccess: rafraichir,
    }),
    supprimer: useMutation({ mutationFn: async (id: string) => { await apiClient.delete(`/admin/groupes-whatsapp/${encodeURIComponent(id)}`); }, onSuccess: rafraichir }),
  };
}

export function useNoterPartage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupeId, titre }: { groupeId: string; titre: string }) =>
      (await apiClient.post<PartageWhatsapp>(`/admin/groupes-whatsapp/${encodeURIComponent(groupeId)}/partages`, { titre })).data,
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_PARTAGES }),
  });
}

/**
 * Message d'erreur d'un lien saisi comme invitation de groupe, ou null s'il est valable. 16/11 : un lien d'APPEL
 * (call.whatsapp.com) ou d'un numéro (wa.me) est expliqué, au lieu d'un simple « ce n'est pas un lien d'invitation ».
 */
export function erreurLienGroupe(lien: string): string | null {
  const l = lien.trim();
  if (!l) return 'Collez le lien d’invitation du groupe (WhatsApp › infos du groupe › Inviter via un lien).';
  if (/chat\.whatsapp\.com\/(invite\/)?[A-Za-z0-9]{10,40}\/?$/.test(l)) return null;
  const ouTrouver = 'Dans WhatsApp : ouvrez le groupe › infos du groupe › Inviter via un lien › Copier le lien (il commence par https://chat.whatsapp.com/).';
  if (/call\.whatsapp\.com\//.test(l)) return `C’est le lien d’un appel WhatsApp, pas celui du groupe. ${ouTrouver}`;
  if (/(wa\.me|api\.whatsapp\.com)\//.test(l)) return `C’est le lien d’un numéro de téléphone, pas celui du groupe. ${ouTrouver}`;
  return `Ce n’est pas un lien d’invitation WhatsApp. ${ouTrouver}`;
}

/** BR-04 : groupes actifs proposés pour une annonce (« Toute l'école » : tous les groupes actifs). */
export function groupesPour(groupes: GroupeWhatsapp[] | undefined, destinataires: DestinatairesAnnonce | null): GroupeWhatsapp[] {
  const actifs = (groupes ?? []).filter(g => g.actif);
  if (!destinataires || destinataires === 'TOUTE_ECOLE') return actifs;
  return actifs.filter(g => g.public === destinataires);
}

const deuxChiffres = (n: number) => String(n).padStart(2, '0');
/** « 16/11 à 17:05 » */
export function quandPartage(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${deuxChiffres(d.getDate())}/${deuxChiffres(d.getMonth() + 1)} à ${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
}

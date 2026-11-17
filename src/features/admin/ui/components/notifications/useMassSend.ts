import { useState, type FormEvent } from 'react';
import type { DestinatairesAnnonce, NatureAnnonce } from '../../../domain/NotificationsModels';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { CONTENU_MAX, TITRE_MAX, libelleDestinataires, personnes, useApercuDestinataires, useEnvoyerAnnonce } from './useNotificationsHub';
import type { AnnonceEnvoyee } from './PartageWhatsapp';

/** Modèles de texte à compléter : les crochets marquent ce que l'école doit préciser (aucune date ni somme inventée). */
export const MASS_TEMPLATES = [
  {
    id: 't-1', name: 'Réunion des parents', destinataires: 'PARENTS' as DestinatairesAnnonce,
    title: 'Réunion des parents d’élèves',
    content: 'Chers parents, une réunion aura lieu le [date] à [heure], [lieu]. Votre présence est souhaitée.',
  },
  {
    id: 't-2', name: 'Rappel des frais', destinataires: 'PARENTS' as DestinatairesAnnonce,
    title: 'Rappel : frais de scolarité',
    content: 'Chers parents, nous vous rappelons que l’échéance des frais de scolarité est fixée au [date]. Merci de vous rapprocher de l’administration pour tout règlement.',
  },
  {
    id: 't-3', name: 'Bulletins disponibles', destinataires: 'TOUTE_ECOLE' as DestinatairesAnnonce,
    title: 'Bulletins disponibles',
    content: 'Les bulletins du [période] sont disponibles. [Précisez comment les retirer ou les consulter.]',
  },
];

export interface ErreursAnnonce { title?: string; content?: string; destinataires?: string; serveur?: string }

/**
 * Formulaire d'envoi (annonce ou alerte) : validation personnalisée, confirmation avec le nombre réel de
 * destinataires, envoi par POST /v1/notifications/annonces, confirmation « Envoyée à N personnes ».
 */
export function useMassSend(nature: NatureAnnonce, ids = { titre: 'annonce-titre', message: 'annonce-message' }) {
  const envoi = useEnvoyerAnnonce();
  const [destinataires, setDestinataires] = useState<DestinatairesAnnonce | null>(null);
  const apercu = useApercuDestinataires(destinataires);   // même requête que l'affichage du nombre (cache partagé)
  const nombreVise = apercu.data;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [erreurs, setErreurs] = useState<ErreursAnnonce>({});
  const [confirmation, setConfirmation] = useState('');
  // FEAT-007 : canal WhatsApp coché, et dernière annonce envoyée à partager dans les groupes
  const [whatsapp, setWhatsapp] = useState(false);
  const [aPartager, setAPartager] = useState<AnnonceEnvoyee | null>(null);

  const applyTemplate = (templateId: string) => {
    const tpl = MASS_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setTitle(tpl.title); setContent(tpl.content); setDestinataires(tpl.destinataires);
      setErreurs({}); setConfirmation('');
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (envoi.isPending) return;
    setConfirmation('');
    const t = title.trim();
    const c = content.trim();
    const err: ErreursAnnonce = {};
    if (!destinataires) err.destinataires = 'Choisissez les destinataires.';
    else if (nombreVise === 0) err.destinataires = 'Aucun compte actif pour ce choix : choisissez d’autres destinataires.';
    if (!t) err.title = 'Le titre est obligatoire.';
    else if (t.length > TITRE_MAX) err.title = `Le titre ne doit pas dépasser ${TITRE_MAX} caractères.`;
    if (!c) err.content = nature === 'URGENCE' ? 'Écrivez les consignes à suivre : elles sont obligatoires.' : 'Le message est obligatoire.';
    else if (c.length > CONTENU_MAX) err.content = `Le message ne doit pas dépasser ${CONTENU_MAX} caractères.`;
    else if (/\[[^\]]+\]/.test(c)) err.content = 'Complétez les passages entre crochets (ex. « [date] ») avant d’envoyer.';
    setErreurs(err);
    if (err.title || err.content || err.destinataires) {
      document.getElementById(err.title ? ids.titre : ids.message)?.focus();
      return;
    }
    if (!destinataires) return;
    const qui = `${libelleDestinataires(destinataires).toLowerCase()}${typeof nombreVise === 'number' ? ` (${personnes(nombreVise)})` : ''}`;
    const ok = await demanderConfirmation(
      nature === 'URGENCE' ? `Envoyer cette alerte d’urgence à : ${qui} ?` : `Envoyer cette annonce à : ${qui} ?`,
      { titre: nature === 'URGENCE' ? 'Alerte d’urgence' : 'Annonce', confirmer: 'Envoyer', danger: nature === 'URGENCE' },
    );
    if (!ok) return;
    try {
      const r = await envoi.mutateAsync({ titre: t, message: c, destinataires, nature });
      const n = typeof r?.destinatairesTouches === 'number' ? r.destinatairesTouches : null;
      setTitle(''); setContent('');
      setAPartager(whatsapp ? { titre: t, message: c, destinataires } : null);
      setConfirmation(`${nature === 'URGENCE' ? 'Alerte' : 'Annonce'} « ${t} » envoyée${n === null ? '' : ` à ${personnes(n)}`}. Elle apparaît dans la cloche de leur espace.`);
    } catch (ex) {
      setErreurs({ serveur: resolveErrorMessage(ex) });   // rien n'a été envoyé
    }
  };

  return {
    destinataires,
    setDestinataires: (v: DestinatairesAnnonce) => { setDestinataires(v); setErreurs(x => ({ ...x, destinataires: undefined, serveur: undefined })); },
    title, setTitle: (v: string) => { setTitle(v); setErreurs(x => ({ ...x, title: undefined, serveur: undefined })); },
    content, setContent: (v: string) => { setContent(v); setErreurs(x => ({ ...x, content: undefined, serveur: undefined })); },
    erreurs, confirmation, setConfirmation,
    whatsapp, setWhatsapp, aPartager, fermerPartage: () => setAPartager(null),
    sending: envoi.isPending, handleSubmit, applyTemplate,
  };
}

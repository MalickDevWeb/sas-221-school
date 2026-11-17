import type { DestinatairesAnnonce } from '../../../domain/NotificationsModels';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { DESTINATAIRES, personnes, useApercuDestinataires } from './useNotificationsHub';

/**
 * Éléments communs aux annonces et aux alertes : choix des destinataires avec le nombre RÉEL de comptes visés
 * (GET /annonces/apercu) et canaux d'envoi (seule l'application est branchée ; e-mail, SMS, WhatsApp « Bientôt »).
 */

const CANAUX_BIENTOT = [
  { id: 'email', libelle: 'E-mail', icone: 'mail' },
  { id: 'sms', libelle: 'SMS', icone: 'sms' },
];

interface ChoixProps {
  nom: string;
  valeur: DestinatairesAnnonce | null;
  onChange: (v: DestinatairesAnnonce) => void;
  erreur?: string;
  urgence?: boolean;
}

export function ChoixDestinataires({ nom, valeur, onChange, erreur, urgence = false }: ChoixProps) {
  const apercu = useApercuDestinataires(valeur);
  const actif = urgence ? 'bg-red-50 border-red-300 text-red-950' : 'bg-primary/5 border-primary/40 text-neutral-900';
  return (
    <fieldset className="space-y-1.5 border-0 p-0 m-0 min-w-0" aria-describedby={`${nom}-nombre`}>
      <legend className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">Destinataires <span className="text-red-500">*</span></legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DESTINATAIRES.map(d => (
          <label key={d.code} data-destinataires={d.code}
            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer min-w-0 ${valeur === d.code ? actif : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'} ${d.code === 'TOUTE_ECOLE' ? 'sm:col-span-2' : ''}`}>
            <input type="radio" name={nom} value={d.code} checked={valeur === d.code} onChange={() => onChange(d.code)}
              className={`w-4 h-4 shrink-0 cursor-pointer ${urgence ? 'accent-red-600' : 'accent-primary'}`} />
            <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[18px] shrink-0 ${valeur === d.code ? (urgence ? 'text-red-600' : 'text-primary') : 'text-neutral-400'}`}>{d.icone}</span>
            <span className="min-w-0">
              <span className="block text-xs font-bold">{d.libelle}</span>
              {/* 16/11 : description en entier (avant : coupée, « Comptes professeurs ac… ») */}
              <span className="block text-[10px] text-neutral-500 font-semibold leading-snug">{d.detail}</span>
            </span>
          </label>
        ))}
      </div>
      <p id={`${nom}-nombre`} aria-live="polite" className="text-[11px] font-semibold min-h-[16px]">
        {!valeur ? <span className="text-neutral-500">Choisissez qui doit la recevoir : le nombre de personnes s’affichera ici.</span>
          : apercu.isLoading ? <span className="inline-block h-3 w-40 rounded bg-neutral-100 animate-pulse align-middle" />
          : apercu.isError ? <span className="text-red-600">Nombre indisponible : {resolveErrorMessage(apercu.error)} <button type="button" onClick={() => void apercu.refetch()} className="underline font-black cursor-pointer">Réessayer</button></span>
          : apercu.data === 0 ? <span className="text-amber-700">Aucun compte actif pour ce choix : personne ne la recevrait.</span>
          : <span className="text-neutral-700">Sera reçue par <b data-nombre-destinataires={apercu.data}>{personnes(apercu.data ?? 0)}</b> (comptes actifs).</span>}
      </p>
      {erreur && <p className="text-[10px] text-red-600 font-semibold">{erreur}</p>}
    </fieldset>
  );
}

/** whatsapp : canal coché ; groupes : nombre de groupes WhatsApp actifs de l'école (FEAT-007). */
export function Canaux({ whatsapp = false, onWhatsapp, groupes = 0 }: { whatsapp?: boolean; onWhatsapp?: (v: boolean) => void; groupes?: number }) {
  const utilisable = groupes > 0 && !!onWhatsapp;
  return (
    <fieldset className="space-y-1.5 border-0 p-0 m-0 min-w-0">
      <legend className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">Canaux d’envoi</legend>
      {/* 16/11 : tuiles verticales (icône et état en haut, nom dessous) : le nom du canal tient en entier, même sur
          quatre colonnes (avant : « A… » pour Application et aucun nom pour e-mail, SMS, WhatsApp) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div data-canal="app" className="flex flex-col gap-2 p-3 rounded-xl border border-primary/40 bg-primary/5 text-primary min-w-0">
          <span className="flex items-center justify-between">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px]">notifications_active</span>
            <span translate="no" aria-label="toujours utilisé" className="material-symbols-outlined text-[18px]">check_circle</span>
          </span>
          <span className="text-xs font-bold leading-tight">Application</span>
        </div>
        {CANAUX_BIENTOT.map(c => (
          <div key={c.id} aria-disabled="true" data-canal={c.id}
            className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed min-w-0">
            <span className="flex items-center justify-between gap-1">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px] text-neutral-400">{c.icone}</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-500">Bientôt</span>
            </span>
            <span className="text-xs font-bold leading-tight">{c.libelle}</span>
          </div>
        ))}
        {/* FEAT-007 (16/11) : WhatsApp par les groupes de l'école, sans API payante */}
        <label data-canal="whatsapp" title={utilisable ? undefined : 'Enregistrez d’abord un groupe dans l’onglet « Groupes WhatsApp »'}
          className={`flex flex-col gap-2 p-3 rounded-xl border min-w-0 ${utilisable ? 'cursor-pointer' : 'cursor-not-allowed'} ${whatsapp ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : utilisable ? 'border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300' : 'border-dashed border-neutral-200 bg-neutral-50 text-neutral-500'}`}>
          <span className="flex items-center justify-between gap-1">
            <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[20px] ${whatsapp ? 'text-emerald-600' : 'text-neutral-400'}`}>forum</span>
            <input id="canal-whatsapp" type="checkbox" checked={whatsapp} disabled={!utilisable} onChange={(e) => onWhatsapp?.(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed" />
          </span>
          <span className="text-xs font-bold leading-tight">WhatsApp</span>
          <span className="text-[9px] font-semibold leading-tight">{groupes > 0 ? `${groupes} groupe${groupes > 1 ? 's' : ''}` : 'Aucun groupe'}</span>
        </label>
      </div>
      <p className="text-[10px] text-neutral-500 font-semibold">
        L’annonce arrive dans la cloche de l’espace de chaque destinataire.{' '}
        {utilisable ? 'Avec WhatsApp, l’application prépare ensuite le message à partager dans vos groupes.' : 'Pour WhatsApp, enregistrez vos groupes dans l’onglet « Groupes WhatsApp ».'}{' '}
        L’envoi par e-mail ou SMS n’est pas encore branché.
      </p>
    </fieldset>
  );
}

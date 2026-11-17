import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { chargerFichierServeur, type FichierCharge } from '@/shared/lib/fichiersServeur';

interface Props {
  /** Titre affiché (« Relevés de notes — Awa Diop »). */
  titre: string;
  /** Route du serveur qui remet le fichier (ex. /admissions/candidats/{id}/pieces/releves)… */
  chemin?: string;
  /** …ou fichier déjà dans le navigateur (aperçu de sa propre pièce avant l'envoi du dossier)… */
  local?: FichierCharge;
  /** …ou chargement fourni par l'écran (ex. espace du candidat, avec sa session de suivi). */
  charger?: () => Promise<FichierCharge>;
  /** Bouton « Télécharger » : seulement pour qui en a le droit ; sinon consultation seule. */
  telechargeable?: boolean;
  /** Nom proposé au téléchargement, sans extension. */
  nomFichier?: string;
  onFermer: () => void;
}

const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
};

/**
 * Visionneuse intégrée (17/11) : le document s'affiche DANS l'application, par-dessus la page — aucun nouvel onglet,
 * aucune adresse à copier. PDF dans un lecteur intégré, image affichée, autre format : téléchargement si autorisé.
 * Consultation seule : barre d'outils du lecteur PDF masquée, enregistrement de l'image par clic droit bloqué (cela
 * décourage la copie sans pouvoir empêcher une capture d'écran).
 */
export function VisionneuseFichier({ titre, chemin, local, charger, telechargeable = false, nomFichier = 'document', onFermer }: Props) {
  const [fichier, setFichier] = useState<FichierCharge | null>(local ?? null);
  const [erreur, setErreur] = useState('');
  const fermer = useRef<HTMLButtonElement>(null);

  useEffect(() => { fermer.current?.focus(); }, []);
  useEffect(() => {
    if (local || (!chemin && !charger)) return undefined;
    let actif = true;
    let url: string | null = null;
    (charger ? charger() : chargerFichierServeur(chemin as string))
      .then((f) => { if (actif) { url = f.url; setFichier(f); } else URL.revokeObjectURL(f.url); })
      .catch((e: unknown) => { if (actif) setErreur(e instanceof Error ? e.message : String(e)); });
    return () => { actif = false; if (url) URL.revokeObjectURL(url); };
  }, [chemin, local]);   // eslint-disable-line react-hooks/exhaustive-deps -- « charger » : fonction recréée à chaque rendu

  const telecharger = () => {
    if (!fichier) return;
    const a = document.createElement('a');
    a.href = fichier.url;
    a.download = `${nomFichier}.${EXTENSIONS[fichier.type] ?? 'bin'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const pdf = fichier?.type === 'application/pdf';
  const image = !!fichier?.type.startsWith('image/');

  return createPortal(
    <div id="visionneuse-fichier" role="dialog" aria-modal="true" aria-labelledby="visionneuse-titre"
      className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onFermer(); } }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between gap-3">
          <h3 id="visionneuse-titre" className="text-sm font-black text-slate-900 m-0 truncate">{titre}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {telechargeable && fichier && (
              <button type="button" onClick={telecharger}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-black border-0 cursor-pointer flex items-center gap-1">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">download</span>
                Télécharger
              </button>
            )}
            <button ref={fermer} type="button" onClick={onFermer} aria-label="Fermer"
              className="h-8 w-8 rounded-lg text-slate-500 hover:bg-neutral-100 flex items-center justify-center border-0 bg-transparent cursor-pointer">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 bg-neutral-900 flex items-center justify-center">
          {erreur ? (
            <p role="alert" className="text-sm font-bold text-rose-200 p-6 text-center">{erreur}</p>
          ) : !fichier ? (
            <p role="status" className="text-sm font-semibold text-neutral-300">Chargement du document…</p>
          ) : pdf ? (
            <iframe title={titre} className="w-full h-full bg-white border-0"
              src={telechargeable ? fichier.url : `${fichier.url}#toolbar=0&navpanes=0`} />
          ) : image ? (
            <img src={fichier.url} alt={titre} draggable={false} onContextMenu={(e) => { if (!telechargeable) e.preventDefault(); }}
              className="max-w-full max-h-full object-contain select-none" />
          ) : (
            <p className="text-sm font-semibold text-neutral-200 p-6 text-center">
              Aperçu impossible pour ce type de fichier.{telechargeable ? ' Utilisez « Télécharger ».' : ''}
            </p>
          )}
        </div>
        {!telechargeable && fichier && (
          <p className="px-4 py-2 text-[11px] font-semibold text-neutral-500 border-t border-neutral-200 m-0">
            Consultation seule : le téléchargement est réservé aux personnes autorisées.
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

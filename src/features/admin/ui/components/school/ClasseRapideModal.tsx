import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { Classe, Filiere } from '../../../domain/SchoolModels';
import { ClasseFormModal } from './ClasseFormModal';
import { useAjoutPlanning } from './useAjoutPlanning';

interface Props {
  /** « Annuler » ou Échap : ferme ce formulaire seulement (la fenêtre d'en dessous garde sa saisie). */
  onFermer: () => void;
  /** Classe enregistrée par le serveur : la fenêtre d'en dessous relit sa liste et la sélectionne. */
  onCreee: (classe: Classe) => Promise<void> | void;
}

const bouton = 'px-4 py-2 rounded-xl text-xs font-bold cursor-pointer';

/**
 * Formulaire de classe EXISTANT (ClasseFormModal, avec la création rapide d'une filière) ouvert PAR-DESSUS une autre
 * fenêtre (16/11 : « Nouvel élève » → « Créer une classe »). Calque z-[1200], au-dessus des fenêtres en z-[1100] ;
 * Échap et « Annuler » ne ferment que ce formulaire, et jamais pendant un enregistrement. Enregistrement :
 * useAjoutPlanning (liste complète relue juste avant l'envoi : aucune classe existante ne part à la corbeille).
 */
export function ClasseRapideModal({ onFermer, onCreee }: Props) {
  const { filieres, ajouterClasse, ajouterFiliere } = useAjoutPlanning();
  const calque = useRef<HTMLDivElement>(null);
  const affichee = useRef(true);
  const occupe = ajouterClasse.isPending || ajouterFiliere.isPending;

  useEffect(() => {
    affichee.current = true;
    return () => { affichee.current = false; };
  }, []);
  // Focus dans la fenêtre du dessus : bouton « Annuler » pendant le chargement, puis premier champ du formulaire
  useEffect(() => {
    calque.current?.querySelector<HTMLElement>('select, input, button')?.focus();
  }, [filieres.isSuccess]);

  const fermer = () => { if (!occupe) onFermer(); };

  const enregistrer = async (classe: Classe): Promise<string | null> => {
    try {
      await ajouterClasse.mutateAsync(classe);
    } catch (err) {
      const message = resolveErrorMessage(err);
      if (!affichee.current) toast.error(`Classe non créée : ${message}`);   // formulaire déjà fermé : le dire quand même
      return message;
    }
    await onCreee(classe);
    return null;
  };

  const creerFiliere = async (filiere: Filiere): Promise<string | null> => {
    try {
      await ajouterFiliere.mutateAsync(filiere);
      return null;
    } catch (err) {
      return resolveErrorMessage(err);
    }
  };

  return createPortal(
    <div ref={calque} id="classe-rapide" className="relative z-[1200]" role="dialog" aria-modal="true" aria-label="Créer une classe"
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();   // la fenêtre d'en dessous ne reçoit pas cet Échap
        fermer();
      }}>
      {filieres.isSuccess ? (
        <ClasseFormModal classe={null} filieres={filieres.data} onClose={fermer} onSave={enregistrer} onCreerFiliere={creerFiliere} />
      ) : (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 w-full max-w-md space-y-4 text-xs">
            {filieres.isError
              ? <p role="alert" className="font-bold text-rose-700 m-0">Filières indisponibles : {resolveErrorMessage(filieres.error)}</p>
              : <p role="status" className="font-semibold text-neutral-600 m-0">Chargement des filières…</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onFermer} className={`${bouton} border border-neutral-200 text-neutral-500 hover:bg-neutral-50 bg-white`}>
                Annuler
              </button>
              {filieres.isError && (
                <button type="button" onClick={() => void filieres.refetch()} className={`${bouton} bg-primary text-white border-0`}>
                  Réessayer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

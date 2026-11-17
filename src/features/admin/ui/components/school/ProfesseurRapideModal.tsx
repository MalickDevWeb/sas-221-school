import React from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AddStaffCard, type ResultatCreation } from '../personnel/accounts/AddStaffCard';
import { creerCompteCollaborateur } from '../personnel/accounts/creerCompteCollaborateur';

interface Props {
  onFermer: () => void;
  /** Compte enregistré par le serveur (mot de passe provisoire inclus s'il a été généré). */
  onCree: (res: ResultatCreation) => void;
}

/**
 * Création d'un professeur sans quitter l'emploi du temps (16/11) : formulaire EXISTANT de Gestion Personnel
 * (AddStaffCard : validation, erreurs du serveur sous le champ) avec le rôle fixé à « Enseignant ».
 * Après création, les listes « Profs » du planning et du personnel sont relues : le professeur se glisse aussitôt.
 */
export function ProfesseurRapideModal({ onFermer, onCree }: Props) {
  const client = useQueryClient();

  const creer = async (membre: Parameters<typeof creerCompteCollaborateur>[0]) => {
    const res = await creerCompteCollaborateur(membre);
    if (!res) throw new Error('Réponse du serveur incomplète : rechargez la page pour voir le nouveau professeur.');
    await Promise.all([
      client.invalidateQueries({ queryKey: ['admin', 'professeurs'] }),
      client.invalidateQueries({ queryKey: ['admin', 'personnel'] }),
    ]);
    return res;
  };

  return createPortal(
    <div id="professeur-rapide" role="dialog" aria-modal="true" aria-labelledby="titre-ajout-membre"
      className="fixed inset-0 z-[1100] bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        onFermer();
      }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <AddStaffCard
          titre="Nouveau professeur"
          roleImpose="Enseignant"
          onAddStaff={creer}
          onCreated={onCree}
          onFermer={onFermer}
        />
      </div>
    </div>,
    document.body,
  );
}

import React from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { anneeAcademique } from '@/shared/lib/anneeAcademique';
import { imprimerAttestationScolarite } from '@/shared/lib/attestationScolarite';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  child: { prenom: string; nom: string; classe: string; filiere: string; matricule: string };
}

/**
 * Attestation de scolarité (modèle commun des documents de l'école).
 * Le document porte un emplacement pour la signature et le cachet de l'école : il n'a de valeur qu'une fois
 * signé par l'établissement.
 */
export function AttestationModal({ isOpen, onClose, child }: Props) {
  const nomEcole = useTenantStore((s) => s.currentTenant?.name) || 'l’établissement';
  const annee = anneeAcademique();
  const eleve = `${child.prenom} ${child.nom}`.trim();
  const lignes = [
    { cle: 'Nom et prénom', valeur: eleve || '—' },
    { cle: 'Matricule', valeur: child.matricule || '—' },
    { cle: 'Classe', valeur: child.classe || '—' },
    ...(child.filiere ? [{ cle: 'Filière', valeur: child.filiere }] : []),
    { cle: 'Année scolaire', valeur: annee },
  ];

  if (!isOpen) return null;

  const imprimer = () => { imprimerAttestationScolarite({ eleve, matricule: child.matricule, classe: child.classe, filiere: child.filiere }); };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="attestation-titre">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 id="attestation-titre" className="text-sm font-black text-slate-800 m-0">Attestation de scolarité</h2>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50">
            <span translate="no" className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-xs text-slate-700">
          <p>La direction de <strong>{nomEcole}</strong> atteste que l'élève ci-dessous est inscrit(e) dans l'établissement pour l'année scolaire {annee}.</p>
          <dl className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 m-0">
            {lignes.map((l) => (
              <div key={l.cle} className="flex justify-between gap-3">
                <dt className="text-slate-500 font-bold">{l.cle}</dt><dd className="font-black text-slate-900 m-0 text-right">{l.valeur}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] text-slate-500">
            Le document imprimé porte un emplacement pour la signature et le cachet de l'établissement : faites-le signer
            par l'école pour qu'il ait valeur officielle.
          </p>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={imprimer} className="flex-1 py-2.5 bg-primary text-text-on-primary rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2">
            <span translate="no" className="material-symbols-outlined text-[16px]">print</span>
            Imprimer ou enregistrer en PDF
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

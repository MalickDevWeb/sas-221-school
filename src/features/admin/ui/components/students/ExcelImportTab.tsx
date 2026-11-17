import React from 'react';
import { Student } from '../../../domain/StudentModels';
import { COLONNES, useExcelImport } from './useExcelImport';

interface Props {
  students: Student[];
  /** Appelé après un import réel : la liste des élèves est rechargée depuis le serveur. */
  onImported: () => void;
}

const badge: Record<string, string> = {
  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CREE: 'bg-emerald-600 text-white border-emerald-600',
  ERREUR: 'bg-red-50 text-red-700 border-red-200',
};

export function ExcelImportTab({ onImported }: Props) {
  const { step, nomFichier, rapport, erreur, chargement, handleFileUpload, executeImport, recommencer,
    downloadTemplate, telechargerIdentifiants } = useExcelImport(onImported);

  return (
    <div className="space-y-4 text-xs font-bold text-neutral-600" id="excel-import-tab">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2 gap-2 flex-wrap">
        <div>
          <h4 className="font-extrabold text-[#1E293B] text-sm">Importer des élèves (CSV)</h4>
          <p className="text-[10px] text-neutral-400 font-semibold">Colonnes : {COLONNES}. Chaque élève reçoit un mot de passe provisoire.</p>
        </div>
        <button onClick={downloadTemplate} className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase text-[9px] tracking-wider rounded-lg flex items-center gap-1 transition-all">
          <span translate="no" className="material-symbols-outlined text-xs">download</span>
          <span>Modèle CSV</span>
        </button>
      </div>

      {erreur && <div role="alert" className="bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-xl text-[11px]">{erreur}</div>}

      {step === 1 && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-neutral-200 py-10 rounded-2xl hover:bg-neutral-50/50 transition-colors text-center flex flex-col items-center justify-center space-y-2"
        >
          <span translate="no" className="material-symbols-outlined text-3xl text-neutral-300">cloud_upload</span>
          <p className="text-xs font-bold text-[#1E293B]">{chargement ? `Vérification de « ${nomFichier} »…` : 'Glissez-déposez le fichier CSV ici'}</p>
          <input type="file" id="csv-file-input" className="hidden" accept=".csv,.txt"
            onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); e.target.value = ''; }} />
          <label htmlFor="csv-file-input" className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-[10px] cursor-pointer font-bold inline-block">Parcourir...</label>
        </div>
      )}

      {step >= 2 && rapport && (
        <div className="space-y-3">
          {step === 3 ? (
            <div role="status" className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-xl text-[11px]">
              {rapport.crees} élève{rapport.crees > 1 ? 's' : ''} importé{rapport.crees > 1 ? 's' : ''} depuis « {nomFichier} ».
              Téléchargez leurs identifiants maintenant : les mots de passe provisoires ne seront plus affichés.
            </div>
          ) : rapport.valide ? (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-xl text-[11px]">
              « {nomFichier} » vérifié : {rapport.lignes.length} élève{rapport.lignes.length > 1 ? 's' : ''} prêt{rapport.lignes.length > 1 ? 's' : ''} à importer, aucune erreur.
            </div>
          ) : (
            <div role="alert" className="bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-xl text-[11px]">
              {rapport.erreurs} ligne{rapport.erreurs > 1 ? 's' : ''} sur {rapport.lignes.length} à corriger dans « {nomFichier} ».
              Rien ne sera importé tant qu'il reste une erreur : corrigez le fichier puis déposez-le à nouveau.
            </div>
          )}
          <div className="overflow-x-auto border border-neutral-200 rounded-xl max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-[10px]" id="rapport-import">
              <thead>
                <tr className="bg-[#FAF8F6] text-neutral-400 border-b border-neutral-200 uppercase font-black text-[8px]">
                  <th className="px-3 py-1.5">Ligne</th>
                  <th className="px-3 py-1.5">Nom</th>
                  <th className="px-3 py-1.5">Email</th>
                  <th className="px-3 py-1.5">Classe</th>
                  <th className="px-3 py-1.5">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-bold text-neutral-700 bg-white">
                {rapport.lignes.map(r => (
                  <tr key={r.ligne} data-ligne={r.ligne} className={r.statut === 'ERREUR' ? 'bg-red-50/40' : ''}>
                    <td className="px-3 py-1.5 text-neutral-400">{r.ligne}</td>
                    <td className="px-3 py-1.5 text-neutral-800">{r.nom ?? '—'}</td>
                    <td className="px-3 py-1.5 text-neutral-500 font-normal">{r.email ?? '—'}</td>
                    <td className="px-3 py-1.5 text-neutral-600">{r.classe ?? '—'}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase ${badge[r.statut]}`}>
                        {r.statut === 'CREE' ? 'Importé' : r.statut === 'OK' ? 'Prêt' : 'Erreur'}
                      </span>
                      {r.erreurs.length > 0 && <p className="text-red-700 font-semibold mt-0.5">{r.erreurs.join(' ; ')}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 flex-wrap">
            <button onClick={recommencer} className="px-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-500 hover:bg-neutral-50 uppercase tracking-wider text-[9px] font-black">
              {step === 3 ? 'Nouvel import' : 'Choisir un autre fichier'}
            </button>
            {step === 3 ? (
              <button onClick={telechargerIdentifiants} id="telecharger-identifiants" className="px-4 py-1.5 bg-primary text-white rounded-lg uppercase tracking-wider text-[9px] font-black">
                Télécharger les identifiants (CSV)
              </button>
            ) : (
              <button onClick={() => void executeImport()} disabled={!rapport.valide || chargement} id="importer-eleves"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg uppercase tracking-wider text-[9px] font-black disabled:opacity-40 disabled:cursor-not-allowed">
                {chargement ? 'Import en cours…' : `Importer ${rapport.lignes.length} élève${rapport.lignes.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

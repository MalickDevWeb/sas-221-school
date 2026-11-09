import React from 'react';
import { Student } from '../../../../domain/StudentModels';
import { PROFIL_VIDE } from './utils/profilVide';

interface Props {
  selectedStudent: Student;
  erpData?: any;
}

/** Parcours académique : uniquement les données du dossier 360 renvoyé par le serveur (aucun historique inventé). */
export function TabAcademic({ selectedStudent, erpData }: Props) {
  const finalErpData = (erpData || PROFIL_VIDE) as any;
  const ueList: any[] = Array.isArray(finalErpData.ueList) ? finalErpData.ueList : [];
  const academic = finalErpData.academic ?? {};
  const valeur = (v: any) => (v === undefined || v === null || v === '' ? '—' : String(v));

  return (
    <div className="space-y-4 text-xs font-semibold text-neutral-600" id="tab-academic">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-neutral-200/60 p-3.5 rounded-2xl bg-neutral-50/50">
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Année Académique</p>
          <p className="text-neutral-800 font-extrabold text-sm mt-0.5">{valeur(academic.annee ?? academic.year)}</p>
        </div>
        <div className="border border-neutral-200/60 p-3.5 rounded-2xl bg-neutral-50/50">
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Moyenne Générale</p>
          <p className="text-primary font-black text-sm mt-0.5">{valeur(academic.moyenne ?? (selectedStudent.gpa !== '—' ? selectedStudent.gpa : null))}</p>
        </div>
        <div className="border border-neutral-200/60 p-3.5 rounded-2xl bg-neutral-50/50">
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Crédits ECTS validés</p>
          <p className="text-emerald-700 font-black text-sm mt-0.5">{valeur(academic.ects)}</p>
        </div>
      </div>

      <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white">
        <div className="bg-neutral-50 border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
          <h4 className="font-extrabold text-[#1E293B] text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-sm text-primary">view_list</span>
            Programme d'Études & Unités d'Enseignement
          </h4>
        </div>

        {ueList.length === 0 ? (
          <p className="p-6 text-center text-neutral-400 font-bold m-0">Aucune donnée disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 text-[10px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  <th className="p-3 font-bold">Unité d'Enseignement (UE)</th>
                  <th className="p-3 font-bold">Volume Horaire</th>
                  <th className="p-3 font-bold">Professeur</th>
                  <th className="p-3 font-bold text-center">Validation</th>
                </tr>
              </thead>
              <tbody>
                {ueList.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors text-[11px]">
                    <td className="p-3">
                      <p className="font-extrabold text-[#1E293B]">{valeur(item.module)}</p>
                      <p className="text-[10px] text-neutral-400 font-bold">
                        {valeur(item.ue)}{item.coefficient != null ? ` (Coef. ${item.coefficient})` : ''}
                      </p>
                    </td>
                    <td className="p-3 font-bold text-neutral-600">{valeur(item.volumeHoraire ?? item.hours)}</td>
                    <td className="p-3 font-bold text-neutral-800">{valeur(item.teacher)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-lg bg-neutral-50 text-neutral-700 text-[10px] font-extrabold">
                        {valeur(item.validation ?? item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { StudentFinance } from '../../../domain/FinancesModels';
import { classeAffichee } from './ecolagesClasses';

interface Props {
  students: StudentFinance[];
  onEncaisser: (s: StudentFinance) => void;
}

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

export function MobileEcolagesCards({ students, onEncaisser }: Props) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 font-extrabold text-[10px] uppercase">
        Aucun dossier pour ce filtre
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans" id="mobile-ecolages-cards">
      {students.map((s) => (
        <div key={s.id} className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50 flex flex-col gap-2 shadow-2xs w-full">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-extrabold text-[#1E293B] text-xs">{s.name}</div>
              <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">{classeAffichee(s)}</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
              s.status === 'En Règle' ? 'bg-emerald-50 text-emerald-700' :
              s.status === 'En Avance' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {s.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] border-t border-neutral-100 pt-2">
            <div>
              <span className="text-neutral-400 font-bold uppercase text-[8px] block">Payé / dû</span>
              <span className="font-mono text-[#1E293B] font-extrabold">{fcfa(s.paid)} / {fcfa(s.totalRequired)}</span>
            </div>
            {s.debt > 0 && (
              <div className="text-right">
                <span className="text-neutral-400 font-bold uppercase text-[8px] block">Reste à payer</span>
                <span className="font-mono text-rose-600 font-black">{fcfa(s.debt)}</span>
              </div>
            )}
          </div>
          <button type="button" onClick={() => onEncaisser(s)}
            className="w-full py-2 rounded-lg bg-primary/10 text-primary text-[11px] font-black">Encaisser un paiement</button>
        </div>
      ))}
    </div>
  );
}

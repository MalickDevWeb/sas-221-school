import React from 'react';

export interface TooltipPayloadItem {
  dataKey: string;
  color: string;
  value: number | null;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const LIBELLES: Record<string, string> = { note: 'Votre moyenne', moyenneClasse: 'Moyenne de la classe', presence: 'Présence' };

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#291715] text-white p-3 md:p-4 rounded-2xl shadow-xl border border-white/10 text-xs font-semibold space-y-2 min-w-[150px] select-none">
      <p className="font-extrabold text-white/50 border-b border-white/10 pb-1.5 mb-1.5 uppercase tracking-widest text-[9px]">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {LIBELLES[entry.dataKey] ?? entry.dataKey}
          </span>
          <span className="font-black text-white text-right">
            {entry.value == null ? '—' : `${entry.value}${entry.dataKey === 'presence' ? ' %' : ' / 20'}`}
          </span>
        </div>
      ))}
    </div>
  );
};

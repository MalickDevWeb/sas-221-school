import React from 'react';

interface Props {
  totalCount: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  absentCount: number;
  rate: number;
}

export const AttendanceStatsCard: React.FC<Props> = ({
  totalCount,
  presentCount,
  onTimeCount,
  lateCount,
  absentCount,
  rate,
}) => (
  <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center space-y-4">
    <div className="space-y-1">
      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
        Taux de Présence
      </span>
      <span className="text-[9px] text-neutral-500 font-semibold">Aujourd'hui sur site</span>
    </div>

    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-neutral-200"
          strokeWidth="3.2"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-primary transition-all duration-700"
          strokeDasharray={`${rate}, 100`}
          strokeWidth="3.2"
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-[#1E293B]">{rate}%</span>
        <span className="text-[9px] uppercase font-bold text-primary tracking-widest">
          {presentCount}/{totalCount} Présents
        </span>
      </div>
    </div>

    <div className="w-full space-y-1.5 pt-2 border-t border-neutral-200/80 text-[10px] text-left">
      <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-neutral-200/60">
        <span className="text-emerald-700 font-black flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> À l'heure
        </span>
        <strong className="text-neutral-800 font-black">{onTimeCount}</strong>
      </div>

      <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-neutral-200/60">
        <span className="text-amber-700 font-black flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> En retard
        </span>
        <strong className="text-neutral-800 font-black">{lateCount}</strong>
      </div>

      <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-neutral-200/60">
        <span className="text-rose-700 font-black flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absents
        </span>
        <strong className="text-neutral-800 font-black">{absentCount}</strong>
      </div>
    </div>

    <p className="text-[9px] text-neutral-400 font-medium leading-normal">
      Le pointage s'effectue automatiquement via QR Code vigile ou manuellement depuis ce panneau.
    </p>
  </div>
);


import React from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarPlus, Download } from 'lucide-react';
import { Icon } from '@iconify/react';
import { exportToICS } from '@/features/schedule/utils/icalExport';
import { mapProfessorScheduleToCourseSession } from '../../utils/professorScheduleMapper';
import type { ProfessorSchedule } from '../../domain/ProfessorModels';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly schedule: readonly ProfessorSchedule[];
  readonly triggerToast: (msg: string) => void;
}

/**
 * Export de l'agenda du professeur. APP-TL-26 : seul l'export .ics existe (aucune connexion à un compte Google).
 */

export function ProfessorSyncModal({
  isOpen,
  onClose,
  schedule,
  triggerToast,
}: Props) {
  if (!isOpen) return null;
  const mapped = schedule.map(mapProfessorScheduleToCourseSession).filter((c): c is NonNullable<typeof c> => c !== null);

  return createPortal(
    <div 
      className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-neutral-200/60 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-primary text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full border-0 bg-transparent cursor-pointer"><X className="h-5 w-5" /></button>
          <div className="text-[9px] font-black uppercase tracking-widest text-white/80 mb-1">Export iCal (.ics)</div>
          <h4 className="text-xl font-black tracking-tight">Exporter mon agenda</h4>
        </div>
        <div className="p-6 space-y-6 bg-[#FAF8F6] overflow-y-auto">
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-3xs space-y-4">
            <div className="flex gap-3">
              <Download className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h5 className="font-extrabold text-sm text-[#291715]">Exporter mon planning en fichier .ics</h5>
                <p className="text-xs text-secondary mt-1">Téléchargez un fichier iCalendar compatible avec Google Calendar, Outlook et Apple Calendar.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex justify-end">
              <button onClick={() => { exportToICS(mapped, 'Enseignant'); triggerToast("Fichier .ics téléchargé avec succès !"); onClose(); }} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs uppercase cursor-pointer border-0 flex items-center gap-2 shadow-sm shadow-[#B3181C]/10">
                <Download className="h-4 w-4" /> Télécharger mon planning (.ics)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

import React from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { CalendarWidget } from './CalendarWidget';

interface MobileCalendarModalProps {
  setShowMobileCalendarModal: (show: boolean) => void;
}

export function MobileCalendarModal({ setShowMobileCalendarModal }: MobileCalendarModalProps) {
  const { currentTenant } = useTenantStore();

  return (
    <div className="fixed inset-0 bg-[#291715]/65 backdrop-blur-md z-[300] flex items-center justify-center p-2 animate-fade-in">
      <div className="fixed inset-0 cursor-pointer" onClick={() => setShowMobileCalendarModal(false)} />
      <div className="bg-[#FAF8F6] rounded-[32px] shadow-[0_24px_64px_rgba(41,23,21,0.25)] border border-[#E2DCDA] w-full max-w-[500px] max-h-[92vh] overflow-y-auto relative z-10 p-5 animate-scale-up flex flex-col no-scrollbar" style={{ margin: '6px 13px' }}>
        <div className="flex justify-between items-center mb-4 pb-3.5 border-b border-[#E2DCDA]/80 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-primary text-text-on-primary rounded-xl shadow-md shadow-primary/15 flex items-center justify-center"><span translate="no" className="material-symbols-outlined text-[20px] font-bold">calendar_month</span></div>
            <div><h3 className="font-heading font-black text-xs uppercase text-[#291715] tracking-widest">Calendrier Académique</h3><p className="text-[9px] text-[#8E7977] font-black uppercase leading-none mt-1">{currentTenant?.name?.toUpperCase() || 'ÉCOLE 221'} · ESPACE INTERACTIF</p></div>
          </div>
          <button onClick={() => setShowMobileCalendarModal(false)} className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-primary/5">Fermer</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar pr-0.5">
          <CalendarWidget variant="transparent" />
        </div>
      </div>
    </div>
  );
}

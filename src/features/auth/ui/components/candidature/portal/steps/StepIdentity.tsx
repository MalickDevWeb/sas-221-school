import React from 'react';
import { motion } from 'motion/react';
import { PersonalDetails } from '../admissionsTypes';

interface Props {
  personal: PersonalDetails;
  setPersonal: React.Dispatch<React.SetStateAction<PersonalDetails>>;
  onNext: () => void;
}

export function StepIdentity({ personal, setPersonal, onNext }: Props) {
  const isComplete = personal.firstName && personal.lastName && personal.phone && personal.email && personal.cniNumber;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">1. Identité & État Civil</h3>
        <p className="text-xs text-neutral-500 font-medium">Informations officielles figurant sur votre pièce d'identité nationale ou passeport.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Prénom(s) *</label>
          <input required type="text" placeholder="Ex: Moussa" value={personal.firstName} onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Nom de famille *</label>
          <input required type="text" placeholder="Ex: Diop" value={personal.lastName} onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Genre</label>
          <div className="flex gap-2">
            {(['M', 'F'] as const).map(g => (
              <button key={g} type="button" onClick={() => setPersonal(p => ({ ...p, gender: g }))} className={`flex-1 h-11 rounded-xl text-xs font-black transition-all border ${personal.gender === g ? 'bg-primary text-white border-primary shadow-xs' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}>
                {g === 'M' ? 'Masculin' : 'Féminin'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Date de naissance</label>
          <input type="date" value={personal.birthDate} onChange={e => setPersonal(p => ({ ...p, birthDate: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Lieu de naissance</label>
          <input type="text" placeholder="Ex: Dakar" value={personal.birthPlace} onChange={e => setPersonal(p => ({ ...p, birthPlace: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Téléphone & WhatsApp *</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-emerald-600 text-[11px] font-extrabold">🇸🇳 +221</span>
            <input required type="tel" placeholder="77 123 45 67" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} className="w-full h-11 pl-18 pr-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Email personnel *</label>
          <input required type="email" placeholder="moussa.diop@gmail.com" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">N° CNI (NIN) ou Passeport *</label>
          <input required type="text" placeholder="Ex: 1 751 2005 02841" value={personal.cniNumber} onChange={e => setPersonal(p => ({ ...p, cniNumber: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold font-mono text-neutral-800 outline-none" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Ville & Quartier de résidence</label>
          <input type="text" placeholder="Ex: Sacré-Cœur 3, Dakar" value={personal.address} onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none" />
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-end">
        <button disabled={!isComplete} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Tuteur / Garant</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}


import React from 'react';
import { motion } from 'motion/react';
import { GuardianDetails } from '../admissionsTypes';

interface Props {
  guardian: GuardianDetails;
  setGuardian: React.Dispatch<React.SetStateAction<GuardianDetails>>;
  onNext: () => void;
  onPrev: () => void;
}

export function StepGuardian({ guardian, setGuardian, onNext, onPrev }: Props) {
  const relations = ['Père', 'Mère', 'Tuteur Légal', 'Autre'] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">2. Tuteur Légal & Contact d'Urgence</h3>
        <p className="text-xs text-neutral-500 font-medium">Personne à contacter pour le suivi administratif et financier du dossier.</p>
      </div>

      <div>
        <label className="text-[11px] font-bold text-neutral-700 block mb-1.5">Lien de parenté / Relation *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {relations.map(rel => (
            <button key={rel} type="button" onClick={() => setGuardian(g => ({ ...g, relationship: rel }))} className={`h-10 rounded-xl text-xs font-black transition-all border ${guardian.relationship === rel ? 'bg-primary text-white border-primary shadow-xs' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}>
              {rel}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Nom complet du garant *</label>
          <input required type="text" placeholder="Ex: El Hadji Babacar Diop" value={guardian.fullName} onChange={e => setGuardian(g => ({ ...g, fullName: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Profession / Activité</label>
          <input type="text" placeholder="Ex: Cadre banquier / Enseignant" value={guardian.profession} onChange={e => setGuardian(g => ({ ...g, profession: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Téléphone portable du garant *</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-emerald-600 text-[11px] font-extrabold">🇸🇳 +221</span>
            <input required type="tel" placeholder="77 654 32 10" value={guardian.phone} onChange={e => setGuardian(g => ({ ...g, phone: e.target.value }))} className="w-full h-11 pl-18 pr-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Email du garant</label>
          <input type="email" placeholder="tuteur@domaine.sn" value={guardian.email} onChange={e => setGuardian(g => ({ ...g, email: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
      </div>

      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2.5 text-neutral-600 text-[11px]">
        <span translate="no" className="material-symbols-outlined text-primary text-base">info</span>
        <span>Le garant recevra une copie numérique de la lettre d'admission et des convocations aux entretiens.</span>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={!guardian.fullName || !guardian.phone} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Parcours Académique</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}


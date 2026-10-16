import React from 'react';
import { motion } from 'motion/react';
import { AcademicDetails } from '../admissionsTypes';

interface Props {
  academic: AcademicDetails;
  setAcademic: React.Dispatch<React.SetStateAction<AcademicDetails>>;
  onNext: () => void;
  onPrev: () => void;
}

export function StepAcademic({ academic, setAcademic, onNext, onPrev }: Props) {
  const bacSeriesOptions = ['S1', 'S2', 'S3', "L'", 'L1', 'L2', 'G', 'STEG', 'T1', 'T2'];
  const mentions = ['Passable', 'Assez Bien', 'Bien', 'Très Bien'];
  const filieres = [
    'Licence Génie Logiciel, Web & Mobile',
    'Licence Cloud Computing & DevOps',
    'Licence Réseaux Télécoms & Cybersécurité',
    'Master Intelligence Artificielle & Data Science',
    'Master Cybersécurité & Cloud Défense'
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">3. Parcours Scolaire & Choix de Filière</h3>
        <p className="text-xs text-neutral-500 font-medium">Diplôme d'entrée et orientation universitaire souhaitée pour la rentrée 2026/2027.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Dernier établissement fréquenté *</label>
          <input required type="text" placeholder="Ex: Lycée Lamine Guèye / Faculté FST" value={academic.previousSchool} onChange={e => setAcademic(a => ({ ...a, previousSchool: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Année d'obtention du Bac / Diplôme</label>
          <select value={academic.bacYear} onChange={e => setAcademic(a => ({ ...a, bacYear: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none">
            {['2026', '2025', '2024', '2023', '2022 ou antérieur'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Série du Baccalauréat</label>
          <select value={academic.bacSeries} onChange={e => setAcademic(a => ({ ...a, bacSeries: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none">
            {bacSeriesOptions.map(s => <option key={s} value={s}>Série {s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Mention obtenue</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {mentions.map(m => (
              <button key={m} type="button" onClick={() => setAcademic(a => ({ ...a, bacMention: m }))} className={`h-11 rounded-xl text-[11px] font-bold transition-all border ${academic.bacMention === m ? 'bg-primary text-white border-primary shadow-xs' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Filière / Spécialisation souhaitée *</label>
          <select value={academic.targetFiliere} onChange={e => setAcademic(a => ({ ...a, targetFiliere: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-bold text-neutral-800 outline-none">
            {filieres.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-neutral-700 block mb-1">Niveau d'entrée sollicité</label>
            <select value={academic.targetLevel} onChange={e => setAcademic(a => ({ ...a, targetLevel: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none">
              {['Licence 1 (Post-Bac)', 'Licence 2 (Passerelle)', 'Licence 3 (Diplôme Pro)', 'Master 1', 'Master 2'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-neutral-700 block mb-1">Session de rentrée</label>
            <select value={academic.intakeSession} onChange={e => setAcademic(a => ({ ...a, intakeSession: e.target.value }))} className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none">
              <option value="Octobre 2026">Rentrée Principale - Octobre 2026</option>
              <option value="Février 2027">Rentrée Décalée - Février 2027</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={!academic.previousSchool} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Pièces Justificatives</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}

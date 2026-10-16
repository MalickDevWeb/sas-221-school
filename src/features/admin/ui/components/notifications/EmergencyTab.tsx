import React, { useState } from 'react';
import { EmergencyConfirmModal } from './EmergencyConfirmModal';

interface Props {
  onTriggerEmergency: (type: string, instructions: string, target: string) => void;
}

const EMERGENCY_TYPES = [
  { type: 'Incident Majeur', label: '🛑 Incident Majeur & Évacuation', desc: 'Danger immédiat ou intrusion sur campus' },
  { type: 'Alerte Météo', label: '🌧️ Alerte Météo & Inondation', desc: 'Suspension des cours et fermeture campus' },
  { type: 'Réunion d\'Urgence', label: '📅 Convocation d\'Urgence administrative', desc: 'Cellule de crise, conseil de discipline extraordinaire' },
  { type: 'Alerte Sanitaire', label: '🩺 Protocole Sanitaire Renforcé', desc: 'Directives de précaution médicale ou confinement' },
];

export function EmergencyTab({ onTriggerEmergency }: Props) {
  const [selectedType, setSelectedType] = useState('Incident Majeur');
  const [target, setTarget] = useState("Toute l'école");
  const [instructions, setInstructions] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = () => {
    setIsModalOpen(false);
    onTriggerEmergency(selectedType, instructions, target);
  };

  return (
    <div className="bg-red-50/40 border border-red-200 rounded-2xl p-4 sm:p-6 text-xs text-[#4A5568] space-y-6 shadow-xs" id="emergency-tab">
      <div className="flex items-center justify-between pb-3 border-b border-red-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span translate="no" className="material-symbols-outlined text-red-600 text-3xl font-black animate-pulse">campaign</span>
          <div>
            <h3 className="font-extrabold text-sm text-red-950">🚨 Module de Diffusion d'Urgence SMS & Push</h3>
            <p className="text-[10px] text-red-700 font-bold">Ce canal force la priorité maximale et contourne les restrictions horaires.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase rounded-lg border border-red-200">
          Priorité Écarlate
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase text-red-900 tracking-wider">1. Nature de l'Incident</span>
          <div className="space-y-2">
            {EMERGENCY_TYPES.map(item => (
              <label key={item.type} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all active:scale-[0.99] ${selectedType === item.type ? 'bg-red-100/90 border-red-400 text-red-950 shadow-xs' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                <input type="radio" name="emergency-type" checked={selectedType === item.type} onChange={() => setSelectedType(item.type)} className="mt-0.5 w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer" />
                <div>
                  <div className="font-extrabold text-xs">{item.label}</div>
                  <div className="text-[10px] text-neutral-500 font-normal">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase text-red-900 tracking-wider">2. Cible & Consignes Spécifiques</span>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-500 font-bold uppercase">Audience Visée</label>
              <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 bg-white rounded-xl text-neutral-800 font-bold focus:outline-none">
                <option value="Toute l'école">Toute la communauté (Élèves, Parents, Profs, Staff)</option>
                <option value="Tuteurs & Parents">Tuteurs & Parents d'élèves en priorité</option>
                <option value="Corps Enseignant & Personnel">Corps Enseignant & Administration uniquement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-neutral-500 font-bold uppercase">Message / Instructions d'Urgence (Optionnel)</label>
              <textarea rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ex: Rassemblement immédiat sur le terrain de sport. Ne pas emprunter les escaliers B..." className="w-full px-3 py-2 border border-neutral-300 bg-white rounded-xl text-neutral-800 placeholder:text-neutral-400 text-xs focus:outline-none" />
            </div>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-neutral-600 font-bold">
              <span>Canaux prioritaires mobilisés :</span>
              <span className="text-red-700 font-extrabold">SMS + Push + Flash</span>
            </div>
            <button type="button" onClick={() => setIsModalOpen(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl uppercase tracking-wider text-xs font-black transition-transform active:scale-97 cursor-pointer shadow-md shadow-red-500/25 flex items-center justify-center gap-2">
              <span translate="no" className="material-symbols-outlined text-base">emergency</span>
              <span>Déclencher le Protocole d'Urgence</span>
            </button>
          </div>
        </div>
      </div>

      <EmergencyConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} selectedType={selectedType} instructions={instructions} target={target} />
    </div>
  );
}

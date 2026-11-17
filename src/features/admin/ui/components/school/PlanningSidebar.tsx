import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Room } from '../../../domain/SchoolModels';
import { useSchoolProfessors } from './useSchoolProfessors';
import { ProfesseurRapideModal } from './ProfesseurRapideModal';
import { MotDePasseProvisoireModal } from '../MotDePasseProvisoireModal';

interface Props {
  rooms: Room[];
}

/*
 * Pas d'onglet « Classes » : une classe déposée sur la grille deviendrait l'enseignant du cours ; la classe se
 * choisit dans la liste « Classe » au-dessus de la grille.
 */
export function PlanningSidebar({ rooms }: Props) {
  const [activeTab, setActiveTab] = useState<'teachers' | 'rooms'>('teachers');
  
  // Enseignants RÉELS de l'école. Liste vide → message explicite.
  const { professors: teachers, loading: chargementProfs, error: erreurProfs } = useSchoolProfessors();
  // Un professeur se crée ici même
  const [creationProf, setCreationProf] = useState(false);
  const [motDePasse, setMotDePasse] = useState<{ nom: string; email: string; motDePasse: string; id: string; telephone?: string } | null>(null);
  const boutonCreerProf = useRef<HTMLButtonElement>(null);
  const fermerCreationProf = () => { setCreationProf(false); boutonCreerProf.current?.focus(); };

  const handleDragStart = (e: React.DragEvent, type: 'teacher' | 'room', name: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, name }));
  };

  return (
    <div className="w-64 bg-white border border-[#E2DCDA] rounded-2xl p-4 flex flex-col gap-3 shadow-sm shrink-0" id="planning-sidebar">
      <div className="flex border-b border-neutral-100 pb-1 overflow-x-auto gap-1">
        {(['teachers', 'rooms'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-2 text-[10px] font-black uppercase text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-neutral-400'
            }`}
          >
            {tab === 'teachers' ? 'Profs' : 'Salles'}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-neutral-400 font-bold leading-tight">
        Glissez un professeur ou une salle sur une case : sur une case libre, un cours est créé ; sur un cours, il remplace son professeur ou sa salle.
      </p>

      {activeTab === 'teachers' && (
        <button ref={boutonCreerProf} type="button" id="planning-creer-professeur" onClick={() => setCreationProf(true)}
          aria-haspopup="dialog"
          className="w-full p-2.5 rounded-xl border border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">person_add</span>
          Nouveau professeur
        </button>
      )}

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1">
        {activeTab === 'teachers' && chargementProfs && (
          <p className="text-[10px] text-neutral-400 font-semibold">Chargement des enseignants…</p>
        )}
        {activeTab === 'teachers' && erreurProfs && (
          <p role="alert" className="text-[10px] text-red-600 font-semibold">{erreurProfs}</p>
        )}
        {activeTab === 'teachers' && !chargementProfs && !erreurProfs && teachers.length === 0 && (
          <p className="text-[10px] text-neutral-500 font-semibold leading-snug">
            Aucun enseignant dans l'école pour l'instant : créez-en un avec « Nouveau professeur », puis glissez-le sur la grille.
          </p>
        )}
        {activeTab === 'teachers' &&
          teachers.map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => handleDragStart(e, 'teacher', t.name)}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 rounded-xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-2"
            >
              <span translate="no" className="material-symbols-outlined text-neutral-400 text-md">school</span>
              <div>
                <h5 className="text-[11px] font-black text-neutral-800">{t.name}</h5>
                {t.email && <span className="text-[9px] text-primary font-semibold">{t.email}</span>}
              </div>
            </div>
          ))}

        {activeTab === 'rooms' &&
          rooms.map((r) => (
            <div
              key={r.id}
              draggable
              onDragStart={(e) => handleDragStart(e, 'room', r.name)}
              className="p-3 bg-neutral-50 hover:bg-primary/5 border border-neutral-200/60 rounded-xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-2"
            >
              <span translate="no" className="material-symbols-outlined text-neutral-400 text-md">meeting_room</span>
              <div>
                <h5 className="text-[11px] font-black text-neutral-800">{r.name}</h5>
                <span className="text-[9px] text-emerald-600 font-bold font-mono">Capacité: {r.capacity}</span>
              </div>
            </div>
          ))}
      </div>

      {creationProf && (
        <ProfesseurRapideModal
          onFermer={fermerCreationProf}
          onCree={({ member, motDePasseProvisoire }) => {
            const nom = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
            setCreationProf(false);
            toast.success(`${nom || 'Le professeur'} est ajouté : glissez-le sur une case de la grille.`);
            if (motDePasseProvisoire) setMotDePasse({ nom, email: member.email, motDePasse: motDePasseProvisoire, id: member.id, telephone: member.phone });
            else boutonCreerProf.current?.focus();
          }}
        />
      )}
      {motDePasse && (
        <MotDePasseProvisoireModal
          nom={motDePasse.nom}
          identifiant={motDePasse.email}
          motDePasse={motDePasse.motDePasse}
          onClose={() => { setMotDePasse(null); boutonCreerProf.current?.focus(); }}
          envoiAcces={{ id: motDePasse.id, nom: motDePasse.nom, telephone: motDePasse.telephone, email: motDePasse.email }}
        />
      )}
    </div>
  );
}

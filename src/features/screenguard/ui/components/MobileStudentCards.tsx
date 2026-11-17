import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/design-system/components/Button';

interface Student {
  id: string;
  matricule: string;
  name: string;
  email: string;
  classe: string;
  qrStatus: string;
}

interface Props {
  students: Student[];
  onToggleQr: (id: string) => void;
  onViewProfile: (student: Student) => void;
  /** École sans élève : bouton « Inscrire un élève » sous le message. */
  onInscrire?: () => void;
}

export function MobileStudentCards({ students, onToggleQr, onViewProfile, onInscrire }: Props) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    (s) =>
      s.matricule.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="mobile-student-cards" className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          aria-label="Rechercher un élève"
          placeholder="Rechercher par nom ou matricule…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#B3181C] focus:outline-none shadow-xs"
        />
      </div>

      {/* Grid of Cards */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((student) => {
            const isAuthorized = student.qrStatus === 'AUTORISÉ';

            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center border border-slate-200 text-xs">
                      {student.name[0]}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{student.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{student.email}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono uppercase">
                    {student.matricule}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-extrabold pt-2 border-t border-slate-50">
                  <span className="text-slate-500">{student.classe}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleQr(student.id)}
                      className={`px-2 py-0.5 rounded-md text-[8px] uppercase cursor-pointer flex items-center gap-0.5 font-black ${
                        isAuthorized ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {isAuthorized ? <ShieldCheck className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                      {student.qrStatus}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onViewProfile(student)}
                  className="w-full mt-1.5 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Fiche Profil 360°
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          // Message juste selon le cas
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              {students.length === 0 ? "Aucun élève pour l'instant." : 'Aucun élève ne correspond à votre recherche.'}
            </p>
            {students.length === 0 ? onInscrire && (
              <Button onClick={onInscrire}>
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">person_add</span>
                Inscrire un élève
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setSearch('')}>Effacer la recherche</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';

interface Teacher {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
}

interface Room {
  id: string;
  name: string;
  capacity?: number;
}

interface ExamPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export function SchedulerSection() {
  const [exams] = useState<ExamPeriod[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Conflict detection state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsRes, usersRes] = await Promise.allSettled([
          apiClient.get<Room[]>('/admin/planning/rooms'),
          apiClient.get<{ professors?: any[] }>('/admin/users')
        ]);

        if (roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value.data)) {
          setRooms(roomsRes.value.data);
        }
        if (usersRes.status === 'fulfilled' && usersRes.value.data?.professors) {
          setTeachers(usersRes.value.data.professors.map((p: any) => ({
            id: p.id,
            name: p.name || p.email,
            specialty: p.specialite || 'Enseignant',
            email: p.email
          })));
        }
      } catch (err) {
        console.error('Erreur chargement données de planification:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Aucun service serveur n'enregistre une affectation enseignant ↔ salle hors créneau, ni ne détecte
  // les conflits (les séances ne portent pas l'enseignant) : rien n'est simulé ici.
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold" id="scheduler-section">
      {/* Affectations & Conflits */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100/80 space-y-3">
        <h4 className="font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-sm">assignment_ind</span> Affectation Professeurs & Salles
        </h4>
        <form onSubmit={handleAssign} className="space-y-3">
          <div>
            <label className="text-[10px] text-neutral-400 font-bold uppercase">Sélectionner un Enseignant</label>
            <select value={selectedTeacher} onChange={e => { setSelectedTeacher(e.target.value); }} className="w-full mt-1 p-1.5 border border-neutral-200 bg-white rounded-lg font-bold">
              <option value="">-- Choisir un enseignant --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} {t.specialty ? `(${t.specialty})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 font-bold uppercase">Sélectionner une Salle de Cours</label>
            <select value={selectedRoom} onChange={e => { setSelectedRoom(e.target.value); }} className="w-full mt-1 p-1.5 border border-neutral-200 bg-white rounded-lg font-bold">
              <option value="">-- Choisir une salle --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} {r.capacity ? `(Capacité ${r.capacity})` : ''}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled aria-disabled="true" className="w-full py-2 bg-neutral-300 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-xl cursor-not-allowed">
            Vérifier & Affecter
          </button>
          <p className="text-[10px] text-neutral-400 font-semibold">
            Fonctionnalité non disponible : aucune source de données (le serveur n'enregistre pas d'affectation enseignant ↔ salle hors créneau et ne calcule pas les conflits). Planifiez les séances depuis l'emploi du temps.
          </p>
        </form>
      </div>

      {/* Calendrier des Examens */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100/80 space-y-3">
        <h4 className="font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-sm">hourglass_empty</span> Planification des Examens
        </h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
          {exams.length === 0 ? (
            <p className="text-neutral-400 text-center py-4">Aucun examen planifié.</p>
          ) : (
            exams.map(ex => (
              <div key={ex.id} className="bg-white p-2.5 border border-neutral-150/60 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-extrabold text-neutral-800">{ex.title}</p>
                  <p className="text-[9px] text-neutral-400 font-bold">Du {ex.startDate} au {ex.endDate}</p>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[8px] font-black uppercase">Planifié</span>
              </div>
            ))
          )}
        </div>
        <button type="button" disabled aria-disabled="true" className="w-full py-1.5 bg-neutral-300 text-white font-extrabold uppercase text-[10px] rounded-lg cursor-not-allowed">Planifier l'examen</button>
        <p className="text-[10px] text-neutral-400 font-semibold">Fonctionnalité non disponible : aucune source de données (aucun service d'examens côté serveur).</p>
      </div>
    </div>
  );
}

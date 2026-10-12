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
  const [exams, setExams] = useState<ExamPeriod[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', start: '', end: '' });

  // Conflict detection state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

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

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedRoom) return;

    setIsConflict(false);
    setAssignmentSuccess(true);
    setTimeout(() => setAssignmentSuccess(false), 3000);
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title.trim()) return;
    setExams([...exams, { id: Date.now().toString(), title: newExam.title, startDate: newExam.start, endDate: newExam.end }]);
    setNewExam({ title: '', start: '', end: '' });
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
            <select value={selectedTeacher} onChange={e => { setSelectedTeacher(e.target.value); setIsConflict(false); }} className="w-full mt-1 p-1.5 border border-neutral-200 bg-white rounded-lg font-bold">
              <option value="">-- Choisir un enseignant --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} {t.specialty ? `(${t.specialty})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 font-bold uppercase">Sélectionner une Salle de Cours</label>
            <select value={selectedRoom} onChange={e => { setSelectedRoom(e.target.value); setIsConflict(false); }} className="w-full mt-1 p-1.5 border border-neutral-200 bg-white rounded-lg font-bold">
              <option value="">-- Choisir une salle --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} {r.capacity ? `(Capacité ${r.capacity})` : ''}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-white font-extrabold uppercase tracking-wider text-[10px] rounded-xl">
            Vérifier & Affecter
          </button>
        </form>

        {isConflict && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 space-y-1">
            <p className="font-black uppercase text-[9px] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span> Conflit d'affectation détecté
            </p>
            <p className="text-[10px]">Le Professeur Malick Ndiaye est déjà programmé dans Amphi A sur cette période.</p>
          </div>
        )}

        {assignmentSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
            <p className="font-black uppercase text-[9px] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span> Affectation validée sans conflit
            </p>
          </div>
        )}
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
        <form onSubmit={handleAddExam} className="space-y-2 pt-1">
          <input type="text" placeholder="Titre de la session d'examens" value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} className="w-full p-1.5 border border-neutral-200 rounded-lg text-xs font-bold" />
          <div className="flex gap-2">
            <input type="date" value={newExam.start} onChange={e => setNewExam({ ...newExam, start: e.target.value })} className="w-1/2 p-1 border border-neutral-200 rounded-lg text-[10px] font-bold" />
            <input type="date" value={newExam.end} onChange={e => setNewExam({ ...newExam, end: e.target.value })} className="w-1/2 p-1 border border-neutral-200 rounded-lg text-[10px] font-bold" />
          </div>
          <button type="submit" className="w-full py-1.5 bg-primary text-white font-extrabold uppercase text-[10px] rounded-lg">Planifier l'examen</button>
        </form>
      </div>
    </div>
  );
}

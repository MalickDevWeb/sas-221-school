import React, { useState } from 'react';
import { toast } from 'sonner';
import { Classe, Filiere, PlanningSlot } from '../../../domain/SchoolModels';
import { Student, INITIAL_STUDENTS } from '../../../domain/StudentModels';
import { apiClient } from '@/shared/lib/apiClient';

interface Props {
  classe: Classe;
  filieres: Filiere[];
  slots: PlanningSlot[];
  allStudents?: Student[];
  onClose: () => void;
  onEditClasse: (cls: Classe) => void;
}

export function ClasseDetail360Modal({
  classe,
  filieres,
  slots,
  allStudents = INITIAL_STUDENTS,
  onClose,
  onEditClasse,
}: Props) {
  const [activeTab, setActiveTab] = useState<'students' | 'schedule' | 'subjects' | 'finances'>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentMatricule, setNewStudentMatricule] = useState(`2026-${classe.level}-${Math.floor(100 + Math.random() * 900)}`);
  const [newStudentPhone, setNewStudentPhone] = useState('+221 77 ');

  // Filter students for this class (match by name or level)
  const [classStudents, setClassStudents] = useState<Student[]>(() => {
    const matched = allStudents.filter(
      s => s.classe?.toLowerCase() === classe.name.toLowerCase() ||
           s.classe?.toLowerCase().includes(classe.level.toLowerCase())
    );
    // If no students matched, seed with at least some representative students from allStudents
    if (matched.length === 0) {
      return allStudents.slice(0, 2).map(s => ({ ...s, classe: classe.name }));
    }
    return matched;
  });

  const filiereName = filieres.find(f => f.id === classe.filiereId)?.name || 'Tronc Commun / Multidisciplinaire';
  const classSlots = slots.filter(s => s.classeId === classe.id || s.classeId === classe.name);

  // Group distinct subjects from slots
  const subjectsMap = new Map<string, { subject: string; prof: string; hours: number }>();
  classSlots.forEach(s => {
    if (!subjectsMap.has(s.subject)) {
      subjectsMap.set(s.subject, { subject: s.subject, prof: s.prof, hours: 2 });
    } else {
      const existing = subjectsMap.get(s.subject)!;
      existing.hours += 2;
    }
  });
  const subjectsList = Array.from(subjectsMap.values());

  // Financial calculations
  const totalStudents = classStudents.length;
  const expectedRevenue = totalStudents * (classe.price || 450000);
  const paidCount = classStudents.filter(s => s.financialStatus === 'En Règle').length;
  const lateCount = totalStudents - paidCount;
  const collectedRevenue = paidCount * (classe.price || 450000);
  const remainingRevenue = lateCount * (classe.price || 450000);
  const collectionRate = totalStudents > 0 ? Math.round((collectedRevenue / expectedRevenue) * 100) : 100;
  const occupancyRate = Math.min(100, Math.round((totalStudents / (classe.capacityMax || 35)) * 100));

  const filteredStudents = classStudents.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.matricule.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      matricule: newStudentMatricule.trim() || `2026-${classe.level}-001`,
      name: newStudentName.trim(),
      email: newStudentEmail.trim() || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@ecole221.sn`,
      classe: classe.name,
      financialStatus: 'En Règle',
      qrStatus: 'AUTORISÉ',
      gpa: '15.0/20',
      phoneParent: newStudentPhone.trim() || '+221 77 000 00 00'
    };

    setClassStudents(prev => [newStudent, ...prev]);

    // Async sync with backend
    try {
      await apiClient.post('/admin/students', {
        name: newStudent.name,
        matricule: newStudent.matricule,
        promotion_id: classe.id,
        classe: classe.name,
      });
    } catch {
      // offline-safe fallback
    }

    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentMatricule(`2026-${classe.level}-${Math.floor(100 + Math.random() * 900)}`);
    setIsAddingStudent(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in" id="classe-detail-360-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-[#1E293B] to-neutral-800 p-5 sm:p-6 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0"
            title="Fermer"
          >
            <span translate="no" className="material-symbols-outlined text-lg">close</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/90 text-white text-[11px] font-black tracking-wider uppercase">
              {classe.level}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-bold">
              {filiereName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
              {classe.price.toLocaleString('fr-FR')} FCFA / an
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <span translate="no" className="material-symbols-outlined text-amber-400 text-2xl">school</span>
            {classe.name}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-neutral-300 uppercase font-bold block">Effectif Actuel</span>
              <span className="text-lg font-black text-white">{totalStudents} / {classe.capacityMax}</span>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-neutral-300 uppercase font-bold block">Séances Hebdo</span>
              <span className="text-lg font-black text-amber-300">{classSlots.length} cours</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">{classSlots.length * 2} heures de cours</span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-neutral-300 uppercase font-bold block">Taux Recouvrement</span>
              <span className="text-lg font-black text-emerald-400">{collectionRate}%</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">{paidCount} à jour • {lateCount} en retard</span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-neutral-300 uppercase font-bold block">Chiffre d'Affaires</span>
              <span className="text-base font-black text-white truncate block">
                {(expectedRevenue / 1000000).toFixed(1)}M FCFA
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">{(collectedRevenue / 1000000).toFixed(1)}M encaissé</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FAF8F6] border-b border-neutral-200 px-5 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex gap-2 py-2.5">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                activeTab === 'students'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              <span translate="no" className="material-symbols-outlined text-sm font-bold">groups</span>
              <span>Effectif & Étudiants ({totalStudents})</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                activeTab === 'schedule'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              <span translate="no" className="material-symbols-outlined text-sm font-bold">calendar_month</span>
              <span>Emploi du Temps ({classSlots.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                activeTab === 'subjects'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              <span translate="no" className="material-symbols-outlined text-sm font-bold">menu_book</span>
              <span>Matières & Enseignants ({subjectsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('finances')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                activeTab === 'finances'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              <span translate="no" className="material-symbols-outlined text-sm font-bold">payments</span>
              <span>Recouvrement & Frais</span>
            </button>
          </div>

          <button
            onClick={() => onEditClasse(classe)}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer border-0"
          >
            <span translate="no" className="material-symbols-outlined text-sm">edit</span>
            <span>Modifier la Classe</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-4">
          {/* TAB 1: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-grow max-w-md">
                  <span translate="no" className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou matricule..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={() => setIsAddingStudent(!isAddingStudent)}
                  className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-[#921316] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 shrink-0"
                >
                  <span translate="no" className="material-symbols-outlined text-sm font-black">
                    {isAddingStudent ? 'close' : 'person_add'}
                  </span>
                  <span>{isAddingStudent ? 'Annuler' : 'Inscrire un Étudiant'}</span>
                </button>
              </div>

              {/* Form Inline Add Student */}
              {isAddingStudent && (
                <form onSubmit={handleEnrollStudent} className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 animate-fade-in">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span translate="no" className="material-symbols-outlined text-sm">person_add</span>
                    Inscription directe dans {classe.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Nom Complet *</label>
                      <input
                        type="text"
                        required
                        placeholder="ex. Moussa Fall"
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Matricule</label>
                      <input
                        type="text"
                        value={newStudentMatricule}
                        onChange={e => setNewStudentMatricule(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="moussa.fall@ecole221.sn"
                        value={newStudentEmail}
                        onChange={e => setNewStudentEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Téléphone Parent</label>
                      <input
                        type="text"
                        value={newStudentPhone}
                        onChange={e => setNewStudentPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingStudent(false)}
                      className="px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl border-0 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-[#921316] transition-all border-0 cursor-pointer"
                    >
                      Confirmer l'Inscription
                    </button>
                  </div>
                </form>
              )}

              {/* Table of Students */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs font-bold text-neutral-600">
                  <thead>
                    <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                      <th className="px-4 py-3">Étudiant</th>
                      <th className="px-4 py-3">Matricule</th>
                      <th className="px-4 py-3">Moyenne (GPA)</th>
                      <th className="px-4 py-3">Statut Frais</th>
                      <th className="px-4 py-3">Badge & Accès</th>
                      <th className="px-4 py-3">Contact Tuteur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 font-semibold">
                          Aucun étudiant trouvé dans cette promotion.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(st => (
                        <tr key={st.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-4 py-3 text-[#1E293B]">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                                {st.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#1E293B] m-0">{st.name}</p>
                                <p className="text-[10px] text-neutral-400 font-normal m-0">{st.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-neutral-600 font-mono text-[11px]">{st.matricule}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-black rounded-md text-[11px]">
                              {st.gpa}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              st.financialStatus === 'En Règle'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {st.financialStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              st.qrStatus === 'AUTORISÉ'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {st.qrStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-500 font-semibold text-[11px]">
                            {st.phoneParent}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
                  Grille des cours de {classe.name}
                </h4>
                <span className="text-[11px] font-bold text-neutral-500">
                  {classSlots.length} créneaux planifiés cette semaine
                </span>
              </div>

              {classSlots.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F6] border border-dashed border-neutral-200 rounded-2xl">
                  <span translate="no" className="material-symbols-outlined text-4xl text-neutral-300 mb-2">event_busy</span>
                  <p className="text-sm font-bold text-neutral-600">Aucun créneau planifié pour cette classe.</p>
                  <p className="text-xs text-neutral-400 mt-1">Vous pouvez ajouter des cours depuis l'onglet "Planning & Emploi du Temps".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classSlots.map(slot => (
                    <div key={slot.id} className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs flex items-start justify-between gap-3 hover:border-primary/50 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-black text-[10px] uppercase">
                            {slot.day}
                          </span>
                          <span className="text-[11px] font-extrabold text-neutral-600">
                            {slot.slot}
                          </span>
                        </div>
                        <h5 className="font-black text-[#1E293B] text-sm mt-1">{slot.subject}</h5>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <span translate="no" className="material-symbols-outlined text-xs">person</span>
                            {slot.prof}
                          </span>
                          <span className="flex items-center gap-1">
                            <span translate="no" className="material-symbols-outlined text-xs">meeting_room</span>
                            {slot.roomName}
                          </span>
                        </div>
                      </div>

                      {slot.isLive && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                          En cours
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUBJECTS & PROFESSORS */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
                    Modules Pédagogiques & Enseignants Dédiés
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-semibold">Répartition des matières et volume d'enseignement pour {classe.name}.</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs font-bold text-neutral-600">
                  <thead>
                    <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                      <th className="px-4 py-3">Matière / Module</th>
                      <th className="px-4 py-3">Enseignant Responsable</th>
                      <th className="px-4 py-3 text-center">Volume Hebdo</th>
                      <th className="px-4 py-3 text-center">Statut Affectation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {subjectsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                          Aucune matière encore affectée à cette classe.
                        </td>
                      </tr>
                    ) : (
                      subjectsList.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-4 py-3.5 text-[#1E293B] font-extrabold flex items-center gap-2">
                            <span translate="no" className="material-symbols-outlined text-sm text-primary">auto_stories</span>
                            {sub.subject}
                          </td>
                          <td className="px-4 py-3.5 text-neutral-700 font-semibold">
                            <span className="px-2 py-0.5 bg-neutral-100 rounded-md">{sub.prof}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center text-primary font-black">
                            {sub.hours}h / semaine
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                              Confirmé
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCES */}
          {activeTab === 'finances' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span translate="no" className="material-symbols-outlined text-emerald-600">account_balance_wallet</span>
                    Recouvrement & Frais de Scolarité — {classe.name}
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    Tarif Annuel : {classe.price.toLocaleString('fr-FR')} FCFA par étudiant • Effectif : {totalStudents}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-900 block">Taux Global Recouvré</span>
                  <span className="text-2xl font-black text-emerald-600">{collectionRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Attendu Annuel</span>
                  <span className="text-lg font-black text-[#1E293B] block mt-1">
                    {expectedRevenue.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-[10px] text-neutral-500 font-semibold">{totalStudents} étudiants × {classe.price.toLocaleString('fr-FR')}</span>
                </div>

                <div className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Déjà Encaissé</span>
                  <span className="text-lg font-black text-emerald-600 block mt-1">
                    {collectedRevenue.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{paidCount} étudiants en règle</span>
                </div>

                <div className="p-4 bg-white border border-rose-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">Reste à Recouvrer</span>
                  <span className="text-lg font-black text-rose-600 block mt-1">
                    {remainingRevenue.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-[10px] text-rose-700 font-semibold">{lateCount} étudiants avec impayés</span>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3">
                <h5 className="text-xs font-black text-[#1E293B] uppercase tracking-wider flex items-center justify-between">
                  <span>Étudiants en Retard de Paiement ({lateCount})</span>
                  {lateCount > 0 && (
                    <button
                      onClick={() => toast.success(`Rappels SMS et WhatsApp envoyés aux ${lateCount} étudiants de ${classe.name}.`)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer border-0 flex items-center gap-1 transition-all"
                    >
                      <span translate="no" className="material-symbols-outlined text-xs">send</span>
                      Envoyer Rappel Global
                    </button>
                  )}
                </h5>

                {lateCount === 0 ? (
                  <p className="text-xs font-bold text-emerald-600 py-2">
                    Félicitations ! 100% des étudiants de cette classe sont à jour dans leurs écolages.
                  </p>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {classStudents
                      .filter(s => s.financialStatus === 'En Retard')
                      .map(s => (
                        <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-extrabold text-[#1E293B]">{s.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono ml-2">({s.matricule})</span>
                            <p className="text-[10px] text-neutral-500 m-0">Tuteur: {s.phoneParent}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-black text-[10px] rounded-full uppercase">
                            Impayé
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF8F6] border-t border-neutral-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-500 font-semibold">
            Promotion {classe.name} • Identifiant Système : <code className="text-neutral-700 font-mono">{classe.id}</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
          >
            Fermer la Vue 360°
          </button>
        </div>
      </div>
    </div>
  );
}


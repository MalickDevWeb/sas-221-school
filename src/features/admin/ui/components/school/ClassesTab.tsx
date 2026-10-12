import React, { useState } from 'react';
import { Classe, Filiere, PlanningSlot, INITIAL_PLANNING } from '../../../domain/SchoolModels';
import { ClasseFormModal } from './ClasseFormModal';
import { ClasseDetailPage } from './ClasseDetailPage';
import { INITIAL_STUDENTS, Student } from '../../../domain/StudentModels';

interface Props {
  classes: Classe[];
  filieres: Filiere[];
  slots?: PlanningSlot[];
  students?: Student[];
  onUpdateClasses: (classes: Classe[]) => void;
}

export function ClassesTab({ classes, filieres, slots = INITIAL_PLANNING, students = INITIAL_STUDENTS, onUpdateClasses }: Props) {
  const [activeClasseForEdit, setActiveClasseForEdit] = useState<Classe | null | undefined>(undefined);
  const [activeClasseFor360, setActiveClasseFor360] = useState<Classe | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<'ALL' | 'LICENCE' | 'MASTER' | 'AUTRES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const safeClasses = Array.isArray(classes) ? classes : [];
  const safeFilieres = Array.isArray(filieres) ? filieres : [];

  const handleSave = (saved: Classe) => {
    if (activeClasseForEdit) {
      onUpdateClasses(safeClasses.map(c => c.id === saved.id ? saved : c));
    } else {
      onUpdateClasses([...safeClasses, saved]);
    }
    setActiveClasseForEdit(undefined);
  };

  const handleDelete = (id: string) => {
    onUpdateClasses(safeClasses.filter(c => c.id !== id));
    setActiveClasseForEdit(undefined);
  };

  // Filter classes by cycle and search query
  const filteredClasses = safeClasses.filter(cls => {
    // Cycle filter
    const lvl = cls.level?.toUpperCase() || '';
    if (selectedCycle === 'LICENCE') {
      if (!lvl.startsWith('L') && !lvl.includes('LICENCE')) return false;
    } else if (selectedCycle === 'MASTER') {
      if (!lvl.startsWith('M') && !lvl.includes('MASTER')) return false;
    } else if (selectedCycle === 'AUTRES') {
      if (lvl.startsWith('L') || lvl.startsWith('M') || lvl.includes('LICENCE') || lvl.includes('MASTER')) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fName = safeFilieres.find(f => f.id === cls.filiereId)?.name.toLowerCase() || '';
      return cls.name.toLowerCase().includes(q) || cls.level.toLowerCase().includes(q) || fName.includes(q);
    }
    return true;
  });

  // Calculate totals
  const totalCapacity = safeClasses.reduce((acc, c) => acc + (c.capacityMax || 0), 0);
  const avgTuition = safeClasses.length > 0
    ? Math.round(safeClasses.reduce((acc, c) => acc + (c.price || 0), 0) / safeClasses.length)
    : 0;

  if (activeClasseFor360) {
    return (
      <>
        <ClasseDetailPage
          classe={activeClasseFor360}
          filieres={safeFilieres}
          slots={slots}
          allStudents={students}
          onBack={() => setActiveClasseFor360(null)}
          onEditClasse={(cls) => {
            setActiveClasseForEdit(cls);
          }}
        />
        {activeClasseForEdit !== undefined && (
          <ClasseFormModal
            classe={activeClasseForEdit}
            filieres={safeFilieres}
            onClose={() => setActiveClasseForEdit(undefined)}
            onSave={(saved) => {
              handleSave(saved);
              setActiveClasseFor360(saved);
            }}
            onDelete={(id) => {
              handleDelete(id);
              setActiveClasseFor360(null);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6" id="classes-tab-container">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-[#1E293B] text-base flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-primary text-xl">account_tree</span>
            Gestion des Promotions, Cycles & Classes
          </h3>
          <p className="text-xs text-neutral-400 font-semibold mt-0.5">
            Suivez chaque promotion à 360° : effectif, emploi du temps dédié, enseignants et recouvrement financier.
          </p>
        </div>
        <button
          onClick={() => setActiveClasseForEdit(null)}
          className="px-4 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-md hover:bg-[#921316] transition-all flex items-center gap-1.5 cursor-pointer border-0 shrink-0 self-start sm:self-auto"
        >
          <span translate="no" className="material-symbols-outlined text-sm font-black">add</span>
          <span>Créer une Classe / Promotion</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#FAF8F6] border border-neutral-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">Total Promotions</span>
          <span className="text-xl font-black text-[#1E293B] block mt-1">{safeClasses.length} Classes</span>
          <span className="text-[10px] font-bold text-neutral-500 mt-0.5 block">actives cette année</span>
        </div>
        <div className="p-3.5 bg-[#FAF8F6] border border-neutral-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">Capacité Totale</span>
          <span className="text-xl font-black text-primary block mt-1">{totalCapacity} Places</span>
          <span className="text-[10px] font-bold text-neutral-500 mt-0.5 block">dans l'établissement</span>
        </div>
        <div className="p-3.5 bg-[#FAF8F6] border border-neutral-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">Frais Moyen Annuel</span>
          <span className="text-xl font-black text-emerald-600 block mt-1">{avgTuition.toLocaleString('fr-FR')} FCFA</span>
          <span className="text-[10px] font-bold text-neutral-500 mt-0.5 block">par étudiant / an</span>
        </div>
        <div className="p-3.5 bg-[#FAF8F6] border border-neutral-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">Mode Visuel 360°</span>
          <span className="text-xl font-black text-amber-600 block mt-1">Actif</span>
          <span className="text-[10px] font-bold text-neutral-500 mt-0.5 block">Cliquez pour entrer</span>
        </div>
      </div>

      {/* Cycle Selector & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-neutral-200/80">
        <div className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedCycle('ALL')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer border-0 ${
              selectedCycle === 'ALL'
                ? 'bg-white text-primary shadow-xs'
                : 'bg-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tous les Cycles ({safeClasses.length})
          </button>
          <button
            onClick={() => setSelectedCycle('LICENCE')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer border-0 ${
              selectedCycle === 'LICENCE'
                ? 'bg-white text-primary shadow-xs'
                : 'bg-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cycle Licence (L1, L2, L3)
          </button>
          <button
            onClick={() => setSelectedCycle('MASTER')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer border-0 ${
              selectedCycle === 'MASTER'
                ? 'bg-white text-primary shadow-xs'
                : 'bg-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cycle Master (M1, M2)
          </button>
          <button
            onClick={() => setSelectedCycle('AUTRES')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer border-0 ${
              selectedCycle === 'AUTRES'
                ? 'bg-white text-primary shadow-xs'
                : 'bg-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            BTS / Ingénieur / Autres
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <span translate="no" className="material-symbols-outlined absolute left-3 top-2 text-neutral-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Filtrer une classe..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-bold text-neutral-600">
            <thead>
              <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                <th className="px-5 py-3">Promotion / Classe</th>
                <th className="px-5 py-3">Cycle & Niveau</th>
                <th className="px-5 py-3">Filière Associée</th>
                <th className="px-5 py-3">Capacité & Effectif</th>
                <th className="px-5 py-3 text-right">Frais d'Écolage Annuel</th>
                <th className="px-5 py-3 text-center">Accès 360° & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-neutral-400 font-semibold">
                    Aucune classe ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => {
                  const fName = safeFilieres.find(f => f.id === cls.filiereId)?.name || 'Général / Tronc Commun';
                  const classStudentCount = students.filter(
                    s => s.classe?.toLowerCase() === cls.name.toLowerCase() ||
                         s.classe?.toLowerCase().includes(cls.level.toLowerCase())
                  ).length || Math.min(cls.capacityMax, 2);

                  const occupancy = Math.min(100, Math.round((classStudentCount / (cls.capacityMax || 1)) * 100));

                  return (
                    <tr
                      key={cls.id}
                      className="hover:bg-neutral-50/70 transition-colors group cursor-pointer"
                      onClick={() => setActiveClasseFor360(cls)}
                    >
                      <td className="px-5 py-3.5 text-[#1E293B]">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                            {cls.level}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#1E293B] m-0 group-hover:text-primary transition-colors">
                              {cls.name}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-normal m-0">ID: {cls.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 bg-neutral-100 text-[#1E293B] rounded-md font-black text-[11px]">
                          {cls.level}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 font-semibold">{fName}</td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-neutral-700">{classStudentCount} inscrits</span>
                            <span className="text-neutral-400">max {cls.capacityMax}</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                occupancy > 85 ? 'bg-amber-500' : 'bg-primary'
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-emerald-600 font-extrabold text-sm">
                        {cls.price.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveClasseFor360(cls)}
                            className="px-2.5 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border-0"
                            title="Entrer et voir tout dans cette classe à 360°"
                          >
                            <span translate="no" className="material-symbols-outlined text-xs">visibility</span>
                            <span>Entrer 360°</span>
                          </button>
                          <button
                            onClick={() => setActiveClasseForEdit(cls)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer border-0 bg-transparent inline-flex items-center"
                            title="Modifier les paramètres de la classe"
                          >
                            <span translate="no" className="material-symbols-outlined text-sm font-bold">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit / Create */}
      {activeClasseForEdit !== undefined && (
        <ClasseFormModal
          classe={activeClasseForEdit}
          filieres={safeFilieres}
          onClose={() => setActiveClasseForEdit(undefined)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

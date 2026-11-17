import React, { useState } from 'react';
import { Classe, Filiere, PlanningSlot } from '../../../domain/SchoolModels';
import { ClasseFormModal } from './ClasseFormModal';
import { ClasseDetailPage } from './ClasseDetailPage';
import { Student } from '../../../domain/StudentModels';
import { avecNombre } from '@/shared/lib/pluriel';

type Cycle = 'ALL' | 'LICENCE' | 'MASTER' | 'AUTRES';

/** Classe rangée dans un cycle d'après son niveau (L1…L3 : Licence, M1/M2 : Master, sinon Autres). */
function dansCycle(cls: Classe, cycle: Cycle): boolean {
  const lvl = cls.level?.toUpperCase() || '';
  const licence = lvl.startsWith('L') || lvl.includes('LICENCE');
  const master = lvl.startsWith('M') || lvl.includes('MASTER');
  if (cycle === 'LICENCE') return licence;
  if (cycle === 'MASTER') return master;
  if (cycle === 'AUTRES') return !licence && !master;
  return true;
}

/** Même règle que la fiche 360° de la classe : identifiant de classe, sinon nom exact. */
const estDansClasse = (s: Student, cls: Classe) =>
  s.classeId ? s.classeId === cls.id : !!s.classe && s.classe.toLowerCase() === cls.name.toLowerCase();

const CYCLES: { id: Cycle; libelle: string }[] = [
  { id: 'ALL', libelle: 'Tous' },
  { id: 'LICENCE', libelle: 'Licence' },
  { id: 'MASTER', libelle: 'Master' },
  { id: 'AUTRES', libelle: 'BTS & autres' },
];

interface Props {
  classes: Classe[];
  filieres: Filiere[];
  slots?: PlanningSlot[];
  students?: Student[];
  /** Renvoie le message d'erreur du serveur (null si enregistré). */
  onUpdateClasses: (classes: Classe[]) => Promise<string | null> | void;
  /** Crée une filière depuis la fenêtre de classe (même enregistrement que « Filières & Spécialités »). */
  onCreerFiliere?: (filiere: Filiere) => Promise<string | null>;
}

export function ClassesTab({ classes, filieres, slots = [], students = [], onUpdateClasses, onCreerFiliere }: Props) {
  const [activeClasseForEdit, setActiveClasseForEdit] = useState<Classe | null | undefined>(undefined);
  const [activeClasseFor360, setActiveClasseFor360] = useState<Classe | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<Cycle>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const safeClasses = Array.isArray(classes) ? classes : [];
  const safeFilieres = Array.isArray(filieres) ? filieres : [];

  /** La fenêtre ne se ferme qu'une fois la classe enregistrée par le serveur ; sinon elle garde la saisie. */
  const handleSave = async (saved: Classe): Promise<string | null> => {
    const erreur = await onUpdateClasses(activeClasseForEdit
      ? safeClasses.map(c => c.id === saved.id ? saved : c)
      : [...safeClasses, saved]);
    if (!erreur) setActiveClasseForEdit(undefined);
    return erreur ?? null;
  };

  const handleDelete = (id: string) => {
    onUpdateClasses(safeClasses.filter(c => c.id !== id));
    setActiveClasseForEdit(undefined);
  };

  // Filter classes by cycle and search query
  const filteredClasses = safeClasses.filter(cls => {
    if (!dansCycle(cls, selectedCycle)) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fName = safeFilieres.find(f => f.id === cls.filiereId)?.name.toLowerCase() || '';
      return cls.name.toLowerCase().includes(q) || cls.level.toLowerCase().includes(q) || fName.includes(q);
    }
    return true;
  });

  // Élèves réellement rattachés à une classe de l'école (même règle que la fiche 360°)
  const elevesEnClasse = students.filter(s => safeClasses.some(c => estDansClasse(s, c))).length;
  const filtresActifs = selectedCycle !== 'ALL' || searchQuery.trim() !== '';
  const effacerFiltres = () => { setSelectedCycle('ALL'); setSearchQuery(''); };

  // Calculate totals
  const totalCapacity = safeClasses.reduce((acc, c) => acc + (c.capacityMax || 0), 0);
  // Moyenne calculée uniquement sur les classes dont le tarif est renseigné
  const pricedClasses = safeClasses.filter(c => c.price != null);
  const avgTuition = pricedClasses.length > 0
    ? Math.round(pricedClasses.reduce((acc, c) => acc + (c.price ?? 0), 0) / pricedClasses.length)
    : null;

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
            onCreerFiliere={onCreerFiliere}
            onClose={() => setActiveClasseForEdit(undefined)}
            onSave={async (saved) => {
              const erreur = await handleSave(saved);
              if (!erreur) setActiveClasseFor360(saved);
              return erreur;
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
      {/* En-tête : un seul titre (charte d'écriture : style « phrase », accords, pas de jargon) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-[#1E293B] text-base">Classes</h3>
          <p className="text-xs text-neutral-500 font-semibold mt-0.5">Effectif, filière et frais annuels de chaque classe.</p>
        </div>
        <button
          id="classe-nouvelle"
          type="button"
          onClick={() => setActiveClasseForEdit(null)}
          className="px-4 py-2.5 bg-primary text-text-on-primary text-xs font-black rounded-xl shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer border-0 shrink-0 self-start"
        >
          <span translate="no" className="material-symbols-outlined text-sm font-black">add</span>
          <span>Nouvelle classe</span>
        </button>
      </div>

      {/* Chiffres (vraies données ; « — » si aucune classe) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'kpi-total-classes', libelle: 'Total des classes', valeur: avecNombre(safeClasses.length, 'classe'), detail: 'enregistrées pour l’école' },
          { id: 'kpi-capacite', libelle: 'Capacité totale', valeur: safeClasses.length ? avecNombre(totalCapacity, 'place') : '—', detail: 'somme des capacités' },
          { id: 'kpi-frais-moyens', libelle: 'Frais annuels moyens', valeur: avgTuition == null ? '—' : `${avgTuition.toLocaleString('fr-FR')} FCFA`, detail: 'par élève et par an' },
          { id: 'kpi-eleves-en-classe', libelle: 'Élèves inscrits', valeur: safeClasses.length ? avecNombre(elevesEnClasse, 'élève') : '—', detail: 'dans les classes' },
        ].map(k => (
          <div key={k.id} id={k.id} className="p-4 bg-[#FAF8F6] border border-neutral-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-neutral-500 block">{k.libelle}</span>
            <span className="text-lg font-black text-[#1E293B] block mt-1">{k.valeur}</span>
            <span className="text-[10px] font-semibold text-neutral-400 mt-0.5 block">{k.detail}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Onglets courts, sur une seule ligne ; défilement horizontal si l'écran est étroit */}
        <div className="flex flex-nowrap gap-1 bg-neutral-100 p-1 rounded-xl overflow-x-auto min-w-0" role="tablist" aria-label="Cycles">
          {CYCLES.map(c => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={selectedCycle === c.id}
              onClick={() => setSelectedCycle(c.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-0 whitespace-nowrap shrink-0 ${
                selectedCycle === c.id ? 'bg-white text-primary shadow-xs' : 'bg-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {c.libelle} ({safeClasses.filter(cls => dansCycle(cls, c.id)).length})
            </button>
          ))}
        </div>

        <div className="relative md:w-64 shrink-0">
          <span translate="no" className="material-symbols-outlined absolute left-3 top-2 text-neutral-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Filtrer une classe..."
            aria-label="Filtrer les classes"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-neutral-600">
            <thead>
              <tr className="bg-[#FAF8F6] text-[11px] font-bold text-neutral-500 border-b border-neutral-200">
                <th className="px-5 py-3">Classe</th>
                <th className="px-5 py-3">Niveau</th>
                <th className="px-5 py-3">Filière</th>
                <th className="px-5 py-3">Effectif</th>
                <th className="px-5 py-3 text-right">Frais annuels</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-500 font-semibold" id="classes-vide">
                    {safeClasses.length === 0 ? (
                      <div className="space-y-3">
                        <span translate="no" className="material-symbols-outlined text-3xl text-neutral-300 block">account_tree</span>
                        <p className="m-0">Aucune classe pour l'instant. Créez la première avec « Nouvelle classe ».</p>
                        <button type="button" onClick={() => setActiveClasseForEdit(null)}
                                className="px-4 py-2 bg-primary text-text-on-primary text-xs font-black rounded-xl hover:opacity-95 cursor-pointer border-0 inline-flex items-center gap-1.5">
                          <span translate="no" className="material-symbols-outlined text-sm font-black">add</span>
                          <span>Nouvelle classe</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="m-0">Aucune classe ne correspond aux filtres sélectionnés.</p>
                        {filtresActifs && (
                          <button type="button" onClick={effacerFiltres}
                                  className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-xs font-black rounded-xl hover:bg-neutral-50 cursor-pointer">
                            Effacer les filtres
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => {
                  const fName = safeFilieres.find(f => f.id === cls.filiereId)?.name || 'Sans filière';
                  const classStudentCount = students.filter(s => estDansClasse(s, cls)).length;   // effectif réel, jamais inventé
                  const occupancy = cls.capacityMax ? Math.min(100, Math.round((classStudentCount / cls.capacityMax) * 100)) : 0;
                  const cycle = dansCycle(cls, 'LICENCE') ? 'Licence' : dansCycle(cls, 'MASTER') ? 'Master' : 'Autre cycle';

                  return (
                    <tr key={cls.id} className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => setActiveClasseFor360(cls)}>
                      <td className="px-5 py-3.5">
                        <p className="font-extrabold text-[#1E293B] m-0 group-hover:text-primary transition-colors">{cls.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-neutral-100 text-[#1E293B] rounded-md font-black text-[11px]">{cls.level}</span>
                        <span className="block text-[10px] text-neutral-400 font-semibold mt-0.5">{cycle}</span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600 font-semibold">{fName}</td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-neutral-700">{avecNombre(classStudentCount, 'élève')}</span>
                            <span className="text-neutral-400">sur {cls.capacityMax ?? '—'}</span>
                          </div>
                          <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden" role="img"
                               aria-label={cls.capacityMax ? `Remplissage : ${occupancy} %` : 'Capacité non renseignée'}>
                            <div className={`h-full rounded-full transition-all ${occupancy > 85 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${occupancy}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[#1E293B] font-bold tabular-nums whitespace-nowrap">
                        {cls.price == null ? '—' : `${cls.price.toLocaleString('fr-FR')} FCFA`}
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveClasseFor360(cls)}
                            className="px-2.5 py-1 bg-primary/10 hover:bg-primary hover:text-text-on-primary text-primary rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border-0"
                            title="Ouvrir la fiche de la classe"
                          >
                            <span translate="no" className="material-symbols-outlined text-xs">visibility</span>
                            <span>Ouvrir</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveClasseForEdit(cls)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer border-0 bg-transparent inline-flex items-center"
                            title="Modifier la classe"
                            aria-label={`Modifier la classe ${cls.name}`}
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
          onCreerFiliere={onCreerFiliere}
          onClose={() => setActiveClasseForEdit(undefined)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

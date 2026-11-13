import React, { useEffect, useRef, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { GroupMember } from '../../domain/CollaborationModels';
import { StudentSelectionList } from './StudentSelectionList';
import { LeaderSelectionDropdown } from './LeaderSelectionDropdown';
import { ClasseSelect } from './ClasseSelect';
import { elevesDisponibles } from '../../infrastructure/groupService';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  /** Lève l'erreur du serveur (affichée sous le formulaire). */
  readonly onCreateManual: (
    name: string,
    description: string,
    classId: string,
    leader: GroupMember,
    members: readonly GroupMember[]
  ) => Promise<void>;
}

const champ = 'w-full text-xs px-2.5 py-1.5 border border-neutral-gray-200 rounded-lg focus:ring-1 focus:ring-brand-red-deep aria-[invalid=true]:border-rose-400';

export function ManualGroupCreator({ onCreateManual }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [leaderId, setLeaderId] = useState('');
  const [students, setStudents] = useState<readonly GroupMember[]>([]);   // APP-BE-14 : étudiants réels uniquement
  const [chargement, setChargement] = useState(true);
  const [erreurs, setErreurs] = useState<{ name?: string; members?: string; global?: string }>({});
  const [envoi, setEnvoi] = useState(false);
  const enCours = useRef(false);   // double clic : un seul envoi

  useEffect(() => {
    let actif = true;
    setChargement(true);
    elevesDisponibles(classId || undefined)
      .then((liste) => {
        if (!actif) return;
        setStudents(liste);
        // élèves cochés hors de la nouvelle classe : décochés
        setSelectedIds((prev) => prev.filter((id) => liste.some((s) => s.id === id)));
      })
      .catch((e) => { if (actif) { setStudents([]); setErreurs({ global: `Élèves indisponibles : ${resolveErrorMessage(e)}` }); } })
      .finally(() => { if (actif) setChargement(false); });
    return () => { actif = false; };
  }, [classId]);

  useEffect(() => {
    if (leaderId && !selectedIds.includes(leaderId)) setLeaderId('');
  }, [selectedIds, leaderId]);

  const handleToggleStudent = (studentId: string) => {
    setErreurs((e) => ({ ...e, members: undefined }));
    setSelectedIds((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
  };

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enCours.current) return;
    const nom = name.trim();
    const verif: typeof erreurs = {};
    if (!nom) verif.name = 'Donnez un nom au groupe (ex. : Groupe Delta).';
    else if (nom.length > 100) verif.name = '100 caractères au maximum.';
    if (selectedStudents.length === 0) verif.members = 'Sélectionnez au moins un élève.';
    setErreurs(verif);
    if (verif.name || verif.members) return;
    const leader = selectedStudents.find((s) => s.id === leaderId) || selectedStudents[0];
    enCours.current = true;
    setEnvoi(true);
    try {
      await onCreateManual(nom, description.trim(), classId, leader, selectedStudents);
      setName('');
      setDescription('');
      setSelectedIds([]);
      setLeaderId('');
    } catch (err) {
      const message = resolveErrorMessage(err);
      setErreurs(/nom/i.test(message) ? { name: message } : { global: message });
    } finally {
      enCours.current = false;
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-3" data-formulaire-groupe>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="groupe-nom" className="block text-[10px] font-bold text-gray-700 mb-0.5">Nom du Groupe</label>
          <input id="groupe-nom" type="text" placeholder="Ex: Groupe Delta" value={name}
                 onChange={(e) => { setName(e.target.value); setErreurs((x) => ({ ...x, name: undefined })); }}
                 aria-invalid={!!erreurs.name || undefined} className={champ} />
          {erreurs.name && <p role="alert" className="mt-0.5 text-[10px] font-bold text-rose-700">{erreurs.name}</p>}
        </div>
        <div>
          <label htmlFor="groupe-classe" className="block text-[10px] font-bold text-gray-700 mb-0.5">Classe</label>
          <ClasseSelect id="groupe-classe" value={classId} onChange={setClassId} optionVide="Toutes les classes" />
        </div>
      </div>

      <div>
        <label htmlFor="groupe-description" className="block text-[10px] font-bold text-gray-700 mb-0.5">Description (facultative)</label>
        <input id="groupe-description" type="text" maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} className={champ} />
      </div>

      <StudentSelectionList students={students} selectedIds={selectedIds} onToggleStudent={handleToggleStudent} chargement={chargement} />
      {erreurs.members && <p role="alert" className="text-[10px] font-bold text-rose-700 -mt-2">{erreurs.members}</p>}

      <LeaderSelectionDropdown selectedStudents={selectedStudents} leaderId={leaderId} setLeaderId={setLeaderId} />

      {erreurs.global && <p role="alert" className="text-[10px] font-bold text-rose-700">{erreurs.global}</p>}

      <button
        type="submit"
        disabled={envoi}
        className="w-full py-2 bg-neutral-gray-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>{envoi ? 'Création…' : 'Créer le Groupe Manuellement'}</span>
      </button>
    </form>
  );
}
export default ManualGroupCreator;

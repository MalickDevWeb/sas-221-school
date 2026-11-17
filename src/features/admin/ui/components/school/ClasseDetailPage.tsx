import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ficheClassePdf } from './ficheClassePdf';
import { toast } from 'sonner';
import { Classe, Filiere, PlanningSlot } from '../../../domain/SchoolModels';
import { Student, mapStudentFromApi } from '../../../domain/StudentModels';
import { SmartExcelImportModal } from './SmartExcelImportModal';
import { AjouterEleveExistant } from './AjouterEleveExistant';
import { MotDePasseProvisoireModal } from '../MotDePasseProvisoireModal';
import { avecNombre } from '@/shared/lib/pluriel';
import { apiClient } from '@/shared/lib/apiClient';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { afficherErreur } from '@/shared/lib/validationPersonnalisee';
import { objetBrut, texteOuNull } from '@/shared/lib/lectureServeur';

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fcfa = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('fr-FR')} FCFA`);
/** Valeur par défaut stable (un « [] » recréé à chaque rendu relancerait la synchronisation sans fin). */
const AUCUN_ELEVE: Student[] = [];

interface Props {
  classe: Classe;
  filieres: Filiere[];
  slots: PlanningSlot[];
  allStudents?: Student[];
  onBack: () => void;
  onEditClasse: (cls: Classe) => void;
  onUpdateStudents?: (students: Student[]) => void;
}

export function ClasseDetailPage({
  classe,
  filieres,
  slots,
  allStudents = AUCUN_ELEVE,
  onBack,
  onEditClasse,
  onUpdateStudents,
}: Props) {
  const [activeTab, setActiveTab] = useState<'students' | 'schedule' | 'subjects' | 'finances'>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);

  // Form states for manual student add
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentMatricule, setNewStudentMatricule] = useState('');   // vide = généré par le serveur
  const [newStudentPhone, setNewStudentPhone] = useState('');
  // APP-TL-23 : élève sans e-mail → connexion par matricule (même règle que l'inscription des admis)
  const [newStudentSansEmail, setNewStudentSansEmail] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [motDePasseInfo, setMotDePasseInfo] = useState<{ nom: string; identifiant: string; connexionParMatricule: boolean; matricule: string | null; motDePasse: string } | null>(null);

  // Élèves de cette classe : uniquement ceux que le serveur rattache à la classe (aucun élève emprunté à d'autres classes)
  const elevesDeLaClasse = useMemo(() =>
    allStudents.filter(s => (s.classeId ? s.classeId === classe.id : !!s.classe && s.classe.toLowerCase() === classe.name.toLowerCase())),
  [allStudents, classe.id, classe.name]);
  const [classStudents, setClassStudents] = useState<Student[]>(elevesDeLaClasse);
  // 16/11 : avant, la liste n'était calculée qu'à l'ouverture de la fiche. Les élèves de l'école arrivent pourtant
  // après (chargement asynchrone) ou sont relus après une inscription, et la fiche restait sur « Aucun élève » (0).
  useEffect(() => { setClassStudents(elevesDeLaClasse); }, [elevesDeLaClasse]);

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

  // Calculs financiers : uniquement à partir du tarif réel de la classe (aucun tarif ni capacité supposés)
  const price = classe.price ?? null;
  const capacity = classe.capacityMax ?? null;
  const totalStudents = classStudents.length;
  // APP-TL-22 (2026-11-14) : plus de statut de frais « En Règle / En Retard » saisi à la main ni de liste de
  // « débiteurs » : seul le montant attendu (tarif × effectif) est calculé ici ; les versements réels de chaque élève
  // sont suivis dans Finances › Écolages.
  const expectedRevenue = price != null ? totalStudents * price : null;
  const occupancyRate = capacity ? Math.min(100, Math.round((totalStudents / capacity) * 100)) : null;
  const capaciteDepassee = capacity != null && capacity > 0 && totalStudents > capacity;

  const filteredStudents = classStudents.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.matricule.toLowerCase().includes(studentSearch.toLowerCase());
    return matchesSearch;
  });

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enrolling) return;
    const form = e.currentTarget as HTMLFormElement;
    const nom = newStudentName.trim();
    const email = newStudentEmail.trim();
    if (!nom) {
      const champ = form.querySelector<HTMLInputElement>('input[name="nom"]');
      if (champ) afficherErreur(champ, 'Le nom et le prénom de l\'élève sont obligatoires.');
      return;
    }
    if (!newStudentSansEmail && !EMAIL_VALIDE.test(email)) {
      const champ = form.querySelector<HTMLInputElement>('input[name="email"]');
      if (champ) afficherErreur(champ, "Saisissez l'adresse e-mail de l'élève, ou cochez « Sans e-mail » (connexion par matricule).");
      return;
    }

    const body: Record<string, string | boolean> = newStudentSansEmail
      ? { name: nom, sansEmail: true, classeId: classe.id }
      : { name: nom, email, classeId: classe.id };
    if (newStudentPhone.trim()) body.telephone = newStudentPhone.trim();
    if (newStudentMatricule.trim()) body.matricule = newStudentMatricule.trim();

    setEnrolling(true);
    try {
      const { data } = await apiClient.post<unknown>('/admin/students', body);
      const cree = mapStudentFromApi(data);
      const brut = objetBrut(data);
      const motDePasseProvisoire = texteOuNull(brut.motDePasseProvisoire);
      const connexionParMatricule = brut.sansEmail === true;
      const updated = [cree, ...classStudents];
      setClassStudents(updated);
      if (onUpdateStudents) onUpdateStudents(updated);
      toast.success(`Compte élève créé pour ${cree.name}.`);
      if (motDePasseProvisoire) {
        setMotDePasseInfo({
          nom: cree.name,
          identifiant: texteOuNull(brut.identifiant) ?? (connexionParMatricule ? cree.matricule : cree.email),
          connexionParMatricule,
          matricule: cree.matricule || null,
          motDePasse: motDePasseProvisoire,
        });
      }
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentMatricule('');
      setNewStudentPhone('');
      setNewStudentSansEmail(false);
      setIsAddingStudent(false);
    } catch (err) {
      toast.error(resolveErrorMessage(err));   // formulaire conservé, liste inchangée
    } finally {
      setEnrolling(false);
    }
  };

  const handleBulkImportComplete = (imported: Student[]) => {
    const updated = [...imported, ...classStudents];
    setClassStudents(updated);
    if (onUpdateStudents) onUpdateStudents(updated);
  };

  const toggleStudentQrStatus = async (id: string) => {
    const st = classStudents.find(s => s.id === id);
    if (!st) return;
    try {
      const { data } = await apiClient.patch<unknown>(`/admin/students/${id}/toggle-status`);
      const r = objetBrut(data);
      const qrStatus: Student['qrStatus'] = r.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ';
      const status: Student['status'] = r.status === 'Suspendu' ? 'Suspendu' : 'Actif';
      setClassStudents(prev => prev.map(s => (s.id === id ? { ...s, qrStatus, status } : s)));
      toast.success(qrStatus === 'SUSPENDU' ? `${st.name} est suspendu : accès refusé.` : `${st.name} est réactivé : accès autorisé.`);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  const handleRemoveStudent = async (id: string, name: string) => {
    // Le serveur ne stocke pas l'affectation aux classes : le seul retrait réel est le retrait de l'école
    if (!(await demanderConfirmation(
      `Retirer ${name} de l'école ? Son compte sera supprimé s'il n'appartient à aucune autre école.`,
      { titre: 'Retirer un élève', confirmer: 'Retirer' }
    ))) return;
    try {
      await apiClient.delete(`/admin/students/${id}`);
      const updated = classStudents.filter(s => s.id !== id);
      setClassStudents(updated);
      if (onUpdateStudents) onUpdateStudents(updated);
      toast.success(`${name} a été retiré de l'école.`);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  // Export de la promotion en Excel
  const exportClassToExcel = () => {
    const exportData = classStudents.map((s, idx) => ({
      'N°': idx + 1,
      'Nom & Prénom': s.name,
      'Matricule': s.matricule,
      'Email': s.email,
      'Promotion': classe.name,
      'Badge Accès': s.qrStatus,
      'Téléphone': s.phoneParent || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Effectif');
    XLSX.writeFile(wb, `Promotion_${classe.name.replace(/\s+/g, '_')}_Effectif.xlsx`);
    toast.success('Fiche promotionnelle exportée en Excel avec succès !');
  };

  // Fiche de classe PDF : modèle commun des documents de l'école (2026-11-15 ; avant : « ÉCOLE 221 » écrit en dur,
  // espaces fines rendues « / », tableau vide sans message, ni logo, ni date, ni pagination)
  const exportClassToPDF = async () => {
    try {
      await ficheClassePdf({
        classe: classe.name, niveau: classe.level, filiere: filiereName, fraisAnnuels: price, capacite: capacity,
        eleves: classStudents.map(s => ({ nom: s.name, matricule: s.matricule, telephone: s.phoneParent || null })),
      });
      toast.success('Fiche de classe téléchargée (PDF).');
    } catch (err) {
      toast.error(`Fiche de classe non produite : ${err instanceof Error ? err.message : 'erreur inconnue'}.`);
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in" id="classe-dedicated-page">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-[#1E293B] rounded-xl transition-all cursor-pointer border-0 flex items-center gap-1.5 font-black text-xs"
            title="Revenir à la liste des promotions"
          >
            <span translate="no" className="material-symbols-outlined text-base">arrow_back</span>
            <span>Retour aux Promotions</span>
          </button>
          <div className="h-4 w-[1px] bg-neutral-300 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <span>Gestion École</span>
            <span>/</span>
            <span>Promotions</span>
            <span>/</span>
            <span className="text-[#1E293B] font-black">{classe.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={exportClassToExcel}
            className="px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exporter l'effectif au format Excel"
          >
            <span translate="no" className="material-symbols-outlined text-sm text-emerald-600">table_chart</span>
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => void exportClassToPDF()}
            className="px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Générer la fiche PDF officielle"
          >
            <span translate="no" className="material-symbols-outlined text-sm text-rose-600">picture_as_pdf</span>
            <span>Fiche PDF</span>
          </button>

          <button
            onClick={() => setShowExcelImport(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
          >
            <span translate="no" className="material-symbols-outlined text-base">upload_file</span>
            <span>Inscription Massive Excel (Smart AI)</span>
          </button>

          <button
            onClick={() => onEditClasse(classe)}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer border-0"
          >
            <span translate="no" className="material-symbols-outlined text-sm">edit</span>
            <span>Modifier</span>
          </button>
        </div>
      </div>

      {/* Immersive Class Hero Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#1E293B] to-neutral-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
          <span translate="no" className="material-symbols-outlined text-[180px]">school</span>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-black tracking-wider uppercase shadow-xs">
              Cycle {classe.level}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold">
              {filiereName}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              {price == null ? 'Tarif non renseigné' : `${fcfa(price)} / an`}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span translate="no" className="material-symbols-outlined text-amber-400 text-3xl">school</span>
              {classe.name}
            </h1>
            <p className="text-xs text-neutral-300 font-semibold mt-1">
              Espace de pilotage dédié • Identifiant Système : <code className="text-amber-300 font-mono">{classe.id}</code>
            </p>
          </div>

          {/* Metric KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Effectif Actuel</span>
              <span className="text-xl font-black text-white mt-0.5 block">{totalStudents} / {capacity ?? '—'}</span>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`${capaciteDepassee ? 'bg-amber-400' : 'bg-primary'} h-full rounded-full transition-all`} style={{ width: `${occupancyRate ?? 0}%` }} />
              </div>
              {/* 16/11 : capacité dépassée annoncée (avant : « 100% de remplissage », le taux étant plafonné) */}
              <span id="classe-remplissage" className={`text-[9px] block mt-1 ${capaciteDepassee ? 'text-amber-300 font-bold' : 'text-neutral-400'}`}>
                {occupancyRate == null ? 'Capacité non renseignée'
                  : capaciteDepassee && capacity != null ? `Capacité dépassée de ${avecNombre(totalStudents - capacity, 'élève')}`
                    : `${occupancyRate}\u00a0% de remplissage`}
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Cours Planifiés</span>
              <span className="text-xl font-black text-amber-300 mt-0.5 block">{classSlots.length} Séances</span>
              <span className="text-[10px] text-neutral-400 block mt-2">{classSlots.length * 2} heures de cours / semaine</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Frais Annuels</span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">{fcfa(price)}</span>
              <span className="text-[10px] text-neutral-400 block mt-2">par élève</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Budget Promotion</span>
              <span className="text-xl font-black text-white mt-0.5 block truncate">
                {expectedRevenue == null ? '—' : `${(expectedRevenue / 1000000).toFixed(1)}M FCFA`}
              </span>
              <span className="text-[10px] text-emerald-300 block mt-2">{expectedRevenue == null ? 'Tarif non renseigné' : 'Montant attendu (tarif × effectif)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-neutral-200">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 border-0 ${
              activeTab === 'students'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-base">groups</span>
            <span>Effectif & Étudiants ({totalStudents})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 border-0 ${
              activeTab === 'schedule'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-base">calendar_month</span>
            <span>Emploi du Temps ({classSlots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 border-0 ${
              activeTab === 'subjects'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-base">menu_book</span>
            <span>Matières & Enseignants ({subjectsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finances')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 border-0 ${
              activeTab === 'finances'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-base">payments</span>
            <span>Recouvrement & Frais Scolaires</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
        {/* TAB 1: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-5">
            {/* flex-wrap (16/11) : avec le 3e bouton, les boutons passent sous la recherche quand la place manque */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-grow min-w-[14rem] max-w-lg">
                <div className="relative flex-grow">
                  <span translate="no" className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Rechercher dans cette classe (nom ou matricule)…"
                    aria-label="Rechercher un élève de cette classe par nom ou matricule"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowExcelImport(true)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span translate="no" className="material-symbols-outlined text-sm text-emerald-600">upload_file</span>
                  <span>Importer Excel / CSV</span>
                </button>
                {/* 16/11 : élève déjà inscrit dans l'école (souvent sans classe) rangé dans cette classe ; liste relue */}
                <AjouterEleveExistant
                  classe={classe}
                  onRelu={(eleves) => {
                    setClassStudents(eleves);
                    if (onUpdateStudents) onUpdateStudents(eleves);
                  }}
                />
                <button
                  onClick={() => setIsAddingStudent(!isAddingStudent)}
                  className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl shadow hover:bg-[#921316] transition-all flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <span translate="no" className="material-symbols-outlined text-sm font-black">
                    {isAddingStudent ? 'close' : 'person_add'}
                  </span>
                  <span>{isAddingStudent ? 'Fermer' : 'Inscrire un Élève'}</span>
                </button>
              </div>
            </div>

            {/* Manual Enrollment Form */}
            {isAddingStudent && (
              <form onSubmit={handleManualEnroll} className="p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 animate-fade-in">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span translate="no" className="material-symbols-outlined text-sm">person_add</span>
                  Inscription manuelle dans {classe.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Nom & Prénom *</label>
                    <input
                      type="text"
                      name="nom"
                      required
                      placeholder="ex. Fatou Sow"
                      value={newStudentName}
                      onChange={e => setNewStudentName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Matricule</label>
                    <input
                      type="text"
                      placeholder="Généré automatiquement si vide"
                      value={newStudentMatricule}
                      onChange={e => setNewStudentMatricule(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Email {newStudentSansEmail ? '' : '* '}(identifiant de connexion)</label>
                    <input
                      type="email"
                      name="email"
                      required={!newStudentSansEmail}
                      disabled={newStudentSansEmail}
                      placeholder={newStudentSansEmail ? 'Connexion par matricule' : 'prenom.nom@exemple.sn'}
                      value={newStudentEmail}
                      onChange={e => setNewStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary disabled:bg-neutral-100"
                    />
                    <label className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-neutral-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStudentSansEmail}
                        onChange={e => { setNewStudentSansEmail(e.target.checked); if (e.target.checked) setNewStudentEmail(''); }}
                      />
                      Sans e-mail (connexion par matricule)
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="+221 …"
                      value={newStudentPhone}
                      onChange={e => setNewStudentPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 font-semibold m-0">
                  Le compte est créé dans l'école ; un mot de passe provisoire est généré par le serveur et affiché une seule fois, avec une fiche à imprimer.
                  L'élève est affecté à cette classe.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl border-0 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={enrolling}
                    className="px-5 py-1.5 bg-primary text-white text-xs font-black rounded-xl shadow hover:bg-[#921316] transition-all border-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {enrolling ? 'Création en cours…' : 'Créer le compte élève'}
                  </button>
                </div>
              </form>
            )}

            {/* Students Table with interactive toggle status */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-600">
                <thead>
                  <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                    <th className="px-5 py-3.5">Élève</th>
                    <th className="px-5 py-3.5">Matricule</th>
                    <th className="px-5 py-3.5">Badge & Accès</th>
                    <th className="px-5 py-3.5">Téléphone</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-neutral-500 font-bold">
                        {/* 16/11 : la recherche ne porte que sur les élèves de la classe ; avant, une recherche sans résultat
                            affichait « aucun élève affecté », comme si la classe était vide */}
                        {classStudents.length === 0 || !studentSearch.trim() ? (
                          'Aucun élève dans cette classe pour l\'instant.'
                        ) : (
                          <span className="inline-flex flex-col items-center gap-2">
                            <span>Aucun élève de cette classe ne correspond à « {studentSearch.trim()} ».</span>
                            <button type="button" onClick={() => setStudentSearch('')}
                              className="text-xs font-bold text-primary underline underline-offset-2 cursor-pointer">
                              Effacer la recherche
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(st => (
                      <tr key={st.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-5 py-3.5 text-[#1E293B]">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                              {st.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-[#1E293B] m-0 text-xs">{st.name}</p>
                              <p className="text-[10px] text-neutral-400 font-normal m-0">{st.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-700">{st.matricule}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => toggleStudentQrStatus(st.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase cursor-pointer border-0 transition-all ${
                              st.qrStatus === 'AUTORISÉ'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Cliquer pour suspendre / réactiver l'élève (badge et connexion)"
                          >
                            {st.qrStatus}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-neutral-600 text-[11px] font-bold">
                          {st.phoneParent || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => handleRemoveStudent(st.id, st.name)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent inline-flex items-center"
                            title="Retirer cet élève de l'école"
                          >
                            <span translate="no" className="material-symbols-outlined text-sm font-bold">delete</span>
                          </button>
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
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
                  Grille des Séances de {classe.name}
                </h4>
                <p className="text-[11px] text-neutral-400 font-semibold">Emploi du temps synchronisé avec les salles et enseignants.</p>
              </div>
              <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold">
                {classSlots.length} cours planifiés
              </span>
            </div>

            {classSlots.length === 0 ? (
              <div className="p-10 text-center bg-[#FAF8F6] border border-dashed border-neutral-200 rounded-3xl space-y-2">
                <span translate="no" className="material-symbols-outlined text-4xl text-neutral-300">event_busy</span>
                <p className="text-sm font-bold text-neutral-600">Aucun cours planifié pour le moment.</p>
                <p className="text-xs text-neutral-400">Rendez-vous dans "Planning & Affectations" pour assigner des créneaux à cette classe.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classSlots.map(slot => (
                  <div key={slot.id} className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs hover:border-primary/50 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary font-black text-[10px] uppercase">
                        {slot.day}
                      </span>
                      <span className="text-[11px] font-extrabold text-neutral-600">{slot.slot}</span>
                    </div>
                    <h5 className="font-black text-[#1E293B] text-sm">{slot.subject}</h5>
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="space-y-5">
            <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
              Modules d'Enseignement & Professeurs Titulaires
            </h4>
            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-600">
                <thead>
                  <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                    <th className="px-5 py-3.5">Matière / Module</th>
                    <th className="px-5 py-3.5">Enseignant Responsable</th>
                    <th className="px-5 py-3.5 text-center">Volume Hebdomadaire</th>
                    <th className="px-5 py-3.5 text-center">Statut Affectation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {subjectsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-neutral-400 font-bold">
                        Aucun module affecté pour l'instant.
                      </td>
                    </tr>
                  ) : (
                    subjectsList.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-5 py-3.5 text-[#1E293B] font-extrabold flex items-center gap-2">
                          <span translate="no" className="material-symbols-outlined text-sm text-primary">auto_stories</span>
                          {sub.subject}
                        </td>
                        <td className="px-5 py-3.5 text-neutral-700 font-bold">{sub.prof}</td>
                        <td className="px-5 py-3.5 text-center text-primary font-black">{sub.hours}h / semaine</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                            Affecté
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
          <div className="space-y-5">
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span translate="no" className="material-symbols-outlined text-emerald-600">account_balance_wallet</span>
                  Plan Financier — {classe.name}
                </h4>
                <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                  {price == null
                    ? 'Tarif annuel non renseigné pour cette classe : montants indisponibles.'
                    : `Frais de scolarité annuels fixés à ${fcfa(price)} par élève.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Attendu</span>
                <span className="text-xl font-black text-[#1E293B] block mt-1">{fcfa(expectedRevenue)}</span>
                <span className="text-[10px] text-neutral-500 font-semibold">{totalStudents} élèves inscrits × tarif annuel</span>
              </div>
              <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Versements des élèves</span>
                <p className="text-[11px] text-neutral-600 font-semibold mt-1 m-0">
                  Les versements réels et le reste dû de chaque élève sont suivis dans Finances › Écolages. L'accès d'un
                  élève au campus, à l'application et au bulletin ne dépend jamais des frais de scolarité.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Excel Import Modal */}
      {showExcelImport && (
        <SmartExcelImportModal
          classeName={classe.name}
          classeLevel={classe.level}
          classeId={classe.id}
          onClose={() => setShowExcelImport(false)}
          onImportComplete={handleBulkImportComplete}
        />
      )}

      {motDePasseInfo && (
        <MotDePasseProvisoireModal
          nom={motDePasseInfo.nom}
          identifiant={motDePasseInfo.identifiant}
          motDePasse={motDePasseInfo.motDePasse}
          connexionParMatricule={motDePasseInfo.connexionParMatricule}
          fiche={{
            nom: motDePasseInfo.nom,
            classe: classe.name,
            matricule: motDePasseInfo.matricule,
            identifiant: motDePasseInfo.identifiant,
            connexionParMatricule: motDePasseInfo.connexionParMatricule,
          }}
          onClose={() => setMotDePasseInfo(null)}
        />
      )}
    </div>
  );
}

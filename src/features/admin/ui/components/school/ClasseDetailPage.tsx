import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { Classe, Filiere, PlanningSlot } from '../../../domain/SchoolModels';
import { Student, mapStudentFromApi } from '../../../domain/StudentModels';
import { SmartExcelImportModal } from './SmartExcelImportModal';
import { MotDePasseProvisoireModal } from '../MotDePasseProvisoireModal';
import { apiClient } from '@/shared/lib/apiClient';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { afficherErreur } from '@/shared/lib/validationPersonnalisee';

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fcfa = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('fr-FR')} FCFA`);

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
  allStudents = [],
  onBack,
  onEditClasse,
  onUpdateStudents,
}: Props) {
  const [activeTab, setActiveTab] = useState<'students' | 'schedule' | 'subjects' | 'finances'>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REGLE' | 'RETARD'>('ALL');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);

  // Form states for manual student add
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentMatricule, setNewStudentMatricule] = useState('');   // vide = généré par le serveur
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [motDePasseInfo, setMotDePasseInfo] = useState<{ nom: string; email: string; motDePasse: string } | null>(null);

  // Élèves de cette classe : uniquement ceux que le serveur rattache à la classe (aucun élève emprunté à d'autres classes)
  const [classStudents, setClassStudents] = useState<Student[]>(() =>
    allStudents.filter(s => (s.classeId ? s.classeId === classe.id : !!s.classe && s.classe.toLowerCase() === classe.name.toLowerCase()))
  );

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
  const paidCount = classStudents.filter(s => s.financialStatus === 'En Règle').length;
  const lateCount = classStudents.filter(s => s.financialStatus === 'En Retard').length;
  const unknownCount = totalStudents - paidCount - lateCount;
  const expectedRevenue = price != null ? totalStudents * price : null;
  const collectedRevenue = price != null ? paidCount * price : null;
  const remainingRevenue = price != null ? lateCount * price : null;
  const knownCount = paidCount + lateCount;
  const collectionRate = knownCount > 0 ? Math.round((paidCount / knownCount) * 100) : null;
  const occupancyRate = capacity ? Math.min(100, Math.round((totalStudents / capacity) * 100)) : null;

  const filteredStudents = classStudents.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.matricule.toLowerCase().includes(studentSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'REGLE') return s.financialStatus === 'En Règle';
    if (statusFilter === 'RETARD') return s.financialStatus === 'En Retard';
    return true;
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
    if (!EMAIL_VALIDE.test(email)) {
      const champ = form.querySelector<HTMLInputElement>('input[name="email"]');
      if (champ) afficherErreur(champ, 'Une adresse e-mail valide est obligatoire (identifiant de connexion).');
      return;
    }

    const body: Record<string, string> = { name: nom, email, classeId: classe.id };
    if (newStudentPhone.trim()) body.telephone = newStudentPhone.trim();
    if (newStudentMatricule.trim()) body.matricule = newStudentMatricule.trim();

    setEnrolling(true);
    try {
      const { data } = await apiClient.post<any>('/admin/students', body);
      const cree = mapStudentFromApi(data);
      const updated = [cree, ...classStudents];
      setClassStudents(updated);
      if (onUpdateStudents) onUpdateStudents(updated);
      toast.success(`Compte élève créé pour ${cree.name}.`);
      if (data?.motDePasseProvisoire) {
        setMotDePasseInfo({ nom: cree.name, email: cree.email, motDePasse: data.motDePasseProvisoire });
      }
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentMatricule('');
      setNewStudentPhone('');
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

  const toggleStudentFinancialStatus = async (id: string) => {
    const st = classStudents.find(s => s.id === id);
    if (!st) return;
    const next: 'En Règle' | 'En Retard' = st.financialStatus === 'En Règle' ? 'En Retard' : 'En Règle';
    try {
      const { data } = await apiClient.patch<any>(`/admin/students/${id}/status`, { statutFrais: next });
      const confirme: Student['financialStatus'] = data?.status === 'En Retard' || data?.status === 'En Règle' ? data.status : next;
      setClassStudents(prev => prev.map(s => (s.id === id ? { ...s, financialStatus: confirme } : s)));
      toast.success(`${st.name} : statut de frais « ${confirme} » enregistré.`);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  const toggleStudentQrStatus = async (id: string) => {
    const st = classStudents.find(s => s.id === id);
    if (!st) return;
    try {
      const { data } = await apiClient.patch<any>(`/admin/students/${id}/toggle-status`);
      const qrStatus: Student['qrStatus'] = data?.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ';
      const status: Student['status'] = data?.status === 'Suspendu' ? 'Suspendu' : 'Actif';
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
      'Statut Frais': s.financialStatus,
      'Badge Accès': s.qrStatus,
      'Téléphone': s.phoneParent || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Effectif');
    XLSX.writeFile(wb, `Promotion_${classe.name.replace(/\s+/g, '_')}_Effectif.xlsx`);
    toast.success('Fiche promotionnelle exportée en Excel avec succès !');
  };

  // Export de la promotion en PDF officiel
  const exportClassToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`ÉCOLE 221 - FICHE DE PROMOTION`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Classe : ${classe.name} (${classe.level})`, 14, 30);
    doc.text(`Filière : ${filiereName}`, 14, 38);
    doc.text(`Effectif : ${totalStudents} élèves • Frais annuels : ${fcfa(price)}`, 14, 46);
    doc.text(`Taux de Recouvrement : ${collectionRate == null ? '—' : `${collectionRate}%`} (${paidCount} à jour / ${lateCount} en retard / ${unknownCount} non renseigné)`, 14, 54);

    doc.setLineWidth(0.5);
    doc.line(14, 58, 196, 58);

    doc.setFontSize(10);
    let y = 68;
    doc.setFont('helvetica', 'bold');
    doc.text('N°', 14, y);
    doc.text('Nom & Prénom', 26, y);
    doc.text('Matricule', 85, y);
    doc.text('Téléphone', 125, y);
    doc.text('Statut Frais', 160, y);

    doc.setFont('helvetica', 'normal');
    classStudents.forEach((s, idx) => {
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(idx + 1), 14, y);
      doc.text(s.name.substring(0, 28), 26, y);
      doc.text(s.matricule, 85, y);
      doc.text(s.phoneParent || '—', 125, y);
      doc.text(s.financialStatus, 160, y);
    });

    doc.save(`Fiche_Officielle_${classe.name.replace(/\s+/g, '_')}.pdf`);
    toast.success('Document PDF officiel de la promotion téléchargé !');
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
            onClick={exportClassToPDF}
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
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${occupancyRate ?? 0}%` }} />
              </div>
              <span className="text-[9px] text-neutral-400 block mt-1">{occupancyRate == null ? 'Capacité non renseignée' : `${occupancyRate}% de remplissage`}</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Cours Planifiés</span>
              <span className="text-xl font-black text-amber-300 mt-0.5 block">{classSlots.length} Séances</span>
              <span className="text-[10px] text-neutral-400 block mt-2">{classSlots.length * 2} heures de cours / semaine</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Taux Recouvrement</span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">{collectionRate == null ? '—' : `${collectionRate}%`}</span>
              <span className="text-[10px] text-neutral-400 block mt-2">{paidCount} à jour • {lateCount} en retard • {unknownCount} non renseigné</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] text-neutral-300 uppercase font-black block">Budget Promotion</span>
              <span className="text-xl font-black text-white mt-0.5 block truncate">
                {expectedRevenue == null ? '—' : `${(expectedRevenue / 1000000).toFixed(1)}M FCFA`}
              </span>
              <span className="text-[10px] text-emerald-300 block mt-2">{collectedRevenue == null ? 'Tarif non renseigné' : `${(collectedRevenue / 1000000).toFixed(1)}M estimé à jour`}</span>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-grow max-w-lg">
                <div className="relative flex-grow">
                  <span translate="no" className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou matricule..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex bg-neutral-100 p-1 rounded-xl text-[10px] font-black shrink-0">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer border-0 ${statusFilter === 'ALL' ? 'bg-white text-primary shadow-xs' : 'text-neutral-500'}`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setStatusFilter('REGLE')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer border-0 ${statusFilter === 'REGLE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-neutral-500'}`}
                  >
                    En Règle ({paidCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('RETARD')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer border-0 ${statusFilter === 'RETARD' ? 'bg-white text-red-700 shadow-xs' : 'text-neutral-500'}`}
                  >
                    En Retard ({lateCount})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExcelImport(true)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span translate="no" className="material-symbols-outlined text-sm text-emerald-600">upload_file</span>
                  <span>Importer Excel / CSV</span>
                </button>
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
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Email * (identifiant de connexion)</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="prenom.nom@exemple.sn"
                      value={newStudentEmail}
                      onChange={e => setNewStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                    />
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
                  Le compte est créé dans l'école ; un mot de passe provisoire est généré par le serveur et affiché une seule fois.
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
                    <th className="px-5 py-3.5">Statut Paiement</th>
                    <th className="px-5 py-3.5">Badge & Accès</th>
                    <th className="px-5 py-3.5">Téléphone</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-neutral-400 font-bold">
                        Aucun élève affecté à cette classe pour le moment.
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
                            onClick={() => toggleStudentFinancialStatus(st.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer border-0 transition-all ${
                              st.financialStatus === 'En Règle'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : st.financialStatus === 'En Retard'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                            title="Cliquer pour basculer le statut financier"
                          >
                            {st.financialStatus}
                          </button>
                        </td>
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
                  Plan Financier & Recouvrement — {classe.name}
                </h4>
                <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                  {price == null
                    ? 'Tarif annuel non renseigné pour cette classe : montants indisponibles.'
                    : `Frais de scolarité annuels fixés à ${fcfa(price)} par élève.`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-900 block">Taux de Recouvrement</span>
                <span className="text-2xl font-black text-emerald-600">{collectionRate == null ? '—' : `${collectionRate}%`}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Attendu</span>
                <span className="text-xl font-black text-[#1E293B] block mt-1">{fcfa(expectedRevenue)}</span>
                <span className="text-[10px] text-neutral-500 font-semibold">{totalStudents} étudiants inscrits</span>
              </div>
              <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Déjà Encaissé</span>
                <span className="text-xl font-black text-emerald-600 block mt-1">{fcfa(collectedRevenue)}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{paidCount} étudiants à jour</span>
              </div>
              <div className="p-5 bg-white border border-rose-200 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-rose-600 block">Reste à Recouvrer</span>
                <span className="text-xl font-black text-rose-600 block mt-1">{fcfa(remainingRevenue)}</span>
                <span className="text-[10px] text-rose-700 font-semibold">{lateCount} étudiants débiteurs</span>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
                  Élèves avec Retard de Paiement ({lateCount})
                </h5>
                {lateCount > 0 && (
                  <button
                    onClick={() => toast.info("Relances SMS / WhatsApp indisponibles : aucun service d'envoi n'est relié au serveur.")}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer border-0 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span translate="no" className="material-symbols-outlined text-sm">send</span>
                    <span>Envoyer Relance SMS / WhatsApp</span>
                  </button>
                )}
              </div>

              {lateCount === 0 ? (
                <div className="py-4 text-emerald-600 text-xs font-bold flex items-center gap-2">
                  <span translate="no" className="material-symbols-outlined text-lg">check_circle</span>
                  <span>Aucun élève de cette classe n'est enregistré en retard de paiement.</span>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {classStudents.filter(s => s.financialStatus === 'En Retard').map(s => (
                    <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-[#1E293B]">{s.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono ml-2">({s.matricule})</span>
                        <p className="text-[10px] text-neutral-500 m-0">Téléphone : {s.phoneParent || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStudentFinancialStatus(s.id)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer border border-emerald-200"
                        >
                          Marquer en règle
                        </button>
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 font-black text-[10px] rounded-full uppercase">
                          Solde en attente
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          identifiant={motDePasseInfo.email}
          motDePasse={motDePasseInfo.motDePasse}
          onClose={() => setMotDePasseInfo(null)}
        />
      )}
    </div>
  );
}

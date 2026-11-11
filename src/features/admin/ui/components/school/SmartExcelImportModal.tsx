import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Student, mapStudentFromApi } from '../../../domain/StudentModels';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';

interface Props {
  classeName: string;
  classeLevel: string;
  classeId: string;
  onClose: () => void;
  onImportComplete: (importedStudents: Student[]) => void;
}

/** Ligne du fichier, telle que lue : aucune valeur n'est inventée ou « réparée » automatiquement. */
export interface EditableStudentRow {
  id: string;
  name: string;
  matricule: string;   // vide = généré par le serveur
  email: string;       // obligatoire (identifiant de connexion)
  telephone: string;
  statutFrais: 'En Règle' | 'En Retard' | null;   // null = non renseigné
  warnings: string[];  // erreurs bloquantes (ligne non importable tant qu'elles existent)
  selected: boolean;
}

type ImportField = 'name' | 'matricule' | 'email' | 'telephone' | 'statutFrais';

const SYSTEM_FIELDS: { field: ImportField; label: string; keywords: string[]; required: boolean }[] = [
  { field: 'name', label: 'Nom & Prénom', keywords: ['nom', 'name', 'prenom', 'prénom', 'full', 'etudiant', 'élève', 'eleve'], required: true },
  { field: 'email', label: 'Email Étudiant (identifiant de connexion)', keywords: ['email', 'e-mail', 'mail', 'courriel'], required: true },
  { field: 'matricule', label: 'Matricule / Identifiant', keywords: ['matr', 'numero', 'identifiant', 'carte', 'badge'], required: false },
  { field: 'telephone', label: 'Téléphone', keywords: ['tel', 'telephone', 'téléphone', 'portable', 'whatsapp', 'phone', 'contact'], required: false },
  { field: 'statutFrais', label: 'Statut Paiement / Frais', keywords: ['statut', 'frais', 'paiement', 'finance', 'regle', 'solde', 'retard', 'ecolage'], required: false },
];

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Erreurs bloquantes d'une ligne : nom et e-mail valide obligatoires (exigences du serveur). */
function verifierLigne(r: Pick<EditableStudentRow, 'name' | 'email'>): string[] {
  const erreurs: string[] = [];
  if (!r.name.trim()) erreurs.push('Nom manquant');
  if (!r.email.trim()) erreurs.push('Email manquant');
  else if (!EMAIL_VALIDE.test(r.email.trim())) erreurs.push('Email invalide');
  return erreurs;
}

function lireStatutFrais(brut: string): 'En Règle' | 'En Retard' | null {
  const v = brut.trim().toLowerCase();
  if (!v) return null;
  if (v.includes('retard') || v.includes('impay')) return 'En Retard';
  if (v.includes('règle') || v.includes('regle') || v.includes('payé') || v.includes('paye') || v.includes('a jour') || v.includes('à jour')) return 'En Règle';
  return null;   // valeur non reconnue : non renseigné (jamais supposé)
}

interface ResultatImport {
  inscrits: Student[];
  echecs: { name: string; email: string; raison: string }[];
  motsDePasse: { name: string; email: string; matricule: string; motDePasse: string }[];
  avertissements: string[];
}

function champCsv(v: string): string {
  return /[",;\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function SmartExcelImportModal({
  classeName,
  classeLevel,
  classeId,
  onClose,
  onImportComplete,
}: Props) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [previewStudents, setPreviewStudents] = useState<EditableStudentRow[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ANOMALIES' | 'VALID'>('ALL');
  const [isImporting, setIsImporting] = useState(false);
  const [progression, setProgression] = useState(0);
  const [resultat, setResultat] = useState<ResultatImport | null>(null);

  // File parsing (.xlsx, .xls, .csv)
  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          toast.error("Le fichier ne contient pas assez de données (au moins 1 entête et 1 ligne requises).");
          return;
        }

        const headers = json[0].map(h => String(h || '').trim()).filter(Boolean);
        const rows = json.slice(1).filter(r => r.some((c: any) => c !== undefined && c !== null && String(c).trim() !== ''));

        setRawHeaders(headers);
        setRawRows(rows);

        // Auto-Mapping heuristique
        const autoMap: Record<string, string> = {};
        SYSTEM_FIELDS.forEach(sf => {
          const match = headers.find(h => {
            const hLower = h.toLowerCase();
            return sf.keywords.some(kw => hLower.includes(kw));
          });
          if (match) {
            autoMap[sf.field] = match;
          }
        });

        setMappings(autoMap);
        setStep('mapping');
        toast.success(`Fichier analysé avec succès : ${rows.length} lignes détectées !`);
      } catch (err) {
        console.error('Erreur lecture Excel:', err);
        toast.error("Format de fichier non reconnu. Fournissez un fichier .xlsx, .xls ou .csv valide.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleGeneratePreview = () => {
    if (!mappings['name'] || !mappings['email']) {
      toast.error('Veuillez associer au minimum les colonnes « Nom & Prénom » et « Email » (identifiant de connexion obligatoire).');
      return;
    }

    const headerIndexes: Record<string, number> = {};
    rawHeaders.forEach((h, idx) => {
      headerIndexes[h] = idx;
    });

    const parsed: EditableStudentRow[] = rawRows.map((row, idx) => {
      const getVal = (sysField: string): string => {
        const hName = mappings[sysField];
        if (!hName) return '';
        const colIdx = headerIndexes[hName];
        if (colIdx === undefined || row[colIdx] === undefined || row[colIdx] === null) return '';
        return String(row[colIdx]).trim();
      };

      const name = getVal('name');
      const email = getVal('email');
      const erreurs = verifierLigne({ name, email });

      return {
        id: `ligne-${idx + 2}`,   // numéro de ligne dans le fichier (entête = ligne 1)
        name,
        matricule: getVal('matricule'),
        email,
        telephone: getVal('telephone'),
        statutFrais: lireStatutFrais(getVal('statutFrais')),
        warnings: erreurs,
        selected: erreurs.length === 0,   // une ligne invalide n'est pas importée
      };
    });

    setPreviewStudents(parsed);
    setStep('preview');
  };

  const handleUpdateStudentField = (index: number, field: 'name' | 'matricule' | 'email' | 'telephone', value: string) => {
    setPreviewStudents(prev => {
      const copy = [...prev];
      const ligne = { ...copy[index], [field]: value };
      ligne.warnings = verifierLigne(ligne);
      if (ligne.warnings.length > 0) ligne.selected = false;
      copy[index] = ligne;
      return copy;
    });
  };

  const toggleSelectStudent = (index: number) => {
    setPreviewStudents(prev => {
      const copy = [...prev];
      if (copy[index].warnings.length > 0) {
        toast.error('Corrigez d\'abord le nom et l\'e-mail de cette ligne.');
        return prev;
      }
      copy[index] = { ...copy[index], selected: !copy[index].selected };
      return copy;
    });
  };

  const toggleSelectAll = (select: boolean) => {
    setPreviewStudents(prev => prev.map(s => ({ ...s, selected: select && s.warnings.length === 0 })));
  };

  const handleFinalImport = async () => {
    const selectedStudents = previewStudents.filter(s => s.selected && s.warnings.length === 0);
    if (selectedStudents.length === 0) {
      toast.error('Veuillez sélectionner au moins un élève valide à inscrire.');
      return;
    }

    setIsImporting(true);
    setProgression(0);
    const res: ResultatImport = { inscrits: [], echecs: [], motsDePasse: [], avertissements: [] };
    try {
      // Tous les élèves sélectionnés sont envoyés, un par un ; seul le serveur fait foi
      for (const st of selectedStudents) {
        const body: Record<string, string> = { name: st.name.trim(), email: st.email.trim(), classeId };
        if (st.matricule.trim()) body.matricule = st.matricule.trim();
        if (st.telephone.trim()) body.telephone = st.telephone.trim();
        try {
          const { data } = await apiClient.post<any>('/admin/students', body);
          let eleve = mapStudentFromApi(data);
          if (data?.motDePasseProvisoire) {
            res.motsDePasse.push({ name: eleve.name, email: eleve.email, matricule: eleve.matricule, motDePasse: data.motDePasseProvisoire });
          }
          if (st.statutFrais) {
            try {
              await apiClient.patch(`/admin/students/${eleve.id}/status`, { statutFrais: st.statutFrais });
              eleve = { ...eleve, financialStatus: st.statutFrais };
            } catch (err) {
              res.avertissements.push(`${eleve.name} : compte créé, statut de frais non enregistré (${resolveErrorMessage(err)})`);
            }
          }
          res.inscrits.push(eleve);
        } catch (err) {
          res.echecs.push({ name: st.name, email: st.email, raison: resolveErrorMessage(err) });
        }
        setProgression(p => p + 1);
      }

      if (res.inscrits.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#B3181C', '#F59E0B'],
        });
        onImportComplete(res.inscrits);
      }
      const message = `${res.inscrits.length} inscrit${res.inscrits.length > 1 ? 's' : ''}, ${res.echecs.length} échec${res.echecs.length > 1 ? 's' : ''}`;
      if (res.echecs.length === 0) toast.success(message);
      else if (res.inscrits.length === 0) toast.error(`${message} (${res.echecs[0].raison})`);
      else toast.warning(`${message} (${res.echecs[0].raison})`);
      setResultat(res);
    } finally {
      setIsImporting(false);
    }
  };

  /** Mots de passe provisoires : fichier CSV généré dans le navigateur, jamais envoyé ni journalisé. */
  const telechargerMotsDePasse = () => {
    if (!resultat || resultat.motsDePasse.length === 0) return;
    const lignes = [
      ['Nom', 'Email', 'Matricule', 'Mot de passe provisoire'].join(';'),
      ...resultat.motsDePasse.map(m => [m.name, m.email, m.matricule, m.motDePasse].map(champCsv).join(';')),
    ];
    const blob = new Blob(['\uFEFF' + lignes.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mots_de_passe_provisoires_${classeName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fermer = async () => {
    if (resultat && resultat.motsDePasse.length > 0) {
      const ok = await demanderConfirmation(
        'Les mots de passe provisoires ne seront plus affichés. Avez-vous téléchargé le fichier CSV ?',
        { titre: 'Fermer l\'import', confirmer: 'Fermer', annuler: 'Rester' }
      );
      if (!ok) return;
    }
    onClose();
  };

  const downloadCleanTemplate = () => {
    // Modèle vierge : uniquement l'entête attendue (aucune personne fictive)
    const ws = XLSX.utils.aoa_to_sheet([
      ['Nom & Prénom', 'Email', 'Matricule', 'Téléphone', 'Statut Frais'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
    XLSX.writeFile(wb, `Modele_Standard_${classeName.replace(/\s+/g, '_')}.xlsx`);
    toast.info('Modèle Excel vierge téléchargé.');
  };

  const totalWarnings = previewStudents.reduce((acc, s) => acc + s.warnings.length, 0);
  const selectedCount = previewStudents.filter(s => s.selected).length;

  const displayedPreviewStudents = previewStudents.filter(s => {
    if (filterMode === 'ANOMALIES') return s.warnings.length > 0;
    if (filterMode === 'VALID') return s.warnings.length === 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in" id="smart-excel-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-primary to-neutral-900 text-white p-5 sm:p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 font-black">
              <span translate="no" className="material-symbols-outlined text-2xl">table_view</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Inscription Massive Excel • {classeName}
              </h3>
              <p className="text-[11px] text-white/80 font-semibold">
                Association automatique des colonnes, vérification des lignes et édition avant envoi
              </p>
            </div>
          </div>
          <button
            onClick={fermer}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0"
          >
            <span translate="no" className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="bg-[#FAF8F6] border-b border-neutral-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-neutral-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'upload' ? 'bg-primary text-white' : 'bg-emerald-500 text-white'
            }`}>
              {step !== 'upload' ? '✓' : '1'}
            </span>
            <span className={step === 'upload' ? 'text-primary font-black' : 'text-neutral-700'}>
              Fichier Excel / CSV
            </span>
          </div>
          <span className="text-neutral-300 font-black">→</span>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'mapping' ? 'bg-primary text-white' : step === 'preview' ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {step === 'preview' ? '✓' : '2'}
            </span>
            <span className={step === 'mapping' ? 'text-primary font-black' : 'text-neutral-700'}>
              Mappage Intellectuel
            </span>
          </div>
          <span className="text-neutral-300 font-black">→</span>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'preview' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              3
            </span>
            <span className={step === 'preview' ? 'text-primary font-black' : 'text-neutral-500'}>
              Validation & Édition en Direct
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-5">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-5 text-center">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileProcess(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-3xl p-10 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span translate="no" className="material-symbols-outlined text-4xl">upload_file</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#1E293B]">Glissez-déposez votre fichier Excel ou CSV ici</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Fichiers <strong>.xlsx, .xls, .csv</strong> — colonnes obligatoires : <strong>Nom & Prénom</strong> et <strong>Email</strong>
                  </p>
                </div>
                <input
                  type="file"
                  id="excel-file-drop"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                />
                <label
                  htmlFor="excel-file-drop"
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-md hover:bg-[#921316] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span translate="no" className="material-symbols-outlined text-sm">folder_open</span>
                  Parcourir mes fichiers
                </label>
              </div>

              {/* Modèle vierge */}
              <div className="grid grid-cols-1 gap-3 text-left">
                <div className="p-4 bg-[#FAF8F6] border border-neutral-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase">
                      Modèle Vierge
                    </span>
                    <h5 className="text-xs font-black text-[#1E293B] mt-1">Feuille Standard</h5>
                    <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                      Entête attendue : Nom & Prénom, Email, Matricule (généré si vide), Téléphone, Statut Frais.
                    </p>
                  </div>
                  <button
                    onClick={downloadCleanTemplate}
                    className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span translate="no" className="material-symbols-outlined text-sm text-emerald-600">download</span>
                    <span>Modèle .xlsx</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SMART MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span translate="no" className="material-symbols-outlined text-emerald-600 text-xl">auto_awesome</span>
                  <div>
                    <h5 className="text-xs font-black text-emerald-900">
                      Association des colonnes ({rawRows.length} lignes détectées)
                    </h5>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      Vérifiez les colonnes proposées et réassignez-les si nécessaire.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-600">
                  <thead>
                    <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                      <th className="px-5 py-3">Champ Système École 221</th>
                      <th className="px-5 py-3">Reconnaissance IA</th>
                      <th className="px-5 py-3">Colonne Associée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {SYSTEM_FIELDS.map(sf => {
                      const currentMapped = mappings[sf.field] || '';
                      const isMatched = Boolean(currentMapped);

                      return (
                        <tr key={sf.field} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-[#1E293B]">
                            <div className="flex items-center gap-2">
                              <span>{sf.label}</span>
                              {sf.required && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-black">
                                  Requis
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {isMatched ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-max">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                Détecté automatiquement
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-max">
                                Non associé
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <select
                              value={currentMapped}
                              onChange={e => setMappings({ ...mappings, [sf.field]: e.target.value })}
                              className="px-3 py-1.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary"
                            >
                              <option value="">-- Ignorer ce champ --</option>
                              {rawHeaders.map(h => (
                                <option key={h} value={h}>
                                  Col: {h}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
                >
                  ← Choisir un autre fichier
                </button>
                <button
                  onClick={handleGeneratePreview}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow hover:bg-[#921316] transition-all flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <span>Prévisualiser & Valider ({rawRows.length} lignes)</span>
                  <span translate="no" className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & INLINE LIVE EDITING */}
          {step === 'preview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F6] p-3 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#1E293B]">Sélection : {selectedCount} / {previewStudents.length}</span>
                  <button
                    onClick={() => toggleSelectAll(true)}
                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-700 rounded text-[10px] font-bold border border-neutral-200 cursor-pointer"
                  >
                    Tout cocher
                  </button>
                  <button
                    onClick={() => toggleSelectAll(false)}
                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-700 rounded text-[10px] font-bold border border-neutral-200 cursor-pointer"
                  >
                    Tout décocher
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="bg-neutral-200/60 p-0.5 rounded-lg flex text-[10px] font-bold">
                    <button
                      onClick={() => setFilterMode('ALL')}
                      className={`px-2 py-1 rounded cursor-pointer border-0 ${filterMode === 'ALL' ? 'bg-white text-primary font-black shadow-xs' : 'text-neutral-600'}`}
                    >
                      Tous ({previewStudents.length})
                    </button>
                    <button
                      onClick={() => setFilterMode('ANOMALIES')}
                      className={`px-2 py-1 rounded cursor-pointer border-0 ${filterMode === 'ANOMALIES' ? 'bg-white text-amber-700 font-black shadow-xs' : 'text-neutral-600'}`}
                    >
                      Invalides ({previewStudents.filter(s => s.warnings.length > 0).length})
                    </button>
                    <button
                      onClick={() => setFilterMode('VALID')}
                      className={`px-2 py-1 rounded cursor-pointer border-0 ${filterMode === 'VALID' ? 'bg-white text-emerald-700 font-black shadow-xs' : 'text-neutral-600'}`}
                    >
                      Valides ({previewStudents.filter(s => s.warnings.length === 0).length})
                    </button>
                  </div>

                  {totalWarnings > 0 && (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-[10px] font-black">
                      Lignes invalides exclues : corrigez le nom ou l'e-mail pour les inclure
                    </span>
                  )}
                </div>
              </div>

              {/* Table with inline edit fields */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-600">
                  <thead className="sticky top-0 bg-[#FAF8F6] border-b border-neutral-200 z-10">
                    <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                      <th className="px-3 py-3 w-8 text-center">Inclure</th>
                      <th className="px-3 py-3">Nom & Prénom (Éditable)</th>
                      <th className="px-3 py-3">Matricule</th>
                      <th className="px-3 py-3">Email *</th>
                      <th className="px-3 py-3">Téléphone</th>
                      <th className="px-3 py-3">Statut Frais</th>
                      <th className="px-3 py-3">Vérification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {displayedPreviewStudents.map((st) => {
                      const origIndex = previewStudents.findIndex(p => p.id === st.id);
                      return (
                        <tr key={st.id} className={`transition-colors ${st.selected ? '' : 'opacity-40 bg-neutral-50'} ${st.warnings.length > 0 ? 'bg-amber-50/20' : 'hover:bg-neutral-50/60'}`}>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={st.selected}
                              disabled={st.warnings.length > 0}
                              onChange={() => toggleSelectStudent(origIndex)}
                              className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={st.name}
                              onChange={e => handleUpdateStudentField(origIndex, 'name', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-[#1E293B] focus:border-primary focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px]">
                            <input
                              type="text"
                              value={st.matricule}
                              placeholder="Généré si vide"
                              onChange={e => handleUpdateStudentField(origIndex, 'matricule', e.target.value)}
                              className="w-28 px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-mono text-neutral-700 focus:border-primary focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="email"
                              value={st.email}
                              onChange={e => handleUpdateStudentField(origIndex, 'email', e.target.value)}
                              className="w-40 px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-600 focus:border-primary focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={st.telephone}
                              onChange={e => handleUpdateStudentField(origIndex, 'telephone', e.target.value)}
                              className="w-32 px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-600 focus:border-primary focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-black text-[11px]">
                              {st.statutFrais ?? 'Non renseigné'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            {st.warnings.length === 0 ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase">
                                ✓ Valide
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {st.warnings.map((w, wi) => (
                                  <span key={wi} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                                    ⚠️ {w}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
                >
                  ← Ajuster le Mappage
                </button>
                <button
                  onClick={handleFinalImport}
                  disabled={isImporting || selectedCount === 0 || resultat !== null}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border-0 disabled:opacity-50"
                >
                  <span translate="no" className="material-symbols-outlined text-sm font-black">how_to_reg</span>
                  <span>{isImporting ? `Inscription en cours… (${progression} / ${selectedCount})` : `Confirmer & Inscrire les ${selectedCount} élèves sélectionnés`}</span>
                </button>
              </div>

              {/* Bilan réel de l'import (réponses du serveur) */}
              {resultat && (
                <div className="p-4 border border-neutral-200 rounded-2xl space-y-3 bg-[#FAF8F6]">
                  <h5 className="text-xs font-black text-[#1E293B] m-0">
                    Bilan : {resultat.inscrits.length} inscrit{resultat.inscrits.length > 1 ? 's' : ''}, {resultat.echecs.length} échec{resultat.echecs.length > 1 ? 's' : ''}
                  </h5>
                  {resultat.echecs.length > 0 && (
                    <ul className="text-[11px] text-red-700 font-semibold space-y-0.5 max-h-32 overflow-y-auto m-0 pl-4">
                      {resultat.echecs.map((e, i) => (
                        <li key={i}>{e.name || '(sans nom)'} — {e.email || '(sans e-mail)'} : {e.raison}</li>
                      ))}
                    </ul>
                  )}
                  {resultat.avertissements.length > 0 && (
                    <ul className="text-[11px] text-amber-800 font-semibold space-y-0.5 m-0 pl-4">
                      {resultat.avertissements.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  )}
                  {resultat.motsDePasse.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-amber-900 font-bold m-0">
                        {resultat.motsDePasse.length} mot{resultat.motsDePasse.length > 1 ? 's' : ''} de passe provisoire{resultat.motsDePasse.length > 1 ? 's' : ''} à transmettre — ils ne seront plus affichés après la fermeture.
                      </p>
                      <button
                        type="button"
                        onClick={telechargerMotsDePasse}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black border-0 cursor-pointer flex items-center gap-1"
                      >
                        <span translate="no" className="material-symbols-outlined text-sm">download</span>
                        Télécharger (CSV)
                      </button>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={fermer}
                      className="px-5 py-2 bg-primary text-white text-xs font-black rounded-xl shadow hover:bg-[#921316] transition-all border-0 cursor-pointer"
                    >
                      Terminer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

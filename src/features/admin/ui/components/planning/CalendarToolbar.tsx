import React, { useState } from 'react';
import { toast } from 'sonner';
import { CalendarSlot, DAYS } from '../../../domain/PlanningModels';
import { ouvrirDocumentImprimable, tableauHtml } from '@/shared/lib/documentImprimable';
import { nomDeFichier } from '@/shared/lib/documentOfficiel';

interface Props {
  readonly viewMode: 'classe' | 'salle' | 'prof';
  readonly setViewMode: (mode: 'classe' | 'salle' | 'prof') => void;
  readonly activeFilter: string;
  readonly setActiveFilter: (filter: string) => void;
  readonly filterOptions: string[];
  readonly slots: CalendarSlot[];
}

export function CalendarToolbar({
  viewMode,
  setViewMode,
  activeFilter,
  setActiveFilter,
  filterOptions,
  slots,
}: Props) {
  const [showExport, setShowExport] = useState(false);

  // Exports réels.
  const COLONNES = ['Jour', 'Créneau', 'Matière', 'Type', 'Enseignant', 'Salle', 'Classe'];
  const ordreJour = (j: string) => { const i = (DAYS as readonly string[]).indexOf(j); return i < 0 ? 99 : i; };
  const lignes = () => [...slots]
    .sort((x, y) => ordreJour(x.day) - ordreJour(y.day) || x.slot.localeCompare(y.slot))
    .map((s) => [s.day, s.slot, s.subject, s.type, s.prof || '—', s.room || '—', s.classe || '—']);
  const libelleFiltre = activeFilter === 'ALL' ? 'Toutes les classes'
    : `${viewMode === 'classe' ? 'Classe' : viewMode === 'salle' ? 'Salle' : 'Enseignant'} : ${activeFilter}`;

  const imprimer = () => {
    setShowExport(false);
    const ok = ouvrirDocumentImprimable({
      titre: 'Emploi du temps', sousTitre: libelleFiltre,
      corps: tableauHtml(COLONNES, lignes(), 'Aucun cours planifié pour cette sélection.'),
    });
    if (!ok) toast.error("La fenêtre d'impression a été bloquée par le navigateur : autorisez les fenêtres de ce site.");
  };

  const triggerDownload = async (format: 'excel' | 'csv') => {
    setShowExport(false);
    const nom = `emploi-du-temps-${nomDeFichier(activeFilter === 'ALL' ? 'toutes-les-classes' : activeFilter)}`;
    if (format === 'excel') {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([COLONNES, ...lignes()]), 'Emploi du temps');
      XLSX.writeFile(wb, `${nom}.xlsx`);
      return;
    }
    const cellule = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
    const contenu = [COLONNES, ...lignes()].map((l) => l.map(cellule).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + contenu], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nom}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const secureLink = `${window.location.origin}/etudiant/planning?shared=true&filter=${encodeURIComponent(activeFilter)}`;
    navigator.clipboard.writeText(secureLink).then(() => {
      toast.success('Lien copié dans le presse-papier !', { description: secureLink });
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F6] p-4 border border-neutral-200 rounded-2xl" id="calendar-toolbar">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase text-neutral-400">Vue Maître :</span>
        {(['classe', 'salle', 'prof'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => { setViewMode(mode); setActiveFilter('ALL'); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${viewMode === mode ? 'bg-primary text-white' : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'}`}
          >
            {mode === 'classe' ? 'Par Classe' : mode === 'salle' ? 'Par Salle' : 'Par Enseignant'}
          </button>
        ))}
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold bg-white text-neutral-700"
        >
          <option value="ALL">Afficher Tout</option>
          {filterOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={handleShare}
          className="px-3 py-1.5 text-xs font-bold bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg cursor-pointer flex items-center gap-1.5"
          title="Générer un lien de partage"
        >
          <span translate="no" className="material-symbols-outlined text-sm text-primary">share</span>
          <span>Partager</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="px-3 py-1.5 text-xs font-bold bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <span translate="no" className="material-symbols-outlined text-sm">download</span>
            <span>Exporter / Imprimer</span>
          </button>
          {showExport && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <button onClick={imprimer} className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-sm text-neutral-400">print</span> Imprimer ou PDF
              </button>
              <button onClick={() => void triggerDownload('excel')} className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-sm text-emerald-600">table_view</span> Feuille Excel
              </button>
              <button onClick={() => void triggerDownload('csv')} className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-sm text-blue-500">csv</span> Fichier CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTenantStore } from '@/core/store/tenantStore';
import type { Expense, StudentFinance } from '../../../domain/FinancesModels';
import { dateFr, libelleMois, moisCourant, sommeDepensesDuMois, sommeVersementsDuMois, type Versement } from './financesDonnees';
import { classeAffichee } from './ecolagesClasses';
import { creerDocument, enTete, formatMontant, nomDeFichier, paragraphe, piedsDePage, tableau, tableauCleValeur } from '@/shared/lib/documentOfficiel';
import { avecNombre } from '@/shared/lib/pluriel';

interface Props {
  dossiers: StudentFinance[];
  depenses: Expense[];
  versements: Versement[];
  /** Erreur de chargement des versements : le bilan n'est pas produit (il serait faux). */
  erreurVersements: string | null;
}


/**
 * Bilans & exports : vrais fichiers, construits dans le navigateur à partir des données du serveur
 * (PDF : jsPDF ; Excel : xlsx, bibliothèques déjà présentes dans l'application).
 */
export function ReportsTab({ dossiers, depenses, versements, erreurVersements }: Props) {
  const { currentTenant } = useTenantStore();
  const ecole = currentTenant?.name || 'Établissement';
  const [mois, setMois] = useState(moisCourant());
  const [enCours, setEnCours] = useState<'pdf' | 'excel' | null>(null);

  const bilanPdf = async () => {
    setEnCours('pdf');
    try {
      const nom = (id: string) => dossiers.find((d) => d.studentId === id)?.name ?? 'Élève inconnu';
      const vMois = versements.filter((v) => v.date.startsWith(mois)).sort((a, b) => a.date.localeCompare(b.date));
      const dMois = depenses.filter((e) => e.date && e.date.startsWith(mois)).sort((a, b) => a.date.localeCompare(b.date));
      const encaisse = sommeVersementsDuMois(versements, mois);
      const depense = sommeDepensesDuMois(depenses, mois);
      const d = await creerDocument();
      await enTete(d, 'Bilan du mois', libelleMois(mois).replace(/^./, (c) => c.toUpperCase()));
      tableauCleValeur(d, [
        ['Paiements encaissés', `${avecNombre(vMois.length, 'paiement')} — ${formatMontant(encaisse)}`],
        ['Dépenses', `${avecNombre(dMois.length, 'dépense')} — ${formatMontant(depense)}`],
        ['Trésorerie du mois (paiements − dépenses)', formatMontant(encaisse - depense)],
      ]);
      paragraphe(d, 'Paiements', { gras: true, taille: 11 });
      tableau(d, [{ titre: 'Date', largeur: 22 }, { titre: 'Élève', largeur: 52 }, { titre: 'Montant', largeur: 26, align: 'right' }],
        vMois.map((v) => [dateFr(v.date), nom(v.studentId), formatMontant(v.montant)]), 'Aucun paiement ce mois-ci.');
      paragraphe(d, 'Dépenses', { gras: true, taille: 11 });
      tableau(d, [{ titre: 'Date', largeur: 22 }, { titre: 'Libellé', largeur: 52 }, { titre: 'Montant', largeur: 26, align: 'right' }],
        dMois.map((e) => [dateFr(e.date), e.label, formatMontant(e.amount)]), 'Aucune dépense ce mois-ci.');
      paragraphe(d, 'Document établi à partir des paiements et dépenses enregistrés dans My School.', { taille: 8 });
      piedsDePage(d);
      d.doc.save(`bilan-${nomDeFichier(ecole)}-${mois}.pdf`);
      toast.success('Bilan du mois téléchargé.');
    } catch (err) {
      toast.error(`Bilan non produit : ${err instanceof Error ? err.message : 'erreur inconnue'}.`);
    } finally {
      setEnCours(null);
    }
  };

  const balanceExcel = async () => {
    setEnCours('excel');
    try {
      const XLSX = await import('xlsx');
      const lignes = dossiers.map((d) => ({
        'Élève': d.name, 'Classe': classeAffichee(d), 'Montant dû (FCFA)': d.totalRequired,
        'Payé (FCFA)': d.paid, 'Reste à payer (FCFA)': d.debt, 'Statut': d.status,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(lignes), 'Frais de scolarité');
      XLSX.writeFile(wb, `balance-frais-de-scolarite-${nomDeFichier(ecole)}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Balance des frais de scolarité téléchargée.');
    } catch (err) {
      toast.error(`Balance non produite : ${err instanceof Error ? err.message : 'erreur inconnue'}.`);
    } finally {
      setEnCours(null);
    }
  };

  const carte = 'bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-xs';
  const bouton = 'w-full py-2.5 bg-primary text-text-on-primary disabled:opacity-50 rounded-xl text-[11px] font-black cursor-pointer inline-flex items-center justify-center gap-1.5 border-0';

  return (
    <div className="space-y-6 text-xs font-bold text-[#4A5568]" id="reports-tab-root">
      <div>
        <h3 className="font-extrabold text-sm text-[#1E293B]">Bilans et exports</h3>
        <p className="text-[11px] text-neutral-500 font-semibold">Fichiers construits à partir des paiements, dépenses et dossiers enregistrés.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={carte}>
          <span className="text-[11px] font-black text-[#1E293B] block">Bilan du mois (PDF)</span>
          <p className="text-[11px] text-neutral-500 font-semibold">Paiements et dépenses du mois choisi, avec la trésorerie.</p>
          <label className="block text-[10px] font-black uppercase text-neutral-500">
            Mois
            <input type="month" value={mois} max={moisCourant()} onChange={(e) => setMois(e.target.value || moisCourant())}
              className="block mt-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold bg-white" />
          </label>
          <button id="export-bilan-pdf" type="button" onClick={() => void bilanPdf()} disabled={enCours !== null || !!erreurVersements} className={bouton}>
            <span translate="no" className="material-symbols-outlined text-sm">picture_as_pdf</span>
            <span>{enCours === 'pdf' ? 'Préparation…' : 'Télécharger le bilan du mois'}</span>
          </button>
          {erreurVersements && <p role="alert" className="text-[10px] text-rose-700">Indisponible : les paiements n'ont pas pu être chargés ({erreurVersements}).</p>}
        </div>

        <div className={carte}>
          <span className="text-[11px] font-black text-[#1E293B] block">Balance des frais de scolarité (Excel)</span>
          <p className="text-[11px] text-neutral-500 font-semibold">Un dossier par ligne : montant dû, payé, reste à payer et statut.</p>
          <button id="export-balance-excel" type="button" onClick={() => void balanceExcel()} disabled={enCours !== null || dossiers.length === 0} className={bouton}>
            <span translate="no" className="material-symbols-outlined text-sm">table_view</span>
            <span>{enCours === 'excel' ? 'Préparation…' : 'Télécharger la balance'}</span>
          </button>
          {dossiers.length === 0 && <p className="text-[10px] text-neutral-500">Indisponible : aucun dossier financier ouvert.</p>}
        </div>
      </div>
    </div>
  );
}

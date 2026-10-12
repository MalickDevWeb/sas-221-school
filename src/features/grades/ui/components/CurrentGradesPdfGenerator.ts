import { jsPDF } from 'jspdf';
import { addEcole221Footer, addEcole221Header, getActiveTenantPdfTheme } from '@/shared/lib/pdfTheme';

export interface CurrentPdfData {
  readonly average: number;
  readonly gpa: number;
  readonly ects: number;
  readonly totalEcts: number;
  readonly modules: ReadonlyArray<{
    readonly module: string;
    readonly prof: string;
    readonly ects: number;
    readonly note: number;
    readonly moyPromo: number;
  }>;
}

export function downloadCurrentYearPDF(data: CurrentPdfData, onProgress: (p: number) => void, onDone: () => void) {
  onProgress(15);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const tenantTheme = getActiveTenantPdfTheme();
  const [pr, pg, pb] = tenantTheme.palette.primary;
  const [sr, sg, sb] = tenantTheme.palette.secondary;
  
  const build = () => {
    onProgress(65);
    void addEcole221Header(doc, {
      title: `${tenantTheme.schoolName.toUpperCase()} — PORTAIL ACADÉMIQUE`,
      subtitle: 'RELEVÉ DE NOTES OFFICIEL - SEMESTRE 2',
      meta: 'Année 2023-2024 | Licence 3 | Génie Logiciel',
      generatedAt: new Date(),
    }, { marginX: 15, currentY: 15, height: 30 }).then(() => {
      doc.setDrawColor(220, 220, 220).setLineWidth(0.4).line(15, 42, 195, 42);
      
      // Info panel
      doc.setFillColor(250, 249, 247).roundedRect(15, 48, 180, 28, 3, 3, "F");
      doc.setDrawColor(230, 228, 225).roundedRect(15, 48, 180, 28, 3, 3, "S");
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(sr, sg, sb).text("INFORMATIONS ÉTUDIANT", 20, 54);
      doc.setFontSize(8.5).setFont("helvetica", "normal").setTextColor(100, 100, 100);
      doc.text(`Établissement : ${tenantTheme.schoolName}`, 20, 60);
      doc.text("Parcours : Génie Logiciel & Systèmes d'Information", 20, 65);
      doc.text("Niveau : Licence 3 (L3)", 20, 70);
      doc.text("Décision provisoire : Admis sous réserve", 120, 60);
      doc.text("Année académique : 2023-2024", 120, 65);

      // Synthesis Section
      doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(pr, pg, pb).text("SYNTHÈSE DU SEMESTRE 2", 15, 85);
      
      const mention = data.average >= 16 ? "Très Bien" : data.average >= 14 ? "Bien" : data.average >= 12 ? "Assez Bien" : data.average >= 10 ? "Passable" : "Rattrapage";
      const metrics = [
        { l: "MOYENNE S2", v: `${data.average.toFixed(2)}/20`, n: `Mention ${mention}` },
        { l: "GPA ESTIMÉ", v: `${data.gpa.toFixed(1)}/4.0`, n: data.average >= 14 ? "Excellent" : "Satisfaisant" },
        { l: "ECTS ACQUIS", v: `${data.ects}/${data.totalEcts}`, n: `${Math.round((data.ects / data.totalEcts) * 100)}% validés` },
        { l: "PROMOTION", v: "En cours", n: "142 étudiants" }
      ];

      metrics.forEach((m, i) => {
        const x = 15 + i * 46;
        doc.setFillColor(255, 255, 255).setDrawColor(220, 220, 220).roundedRect(x, 89, 42, 19, 2, 2, "F");
        doc.roundedRect(x, 89, 42, 19, 2, 2, "S");
        doc.setFontSize(7).setTextColor(120).text(m.l, x + 21, 93, { align: "center" });
        doc.setFontSize(10).setTextColor(sr, sg, sb).text(m.v, x + 21, 99, { align: "center" });
        doc.setFontSize(6.5).setTextColor(pr, pg, pb).text(m.n, x + 21, 104, { align: "center" });
      });

      // Table Header — couleur primaire de l'école active
      doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(pr, pg, pb).text("DÉTAIL DES SÉANCES & MODULES", 15, 117);
      doc.setFillColor(pr, pg, pb).rect(15, 121, 180, 8, "F");
      doc.setFontSize(8).setTextColor(255).text("Module & Professeur", 18, 126.5);
      doc.text("Crédits", 110, 126.5).text("Note", 140, 126.5).text("Moy. Promo", 165, 126.5).text("Statut", 191, 126.5, { align: "right" });

      let currY = 129;
      data.modules.forEach((m, idx) => {
        if (idx % 2 === 0) doc.setFillColor(248, 247, 245).rect(15, currY, 180, 9.5, "F");
        doc.setFontSize(8).setTextColor(sr, sg, sb).setFont("helvetica", "bold").text(m.module, 18, currY + 4.5);
        doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(120).text(m.prof, 18, currY + 8);
        doc.setFontSize(8).setTextColor(80).text(`${m.ects} ECTS`, 110, currY + 6);
        doc.setFont("helvetica", "bold").setTextColor(pr, pg, pb).text(m.note.toFixed(2), 140, currY + 6);
        doc.setFont("helvetica", "normal").setTextColor(115).text(m.moyPromo.toFixed(2), 165, currY + 6);
        
        const isValide = m.note >= 10;
        doc.setFont("helvetica", "bold").setTextColor(isValide ? 16 : pr, isValide ? 124 : pg, isValide ? 65 : pb)
          .text(isValide ? "VALIDÉ" : "RATTRAPAGE", 191, currY + 6, { align: "right" });
          
        currY += 9.5;
      });

      // Signature Panel
      const sY = 215;
      doc.setDrawColor(210).line(15, sY - 12, 195, sY - 12);
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(pr, pg, pb).text("SIGNATURE & HOMOLOGATION", 15, sY - 6);
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(115);
      doc.text(`Le Conseil de Direction Académique de ${tenantTheme.schoolName}`, 15, sY);
      doc.text("Relevé de notes officiel provisoire émis en ligne.", 15, sY + 4);
      doc.text(`ID unique d'authentification : ${tenantTheme.slug.toUpperCase()}-CUR-S2-${Math.floor(Math.random() * 89999 + 10000)}`, 15, sY + 8);

      // Certificate Seal Box
      doc.setDrawColor(pr, pg, pb).setLineWidth(0.8).roundedRect(140, sY - 8, 55, 23, 1.5, 1.5, "S");
      doc.setFillColor(pr, pg, pb).rect(140, sY - 8, 55, 4.5, "F");
      doc.setFont("helvetica", "bold").setFontSize(6.5).setTextColor(255).text("DIRECTION DES ÉTUDES - CERTIFIÉ", 167.5, sY - 4.8, { align: "center" });
      doc.setTextColor(pr, pg, pb).setFontSize(8).text(`${tenantTheme.schoolName.toUpperCase()} - SÉNÉGAL`, 167.5, sY + 2.5, { align: "center" });

      addEcole221Footer(doc, [
        `${tenantTheme.schoolName}  -  Établissement d'Enseignement Supérieur Agréé`,
        "Relevé de notes officiel de fin de semestre.",
        `© ${new Date().getFullYear()} ${tenantTheme.schoolName}. Tous droits réservés.`
      ]);

      onProgress(100);
      setTimeout(() => {
        doc.save(`releve_notes_officiel_${tenantTheme.slug}_S2.pdf`);
        onDone();
      }, 500);
    });
  };

  build();
}

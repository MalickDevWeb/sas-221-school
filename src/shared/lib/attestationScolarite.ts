import { anneeAcademique } from './anneeAcademique';
import { echapper, ouvrirDocumentImprimable, tableauCleValeurHtml } from './documentImprimable';
import { identiteEcole } from './documentOfficiel';

export interface DonneesAttestation { eleve: string; matricule?: string | null; classe?: string | null; filiere?: string | null }

/**
 * Attestation de scolarité (modèle commun des documents de l'école, 2026-11-15) — même document côté parent et
 * côté administration (fiche 360°). Aucune mention inventée (ni « Certifié conforme », ni référence, ni signataire
 * supposé, ni ville) : un emplacement est laissé pour la signature et le cachet de l'établissement.
 * Renvoie false si le navigateur a bloqué la fenêtre.
 */
export function imprimerAttestationScolarite(a: DonneesAttestation): boolean {
  const ecole = identiteEcole();
  const annee = anneeAcademique();
  return ouvrirDocumentImprimable({
    ecole, titre: 'Attestation de scolarité', titreFenetre: `Attestation de scolarité — ${a.eleve}`,
    corps: `<p>La direction de ${echapper(ecole.nom)} atteste que l'élève ci-dessous est inscrit(e) dans l'établissement pour l'année scolaire ${echapper(annee)}.</p>
${tableauCleValeurHtml([
  { cle: 'Nom et prénom', valeur: a.eleve || '—' },
  { cle: 'Matricule', valeur: a.matricule || '—' },
  { cle: 'Classe', valeur: a.classe || '—' },
  ...(a.filiere ? [{ cle: 'Filière', valeur: a.filiere }] : []),
  { cle: 'Année scolaire', valeur: annee },
])}
<p>La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
<div class="signature"><span>Fait le ${echapper(new Date().toLocaleDateString('fr-FR'))}</span><span>Signature et cachet de l'établissement</span></div>`,
  });
}

import { creerDocument, enTete, formatMontant, nomDeFichier, piedsDePage, tableau, tableauCleValeur, type IdentiteEcole, type PolicesBase64 } from '@/shared/lib/documentOfficiel';
import { avecNombre } from '@/shared/lib/pluriel';

/** Données de la fiche de classe (prêtes à brancher dans ClasseDetailPage, après le feu vert du coordinateur). */
export interface DonneesFicheClasse {
  classe: string;
  niveau: string;
  filiere: string;
  /** null : frais non renseignés (« — »). */
  fraisAnnuels: number | null;
  capacite: number | null;
  eleves: { nom: string; matricule: string; telephone?: string | null }[];
}

/**
 * Fiche de classe officielle (modèle commun, 2026-11-15). Avant : « ÉCOLE 221 - FICHE DE PROMOTION » écrit en dur
 * pour toutes les écoles, espaces fines rendues « / », tableau vide sans message, ni logo, ni date, ni pagination.
 * Renvoie le document sans l'enregistrer quand `enregistrer` vaut false (tests).
 */
export async function ficheClassePdf(f: DonneesFicheClasse, options: { ecole?: IdentiteEcole; polices?: PolicesBase64 | null; enregistrer?: boolean; date?: Date } = {}) {
  const d = await creerDocument({ ecole: options.ecole, polices: options.polices });
  await enTete(d, 'Fiche de classe', `${f.classe} — ${f.niveau}`, options.date);
  tableauCleValeur(d, [
    ['Filière', f.filiere || '—'],
    ['Effectif', `${avecNombre(f.eleves.length, 'élève')}${f.capacite ? ` sur ${f.capacite} places` : ''}`],
    ['Frais annuels', f.fraisAnnuels == null ? '—' : formatMontant(f.fraisAnnuels)],
  ]);
  tableau(d, [
    { titre: 'N°', largeur: 6, align: 'right' }, { titre: 'Nom et prénom', largeur: 44 }, { titre: 'Matricule', largeur: 22 },
    { titre: 'Téléphone du parent', largeur: 28 },
  ], f.eleves.map((e, i) => [String(i + 1), e.nom, e.matricule || '—', e.telephone || '—']), 'Aucun élève inscrit dans cette classe.');
  piedsDePage(d, options.date);
  if (options.enregistrer !== false) d.doc.save(`fiche-classe-${nomDeFichier(d.ecole.nom)}-${nomDeFichier(f.classe)}.pdf`);
  return d.doc;
}

import { echapper, ouvrirDocumentImprimable, tableauCleValeurHtml } from '@/shared/lib/documentImprimable';

/** Contenu de la fiche d'identifiants d'un élève, remise en main propre (aucun envoi par e-mail ni SMS). */
export interface FicheIdentifiantsEleve {
  nom: string;
  classe?: string | null;
  matricule?: string | null;
  /** Identifiant de connexion : matricule pour un élève sans e-mail, sinon son adresse. */
  identifiant: string;
  connexionParMatricule: boolean;
  motDePasse: string;
  parent?: { nom?: string | null; identifiant?: string | null; relation?: string | null; motDePasse?: string | null } | null;
}

/**
 * Fiche imprimable (même présentation que celle des admis, MatriculationTab) : nom, classe, identifiant (e-mail ou
 * matricule), mot de passe provisoire et consigne de changement. Renvoie false si le navigateur bloque la fenêtre.
 */
export function imprimerFicheIdentifiantsEleve(f: FicheIdentifiantsEleve): boolean {
  const lignes: [string, unknown][] = [['Élève', f.nom]];
  if (f.classe) lignes.push(['Classe', f.classe]);
  if (f.matricule) lignes.push(['Matricule', f.matricule]);
  lignes.push(['Identifiant de connexion', f.connexionParMatricule ? `${f.identifiant} (connexion par matricule)` : f.identifiant]);
  lignes.push(['Mot de passe provisoire', f.motDePasse]);
  if (f.parent) {
    lignes.push(['Parent lié', `${f.parent.nom ?? ''}${f.parent.relation ? ` (${f.parent.relation})` : ''}`]);
    if (f.parent.identifiant) lignes.push(['Identifiant du parent', f.parent.identifiant]);
    if (f.parent.motDePasse) lignes.push(['Mot de passe provisoire du parent', f.parent.motDePasse]);
  }
  // Modèle commun des documents de l'école (en-tête, logo ou initiales, pied « Page x/n », A4)
  return ouvrirDocumentImprimable({
    titre: "Fiche d'identifiants de l'élève", sousTitre: f.nom, titreFenetre: `Fiche d'identifiants — ${f.matricule ?? f.nom}`,
    corps: `${tableauCleValeurHtml(lignes.map(([k, v]) => ({ cle: k, valeur: String(v ?? '') })))}
<p><strong>À la première connexion, le mot de passe provisoire doit être remplacé par un mot de passe personnel.</strong></p>
<p class="note">Remise le ${echapper(new Date().toLocaleDateString('fr-FR'))}. Le mot de passe provisoire n'est affiché qu'une seule fois : conservez cette fiche en lieu sûr.</p>`,
  });
}

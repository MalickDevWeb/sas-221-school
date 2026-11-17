import { CourseSession, libelleSemaine } from '../domain/Schedule';
import { creerDocument, enTete, nomDeFichier, paragraphe, piedsDePage, tableau } from '@/shared/lib/documentOfficiel';

const JOURS: { code: string; libelle: string; decalage: number }[] = [
  { code: 'LUN', libelle: 'Lundi', decalage: 0 },
  { code: 'MAR', libelle: 'Mardi', decalage: 1 },
  { code: 'MER', libelle: 'Mercredi', decalage: 2 },
  { code: 'JEU', libelle: 'Jeudi', decalage: 3 },
  { code: 'VEN', libelle: 'Vendredi', decalage: 4 },
  { code: 'SAM', libelle: 'Samedi', decalage: 5 },
];

/**
 * Emploi du temps en PDF (modèle commun des documents de l'école).
 * Semaine réelle (même calcul que l'écran), date de chaque jour calculée, jours sans cours signalés.
 */
export async function exportToPDF(sessions: CourseSession[], className: string = 'emploi-du-temps', maintenant: Date = new Date()) {
  const d = await creerDocument();
  await enTete(d, 'Emploi du temps', `${libelleSemaine(sessions, maintenant)}${className ? ` — ${className}` : ''}`, maintenant);

  const lundi = new Date(maintenant);
  lundi.setDate(maintenant.getDate() - ((maintenant.getDay() + 6) % 7));
  const avecCours = JOURS.filter((j) => sessions.some((s) => s.jour === j.code));

  if (avecCours.length === 0) {
    paragraphe(d, 'Aucun cours programmé cette semaine.', { taille: 11 });
  }
  avecCours.forEach((jour) => {
    const date = new Date(lundi);
    date.setDate(lundi.getDate() + jour.decalage);
    const libelle = `${jour.libelle} ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
    paragraphe(d, libelle, { gras: true, taille: 11 });
    const lignes = sessions
      .filter((s) => s.jour === jour.code)
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
      .map((s) => [s.heureStr, s.type || '—', s.nom, s.professeur || '—', s.salle || '—']);
    tableau(d, [
      { titre: 'Horaire', largeur: 18 }, { titre: 'Type', largeur: 9, align: 'center' }, { titre: 'Matière', largeur: 34 },
      { titre: 'Enseignant', largeur: 25 }, { titre: 'Salle', largeur: 14 },
    ], lignes, 'Aucun cours ce jour-là.');
  });

  piedsDePage(d, maintenant);
  d.doc.save(`emploi-du-temps-${nomDeFichier(d.ecole.nom)}-${nomDeFichier(className)}.pdf`);
}

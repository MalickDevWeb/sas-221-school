import { StudentFinance } from '../../../domain/FinancesModels';

export const TOUTES_CLASSES = 'Toutes les classes';
export const SANS_CLASSE = 'Sans classe';

/** Classe d'un dossier telle qu'affichée (une classe vide est regroupée sous « Sans classe »). */
export const classeAffichee = (s: StudentFinance) => s.classe || SANS_CLASSE;

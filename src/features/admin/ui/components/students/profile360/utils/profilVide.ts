import { versProfil360, type Profil360 } from '../profil360';

/**
 * Profil 360 vide (APP-FE-10) : utilisé quand le dossier réel n'a pas pu être chargé.
 * Remplace le repli vers StudentMockData, qui affichait un dossier inventé comme réel.
 */
export const PROFIL_VIDE: Profil360 = versProfil360({});

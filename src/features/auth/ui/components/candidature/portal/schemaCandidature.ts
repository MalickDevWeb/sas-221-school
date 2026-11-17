import { z } from 'zod';
import type { Campaign } from './admissionsTypes';

export const MOT_DE_PASSE_MIN = 8;
const ANNEE = new Date().getFullYear();
const TELEPHONE = /^\+?[\d\s.-]{7,20}$/;

/** Message du téléphone, partagé par le candidat et le garant. */
const telephone = (vide: string) => z.string().trim()
  .min(1, vide)
  .refine(v => TELEPHONE.test(v), 'Numéro invalide : chiffres, espaces et « + » uniquement (ex. 77 123 45 67).');

/**
 * Dossier du portail candidat (APP-FE-14 : react-hook-form + zod). Chaque étape ne laisse passer qu'avec des champs
 * valides et un message précis sous le champ.
 */
export const schemaCandidature = z.object({
  // 1. Identité
  firstName: z.string().trim().min(1, 'Saisissez votre prénom.').max(100, '100 caractères au maximum.'),
  lastName: z.string().trim().min(1, 'Saisissez votre nom de famille.').max(100, '100 caractères au maximum.'),
  gender: z.string().refine((v): boolean => v === 'M' || v === 'F', 'Indiquez votre sexe.'),
  birthDate: z.string().min(1, 'Indiquez votre date de naissance.')
    .refine(v => !Number.isNaN(Date.parse(v)), 'Date de naissance invalide.')
    .refine(v => new Date(v) < new Date(), 'La date de naissance doit être passée.')
    .refine(v => new Date(v).getFullYear() >= 1950, 'Date de naissance invalide : vérifiez l’année.'),
  birthPlace: z.string().trim().min(1, 'Indiquez votre lieu de naissance.').max(100, '100 caractères au maximum.'),
  // Code ISO du pays (liste), obligatoire : les règles d'admission de l'école peuvent en dépendre
  nationality: z.string().trim().regex(/^[A-Z]{2}$/, 'Choisissez la nationalité dans la liste.'),
  cniNumber: z.string().trim()
    .min(1, 'Saisissez le numéro de votre CNI (NIN) ou de votre passeport.')
    .refine(v => /^[A-Za-z0-9 ]{5,30}$/.test(v), 'Numéro invalide : lettres, chiffres et espaces uniquement (5 à 30 caractères).'),
  phone: telephone('Saisissez votre numéro de téléphone.'),
  email: z.string().trim()
    .min(1, 'Saisissez votre adresse e-mail : elle sert au suivi du dossier.')
    .email('Adresse e-mail invalide : vérifiez le format (ex. prenom.nom@exemple.sn).'),
  address: z.string().trim().max(200, '200 caractères au maximum.'),
  // 2. Garant
  guardianRelationship: z.string().min(1, 'Choisissez votre lien avec le garant.'),
  guardianName: z.string().trim().min(1, 'Saisissez le nom complet du garant.').max(150, '150 caractères au maximum.'),
  guardianPhone: telephone('Saisissez le téléphone du garant.'),
  guardianEmail: z.string().trim()
    .refine(v => v === '' || z.string().email().safeParse(v).success, 'Adresse e-mail du garant invalide.'),
  guardianProfession: z.string().trim().max(100, '100 caractères au maximum.'),
  // 3. Cursus
  previousSchool: z.string().trim().min(1, 'Indiquez le dernier établissement fréquenté.').max(150, '150 caractères au maximum.'),
  bacSeries: z.string().min(1, 'Choisissez la série de votre baccalauréat.'),
  bacYear: z.string().trim().min(1, "Indiquez l'année d'obtention du bac.")
    .refine(v => /^\d{4}$/.test(v) && Number(v) >= 1970 && Number(v) <= ANNEE, `Année invalide : entre 1970 et ${ANNEE}.`),
  bacMention: z.string(),
  targetLevel: z.string().min(1, "Choisissez le niveau d'entrée."),
  // 6. Compte de suivi
  password: z.string().min(MOT_DE_PASSE_MIN, `Le mot de passe de suivi doit comporter au moins ${MOT_DE_PASSE_MIN} caractères.`),
  confirm: z.string().min(1, 'Retapez votre mot de passe.'),
  accept: z.boolean().refine(v => v, 'Cochez la case pour certifier votre dossier et accepter le règlement.'),
}).refine(v => v.confirm === '' || v.password === v.confirm, { path: ['confirm'], message: 'Les deux mots de passe ne correspondent pas.' });

export type Candidature = z.infer<typeof schemaCandidature>;
export type ChampCandidature = keyof Candidature;

/** Champs vérifiés avant de quitter chaque étape (4 = pièces et 5 = frais ont leur propre contrôle). */
export const CHAMPS_ETAPE: Record<number, ChampCandidature[]> = {
  1: ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'nationality', 'cniNumber', 'phone', 'email', 'address'],
  2: ['guardianRelationship', 'guardianName', 'guardianPhone', 'guardianEmail', 'guardianProfession'],
  3: ['previousSchool', 'bacSeries', 'bacYear', 'bacMention', 'targetLevel'],
  6: ['password', 'confirm', 'accept'],
};

/** Valeurs de départ : vides (aucune donnée inventée), sauf ce que la campagne choisie fixe déjà. */
export function valeursInitiales(campaign: Campaign): Candidature {
  return {
    firstName: '', lastName: '', gender: '', birthDate: '', birthPlace: '', nationality: '', cniNumber: '',
    phone: '', email: '', address: '',
    guardianRelationship: '', guardianName: '', guardianPhone: '', guardianEmail: '', guardianProfession: '',
    previousSchool: '', bacSeries: '', bacYear: '', bacMention: '', targetLevel: campaign.level ?? '',
    password: '', confirm: '', accept: false,
  };
}

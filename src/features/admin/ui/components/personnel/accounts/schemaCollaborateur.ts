import { z } from 'zod';

/** Règles d'un compte du personnel (APP-FE-14), communes à la création et à la modification. */
export const schemaCollaborateur = z.object({
  firstName: z.string().trim().min(1, 'Saisissez le prénom.').max(100, '100 caractères au maximum.'),
  lastName: z.string().trim().min(1, 'Saisissez le nom.').max(100, '100 caractères au maximum.'),
  email: z.string().trim()
    .min(1, "Saisissez l'adresse e-mail : elle sert d'identifiant de connexion.")
    .email('Adresse e-mail invalide : vérifiez le format (ex. prenom.nom@ecole.sn).'),
  phone: z.string().trim()
    .min(1, 'Saisissez le numéro de téléphone.')
    .refine(v => /^\+?[\d\s.-]{7,20}$/.test(v), 'Numéro invalide : chiffres, espaces et « + » uniquement (ex. 77 123 45 67).'),
  role: z.string().min(1, 'Choisissez le rôle.'),
});
export type Collaborateur = z.infer<typeof schemaCollaborateur>;

/** Erreurs du serveur rattachées aux champs (409 « e-mail déjà utilisé », « téléphone déjà utilisé », rôle refusé…). */
export const MOTS_CLES_COLLABORATEUR = {
  email: /e-?mail/i,
  phone: /téléphone/i,
  role: /rôle/i,
  lastName: /\bnom\b/i,
} as const;

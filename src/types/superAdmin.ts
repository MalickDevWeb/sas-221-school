export interface GlobalUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'ADMIN' | 'ADMINISTRATOR';
  matricule: string;
}

export interface CreateGlobalUserPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'ADMIN';
}

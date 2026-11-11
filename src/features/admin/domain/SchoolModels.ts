export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: 'Disponible' | 'Occupée';
}

export interface Filiere {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Classe {
  id: string;
  name: string;
  level: string;
  filiereId: string;
  /** Capacité maximale ; null = non renseignée (jamais supposée). */
  capacityMax: number | null;
  /** Tarif annuel (FCFA) ; null = non renseigné (jamais de tarif inventé). */
  price: number | null;
}

export interface PlanningSlot {
  id: string;
  day: string;
  slot: string;
  classeId: string;
  subject: string;
  prof: string;
  roomName: string;
  isLive?: boolean;
  status?: string;
  isAbsent?: boolean;
  cancellationReason?: string;
}





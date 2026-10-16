import { AdmissionType } from "@/features/admin/domain/AdmissionsExtendedModels";

export interface Campaign {
  id: string;
  title: string;
  code: AdmissionType;
  state: "Brouillon" | "Planifiée" | "Ouverte" | "Suspendue" | "Fermée" | "Archivée";
  deadline: string;
  fees: number;
  requirements: string[];
  imageUrl: string;
  level?: string;
  duration?: string;
  intake?: string;
  requiredDocs?: string[];
}

export interface AuditLog {
  id: string;
  candidateId: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  role: "CANDIDAT" | "ADMIN" | "SECRETAIRE";
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  nationality: string;
  cniNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

export interface GuardianDetails {
  fullName: string;
  relationship: 'Père' | 'Mère' | 'Tuteur Légal' | 'Autre';
  phone: string;
  email: string;
  profession: string;
}

export interface AcademicDetails {
  previousSchool: string;
  bacSeries: string;
  bacYear: string;
  bacMention: string;
  targetLevel: string;
  targetFiliere: string;
  intakeSession: string;
}

export interface UploadedDocInfo {
  name: string;
  size: string;
  uploadedAt: string;
  status: 'ready' | 'uploaded';
  url?: string;
}

export interface DocumentsState {
  idCard: UploadedDocInfo | null;
  diploma: UploadedDocInfo | null;
  transcripts: UploadedDocInfo | null;
  photo: UploadedDocInfo | null;
}

export interface PaymentDetails {
  method: 'WAVE' | 'ORANGE_MONEY' | 'CARD';
  isPaid: boolean;
  transactionRef: string;
  amount: number;
  paidAt?: string;
}

import { Student } from '../../../../../domain/StudentModels';
import { imprimerAttestationScolarite } from '@/shared/lib/attestationScolarite';

/**
 * Certificat (attestation) de scolarité de l'élève : document officiel de l'école COURANTE.
 */
export function generateCert(student: Student): boolean {
  return imprimerAttestationScolarite({ eleve: student.name, matricule: student.matricule, classe: student.classe });
}

import { estObjet, listeBrute, nombreOuNull, objetBrut, texte } from '@/shared/lib/lectureServeur';

/*
 * Dossier 360° d'un élève tel que renvoyé par GET /admin/students/{id}/profile360 (APP-FE-03, 2026-11-13).
 * Avant : lu en `any` par chaque onglet. Le typage a révélé deux défauts corrigés ici :
 *  - les allergies étaient lues dans « sante » découpé à la virgule, alors que le serveur les renvoie dans
 *    « extra.allergies » : enregistrées, elles ne réapparaissaient jamais ;
 *  - le graphique des notes affichait une moyenne de classe écrite en dur (14,5) : seule la valeur du serveur
 *    est désormais utilisée.
 * Les rubriques sans source côté serveur restent vides (jamais remplies par l'écran).
 */
export interface UeProfil { id: string; ue: string; module: string; coefficient: number | null; grade: number | null; moyenneClasse: number | null; status: string; teacher: string; volumeHoraire: string; validation: string }
export interface ConnexionProfil { timestamp: string; ip: string; device: string; browser: string; duration: string }
export interface ActiviteProfil { timestamp: string; module: string; action: string; result: string }
export interface EvenementProfil { year: string; title: string; desc: string; status: string }
export interface PaiementProfil { date: string; label: string; amount: number | null; method: string; status: string; receiptNumber: string }
export interface MessageProfil { sender: string; text: string; date: string }
export interface PresenceProfil { date: string; time: string; course: string; status: string; comment: string; info: string }
export interface AnalyseProfil { score: number | null; probabiliteReussite: number | null; risque: number | null; alertes: string[] }

export interface Profil360 {
  donneesStatus: string;
  admissionDetails: { lycee: string; bacSerie: string; bacGrade: string; bacMention: string };
  academic: { annee: string; moyenne: string; ects: string };
  ueList: UeProfil[];
  connectionLogs: ConnexionProfil[];
  activityTrail: ActiviteProfil[];
  timeline: EvenementProfil[];
  payments: PaiementProfil[];
  paymentsStatus: string;
  attendance: PresenceProfil[];
  analyse: AnalyseProfil | null;
  extra: {
    messages: MessageProfil[];
    sante: string; allergies: string; bourses: string;
    clubs: string; memoire: string; stage: string; projets: string; certifications: string; bibliotheque: string; rendezVous: string;
  };
}

export function versProfil360(raw: unknown): Profil360 {
  const d = objetBrut(raw);
  const adm = objetBrut(d.admissionDetails);
  const aca = objetBrut(d.academic);
  const extra = objetBrut(d.extra);
  const ia = d.aiAnalysis ?? d.analyse;
  return {
    donneesStatus: texte(d.donneesStatus) || 'non_disponible',
    admissionDetails: { lycee: texte(adm.lycee), bacSerie: texte(adm.bacSerie), bacGrade: texte(adm.bacGrade), bacMention: texte(adm.bacMention) },
    academic: { annee: texte(aca.annee ?? aca.year), moyenne: texte(aca.moyenne), ects: texte(aca.ects) },
    ueList: listeBrute(d.ueList).map((u, i) => ({
      id: texte(u.id) || `ue-${i}`, ue: texte(u.ue), module: texte(u.module), coefficient: nombreOuNull(u.coefficient),
      grade: nombreOuNull(u.grade), moyenneClasse: nombreOuNull(u.classAverage ?? u.moyenneClasse), status: texte(u.status),
      teacher: texte(u.teacher), volumeHoraire: texte(u.volumeHoraire ?? u.hours), validation: texte(u.validation),
    })),
    connectionLogs: listeBrute(d.connectionLogs).map((l) => ({
      timestamp: texte(l.timestamp), ip: texte(l.ip), device: texte(l.device), browser: texte(l.browser), duration: texte(l.duration),
    })),
    activityTrail: listeBrute(d.activityTrail).map((a) => ({
      timestamp: texte(a.timestamp), module: texte(a.module), action: texte(a.action), result: texte(a.result),
    })),
    timeline: listeBrute(d.timeline).map((e) => ({ year: texte(e.year), title: texte(e.title), desc: texte(e.desc), status: texte(e.status) })),
    payments: listeBrute(d.payments).map((p) => ({
      date: texte(p.date), label: texte(p.label), amount: nombreOuNull(p.amount), method: texte(p.method), status: texte(p.status),
      receiptNumber: texte(p.receiptNumber),
    })),
    paymentsStatus: texte(d.paymentsStatus) || 'non_disponible',
    attendance: listeBrute(d.attendance).map((h) => ({
      date: texte(h.date), time: texte(h.time), course: texte(h.course), status: texte(h.status), comment: texte(h.comment), info: texte(h.info),
    })),
    analyse: estObjet(ia) ? {
      score: nombreOuNull(ia.score), probabiliteReussite: nombreOuNull(ia.probabiliteReussite), risque: nombreOuNull(ia.risque),
      alertes: Array.isArray(ia.alertes) ? ia.alertes.map(texte).filter(Boolean) : [],
    } : null,
    extra: {
      messages: listeBrute(extra.messages).map((m) => ({ sender: texte(m.sender), text: texte(m.text), date: texte(m.date) })),
      sante: texte(extra.sante), allergies: texte(extra.allergies), bourses: texte(extra.bourses),
      clubs: texte(extra.clubs), memoire: texte(extra.memoire), stage: texte(extra.stage), projets: texte(extra.projets),
      certifications: texte(extra.certifications), bibliotheque: texte(extra.bibliotheque), rendezVous: texte(extra.rendezVous),
    },
  };
}

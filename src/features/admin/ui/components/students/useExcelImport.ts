import { useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Ligne envoyée à POST /admin/students/import (numéro de ligne du fichier compris). */
export interface LigneImport { ligne: number; nom: string; email: string; matricule?: string; telephone?: string; classe?: string }

/** Ligne du rapport renvoyé par le serveur. */
export interface LigneRapport {
  ligne: number; nom: string | null; email: string | null; classe: string | null;
  statut: 'OK' | 'ERREUR' | 'CREE'; erreurs: string[];
  id?: string; matricule?: string; motDePasseProvisoire?: string | null;
}
export interface RapportImport { simulation: boolean; valide: boolean; crees: number; erreurs: number; lignes: LigneRapport[] }

export const COLONNES = 'Nom ; Email (obligatoires) — Matricule ; Téléphone ; Classe (facultatives)';

const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Découpe une ligne CSV (guillemets « "" » gérés). */
function cellules(ligne: string, sep: string): string[] {
  const res: string[] = [];
  let cur = '', guill = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (guill) {
      if (c === '"' && ligne[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') guill = false;
      else cur += c;
    } else if (c === '"') guill = true;
    else if (c === sep) { res.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  res.push(cur.trim());
  return res;
}

type Champ = 'nom' | 'prenom' | 'email' | 'matricule' | 'telephone' | 'classe';
function champ(entete: string): Champ | null {
  const h = sansAccents(entete);
  if (h.startsWith('prenom') || h === 'first name' || h === 'firstname') return 'prenom';
  if (h.includes('mail')) return 'email';
  if (h.startsWith('matr')) return 'matricule';
  if (h.startsWith('tel') || h.includes('phone')) return 'telephone';
  if (h.includes('class') || h.includes('promo')) return 'classe';
  if (h.startsWith('nom') || h === 'name' || h.includes('nom complet') || h === 'last name' || h === 'lastname') return 'nom';
  return null;
}

/** Lit le texte d'un CSV ; renvoie les lignes ou un message d'erreur compréhensible. */
export function lireCsv(texte: string): { lignes: LigneImport[] } | { erreur: string } {
  const brutes = texte.replace(/^\uFEFF/, '').split(/\r?\n/);
  const premiere = brutes.findIndex(l => l.trim() !== '');
  if (premiere < 0) return { erreur: 'Le fichier est vide.' };
  const entete = brutes[premiere];
  const sep = entete.includes(';') ? ';' : entete.includes('\t') ? '\t' : ',';
  const colonnes = cellules(entete, sep).map(champ);
  if (!colonnes.includes('nom') || !colonnes.includes('email')) {
    return { erreur: `En-têtes non reconnus : « ${entete.trim()} ». Colonnes attendues : ${COLONNES}.` };
  }
  const lignes: LigneImport[] = [];
  for (let i = premiere + 1; i < brutes.length; i++) {
    if (brutes[i].trim() === '') continue;
    const c = cellules(brutes[i], sep);
    const v: Partial<Record<Champ, string>> = {};
    colonnes.forEach((k, j) => { if (k && c[j]) v[k] = c[j]; });
    lignes.push({
      ligne: i + 1,
      nom: [v.prenom, v.nom].filter(Boolean).join(' '),
      email: v.email ?? '',
      matricule: v.matricule, telephone: v.telephone, classe: v.classe,
    });
  }
  if (lignes.length === 0) return { erreur: "Le fichier ne contient que la ligne d'en-têtes : aucun élève à importer." };
  return { lignes };
}

export function useExcelImport(onImported: () => void) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nomFichier, setNomFichier] = useState('');
  const [lignes, setLignes] = useState<LigneImport[]>([]);
  const [rapport, setRapport] = useState<RapportImport | null>(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const verifier = async (l: LigneImport[]) => {
    setChargement(true); setErreur('');
    try {
      const { data } = await apiClient.post<RapportImport>('/admin/students/import?simulation=true', { eleves: l });
      setRapport(data); setStep(2);
    } catch (e) {
      setErreur(resolveErrorMessage(e));
    } finally {
      setChargement(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setErreur(''); setRapport(null); setNomFichier(file.name);
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setErreur(`« ${file.name} » n'est pas un fichier CSV. Dans Excel : Fichier → Enregistrer sous → CSV (séparateur : point-virgule).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const lu = lireCsv(String(e.target?.result ?? ''));
      if ('erreur' in lu) { setErreur(lu.erreur); return; }
      setLignes(lu.lignes);
      void verifier(lu.lignes);
    };
    reader.onerror = () => setErreur(`Lecture de « ${file.name} » impossible.`);
    reader.readAsText(file, 'utf-8');
  };

  const executeImport = async () => {
    setChargement(true); setErreur('');
    try {
      const { data } = await apiClient.post<RapportImport>('/admin/students/import', { eleves: lignes });
      setRapport(data);
      if (data.crees > 0) { setStep(3); onImported(); }
    } catch (e) {
      setErreur(resolveErrorMessage(e));   // rien n'a été créé
    } finally {
      setChargement(false);
    }
  };

  const recommencer = () => { setStep(1); setLignes([]); setRapport(null); setErreur(''); setNomFichier(''); };

  const telecharger = (contenu: string, nom: string) => {
    const blob = new Blob(['\uFEFF' + contenu], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nom; a.click();
    URL.revokeObjectURL(url);
  };

  /** Modèle vide : uniquement les en-têtes (aucun élève d'exemple qui serait importé par erreur). */
  const downloadTemplate = () => telecharger('Nom;Email;Matricule;Téléphone;Classe\n', 'modele_import_eleves.csv');

  const echapper = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const telechargerIdentifiants = () => {
    if (!rapport) return;
    const l = rapport.lignes.filter(r => r.statut === 'CREE')
      .map(r => [r.nom, r.email, r.matricule, r.motDePasseProvisoire].map(echapper).join(';'));
    telecharger(['Nom;Email;Matricule;Mot de passe provisoire', ...l].join('\n') + '\n', 'identifiants_eleves_importes.csv');
  };

  return { step, nomFichier, lignes, rapport, erreur, chargement, handleFileUpload, executeImport, recommencer,
    downloadTemplate, telechargerIdentifiants };
}

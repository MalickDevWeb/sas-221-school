import { fcfa } from './financesDonnees';
import { echapper, ouvrirDocumentImprimable, tableauCleValeurHtml } from '@/shared/lib/documentImprimable';
import { identiteEcole } from '@/shared/lib/documentOfficiel';

/**
 * Reçu de versement imprimable (fenêtre d'impression du navigateur, format A5 ; « Enregistrer en PDF » possible).
 * Aucune donnée inventée : une information que le serveur ne fournit pas est imprimée « non communiqué ».
 */

const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze',
  'treize', 'quatorze', 'quinze', 'seize'];
const DIZAINES: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante', 8: 'quatre-vingt' };

function sous100(n: number, finFinale: boolean): string {
  if (n < 17) return UNITES[n];
  if (n < 20) return `dix-${UNITES[n - 10]}`;
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 7 || d === 9) {
    const reste = n - (d === 7 ? 60 : 80);   // 10 à 19
    if (d === 7 && reste === 11) return 'soixante et onze';
    return `${d === 7 ? 'soixante' : 'quatre-vingt'}-${sous100(reste, true)}`;
  }
  if (u === 0) return d === 8 ? (finFinale ? 'quatre-vingts' : 'quatre-vingt') : DIZAINES[d];
  if (u === 1 && d !== 8) return `${DIZAINES[d]} et un`;
  return `${DIZAINES[d]}-${UNITES[u]}`;
}

/** 0 à 999 ; `finFinale` : le nombre termine l'expression (accord de « cents » et « quatre-vingts »). */
function sous1000(n: number, finFinale: boolean): string {
  const c = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (c === 1) parts.push('cent');
  else if (c > 1) parts.push(`${UNITES[c]} cent${r === 0 && finFinale ? 's' : ''}`);
  if (r > 0 || c === 0) parts.push(sous100(r, finFinale));
  return parts.join(' ');
}

/** Montant en toutes lettres (orthographe traditionnelle) : 125 000 → « cent vingt-cinq mille ». */
export function montantEnLettres(montant: number): string {
  let n = Math.floor(Math.abs(montant));
  if (n === 0) return 'zéro';
  const morceaux: string[] = [];
  const milliards = Math.floor(n / 1e9); n %= 1e9;
  const millions = Math.floor(n / 1e6); n %= 1e6;
  const milliers = Math.floor(n / 1e3); n %= 1e3;
  if (milliards) morceaux.push(`${sous1000(milliards, true)} milliard${milliards > 1 ? 's' : ''}`);
  if (millions) morceaux.push(`${sous1000(millions, true)} million${millions > 1 ? 's' : ''}`);
  if (milliers) morceaux.push(milliers === 1 ? 'mille' : `${sous1000(milliers, false)} mille`);
  if (n) morceaux.push(sous1000(n, true));
  return morceaux.join(' ');
}

export interface DonneesRecu {
  numero: string;
  ecole: string;
  logoUrl?: string;
  eleve: string;
  classe?: string;
  montant: number;
  /** Date-heure ISO ou AAAA-MM-JJ. */
  date: string;
  /** null : le serveur ne communique pas ce moyen (journal des encaissements). */
  moyen: string | null;
  reference: string | null;
  /** null : non calculable à partir des données du serveur. */
  resteApres: number | null;
}

/** Ouvre le reçu (A5, modèle commun des documents de l'école) et lance l'impression. false si la fenêtre est bloquée. */
export function imprimerRecu(r: DonneesRecu): boolean {
  const date = (() => { const d = new Date(r.date); return Number.isNaN(d.getTime()) ? r.date : d.toLocaleDateString('fr-FR'); })();
  const nonCommunique = '<em>non communiqué par le serveur</em>';
  const lignes = [
    { cle: 'Élève', valeur: r.eleve },
    ...(r.classe ? [{ cle: 'Classe', valeur: r.classe }] : []),
    { cle: 'Montant', valeur: `<strong>${echapper(fcfa(r.montant))}</strong>`, html: true },
    { cle: 'En lettres', valeur: `${montantEnLettres(r.montant)} francs CFA` },
    { cle: 'Moyen de paiement', valeur: r.moyen ? echapper(r.moyen) : nonCommunique, html: true },
    { cle: 'Référence', valeur: r.reference ? echapper(r.reference) : (r.moyen ? 'aucune' : nonCommunique), html: true },
    { cle: 'Date du paiement', valeur: date },
    { cle: 'Reste à payer après ce paiement', valeur: r.resteApres == null ? '<em>non calculable</em>' : echapper(fcfa(r.resteApres)), html: true },
  ];
  return ouvrirDocumentImprimable({
    titre: `Reçu n° ${r.numero}`, titreFenetre: `Reçu n° ${r.numero}`, format: 'A5',
    ecole: { ...identiteEcole(), nom: r.ecole, logoUrl: r.logoUrl },
    corps: `${tableauCleValeurHtml(lignes)}<div class="signature"><span>Reçu remis le ${echapper(new Date().toLocaleDateString('fr-FR'))}</span><span>Signature et cachet de l'école</span></div>`,
  });
}

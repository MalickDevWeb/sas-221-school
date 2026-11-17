import type { jsPDF } from 'jspdf';
import { useTenantStore } from '@/core/store/tenantStore';
import { anneeAcademique } from './anneeAcademique';

/**
 * Documents officiels PDF de l'école — un seul module pour tous les PDF.
 *
 * - Police Unicode embarquée : Noto Sans (SIL Open Font License 1.1), sous-ensemble latin servi depuis
 *   /fonts/NotoSans-{Regular,Bold}-sousensemble.ttf (licence : /fonts/OFL-NotoSans.txt). Les polices standard de jsPDF
 *   ne connaissent ni l'espace fine insécable de toLocaleString('fr-FR') ni « • » (rendus « / » et lettres espacées).
 * - Nombres avec une espace NORMALE (« 22 222 FCFA »).
 * - En-tête : logo de l'école (ou ses initiales dans une pastille à sa couleur), nom, coordonnées réelles, filet à la
 *   couleur de l'école ; titre ; « Édité le … — Année scolaire … ». Tableaux lisibles avec état vide. Pied :
 *   « Page x/n — <École> — Document généré par My School le <date> ». Lisible imprimé en noir et blanc.
 * Aucune école n'est traitée à part (pas de cas « École 221 » écrit en dur).
 */

export type Rgb = [number, number, number];

export interface IdentiteEcole {
  nom: string;
  logoUrl?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  /** Couleur principale de l'école (assombrie si trop claire pour du texte blanc). */
  couleur: Rgb;
}

const POLICE = 'NotoSans';
const GRIS_TEXTE: Rgb = [30, 41, 59];
const GRIS_DOUX: Rgb = [100, 116, 139];
const FILET: Rgb = [203, 213, 225];
const FOND_ALTERNE: Rgb = [244, 246, 249];

// ── Formats ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** Remplace les espaces insécables (fines ou non) par une espace normale. */
export const sansEspaceInsecable = (s: string) => s.replace(/[\u202f\u00a0\u2009]/g, ' ');
export const formatNombre = (n: number) => sansEspaceInsecable(Math.round(n).toLocaleString('fr-FR'));
export const formatMontant = (n: number) => `${formatNombre(n)} FCFA`;
export const dateLongue = (d: Date = new Date()) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Année scolaire des documents : SOURCE UNIQUE = anneeAcademique() (shared/lib/anneeAcademique.ts, convention
 * septembre → août), la même que les écrans ; à brancher là-bas sur une vraie source serveur quand elle existera.
 */
export const anneeScolaire = (d: Date = new Date()): string => anneeAcademique(d);

/** Initiales de l'école (« École Mbao » → « EM »). */
export function initialesEcole(nom: string): string {
  const mots = nom.split(/[\s'’-]+/).filter((m) => m && !/^(de|du|des|la|le|les|l|d|et)$/i.test(m));
  return (mots.slice(0, 2).map((m) => m[0]).join('') || nom.slice(0, 2) || '?').toUpperCase();
}

const hexVersRgb = (hex: string | undefined): Rgb | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim());
  if (!m) return null;
  const v = m[1];
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
const luminance = ([r, g, b]: Rgb) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
/** Couleur assombrie tant qu'elle est trop claire pour porter du texte blanc. */
function couleurLisible(c: Rgb): Rgb {
  let [r, g, b] = c;
  for (let i = 0; i < 10 && luminance([r, g, b]) > 0.45; i++) { r *= 0.85; g *= 0.85; b *= 0.85; }
  return [Math.round(r), Math.round(g), Math.round(b)];
}

/** Identité de l'école COURANTE (store de l'école) ; rien n'est inventé : un champ absent n'est pas imprimé. */
export function identiteEcole(): IdentiteEcole {
  const t = useTenantStore.getState().currentTenant;
  const hex = t?.branding?.palette?.primary || t?.branding?.primaryColor;
  return {
    nom: t?.name || 'Établissement',
    logoUrl: t?.branding?.logoUrl || undefined,
    telephone: t?.phone || undefined,
    email: t?.email || undefined,
    ville: t?.city || undefined,
    couleur: couleurLisible(hexVersRgb(hex) ?? [30, 41, 59]),
  };
}

// ── Police ──────────────────────────────────────────────────────────────────────────────────────────────────────

export interface PolicesBase64 { regular: string; bold: string }
let policesEnCache: Promise<PolicesBase64 | null> | null = null;

function enBase64(buffer: ArrayBuffer): string {
  const octets = new Uint8Array(buffer);
  let binaire = '';
  for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode(...octets.subarray(i, i + 0x8000));
  return btoa(binaire);
}

/** Polices téléchargées une fois par session ; null si indisponibles (repli Helvetica, texte nettoyé). */
function chargerPolices(): Promise<PolicesBase64 | null> {
  policesEnCache ??= (async () => {
    try {
      const [r, b] = await Promise.all(['Regular', 'Bold'].map(async (g) => {
        const rep = await fetch(`/fonts/NotoSans-${g}-sousensemble.ttf`);
        if (!rep.ok) throw new Error(String(rep.status));
        return enBase64(await rep.arrayBuffer());
      }));
      return { regular: r, bold: b };
    } catch {
      policesEnCache = null;   // nouvel essai au prochain document
      return null;
    }
  })();
  return policesEnCache;
}

// ── Document ────────────────────────────────────────────────────────────────────────────────────────────────────

export interface DocumentOfficiel {
  doc: jsPDF;
  ecole: IdentiteEcole;
  /** Police active (« NotoSans » ou « helvetica » en repli). */
  police: string;
  marge: number;
  largeur: number;
  hauteur: number;
  /** Ordonnée courante (mm). */
  y: number;
  /** Texte à écrire, nettoyé si la police Unicode n'a pas pu être chargée. */
  t: (s: string) => string;
}

export async function creerDocument(options: {
  format?: 'a4' | 'a5'; orientation?: 'portrait' | 'landscape'; ecole?: IdentiteEcole; polices?: PolicesBase64 | null;
} = {}): Promise<DocumentOfficiel> {
  const { jsPDF: JsPDF } = await import('jspdf');
  const doc = new JsPDF({ unit: 'mm', format: options.format ?? 'a4', orientation: options.orientation ?? 'portrait' });
  const polices = options.polices !== undefined ? options.polices : await chargerPolices();
  let police = 'helvetica';
  if (polices) {
    doc.addFileToVFS('NotoSans-Regular.ttf', polices.regular);
    doc.addFont('NotoSans-Regular.ttf', POLICE, 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', polices.bold);
    doc.addFont('NotoSans-Bold.ttf', POLICE, 'bold');
    police = POLICE;
  }
  const t = police === POLICE ? sansEspaceInsecable
    : (s: string) => sansEspaceInsecable(s).replace(/[•●]/g, '-').replace(/[–—]/g, '-').replace(/[’]/g, "'").replace(/[«»]/g, '"');
  doc.setFont(police, 'normal');
  return {
    doc, ecole: options.ecole ?? identiteEcole(), police, t,
    marge: options.format === 'a5' ? 12 : 15,
    largeur: doc.internal.pageSize.getWidth(),
    hauteur: doc.internal.pageSize.getHeight(),
    y: 15,
  };
}

function chargerImage(url: string): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

const couleurTexte = (d: DocumentOfficiel, c: Rgb) => d.doc.setTextColor(c[0], c[1], c[2]);
const police = (d: DocumentOfficiel, gras: boolean, taille: number) => { d.doc.setFont(d.police, gras ? 'bold' : 'normal'); d.doc.setFontSize(taille); };

/** En-tête officiel : logo ou initiales, nom, coordonnées, filet, titre et ligne d'édition. */
export async function enTete(d: DocumentOfficiel, titre: string, sousTitre?: string, date: Date = new Date()): Promise<void> {
  const { doc, ecole, marge, largeur } = d;
  const taille = 16;
  let logo = false;
  if (ecole.logoUrl) {
    const img = await chargerImage(ecole.logoUrl);
    if (img) {
      try {
        const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
        const l = Math.min(taille * ratio, 34);
        doc.addImage(img, 'PNG', marge, d.y, l, l / ratio);
        logo = true;
      } catch { /* format d'image non pris en charge : initiales */ }
    }
  }
  if (!logo) {
    doc.setFillColor(ecole.couleur[0], ecole.couleur[1], ecole.couleur[2]);
    doc.circle(marge + taille / 2, d.y + taille / 2, taille / 2, 'F');
    police(d, true, 10);
    doc.setTextColor(255, 255, 255);
    doc.text(d.t(initialesEcole(ecole.nom)), marge + taille / 2, d.y + taille / 2 + 1.3, { align: 'center' });
  }
  const x = marge + (logo ? 38 : taille + 5);
  police(d, true, 13);
  couleurTexte(d, GRIS_TEXTE);
  doc.text(d.t(ecole.nom), x, d.y + 6);
  const contacts = [ecole.ville, ecole.telephone, ecole.email].filter(Boolean).join(' • ');
  if (contacts) {
    police(d, false, 8.5);
    couleurTexte(d, GRIS_DOUX);
    doc.text(d.t(contacts), x, d.y + 11.5);
  }
  d.y += taille + 3;
  doc.setDrawColor(ecole.couleur[0], ecole.couleur[1], ecole.couleur[2]);
  doc.setLineWidth(0.8);
  doc.line(marge, d.y, largeur - marge, d.y);
  d.y += 8;
  police(d, true, 15);
  couleurTexte(d, GRIS_TEXTE);
  doc.text(d.t(titre), marge, d.y);
  d.y += 5.5;
  if (sousTitre) {
    police(d, false, 10);
    doc.text(d.t(sousTitre), marge, d.y);
    d.y += 5;
  }
  police(d, false, 8.5);
  couleurTexte(d, GRIS_DOUX);
  doc.text(d.t(`Édité le ${dateLongue(date)} — Année scolaire ${anneeScolaire(date)}`), marge, d.y);
  d.y += 8;
}

/** Saut de page si la hauteur demandée ne tient pas (le pied de page est réservé). */
export function assurerPlace(d: DocumentOfficiel, hauteur: number): boolean {
  if (d.y + hauteur <= d.hauteur - 18) return false;
  d.doc.addPage();
  d.y = 18;
  return true;
}

/** Paragraphe (retour à la ligne automatique). */
export function paragraphe(d: DocumentOfficiel, texte: string, options: { gras?: boolean; taille?: number; couleur?: Rgb } = {}): void {
  police(d, !!options.gras, options.taille ?? 10);
  couleurTexte(d, options.couleur ?? GRIS_TEXTE);
  const lignes: string[] = d.doc.splitTextToSize(d.t(texte), d.largeur - d.marge * 2);
  const h = (options.taille ?? 10) * 0.45;
  lignes.forEach((l) => { assurerPlace(d, h); d.doc.text(l, d.marge, d.y); d.y += h; });
  d.y += 1.5;
}

/** Tableau de libellés / valeurs (fiche, reçu). */
export function tableauCleValeur(d: DocumentOfficiel, lignes: [string, string][], largeurCle = 0.42): void {
  const { doc, marge, largeur } = d;
  const total = largeur - marge * 2;
  const lc = total * largeurCle;
  lignes.forEach(([k, v], i) => {
    police(d, false, 10);
    const lv: string[] = doc.splitTextToSize(d.t(v), total - lc - 6);
    const h = Math.max(8, lv.length * 4.6 + 3.4);
    assurerPlace(d, h);
    if (i % 2 === 0) { doc.setFillColor(...FOND_ALTERNE); doc.rect(marge, d.y, total, h, 'F'); }
    doc.setDrawColor(...FILET); doc.setLineWidth(0.2); doc.rect(marge, d.y, total, h, 'S');
    police(d, true, 10); couleurTexte(d, GRIS_TEXTE);
    doc.text(d.t(k), marge + 3, d.y + 5.3);
    police(d, false, 10);
    doc.text(lv, marge + lc + 3, d.y + 5.3);
    d.y += h;
  });
  d.y += 4;
}

export interface Colonne { titre: string; largeur: number; align?: 'left' | 'right' | 'center' }

/** Tableau à colonnes : en-tête coloré répété à chaque page, lignes alternées, montants à droite, état vide. */
export function tableau(d: DocumentOfficiel, colonnes: Colonne[], lignes: string[][], messageVide: string): void {
  const { doc, marge, ecole } = d;
  const total = d.largeur - marge * 2;
  const somme = colonnes.reduce((s, c) => s + c.largeur, 0);
  const larg = colonnes.map((c) => (c.largeur / somme) * total);
  const enTeteTableau = () => {
    doc.setFillColor(ecole.couleur[0], ecole.couleur[1], ecole.couleur[2]);
    doc.rect(marge, d.y, total, 8, 'F');
    police(d, true, 9); doc.setTextColor(255, 255, 255);
    let x = marge;
    colonnes.forEach((c, i) => {
      const tx = c.align === 'right' ? x + larg[i] - 2.5 : c.align === 'center' ? x + larg[i] / 2 : x + 2.5;
      doc.text(d.t(c.titre), tx, d.y + 5.4, { align: c.align ?? 'left' });
      x += larg[i];
    });
    d.y += 8;
  };
  assurerPlace(d, 16);
  enTeteTableau();
  if (lignes.length === 0) {
    doc.setDrawColor(...FILET); doc.setLineWidth(0.2); doc.rect(marge, d.y, total, 10, 'S');
    police(d, false, 9.5); couleurTexte(d, GRIS_DOUX);
    doc.text(d.t(messageVide), marge + total / 2, d.y + 6.3, { align: 'center' });
    d.y += 14;
    return;
  }
  lignes.forEach((ligne, n) => {
    police(d, false, 9);
    const cellules = ligne.map((v, i) => doc.splitTextToSize(d.t(v ?? ''), larg[i] - 5) as string[]);
    const h = Math.max(7, Math.max(...cellules.map((c) => c.length)) * 4.2 + 2.8);
    if (assurerPlace(d, h)) enTeteTableau();
    if (n % 2 === 1) { doc.setFillColor(...FOND_ALTERNE); doc.rect(marge, d.y, total, h, 'F'); }
    doc.setDrawColor(...FILET); doc.setLineWidth(0.15); doc.line(marge, d.y + h, marge + total, d.y + h);
    couleurTexte(d, GRIS_TEXTE);
    let x = marge;
    cellules.forEach((c, i) => {
      const a = colonnes[i]?.align ?? 'left';
      const tx = a === 'right' ? x + larg[i] - 2.5 : a === 'center' ? x + larg[i] / 2 : x + 2.5;
      doc.text(c, tx, d.y + 4.8, { align: a });
      x += larg[i];
    });
    d.y += h;
  });
  d.y += 6;
}

/** Pied de page sur toutes les pages : « Page x/n — École — Document généré par My School le <date> ». */
export function piedsDePage(d: DocumentOfficiel, date: Date = new Date()): void {
  const { doc } = d;
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p);
    doc.setDrawColor(...FILET); doc.setLineWidth(0.2);
    doc.line(d.marge, d.hauteur - 12, d.largeur - d.marge, d.hauteur - 12);
    police(d, false, 7.5); couleurTexte(d, GRIS_DOUX);
    doc.text(d.t(`Page ${p}/${n} — ${d.ecole.nom} — Document généré par My School le ${dateLongue(date)}`),
      d.largeur / 2, d.hauteur - 7.5, { align: 'center' });
  }
}

/** Nom de fichier sans accents ni espaces. */
export const nomDeFichier = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'document';

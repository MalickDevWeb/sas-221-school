/**
 * Encodeur de QR code local (2026-11-13).
 *
 * Avant : chaque QR de l'application (badge élève, badge professeur, retrait d'un élève, lien de candidature, QR du
 * vigile) était une image demandée à un service externe (api.qrserver.com), qui recevait ainsi le contenu — dont le
 * matricule de l'élève et son jeton d'accès valide — et rendait les QR indisponibles hors ligne.
 *
 * Norme ISO/IEC 18004 (QR Code modèle 2) : mode octet (UTF-8), niveau de correction M, versions 1 à 40, choix du
 * masque par score de pénalité. Structure d'après l'implémentation de référence de Project Nayuki (licence MIT).
 * Vérifié par décodage (OpenCV) dans qa/e2e/qr_local.py.
 */

// Niveau M — codes correcteurs par bloc et nombre de blocs, index = version (1 à 40).
const ECC_PAR_BLOC = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28,
  28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
const NB_BLOCS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31,
  33, 35, 37, 38, 40, 43, 45, 47, 49];
const BITS_FORMAT_NIVEAU_M = 0;

function modulesDonneesBruts(ver: number): number {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const nbAlign = Math.floor(ver / 7) + 2;
    r -= (25 * nbAlign - 10) * nbAlign - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}

function motsDeDonnees(ver: number): number {
  return Math.floor(modulesDonneesBruts(ver) / 8) - ECC_PAR_BLOC[ver] * NB_BLOCS[ver];
}

// ---------------------------------------------------------------- Reed-Solomon sur GF(2^8), polynôme 0x11D
function multiplier(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function diviseurRs(degre: number): number[] {
  const r: number[] = [];
  for (let i = 0; i < degre - 1; i++) r.push(0);
  r.push(1);
  let racine = 1;
  for (let i = 0; i < degre; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = multiplier(r[j], racine);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    racine = multiplier(racine, 0x02);
  }
  return r;
}

function resteRs(donnees: readonly number[], diviseur: readonly number[]): number[] {
  const r = diviseur.map(() => 0);
  for (const b of donnees) {
    const facteur = b ^ (r.shift() as number);
    r.push(0);
    diviseur.forEach((coef, i) => { r[i] ^= multiplier(coef, facteur); });
  }
  return r;
}

function ajouterCorrectionEtEntrelacer(donnees: number[], ver: number): number[] {
  const nbBlocs = NB_BLOCS[ver];
  const eccBloc = ECC_PAR_BLOC[ver];
  const motsBruts = Math.floor(modulesDonneesBruts(ver) / 8);
  const nbBlocsCourts = nbBlocs - (motsBruts % nbBlocs);
  const longueurBlocCourt = Math.floor(motsBruts / nbBlocs);
  const div = diviseurRs(eccBloc);
  const blocs: number[][] = [];
  for (let i = 0, k = 0; i < nbBlocs; i++) {
    const dat = donnees.slice(k, k + longueurBlocCourt - eccBloc + (i < nbBlocsCourts ? 0 : 1));
    k += dat.length;
    const ecc = resteRs(dat, div);
    if (i < nbBlocsCourts) dat.push(0);
    blocs.push(dat.concat(ecc));
  }
  const res: number[] = [];
  for (let i = 0; i < blocs[0].length; i++) {
    blocs.forEach((bloc, j) => {
      if (i !== longueurBlocCourt - eccBloc || j >= nbBlocsCourts) res.push(bloc[i]);
    });
  }
  return res;
}

// ---------------------------------------------------------------- grille
function positionsAlignement(ver: number, taille: number): number[] {
  if (ver === 1) return [];
  const nb = Math.floor(ver / 7) + 2;
  const pas = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (nb * 2 - 2)) * 2;
  const r = [6];
  for (let pos = taille - 7; r.length < nb; pos -= pas) r.splice(1, 0, pos);
  return r;
}

const bit = (x: number, i: number) => ((x >>> i) & 1) !== 0;

const MASQUES: ReadonlyArray<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

class Grille {
  readonly ver: number;
  readonly taille: number;
  readonly m: boolean[][];
  readonly fonction: boolean[][];

  constructor(ver: number) {
    this.ver = ver;
    this.taille = ver * 4 + 17;
    this.m = Array.from({ length: this.taille }, () => Array<boolean>(this.taille).fill(false));
    this.fonction = Array.from({ length: this.taille }, () => Array<boolean>(this.taille).fill(false));
  }

  private poser(x: number, y: number, noir: boolean) {
    this.m[y][x] = noir;
    this.fonction[y][x] = true;
  }

  motifsFixes() {
    const t = this.taille;
    for (let i = 0; i < t; i++) {
      this.poser(6, i, i % 2 === 0);
      this.poser(i, 6, i % 2 === 0);
    }
    for (const [cx, cy] of [[3, 3], [t - 4, 3], [3, t - 4]]) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          const x = cx + dx; const y = cy + dy;
          if (x >= 0 && x < t && y >= 0 && y < t) this.poser(x, y, d !== 2 && d !== 4);
        }
      }
    }
    const pos = positionsAlignement(this.ver, t);
    const n = pos.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) this.poser(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
    this.format(0);
    this.version();
  }

  format(masque: number) {
    const donnees = (BITS_FORMAT_NIVEAU_M << 3) | masque;
    let r = donnees;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const bits = ((donnees << 10) | r) ^ 0x5412;
    const t = this.taille;
    for (let i = 0; i <= 5; i++) this.poser(8, i, bit(bits, i));
    this.poser(8, 7, bit(bits, 6));
    this.poser(8, 8, bit(bits, 7));
    this.poser(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) this.poser(14 - i, 8, bit(bits, i));
    for (let i = 0; i < 8; i++) this.poser(t - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i++) this.poser(8, t - 15 + i, bit(bits, i));
    this.poser(8, t - 8, true);
  }

  private version() {
    if (this.ver < 7) return;
    let r = this.ver;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
    const bits = (this.ver << 12) | r;
    for (let i = 0; i < 18; i++) {
      const b = bit(bits, i);
      const a = this.taille - 11 + (i % 3);
      const c = Math.floor(i / 3);
      this.poser(a, c, b);
      this.poser(c, a, b);
    }
  }

  codewords(donnees: readonly number[]) {
    const t = this.taille;
    let i = 0;
    for (let droite = t - 1; droite >= 1; droite -= 2) {
      if (droite === 6) droite = 5;
      for (let v = 0; v < t; v++) {
        for (let j = 0; j < 2; j++) {
          const x = droite - j;
          const montant = ((droite + 1) & 2) === 0;
          const y = montant ? t - 1 - v : v;
          if (!this.fonction[y][x] && i < donnees.length * 8) {
            this.m[y][x] = bit(donnees[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  masquer(masque: number) {
    const f = MASQUES[masque];
    for (let y = 0; y < this.taille; y++) {
      for (let x = 0; x < this.taille; x++) {
        if (!this.fonction[y][x] && f(x, y)) this.m[y][x] = !this.m[y][x];
      }
    }
  }

  /** Pénalités N1 (suites ≥ 5), N2 (carrés 2×2) et N4 (proportion de noir) de la norme. */
  penalite(): number {
    const t = this.taille;
    let p = 0;
    for (let y = 0; y < t; y++) {
      for (const horizontal of [true, false]) {
        let couleur = false; let suite = 0;
        for (let x = 0; x < t; x++) {
          const c = horizontal ? this.m[y][x] : this.m[x][y];
          if (x > 0 && c === couleur) {
            suite++;
            if (suite === 5) p += 3; else if (suite > 5) p++;
          } else {
            couleur = c; suite = 1;
          }
        }
      }
    }
    for (let y = 0; y < t - 1; y++) {
      for (let x = 0; x < t - 1; x++) {
        const c = this.m[y][x];
        if (c === this.m[y][x + 1] && c === this.m[y + 1][x] && c === this.m[y + 1][x + 1]) p += 3;
      }
    }
    let noirs = 0;
    for (const ligne of this.m) for (const c of ligne) if (c) noirs++;
    const total = t * t;
    p += (Math.ceil(Math.abs(noirs * 20 - total * 10) / total) - 1) * 10;
    return p;
  }
}

/** Matrice du QR (true = module noir), sans zone de silence. */
export function encoderQr(texte: string, masqueImpose?: number): boolean[][] {
  const octets = Array.from(new TextEncoder().encode(texte));
  let ver = 1;
  for (; ver <= 40; ver++) {
    const besoin = 4 + (ver <= 9 ? 8 : 16) + octets.length * 8;
    if (besoin <= motsDeDonnees(ver) * 8) break;
  }
  if (ver > 40) throw new Error('Contenu trop long pour un QR code.');

  const bits: number[] = [];
  const ajouter = (val: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  ajouter(0b0100, 4);
  ajouter(octets.length, ver <= 9 ? 8 : 16);
  for (const o of octets) ajouter(o, 8);
  const capacite = motsDeDonnees(ver) * 8;
  ajouter(0, Math.min(4, capacite - bits.length));
  ajouter(0, (8 - (bits.length % 8)) % 8);
  for (let rembourrage = 0xec; bits.length < capacite; rembourrage ^= 0xec ^ 0x11) ajouter(rembourrage, 8);
  const donnees: number[] = [];
  for (let i = 0; i < bits.length; i += 8) donnees.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  const g = new Grille(ver);
  g.motifsFixes();
  g.codewords(ajouterCorrectionEtEntrelacer(donnees, ver));
  let meilleur = masqueImpose ?? 0; let min = Infinity;
  for (let k = 0; k < 8 && masqueImpose === undefined; k++) {
    g.masquer(k);
    g.format(k);
    const p = g.penalite();
    if (p < min) { min = p; meilleur = k; }
    g.masquer(k);
  }
  g.masquer(meilleur);
  g.format(meilleur);
  return g.m;
}

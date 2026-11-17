import React from 'react';
import type { ThemeColors } from '@/design-system/theme.types';
import { getContrastRatio } from '@/shared/utils/colorExtractor';

interface Props {
  schoolName: string;
  colors: ThemeColors;
  /** Logo réel de l'école (sinon : initiales de son nom). */
  logoUrl?: string;
}

/** Initiales de l'école (« École Mbao » → « EM ») ; jamais un monogramme d'une autre école. */
function initiales(nom: string): string {
  const mots = nom.split(/[\s'’-]+/).filter(m => m && !/^(de|du|des|la|le|les|l|d|et)$/i.test(m));
  return (mots.slice(0, 2).map(m => m[0]).join('') || nom.slice(0, 2)).toUpperCase();
}

/**
 * Aperçu de la couleur choisie : aucun chiffre inventé (APP-TL-22), cartes d'exemple sans valeur, marquées « Exemple ».
 */
export function ThemePreview({ schoolName, colors, logoUrl }: Props) {
  const contrastRatio = getContrastRatio(colors.primary, colors.textOnPrimary);
  const isWcagCompliant = contrastRatio >= 4.5;
  const lisibilite = contrastRatio >= 7 ? 'excellente' : isWcagCompliant ? 'bonne' : 'faible';

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden shadow-sm transition-all">
      {/* Barre supérieure d'aperçu */}
      <div className="px-4 py-3 bg-surface-page border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold text-text-muted ml-2">Aperçu de l'espace de votre école (exemple)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isWcagCompliant ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            Lisibilité : {lisibilite}
          </span>
        </div>
      </div>

      {/* Mini Interface de simulation */}
      <div className="p-5 space-y-4">
        {/* Navigation simulateur */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={`Logo de ${schoolName}`} className="w-8 h-8 rounded-xl object-contain bg-white border border-surface-border" />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs"
                style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
                aria-hidden="true"
              >
                {initiales(schoolName)}
              </div>
            )}
            <div>
              <div className="text-xs font-black text-text-body">{schoolName}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.primaryDark }}>
                Portail Direction
              </div>
            </div>
          </div>

          {/* Menu items simulation */}
          <div className="flex items-center gap-1.5">
            <span
              className="px-3 py-1.5 text-[11px] font-bold rounded-lg shadow-xs"
              style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
            >
              Tableau de bord
            </span>
            <span className="px-3 py-1.5 text-[11px] font-medium text-text-muted hover:bg-neutral-100 rounded-lg">
              Élèves
            </span>
            <span className="px-3 py-1.5 text-[11px] font-medium text-text-muted hover:bg-neutral-100 rounded-lg">
              Finances
            </span>
          </div>
        </div>

        {/* Mini KPI Card */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3.5 rounded-xl border border-surface-border transition-all"
            style={{ backgroundColor: colors.surfaceWarm }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Carte d'exemple</div>
            <div className="text-xl font-black mt-1" style={{ color: colors.primaryDark }}>
              —
            </div>
            <div className="text-[10px] font-semibold text-text-muted mt-1">Vos vrais chiffres s'affichent dans le tableau de bord.</div>
          </div>

          <div className="p-3.5 rounded-xl border border-surface-border bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Couleur d'accent (exemple)</div>
            <div className="text-xl font-black text-text-body mt-1">—</div>
            <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.accent }} aria-hidden="true" />
          </div>
        </div>

        {/* Boutons d'action simulateur */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95"
            style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
          >
            Bouton d'Action Principal
          </button>
          <button
            type="button"
            className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-border hover:bg-neutral-50 text-text-body transition-colors"
          >
            Bouton Secondaire
          </button>
          <span
            className="px-2.5 py-1 text-[10px] font-black rounded-lg ml-auto uppercase tracking-wider"
            style={{ backgroundColor: colors.primaryLight, color: colors.primaryDark }}
          >
            Badge Actif
          </span>
        </div>
      </div>
    </div>
  );
}


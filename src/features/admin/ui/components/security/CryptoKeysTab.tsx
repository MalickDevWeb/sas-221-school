import React from 'react';
import { ApiKeyCard } from './ApiKeyCard';

/**
 * Onglet « Clés de sécurité ». 2026-11-14 : retrait de deux cartes trompeuses — « Clé AES-256 régénérée » (aucun appel au
 * serveur ; les badges ne sont pas chiffrés en AES mais signés en Ed25519) et un « code de sécurité des suppressions »
 * gardé dans le navigateur avec la valeur « 221 » par défaut (la confirmation acceptait de toute façon « CONFIRMER »).
 * L'encart décrit le vrai mécanisme.
 */
export function CryptoKeysTab() {
  return (
    <div className="space-y-6 text-xs font-bold text-[#4A5568]" id="crypto-keys-tab">
      <div className="pb-2 border-b border-neutral-100">
        <h3 className="font-extrabold text-sm text-[#1E293B]">Clés de sécurité</h3>
        <p className="text-[10px] text-neutral-400 font-semibold">Comment les accès au campus et les suppressions sont protégés.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div id="badges-explication" className="md:col-span-2 bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-5 space-y-2.5 shadow-xs text-[11px] font-semibold text-neutral-600">
          <span className="text-[10px] font-black uppercase text-[#1E293B] block">Badges QR des élèves</span>
          <p>Chaque badge QR est <b>signé par le serveur</b> (signature Ed25519) et renouvelé automatiquement chaque minute dans l'application de l'élève : une capture d'écran ne sert plus au bout d'une minute, et aucune clé n'est à régénérer.</p>
          <p><b>Téléphone perdu ou volé :</b> suspendez l'élève depuis Gestion Élèves (son accès et ses badges sont refusés immédiatement), puis réactivez-le après le changement de son mot de passe.</p>
          <p><b>Terminaux des vigiles :</b> un terminal désactivé ou révoqué (onglet Terminaux) fait refuser les scans de son vigile.</p>
          <p><b>Suppressions et annulations :</b> elles sont réservées aux rôles qui en ont le droit (Gestion Personnel › Droits d'accès), vérifié par le serveur ; l'écran demande seulement de taper « CONFIRMER » pour éviter une erreur de clic.</p>
        </div>
        <ApiKeyCard />
      </div>
    </div>
  );
}

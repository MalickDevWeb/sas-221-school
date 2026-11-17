import React, { useRef } from 'react';
import { ACCEPT_FORMATS, LIBELLE_FORMATS, type PiecesRegles as EtatPieces, type PieceRegle } from './usePiecesRegles';

/**
 * Pièces demandées par l'école d'après ses règles d'admission : liste, envoi au format exigé, blocage
 * éventuel expliqué. Rien n'est affiché si aucune règle ne s'applique au dossier.
 */
export function PiecesRegles({ regles }: { regles: EtatPieces }) {
  if (regles.etat === 'chargement') {
    return <p role="status" className="text-xs font-semibold text-neutral-500">Vérification des pièces demandées par l'école…</p>;
  }
  if (regles.etat === 'erreur') {
    return (
      <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex flex-wrap items-center justify-between gap-2">
        <span>Les pièces demandées par l'école n'ont pas pu être vérifiées (connexion).</span>
        <button type="button" onClick={regles.reessayer} className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-black cursor-pointer">Réessayer</button>
      </div>
    );
  }
  if (regles.blocages.length === 0 && regles.exigees.length === 0) return null;

  return (
    <section id="pieces-regles" aria-labelledby="pieces-regles-titre" className="space-y-3">
      {regles.blocages.length > 0 && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
          <p className="text-xs font-black text-rose-800 m-0">Votre dossier ne peut pas être déposé :</p>
          {regles.blocages.map((m) => <p key={m} className="text-xs font-semibold text-rose-700 m-0">{m}</p>)}
        </div>
      )}
      {regles.exigees.length > 0 && (
        <>
          <h4 id="pieces-regles-titre" className="text-xs font-black uppercase tracking-wide text-neutral-600 m-0">Pièces demandées par l'école</h4>
          <ul className="space-y-2">
            {regles.exigees.map((p) => <LignePiece key={p.code} piece={p} regles={regles} />)}
          </ul>
        </>
      )}
    </section>
  );
}

function LignePiece({ piece, regles }: { piece: PieceRegle; regles: EtatPieces }) {
  const entree = useRef<HTMLInputElement>(null);
  const envoyee = regles.envoyees[piece.code];
  const erreur = regles.erreurs[piece.code];
  const enCours = regles.envoiEnCours === piece.code;
  const idErreur = `piece-regle-${piece.code}-erreur`;
  return (
    <li className={`p-3 rounded-xl border bg-white ${erreur ? 'border-rose-300' : envoyee ? 'border-emerald-300' : 'border-neutral-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 m-0">{piece.libelle} <span className="text-rose-600">*</span></p>
          <p className="text-[11px] font-semibold text-neutral-500 m-0">
            {envoyee ? `Envoyée : ${envoyee.nom}` : `Format : ${LIBELLE_FORMATS[piece.formats]} — 10 Mo au maximum`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {envoyee && (
            <button type="button" onClick={() => regles.retirer(piece.code)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-neutral-600 hover:bg-neutral-100 bg-transparent border-0 cursor-pointer">
              Retirer
            </button>
          )}
          <button type="button" disabled={enCours || regles.envoiEnCours !== null} onClick={() => entree.current?.click()}
            aria-describedby={erreur ? idErreur : undefined}
            className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-primary text-white border-0 cursor-pointer disabled:opacity-50">
            {enCours ? 'Envoi…' : envoyee ? 'Remplacer' : 'Joindre le fichier'}
          </button>
          <input ref={entree} type="file" className="hidden" accept={ACCEPT_FORMATS[piece.formats]} aria-label={`Fichier : ${piece.libelle}`}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void regles.envoyer(piece, f); }} />
        </div>
      </div>
      {erreur && <p id={idErreur} role="alert" className="mt-1.5 text-[11px] font-semibold text-rose-700 m-0">{erreur}</p>}
    </li>
  );
}

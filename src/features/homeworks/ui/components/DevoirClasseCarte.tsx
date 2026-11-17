import React, { useRef } from 'react';
import type { DevoirClasse } from '../../api/devoirsClasse';
import { EXTENSIONS_ACCEPTEES } from '../../api/devoirsClasse';

interface Props {
  readonly devoir: DevoirClasse;
  readonly envoiEnCours: boolean;
  readonly message?: { texte: string; ok: boolean };
  readonly onDeposer: (devoir: DevoirClasse, fichier: File) => void;
}

const jour = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const aujourdhui = () => new Date().toISOString().slice(0, 10);

/** Un devoir de classe : échéance, rendu (fichier, retard), correction (note et commentaire), dépôt. */
export function DevoirClasseCarte({ devoir, envoiEnCours, message, onDeposer }: Props) {
  const choix = useRef<HTMLInputElement>(null);
  const depasse = devoir.etat === 'a_rendre' && devoir.dateLimite !== '' && devoir.dateLimite < aujourdhui();
  const peutDeposer = devoir.etat !== 'corrige';

  return (
    <article data-devoir={devoir.titre} className="bg-white border border-neutral-gray-200 rounded-2xl p-4 shadow-3xs space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-primary truncate">{devoir.cours}</p>
          <h4 className="text-sm font-black text-neutral-900 leading-snug">{devoir.titre}</h4>
        </div>
        {devoir.priorite === 'haute' && (
          <span className="shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">Prioritaire</span>
        )}
      </div>
      {devoir.description && <p className="text-[11px] text-neutral-600 font-semibold whitespace-pre-line">{devoir.description}</p>}
      <p className={`text-[11px] font-bold ${depasse ? 'text-rose-700' : 'text-neutral-500'}`}>
        {devoir.dateLimite ? `À rendre avant le ${jour(devoir.dateLimite)}` : 'Pas de date limite'}
        {depasse && ' — date limite dépassée (un dépôt sera marqué en retard)'}
      </p>

      {devoir.rendu && (
        <p className="text-[11px] font-semibold text-neutral-700 bg-neutral-50 rounded-xl px-3 py-2">
          Déposé : <a href={devoir.rendu.fichierUrl} target="_blank" rel="noopener noreferrer" className="font-black text-primary underline break-all">{devoir.rendu.fichierNom}</a>
          {devoir.rendu.deposeLe && <> le {jour(devoir.rendu.deposeLe)}</>}
          {devoir.rendu.enRetard && <span className="ml-1 font-black text-amber-700">(en retard)</span>}
        </p>
      )}

      {devoir.correction && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <p className="text-xs font-black text-emerald-800">Note : {devoir.correction.note === null ? '—' : devoir.correction.note.toLocaleString('fr-FR')}/20</p>
          {devoir.correction.commentaire && <p className="text-[11px] font-semibold text-emerald-900 mt-0.5 whitespace-pre-line">{devoir.correction.commentaire}</p>}
        </div>
      )}

      {peutDeposer && (
        <>
          <input ref={choix} type="file" accept={EXTENSIONS_ACCEPTEES} className="hidden" aria-label={`Fichier pour ${devoir.titre}`}
                 onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onDeposer(devoir, f); }} />
          <button type="button" disabled={envoiEnCours} onClick={() => choix.current?.click()}
                  className="w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/90 disabled:opacity-50 cursor-pointer">
            {envoiEnCours ? 'Envoi…' : devoir.rendu ? 'Remplacer mon fichier' : 'Déposer mon travail'}
          </button>
        </>
      )}
      {message && <p role={message.ok ? 'status' : 'alert'} className={`text-[11px] font-bold ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message.texte}</p>}
    </article>
  );
}

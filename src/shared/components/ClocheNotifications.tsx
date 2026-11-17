import { useEffect, useRef, useState, type ReactNode } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useMarquerLue, useMesNotifications, useNombreNonLues, type MaNotification } from '@/shared/lib/mesNotifications';

const quand = (d: Date | null) => {
  if (!d) return '';
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (minutes < 24 * 60) return `Il y a ${Math.round(minutes / 60)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Cloche des notifications du compte (élève, parent, professeur, personnel) : compteur des non lues, panneau avec
 * la liste réelle, alerte d'urgence mise en évidence, clic = notification ouverte et marquée lue sur le serveur.
 * `pied` : contenu facultatif sous la liste (ex. lien vers les messages).
 */
export function ClocheNotifications({ pied, classeBouton }: { pied?: ReactNode; classeBouton?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [deplie, setDeplie] = useState<string | null>(null);
  const racine = useRef<HTMLDivElement>(null);
  const nonLues = useNombreNonLues();
  const liste = useMesNotifications(ouvert);
  const marquer = useMarquerLue();
  const n = nonLues.data ?? 0;

  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: PointerEvent) => { if (racine.current && !racine.current.contains(e.target as Node)) setOuvert(false); };
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('pointerdown', clic);
    document.addEventListener('keydown', touche);
    return () => { document.removeEventListener('pointerdown', clic); document.removeEventListener('keydown', touche); };
  }, [ouvert]);

  const ouvrir = (x: MaNotification) => {
    setDeplie(d => (d === x.id ? null : x.id));
    if (!x.lue) marquer.mutate(x.id);
  };

  return (
    <div className="relative" ref={racine} id="cloche-notifications">
      <button type="button" onClick={() => setOuvert(o => !o)} aria-expanded={ouvert} aria-haspopup="dialog"
        aria-label={n > 0 ? `Notifications : ${n} non lue${n > 1 ? 's' : ''}` : 'Notifications'}
        className={classeBouton ?? 'relative w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-50 hover:bg-primary/10 text-neutral-600 hover:text-primary transition-all cursor-pointer'}>
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[21px]">notifications</span>
        {n > 0 && (
          <span data-non-lues={n} className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {n > 9 ? '9+' : n}
          </span>
        )}
      </button>

      {ouvert && (
        <div role="dialog" aria-label="Mes notifications"
          className="absolute right-0 mt-2 w-[min(92vw,360px)] bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-[300] text-left">
          <div className="px-3.5 py-3 border-b border-neutral-100 flex items-center justify-between gap-2">
            <p className="text-xs font-black text-neutral-900">Notifications</p>
            <span className="text-[10px] font-bold text-neutral-500">{n > 0 ? `${n} non lue${n > 1 ? 's' : ''}` : 'Tout est lu'}</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {liste.isLoading ? (
              <ul aria-busy="true" className="p-3 space-y-3">
                {[0, 1, 2].map(i => (
                  <li key={i} className="flex gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5 pt-1"><div className="h-2.5 w-3/5 rounded bg-neutral-100 animate-pulse" /><div className="h-2 w-4/5 rounded bg-neutral-100 animate-pulse" /></div>
                  </li>
                ))}
              </ul>
            ) : liste.isError ? (
              <div role="alert" className="p-4 text-center space-y-2">
                <p className="text-[11px] font-semibold text-red-700">Notifications indisponibles : {resolveErrorMessage(liste.error)}</p>
                <button type="button" onClick={() => void liste.refetch()} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[11px] font-black text-neutral-700 cursor-pointer">Réessayer</button>
              </div>
            ) : !liste.data || liste.data.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center gap-1.5">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[28px] text-neutral-300">notifications_off</span>
                <p className="text-xs font-black text-neutral-700">Aucune notification</p>
                <p className="text-[10px] text-neutral-500 font-semibold">Les annonces de l’école et les alertes apparaîtront ici.</p>
              </div>
            ) : (
              <ul>
                {liste.data.map(x => {
                  const urgence = x.nature === 'URGENCE';
                  return (
                    <li key={x.id} data-notification={x.id} data-lue={x.lue ? 'oui' : 'non'}>
                      <button type="button" onClick={() => ouvrir(x)} aria-expanded={deplie === x.id}
                        className={`w-full text-left px-3.5 py-3 flex gap-2.5 border-b border-neutral-50 cursor-pointer transition-colors ${urgence ? 'bg-red-50 hover:bg-red-100/70 border-l-4 border-l-red-500' : x.lue ? 'hover:bg-neutral-50' : 'bg-primary/5 hover:bg-primary/10'}`}>
                        <span aria-hidden="true" className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${urgence ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                          <span translate="no" className="material-symbols-outlined text-[16px]">{urgence ? 'emergency' : x.nature === 'ANNONCE' ? 'campaign' : 'info'}</span>
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5">
                            {urgence && <span className="shrink-0 px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-black uppercase">Urgence</span>}
                            <span className={`text-xs truncate ${x.lue ? 'font-bold text-neutral-700' : 'font-black text-neutral-900'}`}>{x.titre}</span>
                            {!x.lue && <span className="ml-auto h-2 w-2 rounded-full bg-primary shrink-0" aria-label="non lue" />}
                          </span>
                          {x.message && (
                            <span className={`block text-[11px] text-neutral-600 mt-0.5 whitespace-pre-line break-words ${deplie === x.id ? '' : 'line-clamp-2'}`}>{x.message}</span>
                          )}
                          <span className="block text-[9px] font-bold text-neutral-400 mt-1">{quand(x.recueLe)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {marquer.isError && <p role="alert" className="px-3.5 py-2 text-[10px] font-semibold text-red-700 border-t border-neutral-100">Lecture non enregistrée : {resolveErrorMessage(marquer.error)}</p>}
          {pied && <div className="border-t border-neutral-100">{pied}</div>}
        </div>
      )}
    </div>
  );
}

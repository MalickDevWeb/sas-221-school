import { useId, useState, type ReactNode } from 'react';

export interface OptionRecherche {
  id: string;
  titre: string;
  detail?: string;
  /** Raison affichée quand l'option ne peut pas être choisie (ex. « demande déjà en attente »). */
  indisponible?: string;
}

interface Props {
  id: string;
  libelle: string;
  icone: string;
  requete: string;
  onRequete: (v: string) => void;
  options: OptionRecherche[];
  /** Élément choisi : remplace le champ par une étiquette « Changer ». */
  choisi: { titre: string; detail?: string } | null;
  onChoisir: (id: string) => void;
  onEffacer: () => void;
  placeholder: string;
  /** Texte affiché dans la liste quand il n'y a pas d'option (consigne, recherche en cours, aucun résultat). */
  etatListe?: ReactNode;
  /** Ligne sous la liste (ex. « 12 autres élèves : affinez la recherche »). */
  piedListe?: ReactNode;
  erreur?: string;
  aide?: ReactNode;
  desactive?: boolean;
}

/**
 * Un seul champ : on tape pour rechercher, la liste des correspondances s'ouvre dessous, on choisit à la souris ou au
 * clavier (flèches, Entrée, Échap). Rien n'est retenu tant qu'une option de la liste n'a pas été choisie.
 */
export function ChampRecherche(p: Props) {
  const base = useId();
  const idListe = `${base}-liste`;
  const idErreur = `${p.id}-erreur`;
  const idAide = `${p.id}-aide`;
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const choisissables = p.options.map((o, i) => (o.indisponible ? -1 : i)).filter((i) => i >= 0);

  const choisir = (o: OptionRecherche) => {
    if (o.indisponible) return;
    p.onChoisir(o.id);
    setOuvert(false);
    setActif(-1);
  };

  const deplacer = (sens: 1 | -1) => {
    if (!choisissables.length) return;
    const pos = choisissables.indexOf(actif);
    const suivant = pos < 0 ? (sens === 1 ? 0 : choisissables.length - 1) : (pos + sens + choisissables.length) % choisissables.length;
    setActif(choisissables[suivant]);
    document.getElementById(`${base}-opt-${choisissables[suivant]}`)?.scrollIntoView({ block: 'nearest' });
  };

  const decrit = p.erreur ? idErreur : p.aide ? idAide : undefined;
  const bord = p.erreur ? 'border-red-400 focus-within:border-red-500' : 'border-neutral-200 focus-within:border-primary';

  return (
    <div className="space-y-1 min-w-0">
      <label htmlFor={p.id} className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">{p.libelle}</label>
      {p.choisi ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 min-w-0">
          <span translate="no" className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-neutral-900 truncate">{p.choisi.titre}</p>
            {p.choisi.detail && <p className="text-[10px] text-neutral-500 font-semibold truncate">{p.choisi.detail}</p>}
          </div>
          <button type="button" id={p.id} onClick={p.onEffacer} disabled={p.desactive}
            className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-black text-primary hover:bg-white cursor-pointer disabled:opacity-50">
            Changer
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* 16/11 : le cadre arrondi porte seul la bordure et le focus (avant : l'extension @tailwindcss/forms dessinait en plus
              une bordure grise carrée autour du champ, d'où un double cadre) */}
          <div className={`flex items-center gap-2.5 px-3.5 h-11 rounded-xl border bg-white transition-shadow focus-within:ring-4 focus-within:ring-primary/10 ${bord} ${p.desactive ? 'opacity-60' : ''}`}>
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-neutral-400 text-[18px] shrink-0">{p.icone}</span>
            <input
              id={p.id}
              role="combobox"
              aria-expanded={ouvert}
              aria-controls={idListe}
              aria-autocomplete="list"
              aria-activedescendant={ouvert && actif >= 0 ? `${base}-opt-${actif}` : undefined}
              aria-invalid={p.erreur ? true : undefined}
              aria-describedby={decrit}
              autoComplete="off"
              disabled={p.desactive}
              value={p.requete}
              placeholder={p.placeholder}
              onChange={(e) => { p.onRequete(e.target.value); setOuvert(true); setActif(-1); }}
              onFocus={() => setOuvert(true)}
              onBlur={() => setOuvert(false)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setOuvert(true); deplacer(1); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setOuvert(true); deplacer(-1); }
                else if (e.key === 'Enter' && ouvert && actif >= 0 && p.options[actif]) { e.preventDefault(); choisir(p.options[actif]); }
                else if (e.key === 'Escape') { setOuvert(false); }
              }}
              className="w-full min-w-0 h-full p-0 border-0 shadow-none bg-transparent text-[13px] font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-medium outline-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
          </div>
          {ouvert && !p.desactive && (
            <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
              <ul id={idListe} role="listbox" aria-label={p.libelle} className="max-h-52 overflow-y-auto py-1">
                {p.options.map((o, i) => (
                  <li key={o.id} id={`${base}-opt-${i}`} role="option" aria-selected={actif === i} aria-disabled={o.indisponible ? true : undefined}
                    onMouseDown={(e) => { e.preventDefault(); choisir(o); }}
                    onMouseEnter={() => { if (!o.indisponible) setActif(i); }}
                    className={`px-3 py-2 flex items-center justify-between gap-2 ${o.indisponible ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${actif === i ? 'bg-primary/5' : ''}`}>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-neutral-900 truncate">{o.titre}</span>
                      {o.detail && <span className="block text-[10px] text-neutral-500 font-semibold truncate">{o.detail}</span>}
                    </span>
                    {o.indisponible && <span className="shrink-0 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{o.indisponible}</span>}
                  </li>
                ))}
              </ul>
              {p.options.length === 0 && p.etatListe && <div className="px-3 py-3 text-[11px] text-neutral-500 font-semibold">{p.etatListe}</div>}
              {p.options.length > 0 && p.piedListe && <div className="px-3 py-2 border-t border-neutral-100 text-[10px] text-neutral-500 font-semibold">{p.piedListe}</div>}
            </div>
          )}
        </div>
      )}
      {p.erreur && <p id={idErreur} className="text-[10px] text-red-600 font-semibold">{p.erreur}</p>}
      {p.aide && !p.erreur && <p id={idAide} className="text-[10px] text-neutral-500 font-semibold">{p.aide}</p>}
    </div>
  );
}

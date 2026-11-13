import React, { useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { GroupingCriterion } from '../../domain/CollaborationAlgorithms';
import { ClasseSelect } from './ClasseSelect';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { RegleChef } from '../../hooks/useWorkgroupState';

interface Props {
  /** Renvoie le bilan (groupes créés) ; lève une erreur si rien n'a été créé. */
  readonly onAutoGenerate: (
    baseName: string,
    classId: string,
    criterion: GroupingCriterion,
    count: number,
    leaderRule: RegleChef
  ) => Promise<string>;
}

const champ = 'w-full text-xs px-2.5 py-1.5 border border-neutral-gray-200 rounded-lg focus:ring-1 focus:ring-brand-red-deep aria-[invalid=true]:border-rose-400';

/**
 * Répartition automatique des élèves INSCRITS dans une classe. Avant (2026-11-13) : un seul groupe vide créé,
 * annoncé comme « groupes équilibrés » ; critères (moyenne, sexe, compétences) sans aucune donnée derrière.
 */
export function AutoGroupCreator({ onAutoGenerate }: Props) {
  const [baseName, setBaseName] = useState('');
  const [classId, setClassId] = useState('');
  const [criterion, setCriterion] = useState<GroupingCriterion>('alpha');
  const [count, setCount] = useState('3');
  const [leaderRule, setLeaderRule] = useState<RegleChef>('first');
  const [erreurs, setErreurs] = useState<{ baseName?: string; classId?: string; count?: string }>({});
  const [bilan, setBilan] = useState<{ texte: string; ok: boolean } | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const enCours = useRef(false);   // double clic : une seule répartition

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enCours.current) return;
    const nom = baseName.trim();
    const n = Number(count.trim());
    const verif: typeof erreurs = {};
    if (!nom) verif.baseName = 'Donnez un nom de base (ex. : Projet Annuel).';
    else if (nom.length > 95) verif.baseName = '95 caractères au maximum.';
    if (!classId) verif.classId = 'Choisissez la classe à répartir.';
    if (!/^\d+$/.test(count.trim()) || n < 1 || n > 20) verif.count = 'Nombre entier entre 1 et 20.';
    setErreurs(verif);
    setBilan(null);
    if (Object.values(verif).some(Boolean)) return;
    enCours.current = true;
    setEnvoi(true);
    try {
      setBilan({ texte: await onAutoGenerate(nom, classId, criterion, n, leaderRule), ok: true });
    } catch (err) {
      // Erreur locale (classe vide, trop de groupes) : son propre message ; erreur HTTP : message du serveur
      const locale = err instanceof Error && !(err as { isAxiosError?: boolean }).isAxiosError;
      setBilan({ texte: locale ? err.message : resolveErrorMessage(err), ok: false });
    } finally {
      enCours.current = false;
      setEnvoi(false);
    }
  };

  const message = (k: keyof typeof erreurs) => erreurs[k] && <p role="alert" className="mt-0.5 text-[10px] font-bold text-rose-700">{erreurs[k]}</p>;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-3" data-formulaire-repartition>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="auto-nom" className="block text-[10px] font-bold text-gray-700 mb-0.5">Nom de base</label>
          <input id="auto-nom" type="text" placeholder="Ex : Projet Annuel" value={baseName} onChange={(e) => setBaseName(e.target.value)}
                 aria-invalid={!!erreurs.baseName || undefined} className={champ} />
          {message('baseName')}
        </div>
        <div>
          <label htmlFor="auto-nombre" className="block text-[10px] font-bold text-gray-700 mb-0.5">Nombre de groupes</label>
          <input id="auto-nombre" type="text" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)}
                 aria-invalid={!!erreurs.count || undefined} className={champ} />
          {message('count')}
        </div>
      </div>

      <div>
        <label htmlFor="auto-classe" className="block text-[10px] font-bold text-gray-700 mb-0.5">Classe à répartir</label>
        <ClasseSelect id="auto-classe" value={classId} onChange={(v) => { setClassId(v); setErreurs((x) => ({ ...x, classId: undefined })); }}
                      invalide={!!erreurs.classId} />
        {message('classId')}
      </div>

      <div>
        <label htmlFor="auto-critere" className="block text-[10px] font-bold text-gray-700 mb-0.5">Répartition</label>
        <select id="auto-critere" value={criterion} onChange={(e) => setCriterion(e.target.value as GroupingCriterion)}
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-gray-200 rounded-lg font-semibold">
          <option value="alpha">Ordre alphabétique (blocs consécutifs)</option>
          <option value="random">Aléatoire</option>
        </select>
      </div>

      <div>
        <label htmlFor="auto-chef" className="block text-[10px] font-bold text-gray-700 mb-0.5">Désignation du chef de groupe</label>
        <select id="auto-chef" value={leaderRule} onChange={(e) => setLeaderRule(e.target.value as RegleChef)}
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-gray-200 rounded-lg font-semibold">
          <option value="first">Premier membre du groupe (modifiable ensuite)</option>
          <option value="random">Tirage au sort</option>
        </select>
      </div>

      {bilan && (
        <p role={bilan.ok ? 'status' : 'alert'} className={`text-[10px] font-bold ${bilan.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{bilan.texte}</p>
      )}

      <button type="submit" disabled={envoi}
              className="w-full py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
        <Shuffle className="w-3.5 h-3.5" />
        <span>{envoi ? 'Répartition…' : 'Répartir automatiquement'}</span>
      </button>
    </form>
  );
}
export default AutoGroupCreator;

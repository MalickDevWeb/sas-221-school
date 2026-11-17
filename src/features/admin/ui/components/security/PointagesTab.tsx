import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/*
 * Pointages d'arrivée et de départ (16/11) : ce que les élèves et les professeurs enregistrent eux-mêmes en scannant
 * le QR d'entrée affiché par le vigile. Avant, seule la personne concernée voyait ses pointages ; l'administration
 * n'avait aucun moyen de repérer un retard, une absence ou la venue d'un professeur. Lecture seule.
 */

interface Personne {
  utilisateurId: string;
  nom: string | null;
  role: string;
  arrivee: string | null;
  depart: string | null;
  present: boolean;
  passages: { type: 'ARRIVEE' | 'DEPART'; heure: string }[];
}

interface Journee {
  date: string;
  de: string | null;
  a: string | null;
  personnes: Personne[];
  total: number;
  presents: number;
}

const ROLES: { valeur: string; libelle: string }[] = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'ETUDIANT', libelle: 'Élèves' },
  { valeur: 'PROFESSEUR', libelle: 'Professeurs' },
];
const LIBELLE_ROLE: Record<string, string> = { ETUDIANT: 'Élève', PROFESSEUR: 'Professeur' };

/** Date du jour au format AAAA-MM-JJ, à l'heure locale. */
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function PointagesTab() {
  const [date, setDate] = useState(aujourdhui());
  const [role, setRole] = useState('');
  // Plage horaire (facultative) : personnes ayant un passage entre ces heures, ex. arrivées après 08:00
  const [de, setDe] = useState('');
  const [a, setA] = useState('');
  const plageInvalide = Boolean(de && a && a < de);
  const estAujourdhui = date === aujourdhui();

  const q = useQuery({
    queryKey: ['admin', 'pointages', date, role, de, a],
    queryFn: async () => (await apiClient.get<Journee>('/admin/pointages', {
      params: { date, role: role || undefined, de: de || undefined, a: a || undefined },
    })).data,
    enabled: !plageInvalide,
    refetchInterval: estAujourdhui ? 30_000 : false,   // la journée en cours se met à jour seule
    staleTime: 10_000,
  });
  const journee = q.data;

  return (
    <div className="space-y-4 font-sans text-xs" id="admin-pointages">
      <div className="flex flex-wrap justify-between items-start gap-3 pb-2 border-b border-neutral-100">
        <div>
          <h3 className="font-extrabold text-[#1E293B] text-sm">Pointages d'arrivée et de départ</h3>
          <p className="text-[11px] text-neutral-500 font-semibold max-w-xl">
            Enregistrés par les élèves et les professeurs en scannant le QR code affiché par le vigile à l'entrée.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer transition-colors"
          title="Actualiser"
          aria-label="Actualiser"
        >
          <RefreshCw className={`h-4 w-4 ${q.isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-bold text-neutral-600">
          Jour
          <input
            id="pointages-date"
            type="date"
            value={date}
            max={aujourdhui()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="border border-neutral-200 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-800 bg-white"
          />
        </label>
        <div className="flex bg-neutral-100 p-0.5 rounded-lg" role="group" aria-label="Filtrer par rôle">
          {ROLES.map((r) => (
            <button
              key={r.valeur || 'tous'}
              type="button"
              onClick={() => setRole(r.valeur)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${role === r.valeur ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              {r.libelle}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 font-bold text-neutral-600" role="group" aria-label="Plage horaire">
          <label className="flex items-center gap-1.5">
            De
            <input id="pointages-de" type="time" value={de} onChange={(e) => setDe(e.target.value)}
              className="border border-neutral-200 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-800 bg-white" />
          </label>
          <label className="flex items-center gap-1.5">
            à
            <input id="pointages-a" type="time" value={a} onChange={(e) => setA(e.target.value)}
              className="border border-neutral-200 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-800 bg-white" />
          </label>
          {(de || a) && (
            <button type="button" onClick={() => { setDe(''); setA(''); }}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer">
              Toute la journée
            </button>
          )}
        </div>
        {journee && (
          <p id="pointages-resume" className="text-[11px] font-bold text-neutral-600">
            {journee.total} {journee.total > 1 ? 'personnes venues' : 'personne venue'}
            {(journee.de || journee.a) && ` avec un passage ${journee.de ? `à partir de ${journee.de}` : ''}${journee.de && journee.a ? ' et ' : ''}${journee.a ? `jusqu'à ${journee.a}` : ''}`}
            {estAujourdhui && ` · ${journee.presents} ${journee.presents > 1 ? 'présentes' : 'présente'} en ce moment`}
          </p>
        )}
      </div>

      {plageInvalide ? (
        <div id="pointages-plage-invalide" className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center text-amber-900 font-bold">
          L'heure de fin de la plage est avant l'heure de début.
        </div>
      ) : q.isLoading ? (
        <div className="text-center py-8 text-neutral-400 font-bold">Chargement des pointages…</div>
      ) : q.isError ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-center space-y-3">
          <p className="text-rose-800 font-bold">{resolveErrorMessage(q.error)}</p>
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      ) : !journee || journee.personnes.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 font-semibold text-[11px] border-2 border-dashed border-neutral-200 rounded-2xl bg-[#FAF8F6]">
          {de || a ? 'Aucun pointage dans cette plage horaire.' : 'Aucun pointage ce jour-là.'}
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
          <table className="w-full text-left text-[11px]" id="pointages-tableau">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Rôle</th>
                <th className="px-3 py-2">Arrivée</th>
                <th className="px-3 py-2">Départ</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Passages</th>
              </tr>
            </thead>
            <tbody>
              {journee.personnes.map((p) => (
                <tr key={p.utilisateurId} className="border-t border-neutral-100">
                  <td className="px-3 py-2 font-bold text-neutral-800">{p.nom || 'Nom non renseigné'}</td>
                  <td className="px-3 py-2 text-neutral-600">{LIBELLE_ROLE[p.role] ?? p.role}</td>
                  <td className="px-3 py-2 font-mono font-bold">{p.arrivee ?? '—'}</td>
                  <td className="px-3 py-2 font-mono font-bold">{p.depart ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.present ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                      {p.present ? (estAujourdhui ? 'Présent' : 'Sans départ') : 'Parti'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-neutral-500">
                    {p.passages.map((x) => `${x.type === 'ARRIVEE' ? 'arrivée' : 'départ'} ${x.heure}`).join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

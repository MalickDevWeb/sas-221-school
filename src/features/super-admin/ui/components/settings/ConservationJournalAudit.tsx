import React, { useEffect, useState } from 'react';
import { History, Save } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

type Unite = 'minutes' | 'heures' | 'jours';

interface Conservation {
  valeur: number;
  unite: Unite;
  libelle: string;
  minutes: number;
  modifieLe?: string | null;
  modifiePar?: string | null;
}

const CHEMIN = '/v1/super-admin/parametres/journal-audit';

/**
 * Durée de conservation du journal d'audit — RÉELLEMENT enregistrée sur le serveur (paramètres de la
 * plateforme, migration V14) : 30 minutes pour l'instant, modifiable ici sans toucher au code.
 * La base n'admet la suppression d'une entrée qu'après cette durée ; la purge passe chaque minute.
 */
export const ConservationJournalAudit: React.FC = () => {
  const [actuelle, setActuelle] = useState<Conservation | null>(null);
  const [valeur, setValeur] = useState('');
  const [unite, setUnite] = useState<Unite>('minutes');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const appliquer = (c: Conservation) => {
    setActuelle(c);
    setValeur(String(c.valeur));
    setUnite(c.unite);
  };

  useEffect(() => {
    apiClient
      .get<Conservation>(CHEMIN)
      .then((r) => appliquer(r.data))
      .catch((e) => setErreur(`Durée de conservation indisponible : ${resolveErrorMessage(e)}`));
  }, []);

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setMessage('');
    const n = Number(valeur);
    if (!Number.isInteger(n) || n < 1) {
      setErreur('Saisissez un nombre entier, au moins 1.');
      return;
    }
    setEnvoi(true);
    try {
      const r = await apiClient.put<Conservation>(CHEMIN, { valeur: n, unite });
      appliquer(r.data);
      setMessage(`Conservation fixée à ${r.data.libelle}. Les entrées plus anciennes seront effacées à la prochaine purge (chaque minute).`);
    } catch (err) {
      setErreur(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form id="conservation-audit" onSubmit={enregistrer} noValidate
      className="space-y-4 text-xs">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <History className="w-4 h-4 text-indigo-400" /> Conservation du journal d'audit
      </h3>
      <p className="text-[11px] text-slate-400 max-w-2xl">
        Toute action enregistrée sur la plateforme est inscrite au journal d'audit, qui ne peut pas être modifié.
        Une entrée n'est effacée qu'une fois cette durée écoulée.
      </p>
      <p id="conservation-actuelle" className="text-slate-300 font-semibold">
        {actuelle ? <>Durée actuelle : <span className="text-white">{actuelle.libelle}</span></> : 'Chargement…'}
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="conservation-valeur" className="block font-semibold text-slate-300 mb-1.5">Durée</label>
          <input
            id="conservation-valeur" type="number" min={1} step={1} inputMode="numeric"
            value={valeur} onChange={(e) => setValeur(e.target.value)}
            aria-invalid={erreur ? true : undefined}
            aria-describedby={erreur ? 'conservation-erreur' : undefined}
            className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="conservation-unite" className="block font-semibold text-slate-300 mb-1.5">Unité</label>
          <select
            id="conservation-unite" value={unite} onChange={(e) => setUnite(e.target.value as Unite)}
            className="bg-[#0E1326] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="minutes">minutes</option>
            <option value="heures">heures</option>
            <option value="jours">jours</option>
          </select>
        </div>
        <button
          id="conservation-enregistrer" type="submit" disabled={envoi || !actuelle}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold"
        >
          <Save size={14} /> {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {erreur && <p id="conservation-erreur" role="alert" className="text-rose-400 font-semibold">{erreur}</p>}
      {message && <p id="conservation-message" role="status" className="text-emerald-400 font-semibold">{message}</p>}
      <p className="text-[11px] text-slate-500">Entre 1 minute et 10 ans. Chaque modification est elle-même inscrite au journal.</p>
    </form>
  );
};

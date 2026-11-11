import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Observation enregistrée (GET/POST /admin/students/{id}/observations). */
interface Observation { id: string; text: string; type: string; date: string; auteur: string | null }

const CATEGORIES = ['Comportement', 'Notes', 'Retards/Absences', 'Frais Scolaires', 'Général'];
const TEXTE_MAX = 1000;

/** Journal d'observations d'un élève, tenu par l'administration (APP-BE-10). */
export function ObservationsEleve({ eleveId, nomEleve }: { eleveId: string; nomEleve?: string }) {
  const [observations, setObservations] = useState<Observation[] | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');
  const [type, setType] = useState('Général');
  const [text, setText] = useState('');
  const [erreurSaisie, setErreurSaisie] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    setObservations(null); setErreurChargement(''); setErreurSaisie(''); setConfirmation(''); setText('');
    let actif = true;
    apiClient.get<Observation[]>(`/admin/students/${eleveId}/observations`)
      .then(r => { if (actif) setObservations(Array.isArray(r.data) ? r.data : []); })
      .catch(e => { if (actif) { setObservations([]); setErreurChargement(resolveErrorMessage(e)); } });
    return () => { actif = false; };
  }, [eleveId]);

  const ajouter = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmation('');
    const texte = text.trim();
    if (!texte) { setErreurSaisie("L'observation est vide : décrivez ce qui a été constaté."); return; }
    if (texte.length > TEXTE_MAX) { setErreurSaisie(`Observation trop longue : ${texte.length} caractères sur ${TEXTE_MAX} autorisés.`); return; }
    setEnvoi(true);
    try {
      const { data } = await apiClient.post<Observation>(`/admin/students/${eleveId}/observations`, { type, text: texte });
      setObservations(prev => [data, ...(prev ?? [])]);
      setText('');
      setConfirmation(`Observation « ${data.type} » enregistrée${nomEleve ? ` pour ${nomEleve}` : ''}.`);
    } catch (err) {
      setErreurSaisie(resolveErrorMessage(err));   // rien n'a été enregistré
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white" id="observations-eleve">
      <div className="bg-neutral-50 border-b border-neutral-100 px-3 py-2 flex items-center gap-1">
        <span translate="no" className="material-symbols-outlined text-neutral-400 text-sm">edit_note</span>
        <span className="text-neutral-800 font-extrabold text-[11px] uppercase tracking-wider">Journal d'observations</span>
      </div>
      <div className="p-3 space-y-3 text-xs">
        <div className="max-h-[220px] overflow-y-auto space-y-1.5" aria-live="polite">
          {erreurChargement ? (
            <p role="alert" className="text-center py-2 text-red-600 font-semibold text-[11px]">Journal indisponible : {erreurChargement}</p>
          ) : observations === null ? (
            <p className="text-center py-2 text-neutral-400 italic text-[11px]">Chargement…</p>
          ) : observations.length === 0 ? (
            <p className="text-center py-2 text-neutral-400 italic text-[11px]">Aucune observation saisie.</p>
          ) : (
            observations.map(o => (
              <div key={o.id} data-observation-id={o.id} className="p-2 bg-neutral-50 border border-neutral-100 rounded-lg">
                <div className="flex justify-between text-[9px] font-black uppercase text-neutral-400 mb-0.5">
                  <span>[{o.type}] par {o.auteur ?? 'auteur inconnu'}</span>
                  <span>{new Date(o.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className="text-neutral-800 font-semibold leading-snug whitespace-pre-wrap break-words">{o.text}</p>
              </div>
            ))
          )}
        </div>

        <form id="observation-form" onSubmit={ajouter} noValidate className="space-y-2 pt-2 border-t border-neutral-100">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2">
            <div className="space-y-1">
              <label htmlFor="observation-type" className="text-[9px] font-bold text-neutral-500 uppercase">Catégorie</label>
              <select id="observation-type" value={type} onChange={e => setType(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-2 font-semibold text-[11px]">
                {CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="observation-texte" className="text-[9px] font-bold text-neutral-500 uppercase">Observation</label>
              <input id="observation-texte" value={text}
                onChange={e => { setText(e.target.value); setErreurSaisie(''); setConfirmation(''); }}
                aria-invalid={!!erreurSaisie} placeholder="Ex. Bavardages répétés en cours de mathématiques"
                className={`w-full h-9 bg-neutral-50 border rounded-lg px-2.5 text-[11px] outline-none focus:border-primary ${erreurSaisie ? 'border-red-400' : 'border-neutral-200'}`} />
            </div>
          </div>
          {erreurSaisie && <p role="alert" className="text-[11px] font-semibold text-red-600">{erreurSaisie}</p>}
          {confirmation && <p role="status" className="text-[11px] font-semibold text-green-700">{confirmation}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={envoi}
              className="h-9 px-4 bg-primary text-white font-bold uppercase text-[10px] rounded-lg tracking-wider disabled:opacity-60">
              {envoi ? 'Enregistrement…' : "Enregistrer l'observation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

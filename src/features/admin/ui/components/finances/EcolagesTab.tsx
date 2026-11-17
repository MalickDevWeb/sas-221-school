import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { StudentFinance, MOYENS_PAIEMENT } from '../../../domain/FinancesModels';
import { useDeviceStore } from '@/features/screenguard/hooks/useDeviceStore';
import { ClassSelectRow } from './ClassSelectRow';
import { TOUTES_CLASSES, classeAffichee } from './ecolagesClasses';
import { MobileEcolagesCards } from './MobileEcolagesCards';
import type { NouveauDossier, NouveauVersement } from './useAdminFinances';

interface Props {
  students: StudentFinance[];
  onOuvrir: (d: NouveauDossier) => Promise<unknown>;
  onEncaisser: (v: NouveauVersement) => Promise<unknown>;
}

interface EleveEcole { id: string; nom: string; matricule: string; classe: string }

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const aujourdhui = () => new Date().toISOString().slice(0, 10);
const entierPositif = (t: string) => /^\d+$/.test(t.trim()) && Number(t) > 0;
const champ = 'w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-primary';
const erreurChamp = 'text-[10px] text-rose-600 font-bold mt-1';

/**
 * Écolages : dossiers réels, « Ouvrir un dossier » et « Encaisser », validés par le serveur ; la liste n'est mise à
 * jour qu'après sa réponse.
 */
export function EcolagesTab({ students, onOuvrir, onEncaisser }: Props) {
  const [selectedClass, setSelectedClass] = useState(TOUTES_CLASSES);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [ouverture, setOuverture] = useState(false);
  const [aEncaisser, setAEncaisser] = useState<StudentFinance | null>(null);
  const [message, setMessage] = useState('');
  const { isMobile } = useDeviceStore();

  const filteredStudents = students.filter(s => {
    const cMatch = selectedClass === TOUTES_CLASSES || classeAffichee(s) === selectedClass;
    const sMatch = filterStatus === 'ALL' || s.status === filterStatus;
    return cMatch && sMatch;
  });

  const ouvrirEncaissement = (s: StudentFinance) => { setOuverture(false); setMessage(''); setAEncaisser(s); };

  return (
    <div className="space-y-4" id="ecolages-tab-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[11px] text-neutral-500 font-semibold">Dossiers financiers des élèves : montant dû, versements encaissés, reste.</p>
        <button id="ecolage-ouvrir-bouton" type="button" onClick={() => { setAEncaisser(null); setMessage(''); setOuverture(true); }}
          className="px-3 py-2 bg-primary text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 w-fit">
          <span translate="no" className="material-symbols-outlined text-sm">note_add</span> Ouvrir un dossier
        </button>
      </div>

      {message && <p id="ecolage-message" role="status" className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">{message}</p>}

      {ouverture && (
        <FormulaireOuverture
          dejaOuverts={new Set(students.map(s => s.studentId))}
          onAnnuler={() => setOuverture(false)}
          onValider={async (d, nom) => { await onOuvrir(d); setOuverture(false); setMessage(`Dossier ouvert pour ${nom} : ${fcfa(d.montantDu)} dus.`); }}
        />
      )}
      {aEncaisser && (
        <FormulaireVersement
          dossier={aEncaisser}
          onAnnuler={() => setAEncaisser(null)}
          onValider={async (v) => { await onEncaisser(v); setAEncaisser(null); setMessage(`Versement de ${fcfa(v.montant)} encaissé pour ${aEncaisser.name}.`); }}
        />
      )}

      <ClassSelectRow selectedClass={selectedClass} onSelectClass={setSelectedClass} students={students} />

      <div className="bg-transparent sm:bg-white border-0 sm:border border-neutral-200 rounded-2xl p-0 sm:p-4 sm:shadow-xs space-y-3 w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
          <span className="text-[11px] font-black uppercase text-[#1E293B] tracking-wider">État financier - {selectedClass}</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-xl text-xs font-bold bg-white focus:outline-none w-full sm:w-auto">
            <option value="ALL">Afficher tout</option>
            <option value="Non soldé">Non soldé</option>
            <option value="En Règle">En Règle</option>
            <option value="En Avance">En Avance</option>
          </select>
        </div>

        {isMobile ? (
          <MobileEcolagesCards students={filteredStudents} onEncaisser={ouvrirEncaissement} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse" id="ecolages-table">
              <thead>
                <tr className="bg-[#FAF8F6] text-[9px] font-black text-neutral-400 uppercase border-b border-neutral-200">
                  <th className="px-4 py-2.5">Élève</th>
                  <th className="px-4 py-2.5">Total dû</th>
                  <th className="px-4 py-2.5">Versé</th>
                  <th className="px-4 py-2.5">Reste dû</th>
                  <th className="px-4 py-2.5">Statut</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-400 font-black text-[10px] uppercase">
                      {students.length === 0 ? 'Aucun dossier financier : ouvrez celui d\'un élève' : 'Aucun dossier pour ce filtre'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50/50" data-eleve={s.studentId}>
                      <td className="px-4 py-3">
                        <p className="text-[#1E293B] font-extrabold">{s.name}</p>
                        <p className="text-[9px] text-neutral-400 font-semibold">{classeAffichee(s)}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#1E293B]">{fcfa(s.totalRequired)}</td>
                      <td className="px-4 py-3 font-mono text-[#1E293B]">{fcfa(s.paid)}</td>
                      <td className="px-4 py-3">
                        {s.debt > 0 ? <span className="font-mono text-rose-600 font-black">{fcfa(s.debt)}</span>
                          : <span className="text-neutral-400 font-semibold">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          s.status === 'En Règle' ? 'bg-emerald-50 text-emerald-700' :
                          s.status === 'En Avance' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => ouvrirEncaissement(s)}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black hover:bg-primary/20">Encaisser</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FormulaireOuverture({ dejaOuverts, onAnnuler, onValider }: {
  dejaOuverts: Set<string>;
  onAnnuler: () => void;
  onValider: (d: NouveauDossier, nom: string) => Promise<void>;
}) {
  const eleves = useQuery({
    queryKey: ['admin', 'finances', 'eleves-ecole'],
    queryFn: async (): Promise<EleveEcole[]> => {
      const { data } = await apiClient.get<Record<string, unknown>[]>('/admin/students');
      return (Array.isArray(data) ? data : []).map((e) => ({
        id: String(e.id ?? ''), nom: String(e.name ?? `${e.prenom ?? ''} ${e.nom ?? ''}`).trim(),
        matricule: String(e.matricule ?? ''), classe: String(e.classe ?? ''),
      })).filter((e) => e.id);
    },
  });
  const disponibles = (eleves.data ?? []).filter((e) => !dejaOuverts.has(e.id));
  const [eleveId, setEleveId] = useState('');
  const [montant, setMontant] = useState('');
  const [classe, setClasse] = useState('');
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState(false);

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!eleveId) err.eleve = 'Choisissez l\'élève.';
    if (!entierPositif(montant)) err.montant = 'Saisissez le montant dû, en FCFA (nombre entier, au moins 1).';
    setErreurs(err);
    if (Object.keys(err).length) return;
    setEnvoi(true);
    try {
      const nom = disponibles.find((x) => x.id === eleveId)?.nom || 'l\'élève';
      await onValider({ eleveId, montantDu: Number(montant), classe: classe.trim() || undefined }, nom);
    } catch (ex) {
      setErreurs({ global: resolveErrorMessage(ex) });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form id="ecolage-ouvrir" onSubmit={valider} noValidate className="border border-primary/30 bg-primary/5 rounded-2xl p-4 space-y-3 text-xs">
      <p className="font-black text-[#1E293B]">Ouvrir le dossier financier d'un élève</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="ecolage-eleve" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Élève</label>
          <select id="ecolage-eleve" value={eleveId} className={champ}
            onChange={(ev) => { setEleveId(ev.target.value); setClasse(disponibles.find((x) => x.id === ev.target.value)?.classe || ''); }}>
            <option value="">{eleves.isLoading ? 'Chargement…' : disponibles.length ? 'Choisir…' : 'Tous les élèves ont un dossier'}</option>
            {disponibles.map((x) => <option key={x.id} value={x.id}>{x.nom}{x.matricule ? ` (${x.matricule})` : ''}</option>)}
          </select>
          {erreurs.eleve && <p className={erreurChamp}>{erreurs.eleve}</p>}
        </div>
        <div>
          <label htmlFor="ecolage-montant-du" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Montant dû (FCFA)</label>
          <input id="ecolage-montant-du" inputMode="numeric" value={montant} onChange={(ev) => setMontant(ev.target.value)} className={champ} />
          {erreurs.montant && <p className={erreurChamp}>{erreurs.montant}</p>}
        </div>
        <div>
          <label htmlFor="ecolage-classe" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Classe (facultatif)</label>
          <input id="ecolage-classe" value={classe} onChange={(ev) => setClasse(ev.target.value)} className={champ} />
        </div>
      </div>
      {eleves.isError && <p className={erreurChamp}>Liste des élèves indisponible : {resolveErrorMessage(eleves.error)}</p>}
      {erreurs.global && <p role="alert" className={erreurChamp}>{erreurs.global}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={envoi} className="px-3 py-2 bg-primary text-white rounded-xl font-black disabled:opacity-60">{envoi ? 'Enregistrement…' : 'Ouvrir le dossier'}</button>
        <button type="button" onClick={onAnnuler} className="px-3 py-2 border border-neutral-200 rounded-xl font-bold bg-white">Annuler</button>
      </div>
    </form>
  );
}

function FormulaireVersement({ dossier, onAnnuler, onValider }: {
  dossier: StudentFinance;
  onAnnuler: () => void;
  onValider: (v: NouveauVersement) => Promise<void>;
}) {
  const [montant, setMontant] = useState('');
  const [moyen, setMoyen] = useState<string>(MOYENS_PAIEMENT[0]);
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(aujourdhui());
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState(false);

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!entierPositif(montant)) err.montant = 'Saisissez le montant versé, en FCFA (nombre entier, au moins 1).';
    if (!date) err.date = 'Indiquez la date du versement.';
    else if (date > aujourdhui()) err.date = 'La date du versement ne peut pas être dans le futur.';
    if (reference.length > 60) err.reference = 'La référence ne doit pas dépasser 60 caractères.';
    setErreurs(err);
    if (Object.keys(err).length) return;
    setEnvoi(true);
    try {
      await onValider({ eleveId: dossier.studentId, montant: Number(montant), moyen, reference: reference.trim() || undefined, date });
    } catch (ex) {
      setErreurs({ global: resolveErrorMessage(ex) });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form id="ecolage-encaisser" onSubmit={valider} noValidate className="border border-emerald-300 bg-emerald-50/40 rounded-2xl p-4 space-y-3 text-xs">
      <p className="font-black text-[#1E293B]">Encaisser un versement — {dossier.name}
        <span className="text-neutral-500 font-semibold"> (reste dû : {fcfa(dossier.debt)})</span></p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label htmlFor="versement-montant" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Montant (FCFA)</label>
          <input id="versement-montant" inputMode="numeric" value={montant} onChange={(ev) => setMontant(ev.target.value)} className={champ} />
          {erreurs.montant && <p className={erreurChamp}>{erreurs.montant}</p>}
        </div>
        <div>
          <label htmlFor="versement-moyen" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Moyen</label>
          <select id="versement-moyen" value={moyen} onChange={(ev) => setMoyen(ev.target.value)} className={champ}>
            {MOYENS_PAIEMENT.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="versement-reference" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Référence (reçu, transaction)</label>
          <input id="versement-reference" value={reference} onChange={(ev) => setReference(ev.target.value)} className={champ} />
          {erreurs.reference && <p className={erreurChamp}>{erreurs.reference}</p>}
        </div>
        <div>
          <label htmlFor="versement-date" className="block text-[10px] font-black uppercase text-neutral-500 mb-1">Date</label>
          <input id="versement-date" type="date" max={aujourdhui()} value={date} onChange={(ev) => setDate(ev.target.value)} className={champ} />
          {erreurs.date && <p className={erreurChamp}>{erreurs.date}</p>}
        </div>
      </div>
      {erreurs.global && <p role="alert" className={erreurChamp}>{erreurs.global}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={envoi} className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-black disabled:opacity-60">{envoi ? 'Enregistrement…' : 'Encaisser'}</button>
        <button type="button" onClick={onAnnuler} className="px-3 py-2 border border-neutral-200 rounded-xl font-bold bg-white">Annuler</button>
      </div>
    </form>
  );
}

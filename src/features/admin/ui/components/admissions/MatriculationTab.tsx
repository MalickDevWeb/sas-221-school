import React, { useEffect, useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { MatriculationTable } from './MatriculationTable';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  candidates: ExtendedCandidate[];
  onEnroll: (candidate: ExtendedCandidate, eleveId: string, matricule: string) => void;
  onError: (message: string) => void;
  onTogglePayment: (id: string) => void;
}

type ClasseOption = { id: string; nom: string; frais: number | null };

/** Réponse de POST /admissions/candidates/{id}/inscription (APP-TL-23) : uniquement ce que le serveur renvoie. */
type Inscription = {
  candidatureId: string;
  compteCree: boolean;
  motDePasseProvisoire?: string;
  eleve: { id: string; nom: string; matricule: string; sansEmail: boolean; email: string | null; identifiant: string; ine: string | null; classe: string | null };
  parent: { nom?: string | null; email?: string | null; relationLibelle?: string | null; relation?: string | null; compteCree?: boolean; motDePasseProvisoire?: string } | null;
  dossierFinancier: { totalRequired?: number | null } | null;
};

const MOYENS = ['Espèces', 'Wave', 'Orange Money', 'Free Money', 'Virement', 'Chèque', 'Autre'];
const RELATIONS: { code: string; libelle: string }[] = [
  { code: 'PERE', libelle: 'Père' }, { code: 'MERE', libelle: 'Mère' }, { code: 'TUTEUR', libelle: 'Tuteur / tutrice' }, { code: 'AUTRE', libelle: 'Autre' },
];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function lireClasses(data: unknown): ClasseOption[] {
  const brut = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as { content?: unknown[] }).content) ? (data as { content: unknown[] }).content : []);
  return brut.flatMap((x) => {
    if (!x || typeof x !== 'object') return [];
    const c = x as Record<string, unknown>;
    const id = typeof c.id === 'string' ? c.id : null;
    const nom = typeof c.name === 'string' ? c.name : (typeof c.nom === 'string' ? c.nom : null);
    if (!id || !nom) return [];
    const frais = typeof c.price === 'number' ? c.price : (typeof c.fraisAnnuels === 'number' ? c.fraisAnnuels : null);
    return [{ id, nom, frais }];
  });
}

function echapper(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));
}

/** Fiche d'inscription imprimable : identifiants remis en main propre (aucun envoi par e-mail ni SMS). */
function imprimerFiche(r: Inscription) {
  const lignes: [string, unknown][] = [
    ['Élève', r.eleve.nom], ['Matricule', r.eleve.matricule],
    ['Identifiant de connexion', r.eleve.sansEmail ? `${r.eleve.matricule} (connexion par matricule)` : r.eleve.identifiant],
  ];
  if (r.motDePasseProvisoire) lignes.push(['Mot de passe provisoire (à changer à la 1re connexion)', r.motDePasseProvisoire]);
  if (r.eleve.ine) lignes.push(['INE', r.eleve.ine]);
  if (r.eleve.classe) lignes.push(['Classe', r.eleve.classe]);
  if (r.parent) {
    lignes.push(['Parent lié', `${r.parent.nom ?? ''} (${r.parent.relationLibelle ?? r.parent.relation ?? ''})`]);
    if (r.parent.email) lignes.push(['Identifiant du parent', r.parent.email]);
    if (r.parent.motDePasseProvisoire) lignes.push(['Mot de passe provisoire du parent', r.parent.motDePasseProvisoire]);
  }
  if (r.dossierFinancier?.totalRequired != null) lignes.push(['Scolarité due (FCFA)', r.dossierFinancier.totalRequired.toLocaleString('fr-FR')]);
  const w = window.open('', '_blank', 'width=720,height=900');
  if (!w) return;
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Fiche d'inscription — ${echapper(r.eleve.matricule)}</title>
<style>body{font-family:Arial,sans-serif;margin:32px;color:#111}h1{font-size:20px}table{border-collapse:collapse;width:100%}td{border:1px solid #999;padding:8px;font-size:14px}td:first-child{width:45%;font-weight:bold}p{font-size:12px;color:#444}</style></head>
<body><h1>Fiche d'inscription</h1><table>${lignes.map(([k, v]) => `<tr><td>${echapper(k)}</td><td>${echapper(v)}</td></tr>`).join('')}</table>
<p>Remise le ${echapper(new Date().toLocaleDateString('fr-FR'))}. Les mots de passe provisoires ne sont affichés qu'une seule fois : conservez cette fiche en lieu sûr.</p>
<script>window.onload=function(){window.print();}</script></body></html>`);
  w.document.close();
}

export function MatriculationTab({ candidates, onEnroll, onError, onTogglePayment }: Props) {
  const admitted = candidates.filter((c) => c.step === 'admitted');
  const [enCours, setEnCours] = useState<ExtendedCandidate | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [resultat, setResultat] = useState<Inscription | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const [modeEmail, setModeEmail] = useState<'dossier' | 'autre' | 'aucun'>('dossier');
  const [emailAutre, setEmailAutre] = useState('');
  const [ine, setIne] = useState('');
  const [classeId, setClasseId] = useState('');
  const [relation, setRelation] = useState('AUTRE');
  const [lierGarant, setLierGarant] = useState(false);
  const [moyen, setMoyen] = useState('');
  const [reference, setReference] = useState('');
  const [ouvrirFinances, setOuvrirFinances] = useState(false);
  const [montant, setMontant] = useState('');

  useEffect(() => {
    apiClient.get('/admin/planning/classes').then(({ data }) => setClasses(lireClasses(data))).catch(() => setClasses([]));
  }, []);

  const ouvrir = (c: ExtendedCandidate) => {
    setEnCours(c);
    setResultat(null);
    setErreurs({});
    setModeEmail(c.email ? 'dossier' : 'aucun');
    setEmailAutre(''); setIne(''); setClasseId(''); setRelation('AUTRE'); setLierGarant(false);
    setMoyen(''); setReference(''); setOuvrirFinances(false); setMontant('');
  };

  const choisirClasse = (id: string) => {
    setClasseId(id);
    const cl = classes.find((x) => x.id === id);
    if (cl?.frais != null && !montant) setMontant(String(cl.frais));
  };

  const valider = (c: ExtendedCandidate): Record<string, string> => {
    const e: Record<string, string> = {};
    if (modeEmail === 'autre' && !EMAIL.test(emailAutre.trim())) e.email = "Saisissez une adresse e-mail valide pour l'élève, ou choisissez « sans e-mail ».";
    if (ine.trim().length > 30) e.ine = "L'INE ne doit pas dépasser 30 caractères.";
    if (!c.registrationFeePaid && !moyen) e.moyen = 'Les frais de dossier doivent être confirmés : indiquez le moyen de paiement (guichet, Wave, Orange Money…).';
    if (ouvrirFinances) {
      const n = Number(montant);
      if (!montant.trim() || !Number.isInteger(n) || n < 1) e.montant = 'Indiquez le montant dû de la scolarité (nombre entier en FCFA).';
    }
    return e;
  };

  const inscrire = async () => {
    if (!enCours) return;
    const e = valider(enCours);
    setErreurs(e);
    if (Object.keys(e).length > 0) return;
    const corps: Record<string, unknown> = { relationParent: relation };
    if (modeEmail === 'aucun') corps.sansEmail = true;
    if (modeEmail === 'autre') corps.emailEleve = emailAutre.trim();
    if (ine.trim()) corps.ine = ine.trim();
    if (classeId) corps.classeId = classeId;
    if (lierGarant) corps.lierGarant = true;
    if (!enCours.registrationFeePaid) corps.fraisDossier = { moyen, ...(reference.trim() ? { reference: reference.trim() } : {}) };
    if (ouvrirFinances) corps.dossierFinancier = { montantDu: Number(montant) };
    setEnvoi(true);
    try {
      const { data } = await apiClient.post<Inscription>(`/admissions/candidates/${encodeURIComponent(enCours.id)}/inscription`, corps);
      if (!data?.eleve?.matricule) {
        onError("Le serveur n'a pas confirmé l'inscription : aucun élève créé.");
        return;
      }
      setResultat(data);
      onEnroll(enCours, data.eleve.id, data.eleve.matricule);
      setEnCours(null);
    } catch (err) {
      onError(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  const champ = 'w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs font-semibold text-[#1E293B] bg-white';
  const erreur = (cle: string) => erreurs[cle] ? <p role="alert" className="text-[10px] text-rose-600 font-bold mt-1">{erreurs[cle]}</p> : null;
  const garantEmail = enCours?.details?.dossier?.garantEmail;

  return (
    <div className="space-y-4" id="matriculation-tab-root">
      <div className="pb-2 border-b border-neutral-100 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Inscription des admis</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Un dossier admis, frais de dossier confirmés par l'école, devient un élève : compte, matricule, parent lié. Un dossier n'est inscrit qu'une fois.</p>
        </div>
      </div>

      {resultat && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-bold text-emerald-800 space-y-2" id="fiche-inscription">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="uppercase text-[10px] font-black tracking-wider">Élève inscrit — identifiants à remettre</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => imprimerFiche(resultat)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase">Imprimer la fiche</button>
              <button type="button" onClick={() => setResultat(null)} className="text-emerald-600 hover:text-emerald-900 text-[10px]">Masquer</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/70 p-3 rounded-lg border border-emerald-100 text-[11px]">
            <div>Élève : <span className="text-[#1E293B] block font-black">{resultat.eleve.nom}</span></div>
            <div>Matricule : <span className="text-emerald-700 block font-black font-mono">{resultat.eleve.matricule}</span></div>
            <div>Identifiant de connexion : <span className="text-[#1E293B] block font-black font-mono">{resultat.eleve.sansEmail ? `${resultat.eleve.matricule} (sans e-mail)` : resultat.eleve.identifiant}</span></div>
            {resultat.motDePasseProvisoire && <div>Mot de passe provisoire : <span className="text-[#1E293B] block font-black font-mono">{resultat.motDePasseProvisoire}</span></div>}
            {resultat.eleve.classe && <div>Classe : <span className="text-[#1E293B] block font-black">{resultat.eleve.classe}</span></div>}
            {resultat.eleve.ine && <div>INE : <span className="text-[#1E293B] block font-black font-mono">{resultat.eleve.ine}</span></div>}
            {resultat.parent && <div>Parent lié : <span className="text-[#1E293B] block font-black">{resultat.parent.nom} ({resultat.parent.relationLibelle ?? resultat.parent.relation})</span></div>}
            {resultat.parent?.motDePasseProvisoire && <div>Mot de passe provisoire du parent : <span className="text-[#1E293B] block font-black font-mono">{resultat.parent.motDePasseProvisoire}</span></div>}
          </div>
          <p className="text-[10px] font-semibold">Les mots de passe provisoires ne sont affichés qu'une seule fois et ne sont envoyés à personne : imprimez la fiche et remettez-la. Ils devront être changés à la première connexion.</p>
        </div>
      )}

      {enCours && (
        <form noValidate onSubmit={(e) => { e.preventDefault(); void inscrire(); }} className="border border-neutral-200 rounded-2xl p-4 space-y-3 bg-[#FAF8F6]" id="formulaire-inscription">
          <div className="font-extrabold text-sm text-[#1E293B]">Inscrire {enCours.name}</div>
          <fieldset className="space-y-1 text-xs font-semibold">
            <legend className="text-[10px] font-black uppercase text-neutral-500">Connexion de l'élève</legend>
            {enCours.email && <label className="flex gap-2 items-center"><input type="radio" name="modeEmail" checked={modeEmail === 'dossier'} onChange={() => setModeEmail('dossier')} />Adresse du dossier : {enCours.email}</label>}
            <label className="flex gap-2 items-center"><input type="radio" name="modeEmail" checked={modeEmail === 'autre'} onChange={() => setModeEmail('autre')} />Autre adresse personnelle de l'élève</label>
            {modeEmail === 'autre' && <input aria-label="Adresse e-mail de l'élève" className={champ} value={emailAutre} onChange={(e) => setEmailAutre(e.target.value)} placeholder="prenom.nom@exemple.sn" />}
            <label className="flex gap-2 items-center"><input type="radio" name="modeEmail" checked={modeEmail === 'aucun'} onChange={() => setModeEmail('aucun')} />Sans e-mail : connexion avec le matricule</label>
            {erreur('email')}
          </fieldset>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-[10px] font-black uppercase text-neutral-500">INE (facultatif)
              <input className={champ} value={ine} onChange={(e) => setIne(e.target.value)} placeholder="Identifiant National de l'Élève" />
              {erreur('ine')}
            </label>
            <label className="text-[10px] font-black uppercase text-neutral-500">Classe (facultatif)
              <select className={champ} value={classeId} onChange={(e) => choisirClasse(e.target.value)}>
                <option value="">— Plus tard —</option>
                {classes.map((cl) => <option key={cl.id} value={cl.id}>{cl.nom}</option>)}
              </select>
            </label>
            {enCours.parentDeposant && (
              <label className="text-[10px] font-black uppercase text-neutral-500">Lien du parent qui a déposé le dossier
                <select className={champ} value={relation} onChange={(e) => setRelation(e.target.value)}>
                  {RELATIONS.map((r) => <option key={r.code} value={r.code}>{r.libelle}</option>)}
                </select>
              </label>
            )}
            {!enCours.parentDeposant && garantEmail && (
              <div className="text-xs font-semibold space-y-1">
                <label className="flex gap-2 items-center"><input type="checkbox" checked={lierGarant} onChange={(e) => setLierGarant(e.target.checked)} />Lier le garant ({garantEmail}) comme parent</label>
                {lierGarant && (
                  <select aria-label="Lien de parenté du garant" className={champ} value={relation} onChange={(e) => setRelation(e.target.value)}>
                    {RELATIONS.map((r) => <option key={r.code} value={r.code}>{r.libelle}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>
          {!enCours.registrationFeePaid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-[10px] font-black uppercase text-neutral-500">Frais de dossier encaissés par
                <select className={champ} value={moyen} onChange={(e) => setMoyen(e.target.value)}>
                  <option value="">— Choisir —</option>
                  {MOYENS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {erreur('moyen')}
              </label>
              <label className="text-[10px] font-black uppercase text-neutral-500">Référence du paiement (facultatif)
                <input className={champ} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N° de reçu ou de transaction" />
              </label>
            </div>
          )}
          <div className="space-y-1">
            <label className="flex gap-2 items-center text-xs font-semibold"><input type="checkbox" checked={ouvrirFinances} onChange={(e) => setOuvrirFinances(e.target.checked)} />Ouvrir le dossier financier (scolarité)</label>
            {ouvrirFinances && (
              <label className="text-[10px] font-black uppercase text-neutral-500 block">Montant dû (FCFA)
                <input inputMode="numeric" className={champ} value={montant} onChange={(e) => setMontant(e.target.value.replace(/[^\d]/g, ''))} />
                {erreur('montant')}
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEnCours(null)} className="px-4 py-2 text-[10px] font-black uppercase rounded-xl border border-neutral-200 bg-white">Annuler</button>
            <button type="submit" disabled={envoi} className="px-4 py-2 text-[10px] font-black uppercase rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white disabled:opacity-60">{envoi ? 'Inscription…' : 'Inscrire'}</button>
          </div>
        </form>
      )}

      <MatriculationTable admitted={admitted} enrollingId={envoi && enCours ? enCours.id : null} onEnrollClick={ouvrir} onTogglePayment={onTogglePayment} />
    </div>
  );
}

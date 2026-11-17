import { useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { marquerErreurAffichee, resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { dateServeur } from '@/shared/lib/dateServeur';
import { LIBELLES_TYPES, actionLisible, type ActionLisible, type TypeAction } from '@/shared/lib/actionsJournal';

/** Entrée de GET /audit/logs/recent (AuditLogDto). */
interface EntreeServeur {
  id?: string; userId?: string | null; action?: string | null; description?: string | null; timestamp?: string | null;
  ipAddress?: string | null; userAgent?: string | null; actorName?: string | null; actorRole?: string | null;
}
interface Entree extends ActionLisible {
  id: string; quand: Date | null; auteur: string; role: string; ip: string; navigateur: string; userId: string | null; description: string;
}

const LIBELLES_ROLES: Record<string, string> = {
  SUPER_ADMIN: 'Super-administrateur', PLATFORM_ADMIN: 'Plateforme', ADMIN: 'Administration', ADMINISTRATOR: 'Administration',
  DIRECTEUR: 'Direction', SECRETAIRE: 'Secrétariat', COMPTABLE: 'Comptabilité', SURVEILLANT: 'Surveillance', RH: 'Ressources humaines',
  PROFESSEUR: 'Enseignant', TEACHER: 'Enseignant', PROFESSOR: 'Enseignant', VIGIL: 'Vigile', VIGILE: 'Vigile',
  STUDENT: 'Élève', ETUDIANT: 'Élève', ELEVE: 'Élève', PARENT: 'Parent',
};
const libelleRole = (r?: string | null) => (r ? LIBELLES_ROLES[r.toUpperCase()] || r : '');

const STYLES: Record<TypeAction, { icone: string; pastille: string; badge: string }> = {
  creation: { icone: 'add_circle', pastille: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  modification: { icone: 'edit', pastille: 'bg-sky-50 text-sky-600', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  suppression: { icone: 'delete', pastille: 'bg-red-50 text-red-600', badge: 'bg-red-50 text-red-700 border-red-200' },
  securite: { icone: 'shield_person', pastille: 'bg-violet-50 text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const PERIODES = [
  { id: 'tout', libelle: 'Toute la période', jours: null },
  { id: 'jour', libelle: 'Aujourd’hui', jours: 0 },
  { id: '7', libelle: '7 derniers jours', jours: 7 },
  { id: '30', libelle: '30 derniers jours', jours: 30 },
] as const;
type Periode = typeof PERIODES[number]['id'];

const PAS = 100;
const heure = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');
const dateComplete = (d: Date | null) => (d ? `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}, ${heure(d)}` : 'date inconnue');
const cleJour = (d: Date | null) => (d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : 'inconnue');

function libelleJour(d: Date | null, aujourdhui: Date): string {
  if (!d) return 'Date inconnue';
  const j = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const ecart = Math.round((j(aujourdhui) - j(d)) / 86400000);
  if (ecart === 0) return 'Aujourd’hui';
  if (ecart === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short', ...(d.getFullYear() !== aujourdhui.getFullYear() ? { year: 'numeric' } : {}) });
}

/**
 * Journal d'audit de l'école (« qui a fait quoi, quand ») : chaque écriture enregistrée par le serveur, en phrase
 * française. Les entrées ne peuvent être ni modifiées ni effacées (seule la durée de conservation de la plateforme les retire).
 */
export function AuditTrailTab() {
  const [limite, setLimite] = useState(PAS);
  const [personne, setPersonne] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState<TypeAction | ''>('');
  const [module, setModule] = useState('');
  const [periode, setPeriode] = useState<Periode>('tout');
  const [maintenant] = useState(() => new Date());

  const journal = useQuery({
    queryKey: ['admin', 'audit', limite],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<EntreeServeur[]>('/audit/logs/recent', { params: { limit: limite } });
        return (Array.isArray(data) ? data : []).filter(l => l && l.id).map((l): Entree => ({
          id: String(l.id),
          ...actionLisible(l.action, l.description),
          quand: dateServeur(l.timestamp),
          auteur: l.actorName || l.userId || 'Compte inconnu',
          role: libelleRole(l.actorRole),
          ip: l.ipAddress || '',
          navigateur: l.userAgent || '',
          userId: l.userId ?? null,
          description: l.description || '',
        })).sort((a, b) => (b.quand?.getTime() ?? 0) - (a.quand?.getTime() ?? 0));
      } catch (e) {
        marquerErreurAffichee(e);   // affichée par l'écran
        throw e;
      }
    },
    placeholderData: keepPreviousData,
  });

  const entrees = useMemo(() => journal.data ?? [], [journal.data]);
  const roles = useMemo(() => Array.from(new Set(entrees.map(e => e.role).filter(Boolean))).sort(), [entrees]);
  const modules = useMemo(() => Array.from(new Set(entrees.map(e => e.module))).sort(), [entrees]);

  const filtrees = useMemo(() => {
    const q = personne.trim().toLowerCase();
    const jours = PERIODES.find(p => p.id === periode)?.jours;
    const debut = jours === null || jours === undefined ? null
      : new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - jours).getTime();
    return entrees.filter(e =>
      (!q || [e.auteur, e.phrase, e.description].some(t => t.toLowerCase().includes(q)))
      && (!role || e.role === role) && (!type || e.type === type) && (!module || e.module === module)
      && (debut === null || (e.quand && e.quand.getTime() >= debut)));
  }, [entrees, personne, role, type, module, periode, maintenant]);

  const jours = useMemo(() => {
    const g: { cle: string; titre: string; entrees: Entree[] }[] = [];
    for (const e of filtrees) {
      const cle = cleJour(e.quand);
      const dernier = g[g.length - 1];
      if (dernier && dernier.cle === cle) dernier.entrees.push(e);
      else g.push({ cle, titre: libelleJour(e.quand, maintenant), entrees: [e] });
    }
    return g;
  }, [filtrees, maintenant]);

  const filtresActifs = !!(personne || role || type || module || periode !== 'tout');
  const toutEffacer = () => { setPersonne(''); setRole(''); setType(''); setModule(''); setPeriode('tout'); };
  const peutPlus = entrees.length >= limite;
  const champ = 'px-3 py-2 border border-neutral-200 bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none focus:border-primary min-w-0';

  return (
    <div className="space-y-4 text-xs text-[#4A5568]" id="audit-trail-tab">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-neutral-100">
        <div className="min-w-0">
          <h3 className="font-black text-sm text-[#1E293B]">Journal d’audit</h3>
          <p className="text-[11px] text-neutral-500 font-semibold">Qui a fait quoi, et quand : chaque modification faite par un compte connecté.</p>
        </div>
        <span className="inline-flex items-center gap-1 w-fit px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-600">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[14px]">lock</span>
          Ce journal ne peut être ni modifié ni effacé
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <input type="text" value={personne} onChange={e => setPersonne(e.target.value)} placeholder="Personne ou action…"
          aria-label="Rechercher une personne ou une action" className={`${champ} lg:col-span-1`} />
        <select value={role} onChange={e => setRole(e.target.value)} aria-label="Rôle" className={champ}>
          <option value="">Tous les rôles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value as TypeAction | '')} aria-label="Type d’action" className={champ}>
          <option value="">Tous les types</option>
          {(Object.keys(LIBELLES_TYPES) as TypeAction[]).map(t => <option key={t} value={t}>{LIBELLES_TYPES[t]}</option>)}
        </select>
        <select value={module} onChange={e => setModule(e.target.value)} aria-label="Module" className={champ}>
          <option value="">Tous les modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={periode} onChange={e => setPeriode(e.target.value as Periode)} aria-label="Période" className={champ}>
          {PERIODES.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
        </select>
      </div>

      {journal.isLoading ? (
        <ul className="space-y-2" aria-busy="true">
          {[0, 1, 2, 3, 4].map(i => (
            <li key={i} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100">
              <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5"><div className="h-3 w-3/5 rounded bg-neutral-100 animate-pulse" /><div className="h-2.5 w-1/4 rounded bg-neutral-100 animate-pulse" /></div>
            </li>
          ))}
        </ul>
      ) : journal.isError ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-semibold">
          <span>Journal d’audit indisponible : {resolveErrorMessage(journal.error)}</span>
          <button type="button" onClick={() => void journal.refetch()} className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-[11px] font-black cursor-pointer">Réessayer</button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p id="audit-compteur" className="text-[11px] font-bold text-neutral-500" aria-live="polite">
              {filtrees.length.toLocaleString('fr-FR')} action{filtrees.length > 1 ? 's' : ''}
              {filtresActifs ? ` sur ${entrees.length.toLocaleString('fr-FR')} chargée${entrees.length > 1 ? 's' : ''}` : ''}
            </p>
            {filtresActifs && <button type="button" onClick={toutEffacer} className="text-[11px] font-bold text-primary hover:underline cursor-pointer">Effacer les filtres</button>}
          </div>

          {entrees.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-2">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[32px] text-neutral-300">history</span>
              <p className="text-sm font-black text-neutral-700">Aucune action enregistrée pour l’instant.</p>
              <p className="text-[11px] text-neutral-500 font-semibold">Chaque création, modification ou suppression faite dans l’école apparaîtra ici.</p>
            </div>
          ) : filtrees.length === 0 ? (
            <p className="py-8 text-center text-neutral-500 font-semibold">Aucune action ne correspond à ces filtres.</p>
          ) : (
            <div className="space-y-5">
              {jours.map(j => (
                <section key={j.cle} aria-label={j.titre}>
                  <h4 className="sticky top-0 z-[1] bg-white/95 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400 first-letter:uppercase">{j.titre}</h4>
                  <ul className="mt-1 divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
                    {j.entrees.map(e => <LigneJournal key={e.id} e={e} />)}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {peutPlus && (
            <div className="flex justify-center pt-1">
              <button type="button" onClick={() => setLimite(l => l + PAS)} disabled={journal.isFetching}
                className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 cursor-pointer disabled:opacity-60">
                {journal.isFetching ? 'Chargement…' : 'Voir plus d’actions'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LigneJournal({ e }: { e: Entree }) {
  const st = STYLES[e.type];
  return (
    <li data-audit={e.id} className="px-3 py-2.5 flex items-start gap-3 hover:bg-neutral-50/70">
      <span aria-hidden="true" className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${st.pastille}`}>
        <span translate="no" className="material-symbols-outlined text-[17px]">{st.icone}</span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-700 leading-snug break-words">
          <b className="text-neutral-900">{e.auteur}</b>
          {e.role && <span className="text-neutral-500"> ({e.role})</span>}
          {e.libre ? <> — {e.phrase}</> : <> {e.phrase}</>}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[10px] font-semibold text-neutral-500">{e.quand ? heure(e.quand) : 'heure inconnue'}</span>
          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase ${st.badge}`}>{LIBELLES_TYPES[e.type]}</span>
          {e.module !== 'Autre' && <span className="text-[10px] font-semibold text-neutral-400">{e.module}</span>}
          <details className="group text-[10px]">
            <summary className="cursor-pointer list-none font-semibold text-neutral-400 hover:text-neutral-700 select-none">
              Détails <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90">›</span>
            </summary>
            <dl className="mt-1.5 p-2 rounded-lg bg-neutral-50 border border-neutral-100 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 font-mono text-neutral-600">
              <dt className="font-sans font-bold text-neutral-400">Date</dt><dd>{dateComplete(e.quand)}</dd>
              {e.route && <><dt className="font-sans font-bold text-neutral-400">Route</dt><dd className="break-all">{e.methode} {e.route}</dd></>}
              {!e.route && e.description && <><dt className="font-sans font-bold text-neutral-400">Texte</dt><dd className="break-words">{e.description}</dd></>}
              {e.userId && <><dt className="font-sans font-bold text-neutral-400">Compte</dt><dd className="break-all">{e.userId}</dd></>}
              {e.ip && <><dt className="font-sans font-bold text-neutral-400">Adresse IP</dt><dd>{e.ip}</dd></>}
              {e.navigateur && <><dt className="font-sans font-bold text-neutral-400">Navigateur</dt><dd className="break-all">{e.navigateur}</dd></>}
              <dt className="font-sans font-bold text-neutral-400">Entrée</dt><dd className="break-all">{e.id}</dd>
            </dl>
          </details>
        </div>
      </div>
    </li>
  );
}

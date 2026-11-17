import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { libelleHoraire, statutSeance, type StatutSeance } from '../../domain/horaireSeance';
import { apiClient } from '@/shared/lib/apiClient';
import { listeBrute, texte, textes } from '@/shared/lib/lectureServeur';

/*
 * 16/11 : classes virtuelles (Collaboration › Classes virtuelles) affichées sur l'accueil de l'élève, du professeur et
 * du parent. Avant : elles n'apparaissaient que dans « Collaboration », mélangées à celles de toutes les classes, sans
 * notification ; ni les élèves ni le professeur de la classe ne voyaient le cours en cours.
 * Le serveur filtre GET /collaboration/meets : élève → ses classes, parent → classes de ses enfants, professeur → ses
 * classes, celles à son nom et celles qu'il a créées.
 */
interface ClasseVirtuelle {
  id: string;
  sujet: string;
  enseignant: string;
  classes: string[];
  quand: string;
  lien: string;
  debut: string;
  fin: string;
  /** Donné par le serveur (heure de l'école) ; absent d'un serveur antérieur au 16/11 */
  statut: StatutSeance | '';
}

const lire = (data: unknown): ClasseVirtuelle[] => listeBrute(data).map((m) => ({
  id: texte(m.id),
  sujet: texte(m.subjectName ?? m.title) || 'Classe virtuelle',
  enseignant: texte(m.teacherName),
  classes: textes(m.classNames),
  quand: [texte(m.date), texte(m.time)].filter((x) => x && x !== '—').join(' · '),
  lien: texte(m.meetLink ?? m.link),
  debut: texte(m.debut),
  fin: texte(m.fin),
  statut: texte(m.statut) as StatutSeance | '',
}))
  // 16/11 : seulement les séances à venir ou en cours (le serveur retire déjà les autres pour l'élève et le parent ;
  // le professeur reçoit toutes les siennes). Serveur sans horaire : comportement d'avant (séance avec lien).
  .filter((m) => (m.statut ? m.statut === 'a_venir' || m.statut === 'en_cours' : Boolean(m.lien)));

/** Prochain changement (début d'une séance à venir, fin d'une séance en cours), en ms depuis maintenant. */
function prochainChangement(classes: readonly ClasseVirtuelle[]): number | null {
  const maintenant = Date.now();
  const instants = classes.flatMap((c) => [c.debut, c.fin]).filter(Boolean).map((t) => new Date(t).getTime())
    .filter((t) => !Number.isNaN(t) && t > maintenant);
  return instants.length ? Math.min(...instants) - maintenant : null;
}

interface Props {
  /** Identifiant de l'encadré (repère des tests) */
  readonly id: string;
  readonly titre: string;
  readonly description: string;
  /** false pour le parent : il est informé, c'est l'élève qui rejoint */
  readonly rejoindre?: boolean;
}

export function ClassesVirtuellesAccueil({ id, titre, description, rejoindre = true }: Props) {
  const { data, refetch } = useQuery({
    queryKey: ['accueil', 'classes-virtuelles'],
    queryFn: async () => lire((await apiClient.get<unknown>('/collaboration/meets')).data),
    refetchInterval: 60_000,
  });
  const classes = data ?? [];
  // Lien affiché dès l'heure de début et retiré à l'heure de fin, sans attendre le rechargement suivant
  const delai = prochainChangement(classes);
  useEffect(() => {
    if (delai === null || delai > 6 * 60 * 60 * 1000) return undefined;
    const t = window.setTimeout(() => { void refetch(); }, delai + 1500);
    return () => window.clearTimeout(t);
  }, [delai, refetch]);
  if (classes.length === 0) return null;

  return (
    <section id={id} className="mb-6 rounded-3xl bg-gradient-to-r from-primary to-primary-dark text-text-on-primary p-5 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded-[999px] bg-white/20 flex items-center justify-center">
          <span translate="no" className="material-symbols-outlined">video_camera_front</span>
        </span>
        <div>
          <h2 className="font-black text-base leading-tight">{titre}</h2>
          <p className="text-xs opacity-90">{description}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {classes.map((c) => {
          const statut = c.debut ? statutSeance(c.debut, c.fin) : c.statut;
          const enCours = statut === 'en_cours' || (!c.debut && Boolean(c.lien));
          return (
          <li key={c.id} className="bg-white rounded-2xl p-3 flex flex-wrap items-center gap-3 text-neutral-900">
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm truncate">{c.sujet}</p>
              <p className="text-xs text-neutral-500 truncate">
                {[c.enseignant && `avec ${c.enseignant}`, c.classes.join(', '), c.debut ? libelleHoraire(c.debut, c.fin) : c.quand].filter(Boolean).join(' · ')}
              </p>
            </div>
            {statut === 'a_venir' && (
              <span className="px-3 py-1.5 rounded-[999px] bg-neutral-100 text-neutral-700 text-xs font-bold">
                Le lien apparaîtra à {new Date(c.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {rejoindre && enCours && c.lien && <a href={c.lien} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-[999px] bg-primary hover:bg-primary-dark text-text-on-primary text-xs font-black flex items-center gap-1.5 transition-colors">
              <span translate="no" className="material-symbols-outlined text-base">videocam</span>
              Rejoindre
            </a>}
          </li>
          );
        })}
      </ul>
    </section>
  );
}

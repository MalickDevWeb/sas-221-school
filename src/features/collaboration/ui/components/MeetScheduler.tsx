import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { Video, Sparkles, AlertCircle } from 'lucide-react';

interface CourseItem {
  classeId?: string;
  classe?: string;
}

interface PromotionItem {
  id: string;
  name?: string;
}

interface Props {
  readonly onSchedule: (
    classIds: readonly string[],
    classNames: readonly string[],
    subject: string,
    teacher: string,
    link: string,
    autoGen: boolean,
    restrict: boolean
  ) => void;
  readonly teacherName: string;
}

export function MeetScheduler({ onSchedule, teacherName }: Props) {
  const [selectedClass, setSelectedClass] = useState<string>('');

  const { data: classes = [], isLoading: chargement } = useQuery({
    queryKey: ['meet-scheduler-classes'],
    queryFn: async () => {
      const trouvees = new Map<string, string>();
      try {
        const { data } = await apiClient.get<CourseItem[] | { content: CourseItem[] }>('/professor/courses');
        const cours = Array.isArray(data) ? data : (data?.content || []);
        cours.forEach((c) => { if (c.classeId) trouvees.set(c.classeId, c.classe || c.classeId); });
      } catch { /* rôle sans espace professeur */ }
      if (trouvees.size === 0) {
        try {
          const { data } = await apiClient.get<{ promotions?: PromotionItem[] }>('/admin/users');
          (data?.promotions || []).forEach((p) => trouvees.set(p.id, p.name || p.id));
        } catch { /* pas d'accès administration */ }
      }
      return Array.from(trouvees, ([id, nom]) => ({ id, nom }));
    }
  });

  React.useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes, selectedClass]);
  const [subject, setSubject] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [autoGen, setAutoGen] = useState(false);
  const [restrict, setRestrict] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !subject.trim()) return;   // champs « required » : messages personnalisés affichés
    const className = classes.find(c => c.id === selectedClass)?.nom || selectedClass;
    onSchedule([selectedClass], [className], subject.trim(), teacherName, meetLink, autoGen, restrict);
    setSubject('');
    setMeetLink('');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-gray-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-brand-red-light text-brand-red-deep">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-gray-900">Planifier une Classe Virtuelle</h3>
          <p className="text-xs text-neutral-500">Créez et publiez un cours en ligne Google Meet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Classe ciblée</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
            data-msg-requis="Choisissez la classe concernée."
            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-gray-200 rounded-xl focus:outline-none"
          >
            {classes.length === 0 && (
              <option value="">{chargement ? 'Chargement…' : 'Aucune classe : aucun cours ne vous est attribué'}</option>
            )}
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Matière / Sujet du Cours</label>
          <input
            type="text"
            placeholder="Ex: Architecture logicielle"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-neutral-gray-200 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center justify-between bg-neutral-gray-50 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-red-deep" />
            <span className="text-xs font-bold text-gray-800">Générer via Google Workspace API <span className="font-semibold text-neutral-400">(non disponible)</span></span>
          </div>
          <input
            type="checkbox"
            checked={false}
            disabled
            aria-disabled="true"
            title="Fonctionnalité non disponible : aucune intégration Google Workspace"
            onChange={(e) => setAutoGen(e.target.checked)}
            className="cursor-not-allowed opacity-50 h-4 w-4 text-brand-red-deep border-gray-300 rounded focus:ring-brand-red-deep"
          />
        </div>

        {!autoGen && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Lien Google Meet</label>
            <input
              type="text"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-gray-200 rounded-xl focus:outline-none"
              required={!autoGen}
            />
          </div>
        )}

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-amber-800 text-[10px] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span><span className="font-bold">Sécurité Google :</span> Accès restreint aux comptes universitaires (@ecole221.sn).</span>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-brand-red-deep text-white font-bold text-xs rounded-xl hover:bg-brand-red-deep/90 transition-all flex items-center justify-center gap-2"
        >
          <Video className="w-4 h-4" />
          <span>Publier la Classe Virtuelle</span>
        </button>
      </form>
    </div>
  );
}
export default MeetScheduler;

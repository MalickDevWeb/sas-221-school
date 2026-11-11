import React, { useCallback, useEffect, useState } from 'react';
import { X, FileText, HelpCircle, Settings, Clipboard } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { afficherErreur } from '@/shared/lib/validationPersonnalisee';
import type { CourseModule, StudentEnrolled } from '../../../domain/ProfessorModels';

interface Props {
  readonly module: CourseModule & { readonly status?: 'brouillon' | 'publie' };
  readonly students: readonly StudentEnrolled[];
  readonly onClose: () => void;
  readonly onModulesUpdated: () => void;
}

interface Support { id: string; title: string; description: string; dateStr?: string; attachmentName?: string; attachmentUrl?: string; moduleId?: string }
interface QuizReel { id: string; title: string; description: string; questions: { questionText: string; options: string[]; correctAnswerIndex: number }[] }

/**
 * Fiche d'un module — données RÉELLES du serveur.
 *
 * Avant (jusqu'au 2026-11-10) : toute la fiche (exercices, leçons, quiz, devoirs, notes de devoirs, séquences,
 * modification du module) était enregistrée UNIQUEMENT dans le navigateur (localStorage) : rien n'atteignait le
 * serveur ni les élèves, alors que l'écran affichait des succès.
 */
export function ModuleDetailModal({ module, onClose }: Props) {
  const [onglet, setOnglet] = useState<'info' | 'supports' | 'quiz' | 'devoirs'>('info');
  const [supports, setSupports] = useState<Support[]>([]);
  const [quiz, setQuiz] = useState<QuizReel[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [titre, setTitre] = useState('');
  const [desc, setDesc] = useState('');
  const [lien, setLien] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const [s, q] = await Promise.all([
        apiClient.get(`/professor/courses/${module.courseId}/lessons`),
        apiClient.get(`/professor/modules/${module.id}/quizzes`),
      ]);
      const tous: Support[] = Array.isArray(s.data) ? s.data : (s.data?.content || []);
      setSupports(tous.filter((x) => x.moduleId === module.id));
      setQuiz(Array.isArray(q.data) ? q.data : (q.data?.content || []));
    } catch (err) {
      setErreur(resolveErrorMessage(err));
    }
  }, [module.courseId, module.id]);

  useEffect(() => { charger(); }, [charger]);

  const publierSupport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!titre.trim()) {
      const champ = form.querySelector<HTMLInputElement>('input[name="titre"]');
      if (champ) afficherErreur(champ, 'Donnez un titre au support.');
      return;
    }
    setEnvoi(true);
    setMessage(null);
    try {
      await apiClient.post(`/professor/courses/${module.courseId}/lessons`, {
        title: titre.trim(), description: desc.trim(), moduleId: module.id,
        ...(lien.trim() ? { attachmentUrl: lien.trim(), attachmentName: lien.trim().split('/').pop() } : {}),
      });
      setTitre(''); setDesc(''); setLien('');
      setMessage('Support publié.');
      await charger();
    } catch (err) {
      setMessage(resolveErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  };

  const onglets = [
    { id: 'info', label: 'Infos', icon: Settings },
    { id: 'supports', label: `Supports (${supports.length})`, icon: FileText },
    { id: 'quiz', label: `Quiz (${quiz.length})`, icon: HelpCircle },
    { id: 'devoirs', label: 'Devoirs', icon: Clipboard },
  ] as const;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-brand-red-deep to-[#291715] px-6 py-5 text-white flex justify-between items-start">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Module</span>
            <h3 className="text-lg font-black tracking-tight mt-0.5">{module.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-xl hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          {onglets.map((o) => {
            const Icone = o.icon;
            return (
              <button key={o.id} onClick={() => setOnglet(o.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 ${onglet === o.id ? 'bg-brand-red-deep text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}>
                <Icone className="h-4 w-4" />{o.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {erreur && <p role="alert" className="erreur-champ">{erreur}</p>}

          {onglet === 'info' && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-neutral-400">Description</p>
              <p className="text-neutral-700">{module.description || 'Aucune description.'}</p>
            </div>
          )}

          {onglet === 'supports' && (
            <>
              <form onSubmit={publierSupport} noValidate className="space-y-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <p className="text-xs font-black uppercase text-neutral-500">Publier un support dans ce module</p>
                <input name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre du support"
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (facultatif)"
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs" />
                <input type="url" value={lien} onChange={(e) => setLien(e.target.value)} placeholder="Lien du fichier (https://…, facultatif)"
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs" />
                <button disabled={envoi} className="px-4 py-2 rounded-xl bg-brand-red-deep text-white text-xs font-black disabled:opacity-50">
                  {envoi ? 'Publication…' : 'Publier le support'}
                </button>
                {message && <p role="status" className="text-xs font-bold text-neutral-600">{message}</p>}
              </form>
              {supports.length === 0 ? <p className="text-neutral-400 text-xs">Aucun support dans ce module.</p> : supports.map((s) => (
                <div key={s.id} className="p-3 rounded-xl border border-neutral-100">
                  <p className="font-bold text-neutral-800">{s.title}</p>
                  {s.description && <p className="text-xs text-neutral-500">{s.description}</p>}
                  {s.attachmentUrl && <a href={s.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-red-deep underline">{s.attachmentName || 'Pièce jointe'}</a>}
                </div>
              ))}
            </>
          )}

          {onglet === 'quiz' && (
            quiz.length === 0 ? <p className="text-neutral-400 text-xs">Aucun quiz dans ce module. Créez-en un depuis la liste des modules (bouton « Quiz »).</p> : quiz.map((q) => (
              <div key={q.id} className="p-3 rounded-xl border border-neutral-100 space-y-1">
                <p className="font-bold text-neutral-800">{q.title}</p>
                <p className="text-xs text-neutral-500">{q.questions.length} question(s)</p>
                <ol className="list-decimal pl-5 text-xs text-neutral-600">
                  {q.questions.map((x, i) => <li key={i}>{x.questionText}</li>)}
                </ol>
              </div>
            ))
          )}

          {onglet === 'devoirs' && (
            <p className="text-xs text-neutral-500">
              Les devoirs se donnent à toute la classe dans l'onglet « Devoirs de classe » : ils y sont enregistrés et
              visibles des élèves. Les notes se saisissent dans « Notes d'évaluation ».
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

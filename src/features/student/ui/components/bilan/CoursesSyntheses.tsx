import React from 'react';
import { BookOpen, Zap } from 'lucide-react';

interface Course {
  id: string;
  titre: string;
  coefficient: number;
  progress: number;
  unites?: string[];
  prochain_cours?: string;
}

interface CoursesSynthesesProps {
  courses: Course[];
}

export function CoursesSyntheses({ courses }: CoursesSynthesesProps) {
  // Seulement les cours réels de l'élève (2026-11-13) : avant, trois cours inventés s'affichaient quand la liste était vide.
  const displayCourses = courses;

  return (
    <div className="flex-grow overflow-y-auto p-3.5 space-y-3 no-scrollbar" id="courses-syntheses-list">
      <div className="shrink-0 mb-1.5">
        <h3 className="font-black text-xs text-[#3f1e1e] uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="h-4.5 w-4.5 text-[#3f1e1e]" /> Fiches de synthèse des cours
        </h3>
        <p className="text-[10px] text-secondary font-bold leading-relaxed mt-0.5">
          Les cours de votre classe et leurs sujets clés, tels qu'enregistrés par vos professeurs.
        </p>
      </div>

      <div className="space-y-3">
        {displayCourses.length === 0 && (
          <p className="text-[10px] text-secondary font-bold leading-relaxed">
            Aucun cours n'est encore enregistré pour votre classe.
          </p>
        )}
        {displayCourses.map((course) => (
          <div 
            key={course.id}
            className="bg-[#FAF9F7] rounded-xl border border-neutral-gray-200 p-3 space-y-2.5 hover:border-[#3f1e1e]/40 transition-all hover:shadow-2xs group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">
                  {course.coefficient > 0 ? `Coef: ${course.coefficient} • ` : ''}Progrès: {course.progress || 0}%
                </span>
                <h3 className="font-extrabold text-xs text-[#291715] group-hover:text-[#3f1e1e] transition-colors">
                  {course.titre}
                </h3>
              </div>
              {course.coefficient > 0 && (
                <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-lg border bg-primary/10 text-primary border-primary/20">
                  {course.coefficient >= 5 ? 'Élevée' : 'Moyenne'}
                </span>
              )}
            </div>

            {course.unites && course.unites.length > 0 && (
              <div className="bg-white rounded-lg p-2 border border-neutral-gray-200/55">
                <div className="flex items-start gap-1">
                  <Zap className="h-3.5 w-3.5 text-[#E3A857] shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-neutral-600 leading-relaxed italic">
                    Sujets clés : {course.unites.join(', ')}
                  </p>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

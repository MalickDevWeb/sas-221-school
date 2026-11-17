import React from 'react';
import { motion } from 'motion/react';
import { useBilanEleve } from '../../hooks/useBilanEleve';
import { AcademicDiagnostic } from '../components/bilan/AcademicDiagnostic';
import { CoursesSyntheses } from '../components/bilan/CoursesSyntheses';

/**
 * « Mon bilan » (APP-TL-24) : remplace la page « Tuteur IA ». L'élève retrouve ses cours, sa moyenne, sa matière
 * la plus faible et ses devoirs rendus, calculés sur ses données enregistrées ; aucune IA n'est appelée.
 */
export function StudentBilanPage() {
  const { grades, courses, homeworks, chargement, erreur } = useBilanEleve();

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="p-1.5 md:p-2 lg:p-2.5 flex flex-col min-h-[calc(100vh-70px)] bg-neutral-50/50"
      id="student-bilan-page"
    >
      <div className="shrink-0 mb-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span translate="no" className="material-symbols-outlined text-[#3f1e1e] text-[24px]">insights</span>
          <h1 className="text-xl font-black text-[#291715] tracking-tight uppercase">Mon bilan</h1>
        </div>
        <p className="text-[10px] font-semibold text-secondary leading-normal">
          Vos cours, votre moyenne et vos devoirs, calculés à partir des notes et rendus enregistrés par l'école.
        </p>
      </div>

      {chargement && <p className="text-xs font-semibold text-neutral-500">Chargement de votre bilan…</p>}
      {!chargement && erreur && (
        <p className="text-xs font-semibold text-rose-700">Votre bilan n'a pas pu être chargé : réessayez plus tard.</p>
      )}
      {!chargement && !erreur && (
        <div className="grid grid-cols-12 gap-2.5">
          <div className="col-span-12 lg:col-span-7 bg-white border border-neutral-gray-250 rounded-3xl shadow-3xs flex flex-col">
            <CoursesSyntheses courses={courses} />
          </div>
          <div className="col-span-12 lg:col-span-5 bg-white border border-neutral-gray-250 rounded-3xl shadow-3xs p-4">
            <AcademicDiagnostic grades={grades} homeworks={homeworks} />
          </div>
        </div>
      )}
    </motion.main>
  );
}

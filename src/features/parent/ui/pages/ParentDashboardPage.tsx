import React from 'react';
import { useParentContext } from '../components/layout/ParentLayout';

function StatCard({
  icon, label, value, sub, color, pulse,
}: {
  icon: string; label: string; value: string | number; sub?: string; color: string; pulse?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-solid ${color === 'blue' ? 'border-blue-100' : color === 'green' ? 'border-emerald-100' : color === 'red' ? 'border-red-100' : color === 'amber' ? 'border-amber-100' : 'border-neutral-100'} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'green' ? 'bg-emerald-50 text-emerald-600' : color === 'red' ? 'bg-red-50 text-red-600' : color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-50 text-neutral-600'}`}>
          <span translate="no" className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        {pulse && (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${color === 'blue' ? 'text-blue-700' : color === 'green' ? 'text-emerald-700' : color === 'red' ? 'text-red-600' : color === 'amber' ? 'text-amber-700' : 'text-neutral-800'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-neutral-400 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

export function ParentDashboardPage() {
  const { selectedChild, stats, loading, children, switchChild, selectedChildId } = useParentContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-neutral-500">Chargement du suivi...</p>
        </div>
      </div>
    );
  }

  const child = selectedChild ?? { prenom: '—', nom: '', classe: '—', filiere: '—', niveau: '—', matricule: '—' };

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">family_restroom</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">
              Bonjour, bienvenue sur votre espace parent
            </h1>
            <p className="text-xs text-neutral-500 font-semibold">Suivez la scolarité de votre enfant en temps réel</p>
          </div>
        </div>
      </div>

      {/* Sélecteur enfant (mobile) */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => switchChild(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-solid ${
                selectedChildId === c.id
                  ? 'bg-primary text-white border-primary shadow-md shadow-blue-200'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300'
              }`}
            >
              <span translate="no" className="material-symbols-outlined text-[14px]">person</span>
              {c.prenom} {c.nom}
            </button>
          ))}
        </div>
      )}

      {/* Fiche enfant */}
      <div className="bg-gradient-to-br from-primary to-[#0D47A1] rounded-3xl p-6 mb-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black shrink-0 border border-white/30 border-solid">
              {child.prenom[0]}{child.nom[0]}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Élève suivi</p>
              <h2 className="text-xl font-black leading-tight">{child.prenom} {child.nom}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{child.classe}</span>
                <span className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{child.filiere}</span>
                <span className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{child.matricule}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={() => alert('Affichage du QR Code de retrait...')}
              className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-white text-primary rounded-xl text-xs font-black shadow-md hover:bg-neutral-50 transition-all flex"
            >
              <span translate="no" className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              Retrait Élève
            </button>
            <button
              onClick={() => alert("Génération de l'attestation de scolarité...")}
              className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-800/40 hover:bg-blue-800/60 text-white rounded-xl text-xs font-black border border-white/10 transition-all flex"
            >
              <span translate="no" className="material-symbols-outlined text-[16px]">file_download</span>
              Attestation
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="how_to_reg" label="Taux de présence" value={`${stats.tauxPresence}%`} sub={`${stats.nombreAbsences} absences`} color="green" pulse />
        <StatCard icon="grade" label="Moyenne générale" value={`${stats.moyenneGenerale}/20`} sub="Semestre en cours" color="blue" />
        <StatCard icon="school" label="Crédits ECTS" value={`${stats.creditValides}/30`} sub="Validés ce semestre" color="amber" />
        <StatCard icon="assignment_late" label="Devoirs en retard" value={stats.devoirsEnRetard} sub="À régulariser" color={stats.devoirsEnRetard > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cours du jour */}
        <div className="bg-white rounded-3xl border border-neutral-100 border-solid shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span translate="no" className="material-symbols-outlined text-[20px] text-blue-600">today</span>
            <h3 className="font-black text-neutral-800 text-sm">Cours d'aujourd'hui</h3>
            <span className="ml-auto flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Temps réel
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {stats.coursAujourdhui.length === 0 && (
              <p className="text-xs text-neutral-400 font-semibold text-center py-4">Pas de cours aujourd'hui</p>
            )}
            {stats.coursAujourdhui.map((cours) => (
              <div
                key={cours.id}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border border-solid transition-all ${
                  cours.enCours
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-neutral-50 border-neutral-100'
                }`}
              >
                <div className={`w-2 h-10 rounded-full shrink-0 ${cours.type === 'CM' ? 'bg-blue-500' : cours.type === 'TD' ? 'bg-violet-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs text-neutral-800 truncate">{cours.cours}</p>
                  <p className="text-[10px] text-neutral-500 font-semibold">{cours.heure} · {cours.salle}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold truncate">{cours.professeur}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${cours.type === 'CM' ? 'bg-blue-100 text-blue-700' : cours.type === 'TD' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                    {cours.type}
                  </span>
                  {cours.enCours && (
                    <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> En cours
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prochains examens */}
        <div className="bg-white rounded-3xl border border-neutral-100 border-solid shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span translate="no" className="material-symbols-outlined text-[20px] text-red-500">event_upcoming</span>
            <h3 className="font-black text-neutral-800 text-sm">Prochains examens</h3>
          </div>
          {stats.prochainsExamens.length === 0 ? (
            <p className="text-xs text-neutral-400 font-semibold text-center py-4">Aucun examen prévu</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.prochainsExamens.map((exam, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100 border-solid">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex flex-col items-center justify-center shrink-0">
                    <p className="text-[8px] font-black text-red-500 uppercase">{new Date(exam.date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                    <p className="text-base font-black text-red-700 leading-none">{new Date(exam.date).getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs text-neutral-800 truncate">{exam.titre}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">Salle: {exam.salle}</p>
                  </div>
                  <span className="text-[9px] font-black text-red-500 bg-red-50 border border-red-200 border-solid px-2 py-1 rounded-full shrink-0">
                    J-{Math.max(0, Math.ceil((new Date(exam.date).getTime() - Date.now()) / 86400000))}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Alerte absences */}
          {stats.nombreAbsences >= 3 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 border-solid rounded-2xl p-4 flex items-start gap-3">
              <span translate="no" className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">warning</span>
              <div>
                <p className="text-xs font-black text-amber-800">Attention — {stats.nombreAbsences} absences</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Votre enfant dépasse le seuil autorisé. Un justificatif peut être requis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

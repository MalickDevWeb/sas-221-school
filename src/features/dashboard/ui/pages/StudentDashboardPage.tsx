import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useRealTimeMeet } from '@/features/dashboard/hooks/useRealTimeMeet';
import { useCourses } from '@/features/courses/hooks/useCourses';
import type { CoursItem } from '@/features/student/types';
import { PresenceModal } from '../components/PresenceModal';
import { ActiveLiveStream } from '../components/ActiveLiveStream';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { ClassesVirtuellesAccueil } from '@/features/collaboration/ui/components/ClassesVirtuellesAccueil';
import { GroupesWhatsappRejoindre } from '@/shared/components/GroupesWhatsappRejoindre';
import { PerformanceChart } from '../components/PerformanceChart';
import { StudentNotificationToast } from '../components/StudentNotificationToast';
import { StudentHeaderBanner } from '../components/StudentHeaderBanner';
import { LiveStreamBanner } from '../components/LiveStreamBanner';
import { StudentQRZoomOverlay } from '../components/StudentQRZoomOverlay';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const activeMeet = useRealTimeMeet();
  const [showQRZoom, setShowQRZoom] = useState(false);
  const {
    selectedDay, setSelectedDay, attendances, dbProfile,
    liveSessions, setSelectedLiveId, selectedLive, showToast, triggerToast, showPointage, setShowPointage,
    pointageType, setPointageType, pointageMethod, setPointageMethod, cameraStream, chatInput, setChatInput,
    videoRef, startCamera, stopCamera, registerClockIn, sendLiveReaction, sendLiveChat, handleJoinLive,
    enCoursId, prochainId, courses
  } = useDashboard();
  const { courses: matieres } = useCourses();

  /*
   * Une case de l'emploi du temps est une SÉANCE (« cre-… »), pas une matière. La matière est retrouvée par son
   * intitulé (même règle que le serveur pour relier la séance à son cours) ; sans matière de ce nom dans la classe, un
   * message l'explique.
   */
  const ouvrirCours = (seance: CoursItem) => {
    const cle = (t?: string) => (t ?? '').normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();
    const matiere = matieres.find(c => c.id === seance.id) ?? matieres.find(c => cle(c.nom) === cle(seance.nom));
    if (matiere) navigate('/etudiant/cours/' + matiere.id);
    else triggerToast(`« ${seance.nom || 'Ce cours'} » n'a pas encore de page de cours : cette matière n'est pas encore créée dans votre classe.`);
  };

  return (
    <div id="student-dashboard-page" className="p-4 md:p-8 max-w-[1280px] mx-auto w-full flex-grow animate-fade-in relative min-h-screen pb-24">
      {showToast && <StudentNotificationToast message={showToast} />}

      <StudentHeaderBanner 
        studentName={dbProfile?.name}
        matricule={dbProfile?.matricule}
        onPointer={(type) => {
          setPointageType(type);
          setShowPointage(true);
          startCamera();
        }}
        onShowBadge={() => setShowQRZoom(true)}
      />

      {activeMeet && !selectedLive && (
        <LiveStreamBanner 
          liveSessions={[activeMeet]}
          onJoin={handleJoinLive}
        />
      )}

      {showPointage && (
        <PresenceModal 
          pointageType={pointageType}
          onClose={() => { stopCamera(); setShowPointage(false); }}
        />
      )}

      {showQRZoom && (
        <StudentQRZoomOverlay
          studentName={dbProfile?.name}
          matricule={dbProfile?.matricule}
          onClose={() => setShowQRZoom(false)}
        />
      )}

      {selectedLive && (
        <ActiveLiveStream 
          selectedLive={selectedLive}
          onQuit={() => setSelectedLiveId(null)}
          sendLiveReaction={sendLiveReaction}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSendChat={sendLiveChat}
          triggerToast={triggerToast}
          userName={dbProfile?.name}
        />
      )}

      <GroupesWhatsappRejoindre id="groupes-whatsapp-eleve" />
      <ClassesVirtuellesAccueil id="classes-virtuelles-eleve" titre="Classes virtuelles de ma classe"
        description="Cours en visioconférence publiés pour votre classe." />

      <div className="grid grid-cols-12 gap-6">
        <WeeklySchedule 
          courses={courses}
          selectedDay={selectedDay} 
          setSelectedDay={setSelectedDay} 
          onSelectCourse={ouvrirCours} 
          enCoursId={enCoursId}
          prochainId={prochainId}
        />
        <PerformanceChart />
      </div>
    </div>
  );
}
export default StudentDashboardPage;

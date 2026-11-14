import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ProfessorCourse } from '../../../domain/ProfessorModels';
import { ProfessorActiveMeetView } from './ProfessorActiveMeetView';
import { useProfessorLiveSessions } from './useProfessorLiveSessions';

interface Props {
  readonly selectedCourse: ProfessorCourse;
  readonly triggerToast: (msg: string) => void;
  readonly profName: string;
}

export function ProfessorLiveMeetPanel({ selectedCourse, triggerToast, profName }: Props) {
  const { active, startMeet, stopMeet } = useProfessorLiveSessions(selectedCourse.titre, triggerToast);
  const [sessionTitle, setSessionTitle] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const handleStart = async () => {
    setErreur('');
    setEnvoi(true);
    const echec = await startMeet(sessionTitle, meetUrl, profName);
    setEnvoi(false);
    if (echec) { setErreur(echec); return; }
    setSessionTitle('');
    setMeetUrl('');
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#1a73e8]'}`}>
          <Icon icon="logos:google-meet" className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-xs text-[#291715] flex items-center gap-1.5">
            Classe Virtuelle Google Meet
            {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />}
          </h4>
          <p className="text-[10px] text-neutral-400 font-semibold leading-none mt-1">
            {active ? 'Le cours en direct est en cours.' : 'Diffusez à vos élèves le lien de votre réunion Google Meet.'}
          </p>
        </div>
      </div>

      {active ? (
        <ProfessorActiveMeetView active={active} stopMeet={stopMeet} profName={profName} />
      ) : (
        <div className="pt-2 border-t border-neutral-100 space-y-3 animate-fade-in">
          <input
            type="text"
            placeholder="Sujet du cours (ex: TP Graphes)"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full bg-[#FAF8F6] border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#291715] focus:outline-none"
          />
          <input
            id="lien-meet"
            type="text"
            placeholder="Lien de la réunion : https://meet.google.com/abc-defg-hij"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            aria-invalid={!!erreur}
            className={`w-full bg-[#FAF8F6] border rounded-xl px-3.5 py-2 text-xs font-semibold text-[#291715] focus:outline-none ${erreur ? 'border-red-400' : 'border-neutral-200'}`}
          />
          {erreur
            ? <p role="alert" className="text-[10px] font-bold text-red-600">{erreur}</p>
            : <p className="text-[10px] font-semibold text-neutral-400">Créez la réunion sur meet.google.com (« Nouvelle réunion »), puis collez son lien : vos élèves le verront dans leur espace.</p>}
          <button
            onClick={handleStart}
            disabled={envoi}
            className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-102"
          >
            <Icon icon="lucide:video" className="h-4 w-4" /> {envoi ? 'Diffusion…' : 'Diffuser le cours aux élèves'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfessorLiveMeetPanel;

import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { MeetAttendance } from '../../domain/CollaborationModels';

interface Props {
  readonly attendances: readonly MeetAttendance[];
  readonly meetId: string;
}

export function MeetSessionTracker({ attendances, meetId }: Props) {
  const filtered = attendances.filter((a) => a.meetId === meetId);

  return (
    <div className="bg-white rounded-2xl border border-neutral-gray-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Eye className="w-5 h-5 text-brand-red-deep" />
        <div>
          <h3 className="font-bold text-sm text-gray-900">Ouvertures du lien de la réunion</h3>
          <p className="text-[10px] text-neutral-500 font-semibold">
            Comptes qui ont ouvert le lien depuis École 221. La présence réelle dans Google Meet n'est pas connue de l'application.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px]">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-500 font-bold uppercase tracking-wider">
              <th className="pb-2">Nom</th>
              <th className="pb-2">E-mail du compte</th>
              <th className="pb-2 text-right">Heure d'ouverture</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-neutral-400 font-semibold">Personne n'a encore ouvert le lien de cette réunion depuis École 221.</td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-gray-50/50">
                  <td className="py-3 font-bold text-gray-800">{a.studentName}</td>
                  <td className="py-3 font-mono font-semibold text-neutral-500">{a.emailUsed || '—'}</td>
                  <td className="py-3 font-bold text-right">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-neutral-400" /> {a.entryTime || '—'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default MeetSessionTracker;

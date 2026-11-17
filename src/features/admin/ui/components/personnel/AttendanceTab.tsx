import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceRecord, StaffMember } from '../../../domain/PersonnelModels';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { AttendanceHeader } from './attendance/AttendanceHeader';
import { AttendanceStatsCard } from './attendance/AttendanceStatsCard';
import { AttendanceTable } from './attendance/AttendanceTable';
import { StaffAttendanceDetailModal } from './attendance/StaffAttendanceDetailModal';
import { NewAttendanceModal } from './attendance/NewAttendanceModal';

interface Props {
  onShowToast?: (msg: string, success: boolean) => void;
  /** Personnel réel de l'école (GET /admin/staff) pour choisir la personne pointée. */
  staff?: StaffMember[];
}

export type NouveauPointage = {
  userId?: string | null;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  hours: number | null;
  status: string;
  note: string;
};

/** Clé de cache des pointages du personnel. */
const CLE_POINTAGES = ['admin', 'pointages'] as const;

export function AttendanceTab({ onShowToast, staff = [] }: Props) {
  const [selectedStaff, setSelectedStaff] = useState<AttendanceRecord | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'À l\'heure' | 'En retard' | 'Absent'>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);

  // Pointages réels uniquement, mis en cache (React Query, APP-FE-02).
  const client = useQueryClient();
  const pointages = useQuery({
    queryKey: CLE_POINTAGES,
    queryFn: async () => {
      const res = await apiClient.get('/admin/attendance');
      return (Array.isArray(res.data) ? res.data : []) as AttendanceRecord[];
    },
  });
  const records = useMemo(() => pointages.data ?? [], [pointages.data]);
  const loading = pointages.isFetching;
  const fetchAttendance = () => { void pointages.refetch(); };
  const setRecords = (maj: (avant: AttendanceRecord[]) => AttendanceRecord[]) =>
    client.setQueryData<AttendanceRecord[]>(CLE_POINTAGES, (avant = []) => maj(avant));

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchStatus = statusFilter === 'Tous' || r.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchQuery = !q || (r.name || '').toLowerCase().includes(q) || (r.role || '').toLowerCase().includes(q) || (r.date || '').includes(q);
      return matchStatus && matchQuery;
    });
  }, [records, statusFilter, search]);

  const totalCount = records.length;
  const presentCount = records.filter((r) => r.status !== 'Absent').length;
  const onTimeCount = records.filter((r) => r.status === 'À l\'heure').length;
  const lateCount = records.filter((r) => r.status === 'En retard').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  /** Mise à jour réelle : la ligne n'est remplacée que par la réponse du serveur. */
  const handleSaveRecord = async (updated: AttendanceRecord): Promise<boolean> => {
    try {
      const res = await apiClient.put(`/admin/attendance/${updated.id}`, {
        checkIn: updated.checkIn,
        checkOut: updated.checkOut,
        hours: updated.hours,
        status: updated.status,
        note: updated.note ?? '',
      });
      const confirme: AttendanceRecord = res.data?.id ? res.data : updated;
      setRecords((prev) => prev.map((r) => (r.id === confirme.id ? confirme : r)));
      setSelectedStaff(null);
      onShowToast?.(`Pointage mis à jour pour ${confirme.name}.`, true);
      return true;
    } catch (err) {
      onShowToast?.(resolveErrorMessage(err), false);
      return false;
    }
  };

  /** Création réelle : le pointage n'apparaît qu'avec l'identifiant attribué par le serveur. */
  const handleAddNewAttendance = async (newRec: NouveauPointage): Promise<boolean> => {
    try {
      const res = await apiClient.post('/admin/attendance', newRec);
      if (!res.data?.id) {
        onShowToast?.('Réponse du serveur incomplète : rechargez les pointages.', false);
        return false;
      }
      setRecords((prev) => [res.data as AttendanceRecord, ...prev]);
      setShowAddModal(false);
      onShowToast?.(`Pointage enregistré pour ${res.data.name}.`, true);
      return true;
    } catch (err) {
      onShowToast?.(resolveErrorMessage(err), false);
      return false;
    }
  };

  return (
    <div className="space-y-4" id="attendance-tab-root">
      <AttendanceHeader loading={loading} onRefresh={fetchAttendance} onOpenAdd={() => setShowAddModal(true)} />
      {pointages.error && (
        <p role="alert" id="pointages-erreur" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          Les pointages n'ont pas pu être chargés : {resolveErrorMessage(pointages.error)}
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <AttendanceTable
          records={filteredRecords}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectRecord={setSelectedStaff}
        />
        <AttendanceStatsCard
          totalCount={totalCount}
          presentCount={presentCount}
          onTimeCount={onTimeCount}
          lateCount={lateCount}
          absentCount={absentCount}
          rate={rate}
        />
      </div>
      {selectedStaff && (
        <StaffAttendanceDetailModal record={selectedStaff} onClose={() => setSelectedStaff(null)} onSave={handleSaveRecord} />
      )}
      {showAddModal && (
        <NewAttendanceModal staff={staff} onClose={() => setShowAddModal(false)} onAdd={handleAddNewAttendance} />
      )}
    </div>
  );
}

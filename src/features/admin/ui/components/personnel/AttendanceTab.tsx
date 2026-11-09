import React, { useState, useEffect, useMemo } from 'react';
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

export function AttendanceTab({ onShowToast, staff = [] }: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);   // pointages réels uniquement
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStaff, setSelectedStaff] = useState<AttendanceRecord | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'À l\'heure' | 'En retard' | 'Absent'>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/attendance');
      setRecords(Array.isArray(res.data) ? res.data : []);   // jamais de pointages inventés
    } catch (err) {
      // erreur : liste inchangée, jamais de pointages inventés
      onShowToast?.(resolveErrorMessage(err), false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

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

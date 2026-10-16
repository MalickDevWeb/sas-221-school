import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, INITIAL_ATTENDANCE } from '../../../domain/PersonnelModels';
import { apiClient } from '@/shared/lib/apiClient';
import { AttendanceHeader } from './attendance/AttendanceHeader';
import { AttendanceStatsCard } from './attendance/AttendanceStatsCard';
import { AttendanceTable } from './attendance/AttendanceTable';
import { StaffAttendanceDetailModal } from './attendance/StaffAttendanceDetailModal';
import { NewAttendanceModal } from './attendance/NewAttendanceModal';

interface Props {
  onShowToast?: (msg: string, success: boolean) => void;
}

export function AttendanceTab({ onShowToast }: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStaff, setSelectedStaff] = useState<AttendanceRecord | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'À l\'heure' | 'En retard' | 'Absent'>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/attendance');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      } else {
        setRecords(INITIAL_ATTENDANCE);
      }
    } catch {
      setRecords((prev) => (prev.length > 0 ? prev : INITIAL_ATTENDANCE));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchStatus = statusFilter === 'Tous' || r.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchQuery = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.role.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [records, statusFilter, search]);

  const totalCount = records.length;
  const presentCount = records.filter((r) => r.status !== 'Absent').length;
  const onTimeCount = records.filter((r) => r.status === 'À l\'heure').length;
  const lateCount = records.filter((r) => r.status === 'En retard').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const handleSaveRecord = async (updated: AttendanceRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedStaff(null);
    try {
      await apiClient.put(`/admin/attendance/${updated.id}`, updated);
      onShowToast?.(`Pointage mis à jour pour ${updated.name} avec succès !`, true);
    } catch {
      onShowToast?.(`Pointage sauvegardé localement pour ${updated.name}`, true);
    }
  };

  const handleAddNewAttendance = async (newRec: Omit<AttendanceRecord, 'id'>) => {
    const fullRecord: AttendanceRecord = { id: `att-${Date.now()}`, ...newRec };
    setRecords((prev) => [...prev, fullRecord]);
    setShowAddModal(false);
    try {
      await apiClient.post('/admin/attendance', fullRecord);
      onShowToast?.(`Pointage enregistré pour ${fullRecord.name}`, true);
    } catch {
      onShowToast?.(`Pointage enregistré localement pour ${fullRecord.name}`, true);
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
        <NewAttendanceModal onClose={() => setShowAddModal(false)} onAdd={handleAddNewAttendance} />
      )}
    </div>
  );
}

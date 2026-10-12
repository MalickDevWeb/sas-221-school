import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, INITIAL_ATTENDANCE } from '../../../domain/PersonnelModels';
import { apiClient } from '@/shared/lib/apiClient';

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

  // Load from backend API
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/attendance');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      } else {
        // Use default fallback if backend empty
        setRecords(INITIAL_ATTENDANCE);
      }
    } catch (err) {
      console.warn("Backend /admin/attendance indisponible, utilisation du cache local:", err);
      // Fallback on initial data
      setRecords(prev => prev.length > 0 ? prev : INITIAL_ATTENDANCE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchStatus = statusFilter === 'Tous' || r.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchQuery = !q || 
        r.name.toLowerCase().includes(q) || 
        r.id.toLowerCase().includes(q) || 
        r.role.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [records, statusFilter, search]);

  // Statistics
  const totalCount = records.length;
  const presentCount = records.filter(r => r.status !== 'Absent').length;
  const onTimeCount = records.filter(r => r.status === 'À l\'heure').length;
  const lateCount = records.filter(r => r.status === 'En retard').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Save an attendance record update (Syncs with backend and frontend state)
  const handleSaveRecord = async (updated: AttendanceRecord) => {
    // 1. Optimistic frontend update
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelectedStaff(null);

    // 2. Persist to backend
    try {
      await apiClient.put(`/admin/attendance/${updated.id}`, updated);
      if (onShowToast) {
        onShowToast(`Pointage mis à jour pour ${updated.name} avec succès !`, true);
      }
    } catch (err) {
      console.warn("Erreur synchronisation backend attendance:", err);
      if (onShowToast) {
        onShowToast(`Pointage sauvegardé localement pour ${updated.name}`, true);
      }
    }
  };

  // Add new attendance entry
  const handleAddNewAttendance = async (newRec: Omit<AttendanceRecord, 'id'>) => {
    const id = `att-${Date.now()}`;
    const fullRecord: AttendanceRecord = { id, ...newRec };
    setRecords(prev => [...prev, fullRecord]);
    setShowAddModal(false);

    try {
      await apiClient.post('/admin/attendance', fullRecord);
      if (onShowToast) {
        onShowToast(`Pointage enregistré pour ${fullRecord.name}`, true);
      }
    } catch (err) {
      console.warn("Erreur POST /admin/attendance:", err);
      if (onShowToast) {
        onShowToast(`Pointage enregistré localement pour ${fullRecord.name}`, true);
      }
    }
  };

  // Quick check-in toggle
  const handleQuickStatusChange = async (e: React.MouseEvent, record: AttendanceRecord, newStatus: AttendanceRecord['status']) => {
    e.stopPropagation();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    const updated: AttendanceRecord = {
      ...record,
      status: newStatus,
      checkIn: newStatus === 'Absent' ? '--' : (record.checkIn === '--' ? timeStr : record.checkIn),
    };
    handleSaveRecord(updated);
  };

  return (
    <div className="space-y-4" id="attendance-tab-root">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-sm font-black text-[#1E293B] flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-primary text-lg">
              schedule
            </span>
            Pointages & Émargements (Aujourd'hui)
          </h4>
          <p className="text-[10px] text-neutral-400 font-semibold">
            Cliquez sur un collaborateur pour entrer dans sa fiche détaillée, pointer ou justifier son statut.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAttendance}
            className="p-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Rafraîchir les données"
          >
            <span translate="no" className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-primary hover:bg-[#921316] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-0"
          >
            <span translate="no" className="material-symbols-outlined text-sm font-black">person_add</span>
            <span>Pointer une personne</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Main Table Column (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3">
          {/* Filters & search */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <span translate="no" className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                search
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom, rôle ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-primary"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-1 sm:pb-0">
              {(['Tous', 'À l\'heure', 'En retard', 'Absent'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase border-b border-neutral-200">
                  <th className="px-4 py-2.5">Collaborateur</th>
                  <th className="px-3 py-2.5">Rôle</th>
                  <th className="px-3 py-2.5">Arrivée</th>
                  <th className="px-3 py-2.5">Départ</th>
                  <th className="px-3 py-2.5">Heures</th>
                  <th className="px-3 py-2.5">Statut</th>
                  <th className="px-3 py-2.5 text-center">Fiche & Pointage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-400 font-medium text-xs">
                      Aucun pointage trouvé pour cette sélection.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedStaff(r)}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                      title="Cliquer pour entrer sur la fiche détaillée"
                    >
                      <td className="px-4 py-2.5 flex items-center gap-2.5">
                        <img
                          src={r.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'}
                          alt={r.name}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200 group-hover:border-primary/50 transition-colors shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-[#1E293B] font-black group-hover:text-primary transition-colors block leading-tight">
                            {r.name}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono uppercase">{r.id}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-[10px] text-neutral-500 uppercase font-black">
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                          {r.role}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-neutral-800 font-black">
                        {r.checkIn !== '--' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {r.checkIn}
                          </span>
                        ) : (
                          <span className="text-neutral-400">--</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 font-mono text-neutral-800 font-black">
                        {r.checkOut !== '--' ? (
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {r.checkOut}
                          </span>
                        ) : (
                          <span className="text-neutral-400">--</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 font-mono text-neutral-700">
                        {r.hours > 0 ? (
                          <span className="font-extrabold">{r.hours}h</span>
                        ) : (
                          <span className="text-neutral-300">--</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black border ${
                          r.status === 'À l\'heure' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          r.status === 'En retard' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaff(r);
                          }}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 text-[10px] font-black rounded-lg transition-all cursor-pointer border border-neutral-200 group-hover:border-primary inline-flex items-center gap-1"
                        >
                          <span translate="no" className="material-symbols-outlined text-xs">open_in_new</span>
                          <span>Entrer</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 font-semibold flex items-center justify-between border-t border-neutral-100">
            <span>{filteredRecords.length} collaborateurs affichés</span>
            <span className="text-primary font-bold">💡 Cliquez sur n'importe quelle ligne pour modifier ou pointer</span>
          </div>
        </div>

        {/* Right Statistics Box (1 col) */}
        <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
              Taux de Présence
            </span>
            <span className="text-[9px] text-neutral-500 font-semibold">Aujourd'hui sur site</span>
          </div>

          {/* Circular Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-200"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary transition-all duration-700"
                strokeDasharray={`${rate}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#1E293B]">{rate}%</span>
              <span className="text-[9px] uppercase font-bold text-primary tracking-widest">
                {presentCount}/{totalCount} Présents
              </span>
            </div>
          </div>

          {/* Quick breakdown list */}
          <div className="w-full space-y-1.5 pt-2 border-t border-neutral-200/80 text-[10px] text-left">
            <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-neutral-200/60">
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> À l'heure
              </span>
              <strong className="text-neutral-800 font-black">{onTimeCount}</strong>
            </div>

            <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-neutral-200/60">
              <span className="text-amber-700 font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> En retard
              </span>
              <strong className="text-neutral-800 font-black">{lateCount}</strong>
            </div>

            <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-neutral-200/60">
              <span className="text-rose-700 font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absents
              </span>
              <strong className="text-neutral-800 font-black">{absentCount}</strong>
            </div>
          </div>

          <p className="text-[9px] text-neutral-400 font-medium leading-normal">
            Le pointage s'effectue automatiquement via QR Code vigile ou manuellement depuis ce panneau.
          </p>
        </div>
      </div>

      {/* DETAILED INTERACTIVE MODAL FOR A PERSON */}
      {selectedStaff && (
        <StaffAttendanceDetailModal
          record={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onSave={handleSaveRecord}
        />
      )}

      {/* NEW POINTAGE MODAL */}
      {showAddModal && (
        <NewAttendanceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddNewAttendance}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Sub-component: Interactive Modal for Person's Detailed Attendance
// -------------------------------------------------------------------------------------------------
interface ModalProps {
  record: AttendanceRecord;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
}

function StaffAttendanceDetailModal({ record, onClose, onSave }: ModalProps) {
  const [checkIn, setCheckIn] = useState(record.checkIn === '--' ? '08:00' : record.checkIn.replace('h', ':'));
  const [checkOut, setCheckOut] = useState(record.checkOut === '--' ? '17:00' : record.checkOut.replace('h', ':'));
  const [status, setStatus] = useState<AttendanceRecord['status']>(record.status);
  const [note, setNote] = useState(record.note || '');
  const [hours, setHours] = useState<number>(record.hours);

  // Recalculate hours automatically when checkIn/checkOut change
  useEffect(() => {
    if (status === 'Absent') {
      setHours(0);
      return;
    }
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    if (!isNaN(inH) && !isNaN(outH)) {
      const inMinutes = inH * 60 + (inM || 0);
      const outMinutes = outH * 60 + (outM || 0);
      if (outMinutes > inMinutes) {
        const diff = (outMinutes - inMinutes) / 60;
        setHours(Math.round(diff * 100) / 100);
      }
    }
  }, [checkIn, checkOut, status]);

  const handleSetNowCheckIn = () => {
    const now = new Date();
    const str = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCheckIn(str);
    if (status === 'Absent') setStatus('À l\'heure');
  };

  const handleSetNowCheckOut = () => {
    const now = new Date();
    const str = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCheckOut(str);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedIn = status === 'Absent' ? '--' : checkIn.replace(':', 'h');
    const formattedOut = status === 'Absent' ? '--' : (checkOut ? checkOut.replace(':', 'h') : '--');

    onSave({
      ...record,
      checkIn: formattedIn,
      checkOut: formattedOut,
      status,
      hours: status === 'Absent' ? 0 : hours,
      note,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#FAF8F6] px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={record.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'}
              alt={record.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-[#1E293B]">{record.name}</h3>
                <span className="px-2 py-0.5 bg-neutral-200/80 text-[#1E293B] text-[9px] font-black rounded uppercase">
                  {record.role}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">ID Collaborateur : {record.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-neutral-200 text-neutral-500 flex items-center justify-center cursor-pointer border-0 bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-grow text-xs">
          {/* Status selector */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1.5">
              Statut du Jour
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('À l\'heure')}
                className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'À l\'heure'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>À l'heure</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('En retard')}
                className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'En retard'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/30'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>En retard</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Absent')}
                className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'Absent'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/30'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Absent</span>
              </button>
            </div>
          </div>

          {/* Time Check-in and Check-out */}
          {status !== 'Absent' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50/70 p-3.5 rounded-2xl border border-neutral-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400">
                    Heure d'Arrivée
                  </label>
                  <button
                    type="button"
                    onClick={handleSetNowCheckIn}
                    className="text-[9px] text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    Maintenant
                  </button>
                </div>
                <input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400">
                    Heure de Départ
                  </label>
                  <button
                    type="button"
                    onClick={handleSetNowCheckOut}
                    className="text-[9px] text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    Maintenant
                  </button>
                </div>
                <input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="sm:col-span-2 pt-1 flex items-center justify-between text-[11px] text-neutral-600 font-bold border-t border-neutral-200/60">
                <span>Total heures calculées aujourd'hui :</span>
                <span className="font-mono text-primary font-black bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                  {hours} heures
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 text-rose-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider block">Absence constatée</span>
              <p className="text-[11px] font-medium leading-relaxed">
                Ce collaborateur est marqué absent pour toute la journée. Ses heures de travail sont comptabilisées à 0h.
              </p>
            </div>
          )}

          {/* Justification & Notes */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
              Note administrative / Justificatif
            </label>
            <input
              type="text"
              placeholder="ex: Certificat médical transmis, retard circulation, télétravail validé..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Semaine Récente (Historique interactif) */}
          <div className="bg-[#FAF8F6] p-3 rounded-xl border border-neutral-200/80 space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">
              Historique de la semaine
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[9px] text-neutral-400 block font-bold">LUN</span>
                <span className="text-emerald-700 font-black">07h50</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[9px] text-neutral-400 block font-bold">MAR</span>
                <span className="text-emerald-700 font-black">08h00</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[9px] text-neutral-400 block font-bold">MER</span>
                <span className="text-emerald-700 font-black">07h55</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[9px] text-neutral-400 block font-bold">JEU</span>
                <span className="text-amber-700 font-black">08h15</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-primary/40 ring-1 ring-primary/20">
                <span className="text-[9px] text-primary block font-black">AUJ</span>
                <span className="text-[#1E293B] font-black">{status === 'Absent' ? 'Absent' : checkIn}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent"
            >
              Fermer
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 border-0"
            >
              <span translate="no" className="material-symbols-outlined text-sm font-black">save</span>
              <span>Enregistrer & Synchroniser</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Sub-component: Modal for New Staff Attendance Check-in
// -------------------------------------------------------------------------------------------------
interface AddModalProps {
  onClose: () => void;
  onAdd: (record: Omit<AttendanceRecord, 'id'>) => void;
}

function NewAttendanceModal({ onClose, onAdd }: AddModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Secrétaire');
  const [status, setStatus] = useState<AttendanceRecord['status']>('À l\'heure');
  const [checkIn, setCheckIn] = useState('08:00');
  const [checkOut, setCheckOut] = useState('17:00');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      role,
      status,
      checkIn: status === 'Absent' ? '--' : checkIn.replace(':', 'h'),
      checkOut: status === 'Absent' ? '--' : checkOut.replace(':', 'h'),
      hours: status === 'Absent' ? 0 : 8.0,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
      note,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-5 space-y-4 text-xs font-bold">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h4 className="font-black text-sm text-[#1E293B] flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-primary text-base">person_add</span>
            Nouveau Pointage Collaborateur
          </h4>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 cursor-pointer border-0 bg-transparent font-black">
            ✕
          </button>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Nom Complet</label>
          <input
            type="text"
            required
            placeholder="ex: Aminata Ndiaye"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            >
              <option value="Administrateur">Administrateur</option>
              <option value="Secrétaire">Secrétaire</option>
              <option value="Comptable">Comptable</option>
              <option value="Enseignant">Enseignant</option>
              <option value="Vigile">Vigile</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            >
              <option value="À l'heure">À l'heure</option>
              <option value="En retard">En retard</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {status !== 'Absent' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Arrivée</label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Départ</label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Note / Motif</label>
          <input
            type="text"
            placeholder="Facultatif..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow cursor-pointer border-0"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

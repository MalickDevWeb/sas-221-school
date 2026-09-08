/** Logique de filtrage et pagination des logs de scan */
export type DateFilter = 'all' | 'today' | 'yesterday';

export function applyVigilFilters(
  scanLogs: any[],
  searchQuery: string,
  dateFilter: DateFilter,
  currentPage: number,
  itemsPerPage: number
) {
  const filteredLogs = scanLogs.filter((log: any) => {
    const matchesSearch =
      (log.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (log.studentId || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesDate =
      dateFilter === 'today' ? (log.date === "Aujourd'hui" || !log.date) :
      dateFilter === 'yesterday' ? log.date === 'Hier' : true;
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return { filteredLogs, totalPages, paginatedLogs };
}

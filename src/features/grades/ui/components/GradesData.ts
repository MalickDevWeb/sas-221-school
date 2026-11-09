export interface AcademicYear {
  id: string;
  year: string;
  level: string;
  specialty: string;
  average: number;
  gpa: number;
  ects: number;
  totalEcts: number;
  status: string;
  ranking: string;
  top: string;
  mention: string;
  modules: Array<{ module: string; prof: string; ects: number; note: number; moyPromo: number }>;
}

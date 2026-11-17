import { InMemoryGradeRepository } from '../local/InMemoryGradeRepository';
import { ApiGradeRepository } from '../api/ApiGradeRepository';
import { createGetStudentGradesUseCase } from '../../usecases/GetStudentGradesUseCase';
import { MODE_SIMULE } from '@/shared/config/modeSimule';

// On respecte la configuration VITE_USE_MOCK
const isMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

export const gradeRepository = isMock 
  ? new InMemoryGradeRepository() 
  : new ApiGradeRepository();

export const getStudentGradesUseCase = createGetStudentGradesUseCase(gradeRepository);

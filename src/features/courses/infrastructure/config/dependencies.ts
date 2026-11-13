import { InMemoryCourseRepository } from '../local/InMemoryCourseRepository';
import { ApiCourseRepository } from '../api/ApiCourseRepository';
import { createGetCourseCatalogUseCase } from '../../usecases/GetCourseCatalogUseCase';
import { MODE_SIMULE } from '@/shared/config/modeSimule';

const isMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

export const courseRepository = isMock 
  ? new InMemoryCourseRepository() 
  : new ApiCourseRepository();

export const getCourseCatalogUseCase = createGetCourseCatalogUseCase(courseRepository);

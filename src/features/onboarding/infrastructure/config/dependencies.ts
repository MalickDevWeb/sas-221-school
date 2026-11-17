import { MODE_SIMULE } from '@/shared/config/modeSimule';
import { ApiOnboardingRepository } from '../api/ApiOnboardingRepository';
import { InMemoryOnboardingRepository } from '../local/InMemoryOnboardingRepository';
import {
  createRegisterSchoolUseCase,
  createDraftManagementUseCase,
} from '../../usecases/RegisterSchoolUseCase';

/**
 * Injection des dépendances (DI) calquée sur src/features/professor.
 */
const useMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

export const onboardingRepository = useMock
  ? new InMemoryOnboardingRepository()
  : new ApiOnboardingRepository();

export const registerSchoolUseCase = createRegisterSchoolUseCase(onboardingRepository);
export const draftManagementUseCase = createDraftManagementUseCase(onboardingRepository);


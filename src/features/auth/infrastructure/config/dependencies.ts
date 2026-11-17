import { apiClient } from '@/shared/lib/apiClient';
import { ApiAuthRepository } from '../api/ApiAuthRepository';
import { InMemoryAuthRepository } from '../local/InMemoryAuthRepository';
import { createLoginUseCase } from '../../usecases/createLoginUseCase';
import { MODE_SIMULE } from '@/shared/config/modeSimule';

// VITE_USE_MOCK=true  → backend simulé (InMemory) — développement
// VITE_USE_MOCK=false → vrai backend Express sur /api/auth/login — production
const useMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

const authRepository = useMock
  ? new InMemoryAuthRepository()
  : new ApiAuthRepository(apiClient);

export const loginUseCase = createLoginUseCase(authRepository);

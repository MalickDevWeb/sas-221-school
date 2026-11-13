import { ApiAdminRepository } from '../api/ApiAdminRepository';
import { InMemoryAdminRepository } from '../local/InMemoryAdminRepository';
import { ManageAdminUseCase } from '../../usecases/ManageAdminUseCase';
import { MODE_SIMULE } from '@/shared/config/modeSimule';

const useMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

export const adminRepository = useMock
  ? new InMemoryAdminRepository()
  : new ApiAdminRepository();

export const manageAdminUseCase = new ManageAdminUseCase(adminRepository);

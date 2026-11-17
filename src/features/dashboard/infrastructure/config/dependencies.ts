import { InMemoryDashboardRepository } from '../local/InMemoryDashboardRepository';
import { ApiDashboardRepository } from '../api/ApiDashboardRepository';
import { createGetDashboardDataUseCase } from '../../usecases/GetDashboardDataUseCase';
import { createRegisterClockInUseCase } from '../../usecases/RegisterClockInUseCase';
import { createSendLiveReactionUseCase } from '../../usecases/SendLiveReactionUseCase';
import { createSendLiveChatUseCase } from '../../usecases/SendLiveChatUseCase';
import { MODE_SIMULE } from '@/shared/config/modeSimule';

const isMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

export const dashboardRepository = isMock 
  ? new InMemoryDashboardRepository() 
  : new ApiDashboardRepository();

export const getDashboardDataUseCase = createGetDashboardDataUseCase(dashboardRepository);
export const registerClockInUseCase = createRegisterClockInUseCase(dashboardRepository);
export const sendLiveReactionUseCase = createSendLiveReactionUseCase(dashboardRepository);
export const sendLiveChatUseCase = createSendLiveChatUseCase(dashboardRepository);

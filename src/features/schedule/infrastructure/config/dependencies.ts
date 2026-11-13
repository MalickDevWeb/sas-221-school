import { InMemoryScheduleRepository } from '../local/InMemoryScheduleRepository';
import { ApiScheduleRepository } from '../api/ApiScheduleRepository';
import { createGetWeeklyScheduleUseCase } from '../../usecases/GetWeeklyScheduleUseCase';
import { MODE_SIMULE } from '@/shared/config/modeSimule';

const isMock = MODE_SIMULE; // simulé : développement seulement (shared/config/modeSimule)

export const scheduleRepository = isMock 
  ? new InMemoryScheduleRepository() 
  : new ApiScheduleRepository();

export const getWeeklyScheduleUseCase = createGetWeeklyScheduleUseCase(scheduleRepository);

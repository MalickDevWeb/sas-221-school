import { ApiLandingRepository } from '../api/ApiLandingRepository';
import { SubmitContactFormUseCase } from '../../usecases/SubmitContactFormUseCase';
import { LaunchPortalDemoUseCase } from '../../usecases/LaunchPortalDemoUseCase';
import { GetLandingContentUseCase } from '../../usecases/GetLandingContentUseCase';

// Single source of truth repository instance
export const landingRepository = new ApiLandingRepository();

// Injected use cases
export const submitContactFormUseCase = new SubmitContactFormUseCase(landingRepository);
export const launchPortalDemoUseCase = new LaunchPortalDemoUseCase();
export const getLandingContentUseCase = new GetLandingContentUseCase(landingRepository);

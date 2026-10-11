import { useNavigate } from 'react-router-dom';
import type { ProfileDemoItem } from '../domain/LandingModels';
import { launchPortalDemoUseCase } from '../infrastructure/config/dependencies';

export function useLandingDemo() {
  const navigate = useNavigate();

  const launchDemo = (demo: ProfileDemoItem) => {
    launchPortalDemoUseCase.execute(demo, navigate);
  };

  return { launchDemo };
}

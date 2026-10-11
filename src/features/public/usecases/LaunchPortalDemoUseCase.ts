import { useAuthStore } from '@/core/store/authStore';
import type { ProfileDemoItem } from '../domain/LandingModels';

export class LaunchPortalDemoUseCase {
  execute(demo: ProfileDemoItem, navigate: (path: string) => void): void {
    const { connexionReussie } = useAuthStore.getState();

    connexionReussie({
      utilisateur: {
        id: `demo-${demo.roleKey}`,
        nom: demo.demoUser,
        role: demo.roleKey,
        email: demo.demoEmail,
      },
      token: `demo-token-${demo.roleKey}`,
    });

    navigate(demo.targetPath);
  }
}

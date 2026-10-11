import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import type { ProfileDemoItem } from '../model/landingData';

export function useLandingDemo() {
  const navigate = useNavigate();
  const { connexionReussie } = useAuthStore();

  const launchDemo = (demo: ProfileDemoItem) => {
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
  };

  return { launchDemo };
}


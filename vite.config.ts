import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * 16/11 : identifiants du super-admin pour le bouton « Pré-remplir » de la page de connexion, en DÉVELOPPEMENT
 * seulement (npm run dev). Lus dans le fichier non versionné du backend visé (qa/.qa_password pour 8090,
 * qa/.qa_password_<port> sinon). En construction (npm run build), la valeur est null : ni le bouton ni le mot de
 * passe ne peuvent se retrouver dans le site publié.
 */
function identifiantsDev(): { email: string; motDePasse: string } | null {
  const cible = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8090';
  const port = (cible.match(/:(\d+)/) || [])[1] || '8090';
  const fichier = path.resolve(__dirname, '..', 'qa', port === '8090' ? '.qa_password' : `.qa_password_${port}`);
  try {
    const motDePasse = fs.readFileSync(fichier, 'utf8').trim();
    return motDePasse ? { email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@ecole221.sn', motDePasse } : null;
  } catch {
    return null;
  }
}

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
      __IDENTIFIANTS_DEV__: JSON.stringify(command === 'serve' ? identifiantsDev() : null),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // 16/11 (développement seulement) : pages de connexion et points d'entrée des espaces compilés dès le démarrage
      // de Vite, avec tout ce qu'ils importent. Avant : compilés au premier affichage, soit plusieurs secondes de page
      // blanche après la connexion quand Vite venait de redémarrer. Sans effet sur la construction (npm run build).
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/features/auth/ui/pages/TenantLoginPage.tsx',
          './src/features/public/ui/pages/TenantFinderPage.tsx',
          './src/features/super-admin/ui/pages/SuperAdminLoginPage.tsx',
          './src/features/admin/index.ts',
          './src/features/student/index.ts',
          './src/features/student/ui/components/layout/StudentLayout.tsx',
          './src/features/professor/index.ts',
          './src/features/parent/index.ts',
          './src/features/vigil/index.ts',
          './src/features/super-admin/ui/components/layout/SuperAdminLayout.tsx',
          './src/features/super-admin/ui/pages/SuperAdminDashboardPage.tsx',
        ],
      },
      proxy: {
        '/api': {
          // Backend cible : 8090 (développement) par défaut ; VITE_PROXY_TARGET=http://127.0.0.1:8091 pour la QA
          target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8090',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-motion': ['framer-motion'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});

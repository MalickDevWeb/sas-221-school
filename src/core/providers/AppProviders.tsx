import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { queryClient } from '@/shared/lib/queryClient';

import { Toaster } from 'sonner';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { SessionAutreOnglet } from '@/core/session/SessionAutreOnglet';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
            {/* Connexion d'un autre compte (ou déconnexion) dans un autre onglet du même navigateur */}
            <SessionAutreOnglet />
            {/* Notifications redessinées (carte blanche, liseré et icône de couleur selon le type, ombre douce),
                identiques dans toute l'application ; les tests repèrent toujours [data-sonner-toast]. */}
            <Toaster
              position="top-right"
              closeButton
              gap={10}
              toastOptions={{
                unstyled: true,
                duration: 4000,
                classNames: {
                  toast:
                    'group relative flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border border-slate-200/80 border-l-4 bg-white/95 py-3.5 pl-4 pr-10 font-sans shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur-sm',
                  title: 'text-[13px] font-semibold leading-snug text-slate-800',
                  description: 'mt-0.5 text-xs leading-relaxed text-slate-500',
                  icon: 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5',
                  closeButton:
                    'absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 [&>svg]:h-3.5 [&>svg]:w-3.5',
                  actionButton: 'ml-auto shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:brightness-110',
                  cancelButton: 'shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200',
                  success: 'border-l-emerald-500 [&_[data-icon]]:text-emerald-600',
                  error: 'border-l-rose-500 [&_[data-icon]]:text-rose-600',
                  warning: 'border-l-amber-500 [&_[data-icon]]:text-amber-500',
                  info: 'border-l-indigo-500 [&_[data-icon]]:text-indigo-600',
                  loading: 'border-l-slate-300 [&_[data-icon]]:text-slate-500',
                },
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

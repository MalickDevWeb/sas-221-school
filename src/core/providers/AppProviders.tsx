import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { queryClient } from '@/shared/lib/queryClient';

import { Toaster } from 'sonner';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { queryClient } from '@/shared/lib/queryClient';

import { Toaster } from 'sonner';
import { ThemeProvider } from '@/design-system/ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

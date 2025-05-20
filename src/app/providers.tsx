'use client';

import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>;
}